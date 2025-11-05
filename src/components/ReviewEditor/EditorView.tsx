import { useState, CSSProperties, Dispatch, SetStateAction } from 'react';
import { RecordItem } from './RecordItem';
import { Period, CommentRecord } from '@/types/game-review';

interface EditorViewProps {
  player: any; // Video.js player
  records: Record<Period, CommentRecord[]>;
  setRecords: Dispatch<SetStateAction<Record<Period, CommentRecord[]>>>;
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
    flexDirection: 'column-reverse', // 下から上に積み上げる
    gap: '8px',
  } as CSSProperties,
  emptyState: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: '32px 16px',
    fontSize: '14px',
  } as CSSProperties,
};

interface EditingRecord extends CommentRecord {
  isConfirmed: boolean;
}

export function EditorView({ player, records, setRecords }: EditorViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1');
  const [editingRecords, setEditingRecords] = useState<EditingRecord[]>([]);

  const captureTime = () => {
    if (!player) {
      console.error('[AVC Review] Player not available');
      return;
    }

    const currentTime = player.currentTime();
    const newRecord: EditingRecord = {
      videoSec: Math.floor(currentTime),
      comment: '',
      homeAway: 'HOME',
      isConfirmed: false,
    };

    setEditingRecords((prev) => [...prev, newRecord]);
    console.log(`[AVC Review] Time captured: ${currentTime}s in ${selectedPeriod}Q`);
  };

  const updateEditingRecord = (index: number, updated: CommentRecord) => {
    setEditingRecords((prev) =>
      prev.map((r, i) => (i === index ? { ...updated, isConfirmed: r.isConfirmed } : r))
    );
  };

  const confirmRecord = (index: number, record: CommentRecord) => {
    // 確定済みrecordsに追加
    setRecords((prev) => ({
      ...prev,
      [selectedPeriod]: [...prev[selectedPeriod], record],
    }));

    // 編集中リストから削除
    setEditingRecords((prev) => prev.filter((_, i) => i !== index));
    console.log(`[AVC Review] Record confirmed in ${selectedPeriod}Q`);
  };

  const deleteEditingRecord = (index: number) => {
    setEditingRecords((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteConfirmedRecord = (index: number) => {
    setRecords((prev) => ({
      ...prev,
      [selectedPeriod]: prev[selectedPeriod].filter((_, i) => i !== index),
    }));
  };

  const confirmedRecords = records[selectedPeriod];
  const allRecords = [...editingRecords, ...confirmedRecords];

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
        {allRecords.length === 0 ? (
          <div style={styles.emptyState}>
            まだ記録がありません
            <br />
            「時間を記録」ボタンで追加できます
          </div>
        ) : (
          <>
            {/* 確定済みレコード */}
            {confirmedRecords.map((record, index) => (
              <RecordItem
                key={`confirmed-${index}`}
                record={record}
                isConfirmed={true}
                onUpdate={() => {}} // 確定済みは更新不可
                onConfirm={() => {}} // 確定済みは再確定不可
                onDelete={() => deleteConfirmedRecord(index)}
              />
            ))}
            {/* 編集中レコード */}
            {editingRecords.map((record, index) => (
              <RecordItem
                key={`editing-${index}`}
                record={record}
                isConfirmed={false}
                onUpdate={(updated) => updateEditingRecord(index, updated)}
                onConfirm={(confirmed) => confirmRecord(index, confirmed)}
                onDelete={() => deleteEditingRecord(index)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
