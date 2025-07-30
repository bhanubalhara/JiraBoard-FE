import React from "react";
import { io, Socket } from "socket.io-client";
import KanbanBoard from "../components/KanbanBoard";
import ChatPanel from "../components/ChatPanel";
import ProjectsSidebar from "../components/ProjectsSidebar";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const socket: Socket = io(backendUrl, {
  auth: { token: localStorage.getItem("token") || "" },
});

const Dashboard: React.FC = () => {
  const [projectId, setProjectId] = React.useState<string | null>(null);

  return (
    <div className="h-screen flex text-gray-900 dark:text-gray-100">
      <ProjectsSidebar selectedId={projectId} onSelect={setProjectId} />
      <div className="flex-1 p-4">
        {projectId ? (
          <KanbanBoard projectId={projectId} socket={socket} />
        ) : (
          <p className="text-center mt-20">Select a project to view tasks.</p>
        )}
      </div>
      <div className="w-80">
        <ChatPanel socket={socket} />
      </div>
    </div>
  );
};

export default Dashboard; 