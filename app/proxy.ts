import { auth } from "./auth/auth";
 
export const proxy = auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== "/editor") {
    const newUrl = new URL("/editor", req.nextUrl.origin)
    return Response.redirect(newUrl)
  }
})