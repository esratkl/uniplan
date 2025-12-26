import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["https://uniplan-frontend.onrender.com", "http://localhost:3000"],
        credentials: true
    },
    maxHttpBufferSize: 50 * 1024 * 1024 // 50MB
});
const prisma = new PrismaClient();

// CORS
app.use(cors({
    origin: ["https://uniplan-frontend.onrender.com", "http://localhost:3000"],
    credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/* ---------- AUTH MIDDLEWARE ---------- */
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) return res.status(401).json({ error: 'User not found' });

        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

/* ---------- TEST ROUTE ---------- */
app.get("/", (req, res) => {
    res.json({ message: "API çalışıyor! ✅" });
});

/* ---------- REGISTER ---------- */
app.post("/api/auth/register", async (req, res) => {
    const { email, password, name, full_name } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                email,
                password: hashed,
                name: name || full_name || email.split('@')[0]
            }
        });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

        res.json({
            message: "Registered successfully",
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.name,
                name: user.name
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(400).json({ error: "Email already used" });
    }
});

/* ---------- LOGIN ---------- */
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.name
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: "Login failed" });
    }
});

/* ---------- GET CURRENT USER ---------- */
app.get("/api/auth/me", authenticateToken, async (req, res) => {
    res.json({
        user: {
            id: req.user.id,
            email: req.user.email,
            full_name: req.user.name,
            name: req.user.name,
            avatar: req.user.avatar,
            bio: req.user.bio,
            phone: req.user.phone,
            status: req.user.status
        }
    });
});

/* ---------- CHANGE PASSWORD ---------- */
app.post("/api/auth/change-password", authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new password required" });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        const match = await bcrypt.compare(currentPassword, user.password);

        if (!match) {
            return res.status(400).json({ error: "Current password is incorrect" });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedNewPassword }
        });

        res.json({ message: "Password changed successfully" });
    } catch (err) {
        console.error('Password change error:', err);
        res.status(500).json({ error: "Failed to change password" });
    }
});

/* ---------- UPDATE PROFILE ---------- */
app.put("/api/profile", authenticateToken, async (req, res) => {
    const { name, bio, phone, avatar } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(name !== undefined && { name }),
                ...(bio !== undefined && { bio }),
                ...(phone !== undefined && { phone }),
                ...(avatar !== undefined && { avatar })
            }
        });

        res.json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                avatar: updatedUser.avatar,
                bio: updatedUser.bio,
                phone: updatedUser.phone
            }
        });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: "Failed to update profile" });
    }
});

/* ---------- SEARCH USERS ---------- */
app.get("/api/users/search", authenticateToken, async (req, res) => {
    const { q } = req.query;

    if (!q || q.length < 2) {
        return res.status(400).json({ error: "Search query must be at least 2 characters" });
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    { id: { not: req.user.id } }, // Exclude current user
                    {
                        OR: [
                            { name: { contains: q, mode: 'insensitive' } },
                            { email: { contains: q, mode: 'insensitive' } }
                        ]
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                status: true,
                lastSeen: true
            },
            take: 20
        });

        res.json(users);
    } catch (err) {
        console.error('User search error:', err);
        res.status(500).json({ error: "Failed to search users" });
    }
});

/* ---------- GET ALL USERS ---------- */
app.get("/api/users", authenticateToken, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                id: { not: req.user.id }
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                status: true,
                lastSeen: true
            },
            take: 50
        });

        res.json(users);
    } catch (err) {
        console.error('Users fetch error:', err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

/* ---------- GET MESSAGES ---------- */
app.get("/api/messages", authenticateToken, async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' },
            take: 100, // Son 100 mesaj
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        const formatted = messages.map(msg => ({
            id: msg.id,
            content: msg.text,
            sender_id: msg.userId,
            sender_name: msg.user.name || msg.user.email,
            created_at: msg.createdAt
        }));

        res.json(formatted);
    } catch (err) {
        console.error('Messages fetch error:', err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

/* ==================== DIRECT CHAT ENDPOINTS ==================== */

/* ---------- GET OR CREATE DIRECT CHAT ---------- */
app.post("/api/direct-chats", authenticateToken, async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "User ID required" });
    }

    try {
        // Check if chat already exists (bidirectional check)
        let chat = await prisma.directChat.findFirst({
            where: {
                OR: [
                    { user1Id: req.user.id, user2Id: userId },
                    { user1Id: userId, user2Id: req.user.id }
                ]
            },
            include: {
                user1: {
                    select: { id: true, name: true, email: true, avatar: true, status: true }
                },
                user2: {
                    select: { id: true, name: true, email: true, avatar: true, status: true }
                }
            }
        });

        // Create if doesn't exist
        if (!chat) {
            chat = await prisma.directChat.create({
                data: {
                    user1Id: req.user.id,
                    user2Id: userId
                },
                include: {
                    user1: {
                        select: { id: true, name: true, email: true, avatar: true, status: true }
                    },
                    user2: {
                        select: { id: true, name: true, email: true, avatar: true, status: true }
                    }
                }
            });
        }

        // Determine the other user
        const otherUser = chat.user1Id === req.user.id ? chat.user2 : chat.user1;

        res.json({
            id: chat.id,
            otherUser,
            createdAt: chat.createdAt
        });
    } catch (err) {
        console.error('Direct chat creation error:', err);
        res.status(500).json({ error: "Failed to create direct chat" });
    }
});

