"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Send } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatBubbleProps {
	variant: "sent" | "received";
	children: React.ReactNode;
}

const ChatBubble = ({ variant, children }: ChatBubbleProps) => (
	<div className={cn(
		"flex gap-2 items-end p-4",
		variant === "sent" ? "flex-row-reverse" : "flex-row"
	)}>
		{children}
	</div>
);

const ChatBubbleAvatar = ({ src, fallback }: { src: string, fallback: string }) => (
	<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
		{src ? <img src={src} alt="avatar" className="w-full h-full rounded-full" /> : fallback}
	</div>
);

const ChatBubbleMessage = ({ children, variant }: { children: React.ReactNode, variant: "sent" | "received" }) => (
	<div className={cn(
		"rounded-lg px-4 py-2 max-w-[80%]",
		variant === "sent" ? "bg-primary text-primary-foreground" : "bg-muted"
	)}>
		{children}
	</div>
);

const ChatInput = React.forwardRef<
	HTMLTextAreaElement,
	React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
	<textarea
		ref={ref}
		className={cn(
			"flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
			className
		)}
		{...props}
	/>
));
ChatInput.displayName = "ChatInput";

const ChatMessageList = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex-1 overflow-y-auto", className)}
		{...props}
	/>
));
ChatMessageList.displayName = "ChatMessageList";

interface ExpandableChatProps {
	icon: React.ReactNode;
	size?: "sm" | "md" | "lg";
	position?: "bottom-right" | "bottom-left";
	children: React.ReactNode;
}

const ExpandableChat = ({ icon, size = "md", position = "bottom-right", children }: ExpandableChatProps) => (
	<div className={cn(
		"fixed bottom-4 right-4 w-[400px] h-[600px] bg-background border rounded-lg shadow-lg flex flex-col",
		position === "bottom-left" && "left-4 right-auto"
	)}>
		{children}
	</div>
);

const ExpandableChatHeader = ({ className, children }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("p-4 border-b", className)}>
		{children}
	</div>
);

const ExpandableChatBody = ({ children }: { children: React.ReactNode }) => (
	<div className="flex-1 overflow-hidden">
		{children}
	</div>
);

const ExpandableChatFooter = ({ children }: { children: React.ReactNode }) => (
	<div className="p-4 border-t">
		{children}
	</div>
);

interface Message {
	id: string;
	content: string;
	sender: "user" | "ai";
	timestamp: string;
}

const initialChatSupportMessages: Message[] = [
	{
		id: "1",
		content: "Hello! How can I help you today?",
		sender: "ai",
		timestamp: new Date().toLocaleTimeString(),
	},
];

export default function ChatSupport() {
	const [messages, setMessages] = useState<Message[]>(initialChatSupportMessages);
	const [inputMessage, setInputMessage] = useState("");

	const messagesContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
		}
	}, [messages]);

	const handleSendMessage = () => {
		if (inputMessage.trim()) {
			const newMessage: Message = {
				id: Date.now().toString(),
				content: inputMessage,
				sender: "user",
				timestamp: new Date().toLocaleTimeString(),
			};
			setMessages([...messages, newMessage]);
			setInputMessage("");
		}
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	return (
		<ExpandableChat icon={<Bot className="h-6 w-6" />} size="lg" position="bottom-right">
			<ExpandableChatHeader className="flex-col text-center justify-center">
				<h1 className="text-xl font-semibold">Chat with our AI ✨</h1>
				<p>Ask any question for our AI to answer</p>
				<div className="flex gap-2 items-center pt-2">
					<Button variant="secondary">New Chat</Button>
					<Button variant="secondary">See FAQ</Button>
				</div>
			</ExpandableChatHeader>
			<ExpandableChatBody>
				<ChatMessageList ref={messagesContainerRef} className="dark:bg-muted/40">
					<AnimatePresence>
						{messages.map((message, index) => (
							<motion.div
								key={index}
								layout
								initial={{ opacity: 0, scale: 1, y: 10, x: 0 }}
								animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
								exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
								transition={{
									opacity: { duration: 0.1 },
									layout: {
										type: "spring",
										bounce: 0.3,
										duration: index * 0.05 + 0.2,
									},
								}}
								style={{ originX: 0.5, originY: 0.5 }}
								className="flex flex-col"
							>
								<ChatBubble key={message.id} variant={message.sender === "user" ? "sent" : "received"}>
									<ChatBubbleAvatar
										src={message.sender === "user" ? "https://avatars.githubusercontent.com/u/114422072?s=400&u=8a176a310ca29c1578a70b1c33bdeea42bf000b4&v=4" : ""}
										fallback={message.sender === "user" ? "US" : "🤖"}
									/>
									<ChatBubbleMessage variant={message.sender === "user" ? "sent" : "received"}>
										{message.content}
									</ChatBubbleMessage>
								</ChatBubble>
							</motion.div>
						))}
					</AnimatePresence>
				</ChatMessageList>
			</ExpandableChatBody>
			<ExpandableChatFooter>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSendMessage();
					}}
					className="flex relative gap-2"
				>
					<ChatInput
						onKeyDown={onKeyDown}
						value={inputMessage}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputMessage(e.target.value)}
						placeholder="Type a message..."
					/>
					<Button
						disabled={!inputMessage.trim()}
						type="submit"
						size="icon"
						className="absolute right-2 top-1/2 transform -translate-y-1/2 shrink-0"
					>
						<Send className="size-4" />
					</Button>
				</form>
			</ExpandableChatFooter>
		</ExpandableChat>
	);
}