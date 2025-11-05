import { useState, CSSProperties, Dispatch, SetStateAction } from 'react';
import { RecordItem } from './RecordItem';
import { Period, CommentRecord } from '@/types/game-review';

interface EditorViewProps {
  player: any; // Video.js player
  selectedPeriod: Period;
  records: Record<Period, CommentRecord[]>;
  setRecords: Dispatch<SetStateAction<Record<Period, CommentRecord[]>>>;
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
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

export function EditorView({ player, selectedPeriod, records, setRecords }: EditorViewProps) {
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

  const handleTimeClick = (videoSec: number) => {
    if (player) {
      player.currentTime(videoSec);
      console.log(`[AVC Review] Seeked to ${videoSec}s`);
    }
  };

  const confirmedRecords = records[selectedPeriod];
  const allRecords = [...editingRecords, ...confirmedRecords];

  return (
    <div style={styles.container}>
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
                onUpdate={() => {}} // 確定済みは更新不可
                onConfirm={() => {}} // 確定済みは再確定不可
                onDelete={() => deleteConfirmedRecord(index)}
                onTimeClick={() => handleTimeClick(record.videoSec)}
              />
            ))}
            {/* 編集中レコード */}
            {editingRecords.map((record, index) => (
              <RecordItem
                key={`editing-${index}`}
                record={record}
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
