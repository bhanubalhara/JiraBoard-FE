import React from "react";
import { Task } from "../types";

interface Props {
  task: Task;
}

const TaskCard: React.FC<Props> = ({ task }) => {
  return (
    <div className="bg-white dark:bg-gray-700 p-3 rounded shadow mb-3">
      <h4 className="font-medium text-sm mb-1">{task.title}</h4>
      {task.description && (
        <p className="text-xs text-black dark:text-gray-400 truncate">{task.description}</p>
      )}
    </div>
  );
};

export default TaskCard; 