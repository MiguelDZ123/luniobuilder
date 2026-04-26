import Link from 'next/link'
import SignIn from './components/auth/googleSignIn'
import UserAvatar from './components/auth/UserAvatar'
import { auth } from './auth'
import Header from './components/home/Header'

const page = async () => {

  const session = await auth();

  return (
    <>
      <Header />
      <div className='p-8 bg-[#111114] text-white min-h-screen flex flex-row items-center gap-10 px-[15%]'>
        <div className='flex flex-col gap-10 max-w-2xl'>
          <h1 className='text-7xl font-black'>Build your dream website with our <span className='bg-linear-to-r from-[#1D976C] to-[#93F9B9] bg-clip-text text-transparent uppercase'>no-code</span> platform</h1>
          <p className='text-gray-400 mt-4 w-[90%]'>LUNIO Builder is a no-code website builder that allows you to create stunning websites with ease. With its intuitive drag-and-drop interface, you can design and publish your website in minutes, without any coding knowledge.</p>
          <div className='flex flex-col sm:flex-row gap-4'>
            <Link href={session ? "/dashboard" : "/editor"} className='bg-linear-to-r from-[#1D976C] to-[#93F9B9] text-gray-800 font-bold py-2 px-4 rounded-lg'>
              {session ? 'Go to Dashboard' : 'Try it for Free'}
            </Link>
            <Link href="/docs" className='text-white py-2 px-4 underline hover:text-gray-300 transition-colors font-bold underline-offset-4'>
              View Documentation
            </Link>
          </div>
        </div>
        <div className='border-8 border-white/10 p-2 rounded-2xl'>
          <img src="/heroo.gif" alt="Placeholder" />
        </div>
      </div>
      <div className='absolute bottom-4 right-4 w-full text-center text-gray-500 text-xs'>
        <h1>All Rights Reserved. Made with ❤️ by <a href="https://www.luniostudios.com/" target="_blank" rel="noopener noreferrer" className='text-gray-400 hover:text-gray-300 transition-colors underline'>LUNIO Studios</a></h1>
      </div>
    </>
  )
}

export default page