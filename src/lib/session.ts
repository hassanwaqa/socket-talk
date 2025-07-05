export interface SessionData {
    username: string;
    token: string;
    roomId: string;
    expiresAt: number;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    user: {
        username: string;
    };
    roomId: string;
    expiresAt: number;
    error?: string;
}

export interface VerifyResponse {
    success: boolean;
    user: {
        username: string;
    };
    roomId: string;
    expiresAt: number;
    error?: string;
}

export const SESSION_KEY = 'chatSession';

// API call to login and get JWT token
export async function loginWithUsername(username: string): Promise<LoginResponse> {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        return data;
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            token: '',
            user: { username: '' },
            roomId: '',
            expiresAt: 0,
            error: error instanceof Error ? error.message : 'Login failed',
        };
    }
}

// API call to verify JWT token
export async function verifyToken(token: string): Promise<VerifyResponse> {
    try {
        const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Token verification failed');
        }

        return data;
    } catch (error) {
        console.error('Token verification error:', error);
        return {
            success: false,
            user: { username: '' },
            roomId: '',
            expiresAt: 0,
            error: error instanceof Error ? error.message : 'Token verification failed',
        };
    }
}

export function createSession(token: string, username: string, roomId: string, expiresAt: number): SessionData {
    const sessionData: SessionData = {
        username,
        token,
        roomId,
        expiresAt,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    return sessionData;
}

export async function getSession(): Promise<SessionData | null> {
    if (typeof window === 'undefined') return null;

    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;

    try {
        const session: SessionData = JSON.parse(sessionData);

        // Check if session is expired locally first
        if (Date.now() > session.expiresAt) {
            clearSession();
            return null;
        }

        // Verify token with backend
        const verifyResult = await verifyToken(session.token);
        if (!verifyResult.success) {
            clearSession();
            return null;
        }

        // Update session with latest data from server
        session.expiresAt = verifyResult.expiresAt;
        session.roomId = verifyResult.roomId;
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        return session;
    } catch (error) {
        console.error('Session validation error:', error);
        clearSession();
        return null;
    }
}

export function getSessionSync(): SessionData | null {
    if (typeof window === 'undefined') return null;

    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;

    try {
        const session: SessionData = JSON.parse(sessionData);

        // Check if session is expired locally
        if (Date.now() > session.expiresAt) {
            clearSession();
            return null;
        }

        return session;
    } catch (error) {
        console.error('Session validation error:', error);
        clearSession();
        return null;
    }
}

export function clearSession(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_KEY);
    }
}

export async function isSessionValid(): Promise<boolean> {
    const session = await getSession();
    return session !== null;
}

export function isSessionValidSync(): boolean {
    const session = getSessionSync();
    return session !== null;
} 