import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import { compare } from "bcrypt"
import { AuthOptions } from "next-auth"

declare module "next-auth" {
	interface Session {
		user: {
			id: string
			name?: string | null
			email?: string | null
			image?: string | null
		}
	}
}

const prisma = new PrismaClient()

export const authOptions: AuthOptions = {
	secret: process.env.NEXTAUTH_SECRET,
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) return null

				const user = await prisma.user.findUnique({
					where: { email: credentials.email },
				})

				if (!user || !user.password) return null

				const isValid = await compare(credentials.password, user.password)
				if (!isValid) return null

				return { id: user.id, email: user.email, name: user.name }
			},
		}),
	],
	session: {
		strategy: "jwt",
	},
	jwt: {
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	pages: {
		signIn: "/login", // optional
		error: "/login",  // optional
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id
			}
			return token
		},
		async session({ session, token }) {
			if (token?.id && session.user) {
				session.user.id = token.id as string
			}
			return session
		},
	},
}
