import { type Dispatch, type SetStateAction, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { CommentRecord, Period } from "@/types/game-review";
import { RecordForm } from "./RecordForm";
import { RecordItem } from "./RecordItem";

interface EditorViewProps {
	player: any;
	selectedPeriod: Period;
	records: Record<Period, CommentRecord[]>;
	setRecords: Dispatch<SetStateAction<Record<Period, CommentRecord[]>>>;
}

export function EditorView({
	player,
	selectedPeriod,
	records,
	setRecords,
}: EditorViewProps) {
	const [editingRecords, setEditingRecords] = useState<
		Record<Period, number[]>
	>({
		"1": [],
		"2": [],
		"3": [],
		"4": [],
	});

	const captureTime = () => {
		if (!player) {
			console.error("[AVC Review] Player not available");
			return;
		}

		const currentTime = player.currentTime();
		const videoSec = Math.floor(currentTime);

		setEditingRecords((prev) => ({
			...prev,
			[selectedPeriod]: [...prev[selectedPeriod], videoSec],
		}));
		console.log(
			`[AVC Review] Time captured: ${currentTime}s in ${selectedPeriod}Q`,
		);
	};

	const confirmRecord = (videoSec: number, record: CommentRecord) => {
		setRecords((prev) => ({
			...prev,
			[selectedPeriod]: [...prev[selectedPeriod], record],
		}));

		setEditingRecords((prev) => ({
			...prev,
			[selectedPeriod]: prev[selectedPeriod].filter((sec) => sec !== videoSec),
		}));
		console.log(`[AVC Review] Record confirmed in ${selectedPeriod}Q`);
	};

	const deleteEditingRecord = (videoSec: number) => {
		setEditingRecords((prev) => ({
			...prev,
			[selectedPeriod]: prev[selectedPeriod].filter((sec) => sec !== videoSec),
		}));
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
	const currentEditingRecords = editingRecords[selectedPeriod];

	return (
		<div className="flex flex-1 flex-col gap-4">
			<Button
				onClick={captureTime}
				className="w-full bg-emerald-500 py-3.5 text-base font-bold transition-all hover:-translate-y-px hover:bg-emerald-600"
			>
				⏱️ 時間を記録
			</Button>

			<div className="flex flex-col-reverse gap-2">
				{confirmedRecords.length === 0 && currentEditingRecords.length === 0 ? (
					<div className="py-8 px-4 text-center text-sm text-gray-400">
						まだ記録がありません
						<br />
						「時間を記録」ボタンで追加できます
					</div>
				) : (
					<>
						{confirmedRecords.map((record, index) => (
							<RecordItem
								key={`confirmed-${record.videoSec}-${index}`}
								record={record}
								onDelete={() => deleteConfirmedRecord(index)}
								onTimeClick={() => handleTimeClick(record.videoSec)}
							/>
						))}
						{currentEditingRecords.map((videoSec) => (
							<RecordForm
								key={`editing-${videoSec}`}
								initialVideoSec={videoSec}
								onConfirm={(record) => confirmRecord(videoSec, record)}
								onDelete={() => deleteEditingRecord(videoSec)}
							/>
						))}
					</>
				)}
			</div>
		</div>
	);
}
