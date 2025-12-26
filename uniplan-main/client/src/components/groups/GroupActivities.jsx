import React, { useState } from 'react';
import { Calendar, Users, Lock, Plus } from 'lucide-react';

const GroupActivities = ({ members, currentUser }) => {
    const [activities, setActivities] = useState([
        { id: 1, title: 'Haftalık Toplantı', date: '2023-11-30 14:00', members: [101, 102, 103], description: 'Genel durum değerlendirmesi.' },
        { id: 2, title: 'Kod İnceleme', date: '2023-12-01 10:00', members: [101, 102], description: 'Frontend kodları incelenecek.' },
    ]);
    const [showModal, setShowModal] = useState(false);

    // New Activity State
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    const handleCreateActivity = () => {
        if (!newTitle || !newDate) return;
        const activity = {
            id: Date.now(),
            title: newTitle,
            date: newDate,
            members: selectedMembers.length > 0 ? selectedMembers : members.map(m => m.id), // Default all if none selected
            description: ''
        };
        setActivities([...activities, activity]);
        setShowModal(false);
        setNewTitle('');
        setNewDate('');
        setSelectedMembers([]);
    };

    const toggleMemberSelection = (id) => {
        if (selectedMembers.includes(id)) {
            setSelectedMembers(selectedMembers.filter(m => m !== id));
        } else {
            setSelectedMembers([...selectedMembers, id]);
        }
    };

    // Filter activities where current user is included
    const myActivities = activities.filter(a => a.members.includes(currentUser.id));

    return (
        <div className="group-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Aktiviteler</h3>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Yeni Aktivite
                </button>
            </div>

            <div className="groups-grid">
                {myActivities.map(activity => (
                    <div key={activity.id} className="group-card" style={{ cursor: 'default' }}>
                        <div className="group-card-header">
                            <div className="group-icon" style={{ background: 'var(--color-accent)', fontSize: '1.2rem' }}>
                                <Calendar size={24} />
                            </div>
                            <div className="group-info">
                                <h3>{activity.title}</h3>
                                <p>{activity.date}</p>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                            {activity.description || 'Açıklama yok.'}
                        </div>
                        <div className="group-members-preview">
                            {activity.members.map(mid => {
                                const m = members.find(mem => mem.id === mid);
                                return m ? (
                                    <div key={mid} className="member-avatar-sm" title={m.name}>
                                        {m.avatar}
                                    </div>
                                ) : null;
                            })}
                            <div style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                Sadece katılımcılar
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="calendar-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-date">Yeni Aktivite Oluştur</div>
                        </div>
                        <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                type="text"
                                className="modal-input"
                                placeholder="Aktivite Adı"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                            />
                            <input
                                type="datetime-local"
                                className="modal-input"
                                value={newDate}
                                onChange={e => setNewDate(e.target.value)}
                            />
                            <div>
                                <label style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Katılımcılar (Seçilmezse herkes)</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {members.map(m => (
                                        <div
                                            key={m.id}
                                            onClick={() => toggleMemberSelection(m.id)}
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                background: selectedMembers.includes(m.id) ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            {m.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button className="btn btn-primary" onClick={handleCreateActivity}>Oluştur</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupActivities;
