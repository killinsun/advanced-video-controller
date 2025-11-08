import { useEffect, useState } from "react";
import type { CommentRecord, GameReview, Period } from "@/types/game-review";

/**
 * URL から ID を抽出する
 * 例: https://basketball.mb.softbank.jp/lives/505589 → "505589"
 */
function extractVideoIdFromUrl(url: string): string | null {
	const match = url.match(/\/lives\/(\d+)/);
	return match ? match[1] : null;
}

interface UseReviewStorageReturn {
	records: Record<Period, CommentRecord[]>;
	setRecords: React.Dispatch<
		React.SetStateAction<Record<Period, CommentRecord[]>>
	>;
	gameInfo: {
		gameId: string;
		homeTeamName: string;
		awayTeamName: string;
	};
	setGameInfo: React.Dispatch<
		React.SetStateAction<{
			gameId: string;
			homeTeamName: string;
			awayTeamName: string;
		}>
	>;
	isLoaded: boolean;
}

/**
 * ゲームレビューデータの保存・読み込みを行うカスタムフック
 * localStorageを使用（Content Scriptで確実に動作）
 */
export function useReviewStorage(): UseReviewStorageReturn {
	const [records, setRecords] = useState<Record<Period, CommentRecord[]>>({
		"1": [],
		"2": [],
		"3": [],
		"4": [],
	});
	const [gameInfo, setGameInfo] = useState({
		gameId: "",
		homeTeamName: "",
		awayTeamName: "",
	});
	const [isLoaded, setIsLoaded] = useState(false);

	const videoId = extractVideoIdFromUrl(window.location.href);

	// 初期ロード
	useEffect(() => {
		if (!videoId) {
			console.warn("[AVC Storage] Could not extract video ID from URL");
			setIsLoaded(true);
			return;
		}

		const key = `avc_review:${videoId}`;
		try {
			const data = localStorage.getItem(key);
			if (data) {
				const savedReview = JSON.parse(data) as GameReview;
				setRecords(savedReview.periods);
				setGameInfo({
					gameId: savedReview.gameId,
					homeTeamName: savedReview.homeTeamName,
					awayTeamName: savedReview.awayTeamName,
				});
				console.log(
					`[AVC Storage] Loaded review for video ID: ${videoId}`,
					savedReview,
				);
			}
		} catch (error) {
			console.error("[AVC Storage] Failed to load review:", error);
		}
		setIsLoaded(true);
	}, [videoId]);

	// 自動保存
	useEffect(() => {
		// 初回ロード完了前は保存しない
		if (!isLoaded || !videoId) return;

		const gameReview: GameReview = {
			gameId: gameInfo.gameId,
			homeTeamName: gameInfo.homeTeamName,
			awayTeamName: gameInfo.awayTeamName,
			periods: records,
		};

		const key = `avc_review:${videoId}`;
		try {
			localStorage.setItem(key, JSON.stringify(gameReview));
			console.log(
				`[AVC Storage] Saved review for video ID: ${videoId}`,
				gameReview,
			);
		} catch (error) {
			console.error("[AVC Storage] Failed to save review:", error);
		}
	}, [records, gameInfo, isLoaded, videoId]);

	return { records, setRecords, gameInfo, setGameInfo, isLoaded };
}
