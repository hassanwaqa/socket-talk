import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Generate a random room ID (21 characters)
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
        const { username, roomId } = await request.json();

        if (!username || username.trim().length === 0) {
            return NextResponse.json(
                { error: 'Username is required' },
                { status: 400 }
            );
        }

        // Use provided roomId or generate a new one
        const targetRoomId = roomId || generateRoomId();

        // Create JWT payload
        const payload = {
            username: username.trim(),
            roomId: targetRoomId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
        };

        // Sign the JWT
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key');

        return NextResponse.json({
            success: true,
            token,
            roomId: targetRoomId,
            user: { username: username.trim() },
            expiresAt: payload.exp * 1000, // Convert to milliseconds
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 