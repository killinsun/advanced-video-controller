import { detectVideoJsPlayer, waitForPlayerReady } from '@/utils/player-detector';

export default defineContentScript({
  matches: ['https://basketball.mb.softbank.jp/lives/*'],
  runAt: 'document_idle', // ページ読み込み完了後に実行
  world: 'MAIN', // ページのJavaScriptコンテキストで実行（window.videojsにアクセス可能）

  async main() {
    console.log('[AVC] Advanced Video Controller initialized');
    console.log('[AVC] Target URL:', window.location.href);
    console.log('[AVC] Document ready state:', document.readyState);

    try {
      // Video.jsプレーヤーを検出
      const player = await detectVideoJsPlayer();

      // プレーヤーが準備完了するまで待機
      await waitForPlayerReady(player);

      console.log('[AVC] ✓ All systems ready');
      console.log('[AVC] Current time:', player.currentTime());
      console.log('[AVC] Duration:', player.duration());

      // TODO: Phase 4でFrameControllerとキーボードイベントを追加
      // TODO: Phase 5でUIを追加

    } catch (error) {
      console.error('[AVC] ✗ Initialization failed:', error);
    }
  },
});
