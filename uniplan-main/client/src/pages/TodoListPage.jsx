import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Check, Trash2, Star, Clock, Calendar as CalendarIcon, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Todo.css';

const TodoListPage = () => {
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Proje sunumunu hazırla', completed: false, category: 'work', type: 'important', date: 'Bugün', column: 'important' },
        { id: 2, text: 'Uçak biletlerini al', completed: false, category: 'travel', type: 'upcoming', date: 'Yarın', column: 'upcoming' },
        { id: 3, text: 'Annemle kahve iç', completed: true, category: 'social', type: 'normal', date: 'Dün', column: 'other' },
        { id: 4, text: 'Market alışverişi', completed: false, category: 'other', type: 'normal', date: 'Bugün', column: 'other' },
        { id: 5, text: 'Doğum günü hediyesi al', completed: false, category: 'special', type: 'upcoming', date: 'Haftaya', column: 'upcoming' },
    ]);

    const [newTask, setNewTask] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskColumn, setNewTaskColumn] = useState('upcoming');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [draggedTask, setDraggedTask] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    // Gantt Chart State - localStorage'dan oku
    const [ganttTasks, setGanttTasks] = useState(() => {
        const saved = localStorage.getItem('ganttTasks');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return [];
            }
        }
        return [];
    });
    const [ganttForm, setGanttForm] = useState({ name: '', start: '', end: '' });
    const [selectedColor, setSelectedColor] = useState('#8b5cf6');
    const [rgb, setRgb] = useState({ r: 139, g: 92, b: 246 });

    // Gantt görevlerini localStorage'a kaydet
    useEffect(() => {
        localStorage.setItem('ganttTasks', JSON.stringify(ganttTasks));
    }, [ganttTasks]);

    const categories = [
        { id: 'work', name: 'Çalışma', icon: '💼' },
        { id: 'special', name: 'Özel', icon: '⭐' },
        { id: 'daily', name: 'Günlük', icon: '📅' },
        { id: 'travel', name: 'Seyahat', icon: '✈️' },
        { id: 'social', name: 'Sosyal', icon: '👥' },
        { id: 'other', name: 'Diğer', icon: '📌' },
    ];

    const handleToggleCategory = (catId) => {
        if (selectedCategories.includes(catId)) {
            setSelectedCategories(selectedCategories.filter(id => id !== catId));
        } else {
            setSelectedCategories([...selectedCategories, catId]);
        }
    };

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        const task = {
            id: Date.now(),
            text: newTask,
            description: newTaskDescription,
            completed: false,
            category: 'other',
            type: newTaskColumn === 'upcoming' ? 'upcoming' : newTaskColumn === 'important' ? 'important' : 'normal',
            date: 'Bugün',
            column: newTaskColumn
        };

        setTasks([task, ...tasks]);
        setNewTask('');
        setNewTaskDescription('');
        setNewTaskColumn('upcoming');
    };

    const toggleComplete = (id) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
        e.target.style.opacity = '0.5';
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedTask(null);
        setDragOverColumn(null);
    };

    const handleDragOver = (e, column) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(column);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = (e, targetColumn) => {
        e.preventDefault();
        if (draggedTask && draggedTask.column !== targetColumn) {
            setTasks(tasks.map(task =>
                task.id === draggedTask.id ? { ...task, column: targetColumn } : task
            ));
        }
        setDraggedTask(null);
        setDragOverColumn(null);
    };

    const filteredTasks = tasks.filter(task => {
        if (selectedCategories.length === 0) return true;
        return selectedCategories.includes(task.category);
    });

    const incompleteTasks = filteredTasks.filter(t => !t.completed);
    const completedTasks = filteredTasks.filter(t => t.completed);

    const upcomingTasks = incompleteTasks.filter(t => t.column === 'upcoming');
    const importantTasks = incompleteTasks.filter(t => t.column === 'important');
    const otherTasks = incompleteTasks.filter(t => t.column === 'other');

    const completionRate = filteredTasks.length > 0
        ? Math.round((completedTasks.length / filteredTasks.length) * 100)
        : 0;

    const columns = [
        { id: 'upcoming', title: 'Yaklaşan Görevler', tasks: upcomingTasks, icon: Clock, color: '#ef4444', bgColor: '#fef2f2' },
        { id: 'important', title: 'Önemli Görevler', tasks: importantTasks, icon: Star, color: '#f59e0b', bgColor: '#fffbeb' },
        { id: 'other', title: 'Diğer Görevler', tasks: otherTasks, icon: CalendarIcon, color: '#3b82f6', bgColor: '#eff6ff' },
    ];

    // Gantt Chart Helper Functions
    const quickColors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

    const updateRgbFromHex = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        setRgb({ r, g, b });
    };

    const hexFromRgb = (r, g, b) =>
        '#' +
        [r, g, b]
            .map((c) => {
                const h = c.toString(16);
                return h.length === 1 ? '0' + h : h;
            })
            .join('');

    const adjustColorBrightness = (hex, percent) => {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + percent));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + percent));
        const b = Math.max(0, Math.min(255, (num & 0x0000ff) + percent));
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    };

    const datesForTimeline = useMemo(() => {
        if (ganttTasks.length === 0) return [];
        const dates = ganttTasks.flatMap((t) => [new Date(t.start), new Date(t.end)]);
        const min = new Date(Math.min(...dates));
        const max = new Date(Math.max(...dates));
        const days = Math.ceil((max - min) / (1000 * 60 * 60 * 24)) + 1;
        return Array.from({ length: days }, (_, i) => {
            const d = new Date(min);
            d.setDate(d.getDate() + i);
            return d;
        });
    }, [ganttTasks]);

    const minDate = useMemo(() => {
        if (ganttTasks.length === 0) return null;
        return new Date(Math.min(...ganttTasks.map((t) => new Date(t.start))));
    }, [ganttTasks]);

    const handleGanttSubmit = (e) => {
        e.preventDefault();
        if (!ganttForm.name.trim() || !ganttForm.start || !ganttForm.end) {
            alert('Lütfen tüm alanları doldurun');
            return;
        }
        if (new Date(ganttForm.start) > new Date(ganttForm.end)) {
            alert('Başlangıç tarihi bitiş tarihinden sonra olamaz');
            return;
        }
        const newGanttTask = {
            id: `g-${Date.now()}`,
            name: ganttForm.name.trim(),
            start: ganttForm.start,
            end: ganttForm.end,
            color: selectedColor,
        };
        setGanttTasks((prev) => [...prev, newGanttTask]);
        setGanttForm({ name: '', start: '', end: '' });
    };

    const handleDeleteGantt = (id) => {
        setGanttTasks((prev) => prev.filter((t) => t.id !== id));
    };

    const handleRgbChange = (channel, value) => {
        const val = Number(value);
        const next = { ...rgb, [channel]: val };
        setRgb(next);
        const hex = hexFromRgb(next.r, next.g, next.b);
        setSelectedColor(hex);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    return (
        <motion.div
            className="todo-page-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div className="todo-page-header" variants={itemVariants}>
                <div>
                    <h1 className="todo-page-title">Görevler</h1>
                    <p className="todo-page-subtitle">Görevlerinizi düzenleyin ve yönetin</p>
                </div>
            </motion.div>

            {/* Stats Bar */}
            <motion.div className="stats-bar" variants={itemVariants}>
                <div className="stat-card-compact">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #14b8a6)' }}>
                        <CalendarIcon size={20} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value-compact">{filteredTasks.length}</div>
                        <div className="stat-label-compact">Toplam</div>
                    </div>
                </div>

                <div className="stat-card-compact">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                        <Check size={20} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value-compact">{completedTasks.length}</div>
                        <div className="stat-label-compact">Biten</div>
                    </div>
                </div>

                <div className="stat-card-compact">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fb923c)' }}>
                        <Clock size={20} color="white" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value-compact">{incompleteTasks.length}</div>
                        <div className="stat-label-compact">Kalan</div>
                    </div>
                </div>

                <div className="stat-card-compact completion">
                    <div className="completion-circle">
                        <svg width="60" height="60" viewBox="0 0 60 60">
                            <circle cx="30" cy="30" r="25" fill="none" stroke="#e5e7eb" strokeWidth="6"/>
                            <circle
                                cx="30"
                                cy="30"
                                r="25"
                                fill="none"
                                stroke="url(#progressGradient)"
                                strokeWidth="6"
                                strokeDasharray="157"
                                strokeDashoffset={157 - (157 * completionRate) / 100}
                                strokeLinecap="round"
                                transform="rotate(-90 30 30)"
                            />
                            <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#14b8a6" />
                                </linearGradient>
                            </defs>
                            <text x="30" y="35" textAnchor="middle" className="completion-text">{completionRate}%</text>
                        </svg>
                    </div>
                    <div className="stat-label-compact">Tamamlandı</div>
                </div>
            </motion.div>

            {/* Categories Filter */}
            <motion.div className="categories-filter" variants={itemVariants}>
                <div className="filter-title">Kategoriler</div>
                <div className="categories-grid">
                    {categories.map((category) => (
                        <motion.button
                            key={category.id}
                            className={`category-chip ${selectedCategories.includes(category.id) ? 'active' : ''}`}
                            onClick={() => handleToggleCategory(category.id)}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="category-icon">{category.icon}</span>
                            <span className="category-name">{category.name}</span>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Add Task Form */}
            <motion.form onSubmit={handleAddTask} className="add-task-form" variants={itemVariants}>
                <div className="form-row">
                    <input
                        type="text"
                        className="task-input-field"
                        placeholder="Görev başlığı"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        required
                    />
                    <select
                        className="task-select-field"
                        value={newTaskColumn}
                        onChange={(e) => setNewTaskColumn(e.target.value)}
                    >
                        <option value="upcoming">Yaklaşan Görevler</option>
                        <option value="important">Önemli Görevler</option>
                        <option value="other">Diğer Görevler</option>
                    </select>
                </div>
                <textarea
                    className="task-textarea-field"
                    placeholder="Görev açıklaması (opsiyonel)"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    rows="2"
                />
                <motion.button
                    type="submit"
                    className="add-task-button"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Plus size={20} />
                    Görev Ekle
                </motion.button>
            </motion.form>

            {/* Kanban Board */}
            <motion.div className="kanban-board-new" variants={itemVariants}>
                {columns.map((column) => (
                    <div
                        key={column.id}
                        className={`kanban-column-new ${dragOverColumn === column.id ? 'drag-over' : ''}`}
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, column.id)}
                    >
                        <div className="column-header-new" style={{
                            borderColor: column.color,
                            background: column.bgColor
                        }}>
                            <div className="column-title-group">
                                <column.icon size={18} style={{ color: column.color }} />
                                <h2 className="column-title" style={{ color: column.color }}>{column.title}</h2>
                            </div>
                            <span className="task-count-badge" style={{
                                background: column.color,
                                color: 'white'
                            }}>
                                {column.tasks.length}
                            </span>
                        </div>
                        <div className="tasks-container-new">
                            <AnimatePresence>
                                {column.tasks.length === 0 ? (
                                    <div className="empty-state">Henüz görev yok</div>
                                ) : (
                                    column.tasks.map(task => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onToggle={toggleComplete}
                                            onDelete={deleteTask}
                                            onDragStart={handleDragStart}
                                            onDragEnd={handleDragEnd}
                                            color={column.color}
                                        />
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
                <motion.div className="completed-section" variants={itemVariants}>
                    <div className="completed-header">
                        <Check size={18} />
                        Tamamlananlar ({completedTasks.length})
                    </div>
                    <div className="completed-tasks-grid">
                        <AnimatePresence>
                            {completedTasks.map(task => (
                                <motion.div
                                    key={task.id}
                                    className="completed-task-card"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    layout
                                >
                                    <div
                                        className="task-checkbox completed"
                                        onClick={() => toggleComplete(task.id)}
                                    >
                                        <Check size={14} color="white" />
                                    </div>
                                    <div className="task-content-completed">
                                        <div className="task-text completed">{task.text}</div>
                                        <div className="task-meta-small">
                                            <CalendarIcon size={12} /> {task.date}
                                        </div>
                                    </div>
                                    <button
                                        className="delete-btn-small"
                                        onClick={() => deleteTask(task.id)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}

            {/* Gantt Chart Section */}
            <motion.div className="gantt-section" variants={itemVariants}>
                <div className="gantt-container">
                    <div className="gantt-form-section">
                        <div className="gantt-header">
                            <div className="gantt-icon-wrapper">
                                📊
                            </div>
                            <div>
                                <p className="gantt-subtitle">Gantt Şeması</p>
                                <h2 className="gantt-title">Zaman Çizelgesi</h2>
                            </div>
                        </div>

                        <form onSubmit={handleGanttSubmit} className="gantt-form">
                            <input
                                type="text"
                                value={ganttForm.name}
                                onChange={(e) => setGanttForm({ ...ganttForm, name: e.target.value })}
                                placeholder="Görev adı"
                                className="gantt-input"
                                required
                            />
                            <div className="gantt-date-inputs">
                                <input
                                    type="date"
                                    value={ganttForm.start}
                                    onChange={(e) => setGanttForm({ ...ganttForm, start: e.target.value })}
                                    className="gantt-date-input"
                                    required
                                />
                                <input
                                    type="date"
                                    value={ganttForm.end}
                                    onChange={(e) => setGanttForm({ ...ganttForm, end: e.target.value })}
                                    className="gantt-date-input"
                                    required
                                />
                            </div>
                            <div className="gantt-color-section">
                                <div className="gantt-quick-colors">
                                    {quickColors.map((c) => (
                                        <button
                                            type="button"
                                            key={c}
                                            onClick={() => {
                                                setSelectedColor(c);
                                                updateRgbFromHex(c);
                                            }}
                                            className={`gantt-color-btn ${selectedColor === c ? 'active' : ''}`}
                                            style={{ background: c }}
                                        />
                                    ))}
                                </div>
                                <div className="gantt-color-preview">
                                    <div className="gantt-color-display" style={{ background: selectedColor }} />
                                    <div className="gantt-rgb-sliders">
                                        {['r', 'g', 'b'].map((channel) => (
                                            <div key={channel} className="gantt-slider-group">
                                                <div className="gantt-slider-header">
                                                    <span className="gantt-slider-label">{channel.toUpperCase()}</span>
                                                    <span className="gantt-slider-value">{rgb[channel]}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="255"
                                                    value={rgb[channel]}
                                                    onChange={(e) => handleRgbChange(channel, e.target.value)}
                                                    className="gantt-slider"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <motion.button
                                type="submit"
                                className="gantt-add-button"
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Plus size={18} /> Görev ekle
                            </motion.button>
                        </form>
                    </div>

                    <div className="gantt-timeline-section">
                        {ganttTasks.length === 0 ? (
                            <div className="gantt-empty-state">
                                <div className="gantt-empty-icon">📊</div>
                                <p>İlk Gantt görevini ekle.</p>
                            </div>
                        ) : (
                            <div className="gantt-timeline">
                                <div className="gantt-timeline-header">
                                    <div className="gantt-task-column">Görev</div>
                                    <div className="gantt-dates-column">
                                        <div className="gantt-dates-grid" style={{ gridTemplateColumns: `repeat(${datesForTimeline.length}, minmax(60px, 1fr))` }}>
                                            {datesForTimeline.map((d, idx) => (
                                                <div key={idx} className="gantt-date-cell">
                                                    {d.getDate()}/{d.getMonth() + 1}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {ganttTasks.map((task) => {
                                    const startOffset = minDate ? Math.ceil((new Date(task.start) - minDate) / (1000 * 60 * 60 * 24)) : 0;
                                    const duration = Math.ceil((new Date(task.end) - new Date(task.start)) / (1000 * 60 * 60 * 24)) + 1;
                                    const darker = adjustColorBrightness(task.color, -25);

                                    return (
                                        <div key={task.id} className="gantt-timeline-row">
                                            <div className="gantt-task-info">
                                                <div>
                                                    <div className="gantt-task-name">{task.name}</div>
                                                    <div className="gantt-task-dates">
                                                        📅 {duration} gün · {task.start} - {task.end}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteGantt(task.id)}
                                                    className="gantt-delete-btn"
                                                >
                                                    Sil
                                                </button>
                                            </div>
                                            <div className="gantt-bar-container">
                                                <div className="gantt-grid-bg" />
                                                <div
                                                    className="gantt-bar"
                                                    style={{
                                                        left: `calc(${startOffset} * 60px)`,
                                                        width: `calc(${duration} * 60px)`,
                                                        background: `linear-gradient(135deg, ${task.color} 0%, ${darker} 100%)`,
                                                    }}
                                                >
                                                    <span className="gantt-bar-label">{task.name}</span>
                                                    <span className="gantt-bar-shimmer" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const TaskCard = ({ task, onToggle, onDelete, onDragStart, onDragEnd, color }) => {
    return (
        <motion.div
            className="task-card-new"
            draggable
            onDragStart={(e) => onDragStart(e, task)}
            onDragEnd={onDragEnd}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -2, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
            style={{ borderLeftColor: color }}
            layout
        >
            <div className="task-card-header">
                <div
                    className={`task-checkbox ${task.completed ? 'completed' : ''}`}
                    onClick={() => onToggle(task.id)}
                    style={{
                        borderColor: task.completed ? '#10b981' : color
                    }}
                >
                    {task.completed && <Check size={14} color="white" />}
                </div>
                <GripVertical size={16} className="drag-handle" />
            </div>
            <h3 className={`task-card-title ${task.completed ? 'completed' : ''}`}>
                {task.text}
            </h3>
            {task.description && (
                <p className="task-card-description">{task.description}</p>
            )}
            <div className="task-card-footer">
                <div className="task-date">
                    <CalendarIcon size={12} />
                    <span>{task.date}</span>
                </div>
                <button
                    className="delete-btn"
                    onClick={() => onDelete(task.id)}
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </motion.div>
    );
};

export default TodoListPage;
