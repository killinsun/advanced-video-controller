# 実装計画書: Advanced Video Controller Chrome拡張機能

## プロジェクト概要
Softbank バスケットボール動画プレーヤー（https://basketball.mb.softbank.jp/lives/）に対して、より詳細なビデオコントロール機能を追加するChrome拡張機能。

### 主要機能
- **コマ送り**: 左右矢印キーで1フレーム（1/30秒）単位の移動
- **1秒スキップ**: ボタンで前後1秒ずつの移動
- **時間指定ジャンプ**: 特定の時間位置へのシーク
- **URLパラメーター対応**: `?t=90`などで指定時間から再生
- **設定管理**: キーボードショートカットの有効/無効切り替え

---

## 技術スタック
- **フレームワーク**: WXT v0.20+ (Next-gen Web Extension Framework)
- **UI**: React 19 + shadcn/ui + Tailwind CSS
- **言語**: TypeScript 5.9+
- **パッケージマネージャー**: Bun
- **開発手法**: TDD（Test-Driven Development）

## 技術的前提条件
### 対象プレーヤー
- **プレーヤーライブラリ**: Video.js
- **プレーヤー取得方法**: `videojs.getPlayers()`
- **操作API**: `player.currentTime()`, `player.pause()`, `player.play()`
- **フレームレート**: 30fps（1フレーム = 1/30秒 ≈ 0.033秒）

### 対象URL
- `https://basketball.mb.softbank.jp/lives/*`

---

## フェーズ別実装計画

### **Phase 0: 環境セットアップ**
**目的**: 開発に必要な環境とライブラリをセットアップ

**タスク**:
- [x] WXTプロジェクト初期化
- [ ] Tailwind CSSセットアップ
  - PostCSSとTailwind CSS設定
  - WXTでのTailwind CSS統合
- [ ] shadcn/uiセットアップ
  - CLI初期化: `bunx shadcn@latest init`
  - 必要なコンポーネント追加（Button, Switch, Input）
- [ ] 開発・ビルドスクリプト確認

**成果物**: 基本的な開発環境
**テスト**:
- `bun run dev`で拡張機能が起動すること
- Tailwind CSSクラスが適用されること
- shadcn/uiコンポーネントが表示されること

**コミットポイント**:
- "chore: setup tailwind css"
- "chore: setup shadcn/ui"

---

### **Phase 1: Video.jsプレーヤー検出機能実装**
**目的**: 対象ページでVideo.jsプレーヤーを確実に検出する

**実装詳細**:
```typescript
// utils/player-detector.ts

/**
 * Video.jsプレーヤーを検出する
 * プレーヤーが見つかるまで最大10秒間リトライ
 */
export async function detectVideoJsPlayer(): Promise<any> {
  const maxRetries = 20; // 20回 × 500ms = 10秒
  const retryDelay = 500;

  for (let i = 0; i < maxRetries; i++) {
    // グローバルのvideojsが利用可能か確認
    if (typeof window.videojs !== 'undefined') {
      const players = window.videojs.getPlayers();
      const playerIds = Object.keys(players);

      if (playerIds.length > 0) {
        const player = players[playerIds[0]];
        console.log('[AVC] Player detected:', playerIds[0]);
        return player;
      }
    }

    // リトライ待機
    await new Promise(resolve => setTimeout(resolve, retryDelay));
  }

  throw new Error('Video.js player not found after 10 seconds');
}
```

**タスク**:
1. Content Scriptの対象URL設定
   ```typescript
   // entrypoints/content.ts
   export default defineContentScript({
     matches: ['https://basketball.mb.softbank.jp/lives/*'],
     main() {
       // ...
     },
   });
   ```
2. Video.jsプレーヤー検出ユーティリティ作成
3. TypeScript型定義追加
   ```typescript
   // types/videojs.d.ts
   declare global {
     interface Window {
       videojs: any;
     }
   }
   ```
4. ユニットテスト作成（Vitest使用を検討）

