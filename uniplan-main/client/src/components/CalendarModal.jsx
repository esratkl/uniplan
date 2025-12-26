import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import '../styles/Calendar.css';

const CalendarModal = ({ isOpen, onClose, date, initialData, onSave }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState(null);

    const emojis = ['📅', '🎉', '💼', '✈️', '🎂', '💪', '📚', '❤️'];

    useEffect(() => {
        if (isOpen && initialData) {
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
            setSelectedEmoji(initialData.emoji || null);
        } else {
            setTitle('');
            setDescription('');
            setSelectedEmoji(null);
        }
    }, [isOpen, initialData]);

    const handleSave = () => {
        onSave(date, { title, description, emoji: selectedEmoji });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="calendar-modal"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <div className="modal-date">
                            {date ? new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                        </div>
                        <div className="modal-close" onClick={onClose}>
                            <X size={24} />
                        </div>
                    </div>

                    <div className="modal-body">
                        <div className="modal-input-group">
                            <label className="modal-label">Günün Modu (Emoji Seç)</label>
                            <div className="emoji-selector">
                                {emojis.map((emoji) => (
                                    <div
                                        key={emoji}
                                        className={`emoji-btn ${selectedEmoji === emoji ? 'selected' : ''}`}
                                        onClick={() => setSelectedEmoji(emoji)}
                                    >
                                        {emoji}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="modal-input-group">
                            <label className="modal-label">Başlık</label>
                            <input
                                type="text"
                                className="modal-input"
                                placeholder="Bugün ne planlıyorsun?"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="modal-input-group">
                            <label className="modal-label">Açıklama / Notlar</label>
                            <textarea
                                className="modal-textarea"
                                placeholder="Detayları buraya yazabilirsin..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-ghost" onClick={onClose}>İptal</button>
                        <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Save size={18} /> Kaydet
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CalendarModal;
