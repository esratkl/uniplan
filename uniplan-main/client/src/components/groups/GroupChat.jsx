import React, { useState, useRef, useEffect } from 'react';
import { Send, Users, Smile, Paperclip, MoreVertical, UserPlus, Settings } from 'lucide-react';
import '../../styles/Chat.css';

const GroupChat = ({ group, currentUser }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: 'Herkese merhaba! Proje ne durumda?',
            sender: 'other',
            senderName: 'Ali Yılmaz',
            senderAvatar: 'AY',
            time: '10:00',
            read: true
        },
        {
            id: 2,
            text: 'Ben tasarım kısmını bitirdim. Bugün akşam review yapabilir miyiz?',
            sender: 'me',
            time: '10:05',
            read: true
        },
        {
            id: 3,
            text: 'Süper! Ben de backend tarafına bakıyorum. Akşam uygun.',
            sender: 'other',
            senderName: 'Zeynep Demir',
            senderAvatar: 'ZD',
            time: '10:10',
            read: true
        },
        {
            id: 4,
            text: 'API entegrasyonu bitti mi?',
            sender: 'other',
            senderName: 'Mehmet Kaya',
            senderAvatar: 'MK',
            time: '10:15',
            read: false
        },
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState(['Ahmet']);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message = {
            id: Date.now(),
            text: newMessage,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false
        };
        setMessages([...messages, message]);
        setNewMessage('');
    };

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
        if (e.target.value.length > 0 && !isTyping) {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 2000);
        }
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Group members (mock data)
    const members = [
        { id: 1, name: 'Ali Yılmaz', avatar: 'AY', online: true },
        { id: 2, name: 'Zeynep Demir', avatar: 'ZD', online: true },
        { id: 3, name: 'Mehmet Kaya', avatar: 'MK', online: false },
        { id: 4, name: 'Ayşe Çelik', avatar: 'AÇ', online: true },
    ];

    return (
        <div className="chat-window">
            {/* Group Header */}
            <div className="chat-header">
                <div className="friend-avatar">
                    <div
                        className="avatar-img"
                        style={{
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                        }}
                    >
                        <Users size={24} />
                    </div>
                    <div className="status-indicator status-online"></div>
                </div>
                <div style={{ flex: 1 }}>
                    <div className="friend-name" style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                        {group?.name || 'Proje Grubu'}
                    </div>
                    <div style={{
                        fontSize: '0.85rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span>{members.length} üye</span>
                        <span>•</span>
                        <span>{members.filter(m => m.online).length} çevrimiçi</span>
                    </div>
                </div>

                {/* Member Avatars */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem' }}>
                    {members.slice(0, 4).map((member, index) => (
                        <div
                            key={member.id}
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                color: 'white',
                                border: '2px solid rgba(255, 255, 255, 0.2)',
                                marginLeft: index > 0 ? '-8px' : '0',
                                position: 'relative',
                                zIndex: members.length - index,
                                transition: 'transform 0.2s ease',
                                cursor: 'pointer'
                            }}
                            title={member.name}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.2) translateY(-2px)';
                                e.currentTarget.style.zIndex = '10';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.zIndex = String(members.length - index);
                            }}
                        >
                            {member.avatar}
                        </div>
                    ))}
                    {members.length > 4 && (
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                color: 'white',
                                border: '2px solid rgba(255, 255, 255, 0.2)',
                                marginLeft: '-8px',
                                cursor: 'pointer'
                            }}
                            title={`+${members.length - 4} daha`}
                        >
                            +{members.length - 4}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div className="icon-btn" title="Üye ekle">
                        <UserPlus size={20} />
                    </div>
                    <div className="icon-btn" title="Grup ayarları">
                        <Settings size={20} />
                    </div>
                    <div className="icon-btn" title="Daha fazla">
                        <MoreVertical size={20} />
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        style={{ alignItems: 'flex-start', gap: '0.75rem' }}
                    >
                        {/* Avatar for received messages */}
                        {msg.sender !== 'me' && (
                            <div
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    color: 'white',
                                    flexShrink: 0,
                                    marginTop: '0.5rem'
                                }}
                            >
                                {msg.senderAvatar}
                            </div>
                        )}

                        <div style={{ maxWidth: '70%' }}>
                            {msg.sender !== 'me' && (
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--chat-primary)',
                                    marginBottom: '0.25rem',
                                    marginLeft: '0.75rem',
                                    fontWeight: '600'
                                }}>
                                    {msg.senderName}
                                </div>
                            )}
                            <div className={`message ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                                <div>{msg.text}</div>
                                <div className="message-time" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{msg.time}</span>
                                    {msg.sender === 'me' && (
                                        <span style={{ marginLeft: '8px' }}>
                                            {msg.read ? '✓✓' : '✓'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Typing Indicator for Groups */}
                {typingUsers.length > 0 && (
                    <div className="typing-indicator">
                        <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                            {typingUsers.length === 1
                                ? `${typingUsers[0]} yazıyor`
                                : typingUsers.length === 2
                                    ? `${typingUsers[0]} ve ${typingUsers[1]} yazıyor`
                                    : `${typingUsers[0]} ve ${typingUsers.length - 1} kişi daha yazıyor`
                            }
                        </span>
                        <div className="typing-dots">
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-input-area">
                <form onSubmit={handleSendMessage} className="chat-input-wrapper">
                    <button
                        type="button"
                        className="icon-btn"
                        style={{
                            width: '36px',
                            height: '36px',
                            background: 'transparent',
                            border: 'none'
                        }}
                        title="Dosya ekle"
                    >
                        <Paperclip size={20} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                    </button>
                    <input
                        type="text"
                        className="chat-input"
                        placeholder="Gruba mesaj yaz..."
                        value={newMessage}
                        onChange={handleInputChange}
                    />
                    <button
                        type="button"
                        className="icon-btn"
                        style={{
                            width: '36px',
                            height: '36px',
                            background: 'transparent',
                            border: 'none'
                        }}
                        title="Emoji"
                    >
                        <Smile size={20} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                    </button>
                    <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                        <Send size={18} />
                        <span>Gönder</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GroupChat;
