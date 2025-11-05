import { useState, CSSProperties } from 'react';
import { GameReview } from '@/types/game-review';

interface JsonViewProps {
  gameReview: GameReview;
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as CSSProperties,
  copyButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
  } as CSSProperties,
  copyButtonSuccess: {
    backgroundColor: '#10b981',
  } as CSSProperties,
  jsonContainer: {
    backgroundColor: '#f3f4f6',
    padding: '12px',
    borderRadius: '6px',
    overflow: 'auto',
    maxHeight: 'calc(100vh - 200px)',
  } as CSSProperties,
  pre: {
    margin: 0,
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#374151',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  } as CSSProperties,
};

export function JsonView({ gameReview }: JsonViewProps) {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(gameReview, null, 2);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('[AVC Review] Failed to copy:', error);
    }
  };

  return (
    <div style={styles.container}>
      {/* コピーボタン */}
      <button
        style={{
          ...styles.copyButton,
          ...(copied ? styles.copyButtonSuccess : {}),
        }}
        onClick={copyToClipboard}
        onMouseEnter={(e) => {
          if (!copied) {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }
        }}
        onMouseLeave={(e) => {
          if (!copied) {
            e.currentTarget.style.backgroundColor = '#3b82f6';
          }
        }}
      >
        {copied ? '✓ コピーしました!' : '📋 JSONをコピー'}
      </button>

      {/* JSON表示 */}
      <div style={styles.jsonContainer}>
        <pre style={styles.pre}>
          <code>{jsonString}</code>
        </pre>
      </div>
    </div>
  );
}
