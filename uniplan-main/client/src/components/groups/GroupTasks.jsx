import React, { useState } from 'react';
import { Plus, Check, Trash2, User } from 'lucide-react';
import '../../styles/Todo.css'; // Reusing Todo styles

const GroupTasks = ({ members, currentUserRole }) => {
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Sunum taslağını hazırla', assignedTo: 101, completed: false },
        { id: 2, text: 'Veritabanı şemasını çıkar', assignedTo: 102, completed: true },
    ]);
    const [newTask, setNewTask] = useState('');
    const [assignedMember, setAssignedMember] = useState('');

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        const task = {
            id: Date.now(),
            text: newTask,
            assignedTo: assignedMember ? Number(assignedMember) : null,
            completed: false
        };

        setTasks([...tasks, task]);
        setNewTask('');
        setAssignedMember('');
    };

    const toggleComplete = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const getMemberName = (id) => {
        const member = members.find(m => m.id === id);
        return member ? member.name : 'Atanmamış';
    };

    return (
        <div className="group-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Grup Görevleri</h3>
            </div>

            <form onSubmit={handleAddTask} className="task-input-container" style={{ gap: '10px' }}>
                <input
                    type="text"
                    className="task-input"
                    placeholder="Yeni görev..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                />
                <select
                    className="modal-input"
                    style={{ width: '150px', margin: 0 }}
                    value={assignedMember}
                    onChange={(e) => setAssignedMember(e.target.value)}
                >
                    <option value="">Kişi Ata</option>
                    {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
                <button type="submit" className="btn btn-primary"><Plus size={20} /></button>
            </form>

            <div className="task-list">
                {tasks.map(task => (
                    <div key={task.id} className="task-item">
                        <div
                            className={`task-checkbox ${task.completed ? 'completed' : ''}`}
                            onClick={() => toggleComplete(task.id)}
                        >
                            {task.completed && <Check size={16} color="white" />}
                        </div>
                        <div className="task-content">
                            <div className={`task-text ${task.completed ? 'completed' : ''}`}>
                                {task.text}
                            </div>
                            <div className="task-meta">
                                <div className="task-tag">
                                    <User size={12} /> {getMemberName(task.assignedTo)}
                                </div>
                            </div>
                        </div>
                        {currentUserRole === 'admin' && (
                            <div className="action-btn delete" onClick={() => deleteTask(task.id)}>
                                <Trash2 size={18} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupTasks;
