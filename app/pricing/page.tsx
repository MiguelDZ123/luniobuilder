import React from 'react'
import Header from '../components/home/Header'
import { auth, signIn } from "../../app/auth/auth"
import Link from 'next/link'

const page = async () => {

    const session = await auth()

    return (
        <div>
            <Header />
            <h1 className='text-4xl font-bold w-full text-center mt-10'>Perfect Plans To Support Your</h1>
            <h1 className='text-4xl font-bold w-full text-center mt-2 mb-4'>Website Building Journey</h1>
            <p className='text-center mt-4 text-gray-600'>Select a Plan that Suits Your Needs in a way that works for you.</p>
            <div className='flex flex-col justify-between min-h-screen'>
                <div className='flex flex-col md:flex-row px-[15%] justify-center items-center gap-8 mt-30'>
                    <div className=' bg-white items-center border-3 border-slate-500/5 p-6 md:w-1/3'>
                        <h2 className='text-4xl font-semibold mb-4'>FREE</h2>
                        <p className='text-gray-600 mb-4'>Perfect for static websites and hobby projects.</p>
                        <div className='flex items-baseline gap-2 mb-2'>
                            <h2 className='text-5xl font-bold mb-6 mt-6'>$0</h2><span className='text-lg text-gray-500'>/forever</span>
                        </div>
                        <form
                            action={async () => {
                                "use server"
                                await signIn("google")
                            }}
                        >
                            {session ? (
                                <Link href="/dashboard" className='w-full text-2xl bg-blue-500/20 mb-4 text-blue-500 border-2 border-blue-500/40 py-2 px-4 rounded flex items-center justify-center'>Go to Dashboard</Link>
                            ) : (
                                <button type="submit" className='w-full text-2xl bg-blue-500/20 mb-4 text-blue-500 border-2 border-blue-500/40 py-2 px-4 rounded'>Sign In</button>
                            )}
                        </form>
                        <hr />
                        <ul className='mt-6'>
                            <li className='mb-2'><span className='text-slate-600'>✽</span> Only 1 Project</li>
                            <li className='mb-2'><span className='text-slate-600'>✽</span> No Code Export</li>
                            <li className='mb-2'><span className='text-slate-600'>✽</span> 24/7 Support</li>
                        </ul>
                    </div>
                    <div className=' bg-white p-6 md:w-1/3 border-3 border-slate-500/5'>
                        <h2 className='text-4xl font-semibold mb-4'>Premium</h2>
                        <p className='text-gray-600 mb-4'>Ideal for freelancers and growing businesses</p>
                        <div className='flex items-baseline gap-2 mb-2'>
                            <h2 className='text-5xl font-bold mb-6 mt-6'>$10</h2><span className='text-lg text-gray-500'>/month</span>
                        </div>
                        <button className='w-full text-2xl bg-green-500/20 mb-4 text-green-500 border-2 border-green-500/40 py-2 px-4 rounded'>Subscribe</button>
                        <hr />
                        <ul className='mt-6'>
                            <li className='mb-2'><span className='text-slate-600'>✽</span> Unlimited Projects</li>
                            <li className='mb-2'><span className='text-slate-600'>✽</span>  Early Access Features</li>
                            <li className='mb-2'><span className='text-slate-600'>✽</span> 24/7 Priority Support</li>
                        </ul>
                    </div>
                </div>
                <div className='flex justify-between bg-[#111114] py-5 px-6 w-full text-center text-gray-500 text-xs'>
                    <h1>All Rights Reserved. Made with ❤️ by <a href="https://www.luniostudios.com/" target="_blank" rel="noopener noreferrer" className='text-gray-400 hover:text-gray-300 transition-colors underline'>LUNIO Studios</a></h1>
                    <ul className='flex flex-row'>
                        <li className='ml-4'><a href="/terms" className='text-gray-400 hover:text-gray-300 transition-colors underline'>Terms of Service</a></li>
                        <li className='ml-4'><a href="/privacy" className='text-gray-400 hover:text-gray-300 transition-colors underline'>Privacy Policy</a></li>
                        <li className='ml-4'><a href="/contact" className='text-gray-400 hover:text-gray-300 transition-colors underline'>Usage Policy</a></li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default page