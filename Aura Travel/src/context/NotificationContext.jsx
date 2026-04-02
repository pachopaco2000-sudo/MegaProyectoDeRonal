import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3500);
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification && (
                <div className="toast-anim" style={{
                    position: 'fixed',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: notification.type === 'error' ? '#fee2e2' : '#ffffff',
                    color: notification.type === 'error' ? '#ef4444' : '#1e293b',
                    padding: '16px 24px',
                    borderRadius: '50px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    zIndex: 9999,
                    fontWeight: '700',
                    border: notification.type === 'error' ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                    minWidth: '280px',
                    justifyContent: 'center',
                }}>
                    <style>{`
                        @keyframes slideUpToast {
                            0% { opacity: 0; transform: translate(-50%, 20px); }
                            100% { opacity: 1; transform: translate(-50%, 0); }
                        }
                        .toast-anim { animation: slideUpToast 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                    `}</style>
                    <span style={{ fontSize: '20px' }}>
                        {notification.type === 'error' ? '🚨' : '✨'}
                    </span>
                    <span>{notification.message}</span>
                </div>
            )}
        </NotificationContext.Provider>
    );
};
