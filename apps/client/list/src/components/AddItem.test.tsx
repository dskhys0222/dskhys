import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as ListContext from '../contexts/ListContext';
import { AddItem } from './AddItem';

// useListをモックする
vi.mock('../contexts/ListContext', () => ({
  useList: vi.fn(),
}));

describe('AddItem', () => {
  it('should render input and button', () => {
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

    render(<AddItem />);
    expect(
      screen.getByPlaceholderText('新しいタスクを追加...')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument();
  });

  it('should call addItem when form is submitted', async () => {
    const mockAddItem = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(ListContext, 'useList').mockReturnValue({
      addItem: mockAddItem,
      items: [],
      isLoading: false,
      error: null,
      toggleItem: vi.fn(),
      removeItem: vi.fn(),
      updateItem: vi.fn(),
      refreshItems: vi.fn(),
      pendingSyncCount: 0,
    });

    render(<AddItem />);
    const input = screen.getByPlaceholderText('新しいタスクを追加...');
    const button = screen.getByRole('button', { name: '追加' });

    fireEvent.change(input, { target: { value: 'New Task' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith('New Task');
    });
    expect(input).toHaveValue('');
  });

  it('should not call addItem when input is empty', async () => {
    const mockAddItem = vi.fn();
    vi.spyOn(ListContext, 'useList').mockReturnValue({
      addItem: mockAddItem,
      items: [],
      isLoading: false,
      error: null,
      toggleItem: vi.fn(),
      removeItem: vi.fn(),
      updateItem: vi.fn(),
      refreshItems: vi.fn(),
      pendingSyncCount: 0,
    });

    render(<AddItem />);
    const button = screen.getByRole('button', { name: '追加' });

    fireEvent.click(button);

    expect(mockAddItem).not.toHaveBeenCalled();
  });

  it('should disable button while adding', async () => {
    // 遅延するモック関数を作成
    const mockAddItem = vi
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
    vi.spyOn(ListContext, 'useList').mockReturnValue({
      addItem: mockAddItem,
      items: [],
      isLoading: false,
      error: null,
      toggleItem: vi.fn(),
      removeItem: vi.fn(),
      updateItem: vi.fn(),
      refreshItems: vi.fn(),
      pendingSyncCount: 0,
    });

    render(<AddItem />);
    const input = screen.getByPlaceholderText('新しいタスクを追加...');
    const button = screen.getByRole('button', { name: '追加' });

    fireEvent.change(input, { target: { value: 'New Task' } });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(screen.getByText('追加中...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('追加')).toBeInTheDocument();
    });
  });
});
