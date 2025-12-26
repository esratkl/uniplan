import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import {
    Send, Search, Users, UserPlus, X, Check, Plus,
    MessageCircle, LogIn, MoreVertical, Phone, Video,
    Smile, Paperclip

    , ArrowLeft, Settings, Moon, Sun, Palette,
    Crown, UserMinus, Bell, BellOff, Shield, Sparkles, Star, Hash,
    Image, Mic, AtSign, Link2, PhoneOff, Ban, Trash2, LogOut
} from 'lucide-react';
import io from 'socket.io-client';
import { groupAPI, userAPI } from '../services/api';
import '../styles/GroupsEnhanced.css';

const API_URL = process.env.REACT_APP_API_URL || window.location.origin;

// Wallpaper options with images
const WALLPAPERS = [
    { id: 'default', name: 'Varsayılan', type: 'gradient', value: 'transparent' },
    { id: 'mountains', name: 'Dağlar', type: 'image', value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80' },
    { id: 'ocean', name: 'Okyanus', type: 'image', value: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80' },
    { id: 'forest', name: 'Orman', type: 'image', value: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80' },
    { id: 'galaxy', name: 'Galaksi', type: 'image', value: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80' },
    { id: 'sunset', name: 'Gün Batımı', type: 'image', value: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80' },
    { id: 'city', name: 'Şehir', type: 'image', value: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=80' },
    { id: 'aurora', name: 'Kuzey Işıkları', type: 'image', value: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80' },
];

// Color themes with gradients
const COLOR_THEMES = [
    { id: 'purple', name: 'Mor', primary: '#8b5cf6', secondary: '#6366f1', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #a855f7 100%)' },
    { id: 'blue', name: 'Mavi', primary: '#3b82f6', secondary: '#0ea5e9', gradient: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 50%, #06b6d4 100%)' },
    { id: 'green', name: 'Yeşil', primary: '#22c55e', secondary: '#10b981', gradient: 'linear-gradient(135deg, #22c55e 0%, #10b981 50%, #14b8a6 100%)' },
    { id: 'pink', name: 'Pembe', primary: '#ec4899', secondary: '#f472b6', gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f43f5e 100%)' },
    { id: 'orange', name: 'Turuncu', primary: '#f97316', secondary: '#fb923c', gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%)' },
    { id: 'red', name: 'Kırmızı', primary: '#ef4444', secondary: '#f87171', gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 50%, #dc2626 100%)' },
    { id: 'teal', name: 'Turkuaz', primary: '#14b8a6', secondary: '#2dd4bf', gradient: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 50%, #0d9488 100%)' },
    { id: 'indigo', name: 'İndigo', primary: '#6366f1', secondary: '#818cf8', gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #4f46e5 100%)' },
];

// Emoji categories
const EMOJI_CATEGORIES = {
    smileys: { icon: '😀', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😍', '🥰', '😘', '😎', '🤩', '🥳', '😏', '🤔', '😴', '🤯'] },
    emotions: { icon: '❤️', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❤️‍🔥', '💕', '💖', '😈', '👿', '💀', '👻', '👽', '🤖', '😺', '😻'] },
    gestures: { icon: '👋', emojis: ['👋', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👍', '👎', '✊', '👊', '👏', '🙌', '🤝', '🙏', '💪', '✍️', '🤳'] },
    objects: { icon: '🎉', emojis: ['🎉', '🎊', '🎁', '🎈', '🎮', '🎧', '🎼', '📱', '💻', '💰', '💎', '🔑', '📷', '🎥', '⏰', '💡', '📚', '✏️'] },
    nature: { icon: '🌸', emojis: ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🦁', '🐸', '🌸', '🌹', '🌻', '🍀', '🌴', '☀️', '🌙', '⭐', '🌈', '🔥', '💧', '🌊'] },
    food: { icon: '🍕', emojis: ['🍎', '🍕', '🍔', '🍟', '🌭', '🍿', '🍦', '🎂', '🍩', '☕', '🍺', '🥤', '🍷'] },
    symbols: { icon: '💯', emojis: ['💯', '✅', '❌', '❓', '❗', '💢', '💥', '💫', '💬', '💭', '🔴', '🟢', '🔵', '🟣', '⭐', '✨'] },
};

// Stickers with categories
const STICKERS = [
    { id: 's1', name: 'Mutlu', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', category: 'happy' },
    { id: 's2', name: 'Thumbs Up', url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif', category: 'gesture' },
    { id: 's3', name: 'Kalp', url: 'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif', category: 'love' },
    { id: 's4', name: 'Kutlama', url: 'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif', category: 'happy' },
    { id: 's5', name: 'LOL', url: 'https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif', category: 'funny' },
    { id: 's6', name: 'Dans', url: 'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif', category: 'fun' },
    { id: 's7', name: 'Cool', url: 'https://media.giphy.com/media/62PP2yEIAZF6g/giphy.gif', category: 'cool' },
    { id: 's8', name: 'Wow', url: 'https://media.giphy.com/media/udmx3pgdiD7tm/giphy.gif', category: 'reaction' },
    { id: 's9', name: 'Evet!', url: 'https://media.giphy.com/media/l2JJKs3I69qfaQleE/giphy.gif', category: 'gesture' },
    { id: 's10', name: 'Hayır', url: 'https://media.giphy.com/media/3o7TKwmnDgQb5jemjK/giphy.gif', category: 'gesture' },
    { id: 's11', name: 'Teşekkür', url: 'https://media.giphy.com/media/osjgQPWRx3cac/giphy.gif', category: 'happy' },
    { id: 's12', name: 'Parti', url: 'https://media.giphy.com/media/l0MYJnJQ4EiYLxvQ4/giphy.gif', category: 'fun' },
    { id: 's13', name: 'Hi', url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', category: 'greeting' },
    { id: 's14', name: 'Aşk', url: 'https://media.giphy.com/media/l4pTdcifPZLpDjL1e/giphy.gif', category: 'love' },
    { id: 's15', name: 'Heyecanlı', url: 'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif', category: 'reaction' },
    { id: 's16', name: 'Üzgün', url: 'https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif', category: 'sad' },
];

// Mock database of all users to search from
const PREDEFINED_USERS = [
    { id: 'u1', name: 'Sibel Kaya', avatar: 'SK', status: 'Müsait', role: 'member' },
    { id: 'u2', name: 'Ahmet Yılmaz', avatar: 'AY', status: 'Meşgul', role: 'member' },
    { id: 'u3', name: 'Sibel Demir', avatar: 'SD', status: 'Toplantıda', role: 'member' },
    { id: 'u4', name: 'Canan Yıldız', avatar: 'CY', status: 'Müsait', role: 'member' },
    { id: 'u5', name: 'Barış Özkan', avatar: 'BÖ', status: 'Dışarıda', role: 'member' },
    { id: 'u6', name: 'Sibel Öztürk', avatar: 'SÖ', status: 'Çevrimiçi', role: 'member' },
    { id: 'u7', name: 'Murat Çelik', avatar: 'MÇ', status: 'Kod yazıyor', role: 'member' },
];

const GroupsPage = () => {
    const { user } = useAuth();

    // Add null check for user
    if (!user) return <div className="loading-screen">Yükleniyor...</div>;

    // Theme & Customization
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [selectedWallpaper, setSelectedWallpaper] = useState('default');
    const [selectedColorTheme, setSelectedColorTheme] = useState('blue');
    const [showSettings, setShowSettings] = useState(false);

    // Options Menu
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [mutedGroups, setMutedGroups] = useState([]);

    // Groups & Selection
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);

    // Socket.IO
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Call States
    const [showCallModal, setShowCallModal] = useState(false);
    const [callType, setCallType] = useState('voice'); // 'voice' or 'video'
    const [callStatus, setCallStatus] = useState('calling'); // 'calling', 'connected', 'ended'
    const [callDuration, setCallDuration] = useState(0);
    const localVideoRef = useRef(null);

    // Messages
    const [messages, setMessages] = useState({});
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null); // Fixed: Missing inputRef

    // Emoji & Stickers
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiTab, setEmojiTab] = useState('emoji');
    const [emojiCategory, setEmojiCategory] = useState('smileys');
    const [favoriteEmojis, setFavoriteEmojis] = useState(['😀', '❤️', '👍', '🎉', '🔥', '😂', '✅', '💯', '🙏', '✨']);
    const fileInputRef = useRef(null);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [newGroupPassword, setNewGroupPassword] = useState('');
    const [joinGroupName, setJoinGroupName] = useState('');
    const [joinGroupPassword, setJoinGroupPassword] = useState('');

    // Mock members - PER GROUP STATE
    const [groupMembers, setGroupMembers] = useState({});
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [activeMemberMenu, setActiveMemberMenu] = useState(null);
    const [memberMenuPosition, setMemberMenuPosition] = useState({ top: 0, left: 0 });

    // Add member
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [newMemberName, setNewMemberName] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: null,
        title: '',
        message: '',
        data: null
    });

    // Current theme
    const currentTheme = COLOR_THEMES.find(t => t.id === selectedColorTheme) || COLOR_THEMES[0];
    const currentWallpaper = WALLPAPERS.find(w => w.id === selectedWallpaper) || WALLPAPERS[0];

    // Derived state for filtered members
    const currentGroupMembers = selectedGroup ? (groupMembers[selectedGroup.id] || []) : [];
    const filteredMembers = currentGroupMembers.filter(member =>
        (member.name || '').toLowerCase().includes((memberSearchQuery || '').toLowerCase())
    );

    // ============================================
    // SOCKET.IO & API INTEGRATION (PRESERVED FROM ORIGINAL)
    // ============================================

    // Initialize Socket.IO
    useEffect(() => {
        if (!user) return;

        const socketUrl = API_URL || window.location.origin;
        const newSocket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        newSocket.on('connect', () => {
            console.log('✅ Socket connected:', newSocket.id);
            setIsConnected(true);
            newSocket.emit('user_connected', { userId: user.id });
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setIsConnected(false);
        });

        // Listen for group messages
        newSocket.on('receive_group_message', (message) => {
            console.log('📨 Received group message:', message);

            // If message is for the currently selected group, add it to messages
            if (selectedGroup && message.groupId === selectedGroup.id) {
                setMessages(prev => ({
                    ...prev,
                    [message.groupId]: [...(prev[message.groupId] || []), message]
                }));
            }

            // Update group list
            loadGroups();
        });

        // Listen for group message deletion
        newSocket.on('group_message_deleted', ({ messageId, groupId }) => {
            if (selectedGroup && selectedGroup.id === groupId) {
                setMessages(prev => ({
                    ...prev,
                    [groupId]: (prev[groupId] || []).filter(msg => msg.id !== messageId)
                }));
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [user]);

    // Load groups on mount
    useEffect(() => {
        if (user) {
            loadGroups();
            loadAllUsers();
        }
    }, [user]);

    // Join group room when selected group changes
    useEffect(() => {
        if (socket && selectedGroup) {
            socket.emit('join_group', { groupId: selectedGroup.id });
            loadMessages(selectedGroup.id);
            loadGroupMembers(selectedGroup.id);

            return () => {
                socket.emit('leave_group', { groupId: selectedGroup.id });
            };
        }
    }, [socket, selectedGroup]);

    const loadGroups = async () => {
        try {
            const data = await groupAPI.getAll();
            setGroups(data);
        } catch (error) {
            console.error('Failed to load groups:', error);
        }
    };

    const loadAllUsers = async () => {
        try {
            const data = await userAPI.getAll();
            setAllUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    const loadGroupMembers = async (groupId) => {
        try {
            const groupData = await groupAPI.get(groupId);
            if (groupData && groupData.members) {
                console.log('Group Members Loaded:', groupData.members);
                console.log('Current User ID:', user.id);
                const me = groupData.members.find(m => String(m.id) === String(user.id));
                console.log('My Role in this group:', me?.role);

                setGroupMembers(prev => ({
                    ...prev,
                    [groupId]: groupData.members
                }));
            }
        } catch (error) {
            console.error('Failed to load group members:', error);
        }
    };

    const loadMessages = async (groupId) => {
        try {
            const data = await groupAPI.getMessages(groupId);
            setMessages(prev => ({ ...prev, [groupId]: data }));
        } catch (error) {
            console.error('Failed to load messages:', error);
            setMessages(prev => ({ ...prev, [groupId]: [] }));
        }
    };

    const createGroup = async () => {
        if (!newGroupName.trim()) return;

        try {
            const group = await groupAPI.create(
                newGroupName.trim(),
                newGroupDescription.trim(),
                currentTheme.primary
            );
            await loadGroups();
            setSelectedGroup(group);
            setShowCreateModal(false);
            setNewGroupName('');
            setNewGroupDescription('');
        } catch (error) {
            console.error('Failed to create group:', error);
        }
    };

    const addMember = async (userId) => {
        if (!selectedGroup) return;

        try {
            await groupAPI.addMember(selectedGroup.id, userId);
            // Reload group details
            const updatedGroup = await groupAPI.get(selectedGroup.id);
            setSelectedGroup(updatedGroup);
            loadGroups();
        } catch (error) {
            console.error('Failed to add member:', error);
        }
    };

    const sendMessage = () => {
        if (!inputMessage.trim() || !selectedGroup || !socket) return;

        const messageData = {
            groupId: selectedGroup.id,
            text: inputMessage.trim(),
            senderId: user.id
        };

        // Emit via socket
        socket.emit('send_group_message', messageData);

        // Clear input
        setInputMessage('');
    };

    const handleDeleteMessage = async (messageId) => {
        if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;

        try {
            const groupId = selectedGroup.id;
            // Optimistic update
            setMessages(prev => ({
                ...prev,
                [groupId]: (prev[groupId] || []).filter(msg => msg.id !== messageId)
            }));

            // Send socket event for real-time update
            if (socket && selectedGroup) {
                socket.emit('delete_group_message', {
                    messageId,
                    groupId: selectedGroup.id,
                    senderId: user.id
                });
            } else {
                await groupAPI.deleteMessage(messageId);
            }
        } catch (error) {
            console.error('Failed to delete message:', error);
            // Reload to restore state if failed
            if (selectedGroup) loadMessages(selectedGroup.id);
        }
    };

    // ============================================
    // THEME & LOCAL STORAGE
    // ============================================

    // Load/Save preferences
    useEffect(() => {
        const savedTheme = localStorage.getItem('groupColorTheme');
        const savedWallpaper = localStorage.getItem('groupWallpaper');
        const savedDarkMode = localStorage.getItem('groupDarkMode');
        if (savedTheme) setSelectedColorTheme(savedTheme);
        if (savedWallpaper) setSelectedWallpaper(savedWallpaper);
        if (savedDarkMode !== null) setIsDarkMode(savedDarkMode === 'true');
    }, []);

    useEffect(() => {
        localStorage.setItem('groupColorTheme', selectedColorTheme);
        localStorage.setItem('groupWallpaper', selectedWallpaper);
        localStorage.setItem('groupDarkMode', isDarkMode.toString());
    }, [selectedColorTheme, selectedWallpaper, isDarkMode]);

    // ============================================
    // UI HELPERS
    // ============================================

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedGroup]);

    // Get time ago
    const getTimeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1) return 'Şimdi';
        if (minutes < 60) return `${minutes}d`;
        if (hours < 24) return `${hours}s`;
        if (days < 7) return `${days}g`;
        return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    // Wallpaper style
    const getWallpaperStyle = () => {
        if (currentWallpaper.type === 'image') {
            return {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${currentWallpaper.value})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            };
        }
        return { background: currentWallpaper.value };
    };

    //  ============================================
    // EMOJI & FILE HANDLING
    // ============================================

    const addEmoji = (emoji) => {
        setInputMessage(prev => prev + emoji);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file || !selectedGroup) return;

        const reader = new FileReader();

        reader.onload = (event) => {
            const fileUrl = event.target.result;
            const isImage = file.type.startsWith('image/');

            const newMessage = {
                id: Date.now(),
                content: isImage ? '' : `📎 ${file.name}`,
                image: isImage ? fileUrl : null,
                fileUrl: !isImage ? fileUrl : null,
                fileName: file.name,
                senderId: user.id,
                senderName: user.name,
                senderAvatar: user.name?.substring(0, 2).toUpperCase(),
                time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                isMe: true,
            };

            setMessages(prev => ({
                ...prev,
                [selectedGroup.id]: [...(prev[selectedGroup.id] || []), newMessage]
            }));

            if (socket) {
                socket.emit('send_group_message', {
                    groupId: selectedGroup.id,
                    text: isImage ? '[Resim]' : `📎 ${file.name}`,
                    senderId: user.id,
                    fileUrl: fileUrl,
                    fileName: file.name,
                    fileType: file.type
                });
            }
        };

        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const sendSticker = (sticker) => {
        if (!selectedGroup) return;
        const newMessage = {
            id: Date.now(),
            content: '',
            sticker: sticker.url,
            stickerName: sticker.name,
            senderId: user.id,
            senderName: user.name,
            senderAvatar: user.name?.substring(0, 2).toUpperCase(),
            time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
        };
        setMessages(prev => ({
            ...prev,
            [selectedGroup.id]: [...(prev[selectedGroup.id] || []), newMessage]
        }));
        setShowEmojiPicker(false);
    };

    // ============================================
    // CALL FEATURES
    // ============================================

    // Call Effect for Camera
    useEffect(() => {
        let stream = null;

        const startCamera = async () => {
            if (showCallModal && callType === 'video') {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    console.error("Kamera hatası:", err);
                    alert("Kamera erişimi sağlanamadı. Lütfen izinleri kontrol edin.");
                }
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [showCallModal, callType]);

    // Start a call
    const startCall = (type) => {
        if (!selectedGroup) return;
        setCallType(type);
        setCallStatus('calling');
        setCallDuration(0);
        setShowCallModal(true);

        // Simulate call connection after 2 seconds
        setTimeout(() => {
            setCallStatus('connected');
            // Start duration timer
            const timer = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
            // Store timer to clear later
            window.callTimer = timer;
        }, 2000);
    };

    // End call
    const endCall = () => {
        if (window.callTimer) {
            clearInterval(window.callTimer);
        }

        // Create call log message
        if (selectedGroup) {
            const callLogMessage = {
                id: Date.now(),
                content: `${callType === 'video' ? 'Görüntülü Grup Araması' : 'Sesli Grup Araması'} - ${formatDuration(callDuration)}`,
                type: 'call-log',
                callType: callType,
                duration: formatDuration(callDuration),
                senderId: 'system',
                senderName: 'Sistem',
                time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                isMe: false,
                isSystem: true
            };

            setMessages(prev => ({
                ...prev,
                [selectedGroup.id]: [...(prev[selectedGroup.id] || []), callLogMessage]
            }));
        }

        setCallStatus('ended');
        setTimeout(() => {
            setShowCallModal(false);
            setCallStatus('calling');
            setCallDuration(0);
        }, 1000);
    };

    // Format call duration
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // ============================================
    // GROUP ACTIONS
    // ============================================

    // Toggle pin
    const togglePin = (groupId) => {
        setGroups(prev => prev.map(g =>
            g.id === groupId ? { ...g, isPinned: !g.isPinned } : g
        ));
    };

    // Toggle mute group
    const toggleMuteGroup = (groupId) => {
        if (mutedGroups.includes(groupId)) {
            setMutedGroups(prev => prev.filter(id => id !== groupId));
        } else {
            setMutedGroups(prev => [...prev, groupId]);
        }
        setShowOptionsMenu(false);
    };

    // Delete group chat
    const deleteGroupChat = (groupId) => {
        setConfirmModal({
            isOpen: true,
            type: 'delete',
            title: 'Sohbeti Sil',
            message: 'Bu grup sohbetini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
            data: groupId
        });
    };

    // Leave group
    const leaveGroup = (groupId) => {
        setConfirmModal({
            isOpen: true,
            type: 'leave',
            title: 'Gruptan Ayrıl',
            message: 'Bu gruptan ayrılmak istediğinizden emin misiniz?',
            data: groupId
        });
    };

    // Handle Confirm Action
    const handleConfirmAction = () => {
        if (confirmModal.type === 'delete') {
            const groupId = confirmModal.data;
            setMessages(prev => {
                const newMessages = { ...prev };
                delete newMessages[groupId];
                return newMessages;
            });
            setGroups(prev => prev.map(g =>
                g.id === groupId ? { ...g, lastMessage: null, unread: 0 } : g
            ));
            setShowOptionsMenu(false);
        } else if (confirmModal.type === 'leave') {
            const groupId = confirmModal.data;
            setGroups(prev => prev.filter(g => g.id !== groupId));
            setSelectedGroup(null);
            setShowOptionsMenu(false);
        } else if (confirmModal.type === 'remove_member') {
            const memberId = confirmModal.data;
            setGroupMembers(prev => ({
                ...prev,
                [selectedGroup.id]: prev[selectedGroup.id].filter(m => m.id !== memberId)
            }));
            setGroups(prev => prev.map(g =>
                g.id === selectedGroup.id
                    ? { ...g, memberCount: Math.max(0, (g.memberCount || 0) - 1) }
                    : g
            ));
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    // ============================================
    // MEMBER MANAGEMENT
    // ============================================

    const handleRoleChange = async (memberId, newRole) => {
        if (!selectedGroup) return;
        console.log('Changing role for:', memberId, 'to', newRole);

        // Optimistic Update
        setGroupMembers(prev => ({
            ...prev,
            [selectedGroup.id]: prev[selectedGroup.id].map(m =>
                m.id === memberId ? { ...m, role: newRole } : m
            )
        }));

        // Use timeout to simulate API call if API doesn't exist yet, or mock success
        // In real execution, you would call: await groupAPI.updateMemberRole(selectedGroup.id, memberId, newRole);
        console.log('Optimistic update applied.');

        setActiveMemberMenu(null);
    };

    const handleRemoveMember = (memberId) => {
        if (!selectedGroup) return;
        setConfirmModal({
            isOpen: true,
            type: 'remove_member',
            title: 'Üyeyi Çıkar',
            message: 'Bu üyeyi gruptan çıkarmak istediğinize emin misiniz?',
            data: memberId
        });
        setActiveMemberMenu(null);
    };

    const handleAddSpecificMember = (userToAdd) => {
        if (!selectedGroup) return;

        const newMember = {
            id: `m${Date.now()}`,
            name: userToAdd.name,
            avatar: userToAdd.avatar,
            role: 'member',
            online: false,
            lastSeen: 'Henüz eklendi',
            status: userToAdd.status
        };

        setGroupMembers(prev => ({
            ...prev,
            [selectedGroup.id]: [...(prev[selectedGroup.id] || []), newMember]
        }));

        // Update member count
        setGroups(prev => prev.map(g =>
            g.id === selectedGroup.id
                ? { ...g, memberCount: (g.memberCount || 0) + 1 }
                : g
        ));
    };

    const handleAddMember = () => {
        if (!selectedGroup) return;
        setShowAddMemberModal(true);
    };

    const submitAddMember = () => {
        if (!selectedGroup || !newMemberName.trim()) return;

        const name = newMemberName.trim();
        const newMember = {
            id: `m${Date.now()}`,
            name: name,
            avatar: name.substring(0, 2).toUpperCase(),
            role: 'member',
            online: false,
            lastSeen: 'Henüz yeni eklendi',
            status: 'Yeni Üye ✨'
        };

        setGroupMembers(prev => ({
            ...prev,
            [selectedGroup.id]: [...(prev[selectedGroup.id] || []), newMember]
        }));

        // Update member count
        setGroups(prev => prev.map(g =>
            g.id === selectedGroup.id
                ? { ...g, memberCount: (g.memberCount || 0) + 1 }
                : g
        ));

        setShowAddMemberModal(false);
        setNewMemberName('');
    };

    // ============================================
    // FILTER & SEARCH
    // ============================================

    // Filter groups based on search
    const filteredGroups = groups.filter(g => {
        const matchesSearch = g.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || (filter === 'admin' && g.isAdmin) || (filter === 'pinned' && g.isPinned);
        return matchesSearch && matchesFilter;
    }).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Container style
    const containerStyle = {
        '--theme-primary': currentTheme.primary,
        '--theme-secondary': currentTheme.secondary,
        '--theme-gradient': currentTheme.gradient,
    };

    if (!user) {
        return (
            <div className={`groups-login-prompt ${isDarkMode ? 'dark' : 'light'}`}>
                <div className="login-card">
                    <div className="login-icon">
                        <Users size={64} />
                    </div>
                    <h2>Gruplara Hoş Geldiniz</h2>
                    <p>Gruplara erişmek için lütfen giriş yapın</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`groups-container-enhanced ${isDarkMode ? 'dark' : 'light'}`} style={containerStyle}>
            {/* Animated Background */}
            <div className="animated-bg">
                <div className="bg-orb bg-orb-1" style={{ background: currentTheme.primary }}></div>
                <div className="bg-orb bg-orb-2" style={{ background: currentTheme.secondary }}></div>
                <div className="bg-orb bg-orb-3" style={{ background: currentTheme.primary }}></div>
            </div>

            {/* Sidebar */}
            <div className="groups-sidebar">
                {/* Header */}
                <div className="sidebar-header-enhanced">
                    <div className="header-row">
                        <div className="logo-section">
                            <div className="logo-icon" style={{ background: currentTheme.gradient }}>
                                <Users size={22} />
                            </div>
                            <h1>Gruplar</h1>
                        </div>
                        <div className="header-actions">
                            <button className="icon-btn-modern" onClick={() => setIsDarkMode(!isDarkMode)}>
                                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                            <button className="icon-btn-modern" onClick={() => setShowSettings(true)}>
                                <Palette size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="search-container">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Grup ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="action-row">
                        <button className="action-btn-primary" onClick={() => setShowCreateModal(true)} style={{ background: currentTheme.gradient }}>
                            <Plus size={18} />
                            <span>Yeni Grup</span>
                        </button>
                        <button className="action-btn-secondary" onClick={() => setShowJoinModal(true)}>
                            <LogIn size={18} />
                            <span>Katıl</span>
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs-enhanced">
                    {[
                        { key: 'all', label: 'Tümü', count: groups.length },
                        { key: 'pinned', label: 'Sabitler', icon: Star, count: groups.filter(g => g.isPinned).length },

                    ].map(tab => (
                        <button
                            key={tab.key}
                            className={`filter-tab-enhanced ${filter === tab.key ? 'active' : ''}`}
                            onClick={() => setFilter(tab.key)}
                            style={filter === tab.key ? { borderColor: currentTheme.primary, color: currentTheme.primary } : {}}
                        >
                            {tab.icon && <tab.icon size={14} />}
                            {tab.label}
                            <span className="tab-count">{tab.count}</span>
                        </button>
                    ))}
                </div>

                {/* Group List */}
                <div className="groups-list">
                    {filteredGroups.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon" style={{ background: `${currentTheme.primary}20` }}>
                                <Users size={48} style={{ color: currentTheme.primary }} />
                            </div>
                            <p>Henüz grup yok</p>
                            <span>Yeni bir grup oluşturun veya mevcut bir gruba katılın</span>
                        </div>
                    ) : (
                        filteredGroups.map(group => (
                            <div
                                key={group.id}
                                className={`group-item ${selectedGroup?.id === group.id ? 'active' : ''} ${group.isPinned ? 'pinned' : ''}`}
                                onClick={() => {
                                    setSelectedGroup(group);
                                    setGroups(prev => prev.map(g =>
                                        g.id === group.id ? { ...g, unread: 0 } : g
                                    ));
                                }}
                            >
                                {group.isPinned && <div className="pin-indicator"><Star size={10} /></div>}
                                <div className="group-avatar" style={{ background: `linear-gradient(135deg, ${group.color || currentTheme.primary}, ${group.color || currentTheme.primary}aa)` }}>
                                    <Users size={20} />
                                    <div className="online-dot" style={{ background: (group.onlineCount || 0) > 0 ? '#22c55e' : '#64748b' }}></div>
                                </div>
                                <div className="group-info">
                                    <div className="group-row">
                                        <span className="group-name">
                                            {group.name}
                                            {group.isAdmin && <Crown size={12} className="admin-badge" />}
                                        </span>
                                        <span className="group-time">{group.lastMessageTime ? getTimeAgo(group.lastMessageTime) : ''}</span>
                                    </div>
                                    <div className="group-row">
                                        <span className="group-preview">
                                            {group.lastMessage && (
                                                <>
                                                    <span className="sender-name">
                                                        {group.lastMessageSender || (typeof group.lastMessage === 'object' ? (group.lastMessage.sender?.name || 'User') : '')}:
                                                    </span>
                                                    {' '}
                                                    {typeof group.lastMessage === 'string' ? group.lastMessage : (group.lastMessage?.content || group.lastMessage?.text || 'Mesaj')}
                                                </>
                                            )}
                                        </span>
                                        {(group.unread || 0) > 0 && (
                                            <span className="unread-count" style={{ background: currentTheme.gradient }}>{group.unread}</span>
                                        )}
                                    </div>
                                    <div className="group-meta">
                                        <span><Users size={12} /> {group.memberCount || group.members?.length || 0}</span>
                                        <span className="online-count">• {group.onlineCount || 0} çevrimiçi</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="groups-main" style={getWallpaperStyle()}>
                {!selectedGroup ? (
                    <div className="no-group-selected">
                        <div className="welcome-card">
                            <div className="welcome-icon" style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})` }}>
                                <MessageCircle size={48} />
                            </div>
                            <h2>Sohbet Başlatın</h2>
                            <p>Mesajlaşmaya başlamak için soldaki listeden bir grup seçin veya yeni bir grup oluşturun.</p>
                            <div className="welcome-features">
                                <div className="feature-item">
                                    <Users size={24} style={{ color: currentTheme.primary }} />
                                    <span>Gruplar</span>
                                </div>
                                {/* Calls removed per request */}
                                <div className="feature-item">
                                    <Image size={24} style={{ color: currentTheme.primary }} />
                                    <span>Medya</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="chat-header-enhanced">
                            <button className="back-btn-mobile" onClick={() => setSelectedGroup(null)}>
                                <ArrowLeft size={20} />
                            </button>
                            <div className="chat-info" onClick={() => setShowGroupInfo(true)}>
                                <div className="chat-avatar" style={{ background: `linear-gradient(135deg, ${selectedGroup.color || currentTheme.primary}, ${selectedGroup.color || currentTheme.primary}aa)` }}>
                                    {selectedGroup.image ? (
                                        <img src={selectedGroup.image} alt={selectedGroup.name} style={{ width: '100%', height: '100%', borderRadius: '14px', objectFit: 'cover' }} />
                                    ) : (
                                        <Users size={24} />
                                    )}
                                </div>
                                <div className="chat-details">
                                    <h3>
                                        {selectedGroup.name}
                                        {selectedGroup.isAdmin && <Crown size={14} className="crown-badge" style={{ color: '#fbbf24' }} />}
                                    </h3>
                                    <span className="chat-status">
                                        {selectedGroup.memberCount || 0} üye • {selectedGroup.onlineCount || 0} çevrimiçi
                                    </span>
                                </div>
                            </div>
                            <div className="chat-header-actions">
                                {/* Call features removed as per request */}
                                <div className="options-menu-wrapper">
                                    <button
                                        className="header-action-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!showOptionsMenu) {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setMenuPosition({
                                                    top: rect.bottom + 8,
                                                    left: rect.right - 220
                                                });
                                            }
                                            setShowOptionsMenu(!showOptionsMenu);
                                        }}
                                    >
                                        <MoreVertical size={20} />
                                    </button>
                                    {showOptionsMenu && createPortal(
                                        <div
                                            className="options-dropdown"
                                            style={{
                                                position: 'fixed',
                                                top: `${menuPosition.top}px`,
                                                left: `${menuPosition.left}px`,
                                                zIndex: 99999,
                                                minWidth: '220px',
                                                background: '#1e1e2e',
                                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                                borderRadius: '12px',
                                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
                                                overflow: 'hidden',
                                                padding: '4px',
                                                animation: 'fadeIn 0.2s ease-out'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button className="options-dropdown-item" onClick={() => { setShowGroupInfo(true); setShowOptionsMenu(false); }}>
                                                <Users size={16} /> Grup Bilgisi
                                            </button>
                                            <button className="options-dropdown-item" onClick={() => { togglePin(selectedGroup.id); setShowOptionsMenu(false); }}>
                                                <Star size={16} /> {selectedGroup.isPinned ? 'Sabitlemeyi Kaldır' : 'Grubu Sabitle'}
                                            </button>
                                            <button className="options-dropdown-item" onClick={() => { toggleMuteGroup(selectedGroup.id); setShowOptionsMenu(false); }}>
                                                {mutedGroups.includes(selectedGroup.id) ? <Bell size={16} /> : <BellOff size={16} />}
                                                {mutedGroups.includes(selectedGroup.id) ? 'Sesi Aç' : 'Sessize Al'}
                                            </button>
                                            {selectedGroup.isAdmin && (
                                                <button className="options-dropdown-item danger" onClick={() => { deleteGroupChat(selectedGroup.id); setShowOptionsMenu(false); }}>
                                                    <Trash2 size={16} /> Sohbeti Sil
                                                </button>
                                            )}
                                            <button className="options-dropdown-item danger" onClick={() => { leaveGroup(selectedGroup.id); setShowOptionsMenu(false); }}>
                                                <LogOut size={16} /> Gruptan Ayrıl
                                            </button>
                                        </div>,
                                        document.body
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="messages-area">
                            {(messages[selectedGroup.id] || []).map((msg, index) => (
                                <div key={msg.id || index} className={`message-wrapper ${msg.isMe || msg.senderId === user.id ? 'sent' : ''}`}>
                                    {!(msg.isMe || msg.senderId === user.id) && (
                                        <div className="sender-avatar" style={{ background: currentTheme.secondary }}>
                                            {msg.senderAvatar || 'U'}
                                        </div>
                                    )}
                                    <div className="message-content">
                                        {!(msg.isMe || msg.senderId === user.id) && (
                                            <span className="sender-name-tag" style={{ color: currentTheme.primary }}>{msg.senderName}</span>
                                        )}

                                        {msg.type === 'call-log' ? (
                                            <div className="message-call-log">
                                                <div className="call-log-content">
                                                    {msg.callType === 'video' ? <Video size={16} /> : <Phone size={16} />}
                                                    <span>{msg.content}</span>
                                                    <span className="call-log-time">{formatTime(msg.time)}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className={`message-bubble-enhanced ${msg.isMe || msg.senderId === user.id ? 'sent' : 'received'} ${msg.image || msg.sticker ? 'has-media' : ''}`}
                                                style={(msg.isMe || msg.senderId === user.id) ? { background: currentTheme.gradient } : {}}
                                                onDoubleClick={() => msg.isMe && handleDeleteMessage(msg.id)}
                                            >
                                                {msg.image && (
                                                    <img src={msg.image} alt="Shared" className="message-media" />
                                                )}
                                                {msg.sticker && (
                                                    <img src={msg.sticker} alt="Sticker" className="message-media" style={{ width: '120px' }} />
                                                )}
                                                {(msg.content || msg.text) && (
                                                    <p>
                                                        {typeof (msg.content || msg.text) === 'object'
                                                            ? (msg.content?.text || msg.text || JSON.stringify(msg.content)) // Try to extract text key if object
                                                            : (msg.content || msg.text)}
                                                    </p>
                                                )}
                                                <span className="message-time-enhanced">
                                                    {typeof msg.time === 'string' ? msg.time : formatTime(msg.time || Date.now())}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isTyping && typingUsers.length > 0 && (
                                <div className="typing-indicator-enhanced">
                                    <div className="typing-avatar" style={{ background: currentTheme.secondary }}>
                                        <Users size={16} />
                                    </div>
                                    <div className="typing-bubble">
                                        <div className="typing-dots">
                                            <div className="dot"></div>
                                            <div className="dot"></div>
                                            <div className="dot"></div>
                                        </div>
                                        <span>{typingUsers.join(', ')} yazıyor...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="input-area-enhanced">
                            <div className="input-actions">
                                <button
                                    className={`input-btn ${showEmojiPicker ? 'active' : ''}`}
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                >
                                    <Smile size={20} />
                                </button>
                                <button className="input-btn" onClick={() => fileInputRef.current.click()}>
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileUpload}
                                    accept="image/*,video/*,.pdf,.doc,.docx"
                                />
                            </div>

                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    ref={inputRef}
                                    placeholder="Mesaj yazın..."
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    autoFocus
                                />
                            </div>

                            <button
                                className="send-btn-enhanced"
                                onClick={sendMessage}
                                disabled={!inputMessage.trim()}
                                style={{ background: currentTheme.gradient }}
                            >
                                <Send size={20} />
                            </button>

                            {/* Emoji Picker */}
                            {showEmojiPicker && (
                                <div className="emoji-picker-enhanced">
                                    <div className="picker-header">
                                        <button
                                            className={`picker-tab ${emojiTab === 'emoji' ? 'active' : ''}`}
                                            onClick={() => setEmojiTab('emoji')}
                                        >
                                            Emojiler
                                        </button>
                                        <button
                                            className={`picker-tab ${emojiTab === 'stickers' ? 'active' : ''}`}
                                            onClick={() => setEmojiTab('stickers')}
                                        >
                                            Çıkartmalar
                                        </button>
                                        <button className="picker-close" onClick={() => setShowEmojiPicker(false)}>
                                            <X size={18} />
                                        </button>
                                    </div>

                                    {emojiTab === 'emoji' ? (
                                        <>
                                            <div className="emoji-categories-bar">
                                                {Object.entries(EMOJI_CATEGORIES).map(([key, data]) => (
                                                    <button
                                                        key={key}
                                                        className={`cat-btn ${emojiCategory === key ? 'active' : ''}`}
                                                        onClick={() => setEmojiCategory(key)}
                                                    >
                                                        {data.icon}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="emojis-grid">
                                                {EMOJI_CATEGORIES[emojiCategory].emojis.map((emoji, index) => (
                                                    <button key={index} className="emoji-item" onClick={() => addEmoji(emoji)}>
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="stickers-grid">
                                            {STICKERS.map((sticker) => (
                                                <div key={sticker.id} className="sticker-item" onClick={() => sendSticker(sticker)}>
                                                    <img src={sticker.url} alt={sticker.name} />
                                                    <span>{sticker.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}

            {/* Create Group Modal */}
            {showCreateModal && (
                <div className="modal-overlay-enhanced" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-enhanced" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-enhanced">
                            <h2><Plus size={20} /> Yeni Grup Oluştur</h2>
                            <button onClick={() => setShowCreateModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-content">
                            <div className="form-group">
                                <label>Grup Adı</label>
                                <input
                                    type="text"
                                    placeholder="Örn: Proje Ekibi..."
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Açıklama (İsteğe Bağlı)</label>
                                <textarea
                                    placeholder="Grubun amacı nedir?"
                                    value={newGroupDescription}
                                    onChange={(e) => setNewGroupDescription(e.target.value)}
                                ></textarea>
                            </div>
                            <button
                                className="submit-btn-enhanced"
                                onClick={createGroup}
                                style={{ background: currentTheme.gradient }}
                            >
                                Oluştur
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Join Group Modal */}
            {showJoinModal && (
                <div className="modal-overlay-enhanced" onClick={() => setShowJoinModal(false)}>
                    <div className="modal-enhanced" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-enhanced">
                            <h2><LogIn size={20} /> Gruba Katıl</h2>
                            <button onClick={() => setShowJoinModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-content">
                            <div className="form-group">
                                <label>Grup Adı veya ID</label>
                                <input
                                    type="text"
                                    placeholder="Grup ara..."
                                    value={joinGroupName}
                                    onChange={(e) => setJoinGroupName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Şifre (Varsa)</label>
                                <input
                                    type="password"
                                    placeholder="Grup şifresi..."
                                    value={joinGroupPassword}
                                    onChange={(e) => setJoinGroupPassword(e.target.value)}
                                />
                            </div>
                            <button
                                className="submit-btn-enhanced"
                                onClick={() => {
                                    alert('Bu özellik yapım aşamasında');
                                    setShowJoinModal(false);
                                }}
                                style={{ background: currentTheme.gradient }}
                            >
                                Katıl
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="modal-overlay-enhanced" onClick={() => setShowSettings(false)}>
                    <div className="modal-enhanced settings-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-enhanced">
                            <h2><Palette size={20} /> Görünüm Ayarları</h2>
                            <button onClick={() => setShowSettings(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-content">
                            <div className="setting-group">
                                <h3>Tema Modu</h3>
                                <div className="theme-buttons">
                                    <button
                                        className={`theme-option ${!isDarkMode ? 'active' : ''}`}
                                        onClick={() => setIsDarkMode(false)}
                                    >
                                        <Sun size={18} /> Aydınlık
                                    </button>
                                    <button
                                        className={`theme-option ${isDarkMode ? 'active' : ''}`}
                                        onClick={() => setIsDarkMode(true)}
                                    >
                                        <Moon size={18} /> Karanlık
                                    </button>
                                </div>
                            </div>

                            <div className="setting-group">
                                <h3>Renk Teması</h3>
                                <div className="colors-grid">
                                    {COLOR_THEMES.map(theme => (
                                        <div
                                            key={theme.id}
                                            className={`color-item ${selectedColorTheme === theme.id ? 'active' : ''}`}
                                            style={{ background: theme.gradient }}
                                            onClick={() => setSelectedColorTheme(theme.id)}
                                            title={theme.name}
                                        >
                                            {selectedColorTheme === theme.id && <Check size={14} />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="setting-group">
                                <h3>Duvar Kağıdı</h3>
                                <div className="wallpapers-grid">
                                    {WALLPAPERS.map(wp => (
                                        <div
                                            key={wp.id}
                                            className={`wallpaper-item ${selectedWallpaper === wp.id ? 'active' : ''}`}
                                            onClick={() => setSelectedWallpaper(wp.id)}
                                            style={wp.type === 'image' ? { backgroundImage: `url(${wp.value})`, backgroundSize: 'cover' } : { background: wp.value }}
                                        >
                                            {selectedWallpaper === wp.id && <Check size={14} style={{ color: '#fff' }} />}
                                            <span>{wp.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Members/Group Info Modal */}
            {showGroupInfo && selectedGroup && (
                <div className="modal-overlay-enhanced" onClick={() => setShowGroupInfo(false)}>
                    <div className="modal-enhanced members-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-enhanced">
                            <h2><Users size={20} /> Üyeler ({selectedGroup.memberCount || 0})</h2>
                            <button onClick={() => setShowGroupInfo(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-content">
                            <div className="members-search">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Üye ara..."
                                    value={memberSearchQuery}
                                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="members-list">
                                {filteredMembers.length > 0 ? (
                                    filteredMembers.map(member => {
                                        // 1. Determine Display Name & Avatar
                                        let displayName = member.name;
                                        let displayAvatar = member.avatar;
                                        let displayStatus = member.status;

                                        // If this is ME, use my Auth Context data as primary source
                                        if (String(member.id) === String(user.id)) {
                                            displayName = user.name || displayName;
                                            displayAvatar = displayAvatar || displayName?.substring(0, 2).toUpperCase();
                                        }
                                        // If not me, check allUsers fallback
                                        else if (!displayName) {
                                            const userDetails = allUsers.find(u => String(u.id) === String(member.id));
                                            displayName = userDetails?.name || 'İsimsiz Üye';
                                            displayAvatar = displayAvatar || userDetails?.avatar || displayName.substring(0, 2).toUpperCase();
                                            displayStatus = displayStatus || userDetails?.status;
                                        }

                                        // Robust Admin Check: Check group metadata OR member list role
                                        // Debug check removed
                                        // Reverting to robust check:
                                        // const iAmAdmin = (selectedGroup?.isAdmin) || 
                                        //     (selectedGroup?.role === 'admin') || 
                                        //     (currentGroupMembers.find(m => String(m.id) === String(user.id))?.role === 'admin');

                                        // Actually, let's look at the screenshot. The user has "Yönetici" badge. 
                                        // So member.role === 'admin' is true for them.
                                        // So finding me in the list should work.
                                        // I will keep the check but ensure it succeeds.
                                        const mySelf = currentGroupMembers.find(m => String(m.id) === String(user.id));
                                        const iAmAdmin = (selectedGroup?.isAdmin) || (selectedGroup?.role === 'admin') || (mySelf?.role === 'admin');

                                        return (
                                            <div key={member.id} className="member-item">
                                                <div className="member-avatar" style={{ background: currentTheme.secondary }}>
                                                    {displayAvatar}
                                                    <div className={`status-dot ${member.online ? 'online' : ''}`}></div>
                                                </div>
                                                <div className="member-info">
                                                    <div className="member-name" style={{ color: isDarkMode ? '#fff' : '#0f172a', fontWeight: '600' }}>
                                                        {displayName}
                                                        {member.role === 'admin' && <span className="role-badge admin">Yönetici</span>}
                                                        {member.role === 'moderator' && <span className="role-badge mod">Moderatör</span>}
                                                        {(!member.role || member.role === 'member') && <span className="role-badge member">Üye</span>}
                                                    </div>
                                                    <span className="member-status" style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#64748b' }}>{displayStatus}</span>
                                                </div>

                                                {/* Menu Button: ALWAYS VISIBLE to ensure access */}
                                                <div className="relative">
                                                    <button
                                                        className="member-action-btn"
                                                        style={{
                                                            opacity: 1,
                                                            visibility: 'visible',
                                                            background: 'rgba(0,0,0,0.05)',
                                                            color: '#1a1a2e',
                                                            display: 'flex',
                                                            zIndex: 50
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (activeMemberMenu !== member.id) {
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                setMemberMenuPosition({
                                                                    top: rect.bottom + 5,
                                                                    left: rect.right - 180
                                                                });
                                                                setActiveMemberMenu(member.id);
                                                            } else {
                                                                setActiveMemberMenu(null);
                                                            }
                                                        }}
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>

                                                    {activeMemberMenu === member.id && createPortal(
                                                        <div
                                                            className="member-role-menu"
                                                            style={{
                                                                position: 'fixed',
                                                                top: `${memberMenuPosition.top}px`,
                                                                left: `${memberMenuPosition.left}px`,
                                                                zIndex: 100000
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button onClick={() => handleRoleChange(member.id, 'admin')} className={member.role === 'admin' ? 'active' : ''}>
                                                                <Crown size={14} style={{ color: '#fbbf24' }} /> Yönetici Yap
                                                            </button>
                                                            <button onClick={() => handleRoleChange(member.id, 'moderator')} className={member.role === 'moderator' ? 'active' : ''}>
                                                                <Shield size={14} style={{ color: '#3b82f6' }} /> Moderatör Yap
                                                            </button>
                                                            <button onClick={() => handleRoleChange(member.id, 'member')} className={member.role === 'member' ? 'active' : ''}>
                                                                <Users size={14} /> Üye Yap
                                                            </button>
                                                            <div className="menu-divider"></div>
                                                            <button className="delete-action" onClick={() => handleRemoveMember(member.id)}>
                                                                <UserMinus size={14} /> Gruptan Çıkar
                                                            </button>
                                                        </div>,
                                                        document.body
                                                    )}
                                                </div>


                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="empty-state" style={{ padding: '2rem 0' }}>
                                        <p>Üye bulunamadı</p>
                                    </div>
                                )}
                            </div>

                            <button
                                className="add-member-btn"
                                onClick={handleAddMember}
                                style={{ background: currentTheme.secondary }}
                            >
                                <UserPlus size={18} />
                                <span>Yeni Üye Ekle</span>
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Add Member Modal */}
            {
                showAddMemberModal && (
                    <div className="modal-overlay-enhanced" onClick={() => setShowAddMemberModal(false)}>
                        <div className="modal-enhanced" onClick={e => e.stopPropagation()}>
                            <div className="modal-header-enhanced">
                                <h2><UserPlus size={20} /> Üye Ekle</h2>
                                <button onClick={() => setShowAddMemberModal(false)}><X size={20} /></button>
                            </div>
                            <div className="modal-content">
                                <div className="members-search">
                                    <Search size={16} />
                                    <input
                                        type="text"
                                        placeholder="Kullanıcı ara..."
                                        value={newMemberName}
                                        onChange={(e) => setNewMemberName(e.target.value)}
                                    />
                                </div>

                                <div className="members-list" style={{ maxHeight: '200px' }}>
                                    {allUsers
                                        .filter(u => u.name?.toLowerCase().includes(newMemberName.toLowerCase()) &&
                                            !currentGroupMembers.some(m => m.name === u.name)) // Filter out already added members by name (simple check)
                                        .slice(0, 5)
                                        .map(user => (
                                            <div
                                                key={user.id}
                                                className="member-item"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => {
                                                    setNewMemberName(user.name);
                                                    // Ideally we select user object directly here
                                                }}
                                            >
                                                <div className="member-avatar" style={{ background: currentTheme.secondary }}>
                                                    {user.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="member-info">
                                                    <div className="member-name">{user.name}</div>
                                                    <span className="member-status">{user.role || 'Üye'}</span>
                                                </div>
                                                <button className="member-action-btn" onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddSpecificMember(user);
                                                    setShowAddMemberModal(false);
                                                    setNewMemberName('');
                                                }}>
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        ))
                                    }
                                    {PREDEFINED_USERS
                                        .filter(u => u.name.toLowerCase().includes(newMemberName.toLowerCase()) &&
                                            !currentGroupMembers.some(m => m.name === u.name))
                                        .map(user => (
                                            <div
                                                key={user.id}
                                                className="member-item"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => {
                                                    handleAddSpecificMember(user);
                                                    setShowAddMemberModal(false);
                                                    setNewMemberName('');
                                                }}
                                            >
                                                <div className="member-avatar" style={{ background: currentTheme.secondary }}>
                                                    {user.avatar}
                                                </div>
                                                <div className="member-info">
                                                    <div className="member-name">{user.name}</div>
                                                    <span className="member-status">{user.status}</span>
                                                </div>
                                                <Plus size={16} style={{ color: currentTheme.primary }} />
                                            </div>
                                        ))
                                    }
                                </div>

                                <button
                                    className="submit-btn-enhanced"
                                    onClick={submitAddMember}
                                    style={{ background: currentTheme.gradient }}
                                >
                                    Manuel Olarak Ekle
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Confirmation Modal */}
            {
                confirmModal.isOpen && (
                    <div className="confirmation-modal-overlay">
                        <div className="confirmation-modal">
                            <div className={`modal-icon ${confirmModal.type === 'delete' ? '' : 'generic'}`}>
                                {confirmModal.type === 'delete' ? <Trash2 size={32} /> :
                                    confirmModal.type === 'leave' ? <LogOut size={32} /> :
                                        <UserMinus size={32} />}
                            </div>
                            <h3>{confirmModal.title}</h3>
                            <div className="modal-message-box">
                                <p>{confirmModal.message}</p>
                            </div>
                            <div className="modal-actions">
                                <button className="modal-btn cancel" onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}>
                                    İptal
                                </button>
                                <button className="modal-btn confirm" onClick={handleConfirmAction}>
                                    Onayla
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }


        </div >
    );
};

export default GroupsPage;
