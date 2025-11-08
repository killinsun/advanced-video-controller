import { useState, useEffect } from "react";
import type { FrameController } from "@/utils/frame-controller";
import { parseTimeString } from "@/utils/time-parser";

interface ControlPanelProps {
	controller: FrameController;
	initialTime?: number | null;
}

export function ControlPanel({ controller, initialTime }: ControlPanelProps) {
	const [timeInput, setTimeInput] = useState(
		initialTime !== null && initialTime !== undefined
			? String(initialTime)
			: "",
	);
	const [isPaused, setIsPaused] = useState(controller.isPaused());
	const [errorText, setErrorText] = useState("");

	// プレーヤーの状態を監視
	useEffect(() => {
		const interval = setInterval(() => {
			setIsPaused(controller.isPaused());
		}, 100);

		return () => clearInterval(interval);
	}, [controller]);
	const buttonStyle: React.CSSProperties = {
		padding: "8px 16px",
		margin: "0 4px",
		backgroundColor: "#333",
		color: "#fff",
		border: "1px solid #555",
		borderRadius: "8px",
		cursor: "pointer",
		fontSize: "14px",
		fontWeight: "bold",
	};

	const containerStyle: React.CSSProperties = {
		display: "flex",
		alignItems: "center",
		gap: "8px",
		padding: "8px",
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		borderRadius: "16px",
		marginTop: "8px",
	};

	const inputStyle: React.CSSProperties = {
		padding: "8px 12px",
		backgroundColor: "#222",
		color: "#fff",
		border: "1px solid #555",
		borderRadius: "8px",
		fontSize: "14px",
		width: "100px",
	};

	const jumpButtonStyle: React.CSSProperties = {
		...buttonStyle,
		backgroundColor: "#1a5490",
	};

	const handleJumpTo = () => {
		const seconds = parseTimeString(timeInput);
		if (seconds !== null) {
			controller.seekTo(seconds);
			setErrorText("");
		} else {
			setErrorText("無効な時間形式です。例: 1:30 または 1:15:30");
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleJumpTo();
		}
	};

	return (
		<div className="wrapper">
			<div style={containerStyle}>
				<button
					type="button"
					style={buttonStyle}
					onClick={() => controller.togglePlayPause()}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = "#444";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = "#333";
					}}
					title={isPaused ? "再生" : "一時停止"}
				>
					{isPaused ? "▶" : "⏸"}
				</button>

				<span style={{ color: "#888", fontSize: "14px" }}>|</span>

				<button
					type="button"
					style={buttonStyle}
					onClick={() => controller.skip(-1)}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = "#444";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = "#333";
					}}
				>
					-1
				</button>

				<button
					type="button"
					style={buttonStyle}
					onClick={() => controller.skip(1)}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = "#444";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = "#333";
					}}
				>
					+1
				</button>

				<span style={{ color: "#888", fontSize: "14px" }}>|</span>

				<input
					type="text"
					style={inputStyle}
					placeholder="1:30"
					value={timeInput}
					onChange={(e) => setTimeInput(e.target.value)}
					onKeyPress={handleKeyPress}
				/>

				<button
					type="button"
					style={jumpButtonStyle}
					onClick={handleJumpTo}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = "#2563a8";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = "#1a5490";
					}}
				>
					移動
				</button>
			</div>
			{errorText && (
				<p style={{ color: "#f00", fontSize: "12px", marginTop: "4px" }}>
					{errorText}
				</p>
			)}
		</div>
	);
}
