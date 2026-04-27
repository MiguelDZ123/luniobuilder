import { User } from "lucide-react"
import { auth } from "../../auth"
import { SignOut } from "./signOut"
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"
import Link from "next/link"

export default async function UserAvatar() {
    const session = await auth()

    if (!session?.user?.image) return null

    return (
        <div>
            {!session ? (
                <User size={24} className="text-white" />
            ) : (
                <>
                    <Popover>
                        <PopoverTrigger asChild>
                            <img src={session.user.image} className="w-10 rounded-full border-3 border-white/20" alt="User Avatar" />
                        </PopoverTrigger>
                        <PopoverContent className="bg-[#0d1117] text-white border border-white/20">
                            <PopoverHeader className="ml-4 gap-2 flex flex-col">
                                <div>
                                    <p className="text-sm font-medium">{session.user.name}</p>
                                    <p className="text-xs text-gray-400 underline">{session.user.email}</p>
                                </div>
                                 <Link href="/dashboard" className="">
                                    Dashboard
                                </Link>
                                <SignOut />
                            </PopoverHeader>
                        </PopoverContent>
                    </Popover>
                </>
            )}
        </div>
    )
}