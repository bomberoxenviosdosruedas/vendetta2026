'use client';

import { useState } from "react";
import { MessageList } from "./message-list";
import { MessageFolderList } from "./message-folder-list";
import { FullMessage, UserWithProgress } from "@/lib/data";
import { ComposeMessage } from "./compose-message";

interface MessagesViewProps {
    currentUser: UserWithProgress;
    initialMessages: FullMessage[];
    allUsers: { id: string; name: string }[];
    initialCategory: string;
}

export function MessagesView({ currentUser, initialMessages, allUsers, initialCategory }: MessagesViewProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
    const [selectedMessage, setSelectedMessage] = useState<FullMessage | null>(null);

    const filteredMessages = initialMessages.filter(m => m.category === selectedCategory);

    return (
        <div className="w-full space-y-3">
            <section className="v-outer-frame">
                <div className="crimson-th p-2 flex items-center justify-between">
                    <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wider">
                        CENTRO DE MENSAJES
                    </span>
                    <ComposeMessage allUsers={allUsers} currentUser={currentUser} />
                </div>

                <div className="p-3 bg-[#dfdbc9] grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3">
                    <MessageFolderList
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                    />
                    <MessageList
                        messages={filteredMessages}
                        selectedMessage={selectedMessage}
                        setSelectedMessage={setSelectedMessage}
                        categoryName={selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).toLowerCase()}
                    />
                </div>
            </section>
        </div>
    );
}
