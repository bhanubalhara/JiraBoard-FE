import React, { useEffect, useState } from "react";
import { Project } from "../types";
import { fetchProjects, createProject } from "../api";

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const ProjectsSidebar: React.FC<Props> = ({ selectedId, onSelect }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects().then((res) => setProjects(res.data));
  }, []);

  const submitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Name required");
    try {
      await createProject({ name: name.trim(), description });
      setName("");
      setDescription("");
      setShowCreate(false);
      setError(null);
      const res = await fetchProjects();
      setProjects(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <aside className="w-60 border-r dark:border-gray-700 p-4 space-y-2 overflow-y-auto">
      <h2 className="font-semibold mb-3">Projects</h2>
      <button onClick={() => setShowCreate((v) => !v)} className="text-sm text-blue-600 mb-3">
        {showCreate ? "Cancel" : "New Project"}
      </button>
      {showCreate && (
        <form onSubmit={submitNew} className="space-y-2 mb-4">
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="w-full p-2 border rounded dark:bg-gray-800"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full p-2 border rounded dark:bg-gray-800"
            rows={2}
          />
          <button type="submit" className="bg-blue-600 text-white text-sm px-3 py-1 rounded w-full">
            Create
          </button>
        </form>
      )}
      {projects.map((p) => (
        <button
          key={p._id}
          onClick={() => onSelect(p._id)}
          className={`block w-full text-left px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${
            selectedId === p._id ? "bg-gray-200 dark:bg-gray-800" : ""
          }`}
        >
          {p.name}
        </button>
      ))}
    </aside>
  );
};

export default ProjectsSidebar; 