// API utility for messaging and groups
const API_URL = process.env.REACT_APP_API_URL || '';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// User APIs
export const userAPI = {
    getAll: async () => {
        const res = await fetch(`${API_URL}/api/users`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    },

    search: async (query) => {
        const res = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to search users');
        return res.json();
    }
};

// Direct Chat APIs
export const directChatAPI = {
    getAll: async () => {
        const res = await fetch(`${API_URL}/api/direct-chats`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch chats');
        return res.json();
    },

    getOrCreate: async (userId) => {
        const res = await fetch(`${API_URL}/api/direct-chats`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ userId })
        });
        if (!res.ok) throw new Error('Failed to create chat');
        return res.json();
    },

    getMessages: async (chatId) => {
        const res = await fetch(`${API_URL}/api/direct-chats/${chatId}/messages`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch messages');
        return res.json();
    },

    sendMessage: async (chatId, text, attachments = []) => {
        const res = await fetch(`${API_URL}/api/direct-chats/${chatId}/messages`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ text, attachments })
        });
        if (!res.ok) throw new Error('Failed to send message');
        return res.json();
    },

    markAsRead: async (chatId) => {
        const res = await fetch(`${API_URL}/api/direct-chats/${chatId}/read`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to mark as read');
        return res.json();
    },

    deleteMessage: async (messageId) => {
        const res = await fetch(`${API_URL}/api/direct-chats/messages/${messageId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete message');
        return res.json();
    }
};

// Group APIs
export const groupAPI = {
    getAll: async () => {
        const res = await fetch(`${API_URL}/api/groups`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch groups');
        return res.json();
    },

    get: async (groupId) => {
        const res = await fetch(`${API_URL}/api/groups/${groupId}`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch group');
        return res.json();
    },

    create: async (name, description, color, avatar) => {
        const res = await fetch(`${API_URL}/api/groups`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, description, color, avatar })
        });
        if (!res.ok) throw new Error('Failed to create group');
        return res.json();
    },

    update: async (groupId, data) => {
        const res = await fetch(`${API_URL}/api/groups/${groupId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update group');
        return res.json();
    },

    getMessages: async (groupId) => {
        const res = await fetch(`${API_URL}/api/groups/${groupId}/messages`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch messages');
        return res.json();
    },

    sendMessage: async (groupId, text, attachments = []) => {
        const res = await fetch(`${API_URL}/api/groups/${groupId}/messages`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ text, attachments })
        });
        if (!res.ok) throw new Error('Failed to send message');
        return res.json();
    },

    addMember: async (groupId, userId) => {
        const res = await fetch(`${API_URL}/api/groups/${groupId}/members`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ userId })
        });
        if (!res.ok) throw new Error('Failed to add member');
        return res.json();
    },

    removeMember: async (groupId, userId) => {
        const res = await fetch(`${API_URL}/api/groups/${groupId}/members/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to remove member');
        return res.json();
    }
};

// Dashboard Stats API
export const dashboardAPI = {
    getStats: async () => {
        const res = await fetch(`${API_URL}/api/dashboard/stats`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard stats');
        return res.json();
    }
};

// Todo APIs
export const todoAPI = {
    getAll: async () => {
        const res = await fetch(`${API_URL}/api/todos`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch todos');
        return res.json();
    },

    create: async (data) => {
        const res = await fetch(`${API_URL}/api/todos`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create todo');
        return res.json();
    },

    update: async (id, data) => {
        const res = await fetch(`${API_URL}/api/todos/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update todo');
        return res.json();
    },

    delete: async (id) => {
        const res = await fetch(`${API_URL}/api/todos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete todo');
        return res.json();
    }
};

// Calendar Events APIs
export const eventsAPI = {
    getAll: async () => {
        const res = await fetch(`${API_URL}/api/events`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch events');
        return res.json();
    },

    getToday: async () => {
        const res = await fetch(`${API_URL}/api/events/today`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch today events');
        return res.json();
    },

    create: async (data) => {
        const res = await fetch(`${API_URL}/api/events`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create event');
        return res.json();
    },

    update: async (id, data) => {
        const res = await fetch(`${API_URL}/api/events/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update event');
        return res.json();
    },

    delete: async (id) => {
        const res = await fetch(`${API_URL}/api/events/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete event');
        return res.json();
    }
};

// Pomodoro APIs
export const pomodoroAPI = {
    getSessions: async () => {
        const res = await fetch(`${API_URL}/api/pomodoro/sessions`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch pomodoro sessions');
        return res.json();
    },

    getToday: async () => {
        const res = await fetch(`${API_URL}/api/pomodoro/today`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch today pomodoro');
        return res.json();
    },

    createSession: async (duration, type = 'focus') => {
        const res = await fetch(`${API_URL}/api/pomodoro/sessions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ duration, type })
        });
        if (!res.ok) throw new Error('Failed to create pomodoro session');
        return res.json();
    }
};

// Weekly Performance APIs
export const weeklyPerformanceAPI = {
    get: async () => {
        const res = await fetch(`${API_URL}/api/weekly-performance`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch weekly performance');
        return res.json();
    },

    update: async (scores) => {
        const res = await fetch(`${API_URL}/api/weekly-performance`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ scores })
        });
        if (!res.ok) throw new Error('Failed to update weekly performance');
        return res.json();
    }
};
