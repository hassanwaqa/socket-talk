import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
	const token = await getToken({ req })
	const isAuth = !!token
	const { pathname } = req.nextUrl

	// Public routes (accessible when NOT logged in)
	const authRoutes = ["/login", "/signup"]

	// Protected routes (accessible only when logged in)
	const protectedRoutes = ["/"]

	// Case 1: Logged in user trying to access login or signup
	if (isAuth && authRoutes.includes(pathname)) {
		return NextResponse.redirect(new URL("/", req.url))
	}

	// Case 2: Not logged in and trying to access protected route
	if (!isAuth && protectedRoutes.includes(pathname)) {
		return NextResponse.redirect(new URL("/login", req.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/", "/login", "/signup"],
}
