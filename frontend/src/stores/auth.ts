'use client';

import { create } from 'zustand';
import type { User } from '@/types';
import { apiPost, apiGet } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<unknown>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,

  init: () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ token });
      get().fetchProfile();
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await apiPost<{ token: string; user: User }>('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      set({ token: res.data.token, user: res.data.user });
    } catch (err) {
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  register: async (email, password, nickname) => {
    set({ loading: true });
    try {
      const res = await apiPost<{ message: string }>('/auth/register', { email, password, nickname });
      return res;
    } catch (err) {
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  verifyEmail: async (token) => {
    set({ loading: true });
    try {
      const res = await apiPost<{ token: string; user: User }>('/auth/verify', { token });
      localStorage.setItem('token', res.data.token);
      set({ token: res.data.token, user: res.data.user });
    } catch (err) {
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  resendVerification: async (email) => {
    set({ loading: true });
    try {
      await apiPost('/auth/resend-verification', { email });
    } catch (err) {
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  fetchProfile: async () => {
    try {
      const res = await apiGet<User>('/users/me');
      set({ user: res.data });
    } catch {
      set({ user: null, token: null });
      localStorage.removeItem('token');
    }
  },
}));
