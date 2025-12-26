import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, CheckSquare, Calendar, Settings } from 'lucide-react';
import GroupChat from '../components/groups/GroupChat';
import GroupTasks from '../components/groups/GroupTasks';
import GroupActivities from '../components/groups/GroupActivities';
import GroupSettings from '../components/groups/GroupSettings';
import '../styles/Groups.css';

const GroupDetailPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('chat');

    // Mock Data
    const group = {
        id: groupId,
        name: 'Proje Ekibi',
        password: '123',
        description: 'Bitirme projesi için çalışma grubu.'
    };

    const currentUser = { id: 101, name: 'Ahmet', avatar: 'AH' };

    const [members, setMembers] = useState([
        { id: 101, name: 'Ahmet', username: 'ahmet', avatar: 'AH', role: 'admin' },
        { id: 102, name: 'Ali', username: 'ali', avatar: 'AL', role: 'member' },
        { id: 103, name: 'Zeynep', username: 'zeynep', avatar: 'ZE', role: 'member' },
    ]);

    const currentUserRole = members.find(m => m.id === currentUser.id)?.role || 'member';

    const handleUpdateRole = (memberId, newRole) => {
        setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    };

    return (
        <div className="group-detail-container">
            <div className="group-detail-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="icon-btn" onClick={() => navigate('/dashboard/groups')}>
                        <ArrowLeft size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{group.name}</h1>
                        <p style={{ color: 'var(--color-text-muted)' }}>{members.length} Üye</p>
                    </div>
                </div>
            </div>

            <div className="group-tabs">
                <div className={`group-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageCircle size={18} /> Sohbet
                    </div>
                </div>
                <div className={`group-tab ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckSquare size={18} /> Görevler
                    </div>
                </div>
                <div className={`group-tab ${activeTab === 'activities' ? 'active' : ''}`} onClick={() => setActiveTab('activities')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={18} /> Aktiviteler
                    </div>
                </div>
                <div className={`group-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Settings size={18} /> Ayarlar
                    </div>
                </div>
            </div>

            <div className="group-content">
                {activeTab === 'chat' && <GroupChat group={group} currentUser={currentUser} />}
                {activeTab === 'tasks' && <GroupTasks members={members} currentUserRole={currentUserRole} />}
                {activeTab === 'activities' && <GroupActivities members={members} currentUser={currentUser} />}
                {activeTab === 'settings' && (
                    <GroupSettings
                        group={group}
                        members={members}
                        currentUserRole={currentUserRole}
                        onUpdateRole={handleUpdateRole}
                    />
                )}
            </div>
        </div>
    );
};

export default GroupDetailPage;
