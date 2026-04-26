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
                        <PopoverContent className="bg-[#0d1117] text-white border-[#21262d]">
                            <PopoverHeader>
                                <img src={session.user.image} className="w-12 rounded-full border-3 border-white/20" alt="User Avatar" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium">{session.user.name}</p>
                                    <p className="text-xs text-gray-400">{session.user.email}</p>
                                </div>
                            </PopoverHeader>
                            <SignOut />
                        </PopoverContent>
                    </Popover>
                </>
            )}
        </div>
    )
}