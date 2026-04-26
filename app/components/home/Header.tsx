import Link from 'next/link'
import React from 'react'
import SignIn from '../auth/googleSignIn'
import { auth } from '@/app/auth'
import UserAvatar from '../auth/UserAvatar'

const Header = async () => {


    const session = await auth()

    return (
        <div className='absolute w-full mt-0 flex flex-row justify-between items-center gap-2 py-4 z-10 px-[15%]'>
            <div className='flex'>
                <img src="/logobuilder.png" alt="LUNIO Builder Logo" className='h-10 w-full' />
            </div>
            <div className='flex items-center gap-6 justify-center'>
                <nav>
                    <ul className='flex gap-6 items-center justify-center'>
                        <li><Link href="/features" className='text-gray-400 hover:text-gray-300 transition-colors'>Community</Link></li>
                        <li><Link href="/pricing" className='text-gray-400 hover:text-gray-300 transition-colors'>Pricing</Link></li>
                        <li><Link href="/docs" className='text-gray-400 hover:text-gray-300 transition-colors'>Documentation</Link></li>
                        {!session && (
                            <li><SignIn /></li>
                        )}
                        {session && (
                            <UserAvatar />
                        )}
                    </ul>
                </nav>
            </div>
        </div>
    )
}

export default Header