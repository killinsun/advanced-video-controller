import type { VideoJsPlayer } from '@/types/videojs';

/**
 * フレーム単位での動画コントロールを提供するクラス
 */
export class FrameController {
  private readonly fps: number;
  private readonly frameTime: number;
  private player: VideoJsPlayer;

  /**
   * @param player Video.jsプレーヤーインスタンス
   * @param fps フレームレート（デフォルト: 30fps）
   */
  constructor(player: VideoJsPlayer, fps: number = 30) {
    this.player = player;
    this.fps = fps;
    this.frameTime = 1 / fps; // 30fps = 0.0333...秒
  }

  /**
   * 1フレーム進む
   */
  nextFrame(): void {
    this.player.pause(); // 一時停止して正確に制御
    const currentTime = this.player.currentTime();
    const duration = this.player.duration();
    const newTime = currentTime + this.frameTime;

    if (newTime < duration) {
      this.player.currentTime(newTime);
    }
  }

  /**
   * 1フレーム戻る
   */
  prevFrame(): void {
    this.player.pause();
    const currentTime = this.player.currentTime();
    const newTime = Math.max(0, currentTime - this.frameTime);

    this.player.currentTime(newTime);
  }

  /**
   * N秒スキップ
   * @param seconds スキップする秒数（負の値で戻る）
   */
  skip(seconds: number): void {
    const currentTime = this.player.currentTime();
    const duration = this.player.duration();
    const newTime = Math.max(0, Math.min(currentTime + seconds, duration));

    this.player.currentTime(newTime);
  }

  /**
   * 特定の時間にジャンプ
   * @param seconds ジャンプ先の時間（秒）
   */
  seekTo(seconds: number): void {
    const duration = this.player.duration();
    const newTime = Math.max(0, Math.min(seconds, duration));

    this.player.currentTime(newTime);
  }

  /**
   * 現在の再生位置を取得
   */
  getCurrentTime(): number {
    return this.player.currentTime();
  }

  /**
   * 動画の長さを取得
   */
  getDuration(): number {
    return this.player.duration();
  }

  /**
   * 再生
   */
  play(): void {
    this.player.play();
  }

  /**
   * 一時停止
   */
  pause(): void {
    this.player.pause();
  }

  /**
   * 再生/一時停止をトグル
   */
  togglePlayPause(): void {
    if (this.player.paused()) {
      this.player.play();
    } else {
      this.player.pause();
    }
  }

  /**
   * 一時停止中かどうか
   */
  isPaused(): boolean {
    return this.player.paused();
  }
}
