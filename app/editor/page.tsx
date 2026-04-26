import { SessionProvider } from "next-auth/react"
import Editor from "./editor";

const page = () => {
  return (
    <SessionProvider>
      <Editor />
    </SessionProvider>
  )
}

export default page