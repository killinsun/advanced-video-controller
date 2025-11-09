import type { CommentRecord } from "@/types/game-review";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";

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
					<Badge
						variant={record.homeAway === "HOME" ? "default" : "destructive"}
						className="text-xs font-semibold"
					>
						{record.homeAway}
					</Badge>
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
