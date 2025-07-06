import { io, Socket } from 'socket.io-client';

export interface Message {
    id: string;
    username: string;
    content: string;
    timestamp: string;
    isOwn: boolean;
}

export interface SocketEvents {
    connect: () => void;
    disconnect: () => void;
    message: (message: Message) => void;
    'message-history': (data: { roomId: string; messages: Array<{ content: string; username: string; timestamp: string; isOwn: boolean }> }) => void;
    'user-joined': (data: { username: string }) => void;
    'user-left': (data: { username: string }) => void;
}

class SocketManager {
    private socket: Socket | null = null;
    private listeners: Map<string, ((...args: unknown[]) => void)[]> = new Map();

    connect(url: string = 'http://localhost:4000'): Socket {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(url, {
            transports: ['websocket'],
            autoConnect: true,
        });

        // Set up event listeners
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.emit('connect');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.emit('disconnect');
        });

        this.socket.on('message', (message: Message) => {
            this.emit('message', message);
        });

        this.socket.on('message-history', (data: { roomId: string; messages: Array<{ content: string; username: string; timestamp: string; isOwn: boolean }> }) => {
            this.emit('message-history', data);
        });

        this.socket.on('user-joined', (data: { username: string }) => {
            this.emit('user-joined', data);
        });

        this.socket.on('user-left', (data: { username: string }) => {
            this.emit('user-left', data);
        });

        return this.socket;
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinRoom(roomId: string, username: string): void {
        this.socket?.emit('join-room', { roomId, username });
    }

    leaveRoom(roomId: string, username: string): void {
        this.socket?.emit('user-left', { roomId, username });
    }

    sendMessage(roomId: string, message: Omit<Message, 'id'>): void {
        this.socket?.emit('send-message', { roomId, message });
    }

    on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback as (...args: unknown[]) => void);
    }

    off<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            const index = eventListeners.indexOf(callback as (...args: unknown[]) => void);
            if (index > -1) {
                eventListeners.splice(index, 1);
            }
        }
    }

    private emit(event: string, ...args: unknown[]): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(callback => callback(...args));
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export const socketManager = new SocketManager(); 