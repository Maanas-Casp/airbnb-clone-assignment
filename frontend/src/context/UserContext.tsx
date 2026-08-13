'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

export type UserRole = 'guest' | 'host';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UserContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeUserId: number;
  setActiveUserId: (id: number) => void;
  wishlistIds: Set<number>;
  toggleWishlist: (listingId: number) => Promise<void>;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('guest');
  const [activeUserId, setActiveUserId] = useState<number>(1); // Default Guest ID = 1
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load wishlist for active user
  useEffect(() => {
    if (activeUserId) {
      api.getWishlist(activeUserId)
        .then((items) => {
          const ids = new Set(items.map(item => item.listing_id));
          setWishlistIds(ids);
        })
        .catch(() => {
          // Non-blocking catch
        });
    }
  }, [activeUserId]);

  const toggleWishlist = async (listingId: number) => {
    try {
      const res = await api.toggleWishlist(listingId, activeUserId);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (res.saved) {
          next.add(listingId);
        } else {
          next.delete(listingId);
        }
        return next;
      });
      showToast(res.message, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update wishlist', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync role switch with appropriate user IDs
  const handleSetRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'host') {
      setActiveUserId(2); // Default Host ID = 2 (Sarah Jenkins)
      showToast('Switched to Host Mode', 'info');
    } else {
      setActiveUserId(1); // Default Guest ID = 1 (John Guest)
      showToast('Switched to Guest Mode', 'info');
    }
  };

  return (
    <UserContext.Provider
      value={{
        role,
        setRole: handleSetRole,
        activeUserId,
        setActiveUserId,
        wishlistIds,
        toggleWishlist,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
