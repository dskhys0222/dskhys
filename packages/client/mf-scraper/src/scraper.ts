import type { Browser, BrowserContext, Page } from 'playwright';
import { chromium } from 'playwright';
import { assignIds } from './assign-ids.js';
import { getAuthFilePath, hasAuthFile } from './config.js';

const MF_PORTFOLIO_URL = 'https://moneyforward.com/bs/portfolio';

export interface MFStock {
    /** 一意のID（銘柄名_金融機関名、重複時は_2, _3...） */
    id: string;
    /** 銘柄名 */
    name: string;
    /** 保有単位数/口数 */
    units: number;
    /** 平均購入単価 */
    averageCost: number;
    /** 現在の株価/基準価額 */
    currentPrice: number;
    /** 評価額（現在の時価） */
    value: number;
    /** 評価損益（評価額 - 平均購入単価 * 保有単位数） */
    profitLoss: number;
    /** 口座名 */
    account: string;
}

export interface PortfolioData {
    stocks: MFStock[];
    scrapedAt: string;
}

/**
 * Playwrightブラウザを起動
 */
export const launchBrowser = async (
    headless: boolean = true
): Promise<Browser> => {
    return chromium.launch({
        headless,
        // bot検出対策
        args: ['--disable-blink-features=AutomationControlled'],
    });
};

/**
 * 保存済みセッションからコンテキストを作成
 */
export const createContextWithSession = async (
    browser: Browser
): Promise<BrowserContext> => {
    if (!hasAuthFile()) {
        throw new Error(
            'セッションファイルが見つかりません。\n' +
                '先に `pnpm login` を実行してログインしてください。'
        );
    }

    return browser.newContext({
        storageState: getAuthFilePath(),
        // User-Agentを通常のブラウザに設定（bot検出対策）
        userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        // HTTPヘッダーを設定
        extraHTTPHeaders: {
            'Accept-Language': 'ja-JP,ja;q=0.9',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        },
        // ブラウザ検出対策
        bypassCSP: true,
    });
};

/**
 * ログイン状態を確認
 */
export const checkLoginStatus = async (page: Page): Promise<boolean> => {
    await page.goto(MF_PORTFOLIO_URL, { waitUntil: 'networkidle' });

    // ログインページにリダイレクトされていないか確認
    const url = page.url();
    return !url.includes('login') && !url.includes('sign_in');
};

/**
 * ポートフォリオデータをスクレイピング
 */
