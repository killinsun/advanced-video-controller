# 実装計画書: ゲームレビューメモ機能

## プロジェクト概要
Advanced Video Controller Chrome拡張機能に、バスケットボール動画のレビュー用メモ機能を追加する。
動画の特定時点でメモを記録し、クォーター別に管理できるようにする。

### 主要機能
- **サイドバー表示**: 動画ページにメモエディタをサイドバーとして埋め込み
- **時間記録**: 再生中の時間をボタンクリックで記録（ストップウォッチのラップ機能）
- **メモ入力**: 記録した時間に対してコメントを追加
- **クォーター管理**: 1Q〜4Qごとにメモを整理
- **ホーム/アウェイ区別**: メモごとにHOME/AWAYを記録
- **タブ切り替え**: エディタビューとJSONビューの切り替え

### データ構造
```typescript
type CommentRecord = {
  videoSec: number;
  restGameClock?: string; // MM:SS
  comment: string;
  homeAway: 'HOME' | 'AWAY';
}

type GameReview = {
  gameId: string;
  homeTeamName: string;
  awayTeamName: string;
  periods: {
    [key: string]: CommentRecord[]; // "1", "2", "3", "4"
  };
}
```

---

## 技術スタック
- **フレームワーク**: WXT v0.20+
- **UI**: React 19 + Tailwind CSS
- **言語**: TypeScript 5.9+
- **パッケージマネージャー**: Bun

---

## フェーズ別実装計画

### **Phase 1: 基本UIコンポーネント設計**
**目的**: サイドバーの基本構造とレイアウトを実装

**実装詳細**:
```tsx
// components/ReviewEditor/ReviewSidebar.tsx

interface ReviewSidebarProps {
  onClose: () => void;
}

export function ReviewSidebar({ onClose }: ReviewSidebarProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'json'>('editor');

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-50">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-bold">ゲームレビュー</h2>
        <button onClick={onClose}>×</button>
      </div>

      {/* タブ */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-2 ${activeTab === 'editor' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          エディタ
        </button>
        <button
          className={`flex-1 py-2 ${activeTab === 'json' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('json')}
        >
          JSON
        </button>
      </div>

      {/* コンテンツエリア */}
      <div className="h-full overflow-y-auto p-4">
        {activeTab === 'editor' ? <EditorView /> : <JsonView />}
      </div>
    </div>
  );
}
```

**タスク**:
1. ReviewSidebarコンポーネントの作成
   - 固定位置（右側）配置
   - 閉じるボタン
   - ヘッダー表示
2. タブ切り替え機能
   - エディタタブ
   - JSONタブ
   - アクティブタブのハイライト
3. レスポンシブデザイン
   - 固定幅（384px = w-96）
   - スクロール対応

**成果物**: サイドバーの基本レイアウト

**テスト**:
- サイドバーが画面右側に表示されること
- タブの切り替えが動作すること
- 閉じるボタンでサイドバーが非表示になること

**コミットポイント**: "feat: add review sidebar basic layout"

---

### **Phase 2: Content Scriptへのサイドバー埋め込み**
**目的**: 動画ページにサイドバーを注入

**実装詳細**:
```typescript
// entrypoints/content/review-sidebar.tsx