/* ---------- GET ALL DIRECT CHATS ---------- */
app.get("/api/direct-chats", authenticateToken, async (req, res) => {
    try {
        const chats = await prisma.directChat.findMany({
            where: {
                OR: [
                    { user1Id: req.user.id },
                    { user2Id: req.user.id }
                ]
            },
            include: {
                user1: {
                    select: { id: true, name: true, email: true, avatar: true, status: true, lastSeen: true }
                },
                user2: {
                    select: { id: true, name: true, email: true, avatar: true, status: true, lastSeen: true }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: {
                        sender: {
                            select: { id: true, name: true }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        const formatted = chats.map(chat => {
            const otherUser = chat.user1Id === req.user.id ? chat.user2 : chat.user1;
            const lastMessage = chat.messages[0] || null;

            return {
                id: chat.id,
                otherUser,
                lastMessage: lastMessage ? {
                    id: lastMessage.id,
                    text: lastMessage.text,
                    senderId: lastMessage.senderId,
                    senderName: lastMessage.sender.name,
                    createdAt: lastMessage.createdAt,
                    read: lastMessage.read
                } : null,
                updatedAt: chat.updatedAt
            };
        });

        res.json(formatted);
    } catch (err) {
        console.error('Direct chats fetch error:', err);
        res.status(500).json({ error: "Failed to fetch direct chats" });
    }
});

/* ---------- GET DIRECT CHAT MESSAGES ---------- */
app.get("/api/direct-chats/:chatId/messages", authenticateToken, async (req, res) => {
    const { chatId } = req.params;

    try {
        // Verify user is part of this chat
        const chat = await prisma.directChat.findFirst({
            where: {
                id: chatId,
                OR: [
                    { user1Id: req.user.id },
                    { user2Id: req.user.id }
                ]
            }
        });

        if (!chat) {
            return res.status(403).json({ error: "Access denied" });
        }

        const messages = await prisma.directMessage.findMany({
            where: { chatId },
            include: {
                sender: {
                    select: { id: true, name: true, email: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(messages);
    } catch (err) {
        console.error('Messages fetch error:', err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

/* ---------- SEND DIRECT MESSAGE ---------- */
app.post("/api/direct-chats/:chatId/messages", authenticateToken, async (req, res) => {
    const { chatId } = req.params;
    const { text, attachments } = req.body;

    if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: "Message text required" });
    }

    try {
        // Verify user is part of this chat
        const chat = await prisma.directChat.findFirst({
            where: {
                id: chatId,
                OR: [
                    { user1Id: req.user.id },
                    { user2Id: req.user.id }
                ]
            }
        });

        if (!chat) {
            return res.status(403).json({ error: "Access denied" });
        }

        const message = await prisma.directMessage.create({
            data: {
                chatId,
                senderId: req.user.id,
                text: text.trim(),
                attachments: attachments || [],
                fileUrl: req.body.fileUrl,
                fileName: req.body.fileName,
                fileType: req.body.fileType
            },
            include: {
                sender: {
                    select: { id: true, name: true, email: true, avatar: true }
                }
            }
        });

        // Update chat's updatedAt
        await prisma.directChat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() }
        });

        res.json(message);
    } catch (err) {
        console.error('Message send error:', err);
        res.status(500).json({ error: "Failed to send message" });
    }
});

/* ---------- MARK MESSAGES AS READ ---------- */
app.put("/api/direct-chats/:chatId/read", authenticateToken, async (req, res) => {
    const { chatId } = req.params;

    try {
        await prisma.directMessage.updateMany({
            where: {
                chatId,
                senderId: { not: req.user.id },
                read: false
            },
            data: { read: true }
        });

        res.json({ message: "Messages marked as read" });
    } catch (err) {
        console.error('Mark read error:', err);
        res.status(500).json({ error: "Failed to mark messages as read" });
    }
});

/* ---------- DELETE DIRECT MESSAGE ---------- */
app.delete("/api/direct-chats/messages/:messageId", authenticateToken, async (req, res) => {
    const { messageId } = req.params;

    try {
        const message = await prisma.directMessage.findUnique({
            where: { id: messageId }
        });

        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        if (message.senderId !== req.user.id) {
            return res.status(403).json({ error: "Can only delete your own messages" });
        }

        await prisma.directMessage.delete({ where: { id: messageId } });

        res.json({ message: "Message deleted" });
    } catch (err) {
        console.error('Message delete error:', err);
        res.status(500).json({ error: "Failed to delete message" });
    }
});

/* ==================== GROUP ENDPOINTS ==================== */

/* ---------- CREATE GROUP ---------- */
app.post("/api/groups", authenticateToken, async (req, res) => {
    const { name, description, color, avatar } = req.body;

    if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: "Group name required" });
    }

    try {
        const group = await prisma.group.create({
            data: {
                name: name.trim(),
                description: description || "",
                color: color || "#3b82f6",
                avatar: avatar || null,
                ownerId: req.user.id
            },
            include: {
                owner: {
                    select: { id: true, name: true, email: true, avatar: true }
                }
            }
        });

        // Add owner as admin member
        await prisma.groupMember.create({
            data: {
                groupId: group.id,
                userId: req.user.id,
                role: "admin"
            }
        });

        res.json(group);
    } catch (err) {
        console.error('Group creation error:', err);
        res.status(500).json({ error: "Failed to create group" });
    }
});

/* ---------- GET USER'S GROUPS ---------- */
app.get("/api/groups", authenticateToken, async (req, res) => {
    try {
        const memberships = await prisma.groupMember.findMany({
            where: { userId: req.user.id },
            include: {
                group: {
                    include: {
                        owner: {
                            select: { id: true, name: true, email: true, avatar: true }
                        },
                        members: {
                            include: {
                                user: {
                                    select: { id: true, name: true, email: true, avatar: true, status: true }
                                }
                            }
                        },
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                            include: {
                                sender: {
                                    select: { id: true, name: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { joinedAt: 'desc' }
        });

        const groups = memberships.map(m => ({
            ...m.group,
            memberCount: m.group.members.length,
            lastMessage: m.group.messages[0] || null,
            userRole: m.role
        }));

        res.json(groups);
    } catch (err) {
        console.error('Groups fetch error:', err);
        res.status(500).json({ error: "Failed to fetch groups" });
    }
});

/* ---------- GET GROUP DETAILS ---------- */
app.get("/api/groups/:groupId", authenticateToken, async (req, res) => {
    const { groupId } = req.params;

    try {
        // Check if user is a member
        const membership = await prisma.groupMember.findFirst({
            where: {
                groupId,
                userId: req.user.id
            }
        });

        if (!membership) {
            return res.status(403).json({ error: "Access denied" });
        }

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                owner: {
                    select: { id: true, name: true, email: true, avatar: true }
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatar: true, status: true, lastSeen: true }
                        }
                    },
                    orderBy: { joinedAt: 'asc' }
                }
            }
        });

        res.json({ ...group, userRole: membership.role });
    } catch (err) {
        console.error('Group fetch error:', err);
        res.status(500).json({ error: "Failed to fetch group" });
    }
});

/* ---------- GET GROUP MESSAGES ---------- */
app.get("/api/groups/:groupId/messages", authenticateToken, async (req, res) => {
    const { groupId } = req.params;

    try {
        // Verify user is a member
        const membership = await prisma.groupMember.findFirst({
            where: {
                groupId,
                userId: req.user.id
            }
        });

        if (!membership) {
            return res.status(403).json({ error: "Access denied" });
        }

        const messages = await prisma.groupMessage.findMany({
            where: { groupId },
            include: {
                sender: {
                    select: { id: true, name: true, email: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'asc' },
            take: 100
        });

        res.json(messages);
    } catch (err) {
        console.error('Group messages fetch error:', err);
        res.status(500).json({ error: "Failed to fetch group messages" });
    }
});

/* ---------- SEND GROUP MESSAGE ---------- */
app.post("/api/groups/:groupId/messages", authenticateToken, async (req, res) => {
    const { groupId } = req.params;
    const { text, attachments } = req.body;

    if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: "Message text required" });
    }

    try {
        // Verify user is a member
        const membership = await prisma.groupMember.findFirst({
            where: {
                groupId,
                userId: req.user.id
            }
        });

        if (!membership) {
            return res.status(403).json({ error: "Access denied" });
        }

        const message = await prisma.groupMessage.create({
            data: {
                groupId,
                senderId: req.user.id,
                text: text.trim(),
                attachments: attachments || [],
                fileUrl: req.body.fileUrl,
                fileName: req.body.fileName,
                fileType: req.body.fileType
            },
            include: {
                sender: {
                    select: { id: true, name: true, email: true, avatar: true }
                }
            }
        });

        res.json(message);
    } catch (err) {
        console.error('Group message send error:', err);
        res.status(500).json({ error: "Failed to send group message" });
    }
});

/* ---------- DELETE GROUP MESSAGE ---------- */
app.delete("/api/groups/messages/:messageId", authenticateToken, async (req, res) => {
    const { messageId } = req.params;

    try {
        const message = await prisma.groupMessage.findUnique({
            where: { id: messageId }
        });

        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        if (message.senderId !== req.user.id) {
            // Check if user is admin/owner, maybe allow them? For now strict sender only
            return res.status(403).json({ error: "Can only delete your own messages" });
        }

        await prisma.groupMessage.delete({ where: { id: messageId } });

        res.json({ message: "Message deleted" });
    } catch (err) {
        console.error('Group message delete error:', err);
        res.status(500).json({ error: "Failed to delete group message" });
    }
});

/* ---------- ADD GROUP MEMBER ---------- */
app.post("/api/groups/:groupId/members", authenticateToken, async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "User ID required" });
    }

    try {
        // Check if requester is admin or owner
        const requesterMembership = await prisma.groupMember.findFirst({
            where: {
                groupId,
                userId: req.user.id,
                role: "admin"
            }
        });

        if (!requesterMembership) {
            return res.status(403).json({ error: "Only admins can add members" });
        }

        // Check if user is already a member
        const existingMember = await prisma.groupMember.findFirst({
            where: { groupId, userId }
        });

        if (existingMember) {
            return res.status(400).json({ error: "User is already a member" });
        }

        const member = await prisma.groupMember.create({
            data: {
                groupId,
                userId,
                role: "member"
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatar: true, status: true }
                }
            }
        });

        res.json(member);
    } catch (err) {
        console.error('Add member error:', err);
        res.status(500).json({ error: "Failed to add member" });
    }
});

