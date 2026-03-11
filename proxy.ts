//Proxy allows you to run code before a request is completed. Then, based on the incoming request, you can modify the response by rewriting, redirecting, modifying the request or response headers, or responding directly.
//only 1 proxy file is allowed per project

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

//here we are using NextAuth.js as the Next.js proxy,
// to do that we initialize NextAuth.js with the authConfig object,
// and then exporting the auth property as default
export default NextAuth(authConfig).auth;

//the matcher option from Proxy serves to specify that auth should run on specific paths.
export const config = {
  // https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
