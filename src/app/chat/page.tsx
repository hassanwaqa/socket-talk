"use client";

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MoreHorizontal, User } from 'lucide-react';
import { getSession, clearSession } from '@/lib/session';
import { socketManager, Message } from '@/lib/socket';

function ChatRoomContent() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [username, setUsername] = useState('');
    const [roomId, setRoomId] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showRoomMenu, setShowRoomMenu] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasJoinedRoom = useRef(false);
    const currentRoomId = useRef('');
    const currentUsername = useRef('');
    const roomMenuRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const initializeChat = async () => {
            const urlRoomId = searchParams.get('roomId');

            const session = await getSession();
            if (!session) {
                const currentUrl = `${window.location.pathname}${window.location.search}`;
                router.push(`/?redirect=${encodeURIComponent(currentUrl)}`);
                return;
            }

            const targetRoomId = urlRoomId || session.roomId;
            if (!targetRoomId) {
                router.push('/');
                return;
            }

            setUsername(session.username);
            setRoomId(targetRoomId);
            currentRoomId.current = targetRoomId;
            currentUsername.current = session.username;
        };

        initializeChat();
    }, [router, searchParams]);

    // Separate effect for socket management
    useEffect(() => {
        if (!currentRoomId.current || !currentUsername.current) return;

        // Initialize socket connection
        socketManager.connect();

        // Set up socket event listeners
        const handleConnect = () => {
            setIsConnected(true);
            // Only join room if not already joined
            if (!hasJoinedRoom.current) {
                console.log('Joining room:', currentRoomId.current, 'with user:', currentUsername.current);
                socketManager.joinRoom(currentRoomId.current, currentUsername.current);
                hasJoinedRoom.current = true;
            }
        };

        const handleDisconnect = () => {
            setIsConnected(false);
            hasJoinedRoom.current = false;
        };

        const handleMessage = (message: Message) => {
            // Only add messages that are not from the current user
            if (message.username !== currentUsername.current) {
                setMessages(prev => [...prev, { ...message, isOwn: false }]);
            }
        };

        const handleMessageHistory = (data: { roomId: string; messages: Array<{ content: string; username: string; timestamp: string; isOwn: boolean }> }) => {
            // Only process history for the current room
            if (data.roomId === currentRoomId.current) {
                // Convert backend message format to frontend Message format
                const historyMessages: Message[] = data.messages.map((msg, index) => ({
                    id: `history-${index}-${Date.now()}`,
                    username: msg.username,
                    content: msg.content,
                    timestamp: msg.timestamp,
                    isOwn: msg.isOwn
                }));

                // Replace current messages with history
                setMessages(historyMessages);
            }
        };

        // Add event listeners
        socketManager.on('connect', handleConnect);
        socketManager.on('disconnect', handleDisconnect);
        socketManager.on('message', handleMessage);
        socketManager.on('message-history', handleMessageHistory);

        // Handle user leaving on page unload
        const handleBeforeUnload = () => {
            if (hasJoinedRoom.current && currentRoomId.current && currentUsername.current) {
                socketManager.leaveRoom(currentRoomId.current, currentUsername.current);
                hasJoinedRoom.current = false;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup function
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);

            // Remove event listeners
            socketManager.off('connect', handleConnect);
            socketManager.off('disconnect', handleDisconnect);
            socketManager.off('message', handleMessage);
            socketManager.off('message-history', handleMessageHistory);

            // Leave room when component unmounts
            if (hasJoinedRoom.current && currentRoomId.current && currentUsername.current) {
                socketManager.leaveRoom(currentRoomId.current, currentUsername.current);
                hasJoinedRoom.current = false;
            }

            socketManager.disconnect();
        };
    }, [username, roomId]); // Only re-run when username or roomId changes

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && isConnected) {
            const message: Message = {
                id: Date.now().toString(),
                username,
                content: newMessage.trim(),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isOwn: true,
            };

            // Add message to local state immediately
            setMessages(prev => [...prev, message]);

            // Send message via socket with roomId
            socketManager.sendMessage(roomId, {
                username: message.username,
                content: message.content,
                timestamp: message.timestamp,
                isOwn: false // Will be false for other users
            });

            setNewMessage('');
        }
    };

    const handleSignOut = () => {
        // Leave room before signing out
        if (hasJoinedRoom.current && roomId && username) {
            socketManager.leaveRoom(roomId, username);
            hasJoinedRoom.current = false;
        }
        clearSession();
        socketManager.disconnect();
        router.push('/');
    };

    const copyRoomUrl = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        alert('Room URL copied to clipboard!');
        setShowRoomMenu(false);
    };

    const handleChangeRoom = () => {
        // Leave current room before changing
        if (hasJoinedRoom.current && roomId && username) {
            socketManager.leaveRoom(roomId, username);
            hasJoinedRoom.current = false;
        }
        router.push('/');
        setShowRoomMenu(false);
    };

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                roomMenuRef.current &&
                !roomMenuRef.current.contains(event.target as Node) &&
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setShowUserMenu(false);
                setShowRoomMenu(false);
            } else if (
                roomMenuRef.current &&
                !roomMenuRef.current.contains(event.target as Node)
            ) {
                setShowRoomMenu(false);
            } else if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-amber-50 flex flex-col" style={{ backgroundColor: '#fef7ed' }}>
            {/* Top Navigation - Fixed Island */}
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-amber-100 shadow-lg border rounded-lg p-4 z-10 w-full max-w-4xl mx-4">
                <div className="flex items-center justify-between">
                    {/* Room Info */}
                    <div className="flex items-center space-x-4">
                        <div className="relative" ref={roomMenuRef}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowRoomMenu(!showRoomMenu);
                                }}
                                className="p-2 hover:bg-amber-200 rounded-full transition-colors"
                            >
                                <MoreHorizontal className="w-5 h-5 text-gray-600" />
                            </button>
                            {showRoomMenu && (
                                <div className="absolute top-full left-0 mt-2 bg-amber-50 border rounded-lg shadow-lg py-2 min-w-48 z-10">
                                    <button
                                        onClick={copyRoomUrl}
                                        className="block w-full px-4 py-2 text-left text-amber-700 hover:bg-amber-100 text-sm"
                                    >
                                        Copy Room URL
                                    </button>
                                    <button
                                        onClick={handleChangeRoom}
                                        className="block w-full px-4 py-2 text-left text-amber-700 hover:bg-amber-100 text-sm"
                                    >
                                        Change Room
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="text-xs text-gray-500 uppercase">Room</div>
                            <div className="font-semibold text-gray-800">{roomId}</div>
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowUserMenu(!showUserMenu);
                            }}
                            className="p-2 hover:bg-amber-200 rounded-full transition-colors"
                        >
                            <User className="w-5 h-5 text-gray-600" />
                        </button>
                        {showUserMenu && (
                            <div className="absolute top-full right-0 mt-2 bg-amber-50 border rounded-lg shadow-lg py-2 min-w-40 z-10">
                                <div className="px-4 py-2 text-sm text-amber-800 border-b">
                                    {username}
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="block w-full px-4 py-3 text-left text-amber-700 hover:bg-amber-100 text-sm"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages Area - Scrollable */}
            <div className="flex-1 pt-24 pb-21 overflow-hidden bg-amber-50">
                <div className="max-w-4xl mx-auto h-full p-4 flex flex-col">
                    <div className="flex-1 overflow-y-auto bg-amber-50">
                        <div className="space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center text-gray-500 py-8">
                                    Welcome to the chat room! Start a conversation...
                                </div>
                            )}

                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isOwn
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-white text-gray-800 border border-amber-200'
                                        }`}>
                                        {!message.isOwn && (
                                            <div className="text-xs text-gray-500 mb-1">{message.username}</div>
                                        )}
                                        <div className="text-sm">{message.content}</div>
                                        <div className={`text-xs mt-1 ${message.isOwn ? 'text-amber-100' : 'text-gray-400'
                                            }`}>
                                            {message.timestamp}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            {/* Message Input - Fixed */}
            <div className="fixed bottom-4 left-0 right-0 bg-amber-50 p-4">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Message"
                            className={`flex-1 px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-800 placeholder-gray-400 ${!isConnected ? 'opacity-50' : ''}`}
                            disabled={!isConnected}
                        />
                        <button
                            type="submit"
                            disabled={!isConnected || !newMessage.trim()}
                            className={`px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium ${(!isConnected || !newMessage.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>

            {/* Connection Status */}
            {!isConnected && (
                <div className="fixed bottom-20 left-4 bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg z-20">
                    Disconnected
                </div>
            )}

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 text-center py-1 text-xs text-gray-500 bg-amber-50">
                Powered by <span className="text-amber-600 font-medium">Socket Talk</span>
            </div>
        </div>
    );
}

export default function ChatRoom() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-amber-50 flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        }>
            <ChatRoomContent />
        </Suspense>
    );
} 