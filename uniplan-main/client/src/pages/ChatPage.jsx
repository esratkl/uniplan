import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { directChatAPI, userAPI } from '../services/api';
import {
    Send, Search, Users, UserPlus, X, Check,
    MessageCircle, Circle, MoreVertical, Phone, Video,
    Smile, Paperclip, ArrowLeft, Settings, Moon, Sun, Image, Palette,
    Star, PhoneOff, Mic, MicOff, VideoOff, ArrowDownLeft, ArrowUpRight,
    Ban, Trash2, LogOut, Bell, BellOff
} from 'lucide-react';
import '../styles/Chat.css';

const API_URL = process.env.REACT_APP_API_URL || '';

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

// Color themes for messages
const COLOR_THEMES = [
    { id: 'purple', name: 'Mor', primary: '#8b5cf6', secondary: '#6366f1' },
    { id: 'blue', name: 'Mavi', primary: '#3b82f6', secondary: '#0ea5e9' },
    { id: 'green', name: 'Yeşil', primary: '#22c55e', secondary: '#10b981' },
    { id: 'pink', name: 'Pembe', primary: '#ec4899', secondary: '#f472b6' },
    { id: 'orange', name: 'Turuncu', primary: '#f97316', secondary: '#fb923c' },
    { id: 'red', name: 'Kırmızı', primary: '#ef4444', secondary: '#f87171' },
    { id: 'teal', name: 'Turkuaz', primary: '#14b8a6', secondary: '#2dd4bf' },
    { id: 'indigo', name: 'İndigo', primary: '#6366f1', secondary: '#818cf8' },
];