/* ---------- REMOVE GROUP MEMBER ---------- */
app.delete("/api/groups/:groupId/members/:userId", authenticateToken, async (req, res) => {
    const { groupId, userId } = req.params;

    try {
        const group = await prisma.group.findUnique({ where: { id: groupId } });

        // Only owner or the user themselves can remove
        if (group.ownerId !== req.user.id && userId !== req.user.id) {
            return res.status(403).json({ error: "Access denied" });
        }

        // Can't remove owner
        if (userId === group.ownerId) {
            return res.status(400).json({ error: "Cannot remove group owner" });
        }

        await prisma.groupMember.deleteMany({
            where: { groupId, userId }
        });

        res.json({ message: "Member removed successfully" });
    } catch (err) {
        console.error('Remove member error:', err);
        res.status(500).json({ error: "Failed to remove member" });
    }
});

/* ---------- UPDATE GROUP ---------- */
app.put("/api/groups/:groupId", authenticateToken, async (req, res) => {
    const { groupId } = req.params;
    const { name, description, color, avatar } = req.body;

    try {
        // Verify user is admin
        const membership = await prisma.groupMember.findFirst({
            where: {
                groupId,
                userId: req.user.id,
                role: "admin"
            }
        });

        if (!membership) {
            return res.status(403).json({ error: "Only admins can update group" });
        }

        const updatedGroup = await prisma.group.update({
            where: { id: groupId },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(color !== undefined && { color }),
                ...(avatar !== undefined && { avatar })
            }
        });

        res.json(updatedGroup);
    } catch (err) {
        console.error('Update group error:', err);
        res.status(500).json({ error: "Failed to update group" });
    }
});

