/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Pencil, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type FilterType = 'all' | 'pending' | 'completed';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Persist tasks to local storage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTasks([newTask, ...tasks]);
    setInputValue('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const saveEdit = () => {
    if (!editText.trim() || !editingId) return;
    setTasks(tasks.map(task => 
      task.id === editingId ? { ...task, text: editText.trim() } : task
    ));
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'pending': return tasks.filter(t => !t.completed);
      case 'completed': return tasks.filter(t => t.completed);
      default: return tasks;
    }
  }, [tasks, filter]);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans selection:bg-blue-100">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Tasks</h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Done</div>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={addTask} className="relative mb-8 group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add a new task..."
            className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-6 pr-16 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm group-hover:shadow-md"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Plus size={24} />
          </button>
        </form>

        {/* Filters */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(['all', 'pending', 'completed'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f 
                ? 'bg-gray-900 text-white shadow-md' 
                : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all ${
                    task.completed ? 'opacity-75' : ''
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`flex-shrink-0 transition-colors ${
                      task.completed ? 'text-green-500' : 'text-gray-300 hover:text-blue-500'
                    }`}
                  >
                    {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>

                  <div className="flex-grow min-w-0">
                    {editingId === task.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="w-full bg-gray-50 border-none focus:ring-0 text-lg py-0 px-0"
                        />
                        <button onClick={saveEdit} className="text-blue-600 hover:text-blue-700">
                          <Check size={20} />
                        </button>
                        <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-500">
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-lg truncate block transition-all ${
                        task.completed ? 'line-through text-gray-400' : 'text-gray-700'
                      }`}>
                        {task.text}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!task.completed && editingId !== task.id && (
                      <button
                        onClick={() => startEditing(task)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200"
              >
                <div className="text-gray-300 mb-4 flex justify-center">
                  <CheckCircle2 size={48} strokeWidth={1} />
                </div>
                <h3 className="text-gray-500 font-medium">No tasks found</h3>
                <p className="text-gray-400 text-sm">Enjoy your free time!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        {tasks.length > 0 && (
          <footer className="mt-12 text-center text-xs text-gray-400 font-medium uppercase tracking-widest">
            {stats.completed} of {stats.total} tasks completed
          </footer>
        )}
      </div>
    </div>
  );
}
