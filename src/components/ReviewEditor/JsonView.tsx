import { useState, useEffect } from "react";
import type { GameReview } from "@/types/game-review";

interface JsonViewProps {
	gameReview: GameReview;
	onImport: (imported: GameReview) => void;
}

export function JsonView({ gameReview, onImport }: JsonViewProps) {
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState("");
	const [jsonText, setJsonText] = useState("");

	const jsonString = JSON.stringify(gameReview, null, 2);

	// gameReviewが更新されたらテキストボックスを更新
	useEffect(() => {
		setJsonText(jsonString);
	}, [jsonString]);

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(jsonText);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("[AVC Review] Failed to copy:", error);
		}
	};

	const handleImport = () => {
		setError("");
		try {
			console.log("[AVC Review] Importing JSON:", jsonText);
			const parsed = JSON.parse(jsonText);
			console.log("[AVC Review] Parsed data:", parsed);

			// 基本的なバリデーション
			if (!parsed.periods || typeof parsed.periods !== "object") {
				throw new Error("無効なフォーマット: periods が必要です");
			}

			// periodsの各要素が配列であることを確認
			for (const period of ["1", "2", "3", "4"]) {
				if (parsed.periods[period] && !Array.isArray(parsed.periods[period])) {
					throw new Error(
						`無効なフォーマット: periods.${period} は配列である必要があります`,
					);
				}
			}

			console.log("[AVC Review] Calling onImport with:", parsed);
			onImport(parsed as GameReview);
			console.log("[AVC Review] Data imported successfully");
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "JSONのパースに失敗しました";
			setError(errorMessage);
			console.error("[AVC Review] Import failed:", err);
		}
	};

	return (
		<div className="flex flex-col gap-2 h-full">
			{/* ボタングループ */}
			<div className="flex gap-2 justify-end">
				<button
					type="button"
					className={`
						px-3 py-1.5 bg-transparent text-xs font-medium border rounded cursor-pointer transition-all duration-200
						${copied ? "border-emerald-500 text-emerald-500" : "border-gray-300 text-gray-500 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-700"}
					`}
					onClick={copyToClipboard}
				>
					{copied ? "✓ コピー済み" : "コピー"}
				</button>
				<button
					type="button"
					className="px-3 py-1.5 bg-transparent border border-gray-300 text-gray-500 rounded cursor-pointer text-xs font-medium transition-all duration-200 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-700"
					onClick={handleImport}
				>
					復元
				</button>
			</div>

			{/* エラー表示 */}
			{error && <div className="px-3 py-2 bg-red-100 text-red-800 rounded text-[11px]">{error}</div>}

			{/* JSON編集エリア */}
			<textarea
				className="w-full flex-1 p-3 border border-gray-300 rounded-md text-xs font-mono resize-none box-border outline-none bg-gray-50"
				value={jsonText}
				onChange={(e) => setJsonText(e.target.value)}
				spellCheck={false}
			/>
		</div>
	);
}
