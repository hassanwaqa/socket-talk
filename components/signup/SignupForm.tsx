"use client"
import { GalleryVerticalEnd } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SignupCredentials {
	name: string
	email: string
	password: string
	confirmPassword: string
}

export function SignupForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter()
	const [credentials, setCredentials] = useState<SignupCredentials>({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	})
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setCredentials((prev) => ({
			...prev,
			[name]: value,
		}))
		setError(null) // Clear error when user types
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		// Validate passwords match
		if (credentials.password !== credentials.confirmPassword) {
			setError("Passwords do not match")
			return
		}

		setIsLoading(true)

		try {
			const response = await fetch("/api/auth/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: credentials.name,
					email: credentials.email,
					password: credentials.password,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.message || "Something went wrong")
			}

			// Sign in the user after successful signup
			const result = await signIn("credentials", {
				email: credentials.email,
				password: credentials.password,
				redirect: false,
			})

			if (result?.error) {
				setError(result.error)
			} else {
				router.push("/") // Redirect to home page
			}
		} catch (error) {
			setError(error instanceof Error ? error.message : "Something went wrong")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<form onSubmit={handleSubmit}>
				<div className="flex flex-col gap-6">
					<div className="flex flex-col items-center gap-2">
						<a
							href="#"
							className="flex flex-col items-center gap-2 font-medium"
						>
							<div className="flex size-8 items-center justify-center rounded-md">
								<GalleryVerticalEnd className="size-6" />
							</div>
							<span className="sr-only">Acme Inc.</span>
						</a>
						<h1 className="text-xl font-bold">Create an Account</h1>
						<div className="text-center text-sm">
							Already have an account?{" "}
							<a href="/login" className="underline underline-offset-4">
								Sign in
							</a>
						</div>
					</div>
					<div className="flex flex-col gap-6">
						<div className="grid gap-3">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								name="name"
								type="text"
								placeholder="John Doe"
								required
								value={credentials.name}
								onChange={handleChange}
								disabled={isLoading}
							/>
						</div>
						<div className="grid gap-3">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="m@example.com"
								required
								value={credentials.email}
								onChange={handleChange}
								disabled={isLoading}
							/>
						</div>
						<div className="grid gap-3">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								name="password"
								type="password"
								required
								value={credentials.password}
								onChange={handleChange}
								disabled={isLoading}
							/>
						</div>
						<div className="grid gap-3">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								required
								value={credentials.confirmPassword}
								onChange={handleChange}
								disabled={isLoading}
							/>
						</div>
						{error && (
							<div className="text-sm text-red-500">
								{error}
							</div>
						)}
						<Button
							type="submit"
							className="w-full bg-white text-black"
							disabled={isLoading}
						>
							{isLoading ? "Creating account..." : "Create account"}
						</Button>
					</div>
					<div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
						<span className="bg-background text-muted-foreground relative z-10 px-2">
							Or
						</span>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<Button
							variant="outline"
							type="button"
							className="w-full"
							onClick={() => signIn("apple")}
							disabled={isLoading}
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path
									d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
									fill="currentColor"
								/>
							</svg>
							Continue with Apple
						</Button>
						<Button
							variant="outline"
							type="button"
							className="w-full"
							onClick={() => signIn("google")}
							disabled={isLoading}
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path
									d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
									fill="currentColor"
								/>
							</svg>
							Continue with Google
						</Button>
					</div>
				</div>
			</form>
		</div>
	)
}