**成果物**: プレーヤー検出機能
**テスト**:
- 対象ページでプレーヤーが検出されることをログ確認
- プレーヤーが存在しないページでエラーハンドリング確認
- `player.currentTime()`などのAPIが呼び出せることを確認

**コミットポイント**: "feat: add video.js player detection logic"

---

### **Phase 2: ストレージ設定の実装**
**目的**: キーボードショートカットの有効/無効を保存できるようにする

**タスク**:
1. ストレージアイテム定義
   ```typescript
   // utils/storage.ts
   const keyboardShortcutsEnabled = storage.defineItem<boolean>(
     'local:keyboardShortcutsEnabled',
     { fallback: true }
   );
   ```
2. 設定読み込み/保存のユーティリティ関数作成
3. ユニットテスト作成

**成果物**: ストレージユーティリティ
**テスト**: ストレージの読み書きが正しく動作すること

**コミットポイント**: ✅ "feat: add storage utilities for settings"

---

### **Phase 3: ポップアップUI実装**
**目的**: 拡張機能のアイコンクリック時に設定画面を表示

**タスク**:
1. Popup HTMLの作成（既存のpopup/を活用）
2. shadcn/uiのSwitchコンポーネント追加
3. キーボードショートカット有効/無効の切り替えUI実装
4. ストレージとの連携

**成果物**: 設定ポップアップ画面
**テスト**:
- ポップアップが開くこと
- スイッチの切り替えがストレージに保存されること

**コミットポイント**: ✅ "feat: add popup UI for settings"

---

### **Phase 4: コマ送り機能実装（キーボードショートカット）**
**目的**: 左右矢印キーで1フレーム単位の移動を実現

**実装詳細**:
```typescript
// utils/frame-controller.ts

export class FrameController {
  private readonly fps: number = 30;
  private readonly frameTime: number;
  private player: any;

  constructor(player: any, fps: number = 30) {
    this.player = player;
    this.fps = fps;
    this.frameTime = 1 / fps; // 30fps = 0.0333...秒
  }

  /**
   * 1フレーム進む
   */
  nextFrame(): void {
    this.player.pause(); // 一時停止して正確に制御
    const newTime = this.player.currentTime() + this.frameTime;
    const duration = this.player.duration();

    if (newTime < duration) {
      this.player.currentTime(newTime);
      console.log(`[AVC] Next frame: ${newTime.toFixed(3)}s`);
    }
  }

  /**
   * 1フレーム戻る
   */
  prevFrame(): void {
    this.player.pause();
    const newTime = Math.max(0, this.player.currentTime() - this.frameTime);
    this.player.currentTime(newTime);
    console.log(`[AVC] Prev frame: ${newTime.toFixed(3)}s`);
  }

  /**
   * N秒スキップ
   */
  skip(seconds: number): void {
    const currentTime = this.player.currentTime();
    const newTime = Math.max(0, Math.min(currentTime + seconds, this.player.duration()));
    this.player.currentTime(newTime);
    console.log(`[AVC] Skip ${seconds}s: ${newTime.toFixed(1)}s`);
  }
}
```

```typescript
// entrypoints/content.ts での使用例

let frameController: FrameController;

document.addEventListener('keydown', async (e) => {
  // 設定チェック
  const { keyboardShortcutsEnabled } = await storage.getItem('local:keyboardShortcutsEnabled');
  if (!keyboardShortcutsEnabled) return;

  // input/textareaでは無効
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
    return;
  }

  switch (e.key) {
    case 'ArrowRight':
      e.preventDefault();
      frameController.nextFrame();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      frameController.prevFrame();
      break;
  }
});
```

**タスク**:
1. FrameControllerクラス作成
   - コンストラクタでプレーヤーとFPSを受け取る
   - `nextFrame()`: 1フレーム進む（1/30秒）
   - `prevFrame()`: 1フレーム戻る
   - `skip(seconds)`: N秒スキップ（1秒スキップ用）
