import { useList } from '../contexts/ListContext';
import { AddItem } from './AddItem';
import { ListItemComponent } from './ListItem';

export function ListItems() {
  const { items, isLoading, error, toggleItem, removeItem, pendingSyncCount } =
    useList();

  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const sortedItems = [...items].sort((a, b) => {
    // 未完了を上に、完了を下に
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // 同じステータス内では作成日時の新しい順
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="list-container">
      <AddItem />
      {pendingSyncCount > 0 && (
        <div className="sync-status">同期待ち: {pendingSyncCount}件</div>
      )}
      {sortedItems.length === 0 ? (
        <div className="empty-list">
          <p>タスクがありません</p>
          <p>新しいタスクを追加してください</p>
        </div>
      ) : (
        <div className="items-list">
          {sortedItems.map((item) => (
            <ListItemComponent
              key={item.key}
              item={item}
              onToggle={() => toggleItem(item.key)}
              onDelete={() => removeItem(item.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