/* ==================== TODO ENDPOINTS ==================== */

/* ---------- GET ALL TODOS ---------- */
app.get("/api/todos", authenticateToken, async (req, res) => {
    try {
        const todos = await prisma.todo.findMany({
            where: { userId: req.user.id },
            orderBy: [
                { completed: 'asc' },
                { priority: 'desc' },
                { createdAt: 'desc' }
            ]
        });
        res.json(todos);
    } catch (err) {
        console.error('Todos fetch error:', err);
        res.status(500).json({ error: "Failed to fetch todos" });
    }
});

/* ---------- CREATE TODO ---------- */
app.post("/api/todos", authenticateToken, async (req, res) => {
    const { title, description, priority, dueDate, category } = req.body;

    if (!title || title.trim().length === 0) {
        return res.status(400).json({ error: "Todo title required" });
    }

    try {
        const todo = await prisma.todo.create({
            data: {
                title: title.trim(),
                description: description || null,
                priority: priority || "medium",
                dueDate: dueDate ? new Date(dueDate) : null,
                category: category || null,
                userId: req.user.id
            }
        });
        res.json(todo);
    } catch (err) {
        console.error('Todo creation error:', err);
        res.status(500).json({ error: "Failed to create todo" });
    }
});

/* ---------- UPDATE TODO ---------- */
app.put("/api/todos/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, description, completed, priority, dueDate, category } = req.body;

    try {
        const todo = await prisma.todo.findFirst({
            where: { id, userId: req.user.id }
        });

        if (!todo) {
            return res.status(404).json({ error: "Todo not found" });
        }

        const updatedTodo = await prisma.todo.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(completed !== undefined && { completed }),
                ...(priority !== undefined && { priority }),
                ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
                ...(category !== undefined && { category })
            }
        });

        res.json(updatedTodo);
    } catch (err) {
        console.error('Todo update error:', err);
        res.status(500).json({ error: "Failed to update todo" });
    }
});

/* ---------- DELETE TODO ---------- */
app.delete("/api/todos/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const todo = await prisma.todo.findFirst({
            where: { id, userId: req.user.id }
        });

        if (!todo) {
            return res.status(404).json({ error: "Todo not found" });
        }

        await prisma.todo.delete({ where: { id } });
        res.json({ message: "Todo deleted successfully" });
    } catch (err) {
        console.error('Todo delete error:', err);
        res.status(500).json({ error: "Failed to delete todo" });
    }
});

