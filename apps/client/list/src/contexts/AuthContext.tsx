import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  getMe,
} from '../services/api';
import {
  clearAllData,
  getAuthTokens,
  getEncryptionSalt,
  getUser,
  saveAuthTokens,
  saveEncryptionSalt,
  saveUser,
} from '../services/storage';
import type { LoginForm, RegisterForm, User } from '../types';
import {
  decodeSalt,
  deriveKey,
  encodeSalt,
  generateSalt,
} from '../utils/crypto';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  encryptionKey: CryptoKey | null;
  login: (data: LoginForm) => Promise<{ success: boolean; error?: string }>;
  register: (
    data: RegisterForm
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);

  // 暗号化キーを生成/取得
  const initializeEncryptionKey = useCallback(
    async (password: string): Promise<CryptoKey | null> => {
      const saltResult = await getEncryptionSalt();
      if (saltResult.isErr()) {
        console.error('Failed to get encryption salt');
        return null;
      }

      let salt: Uint8Array;
      if (saltResult.value) {
        salt = decodeSalt(saltResult.value);
      } else {
        salt = generateSalt();
        const saveResult = await saveEncryptionSalt(encodeSalt(salt));
        if (saveResult.isErr()) {
          console.error('Failed to save encryption salt');
          return null;
        }
      }

      const keyResult = await deriveKey(password, salt);
      if (keyResult.isErr()) {
        console.error('Failed to derive encryption key');
        return null;
      }

      return keyResult.value;
    },
    []
  );

  // 初期化（ローカルストレージからユーザー情報を復元）
  useEffect(() => {
    const initialize = async () => {
      try {
        const [tokensResult, userResult] = await Promise.all([
          getAuthTokens(),
          getUser(),
        ]);

        if (
          tokensResult.isOk() &&
          tokensResult.value &&
          userResult.isOk() &&
          userResult.value
        ) {
          setUser(userResult.value);

          // オンラインなら最新のユーザー情報を取得
          if (navigator.onLine) {
            const meResult = await getMe();
            if (meResult.isOk()) {
              setUser(meResult.value);
              await saveUser(meResult.value);
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const login = useCallback(
    async (data: LoginForm): Promise<{ success: boolean; error?: string }> => {
      const result = await apiLogin(data);

      if (result.isErr()) {
        return { success: false, error: result.error.message };
      }

      const { user: loggedInUser, accessToken, refreshToken } = result.value;

      // トークンとユーザー情報を保存
      await saveAuthTokens({ accessToken, refreshToken });
      await saveUser(loggedInUser);

      // 暗号化キーを生成（パスワードから派生）
      const key = await initializeEncryptionKey(data.password);
      if (key) {
        setEncryptionKey(key);
      }

      setUser(loggedInUser);
      return { success: true };
    },
    [initializeEncryptionKey]
  );

  const register = useCallback(
    async (
      data: RegisterForm
    ): Promise<{ success: boolean; error?: string }> => {
      const result = await apiRegister(data);

      if (result.isErr()) {
        return { success: false, error: result.error.message };
      }

      const { accessToken, refreshToken } = result.value;

      // 登録後にログインしてユーザー情報を取得
      await saveAuthTokens({ accessToken, refreshToken });

      const meResult = await getMe();
      if (meResult.isErr()) {
        return { success: false, error: meResult.error.message };
      }

      await saveUser(meResult.value);

      // 新しい暗号化ソルトを生成
      const salt = generateSalt();
      await saveEncryptionSalt(encodeSalt(salt));

      // 暗号化キーを生成
      const key = await initializeEncryptionKey(data.password);
      if (key) {
        setEncryptionKey(key);
      }

      setUser(meResult.value);
      return { success: true };
    },
    [initializeEncryptionKey]
  );

  const logout = useCallback(async () => {
    const tokensResult = await getAuthTokens();

    if (tokensResult.isOk() && tokensResult.value) {
      // オンラインならサーバーにログアウトを通知
      if (navigator.onLine) {
        await apiLogout(tokensResult.value.refreshToken);
      }
    }

    // ローカルデータをクリア
    await clearAllData();
    setUser(null);
    setEncryptionKey(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      encryptionKey,
      login,
      register,
      logout,
    }),
    [user, isLoading, encryptionKey, login, register, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
