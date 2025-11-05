import { useState, CSSProperties } from 'react';
import { EditorView } from './EditorView';
import { JsonView } from './JsonView';
import { Period, CommentRecord, GameReview } from '@/types/game-review';

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
    gap: '8px',
  } as CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
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
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'relative',
  } as CSSProperties,
  periodTab: {
    flex: 1,
    padding: '12px',
    fontSize: '14px',
    fontWeight: '600',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s',
    position: 'relative',
  } as CSSProperties,
  periodTabActive: {
    color: '#2563eb',
  } as CSSProperties,
  periodTabInactive: {
    color: '#6b7280',
  } as CSSProperties,
  switcher: {
    display: 'inline-flex',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
    padding: '2px',
    gap: '2px',
    alignSelf: 'flex-end',
  } as CSSProperties,
  switcherButton: {
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: 'transparent',
    color: '#6b7280',
  } as CSSProperties,
  switcherButtonActive: {
    backgroundColor: 'white',
    color: '#374151',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  } as CSSProperties,
};

export function ReviewSidebar({ player, onClose }: ReviewSidebarProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1');
  const [viewMode, setViewMode] = useState<'editor' | 'json'>('editor');
  const [records, setRecords] = useState<Record<Period, CommentRecord[]>>({
    '1': [],
    '2': [],
    '3': [],
    '4': [],
  });
  const [gameInfo, setGameInfo] = useState({
    gameId: '',
    homeTeamName: '',
    awayTeamName: '',
  });

  const gameReview: GameReview = {
    ...gameInfo,
    periods: records,
  };

  const handleImport = (imported: GameReview) => {
    // periodsのデータを確実に初期化し、不要なプロパティを除外
    const cleanRecord = (record: any): CommentRecord => ({
      videoSec: record.videoSec,
      comment: record.comment,
      homeAway: record.homeAway,
      ...(record.restGameClock ? { restGameClock: record.restGameClock } : {}),
    });

    const importedPeriods: Record<Period, CommentRecord[]> = {
      '1': (imported.periods['1'] || []).map(cleanRecord),
      '2': (imported.periods['2'] || []).map(cleanRecord),
      '3': (imported.periods['3'] || []).map(cleanRecord),
      '4': (imported.periods['4'] || []).map(cleanRecord),
    };

    setRecords(importedPeriods);
    setGameInfo({
      gameId: imported.gameId || '',
      homeTeamName: imported.homeTeamName || '',
      awayTeamName: imported.awayTeamName || '',
    });
    console.log('[AVC Review] Data imported successfully', importedPeriods);
  };

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

      <div style={styles.switcher}>
        <button
          style={{
            ...styles.switcherButton,
            ...(viewMode === 'editor' ? styles.switcherButtonActive : {}),
          }}
          onClick={() => setViewMode('editor')}
        >
          📝 エディタ
        </button>
        <button
          style={{
            ...styles.switcherButton,
            ...(viewMode === 'json' ? styles.switcherButtonActive : {}),
          }}
          onClick={() => setViewMode('json')}
        >
          📋 JSON
        </button>
      </div>


      {/* クォータータブ */}
      <div style={
        {
          ...styles.tabContainer,
          ...(viewMode === 'editor' ? { display: 'flex' } : { display: 'none' }),
        }
      }>
        {(['1', '2', '3', '4'] as Period[]).map((period) => (
          <button
            key={period}
            style={{
              ...styles.periodTab,
              ...(selectedPeriod === period ? styles.periodTabActive : styles.periodTabInactive),
            }}
            onClick={() => setSelectedPeriod(period)}
            onMouseEnter={(e) => {
              if (selectedPeriod !== period) {
                e.currentTarget.style.color = '#1f2937';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedPeriod !== period) {
                e.currentTarget.style.color = '#6b7280';
              }
            }}
          >
            {period}Q
            {selectedPeriod === period && <div style={styles.tabBorder} />}
          </button>
        ))}
      </div>

      {/* コンテンツエリア */}
      <div style={styles.content}>
        {/* コンテンツ */}
        {viewMode === 'editor' ? (
          <EditorView
            player={player}
            selectedPeriod={selectedPeriod}
            records={records}
            setRecords={setRecords}
          />
        ) : (
          <JsonView gameReview={gameReview} onImport={handleImport} />
        )}
      </div>
    </div>
  );
}
