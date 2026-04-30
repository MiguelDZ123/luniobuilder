"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

interface PricingTabsProps {
    hasSession: boolean;
}

const PricingTabs: React.FC<PricingTabsProps> = ({ hasSession }) => {
    const [billing, setBilling] = useState<'monthly' | 'annually'>('monthly');

    const proPrice = useMemo(() => {
        if (billing === 'monthly') {
            return { amount: '$5', label: '/month', note: '' };
        }
        return { amount: '$48', label: '/year', note: 'Save 20%' };
    }, [billing]);

    return (
        <div className='flex flex-col justify-between min-h-screen'>
            <div className='flex flex-col md:flex-row px-[15%] max-lg:px-0 justify-center items-center gap-8 mt-20'>
                <div className='flex flex-col items-center justify-center gap-6'>
                    <div className='rounded-3xl p-5 text-center'>
                        <h1 className='text-4xl max-md:text-3xl font-bold'>The Affordable Plans</h1>
                        <div>
                            <p className='mt-4'>Check out the features each plan offers and make a decision that suits your needs.</p>
                            <p>Whether it's for hobby projects or professional use, LUNIO Builder has you covered.</p>
                            <p>If you need something more custom, contact us for a tailored plan.</p>
                        </div>
                    </div>
                    <div className='flex items-center justify-center gap-2 rounded-md bg-gray-300/20 p-1.5 '>
                        <button
                            type='button'
                            onClick={() => setBilling('monthly')}
                            className={`flex flex-row items-center rounded-md px-4 py-2 text-sm font-semibold transition ${billing === 'monthly'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-900 hover:text-gray-500'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            type='button'
                            onClick={() => setBilling('annually')}
                            className={`flex flex-row  items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${billing === 'annually'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-900 hover:text-gray-500'
                                }`}
                        >
                            Annually
                        </button>

                    </div>

                </div>
            </div>

            <div className='flex flex-col md:flex-row px-[15%] max-md:px-8 max-lg:px-0 justify-center items-center gap-8 mt-10'>
                <div className='bg-white border-3 border-slate-500/5 p-6 md:w-1/3'>
                    <h2 className='text-4xl font-bold mb-4'>FREE</h2>
                    <p className='text-gray-600 mb-4 text-sm'>Want to just try it out? Perfect for static websites and hobby projects. If you need more features, consider upgrading to a paid plan.</p>
                    <div className='flex items-baseline gap-2 mb-2'>
                        <h2 className='text-5xl font-normal mb-6 mt-6'>$0</h2>
                        <span className='text-lg text-gray-500'>/forever</span>
                    </div>
                    {hasSession ? (
                        <Link href='/dashboard' className='w-full text-xl bg-blue-500/20 mb-4 text-blue-500 border-2 border-blue-500/40 py-2 px-4 rounded flex items-center justify-center'>
                            Go to Dashboard
                        </Link>
                    ) : (
                        <button
                            type='button'
                            onClick={() => signIn('google')}
                            className='w-full text-xl bg-blue-500/20 mb-4 text-blue-500 border-2 border-blue-500/40 py-2 px-4 rounded'
                        >
                            Sign In
                        </button>
                    )}
                    <hr />
                    <h6 className='text-sm font-bold mb-4 mt-4'>What's Included:</h6>
                    <ul className='mt-6'>
                        <li className='mb-2'><span className='text-slate-600'>✽</span> Only 1 Project</li>
                        <li className='mb-2'><span className='text-slate-600'>✽</span> LUNIO Watermark</li>
                        <li className='mb-2'><span className='text-slate-600'>✽</span> No Code Export</li>
                        <li className='mb-2'><span className='text-slate-600'>✽</span> 24/7 Support</li>
                    </ul>
                </div>

                <div className='bg-white p-6 md:w-1/3 border-3 border-slate-500/5'>
                    <div className='flex flex-row items-center gap-2 mb-2'>
                        <h2 className='flex text-4xl font-bold mb-4'>Pro</h2>
                        <span className='flex text-sm text-green-500 font-semibold mb-2 border border-green-500/40 py-1 px-2 rounded-2xl'>Limited Time</span>
                        {billing === 'annually' && <span className='flex text-xs text-yellow-500 font-semibold border mb-2 border-yellow-500/40 bg-amber-300/20 py-1 px-2 rounded-2xl'>Save 20%</span>}
                    </div>
                    <p className='text-gray-600 mb-4 text-sm'>Ready to go beyond the basics? Ideal for freelancers and growing businesses. If you still need more features, consider contacting us.</p>
                    <div className='flex items-baseline gap-2 mb-2'>
                        <h2 className='text-5xl font-normal mb-6 mt-6'>{proPrice.amount}</h2>
                        <span className='text-lg text-gray-500'>{proPrice.label}</span>
                    </div>
                    <button className='w-full text-xl bg-blue-500/20 mb-4 text-blue-500 border-2 border-blue-500/40 py-2 px-4 rounded'>
                        Subscribe
                    </button>
                    <hr />
                    <h6 className='text-sm font-bold mb-4 mt-4'>Extra Features Included:</h6>
                    <ul className='mt-6'>
                        <li className='mb-2'><span className='text-slate-600'>✽</span> Unlimited Projects</li>
                        <li className='mb-2'><span className='text-slate-600'>✽</span> Early Access Features</li>
                        <li className='mb-2'><span className='text-slate-600'>✽</span> Code Export</li>
                        <li className='mb-2'><span className='text-slate-600'>✽</span> 24/7 Priority Support</li>
                    </ul>
                </div>
            </div>

            <div className='flex max-md:flex-col max-md:gap-1 justify-between bg-[#111114] py-5 w-full text-center text-gray-500 text-xs px-[15%] mt-20 max-lg:px-5'>
                <h1>All Rights Reserved. Made with ❤️ by <a href='https://www.luniostudios.com/' target='_blank' rel='noopener noreferrer' className='text-gray-400 hover:text-gray-300 transition-colors underline'>LUNIO Studios</a></h1>
                <ul className='flex flex-row'>
                    <li className='ml-4'><a href='/terms' className='text-gray-400 hover:text-gray-300 transition-colors underline'>Terms of Service</a></li>
                    <li className='ml-4'><a href='/privacy' className='text-gray-400 hover:text-gray-300 transition-colors underline'>Privacy Policy</a></li>
                    <li className='ml-4'><a href='/contact' className='text-gray-400 hover:text-gray-300 transition-colors underline'>Usage Policy</a></li>
                </ul>
            </div>
        </div>
    );
};

export default PricingTabs;
