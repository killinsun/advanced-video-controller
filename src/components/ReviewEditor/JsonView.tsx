import { useState, type CSSProperties, useEffect } from "react";
import type { GameReview } from "@/types/game-review";

interface JsonViewProps {
	gameReview: GameReview;
	onImport: (imported: GameReview) => void;
}

const styles = {
	container: {
		display: "flex",
		flexDirection: "column",
		gap: "8px",
		height: "100%",
	} as CSSProperties,
	buttonGroup: {
		display: "flex",
		gap: "8px",
		justifyContent: "flex-end",
	} as CSSProperties,
	button: {
		padding: "6px 12px",
		backgroundColor: "transparent",
		color: "#6b7280",
		borderWidth: "1px",
		borderStyle: "solid",
		borderColor: "#d1d5db",
		borderRadius: "4px",
		cursor: "pointer",
		fontSize: "12px",
		fontWeight: "500",
		transition: "all 0.2s",
	} as CSSProperties,
	buttonHover: {
		backgroundColor: "#f3f4f6",
		borderColor: "#9ca3af",
		color: "#374151",
	} as CSSProperties,
	buttonSuccess: {
		borderColor: "#10b981",
		color: "#10b981",
	} as CSSProperties,
	textarea: {
		width: "100%",
		flex: 1,
		padding: "12px",
		borderWidth: "1px",
		borderStyle: "solid",
		borderColor: "#d1d5db",
		borderRadius: "6px",
		fontSize: "12px",
		fontFamily: "monospace",
		resize: "none",
		boxSizing: "border-box",
		outline: "none",
		backgroundColor: "#f9fafb",
	} as CSSProperties,
	error: {
		padding: "8px 12px",
		backgroundColor: "#fee2e2",
		color: "#991b1b",
		borderRadius: "4px",
		fontSize: "11px",
	} as CSSProperties,
};

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
		<div style={styles.container}>
			{/* ボタングループ */}
			<div style={styles.buttonGroup}>
				<button
					type="button"
					style={{
						...styles.button,
						...(copied ? styles.buttonSuccess : {}),
					}}
					onClick={copyToClipboard}
					onMouseEnter={(e) => {
						if (!copied) {
							Object.assign(e.currentTarget.style, styles.buttonHover);
						}
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = "transparent";
						e.currentTarget.style.borderColor = copied ? "#10b981" : "#d1d5db";
						e.currentTarget.style.color = copied ? "#10b981" : "#6b7280";
					}}
				>
					{copied ? "✓ コピー済み" : "コピー"}
				</button>
				<button
					type="button"
					style={styles.button}
					onClick={handleImport}
					onMouseEnter={(e) => {
						Object.assign(e.currentTarget.style, styles.buttonHover);
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = "transparent";
						e.currentTarget.style.borderColor = "#d1d5db";
						e.currentTarget.style.color = "#6b7280";
					}}
				>
					復元
				</button>
			</div>

			{/* エラー表示 */}
			{error && <div style={styles.error}>{error}</div>}

			{/* JSON編集エリア */}
			<textarea
				style={styles.textarea}
				value={jsonText}
				onChange={(e) => setJsonText(e.target.value)}
				spellCheck={false}
			/>
		</div>
	);
}
