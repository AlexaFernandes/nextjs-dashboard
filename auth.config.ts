// Defining authorization - Logic to protect your routes from unauthorized access.
// This will prevent users from accessing the dashboard pages unless they are logged in
import type { NextAuthConfig } from "next-auth";

//This object will contain the configuration options for NextAuth.js
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    //the authorized callback is used to verify if the request is authorized to access a page with Next.js Proxy.
    // It is called before a request is completed, and it receives an object with the auth and request properties. The auth property contains the user's session, and the request property contains the incoming request.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
