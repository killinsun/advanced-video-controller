import { useState, CSSProperties } from 'react';

interface CommentRecord {
  videoSec: number;
  restGameClock?: string;
  comment: string;
  homeAway: 'HOME' | 'AWAY';
}

interface RecordItemProps {
  record: CommentRecord;
  onUpdate: (updated: CommentRecord) => void;
  onDelete: () => void;
}

const styles = {
  container: {
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as CSSProperties,
  timeAndTeam: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as CSSProperties,
  timeDisplay: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'monospace',
  } as CSSProperties,
  teamBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '4px',
  } as CSSProperties,
  teamBadgeHome: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  } as CSSProperties,
  teamBadgeAway: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  } as CSSProperties,
  deleteLink: {
    fontSize: '12px',
    color: '#ef4444',
    cursor: 'pointer',
    textDecoration: 'underline',
    background: 'none',
    border: 'none',
    padding: 0,
  } as CSSProperties,
  textarea: {
    width: '100%',
    minHeight: '60px',
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '13px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  } as CSSProperties,
  commentText: {
    fontSize: '13px',
    color: '#374151',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    minHeight: '20px',
  } as CSSProperties,
  buttonContainer: {
    display: 'flex',
    gap: '8px',
  } as CSSProperties,
  homeAwayButton: {
    flex: 1,
    padding: '8px',
    border: '2px solid #e5e7eb',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s',
  } as CSSProperties,
  homeButtonActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6',
  } as CSSProperties,
  awayButtonActive: {
    backgroundColor: '#ef4444',
    color: 'white',
    borderColor: '#ef4444',
  } as CSSProperties,
};

export function RecordItem({ record, onUpdate, onDelete }: RecordItemProps) {
  const [comment, setComment] = useState(record.comment);
  const [homeAway, setHomeAway] = useState<'HOME' | 'AWAY'>(record.homeAway);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newComment = e.target.value;
    setComment(newComment);
    onUpdate({ ...record, comment: newComment });
  };

  const handleHomeAwayChange = (value: 'HOME' | 'AWAY') => {
    setHomeAway(value);
    setIsConfirmed(true);
    onUpdate({ ...record, homeAway: value });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isConfirmed) {
    // 確定後の表示
    return (
      <div style={styles.container}>
        {/* ヘッダー: 時間+チーム名と削除リンク */}
        <div style={styles.header}>
          <div style={styles.timeAndTeam}>
            <div style={styles.timeDisplay}>{formatTime(record.videoSec)}</div>
            <div
              style={{
                ...styles.teamBadge,
                ...(homeAway === 'HOME' ? styles.teamBadgeHome : styles.teamBadgeAway),
              }}
            >
              {homeAway}
            </div>
          </div>
          <button
            style={styles.deleteLink}
            onClick={onDelete}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            削除
          </button>
        </div>

        {/* コメントテキスト表示 */}
        <div style={styles.commentText}>{comment || '(コメントなし)'}</div>
      </div>
    );
  }

  // 編集中の表示
  return (
    <div style={styles.container}>
      {/* 時間表示 */}
      <div style={styles.timeDisplay}>{formatTime(record.videoSec)}</div>

      {/* コメント入力 */}
      <textarea
        style={styles.textarea}
        placeholder="コメントを入力..."
        value={comment}
        onChange={handleCommentChange}
      />

      {/* HOME/AWAYボタン */}
      <div style={styles.buttonContainer}>
        <button
          style={{
            ...styles.homeAwayButton,
            ...(homeAway === 'HOME' ? styles.homeButtonActive : {}),
          }}
          onClick={() => handleHomeAwayChange('HOME')}
          onMouseEnter={(e) => {
            if (homeAway !== 'HOME') {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }
          }}
          onMouseLeave={(e) => {
            if (homeAway !== 'HOME') {
              e.currentTarget.style.backgroundColor = 'white';
            }
          }}
        >
          HOME
        </button>
        <button
          style={{
            ...styles.homeAwayButton,
            ...(homeAway === 'AWAY' ? styles.awayButtonActive : {}),
          }}
          onClick={() => handleHomeAwayChange('AWAY')}
          onMouseEnter={(e) => {
            if (homeAway !== 'AWAY') {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }
          }}
          onMouseLeave={(e) => {
            if (homeAway !== 'AWAY') {
              e.currentTarget.style.backgroundColor = 'white';
            }
          }}
        >
          AWAY
        </button>
      </div>
    </div>
  );
}
