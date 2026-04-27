import { LogOut } from "lucide-react";
import { signOut } from "../../auth";
 
export function SignOut() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
    >
      <button type="submit" className="mt-5 outline-none text-red-400">
        <LogOut size={16} className="inline mr-2" />
        Sign Out</button>
    </form>
  )
}