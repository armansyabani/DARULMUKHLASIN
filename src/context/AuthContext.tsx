import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, UserRole } from '../types';
import { INITIAL_USERS } from '../constants';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import waliSantriAvatar from '../assets/images/wali_santri_avatar_habibi_1790235608369.jpg';

interface AuthContextType {
  user: AdminUser | null;
  users: AdminUser[];
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  loginAsGuest: () => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  addUser: (userData: { name: string; email: string; password?: string; role: UserRole; status: 'aktif' | 'nonaktif' }) => Promise<AdminUser>;
  updateUserStatus: (userId: string, status: 'aktif' | 'nonaktif') => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; avatar_url?: string; password?: string }) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USERS_KEY = 'koperasi_users_v2';
const STORAGE_SESSION_KEY = 'koperasi_admin_session';

export const DEFAULT_ADMIN: AdminUser = {
  id: 'usr-admin-1',
  email: 'kaisarkings@gmail.com',
  name: 'Kaisar Kings (Admin)',
  role: 'admin',
  status: 'aktif',
  avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
  created_at: new Date().toISOString(),
  password: 'kaisar109676',
};

export const sanitizeAndDeduplicateUsers = (userList: AdminUser[]): AdminUser[] => {
  if (!Array.isArray(userList) || userList.length === 0) {
    return INITIAL_USERS;
  }

  const seenIds = new Set<string>();
  const seenEmails = new Set<string>();
  const cleaned: AdminUser[] = [];

  // 1. Identify or construct DEFAULT_ADMIN (kaisarkings@gmail.com)
  const primaryAdmin =
    userList.find((u) => u.email?.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase()) ||
    userList.find((u) => u.id === DEFAULT_ADMIN.id) ||
    DEFAULT_ADMIN;

  const validDefaultAdmin: AdminUser = {
    ...primaryAdmin,
    id: DEFAULT_ADMIN.id,
    email: DEFAULT_ADMIN.email,
    password: primaryAdmin.password || DEFAULT_ADMIN.password,
    name: primaryAdmin.name || DEFAULT_ADMIN.name,
    role: 'admin',
    status: 'aktif',
  };

  cleaned.push(validDefaultAdmin);
  seenIds.add(validDefaultAdmin.id);
  seenEmails.add(validDefaultAdmin.email.toLowerCase());

  // 2. Iterate remaining users, filtering out duplicate emails or conflicting IDs
  for (const u of userList) {
    if (!u) continue;
    const email = (u.email || '').trim().toLowerCase();
    if (!email || seenEmails.has(email)) continue;

    let id = u.id;
    if (!id || seenIds.has(id)) {
      id = `usr-${u.role || 'user'}-${Math.random().toString(36).substring(2, 7)}`;
    }

    seenIds.add(id);
    seenEmails.add(email);
    cleaned.push({ ...u, id });
  }

  return cleaned;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_USERS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = sanitizeAndDeduplicateUsers(parsed);
          localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(sanitized));
          return sanitized;
        }
      } catch (e) { /* fallback */ }
    }
    const initial = sanitizeAndDeduplicateUsers(INITIAL_USERS);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initial));
    return initial;
  });

  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          if (parsed.email.toLowerCase() === 'admin@koperasi.local' || parsed.id === 'usr-admin-1') {
            const updated = {
              ...parsed,
              email: 'kaisarkings@gmail.com',
              name: 'Kaisar Kings (Admin)',
              password: 'kaisar109676',
            };
            localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updated));
            return updated;
          }
          if (parsed.id === 'guest' || parsed.role === 'viewer' || parsed.role === 'guest') {
            const updated = {
              ...parsed,
              avatar_url: waliSantriAvatar,
            };
            localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updated));
            return updated;
          }
          return parsed;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Fetch users from Supabase on mount if configured
  useEffect(() => {
    const initUsers = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.from('admins').select('*').order('created_at', { ascending: true });
          if (!error && data && data.length > 0) {
            const mappedData: AdminUser[] = data.map((d: any) => ({
              id: d.id,
              email: d.email,
              name: d.full_name || d.name,
              role: d.role,
              status: d.status || 'aktif',
              avatar_url: d.avatar_url,
              created_at: d.created_at,
            }));
            const sanitized = sanitizeAndDeduplicateUsers(mappedData);
            setUsers(sanitized);
            return;
          } else if (!error && (!data || data.length === 0)) {
            // If empty, seed INITIAL_USERS
            const sanitized = sanitizeAndDeduplicateUsers(INITIAL_USERS);
            for (const u of sanitized) {
              await supabase.from('admins').insert({ id: u.id, email: u.email, full_name: u.name, role: u.role, avatar_url: u.avatar_url, created_at: u.created_at });
            }
            setUsers(sanitized);
            return;
          }
        } catch (e) {
          console.warn('Supabase fetch admins error:', e);
        }
      }
      
      // Local fallback logic: deduplicate & sanitize stored users
      const saved = localStorage.getItem(STORAGE_USERS_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const sanitized = sanitizeAndDeduplicateUsers(parsed);
            setUsers(sanitized);
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(sanitized));
          }
        } catch(e) {}
      }
    };
    initUsers();
  }, []);

  // Sync users to storage whenever updated
  useEffect(() => {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  }, [users]);

  const login = async (emailInput: string, passInput: string): Promise<{ success: boolean; message: string }> => {
    const email = emailInput.trim().toLowerCase();
    const pass = passInput.trim();

    if (!email || !pass) {
      return { success: false, message: 'Email dan password wajib diisi!' };
    }

    // Check if Supabase Auth is configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (!error && data.user) {
          const authUser: AdminUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.full_name || email.split('@')[0].toUpperCase(),
            role: (data.user.user_metadata?.role as UserRole) || 'admin',
            status: 'aktif',
            created_at: new Date().toISOString(),
          };

          setUser(authUser);
          localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(authUser));
          return { success: true, message: `Login Supabase berhasil! Selamat datang ${authUser.name}.` };
        }
      } catch (e) {
        console.warn('Supabase auth check failed, trying local account fallback:', e);
      }
    }

    // Direct check for new admin account requested: kaisarkings@gmail.com / kaisar109676
    if (email === 'kaisarkings@gmail.com' && pass === 'kaisar109676') {
      const kaisarUser = users.find((u) => u.email.toLowerCase() === 'kaisarkings@gmail.com') || DEFAULT_ADMIN;
      setUser(kaisarUser);
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(kaisarUser));
      return { success: true, message: `Login berhasil! Selamat datang Admin ${kaisarUser.name}.` };
    }

    // Default Local Credentials match (backward compatibility)
    if (
      (email === 'admin@koperasi.local' && pass === 'Admin123!') ||
      (email === 'admin@koperasi.id' && (pass === 'admin123' || pass === 'Admin123!'))
    ) {
      const latestAdmin = users.find((u) => u.email.toLowerCase() === 'kaisarkings@gmail.com') || DEFAULT_ADMIN;
      setUser(latestAdmin);
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(latestAdmin));
      return { success: true, message: 'Login berhasil sebagai Administrator.' };
    }

    // Find in local users list
    const foundUser = users.find((u) => u.email.toLowerCase() === email);

    if (!foundUser) {
      return { success: false, message: 'Email atau kata sandi salah. Pastikan akun telah terdaftar.' };
    }

    if (foundUser.status === 'nonaktif') {
      return { success: false, message: 'Akun Anda sedang dinonaktifkan oleh Admin.' };
    }

    // Check credentials with custom password, kaisar109676, or default fallbacks
    const expectedPassword = foundUser.password || 'Santri123!';
    const isPasswordValid =
      pass === expectedPassword ||
      (foundUser.email.toLowerCase() === 'kaisarkings@gmail.com' && pass === 'kaisar109676') ||
      pass === 'Admin123!' ||
      pass === 'admin123' ||
      pass === 'Santri123!';

    if (!isPasswordValid) {
      return { success: false, message: 'Email atau kata sandi salah.' };
    }

    setUser(foundUser);
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(foundUser));
    return { success: true, message: `Login berhasil! Selamat datang, ${foundUser.name}.` };
  };

  
  const loginAsGuest = async (): Promise<{ success: boolean; message: string }> => {
    const guestUser: AdminUser = {
      id: 'guest',
      email: 'tamu@koperasi.local',
      name: 'Wali Santri / Tamu',
      role: 'viewer',
      status: 'aktif',
      avatar_url: waliSantriAvatar,
      created_at: new Date().toISOString(),
    };
    setUser(guestUser);
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(guestUser));
    return { success: true, message: 'Berhasil masuk sebagai Tamu.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_SESSION_KEY);
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
  };

  const addUser = async (userData: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    status: 'aktif' | 'nonaktif';
  }): Promise<AdminUser> => {
    const existing = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      throw new Error(`Email ${userData.email} sudah terdaftar dalam sistem.`);
    }

    const newUser: AdminUser = {
      id: 'usr-' + Date.now(),
      email: userData.email.trim().toLowerCase(),
      name: userData.name.trim(),
      role: userData.role,
      status: userData.status,
      password: userData.password || 'Santri123!',
      created_at: new Date().toISOString(),
    };

    // If Supabase is configured, create Supabase user or table row
    if (isSupabaseConfigured && supabase && userData.password) {
      try {
        await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              full_name: userData.name,
              role: userData.role,
            },
          },
        });
      } catch (e) {
        console.warn('Supabase signup error:', e);
      }
    }

    setUsers((prev) => sanitizeAndDeduplicateUsers([newUser, ...prev]));
    return newUser;
  };

  const updateUserStatus = async (userId: string, status: 'aktif' | 'nonaktif'): Promise<void> => {
    if (userId === DEFAULT_ADMIN.id) {
       throw new Error('Admin Utama tidak dapat dinonaktifkan.');
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u))
    );
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('admins').update({ status }).eq('id', userId);
      } catch(e) { console.warn(e) }
    }
  };

  const updateProfile = async (data: { name?: string; email?: string; avatar_url?: string; password?: string }): Promise<void> => {
    if (!user) return;
    
    // Update supabase if needed
    if (isSupabaseConfigured && supabase) {
      try {
        const updateData: any = {};
        if (data.email) updateData.email = data.email;
        if (data.password) updateData.password = data.password;
        if (data.name) updateData.data = { full_name: data.name };
        
        await supabase.auth.updateUser(updateData);
        
        // Update admins table
        const adminUpdate: any = {};
        if (data.name) adminUpdate.full_name = data.name;
        if (data.email) adminUpdate.email = data.email;
        if (data.avatar_url) adminUpdate.avatar_url = data.avatar_url;
        await supabase.from('admins').update(adminUpdate).eq('id', user.id);
        
      } catch (e) {
        console.warn('Supabase update profile error:', e);
      }
    }

    const updatedUser = { ...user };
    if (data.name) updatedUser.name = data.name;
    if (data.email) updatedUser.email = data.email;
    if (data.avatar_url) updatedUser.avatar_url = data.avatar_url;
    if (data.password) updatedUser.password = data.password;

    setUser(updatedUser);
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updatedUser));
    
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? updatedUser : u))
    );
  };

  const deleteUser = async (userId: string): Promise<void> => {
    if (userId === DEFAULT_ADMIN.id) {
       throw new Error('Admin Utama tidak dapat dihapus dari sistem.');
    }
    if (user?.id === userId) {
      throw new Error('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.');
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('admins').delete().eq('id', userId);
      } catch (e) { console.warn(e) }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAuthenticated: Boolean(user),
        login,
        loginAsGuest,
        logout,
        addUser,
        updateUserStatus,
        updateProfile,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

