import { useEffect, useState } from "react";
import type { GameReview } from "@/types/game-review";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

interface JsonViewProps {
	gameReview: GameReview;
	onImport: (imported: GameReview) => void;
}

export function JsonView({ gameReview, onImport }: JsonViewProps) {
	const [copied, setCopied] = useState(false);
	const [restored, setRestored] = useState(false);
	const [error, setError] = useState("");
	const [jsonText, setJsonText] = useState("");

	const jsonString = JSON.stringify(gameReview, null, 2);

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

			if (!parsed.periods || typeof parsed.periods !== "object") {
				throw new Error("無効なフォーマット: periods が必要です");
			}

			for (const period of ["1", "2", "3", "4"]) {
				if (parsed.periods[period] && !Array.isArray(parsed.periods[period])) {
					throw new Error(
						`無効なフォーマット: periods.${period} は配列である必要があります`,
					);
				}
			}
			setRestored(true);

			console.log("[AVC Review] Calling onImport with:", parsed);
			onImport(parsed as GameReview);
			console.log("[AVC Review] Data imported successfully");
			setTimeout(() => setRestored(false), 2000);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "JSONのパースに失敗しました";
			setError(errorMessage);
			console.error("[AVC Review] Import failed:", err);
			setRestored(false);
		}
	};

	return (
		<div className="flex flex-col gap-2 h-full">
			<p>
				JSONデータを貼り付けて「復元」を押すと、ゲームレビューが復元されます。
			</p>
			<div className="flex gap-2 justify-end">
				<Button
					size="sm"
					onClick={copyToClipboard}
					className={`
						${copied ? "border-emerald-500 text-emerald-500" : ""}`}
				>
					{copied ? "✓ コピー済み" : "コピー"}
				</Button>
				<Button
					size="sm"
					onClick={handleImport}
					className={`
					${restored ? "border-emerald-500 text-emerald-500" : ""}`}
				>
					{restored ? "✓ 復元済み" : "復元"}
				</Button>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertDescription className="text-[11px]">{error}</AlertDescription>
				</Alert>
			)}

			<Textarea
				className="flex-1 text-xs font-mono bg-gray-50"
				value={jsonText}
				onChange={(e) => setJsonText(e.target.value)}
				spellCheck={false}
			/>
		</div>
	);
}
