import tailwindStyles from "@/assets/tailwind.css?inline";
import ReactDOM from "react-dom/client";
import {
	detectVideoJsPlayer,
	waitForPlayerReady,
} from "@/utils/player-detector";
import { FrameController } from "@/utils/frame-controller";
import { ControlPanel } from "@/components/ControlPanel";
import { getStartTimeFromUrl } from "@/utils/url-params";

export default defineContentScript({
	matches: ["https://basketball.mb.softbank.jp/lives/*"],
	runAt: "document_idle",
	world: "MAIN",

	async main() {
		console.log("[AVC] Advanced Video Controller initialized");

		try {
			// Video.jsプレーヤーを検出
			const player = await detectVideoJsPlayer();

			// プレーヤーが準備完了するまで待機
			await waitForPlayerReady(player);

			// FrameControllerを初期化
			const frameController = new FrameController(player, 30);

			// URLパラメーターから開始時間を取得
			const startTime = getStartTimeFromUrl();
			if (startTime !== null) {
				console.log(
					`[AVC] URL parameter t=${startTime} detected, pre-filling time input`,
				);
			}

			// キーボードショートカットを設定
			setupKeyboardShortcuts(frameController);

			// UIをマウント（startTimeを渡す）
			mountControlPanel(frameController, startTime);

			console.log("[AVC] ✓ Ready (← / →: 1s skip, Shift + ← / →: 0.5s skip)");
		} catch (error) {
			console.error("[AVC] ✗ Initialization failed:", error);
		}
	},
});

/**
 * コントロールパネルUIをマウント
 */
function mountControlPanel(
	frameController: FrameController,
	initialTime?: number | null,
): void {
	// QualityPanel_qualityPaneで始まるクラスを持つ要素を探す
	const controllerContainer = document.querySelector(
		'[class*="PlayerInner_qualityPanel__"]',
	);
	if (!controllerContainer) {
		console.error("[AVC] Controller container not found");
		return;
	}

	// Shadow DOMホストを作成
	const shadowHost = document.createElement("div");
	shadowHost.id = "avc-control-panel-shadow-host";
	shadowHost.style.width = "100%";

	// controllerContainerの直後に挿入
	controllerContainer.parentElement?.insertAdjacentElement(
		"afterend",
		shadowHost,
	);

	// Shadow DOMを作成
	const shadowRoot = shadowHost.attachShadow({ mode: "open" });

	// Tailwind CSSをShadow DOM内に注入
	const styleElement = document.createElement("style");
	styleElement.textContent = tailwindStyles;
	shadowRoot.appendChild(styleElement);

	// ReactコンテナをShadow DOM内に作成
	const reactContainer = document.createElement("div");
	reactContainer.id = "avc-control-panel-react-root";
	reactContainer.style.width = "100%";
	shadowRoot.appendChild(reactContainer);

	// Reactコンポーネントをマウント
	const root = ReactDOM.createRoot(reactContainer);
	root.render(
		<ControlPanel controller={frameController} initialTime={initialTime} />,
	);

	console.log("[AVC] Control panel mounted");
}

/**
 * キーボードショートカットを設定
 */
function setupKeyboardShortcuts(frameController: FrameController): void {
	document.addEventListener("keydown", (e: KeyboardEvent) => {
		// input/textarea要素にフォーカスがある場合は無効
		const target = e.target as HTMLElement;
		if (
			target.tagName === "INPUT" ||
			target.tagName === "TEXTAREA" ||
			target.isContentEditable
		) {
			return;
		}

		switch (e.key) {
			case "ArrowRight":
				e.preventDefault();
				if (e.shiftKey) {
					// Shift + →: 0.5秒進む
					frameController.skip(0.5);
				} else {
					// →: 1秒進む
					frameController.skip(1);
				}
				break;

			case "ArrowLeft":
				e.preventDefault();
				if (e.shiftKey) {
					// Shift + ←: 0.5秒戻る
					frameController.skip(-0.5);
				} else {
					// ←: 1秒戻る
					frameController.skip(-1);
				}
				break;
		}
	});
}
