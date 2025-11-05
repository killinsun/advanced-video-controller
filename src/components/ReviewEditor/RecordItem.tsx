import { useState, CSSProperties, useEffect, useRef } from 'react';
import { CommentRecord } from '@/types/game-review';

interface RecordItemProps {
  record: CommentRecord;
  onUpdate: (updated: CommentRecord) => void;
  onConfirm: (confirmed: CommentRecord) => void;
  onDelete: () => void;
  onTimeClick?: () => void;
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
  timeDisplayClickable: {
    cursor: 'pointer',
    transition: 'color 0.2s',
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
    outline: 'none',
  } as CSSProperties,
  textareaFocus: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  } as CSSProperties,
  inputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as CSSProperties,
  label: {
    fontSize: '11px',
    color: '#6b7280',
    fontWeight: '500',
  } as CSSProperties,
  input: {
    padding: '6px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: 'monospace',
    boxSizing: 'border-box',
    outline: 'none',
  } as CSSProperties,
  inputFocus: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
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
    outline: 'none',
  } as CSSProperties,
  homeAwayButtonFocus: {
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)',
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

export function RecordItem({ record, onUpdate, onConfirm, onDelete, onTimeClick }: RecordItemProps) {
  const [comment, setComment] = useState(record.comment);
  const [homeAway, setHomeAway] = useState<'HOME' | 'AWAY'>(record.homeAway);
  const [restGameClock, setRestGameClock] = useState(record.restGameClock || '');
  const [isFocused, setIsFocused] = useState(false);
  const [isClockFocused, setIsClockFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 編集中レコードが作成されたら自動フォーカス
  useEffect(() => {
    if (!onTimeClick && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [onTimeClick]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newComment = e.target.value;
    setComment(newComment);
    onUpdate({ ...record, comment: newComment, restGameClock: restGameClock || undefined });
  };

  const handleClockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // MM:SS形式のみ許可（数字とコロンのみ）
    if (/^[0-9:]*$/.test(value)) {
      setRestGameClock(value);
      onUpdate({ ...record, comment, restGameClock: value || undefined });
    }
  };

  const handleHomeAwayChange = (value: 'HOME' | 'AWAY') => {
    setHomeAway(value);
    const confirmedRecord: CommentRecord = {
      ...record,
      comment,
      homeAway: value,
      restGameClock: restGameClock || undefined,
    };
    onConfirm(confirmedRecord);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  if (onTimeClick) {
    // 確定後の表示
    return (
      <div style={styles.container}>
        {/* ヘッダー: 時間+チーム名と削除リンク */}
        <div style={styles.header}>
          <div style={styles.timeAndTeam}>
            <div
              style={{
                ...styles.timeDisplay,
                ...(onTimeClick ? styles.timeDisplayClickable : {}),
              }}
              onClick={onTimeClick}
              onMouseEnter={(e) => {
                if (onTimeClick) {
                  e.currentTarget.style.color = '#2563eb';
                }
              }}
              onMouseLeave={(e) => {
                if (onTimeClick) {
                  e.currentTarget.style.color = '#374151';
                }
              }}
            >
              {formatTime(record.videoSec)}
            </div>
            <div
              style={{
                ...styles.teamBadge,
                ...(homeAway === 'HOME' ? styles.teamBadgeHome : styles.teamBadgeAway),
              }}
            >
              {homeAway}
            </div>
            {restGameClock && (
              <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
                @{restGameClock}
              </div>
            )}
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
        ref={textareaRef}
        style={{
          ...styles.textarea,
          ...(isFocused ? styles.textareaFocus : {}),
        }}
        placeholder="コメントを入力..."
        value={comment}
        onChange={handleCommentChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {/* 残り時間入力 */}
      <div style={styles.inputWrapper}>
        <label style={styles.label}>残り時間（任意）</label>
        <input
          type="text"
          style={{
            ...styles.input,
            ...(isClockFocused ? styles.inputFocus : {}),
          }}
          placeholder="例: 08:45"
          value={restGameClock}
          onChange={handleClockChange}
          onFocus={() => setIsClockFocused(true)}
          onBlur={() => setIsClockFocused(false)}
        />
      </div>

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
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
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
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          AWAY
        </button>
      </div>
    </div>
  );
}
