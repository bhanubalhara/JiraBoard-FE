export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  projectId: string;
  assignedTo?: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  teamId: string;
}

export interface Message {
  _id: string;
  content: string;
  senderId: string;
  teamId: string;
  timestamp: string;
} 