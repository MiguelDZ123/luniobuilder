import { Suspense } from 'react';
import { SessionProvider } from "next-auth/react"
import Editor from "./editor";
import Link from 'next/link';

const page = () => {
  return (
    <SessionProvider>
      <Suspense fallback={<div className='min-h-screen bg-[#0d1117] text-white flex items-center justify-center'>Loading editor…</div>}>
        <div className='md:hidden bg-[#0d1117] w-full min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-white'>
          <h1 className='text-4xl font-semibold text-center'>Not available on mobile devices</h1>
          <p className='text-gray-400 max-w-lg text-center'>For the best experience, please access the editor from a desktop or laptop.</p>
          <Link href='/dashboard' className='rounded-full bg-linear-to-r from-[#1D976C] to-[#93F9B9] px-6 py-3 text-sm font-semibold text-black'>Back to Dashboard</Link>
        </div>
        <div className='max-md:hidden'>
          <Editor />
        </div>
      </Suspense>
    </SessionProvider>
  )
}

export default page