const ChatPage = () => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Theme & Customization
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [selectedWallpaper, setSelectedWallpaper] = useState('default');
    const [selectedColorTheme, setSelectedColorTheme] = useState('blue');
    const [showSettings, setShowSettings] = useState(false);

    // Options Menu
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [mutedChats, setMutedChats] = useState([]);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

    // Modal States
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: null,
        title: '',
        message: '',
        data: null
    });

    // Friends & Conversations - NOW FROM BACKEND
    const [friends, setFriends] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Messages - NOW FROM BACKEND
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const isUserNearBottomRef = useRef(true);

    // Call States
    const [showCallModal, setShowCallModal] = useState(false);
    const [callType, setCallType] = useState('voice');
    const [callStatus, setCallStatus] = useState('calling');
    const [callDuration, setCallDuration] = useState(0);
    const [incomingCall, setIncomingCall] = useState(null);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [remoteUserId, setRemoteUserId] = useState(null);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const optionsMenuRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);

    // Modals
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);

    // Emoji & File Upload
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiTab, setEmojiTab] = useState('emoji');
    const [emojiCategory, setEmojiCategory] = useState('smileys');
    const fileInputRef = useRef(null);

    // Emoji categories
    const emojiCategories = {
        smileys: {
            icon: '😀',
            name: 'Yüzler',
            emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐']
        },
        emotions: {
            icon: '❤️',
            name: 'Duygular',
            emojis: ['😢', '😭', '😤', '😠', '😡', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟']
        },
        gestures: {
            icon: '👋',
            name: 'El Hareketleri',
            emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿']
        },
        objects: {
            icon: '🎉',
            name: 'Nesneler',
            emojis: ['🎉', '🎊', '🎁', '🎈', '🎀', '🎄', '🎃', '🎗️', '🎟️', '🎫', '🔮', '🧿', '🎮', '🕹️', '🎰', '🎲', '🧩', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '💾', '💿', '📀', '📷', '📹', '🎥', '📞', '☎️', '📺', '📻', '🎙️', '⏰', '⌚', '💰', '💵', '💴', '💶', '💷', '💎', '🔑', '🗝️']
        },
        nature: {
            icon: '🌸',
            name: 'Doğa',
            emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🌸', '🌺', '🌹', '🌷', '🌻', '🌼', '🍀', '🌿', '🌴', '🌵', '🌲', '🌳', '☀️', '🌙', '⭐', '🌈', '☁️', '⚡', '❄️', '🔥', '💧', '🌊']
        },
        food: {
            icon: '🍕',
            name: 'Yiyecek',
            emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉']
        },
        symbols: {
            icon: '💯',
            name: 'Semboller',
            emojis: ['💯', '✅', '❌', '❓', '❗', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⬛', '⬜', '◼️', '◻️', '◾', '◽', '▪️', '▫️', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔳', '🔲', '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️']
        }
    };

    // Stickers
    const stickers = [
        { id: 's1', name: 'Mutlu', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif' },
        { id: 's2', name: 'Thumbs Up', url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif' },
        { id: 's3', name: 'Kalp', url: 'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif' },
        { id: 's4', name: 'Kutlama', url: 'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif' },
        { id: 's5', name: 'Alkış', url: 'https://media.giphy.com/media/l0MYJnJQ4EiYLxvQ4/giphy.gif' },
        { id: 's6', name: 'Wow', url: 'https://media.giphy.com/media/udmx3pgdiD7tm/giphy.gif' },
        { id: 's7', name: 'LOL', url: 'https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif' },
        { id: 's8', name: 'Teşekkür', url: 'https://media.giphy.com/media/osjgQPWRx3cac/giphy.gif' },
        { id: 's9', name: 'Dans', url: 'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif' },
        { id: 's10', name: 'Cool', url: 'https://media.giphy.com/media/62PP2yEIAZF6g/giphy.gif' },
        { id: 's11', name: 'Üzgün', url: 'https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif' },
        { id: 's12', name: 'Aşk', url: 'https://media.giphy.com/media/l4pTdcifPZLpDjL1e/giphy.gif' },
        { id: 's13', name: 'Hi', url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif' },
        { id: 's14', name: 'Evet!', url: 'https://media.giphy.com/media/l2JJKs3I69qfaQleE/giphy.gif' },
        { id: 's15', name: 'Hayır', url: 'https://media.giphy.com/media/3o7TKwmnDgQb5jemjK/giphy.gif' },
        { id: 's16', name: 'Güzel', url: 'https://media.giphy.com/media/8VrtCswiLDNnO/giphy.gif' },
        { id: 's17', name: 'Ağlıyor', url: 'https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif' },
        { id: 's18', name: 'Korkmuş', url: 'https://media.giphy.com/media/14ut8PhnIwzros/giphy.gif' },
        { id: 's19', name: 'Şaşkın', url: 'https://media.giphy.com/media/ukGm72ZLZvYfS/giphy.gif' },
        { id: 's20', name: 'Heyecanlı', url: 'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif' },
        { id: 's21', name: 'Düşünüyor', url: 'https://media.giphy.com/media/a5viI92PAF89q/giphy.gif' },
        { id: 's22', name: 'Uykulu', url: 'https://media.giphy.com/media/xT8qBvH1pAhtfSx52U/giphy.gif' },
        { id: 's23', name: 'Kızgın', url: 'https://media.giphy.com/media/l1J9u3TZfpmeDLkD6/giphy.gif' },
        { id: 's24', name: 'Parti', url: 'https://media.giphy.com/media/l0MYJnJQ4EiYLxvQ4/giphy.gif' },
    ];

    // Favorite emojis
    const [favoriteEmojis, setFavoriteEmojis] = useState(['😀', '❤️', '👍', '🎉', '🔥', '😂', '✅', '💯', '😍', '🙏']);

    // Recent Calls
    const [recentCalls, setRecentCalls] = useState([]);

    // Get current theme colors
    const currentTheme = COLOR_THEMES.find(t => t.id === selectedColorTheme) || COLOR_THEMES[0];
    const currentWallpaper = WALLPAPERS.find(w => w.id === selectedWallpaper) || WALLPAPERS[0];

    // ==================== BACKEND INTEGRATION ====================

    // Load chats from backend
    const loadChats = async () => {
        try {
            const data = await directChatAPI.getAll();
            // Transform backend data to match UI format
            const transformedChats = data.map(chat => ({
                id: chat.id,
                name: chat.otherUser?.name || chat.otherUser?.email || 'Unknown',
                username: chat.otherUser?.email?.split('@')[0] || 'unknown',
                avatar: (chat.otherUser?.name || 'U')[0].toUpperCase(),
                online: chat.otherUser?.status === 'online',
                lastMessage: chat.lastMessage?.text || 'Henüz mesaj yok',
                lastMessageTime: chat.lastMessage?.createdAt ? new Date(chat.lastMessage.createdAt) : new Date(),
                unread: 0,
                isFavorite: false,
                otherUserId: chat.otherUser?.id
            }));
            setFriends(transformedChats);
        } catch (error) {
            console.error('Failed to load chats:', error);
        }
    };

    // Load all users from backend
    const loadAllUsers = async () => {
        try {
            const data = await userAPI.getAll();
            setAllUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    // Load messages for selected chat
    const loadMessages = async (chatId) => {
        try {
            setLoading(true);
            const data = await directChatAPI.getMessages(chatId);
            // Transform backend messages to UI format
            const transformedMessages = data.map(msg => ({
                id: msg.id,
                content: msg.text,
                senderId: msg.senderId,
                time: new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                isMe: msg.senderId === user?.id,
                sender: msg.sender
            }));
            setMessages(transformedMessages);
        } catch (error) {
            console.error('Failed to load messages:', error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    // Initialize on mount
    useEffect(() => {
        if (user) {
            loadChats();
            loadAllUsers();
        }

        // Load saved preferences
        const savedTheme = localStorage.getItem('chatColorTheme');
        const savedWallpaper = localStorage.getItem('chatWallpaper');
        // Force light mode as default, ignore saved dark mode setting
        setIsDarkMode(false);
        localStorage.setItem('chatDarkMode', 'false');

        if (savedTheme) setSelectedColorTheme(savedTheme);
        if (savedWallpaper) setSelectedWallpaper(savedWallpaper);
    }, [user]);

    // Save preferences
    useEffect(() => {
        localStorage.setItem('chatColorTheme', selectedColorTheme);
        localStorage.setItem('chatWallpaper', selectedWallpaper);
        localStorage.setItem('chatDarkMode', isDarkMode.toString());
    }, [selectedColorTheme, selectedWallpaper, isDarkMode]);

    // Socket.IO connection
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

        newSocket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        newSocket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
        });

        newSocket.on('reconnect', (attemptNumber) => {
            console.log(`✅ Reconnected after ${attemptNumber} attempts`);
            setIsConnected(true);
        });

        // Listen for direct messages
        newSocket.on('receive_direct_message', (message) => {
            console.log('📨 Received message:', message);

            // If message is for the currently selected chat, add it to messages
            if (selectedFriend && message.chatId === selectedFriend.id) {
                const transformedMessage = {
                    id: message.id,
                    content: message.text,
                    senderId: message.senderId,
                    time: new Date(message.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                    isMe: message.senderId === user.id,
                    sender: message.sender
                };
                setMessages(prev => [...prev, transformedMessage]);
            }
            // Update chat list to show new message
            loadChats();
        });

        // Listen for typing status
        newSocket.on('user_typing_direct', ({ chatId, userId, userName }) => {
            // Assuming `selectedFriend` has an `otherUserId` property for the other participant
            // and `userId` from the socket event refers to the typing user.
            // Also assuming `setTypingStatus` is defined elsewhere in the component.
            if (selectedFriend && selectedFriend.otherUserId === userId) {
                setTypingStatus(`${userName} yazıyor...`);
            }
        });

        newSocket.on('user_stop_typing_direct', ({ chatId, userId }) => {
            if (selectedFriend && selectedFriend.otherUserId === userId) {
                setTypingStatus('');
            }
        });

        // Listen for message deletion
        newSocket.on('direct_message_deleted', ({ messageId, chatId }) => {
            // Assuming `activeChatIdRef` is a ref holding the ID of the currently active chat
            // and `setMessages` is the state setter for messages.
            if (selectedFriend && selectedFriend.id === chatId) { // Use selectedFriend.id for current chat
                setMessages(prev => prev.filter(msg => msg.id !== messageId));
            }
        });

        // WebRTC Call Events
        newSocket.on('incoming_call', (data) => {
            console.log('📞 Incoming call from:', data.callerName);
            setIncomingCall({
                callerId: data.callerId,
                callerName: data.callerName,
                callType: data.callType,
                chatId: data.chatId,
                offer: null
            });
        });

        newSocket.on('webrtc_offer', async (data) => {
            console.log('🔗 Received WebRTC offer');
            setIncomingCall(prev => prev ? { ...prev, offer: data.offer } : null);
        });

        newSocket.on('webrtc_answer', async (data) => {
            console.log('🔗 Received WebRTC answer');
            if (peerConnectionRef.current) {
                try {
                    const state = peerConnectionRef.current.signalingState;
                    console.log('📥 Current signaling state:', state);

                    if (state === 'have-local-offer') {
                        console.log('📥 Setting remote description from answer');
                        await peerConnectionRef.current.setRemoteDescription(
                            new RTCSessionDescription(data.answer)
                        );
                        console.log('✅ Remote description set successfully');
                    } else {
                        console.warn('⚠️ Cannot set remote answer in state:', state);
                    }
                } catch (err) {
                    console.error('❌ Error setting remote description:', err);
                }
            } else {
                console.error('❌ No peer connection available');
            }
        });

        newSocket.on('webrtc_ice_candidate', async (data) => {
            console.log('🧊 Received ICE candidate');
            if (peerConnectionRef.current && data.candidate) {
                try {
                    await peerConnectionRef.current.addIceCandidate(
                        new RTCIceCandidate(data.candidate)
                    );
                } catch (err) {
                    console.error('Error adding ICE candidate:', err);
                }
            }
        });

        newSocket.on('call_accepted', (data) => {
            console.log('✅ Call accepted by:', data.answererName);
            setCallStatus('connecting');
        });

        newSocket.on('call_rejected', () => {
            console.log('❌ Call rejected');
            alert('Arama reddedildi');
            endCall(true);
        });

        newSocket.on('call_ended', () => {
            console.log('📞 Call ended by remote user');
            endCall(true);
        });

        newSocket.on('call_failed', (data) => {
            console.log('❌ Call failed:', data.message);
            alert(data.message);
            endCall(true);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [user, selectedFriend]);

    // Join chat room when selected chat changes
    useEffect(() => {
        if (socket && selectedFriend) {
            // Reset scroll state for new chat
            isUserNearBottomRef.current = true;

            socket.emit('join_direct_chat', { chatId: selectedFriend.id });
            loadMessages(selectedFriend.id);

            return () => {
                socket.emit('leave_direct_chat', { chatId: selectedFriend.id });
            };
        }
    }, [socket, selectedFriend]);

    // Auto-scroll logic
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        const isLastMessageMine = lastMessage?.isMe;

        // Always scroll to bottom if user is close to bottom OR if user sent the message
        if (isUserNearBottomRef.current || isLastMessageMine) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = messagesContainerRef.current;
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            // Consider user "near bottom" if within 150px of the bottom
            isUserNearBottomRef.current = distanceFromBottom < 150;
        }
    };

    // ==================== USER INTERACTIONS ====================

    // Search users - REAL BACKEND
    const handleUserSearch = async (query) => {
        console.log('📝 handleUserSearch called with:', query);
        setUserSearchQuery(query);
        if (query.length > 0) {
            try {
                console.log('🌐 Calling API with query:', query);
                const results = await userAPI.search(query);
                console.log('✅ Search results:', results);
                setSearchResults(results);
            } catch (error) {
                console.error('❌ User search failed:', error);
                setSearchResults([]);
            }
        } else {
            console.log('⚠️ Query too short, clearing results');
            setSearchResults([]);
        }
    };

    // Create or open chat - REAL BACKEND
    const sendMessageRequest = async (selectedUser) => {
        try {
            const chat = await directChatAPI.getOrCreate(selectedUser.id);
            await loadChats();

            // Transform and select the chat
            const transformedChat = {
                id: chat.id,
                name: chat.otherUser?.name || chat.otherUser?.email || 'Unknown',
                username: chat.otherUser?.email?.split('@')[0] || 'unknown',
                avatar: (chat.otherUser?.name || 'U')[0].toUpperCase(),
                online: chat.otherUser?.status === 'online',
                lastMessage: 'Yeni sohbet',
                lastMessageTime: new Date(),
                unread: 0,
                isFavorite: false,
                otherUserId: chat.otherUser?.id
            };

            setSelectedFriend(transformedChat);
            setShowNewMessageModal(false);
        } catch (error) {
            console.error('Failed to create chat:', error);
        }
    };

    // Send message - REAL BACKEND + SOCKET
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !selectedFriend || !socket) return;

        const messageData = {
            chatId: selectedFriend.id,
            text: inputMessage.trim(),
            senderId: user.id
        };

        // Emit via socket
        socket.emit('send_direct_message', messageData);

        // Clear input
        setInputMessage('');
        setShowEmojiPicker(false);
    };

    // Add emoji to message
    const handleDeleteMessage = async (messageId) => {
        if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;

        try {
            // Optimistic update
            setMessages(prev => prev.filter(msg => msg.id !== messageId));

            // Send socket event for real-time update
            if (socket && selectedFriend) {
                socket.emit('delete_direct_message', {
                    messageId,
                    chatId: selectedFriend.id, // Use selectedFriend.id for the chat ID
                    senderId: user.id
                });
            } else {
                // Fallback to API if socket not ready (though socket is preferred)
                // This would require a directChatAPI.deleteMessage(messageId) implementation
                // For now, we'll assume socket is the primary method.
                console.warn('Socket not available, message deletion might not be synced.');
            }
        } catch (error) {
            console.error('Failed to delete message:', error);
            // Revert changes if needed (scoping simple for now)
            // If deletion fails, re-fetch messages to restore the deleted one
            if (selectedFriend) {
                loadMessages(selectedFriend.id);
            }
        }
    };

    const addEmoji = (emoji) => {
        setInputMessage(prev => prev + emoji);
    };

    // Send sticker
    const sendSticker = (sticker) => {
        if (!selectedFriend) return;

        const newMessage = {
            id: Date.now(),
            content: '',
            sticker: sticker.url,
            stickerName: sticker.name,
            senderId: user.id,
            time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        setMessages(prev => [...prev, newMessage]);
        setShowEmojiPicker(false);
    };

    // Handle file upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file || !selectedFriend) return;

        const reader = new FileReader();

        reader.onload = (event) => {
            const fileUrl = event.target.result;
            const isImage = file.type.startsWith('image/');

            const newMessage = {
                id: Date.now(),
                content: isImage ? '' : `📎 ${file.name}`,
                senderId: user.id,
                time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                isMe: true,
                fileUrl: fileUrl,
                fileName: file.name,
                fileType: file.type
            };

            setMessages(prev => [...prev, newMessage]);

            // Emit via socket
            if (socket) {
                const messageData = {
                    chatId: selectedFriend.id,
                    text: isImage ? '[Resim]' : `📎 ${file.name}`,
                    senderId: user.id,
                    fileUrl: fileUrl,
                    fileName: file.name,
                    fileType: file.type
                };
                socket.emit('send_direct_message', messageData);
            }
        };

        reader.readAsDataURL(file);
        e.target.value = '';
    };

    // STUN servers for NAT traversal
    const iceServers = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            {
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            },
            {
                urls: 'turn:openrelay.metered.ca:443',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            }
        ]
    };

    // Create peer connection with target user ID
    const createPeerConnectionWithTarget = (targetUserId) => {
        const peerConnection = new RTCPeerConnection(iceServers);

        peerConnection.onicecandidate = (event) => {
            if (event.candidate && socket && targetUserId) {
                console.log('🧊 Sending ICE candidate to:', targetUserId);
                socket.emit('webrtc_ice_candidate', {
                    targetUserId: targetUserId,
                    candidate: event.candidate
                });
            } else if (!event.candidate) {
                console.log('✅ ICE gathering complete');
            }
        };

        peerConnection.ontrack = (event) => {
            console.log('📺 Remote track received:', event.streams[0]);
            console.log('🎵 Track kind:', event.track.kind); // "audio" veya "video"
            console.log('🎵 Track enabled:', event.track.enabled);
            console.log('🎵 Track readyState:', event.track.readyState);
            console.log('🎵 Stream track count:', event.streams[0].getTracks().length);
            console.log('🎵 Audio tracks:', event.streams[0].getAudioTracks());
            console.log('🎵 Video tracks:', event.streams[0].getVideoTracks());

            if (remoteVideoRef.current && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];

                // Force play with error handling
                remoteVideoRef.current.play().then(() => {
                    console.log('✅ Audio/video playing successfully');
                }).catch(err => {
                    console.error('❌ Play failed:', err);
                    // Try to enable audio manually
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.muted = false;
                        remoteVideoRef.current.volume = 1.0;
                        remoteVideoRef.current.play();
                    }
                });
            }
        };

        peerConnection.onconnectionstatechange = () => {
            console.log('🔗 Connection state:', peerConnection.connectionState);
            if (peerConnection.connectionState === 'connected') {
                setCallStatus('connected');
                setIsCallActive(true);
                const timer = setInterval(() => {
                    setCallDuration(prev => prev + 1);
                }, 1000);
                window.callTimer = timer;
            } else if (peerConnection.connectionState === 'disconnected' ||
                peerConnection.connectionState === 'failed') {
                endCall();
            }
        };

        peerConnection.oniceconnectionstatechange = () => {
            console.log('🧊 ICE connection state:', peerConnection.iceConnectionState);
        };

        return peerConnection;
    };

    // Call functionality
    const startCall = async (type) => {
        if (!selectedFriend) {
            alert('Lütfen önce bir sohbet seçin.');
            return;
        }

        if (!socket || !isConnected) {
            alert('Sunucuya bağlantı yok. Lütfen internet bağlantınızı kontrol edin ve sayfayı yenileyin.');
            return;
        }

        // ✅ EN BAŞTA targetUserId'yi al
        const targetUserId = selectedFriend.otherUserId;
        setRemoteUserId(targetUserId);

        try {
            const constraints = type === 'video'
                ? { video: true, audio: true }
                : { video: false, audio: true };

            console.log('🎥 Requesting media access:', constraints);
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('✅ Media access granted');
            localStreamRef.current = stream;

            // Display local video
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            setCallType(type);
            setCallStatus('calling');
            setCallDuration(0);
            setShowCallModal(true);

            // ✅ targetUserId ile peer connection oluştur
            const peerConnection = createPeerConnectionWithTarget(targetUserId);
            peerConnectionRef.current = peerConnection;

            // Add local stream to peer connection
            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });

            // Create and send offer
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            console.log('📞 Calling:', selectedFriend.name, '| Target User ID:', targetUserId);

            // Send call initiation to server
            socket.emit('call_initiate', {
                targetUserId: targetUserId,
                callerId: user.id,
                callerName: user.name || user.email,
                callType: type,
                chatId: selectedFriend.id
            });

            // Send WebRTC offer
            socket.emit('webrtc_offer', {
                targetUserId: targetUserId,
                offer: offer
            });

        } catch (err) {
            console.error("Medya erişim hatası:", err);

            let errorMessage = '';
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                errorMessage = `${type === 'video' ? 'Kamera ve mikrofon' : 'Mikrofon'} erişimi reddedildi.\n\nLütfen:\n1. Tarayıcı ayarlarından izin verin\n2. Sayfayı yenileyin\n3. Tekrar deneyin`;
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                errorMessage = `${type === 'video' ? 'Kamera veya mikrofon' : 'Mikrofon'} bulunamadı.\n\nLütfen cihazınızın bağlı olduğundan emin olun.`;
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                errorMessage = `${type === 'video' ? 'Kamera veya mikrofon' : 'Mikrofon'} başka bir uygulama tarafından kullanılıyor olabilir.\n\nLütfen diğer uygulamaları kapatın.`;
            } else if (err.name === 'OverconstrainedError') {
                errorMessage = 'Cihazınız istenen özellikleri desteklemiyor.';
            } else if (err.name === 'SecurityError') {
                errorMessage = 'Güvenlik nedeniyle erişim engellendi.\n\nNot: WebRTC sadece HTTPS veya localhost üzerinde çalışır.';
            } else {
                errorMessage = `Arama başlatılamadı: ${err.message}`;
            }

            alert(errorMessage);
        }
    };

    const endCall = (skipNotify = false) => {
        if (window.callTimer) {
            clearInterval(window.callTimer);
            window.callTimer = null;
        }

        // Notify remote user
        if (!skipNotify && socket && remoteUserId) {
            socket.emit('call_end', { targetUserId: remoteUserId });
        }

        // Stop all media tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        // Close peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        // Log the call
        if (selectedFriend && callDuration > 0) {
            const durationFormatted = formatDuration(callDuration);
            const callLogMessage = {
                id: Date.now(),
                content: `${callType === 'video' ? 'Görüntülü Arama' : 'Sesli Arama'} - ${durationFormatted}`,
                type: 'call-log',
                callType: callType,
                duration: durationFormatted,
                senderId: user.id,
                time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                isMe: true
            };

            setMessages(prev => [...prev, callLogMessage]);

            const newCall = {
                id: Date.now(),
                userId: selectedFriend.otherUserId,
                name: selectedFriend.name,
                avatar: selectedFriend.avatar,
                type: callType,
                duration: durationFormatted,
                time: new Date(),
                status: 'outgoing'
            };
            setRecentCalls(prev => [newCall, ...prev]);
        }

        setCallStatus('ended');
        setIsCallActive(false);
        setRemoteUserId(null);
        setIsMicMuted(false);
        setIsCameraOff(false);

        setTimeout(() => {
            setShowCallModal(false);
            setCallStatus('calling');
            setCallDuration(0);
        }, 1000);
    };

    // Answer incoming call
    const answerCall = async () => {
        if (!incomingCall || !socket) return;

        // ✅ EN BAŞTA callerId'yi al
        const callerId = incomingCall.callerId;
        setRemoteUserId(callerId);

        try {
            const constraints = incomingCall.callType === 'video'
                ? { video: true, audio: true }
                : { video: false, audio: true };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            localStreamRef.current = stream;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            setCallType(incomingCall.callType);
            setCallStatus('connecting');
            setCallDuration(0);
            setShowCallModal(true);

            // ✅ callerId ile peer connection oluştur
            const peerConnection = createPeerConnectionWithTarget(callerId);
            peerConnectionRef.current = peerConnection;

            // Add local stream
            stream.getTracks().forEach(track => {
                console.log('📤 Adding track to peer connection:', track.kind, track.enabled); // ← BU SATIRI EKLEYİN
                peerConnection.addTrack(track, stream);
            });

            // Set remote description from the offer
            if (incomingCall.offer) {
                console.log('📥 Setting remote description from offer');
                await peerConnection.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));

                console.log('📤 Creating answer');
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);

                console.log('📤 Sending answer to caller:', callerId);
                socket.emit('webrtc_answer', {
                    targetUserId: callerId,
                    answer: answer
                });
            } else {
                console.error('❌ No offer received from caller');
            }

            socket.emit('call_answer', {
                callerId: callerId,
                answererId: user.id,
                answererName: user.name || user.email
            });

            setIncomingCall(null);

        } catch (err) {
            console.error("Arama cevaplanırken hata:", err);
            alert('Arama cevaplanırken bir hata oluştu.');
            rejectCall();
        }
    };

    // Reject incoming call
    const rejectCall = () => {
        if (!incomingCall || !socket) return;

        socket.emit('call_reject', {
            callerId: incomingCall.callerId
        });

        setIncomingCall(null);
    };

    // Toggle microphone
    const toggleMic = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicMuted(!audioTrack.enabled);
            }
        }
    };

    // Toggle camera
    const toggleCamera = () => {
        if (localStreamRef.current && callType === 'video') {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCameraOff(!videoTrack.enabled);
            }
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
            if (window.callTimer) {
                clearInterval(window.callTimer);
            }
        };
    }, []);

    // Click outside to close options menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showOptionsMenu &&
                optionsMenuRef.current &&
                !optionsMenuRef.current.contains(event.target) &&
                !event.target.closest('.options-menu-portal')) {
                setShowOptionsMenu(false);
            }
        };

        if (showOptionsMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', () => setShowOptionsMenu(false), true);
            window.addEventListener('resize', () => setShowOptionsMenu(false));
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', () => setShowOptionsMenu(false), true);
            window.removeEventListener('resize', () => setShowOptionsMenu(false));
        };
    }, [showOptionsMenu]);

    // Helper functions
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const filteredFriends = filter === 'calls'
        ? []
        : friends.filter(f => {
            const matchesFilter = filter === 'all' ||
                (filter === 'online' && f.online) ||
                (filter === 'favorites' && f.isFavorite);
            const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.username.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleFavorite = (friendId) => {
        setFriends(prev => prev.map(f =>
            f.id === friendId ? { ...f, isFavorite: !f.isFavorite } : f
        ));
    };

    const toggleBlock = (friendId) => {
        const isBlocked = blockedUsers.includes(friendId);
        if (isBlocked) {
            setBlockedUsers(prev => prev.filter(id => id !== friendId));
        } else {
            setBlockedUsers(prev => [...prev, friendId]);
        }
        setShowOptionsMenu(false);
    };

    const toggleMuteChat = (friendId) => {
        const isMuted = mutedChats.includes(friendId);
        if (isMuted) {
            setMutedChats(prev => prev.filter(id => id !== friendId));
        } else {
            setMutedChats(prev => [...prev, friendId]);
        }
        setShowOptionsMenu(false);
    };

    const deleteChat = (friendId) => {
        setConfirmModal({
            isOpen: true,
            type: 'delete',
            title: 'Sohbeti Sil',
            message: 'Bu sohbeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
            data: friendId
        });
        setShowOptionsMenu(false);
    };

    const removeChat = (friendId) => {
        setConfirmModal({
            isOpen: true,
            type: 'leave',
            title: 'Sohbetten Ayrıl',
            message: 'Bu kişiyi sohbet listenizden çıkarmak istediğinizden emin misiniz?',
            data: friendId
        });
        setShowOptionsMenu(false);
    };

    const handleConfirmAction = () => {
        const { type, data: friendId } = confirmModal;

        if (type === 'delete' || type === 'leave') {
            setFriends(prev => prev.filter(f => f.id !== friendId));
            setMessages([]);
            if (selectedFriend?.id === friendId) {
                setSelectedFriend(null);
            }
        }

        setConfirmModal({ isOpen: false, type: null, title: '', message: '', data: null });
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Şimdi';
        if (minutes < 60) return `${minutes}d`;
        if (hours < 24) return `${hours}s`;
        return `${days}g`;
    };

    const getWallpaperStyle = () => {
        if (currentWallpaper.type === 'image') {
            return { background: 'transparent' };
        }
        return { background: currentWallpaper.value };
    };

    const containerStyle = {
        '--theme-primary': currentTheme.primary,
        '--theme-secondary': currentTheme.secondary,
        ...(currentWallpaper.type === 'image' ? {
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${currentWallpaper.value})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        } : {})
    };

    if (!user) {
        return (
            <div className={`chat-login-prompt ${isDarkMode ? 'dark' : 'light'}`}>
                <MessageCircle size={64} />
                <h2>Giriş Yapın</h2>
                <p>Sohbetlere erişmek için lütfen giriş yapın</p>
            </div>
        );
    }

    return (
        <div
            className={`modern-chat-container ${isDarkMode ? 'dark' : 'light'}`}
            style={containerStyle}
        >
            {/* Connection Warning Banner */}
            {!isConnected && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                    color: 'white',
                    padding: '12px 20px',
                    textAlign: 'center',
                    zIndex: 10000,
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}>
                    <Circle size={12} fill="white" />
                    <span>⚠️ Sunucuya bağlantı yok - Canlı mesajlaşma ve aramalar çalışmayacak. Backend server'ı başlatın: cd server && npm run dev</span>
                </div>
            )}

            {/* Animated Background */}
            <div className="animated-bg">
                <div className="bg-orb bg-orb-1" style={{ background: currentTheme.primary }}></div>
                <div className="bg-orb bg-orb-2" style={{ background: currentTheme.secondary }}></div>
                <div className="bg-orb bg-orb-3" style={{ background: currentTheme.primary }}></div>
            </div>

            {/* Sidebar */}
            <div className="chat-sidebar-modern">
                <div className="sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h1>Sohbetler</h1>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: isConnected ? '#22c55e' : '#ef4444',
                            boxShadow: isConnected ? '0 0 10px #22c55e' : '0 0 10px #ef4444',
                            transition: 'all 0.3s'
                        }} title={isConnected ? 'Bağlı - Canlı mesajlaşma aktif' : 'Bağlantı kesildi'} />
                    </div>
                    <div className="header-actions">
                        <button
                            className="icon-button"
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            title={isDarkMode ? 'Gündüz Modu' : 'Gece Modu'}
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            className="icon-button"
                            onClick={() => setShowSettings(true)}
                            title="Özelleştir"
                        >
                            <Palette size={20} />
                        </button>
                        <button
                            className="new-message-btn"
                            onClick={() => setShowNewMessageModal(true)}
                            title="Yeni Mesaj"
                        >
                            <UserPlus size={20} />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="sidebar-search">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder={filter === 'calls' ? "Arama geçmişinde ara..." : "Sohbet ara..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Tümü
                    </button>
                    <button
                        className={`filter-tab ${filter === 'online' ? 'active' : ''}`}
                        onClick={() => setFilter('online')}
                    >
                        <Circle size={8} fill="#22c55e" className="online-dot" />
                        Çevrimiçi
                    </button>
                    <button
                        className={`filter-tab ${filter === 'favorites' ? 'active' : ''}`}
                        onClick={() => setFilter('favorites')}
                    >
                        <Star size={14} fill={filter === 'favorites' ? 'currentColor' : 'none'} />
                    </button>
                    <button
                        className={`filter-tab ${filter === 'calls' ? 'active' : ''}`}
                        onClick={() => setFilter('calls')}
                    >
                        <Phone size={14} />
                    </button>
                </div>

                {/* Friends List */}
                <div className="friends-list">
                    {filter === 'calls' ? (
                        recentCalls.length === 0 ? (
                            <div className="no-friends">
                                <Phone size={40} />
                                <p>Arama geçmişi boş</p>
                            </div>
                        ) : (
                            recentCalls.map(call => (
                                <div key={call.id} className="friend-card call-card">
                                    <div className="friend-avatar-wrapper">
                                        <div className="friend-avatar" style={{
                                            background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`
                                        }}>{call.avatar}</div>
                                        <div className="call-type-indicator">
                                            {call.type === 'video' ? <Video size={12} /> : <Phone size={12} />}
                                        </div>
                                    </div>
                                    <div className="friend-details">
                                        <div className="friend-header">
                                            <span className="friend-name">{call.name}</span>
                                            <span className="message-time">{getTimeAgo(call.time)}</span>
                                        </div>
                                        <div className="friend-footer">
                                            <span className="last-message call-info">
                                                {call.status === 'incoming' ? <ArrowDownLeft size={14} color="#22c55e" /> : <ArrowUpRight size={14} color="#ef4444" />}
                                                <span style={{ marginLeft: 4 }}>{call.duration}</span>
                                            </span>
                                            <button className="call-again-btn" onClick={(e) => {
                                                e.stopPropagation();
                                                const friend = friends.find(f => f.otherUserId === call.userId);
                                                if (friend) {
                                                    setSelectedFriend(friend);
                                                    startCall(call.type);
                                                }
                                            }}>
                                                <Phone size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        filteredFriends.length === 0 ? (
                            <div className="no-friends">
                                <Users size={40} />
                                <p>{filter === 'online' ? 'Çevrimiçi arkadaş yok' : 'Sohbet bulunamadı'}</p>
                            </div>
                        ) : (
                            filteredFriends.map(friend => (
                                <div
                                    key={friend.id}
                                    className={`friend-card ${selectedFriend?.id === friend.id ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedFriend(friend);
                                        setFriends(prev => prev.map(f =>
                                            f.id === friend.id ? { ...f, unread: 0 } : f
                                        ));
                                    }}
                                >
                                    <div className="friend-avatar-wrapper">
                                        <div className="friend-avatar" style={{
                                            background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`
                                        }}>{friend.avatar}</div>
                                        {friend.online && <div className="online-indicator" />}
                                    </div>
                                    <div className="friend-details">
                                        <div className="friend-header">
                                            <span className="friend-name">
                                                {friend.name}
                                                {mutedChats.includes(friend.id) && <span style={{ marginLeft: '6px', fontSize: '0.75rem' }} title="Bildirimler kapalı">🔕</span>}
                                                {blockedUsers.includes(friend.id) && <span style={{ marginLeft: '6px', fontSize: '0.75rem' }} title="Engellendi">🚫</span>}
                                            </span>
                                            <span className="message-time">{getTimeAgo(friend.lastMessageTime)}</span>
                                        </div>
                                        <div className="friend-footer">
                                            <span className="last-message">{friend.lastMessage}</span>
                                            {friend.unread > 0 && (
                                                <span className="unread-badge" style={{
                                                    background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`
                                                }}>{friend.unread}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className="chat-window-modern" style={getWallpaperStyle()}>
                {!selectedFriend ? (
                    <div className="no-chat-selected">
                        <div className="no-chat-icon" style={{
                            background: `linear-gradient(135deg, ${currentTheme.primary}20, ${currentTheme.secondary}20)`,
                            color: currentTheme.primary
                        }}>
                            <MessageCircle size={80} />
                        </div>
                        <h2>Sohbet Seçin</h2>
                        <p>Mesajlaşmaya başlamak için bir sohbet seçin</p>
                        <button
                            className="start-chat-btn"
                            onClick={() => setShowNewMessageModal(true)}
                            style={{
                                background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`
                            }}
                        >
                            <UserPlus size={20} />
                            Yeni Sohbet Başlat
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="chat-header-modern">
                            <button
                                className="back-btn mobile-only"
                                onClick={() => setSelectedFriend(null)}
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div className="chat-user-info">
                                <div className="friend-avatar-wrapper">
                                    <div className="friend-avatar" style={{
                                        background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`
                                    }}>{selectedFriend.avatar}</div>
                                    {selectedFriend.online && <div className="online-indicator" />}
                                </div>
                                <div>
                                    <h3>
                                        {selectedFriend.name}
                                        {mutedChats.includes(selectedFriend.id) && <span style={{ marginLeft: '8px', fontSize: '0.8rem' }} title="Bildirimler kapalı">🔕</span>}
                                        {blockedUsers.includes(selectedFriend.id) && <span style={{ marginLeft: '8px', fontSize: '0.8rem' }} title="Engellendi">🚫</span>}
                                    </h3>
                                    <span className={`status ${selectedFriend.online ? 'online' : 'offline'}`}>
                                        {blockedUsers.includes(selectedFriend.id) ? 'Engellendi' : (selectedFriend.online ? 'Çevrimiçi' : 'Çevrimdışı')}
                                    </span>
                                </div>
                            </div>
                            <div className="chat-actions">
                                <button
                                    className="action-btn"
                                    onClick={() => {
                                        console.log('📞 Voice call button clicked');
                                        console.log('Socket connected:', isConnected);
                                        console.log('Selected friend:', selectedFriend?.name);
                                        startCall('voice');
                                    }}
                                    title={isConnected ? "Sesli Arama" : "Sunucuya bağlantı yok"}
                                    disabled={!isConnected}
                                    style={!isConnected ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                >
                                    <Phone size={20} />
                                </button>
                                <button
                                    className="action-btn"
                                    onClick={() => {
                                        console.log('📹 Video call button clicked');
                                        console.log('Socket connected:', isConnected);
                                        console.log('Selected friend:', selectedFriend?.name);
                                        startCall('video');
                                    }}
                                    title={isConnected ? "Görüntülü Arama" : "Sunucuya bağlantı yok"}
                                    disabled={!isConnected}
                                    style={!isConnected ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                >
                                    <Video size={20} />
                                </button>
                                <button
                                    className="action-btn"
                                    onClick={() => toggleFavorite(selectedFriend.id)}
                                    title={selectedFriend.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                                >
                                    <Star size={20} fill={selectedFriend.isFavorite ? 'currentColor' : 'none'} color={selectedFriend.isFavorite ? '#fbbf24' : 'currentColor'} />
                                </button>
                                <button
                                    className="action-btn"
                                    ref={optionsMenuRef}
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
                                        className="options-menu-portal"
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
                                        <button
                                            type="button"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                width: '100%',
                                                padding: '12px 16px',
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'rgba(255, 255, 255, 0.9)',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                borderRadius: '8px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleMuteChat(selectedFriend.id);
                                            }}
                                        >
                                            {mutedChats.includes(selectedFriend.id) ? <Bell size={18} /> : <BellOff size={18} />}
                                            <span>{mutedChats.includes(selectedFriend.id) ? 'Bildirimleri Aç' : 'Bildirimleri Kapat'}</span>
                                        </button>
                                        <button
                                            type="button"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                width: '100%',
                                                padding: '12px 16px',
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'rgba(255, 255, 255, 0.9)',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                borderRadius: '8px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleBlock(selectedFriend.id);
                                            }}
                                        >
                                            <Ban size={18} />
                                            <span>{blockedUsers.includes(selectedFriend.id) ? 'Engeli Kaldır' : 'Engelle'}</span>
                                        </button>
                                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
                                        <button
                                            type="button"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                width: '100%',
                                                padding: '12px 16px',
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'rgba(255, 255, 255, 0.9)',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                borderRadius: '8px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteChat(selectedFriend.id);
                                            }}
                                        >
                                            <Trash2 size={18} />
                                            <span>Sohbeti Sil</span>
                                        </button>
                                    </div>,
                                    document.body
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            className="messages-container"
                            onClick={() => setShowEmojiPicker(false)}
                            onScroll={handleScroll}
                            ref={messagesContainerRef}
                        >
                            {loading ? (
                                <div className="loading-state">Mesajlar yükleniyor...</div>
                            ) : messages.length === 0 ? (
                                <div className="empty-messages">
                                    <p>Henüz mesaj yok. Konuşmaya başlayın!</p>
                                </div>
                            ) : (
                                messages.map(msg => {
                                    if (msg.type === 'call-log') {
                                        return (
                                            <div key={msg.id} className="message-call-log">
                                                <div className="call-log-content">
                                                    {msg.callType === 'video' ? <Video size={16} /> : <Phone size={16} />}
                                                    <span>{msg.content}</span>
                                                </div>
                                                <span className="call-log-time">{msg.time}</span>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`message-bubble ${msg.isMe ? 'sent' : 'received'} ${msg.fileUrl || msg.sticker ? 'has-image' : ''}`}
                                            style={!msg.fileUrl && !msg.sticker ? (msg.isMe ? {
                                                background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                                                position: 'relative'
                                            } : {
                                                background: `linear-gradient(135deg, ${currentTheme.primary}25, ${currentTheme.secondary}15)`,
                                                borderLeft: `3px solid ${currentTheme.primary}`,
                                                position: 'relative'
                                            }) : { position: 'relative' }}
                                        >
                                            {msg.isMe && (
                                                <button
                                                    className="delete-message-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteMessage(msg.id);
                                                    }}
                                                    title="Mesajı sil"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}

                                            {
                                                msg.fileUrl && msg.fileType?.startsWith('image/') ? (
                                                    <img src={msg.fileUrl} alt="Fotoğraf" className="message-image" />
                                                ) : msg.fileUrl ? (
                                                    <div className="file-attachment-direct">
                                                        <span style={{ display: 'block', marginBottom: '4px' }}>📎 {msg.fileName}</span>
                                                        <a
                                                            href={msg.fileUrl}
                                                            download={msg.fileName}
                                                            className="download-link"
                                                            style={{
                                                                color: 'inherit',
                                                                textDecoration: 'underline',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.9em'
                                                            }}
                                                        >
                                                            İndir
                                                        </a>
                                                    </div>
                                                ) : msg.sticker ? (
                                                    <img src={msg.sticker} alt={msg.stickerName} className="message-sticker" />
                                                ) : (
                                                    msg.content && <p>{msg.content}</p>
                                                )
                                            }
                                            <span className="message-time">{msg.time}</span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Emoji & Sticker Picker */}
                        {showEmojiPicker && (
                            <div className="emoji-picker-full">
                                <div className="picker-tabs">
                                    <button
                                        className={`picker-tab ${emojiTab === 'emoji' ? 'active' : ''}`}
                                        onClick={() => setEmojiTab('emoji')}
                                    >
                                        😀 Emoji
                                    </button>
                                    <button
                                        className={`picker-tab ${emojiTab === 'sticker' ? 'active' : ''}`}
                                        onClick={() => setEmojiTab('sticker')}
                                    >
                                        🎭 Çıkartma
                                    </button>
                                    <button
                                        className="close-picker"
                                        onClick={() => setShowEmojiPicker(false)}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {emojiTab === 'emoji' ? (
                                    <>
                                        <div className="emoji-categories">
                                            <button
                                                className={`category-btn ${emojiCategory === 'favorites' ? 'active' : ''}`}
                                                onClick={() => setEmojiCategory('favorites')}
                                                title="Favoriler"
                                            >
                                                ⭐
                                            </button>
                                            {Object.entries(emojiCategories).map(([key, cat]) => (
                                                <button
                                                    key={key}
                                                    className={`category-btn ${emojiCategory === key ? 'active' : ''}`}
                                                    onClick={() => setEmojiCategory(key)}
                                                    title={cat.name}
                                                >
                                                    {cat.icon}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="emoji-grid-large">
                                            {emojiCategory === 'favorites' ? (
                                                favoriteEmojis.length > 0 ? (
                                                    favoriteEmojis.map((emoji, index) => (
                                                        <button
                                                            key={index}
                                                            className="emoji-btn"
                                                            onClick={() => addEmoji(emoji)}
                                                            onContextMenu={(e) => {
                                                                e.preventDefault();
                                                                setFavoriteEmojis(prev => prev.filter(e => e !== emoji));
                                                            }}
                                                            title="Sol tık: Ekle | Sağ tık: Favorilerden çıkar"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="no-favorites">
                                                        <span>Henüz favori emoji yok</span>
                                                        <small>Emoji üzerine çift tıklayarak favorilere ekle</small>
                                                    </div>
                                                )
                                            ) : (
                                                emojiCategories[emojiCategory]?.emojis.map((emoji, index) => (
                                                    <button
                                                        key={index}
                                                        className={`emoji-btn ${favoriteEmojis.includes(emoji) ? 'is-favorite' : ''}`}
                                                        onClick={() => addEmoji(emoji)}
                                                        onDoubleClick={() => {
                                                            if (!favoriteEmojis.includes(emoji)) {
                                                                setFavoriteEmojis(prev => [...prev, emoji]);
                                                            }
                                                        }}
                                                        title="Tek tık: Ekle | Çift tık: Favorilere ekle"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="sticker-grid-large">
                                        {stickers.map(sticker => (
                                            <button
                                                key={sticker.id}
                                                className="sticker-btn"
                                                onClick={() => sendSticker(sticker)}
                                                title={sticker.name}
                                            >
                                                <img src={sticker.url} alt={sticker.name} />
                                                <span className="sticker-name">{sticker.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Input */}
                        {blockedUsers.includes(selectedFriend.id) ? (
                            <div className="message-input-container" style={{ justifyContent: 'center' }}>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                                    🚫 Bu kullanıcıyı engellediniz. Mesaj gönderemezsiniz.
                                </span>
                            </div>
                        ) : (
                            <form className="message-input-container" onSubmit={handleSendMessage}>
                                <div style={{ display: 'flex', gap: '8px', marginRight: '8px' }}>
                                    <button
                                        type="button"
                                        className={`input-action-btn ${showEmojiPicker ? 'active' : ''}`}
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        title="Emoji Ekle"
                                    >
                                        <Smile size={20} />
                                    </button>
                                    <button
                                        type="button"
                                        className="input-action-btn"
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Dosya/Fotoğraf Ekle"
                                    >
                                        <Paperclip size={20} />
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*,.pdf,.doc,.docx,.txt"
                                    style={{ display: 'none' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Mesaj yazın..."
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                // onKeyPress={handleKeyPress} // Removed as it was passing undefined
                                />
                                <button
                                    type="submit"
                                    className="send-message-btn"
                                    disabled={!inputMessage.trim()}
                                    style={{
                                        background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`
                                    }}
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        )}
                    </>
                )
                }
            </div >

            {/* Settings Modal */}
            {
                showSettings && (
                    <div className="modal-overlay" onClick={() => setShowSettings(false)}>
                        <div className="settings-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Özelleştir</h2>
                                <button className="close-btn" onClick={() => setShowSettings(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="settings-section">
                                    <h3>Tema</h3>
                                    <div className="theme-toggle">
                                        <button
                                            className={`theme-option ${!isDarkMode ? 'active' : ''}`}
                                            onClick={() => setIsDarkMode(false)}
                                        >
                                            <Sun size={24} />
                                            <span>Gündüz</span>
                                        </button>
                                        <button
                                            className={`theme-option ${isDarkMode ? 'active' : ''}`}
                                            onClick={() => setIsDarkMode(true)}
                                        >
                                            <Moon size={24} />
                                            <span>Gece</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h3>Mesaj Rengi</h3>
                                    <div className="color-options">
                                        {COLOR_THEMES.map(theme => (
                                            <button
                                                key={theme.id}
                                                className={`color-option ${selectedColorTheme === theme.id ? 'active' : ''}`}
                                                style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
                                                onClick={() => setSelectedColorTheme(theme.id)}
                                                title={theme.name}
                                            >
                                                {selectedColorTheme === theme.id && <Check size={16} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h3>Duvar Kağıdı</h3>
                                    <div className="wallpaper-options">
                                        {WALLPAPERS.map(wp => (
                                            <button
                                                key={wp.id}
                                                className={`wallpaper-option ${selectedWallpaper === wp.id ? 'active' : ''}`}
                                                style={wp.type === 'image'
                                                    ? { backgroundImage: `url(${wp.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                                    : { background: wp.value }
                                                }
                                                onClick={() => setSelectedWallpaper(wp.id)}
                                            >
                                                <span>{wp.name}</span>
                                                {selectedWallpaper === wp.id && <Check size={16} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* New Message Modal */}
            {
                showNewMessageModal && (
                    <div className="modal-overlay" onClick={() => setShowNewMessageModal(false)}>
                        <div className="new-message-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Yeni Mesaj</h2>
                                <button className="close-btn" onClick={() => setShowNewMessageModal(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="modal-search">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Kullanıcı adı ile ara..."
                                    value={userSearchQuery}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        console.log('🔍 Searching for:', value);
                                        handleUserSearch(value);
                                    }}
                                    autoFocus
                                    style={{
                                        color: isDarkMode ? '#ffffff' : '#1e293b',
                                        fontSize: '1rem',
                                        fontWeight: '500'
                                    }}
                                />
                            </div>

                            <div className="search-results">
                                {userSearchQuery.length === 0 ? (
                                    <div className="search-hint">
                                        <Search size={40} />
                                        <p>Mesaj göndermek istediğiniz kişinin kullanıcı adını yazın</p>
                                    </div>
                                ) : searchResults.length === 0 ? (
                                    <div className="no-results">
                                        <p>"{userSearchQuery}" için sonuç bulunamadı</p>
                                    </div>
                                ) : (
                                    searchResults.map(searchUser => (
                                        <div key={searchUser.id} className="search-result-item">
                                            <div className="friend-avatar-wrapper">
                                                <div className="friend-avatar" style={{
                                                    background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`
                                                }}>{(searchUser.name || searchUser.email)[0].toUpperCase()}</div>
                                                {searchUser.status === 'online' && <div className="online-indicator" />}
                                            </div>
                                            <div className="user-info">
                                                <span className="user-name">{searchUser.name || searchUser.email}</span>
                                                <span className="user-username">@{searchUser.email?.split('@')[0]}</span>
                                            </div>
                                            <button
                                                className={`request-btn ${pendingRequests.includes(searchUser.id) ? 'sent' : ''}`}
                                                onClick={() => sendMessageRequest(searchUser)}
                                                disabled={pendingRequests.includes(searchUser.id)}
                                                style={!pendingRequests.includes(searchUser.id) ? {
                                                    background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`
                                                } : {}}
                                            >
                                                {pendingRequests.includes(searchUser.id) ? (
                                                    <>
                                                        <Check size={16} />
                                                        Gönderildi
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send size={16} />
                                                        Mesaj Gönder
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Call Modal */}
            {
                showCallModal && (
                    <div className="call-modal-overlay">
                        <div className="call-modal">
                            <div className="call-header">
                                <div className="call-status">
                                    {callStatus === 'calling' ? 'Aranıyor...' :
                                        callStatus === 'connecting' ? 'Bağlanıyor...' :
                                            callStatus === 'ended' ? 'Arama Sonlandı' : 'Bağlandı'}
                                </div>
                                {callStatus === 'connected' && (
                                    <div className="call-duration">{formatDuration(callDuration)}</div>
                                )}
                            </div>

                            <div className="call-user-info">
                                {callType === 'video' ? (
                                    <div className="call-video-container">
                                        {/* Remote video (main display) */}
                                        <video
                                            ref={remoteVideoRef}
                                            autoPlay
                                            playsInline
                                            className="call-video remote-video"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                background: '#1a1a2e'
                                            }}
                                        />
                                        {/* Local video (small preview) */}
                                        <video
                                            ref={localVideoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="call-video local-video-preview"
                                            style={{
                                                position: 'absolute',
                                                top: '20px',
                                                right: '20px',
                                                width: '150px',
                                                height: '112px',
                                                borderRadius: '12px',
                                                border: '2px solid rgba(255,255,255,0.3)',
                                                objectFit: 'cover',
                                                zIndex: 10
                                            }}
                                        />
                                        <div className="call-overlay-name">{selectedFriend?.name}</div>
                                    </div>
                                ) : (
                                    <>
                                        <audio ref={remoteVideoRef} autoPlay />
                                        <div className="call-avatar-wrapper">
                                            <div className="call-avatar" style={{
                                                background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`
                                            }}>
                                                {selectedFriend?.avatar}
                                            </div>
                                            <div className="call-avatar-pulse" style={{ borderColor: currentTheme.primary }}></div>
                                        </div>
                                        <h2>{selectedFriend?.name}</h2>
                                    </>
                                )}
                                <p>{callType === 'video' ? 'Görüntülü Arama' : 'Sesli Arama'}</p>
                            </div>

                            <div className="call-controls">
                                <button
                                    className={`control-btn ${isMicMuted ? 'muted' : ''}`}
                                    onClick={toggleMic}
                                    title={isMicMuted ? 'Mikrofonu Aç' : 'Mikrofonu Kapat'}
                                    style={isMicMuted ? { background: '#ef4444' } : {}}
                                >
                                    {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
                                </button>
                                {callType === 'video' && (
                                    <button
                                        className={`control-btn ${isCameraOff ? 'muted' : ''}`}
                                        onClick={toggleCamera}
                                        title={isCameraOff ? 'Kamerayı Aç' : 'Kamerayı Kapat'}
                                        style={isCameraOff ? { background: '#ef4444' } : {}}
                                    >
                                        {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
                                    </button>
                                )}
                                <button className="control-btn end-call" onClick={() => endCall()} title="Sonlandır">
                                    <PhoneOff size={28} />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Incoming Call Modal */}
            {
                incomingCall && (
                    <div className="call-modal-overlay" style={{ zIndex: 10000 }}>
                        <div className="call-modal incoming-call-modal">
                            <div className="call-header">
                                <div className="call-status">Gelen Arama</div>
                            </div>

                            <div className="call-user-info">
                                <div className="call-avatar-wrapper">
                                    <div className="call-avatar" style={{
                                        background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`
                                    }}>
                                        {incomingCall.callerName?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="call-avatar-pulse" style={{ borderColor: currentTheme.primary }}></div>
                                </div>
                                <h2>{incomingCall.callerName}</h2>
                                <p>{incomingCall.callType === 'video' ? 'Görüntülü Arama' : 'Sesli Arama'}</p>
                            </div>

                            <div className="call-controls incoming-call-controls">
                                <button
                                    className="control-btn reject-call"
                                    onClick={rejectCall}
                                    title="Reddet"
                                    style={{ background: '#ef4444' }}
                                >
                                    <PhoneOff size={28} />
                                </button>
                                <button
                                    className="control-btn accept-call"
                                    onClick={answerCall}
                                    title="Cevapla"
                                    style={{
                                        background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                                        width: '80px',
                                        height: '80px'
                                    }}
                                >
                                    <Phone size={32} />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Confirmation Modal */}
            {
                confirmModal.isOpen && (
                    <div className="confirmation-modal-overlay absolute" onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}>
                        <div className="confirmation-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-icon">
                                {confirmModal.type === 'delete' ? <Trash2 size={32} /> : <LogOut size={32} />}
                            </div>
                            <h3>{confirmModal.title}</h3>
                            <div className="modal-message-box">
                                <p>{confirmModal.message}</p>
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="modal-btn cancel"
                                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                >
                                    Vazgeç
                                </button>
                                <button
                                    className="modal-btn confirm"
                                    onClick={handleConfirmAction}
                                >
                                    {confirmModal.type === 'delete' ? 'Sil' : 'Ayrıl'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
export default ChatPage;