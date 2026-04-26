import { Suspense } from 'react';
import { SessionProvider } from "next-auth/react"
import Editor from "./editor";

const page = () => {
  return (
    <SessionProvider>
      <Suspense fallback={<div className='min-h-screen bg-[#0d1117] text-white flex items-center justify-center'>Loading editor…</div>}>
        <Editor />
      </Suspense>
    </SessionProvider>
  )
}

export default page