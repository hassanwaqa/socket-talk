import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Secret key for JWT signing (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Function to generate a unique room ID
function generateRoomId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    for (let i = 0; i < 21; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function POST(request: NextRequest) {
    try {
        const { username } = await request.json();

        // Validate username
        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            return NextResponse.json(
                { error: 'Username is required and must be a non-empty string' },
                { status: 400 }
            );
        }

        // Clean username
        const cleanUsername = username.trim();

        // Generate unique room ID
        // const roomId = generateRoomId();
        const roomId = "lPD-83igS8huPA7xVt2CR"

        // Create JWT payload
        const payload = {
            username: cleanUsername,
            roomId,
            iat: Math.floor(Date.now() / 1000), // Issued at
            exp: Math.floor(Date.now() / 1000) + (30 * 60), // Expires in 30 minutes
        };

        // Generate JWT token
        const token = jwt.sign(payload, JWT_SECRET);

        // Return token, user info, and room ID
        return NextResponse.json({
            success: true,
            token,
            user: {
                username: cleanUsername,
            },
            roomId,
            expiresAt: payload.exp * 1000, // Convert to milliseconds for frontend
        });

    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 