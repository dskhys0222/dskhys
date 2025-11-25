import { del, get, keys, set } from 'idb-keyval';
import { ResultAsync } from 'neverthrow';
import type {
  AuthTokens,
  DecryptedListItem,
  PendingSyncItem,
  User,
} from '../types';

const STORAGE_KEYS = {
  AUTH_TOKENS: 'auth_tokens',
  USER: 'user',
  ENCRYPTION_SALT: 'encryption_salt',
  ITEMS_PREFIX: 'item_',
  SYNC_QUEUE: 'sync_queue',
};

// 認証トークンの保存/取得
export function saveAuthTokens(tokens: AuthTokens): ResultAsync<void, Error> {
  return ResultAsync.fromPromise(
    set(STORAGE_KEYS.AUTH_TOKENS, tokens),
    (error) =>
      error instanceof Error ? error : new Error('Failed to save auth tokens')
  );
}

export function getAuthTokens(): ResultAsync<AuthTokens | null, Error> {
  return ResultAsync.fromPromise(
    get<AuthTokens>(STORAGE_KEYS.AUTH_TOKENS),
    (error) =>
      error instanceof Error ? error : new Error('Failed to get auth tokens')
  ).map((tokens) => tokens ?? null);
}

export function clearAuthTokens(): ResultAsync<void, Error> {
  return ResultAsync.fromPromise(del(STORAGE_KEYS.AUTH_TOKENS), (error) =>
    error instanceof Error ? error : new Error('Failed to clear auth tokens')
  );
}

// ユーザー情報の保存/取得
export function saveUser(user: User): ResultAsync<void, Error> {
  return ResultAsync.fromPromise(set(STORAGE_KEYS.USER, user), (error) =>
    error instanceof Error ? error : new Error('Failed to save user')
  );
}

export function getUser(): ResultAsync<User | null, Error> {
  return ResultAsync.fromPromise(get<User>(STORAGE_KEYS.USER), (error) =>
    error instanceof Error ? error : new Error('Failed to get user')
  ).map((user) => user ?? null);
}

export function clearUser(): ResultAsync<void, Error> {
  return ResultAsync.fromPromise(del(STORAGE_KEYS.USER), (error) =>
    error instanceof Error ? error : new Error('Failed to clear user')
  );
}

// 暗号化ソルトの保存/取得
export function saveEncryptionSalt(salt: string): ResultAsync<void, Error> {
  return ResultAsync.fromPromise(
    set(STORAGE_KEYS.ENCRYPTION_SALT, salt),
    (error) =>
      error instanceof Error
        ? error
        : new Error('Failed to save encryption salt')
  );
}

export function getEncryptionSalt(): ResultAsync<string | null, Error> {
  return ResultAsync.fromPromise(
    get<string>(STORAGE_KEYS.ENCRYPTION_SALT),
    (error) =>
      error instanceof Error
        ? error
        : new Error('Failed to get encryption salt')
  ).map((salt) => salt ?? null);
}

// リストアイテムの保存/取得（ローカルキャッシュ）
export function saveItem(item: DecryptedListItem): ResultAsync<void, Error> {
  return ResultAsync.fromPromise(
    set(`${STORAGE_KEYS.ITEMS_PREFIX}${item.key}`, item),
    (error) =>
      error instanceof Error ? error : new Error('Failed to save item')
  );
}

export function getItem(
  key: string
): ResultAsync<DecryptedListItem | null, Error> {
  return ResultAsync.fromPromise(
    get<DecryptedListItem>(`${STORAGE_KEYS.ITEMS_PREFIX}${key}`),
    (error) =>
      error instanceof Error ? error : new Error('Failed to get item')
  ).map((item) => item ?? null);
}

export function deleteItem(key: string): ResultAsync<void, Error> {
  return ResultAsync.fromPromise(
    del(`${STORAGE_KEYS.ITEMS_PREFIX}${key}`),
    (error) =>
      error instanceof Error ? error : new Error('Failed to delete item')
  );
}

