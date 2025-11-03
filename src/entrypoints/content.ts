import { detectVideoJsPlayer, waitForPlayerReady } from '@/utils/player-detector';
import { FrameController } from '@/utils/frame-controller';

export default defineContentScript({
  matches: ['https://basketball.mb.softbank.jp/lives/*'],
  runAt: 'document_idle', // ページ読み込み完了後に実行
  world: 'MAIN', // ページのJavaScriptコンテキストで実行（window.videojsにアクセス可能）

  async main() {
    console.log('[AVC] Advanced Video Controller initialized');

    try {
      // Video.jsプレーヤーを検出
      const player = await detectVideoJsPlayer();

      // プレーヤーが準備完了するまで待機
      await waitForPlayerReady(player);

      // FrameControllerを初期化
      const frameController = new FrameController(player, 30);

      // キーボードショートカットを設定
      setupKeyboardShortcuts(frameController);

      console.log('[AVC] ✓ Ready (← / →: 1s skip, Shift + ← / →: 0.5s skip)');

      // TODO: Phase 5でUIを追加

    } catch (error) {
      console.error('[AVC] ✗ Initialization failed:', error);
    }
  },
});

/**
 * キーボードショートカットを設定
 */
function setupKeyboardShortcuts(frameController: FrameController): void {
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    // input/textarea要素にフォーカスがある場合は無効
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        if (e.shiftKey) {
          // Shift + →: 0.5秒進む
          frameController.skip(0.5);
        } else {
          // →: 1秒進む
          frameController.skip(1);
        }
        break;

      case 'ArrowLeft':
        e.preventDefault();
        if (e.shiftKey) {
          // Shift + ←: 0.5秒戻る
          frameController.skip(-0.5);
        } else {
          // ←: 1秒戻る
          frameController.skip(-1);
        }
        break;
    }
  });
}
