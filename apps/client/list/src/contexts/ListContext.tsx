import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  createItem as apiCreateItem,
  getItems as apiGetItems,
  updateItem as apiUpdateItem,
  deleteItemApi,
} from '../services/api';
import {
  addToSyncQueue,
  clearAllItems,
  deleteItem,
  getAllItems,
  saveItem,
} from '../services/storage';
import { isOnline, setupSyncListener } from '../services/sync';
import type { DecryptedListItem, PendingSyncItem } from '../types';
import { decrypt, encrypt } from '../utils/crypto';
import { useAuth } from './AuthContext';

interface ListContextType {
  items: DecryptedListItem[];
  isLoading: boolean;
  error: string | null;
  pendingSyncCount: number;
  addItem: (title: string) => Promise<void>;
  updateItem: (
    key: string,
    updates: Partial<DecryptedListItem>
  ) => Promise<void>;
  toggleItem: (key: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  refreshItems: () => Promise<void>;
}

const ListContext = createContext<ListContextType | undefined>(undefined);

export function ListProvider({ children }: { children: ReactNode }) {
  const { encryptionKey, isAuthenticated } = useAuth();
  const [items, setItems] = useState<DecryptedListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // アイテムデータをシリアライズ
  const serializeItemData = useCallback(
    (item: Omit<DecryptedListItem, 'key'>): string => {
      return JSON.stringify(item);
    },
    []
  );

  // アイテムデータをデシリアライズ
  const deserializeItemData = useCallback(
    (key: string, data: string): DecryptedListItem | null => {
      try {
        const parsed = JSON.parse(data);
        return { key, ...parsed };
      } catch {
        return null;
      }
    },
    []
  );

  // アイテムを暗号化
  const encryptItem = useCallback(
    async (item: Omit<DecryptedListItem, 'key'>): Promise<string | null> => {
      if (!encryptionKey) {
        // 暗号化キーがない場合はプレーンテキストで保存
        return serializeItemData(item);
      }

      const result = await encrypt(serializeItemData(item), encryptionKey);
      return result.isOk() ? result.value : null;
    },
    [encryptionKey, serializeItemData]
  );

  // アイテムを復号
  const decryptItem = useCallback(
    async (
      key: string,
      encryptedData: string
    ): Promise<DecryptedListItem | null> => {
      if (!encryptionKey) {
        // 暗号化キーがない場合はそのまま解析
        return deserializeItemData(key, encryptedData);
      }

      const result = await decrypt(encryptedData, encryptionKey);
      if (result.isErr()) {
        // 復号失敗の場合はプレーンテキストとして解析を試みる
        return deserializeItemData(key, encryptedData);
      }

      return deserializeItemData(key, result.value);
    },
    [encryptionKey, deserializeItemData]
  );

  // サーバーからアイテムを取得
  const fetchItemsFromServer = useCallback(async (): Promise<
    DecryptedListItem[]
  > => {
    if (!isOnline()) {
      return [];
    }

    const result = await apiGetItems();
    if (result.isErr()) {
      console.error('Failed to fetch items from server:', result.error);
      return [];
    }

    const decrypted = await Promise.all(
      result.value.map((item) => decryptItem(item.key, item.data))
    );

    return decrypted.filter((item): item is DecryptedListItem => item !== null);
  }, [decryptItem]);

  // ローカルからアイテムを取得
  const fetchItemsFromLocal = useCallback(async (): Promise<
    DecryptedListItem[]
  > => {
    const result = await getAllItems();
    if (result.isErr()) {
      console.error('Failed to fetch items from local:', result.error);
      return [];
    }
    return result.value;
  }, []);

  // アイテムをリフレッシュ
  const refreshItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOnline() && isAuthenticated) {
        // オンラインならサーバーから取得
        const serverItems = await fetchItemsFromServer();
        setItems(serverItems);

        // ローカルにキャッシュ
        await clearAllItems();
        await Promise.all(serverItems.map((item) => saveItem(item)));
      } else {
        // オフラインならローカルから取得
        const localItems = await fetchItemsFromLocal();
        setItems(localItems);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setIsLoading(false);
    }
  }, [fetchItemsFromServer, fetchItemsFromLocal, isAuthenticated]);

  // 認証状態が変わったらアイテムを取得
  useEffect(() => {
    if (isAuthenticated) {
      refreshItems();
    } else {
      setItems([]);
    }
  }, [isAuthenticated, refreshItems]);

  // オンライン復帰時に同期
  useEffect(() => {
    const cleanup = setupSyncListener((count) => {
      setPendingSyncCount((prev) => Math.max(0, prev - count));
      refreshItems();
    });

    return cleanup;
  }, [refreshItems]);

  // アイテムを追加
  const addItem = useCallback(
    async (title: string) => {
      const now = new Date().toISOString();
      const key = uuidv4();
      const newItem: DecryptedListItem = {
        key,
        title,
        completed: false,
        createdAt: now,
        updatedAt: now,
      };

      // ローカルに保存
      await saveItem(newItem);
      setItems((prev) => [...prev, newItem]);

      // 暗号化
      const encryptedData = await encryptItem({
        title: newItem.title,
        completed: newItem.completed,
        createdAt: newItem.createdAt,
        updatedAt: newItem.updatedAt,
      });

      if (!encryptedData) {
        setError('Failed to encrypt item');
        return;
      }

      if (isOnline()) {
        // オンラインならサーバーに送信
        const result = await apiCreateItem(encryptedData);
        if (result.isErr()) {
          // 失敗したら同期キューに追加
          const syncItem: PendingSyncItem = {
            id: uuidv4(),
            action: 'create',
            key,
            data: encryptedData,
            timestamp: Date.now(),
          };
          await addToSyncQueue(syncItem);
          setPendingSyncCount((prev) => prev + 1);
        }
      } else {
        // オフラインなら同期キューに追加
        const syncItem: PendingSyncItem = {
          id: uuidv4(),
          action: 'create',
          key,
          data: encryptedData,
          timestamp: Date.now(),
        };
        await addToSyncQueue(syncItem);
        setPendingSyncCount((prev) => prev + 1);
      }
    },
    [encryptItem]
  );

  // アイテムを更新
  const updateItemLocal = useCallback(
    async (key: string, updates: Partial<DecryptedListItem>) => {
      const existingItem = items.find((item) => item.key === key);
      if (!existingItem) return;

      const updatedItem: DecryptedListItem = {
        ...existingItem,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // ローカルを更新
      await saveItem(updatedItem);
      setItems((prev) =>
        prev.map((item) => (item.key === key ? updatedItem : item))
      );

      // 暗号化
      const encryptedData = await encryptItem({
        title: updatedItem.title,
        completed: updatedItem.completed,
        createdAt: updatedItem.createdAt,
        updatedAt: updatedItem.updatedAt,
      });

      if (!encryptedData) {
        setError('Failed to encrypt item');
        return;
      }

      if (isOnline()) {
        const result = await apiUpdateItem(key, encryptedData);
        if (result.isErr()) {
          const syncItem: PendingSyncItem = {
            id: uuidv4(),
            action: 'update',
            key,
            data: encryptedData,
            timestamp: Date.now(),
          };
          await addToSyncQueue(syncItem);
          setPendingSyncCount((prev) => prev + 1);
        }
      } else {
        const syncItem: PendingSyncItem = {
          id: uuidv4(),
          action: 'update',
          key,
          data: encryptedData,
          timestamp: Date.now(),
        };
        await addToSyncQueue(syncItem);
        setPendingSyncCount((prev) => prev + 1);
      }
    },
    [items, encryptItem]
  );

  // アイテムの完了状態をトグル
  const toggleItem = useCallback(
    async (key: string) => {
      const item = items.find((i) => i.key === key);
      if (item) {
        await updateItemLocal(key, { completed: !item.completed });
      }
    },
    [items, updateItemLocal]
  );

  // アイテムを削除
  const removeItem = useCallback(async (key: string) => {
    // ローカルから削除
    await deleteItem(key);
    setItems((prev) => prev.filter((item) => item.key !== key));

    if (isOnline()) {
      const result = await deleteItemApi(key);
      if (result.isErr()) {
        const syncItem: PendingSyncItem = {
          id: uuidv4(),
          action: 'delete',
          key,
          timestamp: Date.now(),
        };
        await addToSyncQueue(syncItem);
        setPendingSyncCount((prev) => prev + 1);
      }
    } else {
      const syncItem: PendingSyncItem = {
        id: uuidv4(),
        action: 'delete',
        key,
        timestamp: Date.now(),
      };
      await addToSyncQueue(syncItem);
      setPendingSyncCount((prev) => prev + 1);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      items,
      isLoading,
      error,
      pendingSyncCount,
      addItem,
      updateItem: updateItemLocal,
      toggleItem,
      removeItem,
      refreshItems,
    }),
    [
      items,
      isLoading,
      error,
      pendingSyncCount,
      addItem,
      updateItemLocal,
      toggleItem,
      removeItem,
      refreshItems,
    ]
  );

  return (
    <ListContext.Provider value={contextValue}>{children}</ListContext.Provider>
  );
}

export function useList(): ListContextType {
  const context = useContext(ListContext);
  if (context === undefined) {
    throw new Error('useList must be used within a ListProvider');
  }
  return context;
}
