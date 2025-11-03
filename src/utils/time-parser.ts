/**
 * 時間文字列を秒数に変換する
 *
 * サポートする形式:
 * - "MM:SS" (例: "1:30" -> 90秒)
 * - "HH:MM:SS" (例: "1:15:30" -> 4530秒)
 * - "SS" (例: "90" -> 90秒)
 *
 * @param timeString 時間文字列
 * @returns 秒数、無効な場合はnull
 *
 * @example
 * parseTimeString("1:30")     // => 90
 * parseTimeString("1:15:30")  // => 4530
 * parseTimeString("90")       // => 90
 * parseTimeString("invalid")  // => null
 */
export function parseTimeString(timeString: string): number | null {
  // 空文字列チェック
  if (!timeString || timeString.trim() === '') {
    return null;
  }

  const trimmed = timeString.trim();

  // パターン1: 数字のみ（秒数）
  if (/^\d+$/.test(trimmed)) {
    const seconds = parseInt(trimmed, 10);
    return isNaN(seconds) ? null : seconds;
  }

  // パターン2: MM:SS または HH:MM:SS
  const parts = trimmed.split(':');

  if (parts.length === 2) {
    // MM:SS
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);

    if (isNaN(minutes) || isNaN(seconds) || seconds < 0 || seconds >= 60) {
      return null;
    }

    return minutes * 60 + seconds;
  } else if (parts.length === 3) {
    // HH:MM:SS
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);

    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      isNaN(seconds) ||
      minutes < 0 ||
      minutes >= 60 ||
      seconds < 0 ||
      seconds >= 60
    ) {
      return null;
    }

    return hours * 3600 + minutes * 60 + seconds;
  }

  return null;
}

/**
 * 秒数を時間文字列に変換する
 *
 * @param seconds 秒数
 * @returns "HH:MM:SS" または "MM:SS" 形式の文字列
 *
 * @example
 * formatTime(90)    // => "1:30"
 * formatTime(4530)  // => "1:15:30"
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(secs)}`;
  } else {
    return `${minutes}:${pad(secs)}`;
  }
}
