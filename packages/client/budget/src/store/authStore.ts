import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    apiUrl: string;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshAccessToken: () => Promise<string>;
    setApiUrl: (url: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            accessToken: null,
            refreshToken: null,
            apiUrl: '',
            isAuthenticated: false,

            login: async (email: string, password: string) => {
                const { apiUrl } = get();
                if (!apiUrl) {
                    throw new Error('APIのURLが設定されていません');
                }
                const response = await fetch(`${apiUrl}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                if (!response.ok) {
                    throw new Error('ログインに失敗しました');
                }
                const data = (await response.json()) as {
                    accessToken: string;
                    refreshToken: string;
                };
                set({
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    isAuthenticated: true,
                });
            },

            logout: () => {
                set({
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                });
            },

            refreshAccessToken: async () => {
                const { apiUrl, refreshToken } = get();
                if (!refreshToken) {
                    throw new Error('リフレッシュトークンがありません');
                }
                const response = await fetch(`${apiUrl}/api/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                });
                if (!response.ok) {
                    set({
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                    });
                    throw new Error(
                        'トークンのリフレッシュに失敗しました。再度ログインしてください。'
                    );
                }
                const data = (await response.json()) as {
                    accessToken: string;
                };
                set({ accessToken: data.accessToken });
                return data.accessToken;
            },

            setApiUrl: (url: string) => {
                set({ apiUrl: url });
            },
        }),
        {
            name: 'budget-auth',
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                apiUrl: state.apiUrl,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
