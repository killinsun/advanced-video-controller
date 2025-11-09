import {
	type CSSProperties,
	type Dispatch,
	type SetStateAction,
	useState,
} from "react";
import type { CommentRecord, Period } from "@/types/game-review";
import { RecordForm } from "./RecordForm";
import { RecordItem } from "./RecordItem";

interface EditorViewProps {
	player: any; // Video.js player
	selectedPeriod: Period;
	records: Record<Period, CommentRecord[]>;
	setRecords: Dispatch<SetStateAction<Record<Period, CommentRecord[]>>>;
}

const styles = {
	container: {
		display: "flex",
		flexDirection: "column",
		gap: "16px",
		flex: 1,
	} as CSSProperties,
	captureButton: {
		width: "100%",
		padding: "14px",
		backgroundColor: "#10b981",
		color: "white",
		border: "none",
		borderRadius: "8px",
		cursor: "pointer",
		fontSize: "16px",
		fontWeight: "bold",
		transition: "all 0.2s",
	} as CSSProperties,
	recordsList: {
		display: "flex",
		flexDirection: "column-reverse",
		gap: "8px",
	} as CSSProperties,
	emptyState: {
		textAlign: "center",
		color: "#9ca3af",
		padding: "32px 16px",
		fontSize: "14px",
	} as CSSProperties,
};

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
		<div style={styles.container}>
			<button
				type="button"
				style={styles.captureButton}
				onClick={captureTime}
				onMouseEnter={(e) => {
					e.currentTarget.style.backgroundColor = "#059669";
					e.currentTarget.style.transform = "translateY(-1px)";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.backgroundColor = "#10b981";
					e.currentTarget.style.transform = "translateY(0)";
				}}
			>
				⏱️ 時間を記録
			</button>

			<div style={styles.recordsList}>
				{confirmedRecords.length === 0 && currentEditingRecords.length === 0 ? (
					<div style={styles.emptyState}>
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
