import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        // Validate token presence
        if (!token || typeof token !== 'string') {
            return NextResponse.json(
                { error: 'Token is required' },
                { status: 400 }
            );
        }

        // Verify JWT token using the same secret as login
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as jwt.JwtPayload;

        // Check if token is expired (additional check)
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            return NextResponse.json(
                { error: 'Token has expired' },
                { status: 401 }
            );
        }

        // Return user info and room ID if token is valid
        return NextResponse.json({
            success: true,
            user: {
                username: decoded.username,
            },
            roomId: decoded.roomId,
            expiresAt: decoded.exp ? decoded.exp * 1000 : null,
        });

    } catch (error) {
        console.error('Token verification error:', error);

        // Handle specific JWT errors
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        if (error instanceof jwt.TokenExpiredError) {
            return NextResponse.json(
                { error: 'Token has expired' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 