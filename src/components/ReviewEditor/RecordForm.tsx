import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { CommentRecord } from "@/types/game-review";

interface RecordFormProps {
	initialVideoSec: number;
	onConfirm: (record: CommentRecord) => void;
	onDelete: () => void;
}

export function RecordForm({
	initialVideoSec,
	onConfirm,
	onDelete,
}: RecordFormProps) {
	const [comment, setComment] = useState("");
	const [restGameClock, setRestGameClock] = useState("");

	const handleClockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (/^[0-9:]*$/.test(value)) {
			setRestGameClock(value);
		}
	};

	const handleHomeAwayClick = (homeAway: "HOME" | "AWAY") => {
		onConfirm({
			videoSec: initialVideoSec,
			comment,
			homeAway,
			restGameClock: restGameClock || undefined,
		});
	};

	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
			<div className="flex items-center justify-between">
				<div className="font-mono text-sm font-semibold text-gray-700">
					{formatTime(initialVideoSec)}
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={onDelete}
					className="h-auto p-0 text-xs text-red-500 hover:bg-transparent hover:text-red-600"
				>
					キャンセル
				</Button>
			</div>

			<textarea
				autoFocus
				className="min-h-[60px] w-full resize-y rounded border border-gray-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
				placeholder="コメントを入力..."
				value={comment}
				onChange={(e) => setComment(e.target.value)}
			/>

			<div className="flex flex-col gap-1">
				<label
					htmlFor="restGameClock"
					className="text-xs font-medium text-gray-500"
				>
					残り時間（任意）
				</label>
				<input
					type="text"
					id="restGameClock"
					className="rounded border border-gray-300 px-2 py-1.5 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
					placeholder="例: 08:45"
					value={restGameClock}
					onChange={handleClockChange}
				/>
			</div>

			<div className="flex gap-2">
				<Button
					variant="outline"
					size="default"
					onClick={() => handleHomeAwayClick("HOME")}
					className="flex-1 border-2 font-semibold hover:bg-blue-500 hover:text-white hover:border-blue-500"
				>
					HOME
				</Button>
				<Button
					variant="outline"
					size="default"
					onClick={() => handleHomeAwayClick("AWAY")}
					className="flex-1 border-2 font-semibold hover:bg-red-500 hover:text-white hover:border-red-500"
				>
					AWAY
				</Button>
			</div>
		</div>
	);
}
