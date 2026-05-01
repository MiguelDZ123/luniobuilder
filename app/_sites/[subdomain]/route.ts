import { handleSiteRequest } from '../siteUtils';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: { subdomain: string } }) {
  return handleSiteRequest(params.subdomain, [], request.headers.get('host') || undefined);
}
