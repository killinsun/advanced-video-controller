import type { VideoJsPlayer } from '@/types/videojs';

/**
 * Video.jsプレーヤー検出の設定
 */
const DETECTION_CONFIG = {
  maxRetries: 20, // 最大リトライ回数
  retryDelay: 500, // リトライ間隔（ミリ秒）
  timeout: 10000, // タイムアウト時間（10秒）
} as const;

/**
 * Video.jsプレーヤーを検出する
 * プレーヤーが見つかるまで最大10秒間リトライする
 *
 * @returns 検出されたVideo.jsプレーヤーインスタンス
 * @throws プレーヤーが見つからない場合
 *
 * @example
 * ```typescript
 * try {
 *   const player = await detectVideoJsPlayer();
 *   console.log('Current time:', player.currentTime());
 * } catch (error) {
 *   console.error('Failed to detect player:', error);
 * }
 * ```
 */
export async function detectVideoJsPlayer(): Promise<VideoJsPlayer> {
  const { maxRetries, retryDelay } = DETECTION_CONFIG;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // 方法1: グローバルのvideojsが利用可能か確認
    if (typeof window.videojs !== 'undefined') {
      const players = window.videojs.getPlayers();
      const playerIds = Object.keys(players);

      if (playerIds.length > 0) {
        const playerId = playerIds[0];
        const player = players[playerId];
        return player;
      }
    }

    // 方法2: video要素の_videoJsプロパティ
    const videoElements = document.querySelectorAll('video');
    for (const videoEl of videoElements) {
      const element = videoEl as any;
      if (element._videoJs) {
        return element._videoJs;
      }

      // 親要素も確認
      const parent = videoEl.parentElement as any;
      if (parent?._videoJs) {
        return parent._videoJs;
      }
    }

    // 方法3: プレーヤー要素の_videoJsプロパティ
    const playerElements = document.querySelectorAll(
      '[id*="video"], [id*="player"], .video-js, [class*="Player"]'
    );
    for (const el of playerElements) {
      const element = el as any;
      if (element._videoJs) {
        return element._videoJs;
      }
    }

    // リトライ待機
    if (attempt < maxRetries) {
      await sleep(retryDelay);
    }
  }

  // プレーヤーが見つからなかった
  const errorMessage = `Video.js player not found after ${DETECTION_CONFIG.timeout / 1000} seconds`;
  console.error(`[AVC] ✗ ${errorMessage}`);
  throw new Error(errorMessage);
}

/**
 * 指定時間待機する
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * プレーヤーが準備完了するまで待機
 * メタデータ（duration）が読み込まれるまで待つ
 *
 * @param player Video.jsプレーヤーインスタンス
 * @returns プレーヤーが準備完了したらresolve
 */
export async function waitForPlayerReady(player: VideoJsPlayer): Promise<void> {
  const maxWait = 5000; // 最大5秒待機
  const checkInterval = 100; // 100msごとにチェック

  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    const duration = player.duration();

    // durationが有効な値（NaNでない、0より大きい）なら準備完了
    if (!isNaN(duration) && duration > 0) {
      return;
    }

    await sleep(checkInterval);
  }
}
