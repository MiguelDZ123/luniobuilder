import { BuilderElement, Page } from '../types/builder';
import { supabaseServer } from '../lib/supabaseServer';
import { renderElementToHtml } from '../utils/builderUtils';

const normalizeSlug = (slug?: string) => {
  if (!slug) return '';
  let value = String(slug).trim().toLowerCase();
  if (value.startsWith('/')) {
    value = value.replace(/^\/+/, '');
  }
  value = value.replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '');
  return value;
};

const normalizePath = (segments?: string[]) => {
  if (!segments || segments.length === 0) return '/';
  const joined = segments.filter(Boolean).join('/');
  return `/${joined}`.replace(/\/+/g, '/');
};

export const findProjectBySubdomain = async (subdomain: string) => {
  const normalized = normalizeSlug(subdomain);
  if (!normalized) {
    return null;
  }

  const slugVariants = [normalized, `/${normalized}`];
  const filter = slugVariants.map(value => `slug.eq.${value}`).join(',');

  const { data, error } = await supabaseServer
    .from('projects')
    .select('id, title, slug, content')
    .or(filter)
    .maybeSingle();

  if (error) {
    console.error('Error loading project by subdomain:', error.message || error);
    return null;
  }

  return data as { id: string; title: string; slug: string; content: { pages: Page[]; currentPageId: string } } | null;
};

const findPageByPath = (pages: Page[], pathSegments?: string[]) => {
  const normalizedPath = normalizePath(pathSegments);
  if (normalizedPath === '/') {
    return pages.find(page => page.slug === '/' || page.slug === '/index' || page.slug === '') || pages[0] || null;
  }

  const candidatePaths = [
    normalizedPath,
    `${normalizedPath}/`,
    normalizedPath.replace(/\/$/, ''),
  ];

  return pages.find(page => candidatePaths.includes(page.slug)) || pages[0] || null;
};

export const buildSiteHtml = (project: { title: string; content: { pages: Page[] } }, page: Page, host: string) => {
  const title = page.seo?.title || project.title || 'LUNIO Builder Site';
  const description = page.seo?.description || `A website created with LUNIO Builder.`;
  const content = page.elements.map(element => renderElementToHtml(element)).join('');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${description}" />
    <title>${title}</title>
    <style>*,*::before,*::after{box-sizing:border-box;}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#fff;color:#111;line-height:1.5;}img{max-width:100%;height:auto;}a{color:inherit;text-decoration:none;}</style>
  </head>
  <body>
    ${content}
  </body>
</html>`;
};

export const buildNotFoundHtml = (subdomain: string) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Site not found</title>
    <style>*,*::before,*::after{box-sizing:border-box;}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#111;color:#fff;text-align:center;padding:2rem;}a{color:#76f8c5;text-decoration:none;}</style>
  </head>
  <body>
    <div>
      <h1>Site not found</h1>
      <p>The subdomain <strong>${subdomain}</strong> is not published on luniobuilder.com.</p>
      <p><a href="https://luniobuilder.com">Return to LUNIO Builder</a></p>
    </div>
  </body>
</html>`;
};

export const handleSiteRequest = async (subdomain: string, pathSegments?: string[], host?: string) => {
  const project = await findProjectBySubdomain(subdomain);
  if (!project) {
    return new Response(buildNotFoundHtml(subdomain), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const pages = project.content?.pages || [];
  const page = findPageByPath(pages, pathSegments);
  if (!page) {
    return new Response(buildNotFoundHtml(subdomain), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  return new Response(buildSiteHtml(project, page, host || `${subdomain}.luniobuilder.com`), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
};
