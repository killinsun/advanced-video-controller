import { GameReview } from '@/types/game-review';

/**
 * URL から ID を抽出する
 * 例: https://basketball.mb.softbank.jp/lives/505589 → "505589"
 */
export function extractVideoIdFromUrl(url: string): string | null {
  const match = url.match(/\/lives\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * ゲームレビューのストレージ操作
 * Content Script環境で動作するよう、localStorageを使用
 */
export const gameReviewStorage = {
  /**
   * レビューデータを保存
   * @param videoId 動画ID（URLから抽出）
   * @param review GameReviewデータ
   */
  async save(videoId: string, review: GameReview): Promise<void> {
    const key = `avc_review:${videoId}`;
    try {
      localStorage.setItem(key, JSON.stringify(review));
      console.log(`[AVC Storage] Saved review for video ID: ${videoId}`, review);
    } catch (error) {
      console.error(`[AVC Storage] Failed to save review:`, error);
    }
  },

  /**
   * レビューデータを読み込み
   * @param videoId 動画ID
   * @returns GameReview | null
   */
  async load(videoId: string): Promise<GameReview | null> {
    const key = `avc_review:${videoId}`;
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data) as GameReview;
        console.log(`[AVC Storage] Loaded review for video ID: ${videoId}`, parsed);
        return parsed;
      }
    } catch (error) {
      console.error(`[AVC Storage] Failed to load review:`, error);
    }

    console.log(`[AVC Storage] No saved review found for video ID: ${videoId}`);
    return null;
  },

  /**
   * 保存済みレビュー一覧のキーを取得
   * @returns キーの配列
   */
  async list(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('avc_review:')) {
        keys.push(key);
      }
    }
    return keys;
  },

  /**
   * レビューデータを削除
   * @param videoId 動画ID
   */
  async delete(videoId: string): Promise<void> {
    const key = `avc_review:${videoId}`;
    localStorage.removeItem(key);
    console.log(`[AVC Storage] Deleted review for video ID: ${videoId}`);
  },
};
