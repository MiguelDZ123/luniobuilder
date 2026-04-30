import { renderElementToHtml } from '@/app/utils/builderUtils';
import { supabaseServer } from '@/app/lib/supabaseServer';

const normalizeSlug = (slug: string) => String(slug || '').replace(/^\/+/, '').toLowerCase();

const getProjectBySubdomain = async (subdomain: string) => {
  const cleaned = normalizeSlug(subdomain);
  const query = `slug.eq.${cleaned},slug.eq./${cleaned},slug.ilike.${cleaned},slug.ilike./${cleaned}`;
  const { data, error } = await supabaseServer
    .from('projects')
    .select('id, title, slug, content')
    .or(query);

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0];
};

const renderProjectPage = (project: { title: string; content: any }) => {
  const pages = project.content?.pages || [];
  const currentPageId = project.content?.currentPageId;
  const page = pages.find((item: any) => item.id === currentPageId) || pages[0];

  if (!page) {
    return {
      title: project.title || 'Published Page',
      description: 'No page content available.',
      html: '<div style="padding:32px;font-family:system-ui,sans-serif;color:#4b5563;">No content available.</div>',
    };
  }

  const bodyContent = Array.isArray(page.elements) && page.elements.length
    ? page.elements.map((element: any) => renderElementToHtml(element)).join('')
    : '<div style="padding:32px;font-family:system-ui,sans-serif;color:#4b5563;">No content available.</div>';

  const title = page.seo?.title || project.title || 'Published Page';
  const description = page.seo?.description || '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <style>
        body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
    </style>
</head>
<body>
    ${bodyContent}
</body>
</html>`;

  return { title, description, html };
};

interface SitePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: SitePageProps) {
  const project = await getProjectBySubdomain(params.slug);

  if (!project) {
    return {
      title: 'Project not found',
      description: 'No published project was found for this subdomain.',
    };
  }

  const { title, description } = renderProjectPage(project);
  return {
    title,
    description,
  };
}

export default async function SitePage({ params }: SitePageProps) {
  const project = await getProjectBySubdomain(params.slug);
  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-xl text-center">
          <h1 className="text-3xl font-semibold mb-4">Project not found</h1>
          <p className="text-sm text-slate-300">We couldn't find a published project for the subdomain <span className="text-white">{params.slug}</span>.</p>
        </div>
      </div>
    );
  }

  const { html } = renderProjectPage(project);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
