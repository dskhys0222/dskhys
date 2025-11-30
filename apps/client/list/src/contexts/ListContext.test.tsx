import { act, render, screen, waitFor } from '@testing-library/react';
import { ok } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../services/api';
import * as storage from '../services/storage';
import * as sync from '../services/sync';
import * as cryptoUtils from '../utils/crypto';
import * as AuthContext from './AuthContext';
import { ListProvider, useList } from './ListContext';

// モックの設定
vi.mock('./AuthContext');
vi.mock('../services/api');
vi.mock('../services/storage');
vi.mock('../utils/crypto');
vi.mock('../services/sync');

// テスト用コンポーネント
function TestComponent() {
  const { items, addItem, removeItem, toggleItem } = useList();
  return (
    <div>
      <div data-testid="item-count">{items.length}</div>
      <ul>
        {items.map((item) => (
          <li key={item.key} data-testid={`item-${item.key}`}>
            {item.title} - {item.completed ? 'Completed' : 'Active'}
            <button type="button" onClick={() => toggleItem(item.key)}>
              Toggle
            </button>
            <button type="button" onClick={() => removeItem(item.key)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => addItem('New Item')}>
        Add Item
      </button>
    </div>
  );
}

describe('ListContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // AuthContextのモック
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 1, name: 'Test', email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
      encryptionKey: {} as CryptoKey,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    // Storageのモック
    vi.spyOn(storage, 'getAllItems').mockResolvedValue(ok([]));
    vi.spyOn(storage, 'saveItem').mockResolvedValue(ok(undefined));
    vi.spyOn(storage, 'deleteItem').mockResolvedValue(ok(undefined));
    vi.spyOn(storage, 'clearAllItems').mockResolvedValue(ok(undefined));
    vi.spyOn(storage, 'addToSyncQueue').mockResolvedValue(ok(undefined));

    // APIのモック
    vi.spyOn(api, 'getItems').mockResolvedValue(ok([]));
    vi.spyOn(api, 'createItem').mockResolvedValue(
      ok({ id: 1, key: 'key', data: 'encrypted' })
    );
    vi.spyOn(api, 'updateItem').mockResolvedValue(ok(undefined));
    vi.spyOn(api, 'deleteItemApi').mockResolvedValue(ok(undefined));

    // Cryptoのモック
    vi.spyOn(cryptoUtils, 'encrypt').mockResolvedValue(ok('encrypted'));
    vi.spyOn(cryptoUtils, 'decrypt').mockResolvedValue(
      ok(JSON.stringify({ title: 'Decrypted Item', completed: false }))
    );

    // Syncのモック
    vi.spyOn(sync, 'isOnline').mockReturnValue(true);
    vi.spyOn(sync, 'setupSyncListener').mockReturnValue(() => {});
  });

  it('should initialize with empty list', async () => {
    await act(async () => {
      render(
        <ListProvider>
          <TestComponent />
        </ListProvider>
      );
    });

    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
  });

  it('should add item', async () => {
    await act(async () => {
      render(
        <ListProvider>
          <TestComponent />
        </ListProvider>
      );
    });

    await act(async () => {
      screen.getByText('Add Item').click();
    });

    expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    expect(storage.saveItem).toHaveBeenCalled();
    expect(api.createItem).toHaveBeenCalled();
  });

  it('should remove item', async () => {
    // サーバーからのレスポンスをモック
    vi.spyOn(api, 'getItems').mockResolvedValue(
      ok([{ id: 1, key: '1', data: 'encrypted' }])
    );

    // 復号化のモック
    vi.spyOn(cryptoUtils, 'decrypt').mockResolvedValue(
      ok(
        JSON.stringify({
          title: 'Test Item',
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      )
    );

    await act(async () => {
      render(
        <ListProvider>
          <TestComponent />
        </ListProvider>
      );
    });

    // データ読み込み待ち
    await waitFor(() => {
      expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    });

    await act(async () => {
      screen.getByText('Delete').click();
    });

    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    expect(storage.deleteItem).toHaveBeenCalledWith('1');
    expect(api.deleteItemApi).toHaveBeenCalledWith('1');
  });
});
