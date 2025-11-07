# ストレージ実装の調査結果

## 問題の経緯

ゲームレビュー機能にストレージ機能を実装する際、以下の3つのアプローチを試み、最終的に`localStorage`での実装に落ち着いた。

## 試行したアプローチと結果

### 1️⃣ アプローチ1: `wxt/storage` のインポート（失敗）

#### 実装
```typescript
import { storage } from 'wxt/storage';

await storage.setItem('local:review:505589', review);
```

#### エラー
```
Uncaught (in promise) Error: 'wxt/storage' must be loaded in a web extension environment
 - If thrown during a build, see https://github.com/wxt-dev/wxt/issues/371
```

#### 原因
- **インポートパスが間違っていた**: 正しくは `wxt/utils/storage`
- ビルド時にNode.js環境でコードが評価され、`chrome.storage` APIが利用できなかった

---

### 2️⃣ アプローチ2: `wxt/browser` 経由のChrome API（失敗）

#### 実装
```typescript
import { browser } from 'wxt/browser';

await browser.storage.local.set({ [key]: review });
const result = await browser.storage.local.get(key);
```

#### エラー
```
TypeError: Cannot read properties of undefined (reading 'local')
```

#### 原因
- Content Script環境では `browser` オブジェクトが正しく初期化されていない可能性
- または、実行タイミングの問題（React コンポーネントのマウント時に非同期で呼ばれる前に評価）

---

### 3️⃣ アプローチ3: `localStorage`（成功✅）

#### 実装
```typescript
// シンプルなWeb API
localStorage.setItem('avc_review:505589', JSON.stringify(review));
const data = localStorage.getItem('avc_review:505589');
const parsed = JSON.parse(data);
```

#### 利点
- ✅ Content Scriptで確実に利用可能
- ✅ 追加のインポートや設定が不要
- ✅ シンプルで予測可能な動作
- ✅ 同一オリジン（ページのドメイン）にデータが保存される

#### 欠点
- ❌ Chrome Storageと異なり、**拡張機能全体で共有されない**（ページごとに独立）
- ❌ ドメインが変わるとデータが失われる
- ❌ 同期機能（`sync` storage）が使えない
- ❌ 容量制限が約5-10MB（Chrome Storageは`local`で5MB、`sync`で100KB）

---

## WXT Storage の正しい使い方

調査の結果、`wxt/storage` は以下の条件で**正しく動作可能**であることが判明した。

### ✅ 必須要件

1. **正しいインポートパス**
   ```typescript
   import { storage } from 'wxt/utils/storage';
   ```

2. **manifest.jsonに`storage`パーミッション**
   ```typescript
   // wxt.config.ts
   export default defineConfig({
     manifest: {
       permissions: ['storage'],
     }
   });
   ```
   → これは既に設定済みだった ✅

3. **ストレージキーにプレフィックスを付与**
   ```typescript
   // ❌ NG
   await storage.getItem('review:505589');

   // ✅ OK
   await storage.getItem('local:review:505589');
   ```
   ストレージエリア（`local:`, `sync:`, `session:`, `managed:`）を必ず指定する。

4. **モジュールレベルでの実行を避ける**

   ビルド時にNode.js環境で評価されるため、モジュールトップレベルで `storage.defineItem()` などを呼ぶと失敗する。

   ```typescript
   // ❌ NG: モジュールトップレベル
   const reviewStorage = storage.defineItem('local:review', { fallback: {} });

   // ✅ OK: 関数内で実行
   export default defineBackground(() => {
     const reviewStorage = storage.defineItem('local:review', { fallback: {} });
   });
   ```

### 📝 基本的な使い方

```typescript
import { storage } from 'wxt/utils/storage';

// 保存
await storage.setItem('local:review:505589', reviewData);

// 読み込み
const data = await storage.getItem<GameReview>('local:review:505589');

// 監視（リアルタイム更新）
const unwatch = storage.watch('local:review:505589', (newValue, oldValue) => {
  console.log('レビューが更新されました', newValue);
});

// 削除
await storage.removeItem('local:review:505589');
```

### 🔧 defineItem() を使った方法（推奨）

