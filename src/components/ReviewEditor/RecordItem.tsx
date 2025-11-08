import { useState, useEffect, useRef } from "react";
import type { CommentRecord } from "@/types/game-review";

interface RecordItemProps {
	record: CommentRecord;
	onUpdate: (updated: CommentRecord) => void;
	onConfirm: (confirmed: CommentRecord) => void;
	onDelete: () => void;
	onTimeClick?: () => void;
}

export function RecordItem({
	record,
	onUpdate,
	onConfirm,
	onDelete,
	onTimeClick,
}: RecordItemProps) {
	const [comment, setComment] = useState(record.comment);
	const [homeAway, setHomeAway] = useState<"HOME" | "AWAY">(record.homeAway);
	const [restGameClock, setRestGameClock] = useState(
		record.restGameClock || "",
	);
	const [isFocused, setIsFocused] = useState(false);
	const [isClockFocused, setIsClockFocused] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// 編集中レコードが作成されたら自動フォーカス
	useEffect(() => {
		if (!onTimeClick && textareaRef.current) {
			textareaRef.current.focus();
		}
	}, [onTimeClick]);

	const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newComment = e.target.value;
		setComment(newComment);
		onUpdate({
			...record,
			comment: newComment,
			restGameClock: restGameClock || undefined,
		});
	};

	const handleClockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		// MM:SS形式のみ許可（数字とコロンのみ）
		if (/^[0-9:]*$/.test(value)) {
			setRestGameClock(value);
			onUpdate({ ...record, comment, restGameClock: value || undefined });
		}
	};

	const handleHomeAwayChange = (value: "HOME" | "AWAY") => {
		setHomeAway(value);
		const confirmedRecord: CommentRecord = {
			...record,
			comment,
			homeAway: value,
			restGameClock: restGameClock || undefined,
		};
		onConfirm(confirmedRecord);
	};

	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	if (onTimeClick) {
		// 確定後の表示
		return (
			<div className="p-3 bg-gray-50 rounded-md border border-gray-200 flex flex-col gap-2">
				{/* ヘッダー: 時間+チーム名と削除リンク */}
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2">
						<button
							type="button"
							className="text-sm font-semibold text-gray-700 font-mono transition-colors duration-200 hover:text-blue-600 bg-transparent border-none p-0 cursor-pointer"
							onClick={onTimeClick}
						>
							{formatTime(record.videoSec)}
						</button>
						<div
							className={`
								text-[11px] font-semibold px-2 py-0.5 rounded
								${homeAway === "HOME" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}
							`}
						>
							{homeAway}
						</div>
						{restGameClock && (
							<div className="text-[11px] text-gray-400 font-mono">
								@{restGameClock}
							</div>
						)}
					</div>
					<button
						type="button"
						className="text-xs text-red-500 cursor-pointer underline bg-transparent border-none p-0 transition-opacity duration-200 hover:opacity-70"
						onClick={onDelete}
					>
						削除
					</button>
				</div>

				{/* コメントテキスト表示 */}
				<div className="text-[13px] text-gray-700 whitespace-pre-wrap break-words min-h-[20px]">
					{comment || "(コメントなし)"}
				</div>
			</div>
		);
	}

	// 編集中の表示
	return (
		<div className="p-3 bg-gray-50 rounded-md border border-gray-200 flex flex-col gap-2">
			{/* 時間表示 */}
			<div className="text-sm font-semibold text-gray-700 font-mono">
				{formatTime(record.videoSec)}
			</div>

			{/* コメント入力 */}
			<textarea
				ref={textareaRef}
				className={`
					w-full min-h-[60px] p-2 border rounded text-[13px] resize-y font-inherit box-border outline-none transition-all duration-200
					${isFocused ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]" : "border-gray-300"}
				`}
				placeholder="コメントを入力..."
				value={comment}
				onChange={handleCommentChange}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
			/>

			{/* 残り時間入力 */}
			<div className="flex flex-col gap-1">
				<label htmlFor="restGameClock" className="text-[11px] text-gray-500 font-medium">
					残り時間（任意）
				</label>
				<input
					type="text"
					className={`
						px-2 py-1.5 border rounded text-[13px] font-mono box-border outline-none transition-all duration-200
						${isClockFocused ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]" : "border-gray-300"}
					`}
					placeholder="例: 08:45"
					value={restGameClock}
					onChange={handleClockChange}
					onFocus={() => setIsClockFocused(true)}
					onBlur={() => setIsClockFocused(false)}
				/>
			</div>

			{/* HOME/AWAYボタン */}
			<div className="flex gap-2">
				<button
					type="button"
					className={`
						flex-1 py-2 border-2 rounded bg-white cursor-pointer text-[13px] font-semibold transition-all duration-200 outline-none
						${homeAway === "HOME" ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 hover:bg-gray-100 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)]"}
					`}
					onClick={() => handleHomeAwayChange("HOME")}
				>
					HOME
				</button>
				<button
					type="button"
					className={`
						flex-1 py-2 border-2 rounded bg-white cursor-pointer text-[13px] font-semibold transition-all duration-200 outline-none
						${homeAway === "AWAY" ? "bg-red-500 text-white border-red-500" : "border-gray-200 hover:bg-gray-100 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)]"}
					`}
					onClick={() => handleHomeAwayChange("AWAY")}
				>
					AWAY
				</button>
			</div>
		</div>
	);
}
