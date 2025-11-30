import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as ListContext from '../contexts/ListContext';
import type { DecryptedListItem } from '../types';
import { ListItems } from './ListItems';

// useListをモックする
vi.mock('../contexts/ListContext', () => ({
  useList: vi.fn(),
}));

// 子コンポーネントはそのまま使う（統合テスト的アプローチ）
// ただし、AddItemの内部でuseListを使っているので、そこもモックの影響を受ける

describe('ListItems', () => {
  const mockItems: DecryptedListItem[] = [
    {
      key: '1',
      title: 'Task 1',
      completed: false,
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date('2023-01-01').toISOString(),
    },
    {
      key: '2',
      title: 'Task 2',
      completed: true,
      createdAt: new Date('2023-01-02').toISOString(),
      updatedAt: new Date('2023-01-02').toISOString(),
    },
  ];

  it('should render loading state', () => {
    vi.spyOn(ListContext, 'useList').mockReturnValue({
      addItem: vi.fn(),
      items: [],
      isLoading: true,
      error: null,
      toggleItem: vi.fn(),
      removeItem: vi.fn(),
      updateItem: vi.fn(),
      refreshItems: vi.fn(),
      pendingSyncCount: 0,
    });

    render(<ListItems />);
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    vi.spyOn(ListContext, 'useList').mockReturnValue({
      addItem: vi.fn(),
      items: [],
      isLoading: false,
      error: 'Failed to load items',
      toggleItem: vi.fn(),
      removeItem: vi.fn(),
      updateItem: vi.fn(),
      refreshItems: vi.fn(),
      pendingSyncCount: 0,
    });

    render(<ListItems />);
    expect(screen.getByText('Failed to load items')).toBeInTheDocument();
  });

  it('should render empty state', () => {
    vi.spyOn(ListContext, 'useList').mockReturnValue({
      addItem: vi.fn(),
      items: [],
      isLoading: false,
      error: null,
      toggleItem: vi.fn(),
      removeItem: vi.fn(),
      updateItem: vi.fn(),
      refreshItems: vi.fn(),
      pendingSyncCount: 0,
    });

    render(<ListItems />);
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
    expect(
      screen.getByText('新しいタスクを追加してください')
    ).toBeInTheDocument();
    // AddItemは常に表示される
    expect(
      screen.getByPlaceholderText('新しいタスクを追加...')
    ).toBeInTheDocument();
  });

  it('should render items sorted correctly', () => {
    // Task 1 (未完了, 古い), Task 2 (完了, 新しい)
    // ソート順: 未完了が先 -> Task 1, Task 2
    // もし両方未完了なら: 新しい順 -> Task 2, Task 1

    vi.spyOn(ListContext, 'useList').mockReturnValue({
      addItem: vi.fn(),
      items: mockItems,
      isLoading: false,
      error: null,
      toggleItem: vi.fn(),
      removeItem: vi.fn(),
      updateItem: vi.fn(),
      refreshItems: vi.fn(),
      pendingSyncCount: 0,
    });

    render(<ListItems />);

    const items = screen.getAllByRole('checkbox'); // ListItemComponent内のチェックボックス
    expect(items).toHaveLength(2);

    // 順序確認: Task 1 (未完了) が先
    const itemTitles = screen.getAllByText(/Task \d/);
    expect(itemTitles[0]).toHaveTextContent('Task 1');
    expect(itemTitles[1]).toHaveTextContent('Task 2');
  });

  it('should render pending sync count', () => {
    vi.spyOn(ListContext, 'useList').mockReturnValue({
      addItem: vi.fn(),
      items: [],
      isLoading: false,
      error: null,
      toggleItem: vi.fn(),
      removeItem: vi.fn(),
      updateItem: vi.fn(),
      refreshItems: vi.fn(),
      pendingSyncCount: 3,
    });

    render(<ListItems />);
    expect(screen.getByText('同期待ち: 3件')).toBeInTheDocument();
  });

  it('should call toggleItem when item checkbox is clicked', () => {
    const toggleItem = vi.fn();
    vi.spyOn(ListContext, 'useList').mockReturnValue({
      addItem: vi.fn(),
      items: [mockItems[0]],
      isLoading: false,
      error: null,
      toggleItem: toggleItem,
      removeItem: vi.fn(),
      updateItem: vi.fn(),
      refreshItems: vi.fn(),
      pendingSyncCount: 0,
    });

    render(<ListItems />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(toggleItem).toHaveBeenCalledWith('1');
  });

  it('should call removeItem when delete button is clicked', () => {
    const removeItem = vi.fn();
    vi.spyOn(ListContext, 'useList').mockReturnValue({
      addItem: vi.fn(),
      items: [mockItems[0]],
      isLoading: false,
      error: null,
      toggleItem: vi.fn(),
      removeItem: removeItem,
      updateItem: vi.fn(),
      refreshItems: vi.fn(),
      pendingSyncCount: 0,
    });

    render(<ListItems />);
    const deleteButton = screen.getByRole('button', { name: '削除' });
    fireEvent.click(deleteButton);
    expect(removeItem).toHaveBeenCalledWith('1');
  });
});
