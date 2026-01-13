#!/usr/bin/env node

/**
 * バージョン自動生成スクリプト
 * ビルド前に実行され、package.json のバージョンと git コミットハッシュから バージョンを生成します
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// スクリプトのディレクトリを取得
const __dirname = dirname(fileURLToPath(import.meta.url));
const packageDir = dirname(__dirname); // packages/client/mf-scraper

try {
    // package.json からバージョンを読込
    const packageJsonPath = join(packageDir, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const baseVersion = packageJson.version;

    // Git コミットハッシュを取得（短い形式）
    const gitHash = execSync('git rev-parse --short HEAD', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'], // stderr を無視
    }).trim();

    // ビルド時刻
    const buildDate = new Date().toISOString();

    // バージョンスト文字列
    const version = `${baseVersion}+git.${gitHash}`;

    // version.ts の内容
    const versionContent = `/**
 * バージョン情報
 * ビルド時に自動生成された
 */

export const VERSION = '${version}';
export const GIT_HASH = '${gitHash}';
export const BUILD_DATE = '${buildDate}';
`;

    // ファイルに書き込み
    const versionFile = join(packageDir, 'src', 'version.ts');
    writeFileSync(versionFile, versionContent, 'utf-8');

    console.log(`✓ Version generated: ${version}`);
    console.log(`  Git Hash: ${gitHash}`);
    console.log(`  Build Date: ${buildDate}`);
} catch (error) {
    if (error instanceof Error) {
        if (error.message.includes('fatal: not a git repository')) {
            // Git リポジトリでない場合（例：npm tar ball）は package.json のバージョンを使用
            console.warn('⚠ Not a git repository, using default version');
            const packageJsonPath = join(packageDir, 'package.json');
            const packageJson = JSON.parse(
                readFileSync(packageJsonPath, 'utf-8')
            );
            const baseVersion = packageJson.version;
            const versionContent = `/**
 * バージョン情報
 * ビルド時に自動生成された（Git リポジトリ外）
 */

export const VERSION = '${baseVersion}+git.unknown';
export const GIT_HASH = 'unknown';
export const BUILD_DATE = '${new Date().toISOString()}';
`;
            const versionFile = join(packageDir, 'src', 'version.ts');
            writeFileSync(versionFile, versionContent, 'utf-8');
        } else {
            console.error('✗ Error generating version:', error.message);
            process.exit(1);
        }
    }
}
