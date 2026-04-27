import { NextResponse } from 'next/server';
import { auth } from '@/app/auth/auth';
import { generateReactProjectFiles } from '@/app/utils/builderUtils';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json();
  const token = body?.token;
  const projectName = body?.projectName || 'LUNIO Project';
  const pages = body?.pages;
  const teamId = body?.teamId;

  if (!token) {
    return NextResponse.json({ error: 'Vercel token is required' }, { status: 400 });
  }

  if (!Array.isArray(pages) || pages.length === 0) {
    return NextResponse.json({ error: 'Pages are required for deployment' }, { status: 400 });
  }

  const files = generateReactProjectFiles(pages, projectName);
  const deploymentName = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `luniobuilder-${Date.now()}`;

  const deploymentBody: Record<string, unknown> = {
    name: deploymentName,
    target: 'production',
    projectSettings: {
      framework: 'create-react-app',
      buildCommand: 'npm run build',
      installCommand: 'npm install',
      outputDirectory: 'build',
    },
    files: files.map(file => ({
      file: file.path,
      data: file.content,
    })),
  };

  if (teamId) {
    deploymentBody.teamId = teamId;
  }

  try {
    const vercelResponse = await fetch('https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deploymentBody),
    });

    let data;
    try {
      data = await vercelResponse.json();
    } catch (parseError) {
      data = { message: await vercelResponse.text() };
    }

    if (!vercelResponse.ok) {
      const errorContent = data?.error ?? data?.message ?? 'Vercel deployment failed';
      const errorMessage = typeof errorContent === 'string'
        ? errorContent
        : JSON.stringify(errorContent);

      return NextResponse.json(
        {
          error: errorMessage,
          details: data,
        },
        { status: vercelResponse.status }
      );
    }

    const url = data.url ? `https://${data.url}` : undefined;
    return NextResponse.json({ ...data, url });
  } catch (error) {
    console.error('Vercel deployment error:', error);
    return NextResponse.json({ error: 'Unable to deploy to Vercel' }, { status: 500 });
  }
}
