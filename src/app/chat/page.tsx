"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MoreHorizontal, User } from 'lucide-react';
import { getSession, clearSession } from '@/lib/session';
import { socketManager, Message } from '@/lib/socket';

export default function ChatRoom() {
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
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const initializeChat = async () => {
            // Get roomId from URL parameters
            const urlRoomId = searchParams.get('roomId');

            // Check for valid session with JWT verification
            const session = await getSession();
            if (!session) {
                router.push('/');
                return;
            }

            // Verify roomId matches session or use URL roomId
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

        // Add event listeners
        socketManager.on('connect', handleConnect);
        socketManager.on('disconnect', handleDisconnect);
        socketManager.on('message', handleMessage);

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

    const handleDisconnect = () => {
        // Leave room before disconnecting
        if (hasJoinedRoom.current && roomId && username) {
            socketManager.leaveRoom(roomId, username);
            hasJoinedRoom.current = false;
        }
        socketManager.disconnect();
        setIsConnected(false);
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
        const url = `${window.location.origin}/?roomId=${roomId}`;
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
        const handleClickOutside = () => {
            setShowUserMenu(false);
            setShowRoomMenu(false);
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex flex-col">
            {/* Top Navigation */}
            <div className="bg-white shadow-sm border-b p-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    {/* Room Info */}
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowRoomMenu(!showRoomMenu);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <MoreHorizontal className="w-5 h-5 text-gray-600" />
                            </button>

                            {showRoomMenu && (
                                <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg py-2 min-w-48 z-10">
                                    <button
                                        onClick={copyRoomUrl}
                                        className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                                    >
                                        Copy Room URL
                                    </button>
                                    <button
                                        onClick={handleChangeRoom}
                                        className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                                    >
                                        Change Room
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="text-xs text-gray-500 uppercase">Room</div>
                            <div className="font-semibold text-gray-800">{roomId.substring(0, 8)}...</div>
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowUserMenu(!showUserMenu);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <User className="w-5 h-5 text-gray-600" />
                        </button>

                        {showUserMenu && (
                            <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg py-2 min-w-32 z-10">
                                <button
                                    onClick={handleSignOut}
                                    className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                                >
                                    Sign Out
                                </button>
                                <button
                                    onClick={handleDisconnect}
                                    className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                                >
                                    Disconnect
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 max-w-4xl mx-auto w-full p-4 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto mb-4 flex flex-col justify-end">
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
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white text-gray-800 border'
                                    }`}>
                                    {!message.isOwn && (
                                        <div className="text-xs text-gray-500 mb-1">{message.username}</div>
                                    )}
                                    <div className="text-sm">{message.content}</div>
                                    <div className={`text-xs mt-1 ${message.isOwn ? 'text-red-100' : 'text-gray-400'
                                        }`}>
                                        {message.timestamp}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Message"
                        className={`flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800 placeholder-gray-400 ${!isConnected ? 'opacity-50' : ''}`}
                        disabled={!isConnected}
                    />
                    <button
                        type="submit"
                        disabled={!isConnected || !newMessage.trim()}
                        className={`px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium ${(!isConnected || !newMessage.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Send
                    </button>
                </form>
            </div>

            {/* Connection Status */}
            {!isConnected && (
                <div className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                    Disconnected
                </div>
            )}

            {/* Footer */}
            <div className="text-center py-4 text-sm text-gray-500">
                Powered by <span className="text-red-500 font-medium">AnyCable</span>
            </div>
        </div>
    );
} 