```typescript
// utils/review-storage.ts
import { storage } from 'wxt/utils/storage';

export function createReviewStorage(videoId: string) {
  return storage.defineItem<GameReview>(
    `local:review:${videoId}`,
    {
      fallback: {
        gameId: '',
        homeTeamName: '',
        awayTeamName: '',
        periods: { '1': [], '2': [], '3': [], '4': [] }
      }
    }
  );
}

// 使用例
const reviewItem = createReviewStorage('505589');
await reviewItem.setValue(reviewData);
const data = await reviewItem.getValue();
```

---

## Content Scriptでの制約

Content Scriptは**ページと拡張機能の中間的な環境**で動作するため、以下の制約がある：

### 利用可能なAPI
- ✅ `chrome.storage` (manifest V3)
- ✅ `browser.storage` (WXT経由)
- ✅ Web API (`localStorage`, `fetch`, DOM API等)
- ✅ `chrome.runtime.sendMessage` (メッセージング)

### 利用不可能なAPI
- ❌ `chrome.tabs`, `chrome.windows` などのUI API
- ❌ Background専用API

---

## 推奨される実装方法の比較

| 方法 | 利点 | 欠点 | 推奨度 |
|------|------|------|--------|
| **localStorage** | シンプル、確実 | ページ依存、容量小 | ⭐⭐⭐ (今回採用) |
| **wxt/utils/storage** | 拡張機能全体で共有、同期可能 | 設定が必要、複雑 | ⭐⭐⭐⭐ (理想的) |
| **chrome.storage.local** | 直接的、柔軟 | プレフィックス管理が手動 | ⭐⭐⭐ |

---

## 今後の改善案

現在は`localStorage`を使用しているが、以下の理由で **`wxt/utils/storage`への移行を推奨**：

### メリット
1. **拡張機能全体でデータ共有**
   - Popup、Background、別のタブのContent Scriptから同じデータにアクセス可能

2. **同期機能**
   - `sync:` プレフィックスでユーザーのChromeアカウント間でデータ同期

3. **監視機能**
   - `storage.watch()` でリアルタイム更新を検知

4. **型安全性**
   - TypeScriptの型パラメータでデータ型を保証

### 移行方法

```typescript
// src/utils/storage.ts
import { storage } from 'wxt/utils/storage';
import { GameReview } from '@/types/game-review';

export const gameReviewStorage = {
  async save(videoId: string, review: GameReview): Promise<void> {
    const key = `local:review:${videoId}`;
    await storage.setItem(key, review);
    console.log(`[AVC Storage] Saved review for video ID: ${videoId}`, review);
  },

  async load(videoId: string): Promise<GameReview | null> {
    const key = `local:review:${videoId}`;
    const data = await storage.getItem<GameReview>(key);

    if (data) {
      console.log(`[AVC Storage] Loaded review for video ID: ${videoId}`, data);
      return data;
    }

    return null;
  },

  async delete(videoId: string): Promise<void> {
    const key = `local:review:${videoId}`;
    await storage.removeItem(key);
  },
};
```

**注意点**:
- ✅ `import { storage } from 'wxt/utils/storage'` を使用
- ✅ キーは `local:review:{videoId}` 形式
- ✅ `wxt.config.ts` で `permissions: ['storage']` が設定済み

---

## 参考リンク

- [WXT Storage公式ドキュメント](https://wxt.dev/storage)
- [GitHub Issue #371](https://github.com/wxt-dev/wxt/issues/371) - ビルド時エラーの解決方法
- [@wxt-dev/storage パッケージ](https://www.npmjs.com/package/@wxt-dev/storage)

---

## まとめ

### 何がダメだったのか
1. **インポートパスの誤り**: `wxt/storage` → 正しくは `wxt/utils/storage`
2. **実行環境の理解不足**: Content ScriptとNode.js環境の違いを考慮していなかった
3. **`browser`オブジェクトの初期化タイミング**: Reactコンポーネント内で即座に使えると思い込んでいた

### 正しいアプローチ
- ✅ **現状**: `localStorage`でシンプルに実装（動作確認済み）
- ✅ **理想**: `wxt/utils/storage`に移行して拡張機能全体でデータ共有

### 次のステップ
1. 現在の`localStorage`実装で動作確認
2. 余裕があれば`wxt/utils/storage`への移行を検討
3. Popup UIやBackground Scriptとのデータ共有が必要になった時点で必ず移行
