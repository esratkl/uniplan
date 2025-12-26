import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, MessageCircle } from 'lucide-react';

const UserSearchModal = ({ isOpen, onClose, query, onChangeQuery, results, onSearch, onSendRequest, onStartChat }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="w-full max-w-lg rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-white/50 dark:border-slate-800 shadow-2xl"
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.92, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/50 dark:border-slate-800">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Yeni Kişi Ekle</p>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Kullanıcı adı ile ara</h3>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-5 space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="kullanıcı adı yaz..."
                                value={query}
                                onChange={(e) => onChangeQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && onSearch(e.target.value)}
                            />
                            <button
                                onClick={() => onSearch(query)}
                                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg"
                            >
                                <Search size={18} /> Ara
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[320px] overflow-y-auto">
                            {results.length === 0 ? (
                                <div className="text-center text-slate-500 dark:text-slate-400 py-10">
                                    {query ? 'Kullanıcı bulunamadı.' : 'Aramak için bir kullanıcı adı girin.'}
                                </div>
                            ) : (
                                results.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-3 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-amber-400 text-white font-bold grid place-items-center">
                                                {user.avatar}
                                                <span
                                                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                                        user.online ? 'bg-emerald-400' : 'bg-slate-400'
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">@{user.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onSendRequest(user.id)}
                                                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100 text-sm font-semibold hover:scale-[1.02] transition"
                                            >
                                                <UserPlus size={14} /> İstek
                                            </button>
                                            <button
                                                onClick={() => onStartChat(user)}
                                                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow"
                                            >
                                                <MessageCircle size={14} /> Mesaj
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default UserSearchModal;