2. キーボードイベントリスナー実装
   - `ArrowRight`: 次のフレーム
   - `ArrowLeft`: 前のフレーム
   - イベント伝播の防止（`e.preventDefault()`）
3. 設定に応じたショートカットの有効/無効制御
4. ユニットテスト作成

**成果物**: コマ送り機能
**テスト**:
- 矢印キーで動画が1フレーム（約0.033秒）移動すること
- 設定で無効にした場合、動作しないこと
- input/textarea要素フォーカス時は動作しないこと
- 動画の開始位置（0秒）と終了位置を超えないこと
- キー押下時に動画が一時停止すること

**コミットポイント**: "feat: add frame-by-frame navigation with arrow keys"

---

### **Phase 5: カスタムコントロールUI実装**
**目的**: プレーヤー下部に1秒スキップボタンを追加

**実装詳細**:
```typescript
// entrypoints/content/index.tsx (WXTのUI統合)

export default defineContentScript({
  matches: ['https://basketball.mb.softbank.jp/lives/*'],

  async main(ctx) {
    const player = await detectVideoJsPlayer();
    const frameController = new FrameController(player);

    // UIマウント
    const ui = await createShadowRootUi(ctx, {
      name: 'advanced-video-controller',
      position: 'inline',
      anchor: '.video-controls', // プレーヤーコントロール要素
      onMount: (container) => {
        const app = createApp(() => <ControlPanel controller={frameController} />);
        app.mount(container);
        return app;
      },
      onRemove: (app) => {
        app?.unmount();
      },
    });

    ui.mount();
  },
});
```

```tsx
// components/ControlPanel.tsx

import { Button } from '@/components/ui/button';

interface ControlPanelProps {
  controller: FrameController;
}

export function ControlPanel({ controller }: ControlPanelProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-900/80 rounded-md">
      <Button
        variant="outline"
        size="sm"
        onClick={() => controller.skip(-1)}
        className="text-white"
      >
        -1秒
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => controller.skip(1)}
        className="text-white"
      >
        +1秒
      </Button>
    </div>
  );
}
```

**タスク**:
1. WXT Shadow Root UIの設定
   - `createShadowRootUi`でReactコンポーネントをマウント
   - プレーヤーコントロール要素の下に配置
   - Tailwind CSSスタイルをShadow DOMに注入
2. ControlPanelコンポーネント作成
   - shadcn/uiのButtonコンポーネント使用
   - 「-1秒」「+1秒」ボタン
   - FrameControllerのインスタンスを受け取る
3. ボタンクリックハンドラー実装
   - `controller.skip(-1)` / `controller.skip(1)`を呼び出し
4. スタイリング
   - Tailwind CSSで視認性の高いデザイン
   - 半透明背景でプレーヤーと調和

**成果物**: カスタムコントロールUI
**テスト**:
- ボタンがプレーヤーコントロール下部に表示されること
- 「-1秒」ボタンクリックで1秒戻ること
- 「+1秒」ボタンクリックで1秒進むこと
- ページの既存CSSと干渉しないこと（Shadow DOM）
- ページリロード時も正しく表示されること

**コミットポイント**: "feat: add custom control buttons for 1-second skip"

---

### **Phase 6: 時間指定ジャンプ機能実装**
**目的**: 指定した時間から再生できるようにする

**タスク**:
1. カスタムコントロールに時間入力フィールド追加
   - shadcn/uiのInputコンポーネント使用
   - "MM:SS" または "HH:MM:SS" 形式をサポート
2. 時間パース関数実装
3. ジャンプボタン実装
4. テストコード作成

**成果物**: 時間指定ジャンプ機能
**テスト**:
- "1:30"入力で1分30秒にジャンプすること
- 無効な入力時のエラーハンドリング

**コミットポイント**: ✅ "feat: add time-based seek functionality"

---

### **Phase 7: URLクエリパラメーター対応**
**目的**: URLに時間パラメーターがある場合、自動的にその時間から再生