/* ==================== CALENDAR EVENTS ENDPOINTS ==================== */

/* ---------- GET ALL EVENTS ---------- */
app.get("/api/events", authenticateToken, async (req, res) => {
    try {
        const events = await prisma.calendarEvent.findMany({
            where: { userId: req.user.id },
            orderBy: { startTime: 'asc' }
        });
        res.json(events);
    } catch (err) {
        console.error('Events fetch error:', err);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});

/* ---------- GET TODAY'S EVENTS ---------- */
app.get("/api/events/today", authenticateToken, async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const events = await prisma.calendarEvent.findMany({
            where: {
                userId: req.user.id,
                startTime: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            },
            orderBy: { startTime: 'asc' }
        });
        res.json(events);
    } catch (err) {
        console.error('Today events fetch error:', err);
        res.status(500).json({ error: "Failed to fetch today's events" });
    }
});

/* ---------- CREATE EVENT ---------- */
app.post("/api/events", authenticateToken, async (req, res) => {
    const { title, description, startTime, endTime, allDay, color } = req.body;

    if (!title || !startTime || !endTime) {
        return res.status(400).json({ error: "Title, start time, and end time required" });
    }

    try {
        const event = await prisma.calendarEvent.create({
            data: {
                title: title.trim(),
                description: description || null,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                allDay: allDay || false,
                color: color || "#3b82f6",
                userId: req.user.id
            }
        });
        res.json(event);
    } catch (err) {
        console.error('Event creation error:', err);
        res.status(500).json({ error: "Failed to create event" });
    }
});

/* ---------- UPDATE EVENT ---------- */
app.put("/api/events/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, description, startTime, endTime, allDay, color } = req.body;

    try {
        const event = await prisma.calendarEvent.findFirst({
            where: { id, userId: req.user.id }
        });

        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        const updatedEvent = await prisma.calendarEvent.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(startTime !== undefined && { startTime: new Date(startTime) }),
                ...(endTime !== undefined && { endTime: new Date(endTime) }),
                ...(allDay !== undefined && { allDay }),
                ...(color !== undefined && { color })
            }
        });

        res.json(updatedEvent);
    } catch (err) {
        console.error('Event update error:', err);
        res.status(500).json({ error: "Failed to update event" });
    }
});

/* ---------- DELETE EVENT ---------- */
app.delete("/api/events/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const event = await prisma.calendarEvent.findFirst({
            where: { id, userId: req.user.id }
        });

        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        await prisma.calendarEvent.delete({ where: { id } });
        res.json({ message: "Event deleted successfully" });
    } catch (err) {
        console.error('Event delete error:', err);
        res.status(500).json({ error: "Failed to delete event" });
    }
});

/* ==================== POMODORO ENDPOINTS ==================== */

/* ---------- GET POMODORO SESSIONS ---------- */
app.get("/api/pomodoro/sessions", authenticateToken, async (req, res) => {
    try {
        const sessions = await prisma.pomodoroSession.findMany({
            where: { userId: req.user.id },
            orderBy: { completedAt: 'desc' },
            take: 50
        });
        res.json(sessions);
    } catch (err) {
        console.error('Pomodoro sessions fetch error:', err);
        res.status(500).json({ error: "Failed to fetch pomodoro sessions" });
    }
});

/* ---------- GET TODAY'S POMODORO SESSIONS ---------- */
app.get("/api/pomodoro/today", authenticateToken, async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const sessions = await prisma.pomodoroSession.findMany({
            where: {
                userId: req.user.id,
                completedAt: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            },
            orderBy: { completedAt: 'desc' }
        });

        // Bugünkü toplam odaklanma süresini hesapla
        const focusSessions = sessions.filter(s => s.type === 'focus');
        const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + s.duration, 0);

        res.json({
            sessions,
            totalFocusMinutes,
            sessionCount: focusSessions.length
        });
    } catch (err) {
        console.error('Today pomodoro fetch error:', err);
        res.status(500).json({ error: "Failed to fetch today's pomodoro data" });
    }
});

/* ---------- CREATE POMODORO SESSION ---------- */
app.post("/api/pomodoro/sessions", authenticateToken, async (req, res) => {
    const { duration, type } = req.body;

    if (!duration || duration <= 0) {
        return res.status(400).json({ error: "Valid duration required" });
    }

    try {
        const session = await prisma.pomodoroSession.create({
            data: {
                duration,
                type: type || "focus",
                userId: req.user.id
            }
        });
        res.json(session);
    } catch (err) {
        console.error('Pomodoro session creation error:', err);
        res.status(500).json({ error: "Failed to create pomodoro session" });
    }
});

/* ==================== WEEKLY PERFORMANCE ENDPOINTS ==================== */

// Helper function: Haftanın başlangıcını al (Pazartesi)
const getWeekStart = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Pazartesi'ye ayarla
    const weekStart = new Date(d.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
};

