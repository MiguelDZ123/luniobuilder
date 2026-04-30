import Link from 'next/link'
import { headers } from 'next/headers'
import SignIn from './components/auth/googleSignIn'
import UserAvatar from './components/auth/UserAvatar'
import { auth } from './auth/auth'
import Header from './components/home/Header'
import { renderElementToHtml } from '@/app/utils/builderUtils'
import { supabaseServer } from '@/app/lib/supabaseServer'

const PUBLIC_DOMAIN = 'luniobuilder.com';
const RESERVED_SUBDOMAINS = new Set(['www', 'api', 'dashboard', 'editor', 'static', '_next', '_static', 'favicon.ico', 'site']);

const normalizeHost = (host: string | null) => {
  if (!host) return null;
  return host.split(':')[0].toLowerCase();
};

const getSubdomain = (host: string | null) => {
  const normalized = normalizeHost(host);
  if (!normalized || !normalized.endsWith(`.${PUBLIC_DOMAIN}`)) return null;
  const subdomain = normalized.replace(`.${PUBLIC_DOMAIN}`, '');
  if (!subdomain || RESERVED_SUBDOMAINS.has(subdomain)) return null;
  return subdomain;
};

const getProjectBySlug = async (slug: string) => {
  const normalized = String(slug || '').trim().toLowerCase();
  const { data, error } = await supabaseServer
    .from('projects')
    .select('id, title, slug, content')
    .eq('slug', normalized)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
};

const renderProject = (project: any) => {
  const pages = project.content?.pages || [];
  const currentPageId = project.content?.currentPageId;
  const page = pages.find((item: any) => item.id === currentPageId) || pages[0];

  if (!page) {
    return (
      <div className='min-h-screen bg-slate-950 text-white flex items-center justify-center p-6'>
        <div className='max-w-xl text-center'>
          <h1 className='text-3xl font-semibold mb-4'>Project not found</h1>
          <p className='text-sm text-slate-300'>No content was found for this published project.</p>
        </div>
      </div>
    );
  }

  const bodyContent = Array.isArray(page.elements) && page.elements.length
    ? page.elements.map((element: any) => renderElementToHtml(element)).join('')
    : '<div style="padding:32px;font-family:system-ui,sans-serif;color:#4b5563;">No content available.</div>';

  return (
    <div className='min-h-screen bg-white text-slate-900'>
      <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
    </div>
  );
};

const page = async () => {
  const host = headers().get('host');
  const subdomain = getSubdomain(host);

  if (subdomain) {
    const project = await getProjectBySlug(subdomain);
    if (project) {
      return renderProject(project);
    }
  }

  const session = await auth();

  return (
    <div className='bg-[#111114] min-h-screen justify-between flex flex-col'>
      <Header />
      <div className='text-white flex flex-row items-center gap-10 px-[15%] max-lg:pt-20 max-md:flex-col-reverse max-lg:px-10'>
        <div className='flex flex-col gap-10 max-w-2xl max-lg:max-w-sm'>
          <h1 className='text-7xl font-black max-lg:text-[45px]'>Build your dream website with our <span className='bg-linear-to-r from-[#1D976C] to-[#93F9B9] bg-clip-text text-transparent uppercase'>no-code</span> platform</h1>
          <p className='text-gray-400 mt-4 w-[90%]'>LUNIO Builder is a no-code website builder that allows you to create stunning websites with ease. With its intuitive drag-and-drop interface, you can design and publish your website in minutes, without any coding knowledge.</p>
          <div className='flex flex-col sm:flex-row gap-4 max-lg:flex-row'>
            <Link href={session ? "/dashboard" : "/pricing"} className='bg-linear-to-r from-[#1D976C] to-[#93F9B9] text-gray-800 font-bold py-2 px-4 rounded-lg'>
              {session ? 'Go to Dashboard' : 'Try it for Free'}
            </Link>
            <Link href="/documentation" className='text-white py-2 px-4 underline hover:text-gray-300 transition-colors font-bold underline-offset-4'>
              Documentation
            </Link>
          </div>
        </div>
        <div className='border-8 border-white/10 p-2 rounded-2xl'>
          <video autoPlay muted loop playsInline poster="/poster.png" width="640" height="360">
            <source src="mev.webm" type="video/webm"></source>
          </video>
        </div>
      </div>
      <div className='flex flex-row justify-between px-[15%] max-lg:px-10 items-center gap-5 max-md:flex-col bg-[#111114] py-5 bottom-5 max-lg:mt-10 right-4 w-full text-center text-gray-500 text-xs'>
        <h1>All Rights Reserved. Made with ❤️ by <a href="https://www.luniostudios.com/" target="_blank" rel="noopener noreferrer" className='text-gray-400 hover:text-gray-300 transition-colors underline'>LUNIO Studios</a></h1>
        <ul className='flex flex-row gap-5'>
          <li><a href="/terms" className='text-gray-400 hover:text-gray-300 transition-colors underline'>Terms of Service</a></li>
          <li><a href="/privacy" className='text-gray-400 hover:text-gray-300 transition-colors underline'>Privacy Policy</a></li>
          <li><a href="/privacy" className='text-gray-400 hover:text-gray-300 transition-colors underline'>Usage Policy</a></li>
        </ul>
      </div>
    </div>
  )
}

export default page