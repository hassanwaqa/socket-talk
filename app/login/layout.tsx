import "@/app/globals.css"

export default function LoginLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="min-h-full bg-white">
			{children}
		</div>
	)
}