/* ---------- GET WEEKLY PERFORMANCE ---------- */
app.get("/api/weekly-performance", authenticateToken, async (req, res) => {
    try {
        const weekStart = getWeekStart();

        let performance = await prisma.weeklyPerformance.findFirst({
            where: {
                userId: req.user.id,
                weekStart: weekStart
            }
        });

        // Eğer bu hafta için kayıt yoksa, boş skorlarla döndür
        if (!performance) {
            performance = {
                id: null,
                weekStart,
                scores: [null, null, null, null, null, null, null],
                userId: req.user.id
            };
        }

        res.json(performance);
    } catch (err) {
        console.error('Weekly performance fetch error:', err);
        res.status(500).json({ error: "Failed to fetch weekly performance" });
    }
});

/* ---------- UPDATE WEEKLY PERFORMANCE ---------- */
app.put("/api/weekly-performance", authenticateToken, async (req, res) => {
    const { scores } = req.body;

    if (!Array.isArray(scores) || scores.length !== 7) {
        return res.status(400).json({ error: "Scores must be an array of 7 values" });
    }

    try {
        const weekStart = getWeekStart();

        // Upsert: varsa güncelle, yoksa oluştur
        const performance = await prisma.weeklyPerformance.upsert({
            where: {
                userId_weekStart: {
                    userId: req.user.id,
                    weekStart: weekStart
                }
            },
            update: { scores },
            create: {
                weekStart,
                scores,
                userId: req.user.id
            }
        });

        res.json(performance);
    } catch (err) {
        console.error('Weekly performance update error:', err);
        res.status(500).json({ error: "Failed to update weekly performance" });
    }
});

/* ==================== DASHBOARD STATS ENDPOINT ==================== */

/* ---------- GET DASHBOARD STATS ---------- */
app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        const weekStart = getWeekStart();

        // Bekleyen görevler
        const pendingTodos = await prisma.todo.count({
            where: {
                userId: req.user.id,
                completed: false
            }
        });

        // Tamamlanan görevler (bugün)
        const completedTodosToday = await prisma.todo.count({
            where: {
                userId: req.user.id,
                completed: true,
                updatedAt: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            }
        });

        // Toplam görevler
        const totalTodos = await prisma.todo.count({
            where: { userId: req.user.id }
        });

        // Bugünün etkinlikleri
        const todayEvents = await prisma.calendarEvent.count({
            where: {
                userId: req.user.id,
                startTime: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            }
        });

        // Bugünün pomodoro oturumları
        const todayPomodoroSessions = await prisma.pomodoroSession.findMany({
            where: {
                userId: req.user.id,
                type: 'focus',
                completedAt: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            }
        });

        const totalFocusMinutes = todayPomodoroSessions.reduce((sum, s) => sum + s.duration, 0);

        // Bu haftanın performansı
        let weeklyPerformance = await prisma.weeklyPerformance.findFirst({
            where: {
                userId: req.user.id,
                weekStart: weekStart
            }
        });

        // Progress ring için başarı yüzdesi hesapla
        let progressPercent = 0;
        if (totalTodos > 0) {
            const completedTodos = await prisma.todo.count({
                where: {
                    userId: req.user.id,
                    completed: true
                }
            });
            progressPercent = Math.round((completedTodos / totalTodos) * 100);
        }

        res.json({
            pendingTodos,
            completedTodosToday,
            totalTodos,
            todayEvents,
            focusMinutes: totalFocusMinutes,
            focusFormatted: totalFocusMinutes >= 60
                ? `${Math.floor(totalFocusMinutes / 60)}s ${totalFocusMinutes % 60}dk`
                : `${totalFocusMinutes}dk`,
            progressPercent,
            weeklyScores: weeklyPerformance?.scores || [null, null, null, null, null, null, null]
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
});

/* ---------- SOCKET.IO ---------- */
// Store user socket mappings
const userSockets = new Map(); // userId -> socketId

