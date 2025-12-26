import React from 'react';
import { Briefcase, Plane, Calendar, Coffee, MoreHorizontal } from 'lucide-react';
import '../styles/Todo.css';

const TodoFilter = ({ selectedCategories, onToggleCategory }) => {
    const categories = [
        { id: 'work', label: 'Çalışma', icon: Briefcase },
        { id: 'travel', label: 'Seyahat', icon: Plane },
        { id: 'special', label: 'Özel Günler', icon: Calendar },
        { id: 'social', label: 'Sosyal', icon: Coffee },
        { id: 'other', label: 'Diğer', icon: MoreHorizontal },
    ];

    return (
        <div className="filter-section">
            <h3 className="filter-title">Kategoriler</h3>
            <div className="category-grid">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className={`category-btn ${selectedCategories.includes(cat.id) ? 'active' : ''}`}
                        onClick={() => onToggleCategory(cat.id)}
                    >
                        <cat.icon size={20} />
                        <span>{cat.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TodoFilter;
