import { type CSSProperties, useState } from "react";
import type { CommentRecord } from "@/types/game-review";

interface RecordFormProps {
	initialVideoSec: number;
	onConfirm: (record: CommentRecord) => void;
	onDelete: () => void;
}

const styles = {
	container: {
		padding: "12px",
		backgroundColor: "#f9fafb",
		borderRadius: "6px",
		border: "1px solid #e5e7eb",
		display: "flex",
		flexDirection: "column",
		gap: "8px",
	} as CSSProperties,
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
	} as CSSProperties,
	timeDisplay: {
		fontSize: "14px",
		fontWeight: "600",
		color: "#374151",
		fontFamily: "monospace",
	} as CSSProperties,
	deleteLink: {
		fontSize: "12px",
		color: "#ef4444",
		cursor: "pointer",
		textDecoration: "underline",
		background: "none",
		border: "none",
		padding: 0,
	} as CSSProperties,
	textarea: {
		width: "100%",
		minHeight: "60px",
		padding: "8px",
		border: "1px solid #d1d5db",
		borderRadius: "4px",
		fontSize: "13px",
		resize: "vertical",
		fontFamily: "inherit",
		boxSizing: "border-box",
		outline: "none",
	} as CSSProperties,
	textareaFocus: {
		borderColor: "#3b82f6",
		boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
	} as CSSProperties,
	inputWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: "4px",
	} as CSSProperties,
	label: {
		fontSize: "11px",
		color: "#6b7280",
		fontWeight: "500",
	} as CSSProperties,
	input: {
		padding: "6px 8px",
		border: "1px solid #d1d5db",
		borderRadius: "4px",
		fontSize: "13px",
		fontFamily: "monospace",
		boxSizing: "border-box",
		outline: "none",
	} as CSSProperties,
	inputFocus: {
		borderColor: "#3b82f6",
		boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
	} as CSSProperties,
	buttonContainer: {
		display: "flex",
		gap: "8px",
	} as CSSProperties,
	homeAwayButton: {
		flex: 1,
		padding: "8px",
		border: "2px solid #e5e7eb",
		borderRadius: "4px",
		backgroundColor: "white",
		cursor: "pointer",
		fontSize: "13px",
		fontWeight: "600",
		transition: "all 0.2s",
		outline: "none",
	} as CSSProperties,
	homeButtonActive: {
		backgroundColor: "#3b82f6",
		color: "white",
		borderColor: "#3b82f6",
	} as CSSProperties,
	awayButtonActive: {
		backgroundColor: "#ef4444",
		color: "white",
		borderColor: "#ef4444",
	} as CSSProperties,
};

export function RecordForm({
	initialVideoSec,
	onConfirm,
	onDelete,
}: RecordFormProps) {
	const [comment, setComment] = useState("");
	const [restGameClock, setRestGameClock] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	const [isClockFocused, setIsClockFocused] = useState(false);

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
		<div style={styles.container}>
			<div style={styles.header}>
				<div style={styles.timeDisplay}>{formatTime(initialVideoSec)}</div>
				<button
					type="button"
					style={styles.deleteLink}
					onClick={onDelete}
					onMouseEnter={(e) => {
						e.currentTarget.style.opacity = "0.7";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.opacity = "1";
					}}
				>
					キャンセル
				</button>
			</div>

			<textarea
				autoFocus
				style={{
					...styles.textarea,
					...(isFocused ? styles.textareaFocus : {}),
				}}
				placeholder="コメントを入力..."
				value={comment}
				onChange={(e) => setComment(e.target.value)}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
			/>

			<div style={styles.inputWrapper}>
				<label htmlFor="restGameClock" style={styles.label}>
					残り時間（任意）
				</label>
				<input
					type="text"
					style={{
						...styles.input,
						...(isClockFocused ? styles.inputFocus : {}),
					}}
					placeholder="例: 08:45"
					value={restGameClock}
					onChange={handleClockChange}
					onFocus={() => setIsClockFocused(true)}
					onBlur={() => setIsClockFocused(false)}
				/>
			</div>

			<div style={styles.buttonContainer}>
				<button
					type="button"
					style={styles.homeAwayButton}
					onClick={() => handleHomeAwayClick("HOME")}
				>
					HOME
				</button>
				<button
					type="button"
					style={styles.homeAwayButton}
					onClick={() => handleHomeAwayClick("AWAY")}
				>
					AWAY
				</button>
			</div>
		</div>
	);
}
