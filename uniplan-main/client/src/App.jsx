import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import CalendarPage from './pages/CalendarPage';
import TodoListPage from './pages/TodoListPage';
import PomodoroPage from './pages/PomodoroPage';
import ChatPage from './pages/ChatPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <AuthProvider>
                    <Router>
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />

                            <Route
                                path="/dashboard"
                                element={(
                                    <ProtectedRoute>
                                        <DashboardLayout />
                                    </ProtectedRoute>
                                )}
                            >
                                <Route index element={<DashboardHome />} />
                                <Route path="calendar" element={<CalendarPage />} />
                                <Route path="todo" element={<TodoListPage />} />
                                <Route path="pomodoro" element={<PomodoroPage />} />
                                <Route path="chat" element={<ChatPage />} />
                                <Route path="groups" element={<GroupsPage />} />
                                <Route path="groups/:groupId" element={<GroupDetailPage />} />
                                <Route path="profile" element={<ProfilePage />} />
                                <Route path="settings" element={<SettingsPage />} />
                            </Route>
                        </Routes>
                    </Router>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
