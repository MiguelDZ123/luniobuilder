import { SessionProvider } from "next-auth/react"
import Dashboard from "./dashboard";

const page = () => {
  return (
    <SessionProvider>
      <Dashboard />
    </SessionProvider>
  )
}

export default page