export const scrapePortfolio = async (page: Page): Promise<PortfolioData> => {
    await page.goto(MF_PORTFOLIO_URL, { waitUntil: 'networkidle' });

    // ログインチェック
    const url = page.url();
    if (url.includes('login') || url.includes('sign_in')) {
        throw new Error(
            'セッションが無効です。\n' +
                '`pnpm login` を実行して再ログインしてください。'
        );
    }

    // ポートフォリオテーブルを待機
    await page.waitForSelector('table', { timeout: 3000 });

    // 数値のパース用ヘルパー
    const parseNumber = (text: string): number => {
        const cleaned = text.replace(/[,円%]/g, '').trim();
        return Number.parseFloat(cleaned) || 0;
    };

    // 銘柄データを抽出
    const stocks: Omit<MFStock, 'id'>[] = [];

    // 現金
    const cashRows = await page.locator('table tbody tr').all();
    let cashRow1Text = '';
    let cashRow2Text = '';
    let cashRow3Text = '';
    for (const row of cashRows) {
        const text = await row.textContent();
        if (text?.includes('SBIハイブリッド預金')) {
            const cells = await row.locator('td').all();
            if (cells[1]) {
                cashRow1Text = (await cells[1].textContent()) || '0';
            }
        }
        if (text?.includes('現金残高(ハイブリッド預金除く)')) {
            const cells = await row.locator('td').all();
            if (cells[1]) {
                cashRow2Text = (await cells[1].textContent()) || '0';
            }
        }
        if (text?.includes('預り金')) {
            const cells = await row.locator('td').all();
            if (cells[1]) {
                cashRow3Text = (await cells[1].textContent()) || '0';
            }
        }
    }
    const cashAmount =
        parseNumber(cashRow1Text) +
        parseNumber(cashRow2Text) +
        parseNumber(cashRow3Text);
    stocks.push({
        name: '現金',
        units: cashAmount,
        averageCost: 1,
        currentPrice: 1,
        value: cashAmount,
        profitLoss: 0,
        account: 'SBIハイブリッド預金',
    });

    // 暗号資産
    let cryptoAmount = 0;
    for (const row of cashRows) {
        const text = await row.textContent();
        if (text?.includes('GMOコイン')) {
            const cells = await row.locator('td').all();
            if (cells[1]) {
                cryptoAmount += parseNumber(
                    (await cells[1].textContent()) || '0'
                );
            }
        }
    }
    if (cryptoAmount > 0) {
        stocks.push({
            name: 'ビットコイン',
            units: cryptoAmount,
            averageCost: 1,
            currentPrice: 1,
            value: cryptoAmount,
            profitLoss: 0,
            account: 'GMOコイン',
        });
    }

    // 株式
    const stockRows = await page
        .locator('#portfolio_det_eq table tbody tr')
        .all();
    for (const row of stockRows) {
        const cells = await row.locator('td').all();
        if (cells.length >= 7) {
            stocks.push({
                name: (await cells[0]?.textContent())?.trim() || '',
                units: parseNumber((await cells[2]?.textContent()) || '0'),
                averageCost: parseNumber(
                    (await cells[3]?.textContent()) || '0'
                ),
                currentPrice: parseNumber(
                    (await cells[4]?.textContent()) || '0'
                ),
                value: parseNumber((await cells[5]?.textContent()) || '0'),
                profitLoss: parseNumber((await cells[7]?.textContent()) || '0'),
                account: (await cells[9]?.textContent())?.trim() || '',
            });
        }
    }

    // 投資信託
    const mfRows = await page.locator('#portfolio_det_mf table tbody tr').all();
    for (const row of mfRows) {
        const cells = await row.locator('td').all();
        if (cells.length >= 7) {
            stocks.push({
                name: (await cells[0]?.textContent())?.trim() || '',
                units:
                    parseNumber((await cells[1]?.textContent()) || '0') / 10000,
                averageCost: parseNumber(
                    (await cells[2]?.textContent()) || '0'
                ),
                currentPrice: parseNumber(
                    (await cells[3]?.textContent()) || '0'
                ),
                value: parseNumber((await cells[4]?.textContent()) || '0'),
                profitLoss: parseNumber((await cells[6]?.textContent()) || '0'),
                account: (await cells[8]?.textContent())?.trim() || '',
            });
        }
    }

    // 年金
    const pensionRows = await page
        .locator('#portfolio_det_pns table tbody tr')
        .all();
    for (const row of pensionRows) {
        const cells = await row.locator('td').all();
        if (cells.length >= 7) {
            stocks.push({
                name: (await cells[0]?.textContent())?.trim() || '',
                units: 1,
                averageCost: parseNumber(
                    (await cells[1]?.textContent()) || '0'
                ),
                currentPrice: parseNumber(
                    (await cells[2]?.textContent()) || '0'
                ),
                value: parseNumber((await cells[2]?.textContent()) || '0'),
                profitLoss: parseNumber((await cells[3]?.textContent()) || '0'),
                account: 'DC',
            });
        }
    }

    console.table(stocks);

    // 同一銘柄・同一金融機関をグループ化して合計
    const aggregated = aggregateStocksByNameAndAccount(stocks);

    // ID を割り当て
    const stocksWithIds = assignIds(aggregated);

    return {
        stocks: stocksWithIds,
        scrapedAt: new Date().toISOString(),
    };
};

/**
 * 同一銘柄・同一金融機関のストックを集約
 * 複数行がある場合は合計し、平均取得単価は加重平均で計算
 */
const aggregateStocksByNameAndAccount = (
    stocks: Omit<MFStock, 'id'>[]
): Omit<MFStock, 'id'>[] => {
    const grouped = new Map<string, Omit<MFStock, 'id'>[]>();

    // 銘柄名と金融機関で グループ化
    for (const stock of stocks) {
        const key = `${stock.name}::${stock.account}`;
        if (!grouped.has(key)) {
            grouped.set(key, []);
        }
        // biome-ignore lint/style/noNonNullAssertion: ロジック上ありえない
        grouped.get(key)!.push(stock);
    }

    // 各グループを合計
    const result: Omit<MFStock, 'id'>[] = [];

    for (const items of grouped.values()) {
        if (items.length === 1) {
            // グループが1つのみの場合はそのまま追加
            result.push(items[0]);
            continue;
        }

        // 複数行ある場合は合計
        const totalUnits = items.reduce((sum, item) => sum + item.units, 0);
        const totalValue = items.reduce((sum, item) => sum + item.value, 0);
        const totalProfitLoss = items.reduce(
            (sum, item) => sum + item.profitLoss,
            0
        );

        // 加重平均の平均取得単価を計算
        const totalCost = items.reduce(
            (sum, item) => sum + item.averageCost * item.units,
            0
        );
        const weightedAverageCost = totalUnits > 0 ? totalCost / totalUnits : 0;

        // 現在価格は最初の項目のものを使用（同一銘柄なので同じはず）
        const currentPrice = items[0].currentPrice;

        result.push({
            name: items[0].name,
            account: items[0].account,
            units: totalUnits,
            averageCost: weightedAverageCost,
            currentPrice,
            value: totalValue,
            profitLoss: totalProfitLoss,
        });
    }

    return result;
};
