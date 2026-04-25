import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <>
      <div className='absolute mt-0 flex flex-row items-center gap-2 py-4 z-10 px-[15%]'>
        <h1 className='text-white font-black text-2xl'>LUNIO Builder</h1>
      </div>
      <div className='p-8 bg-[#111114] text-white min-h-screen flex flex-row items-center gap-10 px-[15%]'>
        <div className='flex flex-col gap-6'>
          <h1 className='text-6xl font-black'>Build your dream website with our <span className='bg-linear-to-r from-[#1D976C] to-[#93F9B9] bg-clip-text text-transparent uppercase'>no-code</span> platform</h1>
          <p className='text-gray-400 mt-4'>LUNIO Builder is a no-code website builder that allows you to create stunning websites with ease. With its intuitive drag-and-drop interface, you can design and publish your website in minutes, without any coding knowledge.</p>
          <div className='flex flex-col sm:flex-row gap-4'>
            <Link href="/editor" className='bg-linear-to-r from-[#1D976C] to-[#93F9B9] text-gray-800 font-bold py-2 px-4 rounded-lg'>
              Get Started
            </Link>
            <Link href="/docs" className='text-white py-2 px-4 underline hover:text-gray-300 transition-colors font-bold underline-offset-4'>
              View Documentation
            </Link>
          </div>
        </div>
        <div className='border-4 border-white/10 p-2 rounded-2xl'>
          <img src="/hero.gif" alt="Placeholder" />
        </div>
      </div>
    </>
  )
}

export default page