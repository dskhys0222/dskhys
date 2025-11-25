import type React from 'react';
import { useState } from 'react';
import { useList } from '../contexts/ListContext';

export function AddItem() {
  const { addItem } = useList();
  const [title, setTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsAdding(true);
    await addItem(title.trim());
    setTitle('');
    setIsAdding(false);
  };

  return (
    <form className="add-item-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="新しいタスクを追加..."
        disabled={isAdding}
      />
      <button type="submit" disabled={isAdding || !title.trim()}>
        {isAdding ? '追加中...' : '追加'}
      </button>
    </form>
  );
}