export default defineContentScript({
  matches: ['https://basketball.mb.softbank.jp/lives/*'],

  async main(ctx) {
    // サイドバーの表示/非表示トグル
    let isVisible = false;

    // トグルボタンを追加
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'レビュー';
    toggleButton.className = 'avc-review-toggle';
    document.body.appendChild(toggleButton);

    // Shadow Root UIでサイドバーをマウント
    const ui = await createShadowRootUi(ctx, {
      name: 'review-sidebar-ui',
      position: 'inline',
      append: 'last',
      onMount: (container) => {
        const app = createApp(() => (
          <ReviewSidebar onClose={() => {
            isVisible = false;
            container.style.display = 'none';
          }} />
        ));
        app.mount(container);
        return app;
      },
      onRemove: (app) => {
        app?.unmount();
      },
    });

    toggleButton.addEventListener('click', () => {
      isVisible = !isVisible;
      if (isVisible) {
        ui.mount();
      } else {
        ui.remove();
      }
    });
  },
});
```

**タスク**:
1. Content Scriptの作成
   - 対象URL設定
   - サイドバー表示トグルボタン追加
2. Shadow Root UIの統合
   - Reactコンポーネントのマウント
   - Tailwind CSSの注入
3. 表示/非表示の制御

**成果物**: サイドバーの埋め込み機能

**テスト**:
- 動画ページでトグルボタンが表示されること
- ボタンクリックでサイドバーが開閉すること
- ページの既存レイアウトに影響しないこと

**コミットポイント**: "feat: inject review sidebar into video page"

---

### **Phase 3: 時間記録ボタンとクォーター選択**
**目的**: 現在の再生時間を記録する機能を実装

**実装詳細**:
```tsx
// components/ReviewEditor/EditorView.tsx

interface EditorViewProps {
  player: any; // Video.js player
}