**タスク**:
1. URLパラメーター読み取りロジック実装
   - `?t=90` → 90秒から再生
   - `?t=1m30s` → 1分30秒から再生
2. プレーヤー初期化時の自動シーク実装
3. パラメーターパース関数のテスト作成

**成果物**: URL時間パラメーター機能
**テスト**:
- `?t=60`でページを開くと60秒から再生開始すること
- パラメーターがない場合は通常通り動作すること

**コミットポイント**: ✅ "feat: add URL query parameter support for time-based seek"

---

### **Phase 8: エラーハンドリングと改善**
**目的**: 堅牢性を高める

**タスク**:
1. プレーヤー未検出時のエラーメッセージ表示
2. ビデオメタデータ読み込み待機処理
3. 境界値チェック（0秒未満、動画長さ超過）
4. エラーロギング実装
5. 統合テスト作成

**成果物**: エラーハンドリング実装
**テスト**:
- プレーヤーがない場合のgraceful degradation
- 不正な時間指定時の処理

**コミットポイント**: ✅ "feat: add error handling and boundary checks"

---

### **Phase 9: ドキュメント作成**
**目的**: 使い方とメンテナンス情報を整備

**タスク**:
1. README.md更新
   - 機能説明
   - インストール方法
   - 開発方法
2. CONTRIBUTING.md作成（必要に応じて）
3. コード内コメント整備

**成果物**: プロジェクトドキュメント

**コミットポイント**: ✅ "docs: add comprehensive documentation"

---

## 優先順位付き実装順序

### 🎯 MVP（最小限の動作版）:
**目標**: まず動くものを作る。UI/UXの改善は後回し。

1. **Phase 1**: Video.jsプレーヤー検出機能実装
   - Content Scriptの基本設定
   - プレーヤー検出ロジック
   - コンソールログで確認

2. **Phase 4**: コマ送り機能（キーボードショートカット）
   - FrameControllerクラス
   - 左右矢印キーで1フレーム移動
   - 1秒スキップ機能も含む

3. **Phase 5**: カスタムコントロールUI実装（簡易版）
   - プレーンなReact/HTMLで実装
   - ボタンだけのシンプルなUI
   - **Tailwind CSS・shadcn/uiは使用しない**

### 📦 Phase 2（機能拡張）:
4. **Phase 7**: URLパラメーター対応
   - `?t=90`で指定時間から再生
   - 自動シーク機能

5. **Phase 6**: 時間指定ジャンプ機能
   - 入力フィールドで時間指定
   - "MM:SS"形式対応

### ⚙️ Phase 3（設定・改善）:
6. **Phase 2**: ストレージ設定
   - キーボードショートカット有効/無効
7. **Phase 3**: ポップアップUI
   - 設定画面の追加

### 🎨 Phase 4（UI/UX改善）:
8. **Phase 0（後半）**: Tailwind CSS・shadcn/uiセットアップ
   - UIの見た目改善
9. **Phase 8**: エラーハンドリング強化
10. **Phase 9**: ドキュメント整備

---

## MVP実装の詳細（Phase 1, 4, 5のみ）

### MVP版 Phase 0: 最小限の環境
**実施項目**:
- ✅ WXTプロジェクト初期化（完了）
- ✅ Reactセットアップ（完了）
- **Tailwind CSS・shadcn/uiは後回し**

---

## テスト戦略

### ユニットテスト:
- ユーティリティ関数（時間パース、フレーム計算など）
- ストレージ操作

### 統合テスト:
- プレーヤー検出
- キーボードイベント処理
- UI要素の配置

### 手動テスト:
- 実際のバスケットボール動画ページでの動作確認
- ブラウザリロード時の動作
- 複数タブでの動作

---

## 次のステップ

Phase 0から順次実装を開始します。各フェーズ完了後にコミットし、ユーザーの確認を経て次のフェーズに進みます。
