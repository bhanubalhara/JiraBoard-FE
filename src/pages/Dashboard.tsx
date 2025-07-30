import React from "react";
import { io, Socket } from "socket.io-client";
import KanbanBoard from "../components/KanbanBoard";
import ChatPanel from "../components/ChatPanel";
import ProjectsSidebar from "../components/ProjectsSidebar";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Strip trailing /api for socket connection
const socketUrl = apiUrl.replace(/\/api\/?$/, "");

const Dashboard: React.FC = () => {
  const [projectId, setProjectId] = React.useState<string | null>(null);
  const [socket, setSocket] = React.useState<Socket | null>(null);

  // (Re)create socket whenever token changes
  React.useEffect(() => {
    (async () => {
      try {
        const { auth } = await import("../firebase");
        const token = auth.currentUser ? await auth.currentUser.getIdToken(true) : "";
        if (token) localStorage.setItem("token", token);
        if (!token) return;

        const s: Socket = io(socketUrl, {
          auth: { token },
        });

        s.on("connect_error", async (err: any) => {
          if (err?.message === "Unauthorized") {
            try {
              if (auth.currentUser) {
                const refreshed = await auth.currentUser.getIdToken(true);
                localStorage.setItem("token", refreshed);
                s.auth = { token: refreshed } as any;
                // reconnect once
                s.connect();
                return;
              }
            } catch {}

            // fallback redirect to login
            const path = window.location.pathname;
            if (path !== "/login" && path !== "/register") {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }
          }
        });

        setSocket(s);

        // Refresh socket auth when Firebase refreshes token
        const unsub = auth.onIdTokenChanged(async (user) => {
          if (!user) return;
          const newToken = await user.getIdToken(true);
          localStorage.setItem("token", newToken);
          // re-authenticate socket
          if (s.connected) {
            s.disconnect();
          }
          s.auth = { token: newToken } as any;
          s.connect();
        });

        return () => {
          unsub();
          s.disconnect();
        };
      } catch {
        /* ignore */
      }
    })();
  }, []);

  if (!socket) {
    return null; // or a loader while socket initialises
  }

  return (
    <div className="h-screen flex text-black dark:text-gray-300">
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