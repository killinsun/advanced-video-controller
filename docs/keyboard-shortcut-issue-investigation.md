# キーボードショートカット問題の調査報告書

## 問題の概要

サイドバーでメモを入力している際に、キーボード操作が意図しない動作を引き起こす問題が2つ存在します。

### 問題1: 矢印キーのショートカット
拡張機能で実装している矢印キーのショートカットが、メモ入力中でも有効になってしまう。

**影響を受ける操作:**
- `←` (左矢印): 1秒戻る
- `→` (右矢印): 1秒進む
- `Shift + ←`: 0.5秒戻る
- `Shift + →`: 0.5秒進む

### 問題2: スペースキーによる動画プレイヤー操作
拡張機能ではショートカットとして割り当てていないが、YouTubeなどの動画プレイヤーがスペースキーで再生/一時停止を行うため、メモ入力中にスペースキーを押すと動画が再生/停止してしまう。

### 期待される動作
メモ入力フィールドにフォーカスがある場合、これらのキーボード操作は入力フィールド内でのみ機能し、動画プレイヤーには影響を与えないべき。

---

## 現在の実装

### キーボードショートカットの実装場所

**ファイル:** `src/entrypoints/content/index.tsx`
**関数:** `setupKeyboardShortcuts()` (103-139行目)

```typescript
function setupKeyboardShortcuts(frameController: FrameController): void {
	document.addEventListener("keydown", (e: KeyboardEvent) => {
		// input/textarea要素にフォーカスがある場合は無効
		const target = e.target as HTMLElement;
		if (
			target.tagName === "INPUT" ||
			target.tagName === "TEXTAREA" ||
			target.isContentEditable
		) {
			return;
		}

		switch (e.key) {
			case "ArrowRight":
				e.preventDefault();
				if (e.shiftKey) {
					frameController.skip(0.5);
				} else {
					frameController.skip(1);
				}
				break;

			case "ArrowLeft":
				e.preventDefault();
				if (e.shiftKey) {
					frameController.skip(-0.5);
				} else {
					frameController.skip(-1);
				}
				break;
		}
	});
}
```

### サイドバーの入力フィールド

#### RecordForm コンポーネント
**ファイル:** `src/components/ReviewEditor/RecordForm.tsx`

```typescript
// コメント入力 (60-66行目)
<Textarea
	autoFocus
	className="min-h-[60px] resize-y bg-white border-solid border-gray-200"
	placeholder="コメントを入力..."
	value={comment}
	onChange={(e) => setComment(e.target.value)}
/>

// 残り時間入力 (72-79行目)
<Input
	type="text"
	id="restGameClock"
	className="font-mono text-sm bg-white border-solid border-gray-200"
	placeholder="例: 08:45"
	value={restGameClock}
	onChange={handleClockChange}
/>
```

#### JsonView コンポーネント
**ファイル:** `src/components/ReviewEditor/JsonView.tsx`

```typescript
// JSON編集用 (97-102行目)
<Textarea
	className="flex-1 text-xs font-mono bg-gray-50"
	value={jsonText}
	onChange={(e) => setJsonText(e.target.value)}
	spellCheck={false}
/>
```

---

## 問題の根本原因

### Shadow DOM による影響

両方のコンテンツスクリプトでShadow DOMが使用されています：

#### content/index.tsx (78-89行目)
```typescript
const shadowRoot = shadowHost.attachShadow({ mode: "open" });
// Tailwind CSSとReactコンポーネントをShadow DOM内にマウント
```

#### review-sidebar.content/index.tsx (122-135行目)
```typescript
const shadowRoot = shadowHost.attachShadow({ mode: "open" });
// サイドバーUIをShadow DOM内にマウント
```

### 技術的な問題点

1. **e.target の限界**
   - 現在のコードは `e.target` を使用して入力フィールドを検出
   - Shadow DOM の境界を越えてイベントが伝播する際、`e.target` が Shadow Host を指してしまう可能性がある
   - 結果として、Shadow DOM 内の実際の `<textarea>` や `<input>` 要素を正しく認識できない

2. **イベント伝播の仕組み**
   ```
   Shadow DOM内のテキストエリア
       ↓ (イベントバブリング)
   Shadow Root
       ↓
   Shadow Host
       ↓
   Document (← ここでキーボードショートカットのリスナーが待機)
   ```

3. **e.composedPath() の必要性**
   - `e.composedPath()` は Shadow DOM の境界を越えた完全なイベントパスを返す
   - `e.composedPath()[0]` は常に実際のイベント発生元（最も内側の要素）を返す

4. **スペースキーのイベント伝播**
   - 入力フィールド内でスペースキーを押すと、イベントが親要素に伝播（バブリング）する
   - 動画プレイヤーがドキュメントレベルでスペースキーのイベントを監視している
   - Shadow DOM を越えてイベントが伝播し、プレイヤーが再生/停止を実行してしまう
   - 解決策: 入力フィールドにフォーカスがある場合、`e.stopPropagation()` でイベントの伝播を止める

