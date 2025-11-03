/**
 * Video.js型定義
 * グローバルなvideojsオブジェクトの型を定義
 */

declare global {
  interface Window {
    videojs: VideoJsStatic | undefined;
  }
}

interface VideoJsStatic {
  /**
   * 全てのVideo.jsプレーヤーインスタンスを取得
   * @returns プレーヤーID -> プレーヤーインスタンスのマップ
   */
  getPlayers(): Record<string, VideoJsPlayer>;
}

export interface VideoJsPlayer {
  /**
   * 現在の再生位置を取得・設定
   */
  currentTime(): number;
  currentTime(seconds: number): VideoJsPlayer;

  /**
   * 動画の長さ（秒）を取得
   */
  duration(): number;

  /**
   * 再生
   */
  play(): Promise<void>;

  /**
   * 一時停止
   */
  pause(): VideoJsPlayer;

  /**
   * 一時停止状態かどうか
   */
  paused(): boolean;

  /**
   * 音量を取得・設定（0-1）
   */
  volume(): number;
  volume(level: number): VideoJsPlayer;

  /**
   * ミュート状態を取得・設定
   */
  muted(): boolean;
  muted(muted: boolean): VideoJsPlayer;

  /**
   * 再生速度を取得・設定
   */
  playbackRate(): number;
  playbackRate(rate: number): VideoJsPlayer;

  /**
   * イベントリスナーを登録
   */
  on(event: string, callback: () => void): void;

  /**
   * イベントリスナーを解除
   */
  off(event: string, callback: () => void): void;
}

export {};
