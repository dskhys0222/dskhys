import type { DecryptedListItem } from '../types';

interface ListItemProps {
  item: DecryptedListItem;
  onToggle: () => void;
  onDelete: () => void;
}

export function ListItemComponent({ item, onToggle, onDelete }: ListItemProps) {
  return (
    <div className={`list-item ${item.completed ? 'completed' : ''}`}>
      <label className="checkbox-container">
        <input type="checkbox" checked={item.completed} onChange={onToggle} />
        <span className="checkmark" />
      </label>
      <span className="item-title">{item.title}</span>
      <button
        type="button"
        className="delete-button"
        onClick={onDelete}
        aria-label="削除"
      >
        ×
      </button>
    </div>
  );
}
