import { useState, CSSProperties } from 'react';
import { EditorView } from './EditorView';
import { JsonView } from './JsonView';

interface ReviewSidebarProps {
  player: any; // Video.js player
  onClose: () => void;
}

const styles = {
  container: {
    height: '100vh',
    width: '100%',
    backgroundColor: 'white',
    boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
  } as CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
  } as CSSProperties,
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
  } as CSSProperties,
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    lineHeight: '1',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#6b7280',
    transition: 'color 0.2s',
  } as CSSProperties,
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
  } as CSSProperties,
  tab: {
    flex: 1,
    padding: '12px 0',
    fontSize: '14px',
    fontWeight: '500',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s',
    position: 'relative',
  } as CSSProperties,
  tabActive: {
    color: '#2563eb',
  } as CSSProperties,
  tabInactive: {
    color: '#6b7280',
  } as CSSProperties,
  tabBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    backgroundColor: '#2563eb',
  } as CSSProperties,
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
  } as CSSProperties,
};

export function ReviewSidebar({ player, onClose }: ReviewSidebarProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'json'>('editor');

  return (
    <div style={styles.container}>
      {/* ヘッダー */}
      <div style={styles.header}>
        <h2 style={styles.title}>ゲームレビュー</h2>
        <button
          onClick={onClose}
          style={styles.closeButton}
          aria-label="閉じる"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          ×
        </button>
      </div>

      {/* タブ */}
      <div style={styles.tabContainer}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'editor' ? styles.tabActive : styles.tabInactive),
          }}
          onClick={() => setActiveTab('editor')}
          onMouseEnter={(e) => {
            if (activeTab !== 'editor') {
              e.currentTarget.style.color = '#1f2937';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'editor') {
              e.currentTarget.style.color = '#6b7280';
            }
          }}
        >
          エディタ
          {activeTab === 'editor' && <div style={styles.tabBorder} />}
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'json' ? styles.tabActive : styles.tabInactive),
          }}
          onClick={() => setActiveTab('json')}
          onMouseEnter={(e) => {
            if (activeTab !== 'json') {
              e.currentTarget.style.color = '#1f2937';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'json') {
              e.currentTarget.style.color = '#6b7280';
            }
          }}
        >
          JSON
          {activeTab === 'json' && <div style={styles.tabBorder} />}
        </button>
      </div>

      {/* コンテンツエリア */}
      <div style={styles.content}>
        {activeTab === 'editor' ? <EditorView player={player} /> : <JsonView />}
      </div>
    </div>
  );
}
