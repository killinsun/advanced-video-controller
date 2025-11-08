import { useState, type Dispatch, type SetStateAction } from "react";
import { RecordItem } from "./RecordItem";
import type { Period, CommentRecord } from "@/types/game-review";

interface EditorViewProps {
	player: any; // Video.js player
	selectedPeriod: Period;
	records: Record<Period, CommentRecord[]>;
	setRecords: Dispatch<SetStateAction<Record<Period, CommentRecord[]>>>;
}

interface EditingRecord extends CommentRecord {
	isConfirmed: boolean;
}

export function EditorView({
	player,
	selectedPeriod,
	records,
	setRecords,
}: EditorViewProps) {
	const [editingRecords, setEditingRecords] = useState<EditingRecord[]>([]);

	const captureTime = () => {
		if (!player) {
			console.error("[AVC Review] Player not available");
			return;
		}

		const currentTime = player.currentTime();
		const newRecord: EditingRecord = {
			videoSec: Math.floor(currentTime),
			comment: "",
			homeAway: "HOME",
			isConfirmed: false,
		};

		setEditingRecords((prev) => [...prev, newRecord]);
		console.log(
			`[AVC Review] Time captured: ${currentTime}s in ${selectedPeriod}Q`,
		);
	};

	const updateEditingRecord = (index: number, updated: CommentRecord) => {
		setEditingRecords((prev) =>
			prev.map((r, i) =>
				i === index ? { ...updated, isConfirmed: r.isConfirmed } : r,
			),
		);
	};

	const confirmRecord = (index: number, record: CommentRecord) => {
		// 確定済みrecordsに追加
		setRecords((prev) => ({
			...prev,
			[selectedPeriod]: [...prev[selectedPeriod], record],
		}));

		// 編集中リストから削除
		setEditingRecords((prev) => prev.filter((_, i) => i !== index));
		console.log(`[AVC Review] Record confirmed in ${selectedPeriod}Q`);
	};

	const deleteEditingRecord = (index: number) => {
		setEditingRecords((prev) => prev.filter((_, i) => i !== index));
	};

	const deleteConfirmedRecord = (index: number) => {
		setRecords((prev) => ({
			...prev,
			[selectedPeriod]: prev[selectedPeriod].filter((_, i) => i !== index),
		}));
	};

	const handleTimeClick = (videoSec: number) => {
		if (player) {
			player.currentTime(videoSec);
			console.log(`[AVC Review] Seeked to ${videoSec}s`);
		}
	};

	const confirmedRecords = records[selectedPeriod];
	const allRecords = [...editingRecords, ...confirmedRecords];

	return (
		<div className="flex flex-col gap-4 flex-1">
			{/* 時間記録ボタン */}
			<button
				type="button"
				className="w-full py-3.5 px-4 bg-emerald-500 text-white border-none rounded-lg cursor-pointer text-base font-bold transition-all duration-200 hover:bg-emerald-600 hover:-translate-y-px"
				onClick={captureTime}
			>
				⏱️ 時間を記録
			</button>

			{/* レコードリスト */}
			<div className="flex flex-col-reverse gap-2">
				{allRecords.length === 0 ? (
					<div className="text-center text-gray-400 py-8 px-4 text-sm">
						まだ記録がありません
						<br />
						「時間を記録」ボタンで追加できます
					</div>
				) : (
					<>
						{/* 確定済みレコード */}
						{confirmedRecords.map((record, index) => (
							<RecordItem
								key={`confirmed-${record.videoSec + index}`}
								record={record}
								onUpdate={() => {}} // 確定済みは更新不可
								onConfirm={() => {}} // 確定済みは再確定不可
								onDelete={() => deleteConfirmedRecord(index)}
								onTimeClick={() => handleTimeClick(record.videoSec)}
							/>
						))}
						{/* 編集中レコード */}
						{editingRecords.map((record, index) => (
							<RecordItem
								key={`editing-${record.videoSec + index}`}
								record={record}
								onUpdate={(updated) => updateEditingRecord(index, updated)}
								onConfirm={(confirmed) => confirmRecord(index, confirmed)}
								onDelete={() => deleteEditingRecord(index)}
							/>
						))}
					</>
				)}
			</div>
		</div>
	);
}
