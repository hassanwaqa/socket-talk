"use client";

import Link from "next/link";
import { CirclePlus, MoreHorizontal, SquarePen } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
} from "@/components/ui/tooltip";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Message } from "../data";
import { useEffect, useState } from "react";
import { subscribeToEvent } from "@/lib/socket/socketEvents";
import { EVENTS } from "@/lib/socket/events";
import { fetchNewUsers } from "@/lib/socket/SocketEmitCalls";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import React from "react";

interface SidebarProps {
	isCollapsed: boolean;
	chats: {
		name: string;
		messages: Message[];
		image: string;
		variant: "secondary" | "ghost";
	}[];
	onClick?: () => void;
	isMobile: boolean;
}

function AddContactDialog({ open, setOpen, newContacts }: { open: any, setOpen: any, newContacts: any }) {
	console.log('newContacts', newContacts)
	const [search, setSearch] = useState("");
	const filteredContacts = newContacts?.filter(
		(contact: any) =>
			contact.name.toLowerCase().includes(search.toLowerCase()) ||
			contact.email.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Link
				href="#"
				className={cn(
					buttonVariants({ variant: "ghost", size: "icon" }),
					"h-9 w-9",
				)}
				onClick={e => {
					e.preventDefault();
					setOpen(true);
				}}
			>
				<CirclePlus size={20} />
			</Link>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Contact</DialogTitle>
				</DialogHeader>
				<div className="py-2">
					<Input
						placeholder="Search contacts..."
						value={search}
						onChange={e => setSearch(e.target.value)}
						className="mb-4"
					/>
					<div className="max-h-60 overflow-y-auto flex flex-col gap-2">
						{filteredContacts?.length === 0 && (
							<div className="text-center text-muted-foreground py-4">No contacts found.</div>
						)}
						{filteredContacts?.map((contact: any) => (
							<div key={contact.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/30 cursor-pointer">
								<Avatar>
									<AvatarImage src={contact.image} alt={contact.name} className="w-8 h-8" />
								</Avatar>
								<div className="flex flex-col">
									<span className="font-medium">{contact.name}</span>
									<span className="text-xs text-muted-foreground">{contact.email}</span>
								</div>
								{/* Add button or action here if needed */}
							</div>
						))}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export function Sidebar({ chats, isCollapsed, isMobile }: SidebarProps) {
	const { data: session, status } = useSession();
	const [open, setOpen] = useState(false);
	const [newContacts, setNewContacts] = useState()

	useEffect(() => {
		fetchNewUsers({ userId: session?.user?.id })
		const unsubscribe = subscribeToEvent(EVENTS.NEW_USERS, (response: any) => {
			setNewContacts(response?.data)
			console.log('response', response)
		})

		return () => {
			unsubscribe();
		}
	}, [session?.user?.id])

	return (
		<div
			data-collapsed={isCollapsed}
			className="relative group flex flex-col h-full bg-muted/10 dark:bg-muted/20 gap-4 p-2 data-[collapsed=true]:p-2 "
		>
			{!isCollapsed && (
				<div className="flex justify-between p-2 items-center">
					<div className="flex gap-2 items-center text-2xl">
						<p className="font-medium">Chats</p>
						<span className="text-zinc-300">({chats.length})</span>
					</div>

					<div>
						<Link
							href="#"
							className={cn(
								buttonVariants({ variant: "ghost", size: "icon" }),
								"h-9 w-9",
							)}
						>
							<MoreHorizontal size={20} />
						</Link>

						<Link
							href="#"
							className={cn(
								buttonVariants({ variant: "ghost", size: "icon" }),
								"h-9 w-9",
							)}
						>
							<SquarePen size={20} />
						</Link>
						<AddContactDialog open={open} setOpen={setOpen} newContacts={newContacts} />
					</div>
				</div>
			)}
			<nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
				{chats.map((chat, index) =>
					isCollapsed ? (
						<TooltipProvider key={index}>
							<Tooltip key={index} delayDuration={0}>
								<TooltipTrigger asChild>
									<Link
										href="#"
										className={cn(
											buttonVariants({ variant: chat.variant, size: "icon" }),
											"h-11 w-11 md:h-16 md:w-16",
											chat.variant === "secondary" &&
											"dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white",
										)}
									>
										<Avatar className="flex justify-center items-center">
											<AvatarImage
												src={chat.avatar}
												alt={chat.avatar}
												width={6}
												height={6}
												className="w-10 h-10 "
											/>
										</Avatar>{" "}
										<span className="sr-only">{chat.name}</span>
									</Link>
								</TooltipTrigger>
								<TooltipContent
									side="right"
									className="flex items-center gap-4"
								>
									{chat.name}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					) : (
						<Link
							key={index}
							href="#"
							className={cn(
								buttonVariants({ variant: chat.variant, size: "xl" }),
								chat.variant === "secondary" &&
								"dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white shrink",
								"justify-start gap-4",
							)}
						>
							<Avatar className="flex justify-center items-center">
								<AvatarImage
									src={chat.avatar}
									alt={chat.avatar}
									width={6}
									height={6}
									className="w-10 h-10 "
								/>
							</Avatar>
							<div className="flex flex-col max-w-28">
								<span>{chat.name}</span>
								{chat.messages.length > 0 && (
									<span className="text-zinc-300 text-xs truncate ">
										{chat.messages[chat.messages.length - 1].name.split(" ")[0]}
										:{" "}
										{chat.messages[chat.messages.length - 1].isLoading
											? "Typing..."
											: chat.messages[chat.messages.length - 1].message}
									</span>
								)}
							</div>
						</Link>
					),
				)}
			</nav>
		</div>
	);
}
