import { useState } from "react";
import ReactDOM from "react-dom/client";
import { ReviewSidebar } from "@/components/ReviewEditor/ReviewSidebar";
import {
	detectVideoJsPlayer,
	waitForPlayerReady,
} from "@/utils/player-detector";
import tailwindStyles from "@/assets/tailwind.css?inline";
import { Button } from "@/components/ui/Button";

interface ReviewAppProps {
	player: any; // Video.js player
}

function ReviewApp({ player }: ReviewAppProps) {
	const [isVisible, setIsVisible] = useState(true);

	return (
		<>
			{/* トグルボタン */}
			<Button
				variant="outline"
				onClick={() => setIsVisible(!isVisible)}
				className={`
					${isVisible ? "hidden" : "block"}
					fixed bottom-5 z-[9999]
					${isVisible ? "right-[404px]" : "right-5"}
					px-5 py-2
					bg-blue-500 text-white
					rounded-lg shadow-md
					text-sm font-semibold
					hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-lg
					transition-all duration-300
					cursor-pointer
				`}
			>
				{isVisible ? "📝" : "レビューを開く"}
			</Button>

			{/* サイドバー */}
			<div
				className={`
					${isVisible ? "w-[384px]" : "w-0"}
					flex-shrink-0
				`}
			>
				<ReviewSidebar player={player} onClose={() => setIsVisible(false)} />
			</div>
		</>
	);
}

export default defineContentScript({
	matches: ["https://basketball.mb.softbank.jp/lives/*"],
	runAt: "document_idle",
	world: "MAIN",

	async main() {
		console.log("[AVC Review] Review sidebar script initialized");

		try {
			// Video.jsプレーヤーを検出
			const player = await detectVideoJsPlayer();

			// プレーヤーが準備完了するまで待機
			await waitForPlayerReady(player);
			console.log("[AVC Review] Player detected and ready");

			// Flexラッパーを作成
			const flexWrapper = document.createElement("div");
			flexWrapper.id = "avc-flex-wrapper";
			Object.assign(flexWrapper.style, {
				display: "flex",
				width: "100%",
				height: "100vh",
				overflow: "hidden",
			});

			// 既存のbodyコンテンツを全てラッパーに移動
			const mainContent = document.createElement("div");
			mainContent.id = "avc-main-content";
			Object.assign(mainContent.style, {
				flex: "1",
				overflow: "auto",
				position: "relative",
			});

			// bodyの全ての子要素をmainContentに移動
			while (document.body.firstChild) {
				mainContent.appendChild(document.body.firstChild);
			}

			flexWrapper.appendChild(mainContent);
			document.body.appendChild(flexWrapper);

			// bodyのスタイル調整
			Object.assign(document.body.style, {
				margin: "0",
				padding: "0",
				overflow: "hidden",
			});

			// Shadow DOMホストを作成
			const shadowHost = document.createElement("div");
			shadowHost.id = "avc-review-shadow-host";
			Object.assign(shadowHost.style, {
				display: "contents", // flexコンテナの子要素として振る舞う
			});
			flexWrapper.appendChild(shadowHost);

			// Shadow DOMを作成
			const shadowRoot = shadowHost.attachShadow({ mode: "open" });

			// Tailwind CSSをShadow DOM内に注入
			const styleElement = document.createElement("style");
			styleElement.textContent = tailwindStyles;
			shadowRoot.appendChild(styleElement);

			// ReactコンテナをShadow DOM内に作成
			const reactContainer = document.createElement("div");
			reactContainer.id = "avc-review-react-root";
			Object.assign(reactContainer.style, {
				display: "contents",
			});
			shadowRoot.appendChild(reactContainer);

			// Reactをマウント
			const root = ReactDOM.createRoot(reactContainer);
			root.render(<ReviewApp player={player} />);

			console.log("[AVC Review] Review sidebar ready");
		} catch (error) {
			console.error("[AVC Review] Failed to initialize:", error);
		}
	},
});
