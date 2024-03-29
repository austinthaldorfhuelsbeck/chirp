import { withClerkMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default withClerkMiddleware(() => {
  return NextResponse.next();
});

export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
