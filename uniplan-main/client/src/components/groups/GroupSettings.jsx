import React from 'react';
import { Shield, ShieldAlert, Copy, QrCode } from 'lucide-react';

const GroupSettings = ({ group, members, currentUserRole, onUpdateRole }) => {
    const inviteLink = `https://uniplan.app/join/${group.id}`;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Kopyalandı!');
    };

    return (
        <div className="group-section">
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h3>Üyeler ve Yetkiler</h3>
                    <div className="member-list" style={{ marginTop: '1rem' }}>
                        {members.map(member => (
                            <div key={member.id} className="member-row">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div className="member-avatar-sm" style={{ width: '40px', height: '40px', fontSize: '1rem', margin: 0 }}>
                                        {member.avatar}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{member.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>@{member.username}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div className={`role-badge ${member.role === 'admin' ? 'role-admin' : 'role-member'}`}>
                                        {member.role === 'admin' ? 'Yönetici' : 'Üye'}
                                    </div>

                                    {currentUserRole === 'admin' && member.id !== 101 && ( // Assuming 101 is current user/creator for demo
                                        <button
                                            className="btn"
                                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                            onClick={() => onUpdateRole(member.id, member.role === 'admin' ? 'member' : 'admin')}
                                        >
                                            {member.role === 'admin' ? 'Üye Yap' : 'Yönetici Yap'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <h3>Davet Bağlantısı</h3>
                        <div className="search-input-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
                            <input type="text" className="modal-input" value={inviteLink} readOnly />
                            <button className="btn btn-primary" onClick={() => copyToClipboard(inviteLink)}>
                                <Copy size={18} />
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3>Grup Bilgileri</h3>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
                            <div style={{ marginBottom: '0.5rem' }}><strong>Grup Adı:</strong> {group.name}</div>
                            <div><strong>Grup Şifresi:</strong> {group.password}</div>
                        </div>
                    </div>

                    <div className="qr-section">
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${inviteLink}`}
                            alt="Group QR Code"
                            className="qr-code"
                        />
                        <p style={{ color: 'black', fontWeight: 500 }}>Gruba Katılmak İçin Okut</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupSettings;
