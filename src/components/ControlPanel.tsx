import { useState, useEffect } from "react";
import type { FrameController } from "@/utils/frame-controller";
import { parseTimeString } from "@/utils/time-parser";
import { Button } from "./ui/Button";

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
			<div className="flex items-center gap-2 p-2 bg-black/70 rounded-2xl mt-2">
				<Button
					type="button"
					onClick={() => controller.togglePlayPause()}
					title={isPaused ? "再生" : "一時停止"}
				>
					{isPaused ? "▶" : "⏸"}
				</Button>

				<span className="text-gray-500 text-sm">|</span>

				<Button
					type="button"
					variant="outline"
					onClick={() => controller.skip(-1)}
				>
					-1
				</Button>

				<Button
					type="button"
					onClick={() => controller.skip(1)}
				>
					+1
				</Button>

				<span className="text-gray-500 text-sm">|</span>

				<input
					type="text"
					className="px-3 py-2 bg-[#222] text-white border border-gray-600 rounded-lg text-sm w-[100px]"
					placeholder="1:30"
					value={timeInput}
					onChange={(e) => setTimeInput(e.target.value)}
					onKeyPress={handleKeyPress}
				/>

				<Button
					type="button"
					variant="outline"
					onClick={handleJumpTo}
				>
					移動
				</Button>
			</div>
			{errorText && (
				<p className="text-red-500 text-xs mt-1">
					{errorText}
				</p>
			)}
		</div>
	);
}
