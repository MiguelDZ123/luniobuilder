import Link from 'next/link'
import React from 'react'
import SignIn from '../auth/googleSignIn'
import { auth } from '@/app/auth'
import UserAvatar from '../auth/UserAvatar'
import { Menu } from 'lucide-react'
import { signIn } from "../../auth"
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"
import { SignOut } from '../auth/signOut'


const Header = async () => {


    const session = await auth()

    return (
        <div className='bg-[#111114] w-full mt-0 flex flex-row justify-between items-center gap-2 py-4 z-10 px-[15%]'>
            <div className='flex'>
                <img src="/logobuilder.png" alt="LUNIO Builder Logo" className='h-10 w-full max-lg:h-6' />
            </div>
            <div className='flex items-center gap-6 justify-center max-md:hidden'>
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
            <div className='text-white md:hidden flex flex-row gap-2 z-10' >
                <Popover>
                    <PopoverTrigger className='p-2 rounded-md border border-gray-700'>
                        <Menu size={20} />
                    </PopoverTrigger>
                    <PopoverContent className="bg-[#0d1117] text-white border border-white/20">
                        <PopoverHeader className="ml-4 gap-2 flex flex-col">
                            <div>
                                <p className="text-sm font-medium">{session?.user.name}</p>
                                <p className="text-xs text-gray-400 underline">{session?.user.email}</p>
                            </div>
                            <Link href="/dashboard" className="">
                                Dashboard
                            </Link>
                            <SignOut />
                        </PopoverHeader>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

export default Header