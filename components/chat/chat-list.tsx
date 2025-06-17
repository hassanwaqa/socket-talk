import { Message, UserData } from "../../data";
import { cn } from "@/lib/utils";
import React, { useRef, useEffect } from "react";
import ChatBottombar from "./chat-bottombar";
import { AnimatePresence, motion } from "framer-motion";
import { DotsVerticalIcon, HeartIcon, Share1Icon } from "@radix-ui/react-icons";
import { Forward, Heart } from "lucide-react";

interface ChatBubbleProps {
	variant: "sent" | "received";
	children: React.ReactNode;
}

const ChatBubble = ({ variant, children }: ChatBubbleProps) => (
	<div className={cn(
		"flex gap-2 items-end",
		variant === "sent" ? "flex-row-reverse" : "flex-row"
	)}>
		{children}
	</div>
);

const ChatBubbleAvatar = ({ src }: { src: string }) => (
	<img src={src} alt="avatar" className="w-8 h-8 rounded-full" />
);

const ChatBubbleMessage = ({ children, isLoading }: { children: React.ReactNode, isLoading?: boolean }) => (
	<div className={cn(
		"rounded-lg px-4 py-2 max-w-[80%] bg-gray-700",
		// isLoading ? "animate-pulse bg-muted" : "bg-primary text-primary-foreground"
	)}>
		{children}
	</div>
);

const ChatBubbleTimestamp = ({ timestamp }: { timestamp: string }) => (
	<div className="text-xs text-muted-foreground mt-1">{timestamp}</div>
);

const ChatBubbleAction = ({ icon, onClick, className }: { icon: React.ReactNode, onClick: () => void, className?: string }) => (
	<button onClick={onClick} className={cn("p-1 hover:bg-muted rounded-full", className)}>
		{icon}
	</button>
);

const ChatBubbleActionWrapper = ({ children }: { children: React.ReactNode }) => (
	<div className="flex gap-1 items-center">
		{children}
	</div>
);

const ChatMessageList = ({ children, className }: { children: React.ReactNode, className?: string }) => (
	<div className={cn("flex-1 overflow-y-auto", className)}>
		{children}
	</div>
);

interface ChatListProps {
	messages: Message[];
	selectedUser: UserData;
	sendMessage: (newMessage: Message) => void;
	isMobile: boolean;
}

const getMessageVariant = (messageName: string, selectedUserName: string) =>
	messageName !== selectedUserName ? "sent" : "received";

export function ChatList({
	messages,
	selectedUser,
	sendMessage,
	isMobile,
}: ChatListProps) {
	const actionIcons = [
		{ icon: DotsVerticalIcon, type: "More" },
		{ icon: Forward, type: "Like" },
		{ icon: Heart, type: "Share" },
	];

	return (
		<div className="w-full h-screen overflow-y-hidden flex flex-col">
			<ChatMessageList>
				<AnimatePresence>
					{messages.map((message, index) => {
						const variant = getMessageVariant(message.name, selectedUser.name);
						return (
							<motion.div
								key={index}
								layout
								initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
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
								className="flex flex-col gap-2 p-4"
							>
								<ChatBubble variant={variant}>
									<ChatBubbleAvatar src={message.avatar} />
									<ChatBubbleMessage isLoading={message.isLoading}>
										{message.message}
										{message.timestamp && (
											<ChatBubbleTimestamp timestamp={message.timestamp} />
										)}
									</ChatBubbleMessage>
									<ChatBubbleActionWrapper>
										{actionIcons.map(({ icon: Icon, type }) => (
											<ChatBubbleAction
												className="size-7"
												key={type}
												icon={<Icon className="size-4" />}
												onClick={() =>
													console.log(
														"Action " + type + " clicked for message " + index,
													)
												}
											/>
										))}
									</ChatBubbleActionWrapper>
								</ChatBubble>
							</motion.div>
						);
					})}
				</AnimatePresence>
			</ChatMessageList>
		</div>
	);
}