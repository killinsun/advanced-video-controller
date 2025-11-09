import { useState } from "react";
import { useReviewStorage } from "@/hooks/useReviewStorage";
import type { CommentRecord, GameReview, Period } from "@/types/game-review";
import { EditorView } from "./EditorView";
import { JsonView } from "./JsonView";

interface ReviewSidebarProps {
	player: any;
	onClose: () => void;
}

export function ReviewSidebar({ player, onClose }: ReviewSidebarProps) {
	const [selectedPeriod, setSelectedPeriod] = useState<Period>("1");
	const [viewMode, setViewMode] = useState<"editor" | "json">("editor");

	const { records, setRecords, gameInfo, setGameInfo } = useReviewStorage();

	const gameReview: GameReview = {
		...gameInfo,
		periods: records,
	};

	const handleImport = (imported: GameReview) => {
		const cleanRecord = (record: any): CommentRecord => ({
			videoSec: record.videoSec,
			comment: record.comment,
			homeAway: record.homeAway,
			...(record.restGameClock ? { restGameClock: record.restGameClock } : {}),
		});

		const importedPeriods: Record<Period, CommentRecord[]> = {
			"1": (imported.periods["1"] || []).map(cleanRecord),
			"2": (imported.periods["2"] || []).map(cleanRecord),
			"3": (imported.periods["3"] || []).map(cleanRecord),
			"4": (imported.periods["4"] || []).map(cleanRecord),
		};

		setRecords(importedPeriods);
		setGameInfo({
			gameId: imported.gameId || "",
			homeTeamName: imported.homeTeamName || "",
			awayTeamName: imported.awayTeamName || "",
		});
		console.log("[AVC Review] Data imported successfully", importedPeriods);
	};

	return (
		<div className="h-screen w-full bg-white shadow-[-4px_0_16px_rgba(0,0,0,0.1)] flex flex-col gap-2">
			<div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
				<h2 className="text-lg font-bold text-gray-800 m-0">ゲームレビュー</h2>
				<button
					type="button"
					onClick={onClose}
					className="bg-transparent border-none text-[28px] leading-none w-8 h-8 flex items-center justify-center cursor-pointer text-gray-500 transition-colors duration-200 hover:text-gray-700"
					aria-label="閉じる"
				>
					×
				</button>
			</div>

			<div className="inline-flex bg-gray-100 rounded px-0.5 py-0.5 gap-0.5 self-end">
				<button
					type="button"
					className={`
						px-2.5 py-1 text-[11px] font-medium border-none rounded-[3px] cursor-pointer transition-all duration-200
						${viewMode === "editor" ? "bg-white text-gray-700 shadow-sm" : "bg-transparent text-gray-500"}
					`}
					onClick={() => setViewMode("editor")}
				>
					📝 エディタ
				</button>
				<button
					type="button"
					className={`
						px-2.5 py-1 text-[11px] font-medium border-none rounded-[3px] cursor-pointer transition-all duration-200
						${viewMode === "json" ? "bg-white text-gray-700 shadow-sm" : "bg-transparent text-gray-500"}
					`}
					onClick={() => setViewMode("json")}
				>
					📋 JSON
				</button>
			</div>

			<div
				className={`flex border-b border-gray-200 ${viewMode === "editor" ? "block" : "hidden"}`}
			>
				{(["1", "2", "3", "4"] as Period[]).map((period) => (
					<button
						type="button"
						key={period}
						className={`
							flex-1 py-3 px-3 text-sm font-semibold bg-transparent border-none cursor-pointer transition-colors duration-200 relative
							${selectedPeriod === period ? "text-blue-600" : "text-gray-500 hover:text-gray-800"}
						`}
						onClick={() => setSelectedPeriod(period)}
					>
						{period}Q
						{selectedPeriod === period && (
							<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
						)}
					</button>
				))}
			</div>

			<div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 relative">
				{viewMode === "editor" ? (
					<EditorView
						player={player}
						selectedPeriod={selectedPeriod}
						records={records}
						setRecords={setRecords}
					/>
				) : (
					<JsonView gameReview={gameReview} onImport={handleImport} />
				)}
			</div>
		</div>
	);
}