export function EditorView({ player }: EditorViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'1' | '2' | '3' | '4'>('1');
  const [records, setRecords] = useState<CommentRecord[]>([]);

  const captureTime = () => {
    const currentTime = player.currentTime();
    const newRecord: CommentRecord = {
      videoSec: Math.floor(currentTime),
      comment: '',
      homeAway: 'HOME', // デフォルト
    };
    setRecords([...records, newRecord]);
  };

  return (
    <div className="space-y-4">
      {/* クォーター選択 */}
      <div className="flex gap-2">
        {['1', '2', '3', '4'].map((period) => (
          <button
            key={period}
            className={`px-4 py-2 rounded ${
              selectedPeriod === period ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setSelectedPeriod(period as any)}
          >
            {period}Q
          </button>
        ))}
      </div>

      {/* 時間記録ボタン */}
      <button
        className="w-full py-3 bg-green-500 text-white rounded font-bold"
        onClick={captureTime}
      >
        時間を記録
      </button>

      {/* レコードリスト */}
      <div className="space-y-2">
        {records.map((record, idx) => (
          <RecordItem key={idx} record={record} />
        ))}
      </div>
    </div>
  );
}
```

**タスク**:
1. クォーター選択UI
   - 1Q〜4Qのボタン
   - アクティブな状態表示
2. 時間記録ボタン
   - Video.jsプレーヤーから現在時刻取得
   - 新規レコード作成
3. 時間フォーマット関数
   - 秒数を "MM:SS" 形式に変換

**成果物**: 時間記録機能

**テスト**:
- クォーターボタンの切り替えが動作すること
- 時間記録ボタンで現在時刻が取得されること
- 秒数が正しくフォーマットされること

**コミットポイント**: "feat: add time capture and period selection"

---

### **Phase 4: レコード編集UI（コメント・ホーム/アウェイ）**
**目的**: 記録した時間にメモとチーム情報を追加

**実装詳細**:
```tsx
// components/ReviewEditor/RecordItem.tsx

interface RecordItemProps {
  record: CommentRecord;
  onUpdate: (updated: CommentRecord) => void;
  onDelete: () => void;
}

export function RecordItem({ record, onUpdate, onDelete }: RecordItemProps) {
  const [comment, setComment] = useState(record.comment);
  const [homeAway, setHomeAway] = useState<'HOME' | 'AWAY'>(record.homeAway);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    onUpdate({ ...record, comment: e.target.value });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border rounded p-3 space-y-2">
      {/* 時間表示 */}
      <div className="text-sm text-gray-600 font-mono">
        {formatTime(record.videoSec)}
      </div>

      {/* コメント入力 */}
      <textarea
        className="w-full border rounded p-2 text-sm"
        rows={3}
        placeholder="コメントを入力..."
        value={comment}
        onChange={handleCommentChange}
      />

      {/* HOME/AWAYボタン */}
      <div className="flex gap-2">
        <button
          className={`flex-1 py-2 rounded ${
            homeAway === 'HOME' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => {
            setHomeAway('HOME');
            onUpdate({ ...record, homeAway: 'HOME' });
          }}
        >
          HOME
        </button>
        <button
          className={`flex-1 py-2 rounded ${
            homeAway === 'AWAY' ? 'bg-red-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => {
            setHomeAway('AWAY');
            onUpdate({ ...record, homeAway: 'AWAY' });
          }}
        >
          AWAY
        </button>
      </div>

      {/* 削除ボタン */}
      <button
        className="w-full py-1 text-sm text-red-500 hover:bg-red-50 rounded"
        onClick={onDelete}
      >
        削除
      </button>
    </div>
  );
}
```

**タスク**:
1. RecordItemコンポーネント作成
   - 時間表示（MM:SS形式）
   - コメント入力欄（textarea）
   - HOME/AWAYボタン
   - 削除ボタン
2. 状態管理
   - コメント変更のハンドリング
   - homeAway切り替え
3. UI/UXの調整
   - 視認性の高い配色
   - レスポンシブデザイン

**成果物**: レコード編集UI

**テスト**:
- コメント入力が反映されること
- HOME/AWAYボタンの切り替えが動作すること
- 削除ボタンでレコードが削除されること
- 時間が "MM:SS" 形式で表示されること

**コミットポイント**: "feat: add record editing UI with comment and team selection"

---

### **Phase 5: クォーター別のレコード管理**
**目的**: レコードをクォーターごとに整理

**実装詳細**:
```tsx
// hooks/useGameReview.ts

export function useGameReview() {
  const [gameReview, setGameReview] = useState<GameReview>({
    gameId: '',
    homeTeamName: '',
    awayTeamName: '',
    periods: {
      '1': [],
      '2': [],
      '3': [],
      '4': [],
    },
  });

  const addRecord = (period: string, record: CommentRecord) => {
    setGameReview((prev) => ({
      ...prev,
      periods: {
        ...prev.periods,
        [period]: [...prev.periods[period], record],
      },
    }));
  };

  const updateRecord = (period: string, index: number, updated: CommentRecord) => {
    setGameReview((prev) => ({
      ...prev,
      periods: {
        ...prev.periods,
        [period]: prev.periods[period].map((r, i) => (i === index ? updated : r)),
      },
    }));
  };

  const deleteRecord = (period: string, index: number) => {
    setGameReview((prev) => ({
      ...prev,
      periods: {
        ...prev.periods,
        [period]: prev.periods[period].filter((_, i) => i !== index),
      },
    }));
  };

  return { gameReview, addRecord, updateRecord, deleteRecord };
}
```

**タスク**:
1. useGameReviewカスタムフック作成
   - GameReview型の状態管理
   - レコードのCRUD操作
2. EditorViewへの統合
   - 選択中のクォーターに応じてレコード表示
   - 時間記録時に適切なクォーターに追加
3. レコードのソート
   - videoSecで昇順にソート

**成果物**: クォーター別レコード管理

**テスト**:
- クォーターごとにレコードが分離されること
- レコードが時間順にソートされること
- 異なるクォーター間でレコードが混在しないこと

**コミットポイント**: "feat: add period-based record management"

---

### **Phase 6: JSONビュー実装**
**目的**: 記録データをJSON形式で表示・コピー

**実装詳細**:
```tsx
// components/ReviewEditor/JsonView.tsx

interface JsonViewProps {
  gameReview: GameReview;
}

export function JsonView({ gameReview }: JsonViewProps) {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(gameReview, null, 2);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* コピーボタン */}
      <button
        className="w-full py-2 bg-blue-500 text-white rounded"
        onClick={copyToClipboard}
      >
        {copied ? 'コピーしました!' : 'JSONをコピー'}
      </button>

      {/* JSON表示 */}
      <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
        <code>{jsonString}</code>
      </pre>
    </div>
  );
}
```

**タスク**:
1. JsonViewコンポーネント作成
   - JSON整形表示（インデント付き）
   - クリップボードコピー機能
   - コピー完了のフィードバック
2. タブ切り替えとの統合
3. シンタックスハイライト（オプション）

**成果物**: JSONビュー

**テスト**:
- JSONが整形されて表示されること
- コピーボタンでクリップボードにコピーされること
- 長いJSONでも横スクロールで閲覧可能なこと

**コミットポイント**: "feat: add JSON view with copy functionality"

---

### **Phase 7: ゲーム情報入力（gameId, チーム名）**
**目的**: レビューに関連するゲーム情報を入力

**実装詳細**:
```tsx
// components/ReviewEditor/GameInfoForm.tsx

interface GameInfoFormProps {
  gameReview: GameReview;
  onUpdate: (gameReview: GameReview) => void;
}

export function GameInfoForm({ gameReview, onUpdate }: GameInfoFormProps) {
  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded">
      <div>
        <label className="block text-sm font-medium mb-1">ゲームID</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 text-sm"
          value={gameReview.gameId}
          onChange={(e) =>
            onUpdate({ ...gameReview, gameId: e.target.value })
          }
          placeholder="例: 2024-01-15-game1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">ホームチーム</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 text-sm"
          value={gameReview.homeTeamName}
          onChange={(e) =>
            onUpdate({ ...gameReview, homeTeamName: e.target.value })
          }
          placeholder="例: サンロッカーズ渋谷"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">アウェイチーム</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 text-sm"
          value={gameReview.awayTeamName}
          onChange={(e) =>
            onUpdate({ ...gameReview, awayTeamName: e.target.value })
          }
          placeholder="例: 千葉ジェッツ"
        />
      </div>
    </div>
  );
}
```

**タスク**:
1. GameInfoFormコンポーネント作成
   - gameId入力
   - homeTeamName入力
   - awayTeamName入力
2. EditorViewに統合
   - サイドバー上部に配置
3. バリデーション（オプション）

**成果物**: ゲーム情報入力フォーム

**テスト**:
- 各フィールドへの入力が反映されること
- GameReview全体の構造が維持されること

**コミットポイント**: "feat: add game information input form"

---

### **Phase 8: 残り時間（restGameClock）入力**
**目的**: 各レコードに試合の残り時間を追加

**実装詳細**:
```tsx
// RecordItemに追加

<div>
  <label className="block text-xs text-gray-600 mb-1">残り時間（任意）</label>
  <input
    type="text"
    className="w-full border rounded px-2 py-1 text-sm"
    placeholder="例: 08:45"
    value={record.restGameClock || ''}
    onChange={(e) =>
      onUpdate({ ...record, restGameClock: e.target.value })
    }
  />
</div>
```

**タスク**:
1. RecordItemに入力フィールド追加
   - MM:SS形式のプレースホルダー
   - オプショナル項目
2. バリデーション関数作成
   - MM:SS形式のチェック
3. エラー表示（オプション）

**成果物**: 残り時間入力機能

**テスト**:
- "MM:SS"形式で入力できること
- 空欄でも動作すること
- 不正な形式で警告が出ること（オプション）

**コミットポイント**: "feat: add game clock input field"

---

### **Phase 9: レコードから動画時間へのジャンプ**
**目的**: レコードをクリックすると該当時間に動画がジャンプ

**実装詳細**:
```tsx
// RecordItemに追加

<button
  className="text-blue-500 hover:underline text-sm"
  onClick={() => player.currentTime(record.videoSec)}
>
  {formatTime(record.videoSec)} にジャンプ
</button>
```

**タスク**:
1. RecordItemにジャンプボタン追加
2. Video.jsプレーヤーのcurrentTime()を使用
3. クリック時の視覚フィードバック

**成果物**: レコードジャンプ機能

**テスト**:
- クリックで動画が該当時間にシークすること
- 動画が一時停止すること（オプション）

**コミットポイント**: "feat: add jump to time from record"

---

### **Phase 10: ストレージ機能（保存・読み込み）**
**目的**: レビューデータの永続化

**実装詳細**:
```typescript
// utils/storage.ts

import { storage } from 'wxt/storage';

export const gameReviewStorage = {
  async save(videoUrl: string, review: GameReview): Promise<void> {
    const key = `review:${videoUrl}`;
    await storage.setItem(`local:${key}`, review);
  },

  async load(videoUrl: string): Promise<GameReview | null> {
    const key = `review:${videoUrl}`;
    const data = await storage.getItem<GameReview>(`local:${key}`);
    return data || null;
  },

  async list(): Promise<string[]> {
    const items = await storage.getItems('local:review:*');
    return Object.keys(items);
  },

  async delete(videoUrl: string): Promise<void> {
    const key = `review:${videoUrl}`;
    await storage.removeItem(`local:${key}`);
  },
};
```

**タスク**:
1. ストレージユーティリティ作成
   - 保存: videoURLをキーにGameReviewを保存
   - 読み込み: ページロード時に自動読み込み
   - 削除: レビューデータの削除
2. 自動保存機能
   - useEffectでデバウンス保存
3. エクスポート/インポート機能（オプション）

**成果物**: データ永続化機能

**テスト**:
- データが保存されること
- ページリロード後にデータが復元されること
- 複数の動画で個別に保存されること

**コミットポイント**: "feat: add storage for game reviews"

---

### **Phase 11: UI/UX改善とエラーハンドリング**
**目的**: ユーザビリティの向上

**タスク**:
1. ローディング状態の表示
2. 空状態のメッセージ表示
3. エラーハンドリング
   - プレーヤー未検出
   - ストレージエラー
4. レスポンシブデザイン調整
5. キーボードショートカット（オプション）
   - Ctrl+Shift+R: サイドバートグル
   - Ctrl+Space: 時間記録

**成果物**: UI/UX改善

**テスト**:
- エラー時に適切なメッセージが表示されること
- レコードがない場合に案内が表示されること

**コミットポイント**: "feat: improve UI/UX and error handling"

---

## 優先順位付き実装順序

### 🎯 MVP（最小限の動作版）:
1. **Phase 1**: 基本UIコンポーネント設計
2. **Phase 2**: Content Scriptへのサイドバー埋め込み
3. **Phase 3**: 時間記録ボタンとクォーター選択
4. **Phase 4**: レコード編集UI
5. **Phase 5**: クォーター別のレコード管理

### 📦 Phase 2（機能拡張）:
6. **Phase 6**: JSONビュー実装
7. **Phase 7**: ゲーム情報入力
8. **Phase 8**: 残り時間入力
9. **Phase 9**: レコードから動画時間へのジャンプ

### ⚙️ Phase 3（永続化・改善）:
10. **Phase 10**: ストレージ機能
11. **Phase 11**: UI/UX改善とエラーハンドリング

---

## テスト戦略

### ユニットテスト:
- 時間フォーマット関数
- レコード操作（CRUD）
- ストレージ操作

### 統合テスト:
- サイドバーの表示/非表示
- レコードの追加・編集・削除
- クォーター間の切り替え
- JSONエクスポート

### 手動テスト:
- 実際のバスケットボール動画ページでの動作確認
- 複数のクォーターにまたがるレビュー作成
- データの永続化確認

---

## 次のステップ

Phase 1から順次実装を開始します。各フェーズ完了後にコミットし、確認を経て次のフェーズに進みます。
