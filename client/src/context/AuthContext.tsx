import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { setAccessToken } from '../api/api';

interface User {
    _id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (name: string, password?: string) => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            // Try to refresh token immediately to see if we have a session
            const { data } = await api.post('/auth/refresh');
            setAccessToken(data.accessToken);

            // Get user profile
            const userRes = await api.get('/auth/me');
            setUser(userRes.data);
        } catch (error) {
            // Not authenticated
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const { data } = await api.post('/auth/login', { email, password });
        setAccessToken(data.accessToken);
        setUser({ _id: data._id, name: data.name, email: data.email });
    };

    const register = async (name: string, email: string, password: string) => {
        const { data } = await api.post('/auth/register', { name, email, password });
        setAccessToken(data.accessToken);
        setUser({ _id: data._id, name: data.name, email: data.email });
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setAccessToken('');
        setUser(null);
    };

    const updateUser = async (name: string, password?: string) => {
        const { data } = await api.put('/auth/profile', { name, password });
        setUser({ _id: data._id, name: data.name, email: data.email });
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
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
