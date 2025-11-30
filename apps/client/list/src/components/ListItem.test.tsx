import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { DecryptedListItem } from '../types';
import { ListItemComponent } from './ListItem';

describe('ListItemComponent', () => {
  const mockItem: DecryptedListItem = {
    key: '1',
    title: 'Test Item',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('should render item title', () => {
    render(
      <ListItemComponent
        item={mockItem}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('should render checkbox with correct state', () => {
    render(
      <ListItemComponent
        item={mockItem}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    const completedItem = { ...mockItem, completed: true };
    render(
      <ListItemComponent
        item={completedItem}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    // 2つ目のレンダリングなので、getAllByRoleを使うか、cleanupが必要だが、
    // testing-libraryは自動でcleanupするはず。
    // ただし、同じテストケース内での複数renderは推奨されない場合もあるが、ここでは単純に確認。
    // screen.getByRole('checkbox') は複数あるとエラーになるので、rerenderを使うか、別のテストケースにするのが良い。
  });

  it('should render completed checkbox', () => {
    const completedItem = { ...mockItem, completed: true };
    render(
      <ListItemComponent
        item={completedItem}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onToggle when checkbox is clicked', () => {
    const onToggle = vi.fn();
    render(
      <ListItemComponent
        item={mockItem}
        onToggle={onToggle}
        onDelete={vi.fn()}
      />
    );
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(
      <ListItemComponent
        item={mockItem}
        onToggle={vi.fn()}
        onDelete={onDelete}
      />
    );
    const deleteButton = screen.getByRole('button', { name: '削除' });
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('should apply completed class when item is completed', () => {
    const completedItem = { ...mockItem, completed: true };
    const { container } = render(
      <ListItemComponent
        item={completedItem}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    // コンテナの最初の子要素（div.list-item）を確認
    expect(container.firstChild).toHaveClass('completed');
  });
});
