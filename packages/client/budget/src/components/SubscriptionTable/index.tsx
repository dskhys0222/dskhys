import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { Category } from '@/constants/categories';
import type { SubscriptionItem } from '@/store/subscriptionStore';
import { tableStyles } from './styles';

interface SubscriptionTableProps {
    title: string;
    items: SubscriptionItem[];
    categories: Record<string, Category>;
    onRemove: (id: string) => void;
    onAdd: () => void;
    onCardClick?: (id: string) => void;
    onMove?: (id: string) => void;
    moveButtonLabel?: string;
    onReorder?: (items: SubscriptionItem[]) => void;
}

export function SubscriptionTable({
    title,
    items,
    categories,
    onRemove,
    onAdd,
    onCardClick,
    onMove,
    moveButtonLabel = '移動',
    onReorder,
}: SubscriptionTableProps) {
    const navigate = useNavigate();
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchStartY, setTouchStartY] = useState<number | null>(null);
    const [longPressTimerId, setLongPressTimerId] =
        useState<NodeJS.Timeout | null>(null);
    const [isLongPressMode, setIsLongPressMode] = useState<boolean>(false);
    const [swipedId, setSwipedId] = useState<string | null>(null);
    const [swipingId, setSwipingId] = useState<string | null>(null);
    const [swipeDelta, setSwipeDelta] = useState<number>(0);
    const [isSwipeAnimating, setIsSwipeAnimating] = useState<boolean>(false);
    const [isDragAnimating, setIsDragAnimating] = useState<boolean>(false);

    const totalMonthly = items.reduce(
        (sum, item) => sum + item.pricePerMonth,
        0
    );
    const totalYearly = items.reduce((sum, item) => sum + item.pricePerYear, 0);

    const getCategoryColor = (categoryKey: string) => {
        const category = categories[categoryKey];
        return category
            ? { bgColor: category.bgColor, borderColor: category.borderColor }
            : { bgColor: '#B0BEC5', borderColor: '#90A4AE' };
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
        }).format(price);
    };

    const handleDragStart = (
        e: React.DragEvent<HTMLButtonElement>,
        id: string
    ) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (
        e: React.DragEvent<HTMLButtonElement>,
        targetId: string
    ) => {
        e.preventDefault();
        if (!draggedId || draggedId === targetId || !onReorder) return;

        const draggedIndex = items.findIndex((item) => item.id === draggedId);
        const targetIndex = items.findIndex((item) => item.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const newItems = [...items];
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, draggedItem);

        onReorder(newItems);
        setIsDragAnimating(true);
        setTimeout(() => {
            setDraggedId(null);
            setIsDragAnimating(false);
        }, 300);
    };

    const handleDragEnd = () => {
        setIsDragAnimating(true);
        setTimeout(() => {
            setDraggedId(null);
            setIsDragAnimating(false);
        }, 300);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
        setTouchStartY(e.touches[0].clientY);
        setSwipedId(null);
        setIsLongPressMode(false);

        // 0.5秒後にドラッグモード有効化
        if (onReorder) {
            const timer = setTimeout(() => {
                setIsLongPressMode(true);
            }, 500);
            setLongPressTimerId(timer);
        }
    };

    const handleTouchMove = (e: React.TouchEvent, id: string) => {
        if (touchStart === null || touchStartY === null) return;

        const touchCurrent = e.touches[0].clientX;
        const touchCurrentY = e.touches[0].clientY;
        const deltaX = Math.abs(touchStart - touchCurrent);
        const deltaY = Math.abs(touchStartY - touchCurrentY);

        // 水平移動が大きい場合、スワイプモードに切り替え
        if (deltaX > deltaY + 10) {
            // スワイプ優先
            if (longPressTimerId) {
                clearTimeout(longPressTimerId);
                setLongPressTimerId(null);
            }
            setIsLongPressMode(false);
            const delta = touchStart - touchCurrent;
            setSwipingId(id);
            setSwipeDelta(delta);
        } else if (deltaY > deltaX + 10 && isLongPressMode) {
            // 垂直移動でドラッグが有効な場合
            setDraggedId(id);
        }
    };

    const handleTouchEnd = (e: React.TouchEvent, id: string) => {
        if (longPressTimerId) {
            clearTimeout(longPressTimerId);
            setLongPressTimerId(null);
        }

        // ドラッグモード中の場合は処理しない
        if (draggedId) {
            return;
        }

        if (touchStart === null) return;

        const touchEnd = e.changedTouches[0].clientX;
        const difference = touchStart - touchEnd;
        const threshold = 50;

        if (Math.abs(difference) < threshold) {
            // しきい値に達しなかった場合、アニメーション付きで元に戻す
            setIsSwipeAnimating(true);
            setSwipeDelta(0);
            setTimeout(() => {
                setSwipingId(null);
                setIsSwipeAnimating(false);
            }, 300);
            setTouchStart(null);
            setTouchStartY(null);
            setIsLongPressMode(false);
            // タップの場合、クリックイベントが発火するのを許可
            return;
        }

        // 左にスワイプ: difference > 0
        // 右にスワイプ: difference < 0

        let actionPerformed = false;

        if (difference > threshold) {
            // 左にスワイプ
            if (title.includes('契約中')) {
                // 契約中 → 追加候補に移動
                onMove?.(id);
                actionPerformed = true;
            } else if (title.includes('追加候補')) {
                // 追加候補 → 削除
                if (window.confirm('削除しますか？')) {
                    onRemove(id);
                    actionPerformed = true;
                }
            } else {
                // その他（収入・支出など） → 削除
                if (window.confirm('削除しますか？')) {
                    onRemove(id);
                    actionPerformed = true;
                }
            }
        } else if (difference < -threshold) {
            // 右にスワイプ
            if (title.includes('追加候補')) {
                // 追加候補 → 契約中に移動
                onMove?.(id);
                actionPerformed = true;
            }
        }

        if (actionPerformed) {
            setSwipedId(id);
            // カードをスライドアウト
            setTimeout(() => {
                setSwipingId(null);
                setSwipeDelta(0);
                setSwipedId(null);
            }, 600);
        } else {
            // キャンセル時は元に戻す
            setSwipingId(null);
            setSwipeDelta(0);
        }

        setTouchStart(null);
        setTouchStartY(null);
        setIsLongPressMode(false);
        // スワイプを処理した場合、イベントの伝播を止める
        e.preventDefault();
    };

    const getSwipeAction = (itemId: string) => {
        if (swipingId !== itemId && swipedId !== itemId) return null;

        if (title.includes('契約中')) {
            return 'move'; // 左スワイプで移動
        } else if (title.includes('追加候補')) {
            if (swipeDelta > 0) return 'delete'; // 左スワイプで削除
            if (swipeDelta < 0) return 'move'; // 右スワイプで移動
            return null;
        } else {
            return 'delete'; // その他は左スワイプで削除
        }
    };

    return (
        <div className={tableStyles.section}>
            <div className={tableStyles.sectionHeader}>
                <div className={tableStyles.titleRow}>
                    <h2
                        className={tableStyles.sectionTitle}
                        style={{
                            marginRight: 'auto',
                        }}
                    >
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onAdd}
                        className={tableStyles.addButton}
                    >
                        ＋
                    </button>
                </div>
                <div className={tableStyles.stats}>
                    <div className={tableStyles.statsItem}>
                        <span className={tableStyles.statsValue}>
                            {formatPrice(totalMonthly)}/月
                        </span>
                    </div>
                    <div className={tableStyles.statsItem}>
                        <span className={tableStyles.statsValue}>
                            {formatPrice(totalYearly)}/年
                        </span>
                    </div>
                </div>
            </div>

            {items.length > 0 ? (
                <>
                    {/* モバイル表示: カード */}
                    <div className={tableStyles.mobileCardList}>
                        {items.map((item) => {
                            const categoryColor = getCategoryColor(
                                item.category
                            );
                            const categoryName =
                                categories[item.category]?.name ||
                                item.category;

                            return (
                                <div
                                    key={item.id}
                                    className={tableStyles.swipeContainer}
                                >
                                    {(swipingId === item.id ||
                                        swipedId === item.id) && (
                                        <div
                                            className={`${tableStyles.swipeBackground} ${
                                                getSwipeAction(item.id) ===
                                                'delete'
                                                    ? tableStyles.swipeBackgroundDelete
                                                    : tableStyles.swipeBackgroundMove
                                            }`}
                                        >
                                            {getSwipeAction(item.id) ===
                                            'delete'
                                                ? '🗑️'
                                                : '➔'}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        className={`${tableStyles.mobileCard} ${
                                            draggedId === item.id
                                                ? tableStyles.dragging
                                                : swipedId === item.id
                                                  ? tableStyles.swiped
                                                  : ''
                                        }`}
                                        style={{
                                            transform:
                                                swipingId === item.id
                                                    ? `translateX(${-swipeDelta}px)`
                                                    : swipedId === item.id
                                                      ? `translateX(-100%)`
                                                      : 'translateX(0)',
                                            transition:
                                                swipedId === item.id ||
                                                isSwipeAnimating ||
                                                isDragAnimating
                                                    ? 'transform 0.3s ease-out, opacity 0.3s ease-out'
                                                    : 'none',
                                        }}
                                        draggable={onReorder && isLongPressMode}
                                        onDragStart={(e) =>
                                            handleDragStart(e, item.id)
                                        }
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, item.id)}
                                        onDragEnd={handleDragEnd}
                                        onTouchStart={(e) =>
                                            handleTouchStart(e)
                                        }
                                        onTouchMove={(e) =>
                                            handleTouchMove(e, item.id)
                                        }
                                        onTouchEnd={(e) =>
                                            handleTouchEnd(e, item.id)
                                        }
                                        onClick={() => {
                                            if (onCardClick) {
                                                onCardClick(item.id);
                                            } else {
                                                navigate({
                                                    to: `/subscription/${item.id}`,
                                                });
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === 'Enter' ||
                                                e.key === ' '
                                            ) {
                                                e.preventDefault();
                                                navigate({
                                                    to: `/subscription/${item.id}`,
                                                });
                                            }
                                        }}
                                    >
                                        <div className={tableStyles.cardRow}>
                                            <div
                                                className={
                                                    tableStyles.categoryBadge
                                                }
                                                style={{
                                                    backgroundColor:
                                                        categoryColor.bgColor,
                                                    borderColor:
                                                        categoryColor.borderColor,
                                                    color: '#fff',
                                                }}
                                            >
                                                {categoryName}
                                            </div>
                                            <span
                                                className={
                                                    tableStyles.cardValue
                                                }
                                            >
                                                {item.name}
                                            </span>
                                        </div>
                                        <div className={tableStyles.cardRow}>
                                            <span
                                                className={
                                                    tableStyles.cardValue
                                                }
                                            >
                                                {formatPrice(
                                                    item.pricePerMonth
                                                )}
                                                /月
                                            </span>
                                            <span
                                                className={
                                                    tableStyles.cardValue
                                                }
                                            >
                                                {formatPrice(item.pricePerYear)}
                                                /年
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* デスクトップ表示: テーブル */}
                    <div
                        className={`${tableStyles.tableWrapper} ${tableStyles.desktopTable}`}
                    >
                        <table className={tableStyles.table}>
                            <thead>
                                <tr>
                                    <th className={tableStyles.th}>
                                        カテゴリー
                                    </th>
                                    <th className={tableStyles.th}>名前</th>
                                    <th className={tableStyles.th}>月額</th>
                                    <th className={tableStyles.th}>年額</th>
                                    <th className={tableStyles.th}>備考</th>
                                    {title.includes('契約中') && (
                                        <th className={tableStyles.th}>
                                            更新月
                                        </th>
                                    )}
                                    <th className={tableStyles.th}>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => {
                                    const categoryColor = getCategoryColor(
                                        item.category
                                    );
                                    const categoryName =
                                        categories[item.category]?.name ||
                                        item.category;

                                    return (
                                        <tr key={item.id}>
                                            <td className={tableStyles.td}>
                                                <div
                                                    className={
                                                        tableStyles.categoryBadge
                                                    }
                                                    style={{
                                                        backgroundColor:
                                                            categoryColor.bgColor,
                                                        borderColor:
                                                            categoryColor.borderColor,
                                                        color: '#fff',
                                                    }}
                                                >
                                                    {categoryName}
                                                </div>
                                            </td>
                                            <td className={tableStyles.td}>
                                                {item.name}
                                            </td>
                                            <td
                                                className={`${tableStyles.td} ${tableStyles.price}`}
                                            >
                                                {formatPrice(
                                                    item.pricePerMonth
                                                )}
                                            </td>
                                            <td
                                                className={`${tableStyles.td} ${tableStyles.price}`}
                                            >
                                                {formatPrice(item.pricePerYear)}
                                            </td>
                                            <td className={tableStyles.td}>
                                                {item.remark ? (
                                                    <span title={item.remark}>
                                                        {item.remark.length > 15
                                                            ? `${item.remark.substring(0, 15)}...`
                                                            : item.remark}
                                                    </span>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            {title.includes('契約中') && (
                                                <td className={tableStyles.td}>
                                                    {item.renewalMonth || '-'}
                                                </td>
                                            )}
                                            <td className={tableStyles.td}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        gap: '0.25rem',
                                                    }}
                                                >
                                                    {onMove && (
                                                        <button
                                                            type="button"
                                                            className={
                                                                tableStyles.moveButton
                                                            }
                                                            onClick={() =>
                                                                onMove(item.id)
                                                            }
                                                        >
                                                            {moveButtonLabel}
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className={
                                                            tableStyles.deleteButton
                                                        }
                                                        onClick={() => {
                                                            if (
                                                                window.confirm(
                                                                    `「${item.name}」を削除しますか？`
                                                                )
                                                            ) {
                                                                onRemove(
                                                                    item.id
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        削除
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className={tableStyles.emptyState}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        📭
                    </div>
                    <p>まだ{title}がありません</p>
                </div>
            )}
        </div>
    );
}