export function getAllItems(): ResultAsync<DecryptedListItem[], Error> {
  return ResultAsync.fromPromise(keys(), (error) =>
    error instanceof Error ? error : new Error('Failed to get keys')
  ).andThen((allKeys) => {
    const itemKeys = allKeys.filter(
      (k) => typeof k === 'string' && k.startsWith(STORAGE_KEYS.ITEMS_PREFIX)
    ) as string[];

    return ResultAsync.combine(
      itemKeys.map((k) =>
        ResultAsync.fromPromise(get<DecryptedListItem>(k), (error) =>
          error instanceof Error ? error : new Error(`Failed to get item ${k}`)
        )
      )
    ).map((items) =>
      items.filter((item): item is DecryptedListItem => item !== undefined)
    );
  });
}

export function clearAllItems(): ResultAsync<void, Error> {
  return ResultAsync.fromPromise(keys(), (error) =>
    error instanceof Error ? error : new Error('Failed to get keys')
  ).andThen((allKeys) => {
    const itemKeys = allKeys.filter(
      (k) => typeof k === 'string' && k.startsWith(STORAGE_KEYS.ITEMS_PREFIX)
    ) as string[];

    return ResultAsync.combine(
      itemKeys.map((k) =>
        ResultAsync.fromPromise(del(k), (error) =>
          error instanceof Error
            ? error
            : new Error(`Failed to delete item ${k}`)
        )
      )
    ).map(() => undefined);
  });
}

// 同期キューの操作
export function getSyncQueue(): ResultAsync<PendingSyncItem[], Error> {
  return ResultAsync.fromPromise(
    get<PendingSyncItem[]>(STORAGE_KEYS.SYNC_QUEUE),
    (error) =>
      error instanceof Error ? error : new Error('Failed to get sync queue')
  ).map((queue) => queue ?? []);
}

export function addToSyncQueue(
  item: PendingSyncItem
): ResultAsync<void, Error> {
  return getSyncQueue().andThen((queue) => {
    // 同じキーに対する操作がある場合は更新
    const existingIndex = queue.findIndex((q) => q.key === item.key);
    if (existingIndex >= 0) {
      // 既存の操作を考慮して最適化
      const existing = queue[existingIndex];
      if (existing.action === 'create' && item.action === 'delete') {
        // 作成後に削除 => 何もしない
        queue.splice(existingIndex, 1);
      } else if (existing.action === 'create' && item.action === 'update') {
        // 作成後に更新 => 作成として扱う（最新データで）
        queue[existingIndex] = { ...item, action: 'create' };
      } else {
        // その他の場合は新しい操作で上書き
        queue[existingIndex] = item;
      }
    } else {
      queue.push(item);
    }

    return ResultAsync.fromPromise(
      set(STORAGE_KEYS.SYNC_QUEUE, queue),
      (error) =>
        error instanceof Error ? error : new Error('Failed to save sync queue')
    );
  });
}

export function removeFromSyncQueue(id: string): ResultAsync<void, Error> {
  return getSyncQueue().andThen((queue) => {
    const newQueue = queue.filter((item) => item.id !== id);
    return ResultAsync.fromPromise(
      set(STORAGE_KEYS.SYNC_QUEUE, newQueue),
      (error) =>
        error instanceof Error ? error : new Error('Failed to save sync queue')
    );
  });
}

export function clearSyncQueue(): ResultAsync<void, Error> {
  return ResultAsync.fromPromise(del(STORAGE_KEYS.SYNC_QUEUE), (error) =>
    error instanceof Error ? error : new Error('Failed to clear sync queue')
  );
}

// すべてのローカルデータをクリア
export function clearAllData(): ResultAsync<void, Error> {
  return clearAuthTokens()
    .andThen(() => clearUser())
    .andThen(() => clearAllItems())
    .andThen(() => clearSyncQueue())
    .andThen(() =>
      ResultAsync.fromPromise(del(STORAGE_KEYS.ENCRYPTION_SALT), (error) =>
        error instanceof Error
          ? error
          : new Error('Failed to clear encryption salt')
      )
    );
}
