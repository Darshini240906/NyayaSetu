import { useState } from "react";
import ChatSidebar from "../components/Chat/ChatSidebar";
import ChatWindow from "../components/Chat/ChatWindow";

export default function ChatPage() {
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  return (
    <div className="flex h-full min-h-0">
      <ChatSidebar mobileOpen={chatDrawerOpen} onClose={() => setChatDrawerOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <ChatWindow onOpenSidebar={() => setChatDrawerOpen(true)} />
      </div>
    </div>
  );
}
