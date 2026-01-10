import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    exportToJSON,
    importFromJSON,
    loadFromLocalStorage,
    saveToLocalStorage,
} from './storage';

// LocalStorageのモック
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('storage', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    describe('loadFromLocalStorage', () => {
        it('保存されたデータを正しく読み込む', () => {
            const testData = { name: 'Test', value: 123 };
            localStorage.setItem('test-key', JSON.stringify(testData));

            const result = loadFromLocalStorage('test-key', {});
            expect(result).toEqual(testData);
        });

        it('データが存在しない場合はデフォルト値を返す', () => {
            const defaultValue = { default: true };
            const result = loadFromLocalStorage('non-existent', defaultValue);
            expect(result).toEqual(defaultValue);
        });

        it('JSONパースに失敗した場合はデフォルト値を返す', () => {
            localStorage.setItem('invalid-json', 'not a valid json');
            const consoleErrorSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            const defaultValue = { error: 'handled' };
            const result = loadFromLocalStorage('invalid-json', defaultValue);

            expect(result).toEqual(defaultValue);
            expect(consoleErrorSpy).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });
    });

    describe('saveToLocalStorage', () => {
        it('データを正しく保存する', () => {
            const testData = { name: 'Test', value: 456 };
            saveToLocalStorage('save-key', testData);

            const saved = localStorage.getItem('save-key');
            expect(saved).toBe(JSON.stringify(testData));
        });

        it('複雑なデータ構造を正しく保存する', () => {
            const complexData = {
                array: [1, 2, 3],
                nested: { key: 'value' },
                number: 42,
                string: 'test',
            };
            saveToLocalStorage('complex-key', complexData);

            const saved = localStorage.getItem('complex-key');
            expect(JSON.parse(saved as string)).toEqual(complexData);
        });
    });

    describe('exportToJSON', () => {
        it('データを整形されたJSON文字列にエクスポートする', () => {
            const data = { name: 'Export', values: [1, 2, 3] };
            const result = exportToJSON(data);

            expect(result).toBe(JSON.stringify(data, null, 2));
            expect(result).toContain('\n'); // 整形されている
        });
    });

    describe('importFromJSON', () => {
        it('JSON文字列を正しくパースする', () => {
            const data = { name: 'Import', count: 100 };
            const json = JSON.stringify(data);

            const result = importFromJSON<typeof data>(json);
            expect(result).toEqual(data);
        });

        it('不正なJSON文字列でエラーをスローする', () => {
            expect(() => importFromJSON('not valid json')).toThrow();
        });
    });
});
