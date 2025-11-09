import type { CSSProperties } from "react";
import type { CommentRecord } from "@/types/game-review";

interface RecordItemProps {
	record: CommentRecord;
	onDelete: () => void;
	onTimeClick: () => void;
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
	timeAndTeam: {
		display: "flex",
		alignItems: "center",
		gap: "8px",
	} as CSSProperties,
	timeDisplay: {
		fontSize: "14px",
		fontWeight: "600",
		color: "#374151",
		fontFamily: "monospace",
	} as CSSProperties,
	teamBadge: {
		fontSize: "11px",
		fontWeight: "600",
		padding: "2px 8px",
		borderRadius: "4px",
	} as CSSProperties,
	teamBadgeHome: {
		backgroundColor: "#dbeafe",
		color: "#1e40af",
	} as CSSProperties,
	teamBadgeAway: {
		backgroundColor: "#fee2e2",
		color: "#991b1b",
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
	commentText: {
		fontSize: "13px",
		color: "#374151",
		whiteSpace: "pre-wrap",
		wordBreak: "break-word",
		minHeight: "20px",
	} as CSSProperties,
};

export function RecordItem({ record, onDelete, onTimeClick }: RecordItemProps) {
	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<div style={styles.container}>
			<div style={styles.header}>
				<div style={styles.timeAndTeam}>
					<button
						type="button"
						style={styles.timeDisplay}
						onClick={onTimeClick}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = "#2563eb";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = "#374151";
						}}
					>
						{formatTime(record.videoSec)}
					</button>
					<div
						style={{
							...styles.teamBadge,
							...(record.homeAway === "HOME"
								? styles.teamBadgeHome
								: styles.teamBadgeAway),
						}}
					>
						{record.homeAway}
					</div>
					{record.restGameClock && (
						<div
							style={{
								fontSize: "11px",
								color: "#9ca3af",
								fontFamily: "monospace",
							}}
						>
							@{record.restGameClock}
						</div>
					)}
				</div>
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
					削除
				</button>
			</div>

			<div style={styles.commentText}>{record.comment || "(コメントなし)"}</div>
		</div>
	);
}
