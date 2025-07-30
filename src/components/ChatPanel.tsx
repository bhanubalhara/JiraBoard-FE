import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { Message } from "../types";
import { fetchMessages, sendMessage } from "../api";

interface Props {
  socket: Socket;
}

const ChatPanel: React.FC<Props> = ({ socket }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchMessages().then((res) => setMessages(res.data));
  }, []);

  useEffect(() => {
    function onNewMessage(msg: Message) {
      setMessages((prev) => [...prev, msg]);
    }
    socket.on("newMessage", onNewMessage);
    return () => {
      socket.off("newMessage", onNewMessage);
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await sendMessage(input.trim());
      setInput("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full border-l border-gray-300 dark:border-gray-700">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((m) => (
          <div key={m._id} className="text-sm">
            <span className="font-semibold mr-1">{m.senderId}:</span>
            <span>{m.content}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="p-3 border-t dark:border-gray-700">
        <input
          className="w-full p-2 border rounded dark:bg-gray-800"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
      </form>
    </div>
  );
};

export default ChatPanel; 