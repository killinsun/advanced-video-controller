import { useState, CSSProperties } from 'react';

type Period = '1' | '2' | '3' | '4';

interface CommentRecord {
  videoSec: number;
  restGameClock?: string;
  comment: string;
  homeAway: 'HOME' | 'AWAY';
}

interface EditorViewProps {
  player: any; // Video.js player
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as CSSProperties,
  periodContainer: {
    display: 'flex',
    gap: '8px',
  } as CSSProperties,
  periodButton: {
    flex: 1,
    padding: '10px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
  } as CSSProperties,
  periodButtonActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6',
  } as CSSProperties,
  captureButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'all 0.2s',
  } as CSSProperties,
  recordsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as CSSProperties,
  recordItem: {
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
  } as CSSProperties,
  recordTime: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'monospace',
  } as CSSProperties,
  emptyState: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: '32px 16px',
    fontSize: '14px',
  } as CSSProperties,
};

export function EditorView({ player }: EditorViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1');
  const [records, setRecords] = useState<Record<Period, CommentRecord[]>>({
    '1': [],
    '2': [],
    '3': [],
    '4': [],
  });

  const captureTime = () => {
    if (!player) {
      console.error('[AVC Review] Player not available');
      return;
    }

    const currentTime = player.currentTime();
    const newRecord: CommentRecord = {
      videoSec: Math.floor(currentTime),
      comment: '',
      homeAway: 'HOME',
    };

    setRecords((prev) => ({
      ...prev,
      [selectedPeriod]: [...prev[selectedPeriod], newRecord],
    }));

    console.log(`[AVC Review] Time captured: ${currentTime}s in ${selectedPeriod}Q`);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentRecords = records[selectedPeriod];

  return (
    <div style={styles.container}>
      {/* クォーター選択 */}
      <div style={styles.periodContainer}>
        {(['1', '2', '3', '4'] as Period[]).map((period) => (
          <button
            key={period}
            style={{
              ...styles.periodButton,
              ...(selectedPeriod === period ? styles.periodButtonActive : {}),
            }}
            onClick={() => setSelectedPeriod(period)}
            onMouseEnter={(e) => {
              if (selectedPeriod !== period) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedPeriod !== period) {
                e.currentTarget.style.backgroundColor = 'white';
              }
            }}
          >
            {period}Q
          </button>
        ))}
      </div>

      {/* 時間記録ボタン */}
      <button
        style={styles.captureButton}
        onClick={captureTime}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#059669';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#10b981';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        ⏱️ 時間を記録
      </button>

      {/* レコードリスト */}
      <div style={styles.recordsList}>
        {currentRecords.length === 0 ? (
          <div style={styles.emptyState}>
            まだ記録がありません
            <br />
            「時間を記録」ボタンで追加できます
          </div>
        ) : (
          currentRecords.map((record, index) => (
            <div key={index} style={styles.recordItem}>
              <div style={styles.recordTime}>{formatTime(record.videoSec)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
