import { signOut } from "../../auth";
 
export function SignOut() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
    >
      <button type="submit" className="outline-none">Sign Out</button>
    </form>
  )
}