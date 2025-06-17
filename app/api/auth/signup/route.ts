import { hash } from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
	const { email, name, password } = await req.json();

	if (!email || !password) {
		return NextResponse.json({ error: "Missing fields" }, { status: 400 });
	}

	const existingUser = await prisma.user.findUnique({ where: { email } });
	if (existingUser) {
		return NextResponse.json({ error: "User already exists" }, { status: 409 });
	}

	const hashedPassword = await hash(password, 10);

	const user = await prisma.user.create({
		data: {
			email,
			name,
			password: hashedPassword,
		},
	});

	return NextResponse.json({ message: "User created", user }, { status: 201 });
}
