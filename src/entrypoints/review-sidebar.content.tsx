import { useState } from 'react';
import { ReviewSidebar } from '@/components/ReviewEditor/ReviewSidebar';
import ReactDOM from 'react-dom/client';

function ReviewApp() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      {/* トグルボタン */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          display: isVisible ? 'none' : 'block',
          position: 'fixed',
          bottom: '20px',
          right: isVisible ? '404px' : '20px', // サイドバーの幅 + 20px
          zIndex: 9999,
          padding: '12px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#2563eb';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#3b82f6';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
      >
        {isVisible ? '📝' : 'レビューを開く'}
      </button>

      {/* サイドバー */}
      {isVisible && (
        <div
          style={{
            width: '384px',
            flexShrink: 0,
          }}
        >
          <ReviewSidebar onClose={() => setIsVisible(false)} />
        </div>
      )}
    </>
  );
}

export default defineContentScript({
  matches: ['https://basketball.mb.softbank.jp/lives/*'],
  runAt: 'document_idle',

  async main() {
    console.log('[AVC Review] Review sidebar script initialized');

    // Flexラッパーを作成
    const flexWrapper = document.createElement('div');
    flexWrapper.id = 'avc-flex-wrapper';
    Object.assign(flexWrapper.style, {
      display: 'flex',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
    });

    // 既存のbodyコンテンツを全てラッパーに移動
    const mainContent = document.createElement('div');
    mainContent.id = 'avc-main-content';
    Object.assign(mainContent.style, {
      flex: '1',
      overflow: 'auto',
      position: 'relative',
    });

    // bodyの全ての子要素をmainContentに移動
    while (document.body.firstChild) {
      mainContent.appendChild(document.body.firstChild);
    }

    flexWrapper.appendChild(mainContent);
    document.body.appendChild(flexWrapper);

    // bodyのスタイル調整
    Object.assign(document.body.style, {
      margin: '0',
      padding: '0',
      overflow: 'hidden',
    });

    // React UIコンテナを作成してflexWrapperに追加
    const reactContainer = document.createElement('div');
    reactContainer.id = 'avc-review-react-root';
    Object.assign(reactContainer.style, {
      display: 'contents', // flexコンテナの子要素として振る舞う
    });
    flexWrapper.appendChild(reactContainer);

    // Reactをマウント
    const root = ReactDOM.createRoot(reactContainer);
    root.render(<ReviewApp />);

    console.log('[AVC Review] Review sidebar ready');
  },
});