io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    let currentUserId = null;

    // User authentication and setup
    socket.on("user_connected", async (data) => {
        try {
            const { userId } = data;
            currentUserId = userId;
            userSockets.set(userId, socket.id);

            // Update user status to online
            await prisma.user.update({
                where: { id: userId },
                data: { status: "online", lastSeen: new Date() }
            });

            // Broadcast user came online
            io.emit("user_status_change", { userId, status: "online" });

            console.log(`✅ User ${userId} is online`);
        } catch (err) {
            console.error('User connection error:', err);
        }
    });

    // Join a direct chat room
    socket.on("join_direct_chat", (data) => {
        const { chatId } = data;
        socket.join(`direct_chat_${chatId}`);
        console.log(`📱 Socket ${socket.id} joined direct chat ${chatId}`);
    });

    // Leave a direct chat room
    socket.on("leave_direct_chat", (data) => {
        const { chatId } = data;
        socket.leave(`direct_chat_${chatId}`);
        console.log(`📱 Socket ${socket.id} left direct chat ${chatId}`);
    });

    // Send direct message
    socket.on("send_direct_message", async (data) => {
        try {

            const { chatId, text, senderId } = data;
            console.log("📨 Direct message received:", { ...data, fileUrl: data.fileUrl ? 'HAS_URL' : 'NO_URL' });

            // Get chat to verify and get recipient
            const chat = await prisma.directChat.findUnique({
                where: { id: chatId },
                include: {
                    user1: { select: { id: true, name: true, email: true, avatar: true } },
                    user2: { select: { id: true, name: true, email: true, avatar: true } }
                }
            });

            if (!chat) {
                socket.emit("error", { message: "Chat not found" });
                return;
            }

            // Create message in database
            const message = await prisma.directMessage.create({
                data: {
                    chatId,
                    senderId,
                    text: text.trim(),
                    fileUrl: data.fileUrl,
                    fileName: data.fileName,
                    fileType: data.fileType
                },
                include: {
                    sender: {
                        select: { id: true, name: true, email: true, avatar: true }
                    }
                }
            });

            // Update chat timestamp
            await prisma.directChat.update({
                where: { id: chatId },
                data: { updatedAt: new Date() }
            });

            // Send to all users in this chat room
            io.to(`direct_chat_${chatId}`).emit("receive_direct_message", {
                ...message,
                chatId
            });

            console.log("✅ Direct message sent:", message.id);
        } catch (err) {
            console.error('❌ Direct message error:', err);
            socket.emit("error", { message: "Failed to send message" });
        }
    });

    // Delete direct message
    socket.on("delete_direct_message", async (data) => {
        try {
            const { messageId, chatId, senderId } = data;

            // Verify ownership in DB first usually, but for speed we rely on client sending correct data
            // Ideally we should double check DB
            const message = await prisma.directMessage.findUnique({ where: { id: messageId } });

            if (message && message.senderId === senderId) {
                await prisma.directMessage.delete({ where: { id: messageId } });

                io.to(`direct_chat_${chatId}`).emit("direct_message_deleted", { messageId, chatId });
                console.log(`🗑️ Direct message ${messageId} deleted`);
            }
        } catch (err) {
            console.error('Delete direct message error:', err);
        }
    });

    // Join a group room
    socket.on("join_group", (data) => {
        const { groupId } = data;
        socket.join(`group_${groupId}`);
        console.log(`👥 Socket ${socket.id} joined group ${groupId}`);
    });

    // Leave a group room
    socket.on("leave_group", (data) => {
        const { groupId } = data;
        socket.leave(`group_${groupId}`);
        console.log(`👥 Socket ${socket.id} left group ${groupId}`);
    });

    // Send group message
    socket.on("send_group_message", async (data) => {
        try {
            const { groupId, text, senderId } = data;
            console.log("📨 Group message received:", { ...data, fileUrl: data.fileUrl ? 'HAS_URL' : 'NO_URL' });

            // Verify user is a member
            const membership = await prisma.groupMember.findFirst({
                where: { groupId, userId: senderId }
            });

            if (!membership) {
                socket.emit("error", { message: "Not a member of this group" });
                return;
            }

            // Create message
            const message = await prisma.groupMessage.create({
                data: {
                    groupId,
                    senderId,
                    text: text.trim(),
                    fileUrl: data.fileUrl,
                    fileName: data.fileName,
                    fileType: data.fileType
                },
                include: {
                    sender: {
                        select: { id: true, name: true, email: true, avatar: true }
                    }
                }
            });

            // Send to all users in this group room
            io.to(`group_${groupId}`).emit("receive_group_message", {
                ...message,
                groupId
            });

            console.log("✅ Group message sent:", message.id);
        } catch (err) {
            console.error('❌ Group message error:', err);
            socket.emit("error", { message: "Failed to send group message" });
        }
    });

    // Delete group message
    socket.on("delete_group_message", async (data) => {
        try {
            const { messageId, groupId, senderId } = data;

            const message = await prisma.groupMessage.findUnique({ where: { id: messageId } });

            if (message && message.senderId === senderId) {
                await prisma.groupMessage.delete({ where: { id: messageId } });

                io.to(`group_${groupId}`).emit("group_message_deleted", { messageId, groupId });
                console.log(`🗑️ Group message ${messageId} deleted`);
            }
        } catch (err) {
            console.error('Delete group message error:', err);
        }
    });

    // Typing indicators for direct chat
    socket.on("typing_direct", (data) => {
        const { chatId, userId, userName } = data;
        socket.to(`direct_chat_${chatId}`).emit("user_typing_direct", {
            chatId,
            userId,
            userName
        });
    });

    socket.on("stop_typing_direct", (data) => {
        const { chatId, userId } = data;
        socket.to(`direct_chat_${chatId}`).emit("user_stop_typing_direct", {
            chatId,
            userId
        });
    });

    // Typing indicators for groups
    socket.on("typing_group", (data) => {
        const { groupId, userId, userName } = data;
        socket.to(`group_${groupId}`).emit("user_typing_group", {
            groupId,
            userId,
            userName
        });
    });

    socket.on("stop_typing_group", (data) => {
        const { groupId, userId } = data;
        socket.to(`group_${groupId}`).emit("user_stop_typing_group", {
            groupId,
            userId
        });
    });

    // Mark messages as read
    socket.on("mark_messages_read", async (data) => {
        try {
            const { chatId, userId } = data;

            await prisma.directMessage.updateMany({
                where: {
                    chatId,
                    senderId: { not: userId },
                    read: false
                },
                data: { read: true }
            });

            // Notify the other user
            socket.to(`direct_chat_${chatId}`).emit("messages_read", { chatId, readBy: userId });
        } catch (err) {
            console.error('Mark read error:', err);
        }
    });

    // WebRTC Call Signaling Events
    socket.on("call_initiate", (data) => {
        const { targetUserId, callerId, callerName, callType, chatId } = data;

        console.log('📞 Call initiate received:', { targetUserId, callerId, callerName });
        console.log('👥 Current online users:', Array.from(userSockets.keys()));

        const targetSocketId = userSockets.get(targetUserId);

        console.log('🔍 Target socket ID:', targetSocketId || 'NOT FOUND');

        if (targetSocketId) {
            io.to(targetSocketId).emit("incoming_call", {
                callerId,
                callerName,
                callType,
                chatId
            });
            console.log(`📞 Call initiated from ${callerId} to ${targetUserId}`);
        } else {
            socket.emit("call_failed", { message: "User is offline" });
        }
    });

    socket.on("call_answer", (data) => {
        const { callerId, answererId, answererName } = data;
        const callerSocketId = userSockets.get(callerId);

        if (callerSocketId) {
            io.to(callerSocketId).emit("call_accepted", {
                answererId,
                answererName
            });
            console.log(`📞 Call answered by ${answererId}`);
        }
    });

    socket.on("call_reject", (data) => {
        const { callerId } = data;
        const callerSocketId = userSockets.get(callerId);

        if (callerSocketId) {
            io.to(callerSocketId).emit("call_rejected");
            console.log(`📞 Call rejected`);
        }
    });

    socket.on("call_end", (data) => {
        const { targetUserId } = data;
        const targetSocketId = userSockets.get(targetUserId);

        if (targetSocketId) {
            io.to(targetSocketId).emit("call_ended");
            console.log(`📞 Call ended`);
        }
    });

    socket.on("webrtc_offer", (data) => {
        const { targetUserId, offer } = data;
        const targetSocketId = userSockets.get(targetUserId);

        if (targetSocketId) {
            io.to(targetSocketId).emit("webrtc_offer", { offer });
            console.log(`🔗 WebRTC offer sent to ${targetUserId}`);
        }
    });

    socket.on("webrtc_answer", (data) => {
        const { targetUserId, answer } = data;
        const targetSocketId = userSockets.get(targetUserId);

        if (targetSocketId) {
            io.to(targetSocketId).emit("webrtc_answer", { answer });
            console.log(`🔗 WebRTC answer sent to ${targetUserId}`);
        }
    });

    socket.on("webrtc_ice_candidate", (data) => {
        const { targetUserId, candidate } = data;
        console.log('🧊 ICE candidate received for:', targetUserId);

        const targetSocketId = userSockets.get(targetUserId);

        if (targetSocketId) {
            io.to(targetSocketId).emit("webrtc_ice_candidate", { candidate });
            console.log(`✅ ICE candidate forwarded to ${targetUserId} (socket: ${targetSocketId})`);
        } else {
            console.log(`❌ Target user ${targetUserId} NOT FOUND in userSockets`);
            console.log('👥 Current online users:', Array.from(userSockets.keys()));
        }
    });

    // Legacy message support (for backward compatibility)
    socket.on("send_message", async (data) => {
        try {
            console.log("📨 Legacy message received:", data);

            const message = await prisma.message.create({
                data: {
                    text: data.content,
                    userId: data.sender_id
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            const formatted = {
                id: message.id,
                content: message.text,
                sender_id: message.userId,
                sender_name: message.user.name || message.user.email,
                created_at: message.createdAt
            };

            io.emit("receive_message", formatted);
            console.log("✅ Legacy message broadcasted:", formatted);
        } catch (err) {
            console.error('❌ Legacy message error:', err);
            socket.emit("error", { message: "Failed to send message" });
        }
    });

    // Disconnect
    socket.on("disconnect", async () => {
        console.log("❌ User disconnected:", socket.id);

        if (currentUserId) {
            try {
                // Update user status to offline
                await prisma.user.update({
                    where: { id: currentUserId },
                    data: { status: "offline", lastSeen: new Date() }
                });

                // Remove from user sockets map
                userSockets.delete(currentUserId);

                // Broadcast user went offline
                io.emit("user_status_change", {
                    userId: currentUserId,
                    status: "offline",
                    lastSeen: new Date()
                });

                console.log(`❌ User ${currentUserId} is offline`);
            } catch (err) {
                console.error('Disconnect error:', err);
            }
        }
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));