---

## 解決策

### 修正方針

1. **Shadow DOM 対応**: `e.target` の代わりに `e.composedPath()[0]` を使用することで、Shadow DOM 内の要素も確実に検出できるようにします。

2. **スペースキー対策**: 入力フィールドにフォーカスがある場合、スペースキーのイベント伝播を `e.stopPropagation()` で停止し、動画プレイヤーへの影響を防ぎます。

### 修正後のコード

**ファイル:** `src/entrypoints/content/index.tsx` (105-113行目)

```typescript
function setupKeyboardShortcuts(frameController: FrameController): void {
	document.addEventListener("keydown", (e: KeyboardEvent) => {
		// composedPath()を使用してShadow DOM内の要素も確実にチェック
		const path = e.composedPath();
		const target = path[0] as HTMLElement;

		if (
			target.tagName === "INPUT" ||
			target.tagName === "TEXTAREA" ||
			target.isContentEditable
		) {
			// スペースキーの場合は動画プレイヤーに伝播しないようにする
			if (e.key === " " || e.code === "Space") {
				e.stopPropagation();
			}
			return;
		}

		// 以下、ショートカット処理は変更なし
		switch (e.key) {
			case "ArrowRight":
				e.preventDefault();
				if (e.shiftKey) {
					frameController.skip(0.5);
				} else {
					frameController.skip(1);
				}
				break;

			case "ArrowLeft":
				e.preventDefault();
				if (e.shiftKey) {
					frameController.skip(-0.5);
				} else {
					frameController.skip(-1);
				}
				break;
		}
	});
}
```

### 変更点の詳細

**変更1: Shadow DOM 対応**
```typescript
// 修正前
const target = e.target as HTMLElement;

// 修正後
const path = e.composedPath();
const target = path[0] as HTMLElement;
```

**変更2: スペースキーの伝播防止**
```typescript
// 入力フィールドにフォーカスがある場合の処理内に追加
if (e.key === " " || e.code === "Space") {
	e.stopPropagation();
}
```

この処理により：
- `e.stopPropagation()`: イベントの伝播を停止し、親要素や動画プレイヤーにイベントが届かないようにする
- `e.key === " "`: キー名での判定（推奨）
- `e.code === "Space"`: キーコードでの判定（フォールバック）

---

## テスト方法

### 1. 矢印キーのテスト
1. 拡張機能をビルド・リロード
2. YouTube等の動画ページを開く
3. サイドバーを開く
4. コメント入力フィールドにフォーカスを当てる
5. 矢印キー（←/→）を押す
6. **期待結果:** 動画の再生位置が変わらず、カーソルが移動する

### 2. スペースキーのテスト
1. 上記と同じ状態で、コメント入力フィールドにフォーカスを当てる
2. スペースキーを押す
3. **期待結果:** スペースが入力され、動画の再生/停止が起きない
4. 文章を入力し、途中でスペースキーを何度か押す
5. **期待結果:** 全て正常にスペースが入力され、動画が再生/停止されない

### 3. 各入力フィールドでのテスト
以下のフィールドで同様のテスト（矢印キー・スペースキー両方）を実施：
- コメント入力 (Textarea)
- 残り時間入力 (Input)
- JSON編集エリア (Textarea)
- ControlPanelの時間入力 (Input)

### 4. 正常動作の確認
入力フィールド以外の場所（動画プレイヤー周辺など）で以下を確認：
- 矢印キー（←/→）: ショートカットが正常に動作する
- スペースキー: 動画プレイヤーの再生/停止が正常に動作する

---

## 補足情報

### composedPath() の互換性
- Chrome: サポート (v53+)
- Firefox: サポート (v52+)
- Safari: サポート (v10+)
- Edge: サポート (v79+)

現代のブラウザでは広くサポートされており、互換性の問題はありません。

### 参考資料
- [MDN: Event.composedPath()](https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath)
- [MDN: Using shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
- [Web Components and Event Propagation](https://javascript.info/shadow-dom-events)

---

## 結論

この修正により、以下の問題が解決されます：

1. **矢印キーのショートカット問題**: `e.composedPath()` を使用することで、Shadow DOM 内の入力フィールドを確実に検出し、ショートカットを適切に無効化
2. **スペースキーの伝播問題**: `e.stopPropagation()` を使用することで、入力フィールド内でのスペースキー入力が動画プレイヤーに影響を与えないよう防止

これらの修正により、サイドバーでのメモ入力がスムーズになり、ユーザー体験が大幅に改善されます。

### ベストプラクティス
- Shadow DOM を使用するモダンなWeb拡張機能では、`e.composedPath()` を使用することが推奨される
- イベントの伝播を制御する際は、適切に `e.stopPropagation()` や `e.preventDefault()` を使い分ける
- 入力フィールドのフォーカス状態を確認する際は、`INPUT`、`TEXTAREA`、`contentEditable` の3つをチェックする
