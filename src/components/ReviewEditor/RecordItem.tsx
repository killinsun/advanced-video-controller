import { Button } from "@/components/ui/Button";
import type { CommentRecord } from "@/types/game-review";

interface RecordItemProps {
	record: CommentRecord;
	onDelete: () => void;
	onTimeClick: () => void;
}

export function RecordItem({ record, onDelete, onTimeClick }: RecordItemProps) {
	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<button
						type="button"
						className="font-mono text-sm font-semibold text-gray-700 transition-colors hover:text-blue-600"
						onClick={onTimeClick}
					>
						{formatTime(record.videoSec)}
					</button>
					<div
						className={`rounded px-2 py-0.5 text-xs font-semibold ${
							record.homeAway === "HOME"
								? "bg-blue-100 text-blue-900"
								: "bg-red-100 text-red-900"
						}`}
					>
						{record.homeAway}
					</div>
					{record.restGameClock && (
						<div className="font-mono text-xs text-gray-400">
							@{record.restGameClock}
						</div>
					)}
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={onDelete}
					className="h-auto p-0 text-xs text-red-500 hover:bg-transparent hover:text-red-600"
				>
					削除
				</Button>
			</div>

			<div className="min-h-[20px] whitespace-pre-wrap break-words text-sm text-gray-700">
				{record.comment || "(コメントなし)"}
			</div>
		</div>
	);
}
