import React from 'react'
import Header from '../components/home/Header'
import { auth } from "../../app/auth/auth"
import PricingTabs from './PricingTabs'

const page = async () => {
    const session = await auth()

    return (
        <div>
            <Header />
            <PricingTabs hasSession={!!session} />
        </div>
    )
}

export default page