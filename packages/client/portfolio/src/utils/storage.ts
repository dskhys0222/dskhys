/**
 * LocalStorageからデータを読み込む
 * @param key ストレージキー
 * @param defaultValue デフォルト値
 * @returns 読み込んだデータまたはデフォルト値
 */
export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
    try {
        const item = localStorage.getItem(key);
        if (!item || item === 'undefined') {
            return defaultValue;
        }
        return JSON.parse(item);
    } catch (error) {
        console.error(`Failed to load from localStorage (${key}):`, error);
        return defaultValue;
    }
}

/**
 * LocalStorageにデータを保存する
 * @param key ストレージキー
 * @param value 保存するデータ
 */
export function saveToLocalStorage<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Failed to save to localStorage (${key}):`, error);
    }
}

/**
 * JSONとしてエクスポート
 * @param data データ
 * @returns JSON文字列
 */
export function exportToJSON(data: unknown): string {
    return JSON.stringify(data, null, 2);
}

/**
 * JSONからインポート
 * @param json JSON文字列
 * @returns パースされたデータ
 */
export function importFromJSON<T>(json: string): T {
    return JSON.parse(json);
}
