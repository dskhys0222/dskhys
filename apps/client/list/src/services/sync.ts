import { ResultAsync } from 'neverthrow';
import type { PendingSyncItem } from '../types';
import { createItem, deleteItemApi, updateItem } from './api';
import { clearSyncQueue, getSyncQueue, removeFromSyncQueue } from './storage';

// オンライン状態をチェック
export function isOnline(): boolean {
  return navigator.onLine;
}

// 同期キューを処理
export function processSyncQueue(): ResultAsync<number, Error> {
  if (!isOnline()) {
    return ResultAsync.fromPromise(
      Promise.resolve(0),
      () => new Error('Offline')
    );
  }

  return getSyncQueue().andThen((queue) => {
    if (queue.length === 0) {
      return ResultAsync.fromPromise(
        Promise.resolve(0),
        () => new Error('Empty queue')
      );
    }

    // 順番に処理
    return processQueueItems(queue, 0).map((processed) => processed);
  });
}

function processQueueItems(
  queue: PendingSyncItem[],
  processed: number
): ResultAsync<number, Error> {
  if (queue.length === 0) {
    return ResultAsync.fromPromise(
      Promise.resolve(processed),
      () => new Error('Processing error')
    );
  }

  const [item, ...rest] = queue;

  return processSyncItem(item)
    .andThen(() => removeFromSyncQueue(item.id))
    .andThen(() => processQueueItems(rest, processed + 1))
    .orElse(() => {
      // エラーが発生した場合は、そのアイテムをスキップして続行
      console.error(`Failed to sync item ${item.key}, skipping`);
      return processQueueItems(rest, processed);
    });
}

function processSyncItem(item: PendingSyncItem): ResultAsync<void, Error> {
  switch (item.action) {
    case 'create':
      if (!item.data) {
        return ResultAsync.fromPromise(
          Promise.reject(new Error('No data for create action')),
          (e) => e as Error
        );
      }
      return createItem(item.data)
        .map(() => undefined)
        .mapErr((e) => new Error(e.message));

    case 'update':
      if (!item.data) {
        return ResultAsync.fromPromise(
          Promise.reject(new Error('No data for update action')),
          (e) => e as Error
        );
      }
      return updateItem(item.key, item.data).mapErr(
        (e) => new Error(e.message)
      );

    case 'delete':
      return deleteItemApi(item.key).mapErr((e) => new Error(e.message));

    default:
      return ResultAsync.fromPromise(
        Promise.resolve(),
        () => new Error('Unknown action')
      );
  }
}

// オンライン復帰時のリスナーを設定
export function setupSyncListener(
  onSyncComplete?: (count: number) => void
): () => void {
  const handleOnline = () => {
    processSyncQueue().match(
      (count) => {
        if (count > 0) {
          console.log(`Synced ${count} pending items`);
          onSyncComplete?.(count);
        }
      },
      (error) => {
        console.error('Sync failed:', error);
      }
    );
  };

  window.addEventListener('online', handleOnline);

  // 初期状態がオンラインなら同期を試みる
  if (isOnline()) {
    handleOnline();
  }

  return () => {
    window.removeEventListener('online', handleOnline);
  };
}

// 同期キューをクリア
export function clearSync(): ResultAsync<void, Error> {
  return clearSyncQueue();
}
