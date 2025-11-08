import { parseTimeString } from "./time-parser";

/**
 * URLパラメーターから開始時間を取得する
 *
 * サポートする形式:
 * - ?t=90 (90秒)
 * - ?t=1:30 (1分30秒)
 * - ?t=1:15:30 (1時間15分30秒)
 * - ?t=1m30s (1分30秒)
 * - ?t=1h15m30s (1時間15分30秒)
 *
 * @param url URLオブジェクト（デフォルト: 現在のURL）
 * @returns 開始時間（秒）、パラメーターがない場合はnull
 *
 * @example
 * getStartTimeFromUrl() // 現在のURLから取得
 * getStartTimeFromUrl(new URL('https://example.com?t=90'))
 */
export function getStartTimeFromUrl(
	url: URL = new URL(window.location.href),
): number | null {
	const tParam = url.searchParams.get("t");
	if (!tParam) {
		return null;
	}

	// パターン1: 数字のみ、またはコロン形式 (parseTimeStringで処理)
	const parsed = parseTimeString(tParam);
	if (parsed !== null) {
		return parsed;
	}

	// パターン2: 1h15m30s 形式
	return parseHumanReadableTime(tParam);
}

/**
 * 人間が読みやすい時間形式をパースする
 * 例: "1h15m30s", "1m30s", "30s"
 *
 * @param timeString 時間文字列
 * @returns 秒数、無効な場合はnull
 */
function parseHumanReadableTime(timeString: string): number | null {
	const trimmed = timeString.toLowerCase().trim();

	// パターン: 1h15m30s
	const regex = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/;
	const match = trimmed.match(regex);

	if (!match) {
		return null;
	}

	const hours = parseInt(match[1] || "0", 10);
	const minutes = parseInt(match[2] || "0", 10);
	const seconds = parseInt(match[3] || "0", 10);

	// 少なくとも1つの値が必要
	if (hours === 0 && minutes === 0 && seconds === 0) {
		return null;
	}

	return hours * 3600 + minutes * 60 + seconds;
}

/**
 * 現在のURLに時間パラメーターを追加する
 *
 * @param seconds 開始時間（秒）
 * @returns 新しいURL文字列
 *
 * @example
 * setStartTimeInUrl(90) // 現在のURLに ?t=90 を追加
 */
export function setStartTimeInUrl(seconds: number): string {
	const url = new URL(window.location.href);
	url.searchParams.set("t", seconds.toString());
	return url.toString();
}
