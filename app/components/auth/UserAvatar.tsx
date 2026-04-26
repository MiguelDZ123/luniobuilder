import { User } from "lucide-react"
import { auth } from "../../auth"

export default async function UserAvatar() {
    const session = await auth()

    if (!session?.user?.image) return null

    return (
        <div>
            { !session ? (
                <User size={24} className="text-white" />
            ) : (
                <>
                    <img src={session.user.image} alt="User Avatar" />
                    <h1 className="text-white">{session.user.name}</h1>
                </>
            )}
        </div>
    )
}