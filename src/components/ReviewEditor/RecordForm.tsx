import { useState } from "react";
import type { CommentRecord } from "@/types/game-review";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

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
		<div className="flex flex-col gap-2 rounded-md bg-white p-3">
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

			<Textarea
				autoFocus
				className="min-h-[60px] resize-y bg-white border-solid border-gray-200"
				placeholder="コメントを入力..."
				value={comment}
				onChange={(e) => setComment(e.target.value)}
			/>

			<div className="flex flex-col gap-1">
				<Label htmlFor="restGameClock" className="text-xs">
					残り時間（任意）
				</Label>
				<Input
					type="text"
					id="restGameClock"
					className="font-mono text-sm bg-white border-solid border-gray-200"
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
					className="flex-1 border-2 font-semibold bg-gray-200 hover:bg-gray-400 hover:text-white"
				>
					HOME
				</Button>
				<Button
					variant="outline"
					size="default"
					onClick={() => handleHomeAwayClick("AWAY")}
					className="flex-1 border-2 font-semibold bg-gray-200 hover:bg-gray-400 hover:text-white"
				>
					AWAY
				</Button>
			</div>
		</div>
	);
}
