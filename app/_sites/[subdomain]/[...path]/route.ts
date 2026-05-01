import { handleSiteRequest } from '../../siteUtils';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: { subdomain: string; path?: string[] } }) {
  return handleSiteRequest(params.subdomain, params.path, request.headers.get('host') || undefined);
}
