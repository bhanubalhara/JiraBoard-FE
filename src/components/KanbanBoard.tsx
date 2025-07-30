import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Task } from "../types";
import TaskCard from "./TaskCard";
import { fetchTasks, updateTask } from "../api";
import { Socket } from "socket.io-client";

interface Props {
  projectId: string;
  socket: Socket;
}

const columns = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

const KanbanBoard: React.FC<Props> = ({ projectId, socket }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [err, setErr] = useState<string | null>(null);

  // Fetch initial tasks
  useEffect(() => {
    fetchTasks(projectId).then((res) => setTasks(res.data));
  }, [projectId]);

  // Socket listeners
  useEffect(() => {
    function onCreated(task: Task) {
      setTasks((prev) => [...prev, task]);
    }
    function onUpdated(task: Task) {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    }
    function onDeleted(id: string) {
      setTasks((prev) => prev.filter((t) => t._id !== id));
    }

    socket.on("taskCreated", onCreated);
    socket.on("taskUpdated", onUpdated);
    socket.on("taskDeleted", onDeleted);

    return () => {
      socket.off("taskCreated", onCreated);
      socket.off("taskUpdated", onUpdated);
      socket.off("taskDeleted", onDeleted);
    };
  }, [socket]);

  const tasksByStatus = columns.reduce<Record<string, Task[]>>((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.status === col.id);
    return acc;
  }, {} as any);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;
    const taskId = draggableId;
    const newStatus = destination.droppableId as Task["status"];

    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTask(taskId, { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-3 gap-4 h-full">
        {/* new task form */}
        {showNew && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded w-80 space-y-3">
              <h3 className="text-lg font-semibold">New task</h3>
              {err && <p className="text-xs text-red-500">{err}</p>}
              <input
                className="w-full p-2 border rounded"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Description (optional)"
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  className="flex-1 bg-blue-600 text-white py-1 rounded"
                  onClick={async () => {
                    if (!title.trim()) {
                      setErr("Title required");
                      return;
                    }
                    try {
                      const { createTask } = await import("../api");
                      await createTask({ title: title.trim(), description: desc.trim(), projectId });
                      setShowNew(false);
                      setTitle("");
                      setDesc("");
                      setErr(null);
                    } catch (e: any) {
                      setErr(e.response?.data?.message || e.message);
                    }
                  }}
                >
                  Create
                </button>
                <button
                  className="flex-1 border py-1 rounded"
                  onClick={() => setShowNew(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* add task button */}
        <button
          onClick={() => setShowNew(true)}
          className="absolute right-6 top-4 bg-blue-600 text-white px-3 py-1 rounded text-sm z-10"
        >
          + New task
        </button>
        {columns.map((col) => (
          <Droppable droppableId={col.id} key={col.id}>
            {(provided) => (
              <div className="bg-gray-200 dark:bg-gray-800 rounded p-3 flex flex-col h-full">
                <h3 className="font-semibold mb-2 text-sm capitalize">
                  {col.title}
                </h3>
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 overflow-y-auto"
                >
                  {tasksByStatus[col.id]?.map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(dragProvided) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                        >
                          <TaskCard task={task} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard; 