import { CSSProperties } from 'react';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as CSSProperties,
  placeholder: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '32px 0',
  } as CSSProperties,
  title: {
    fontSize: '14px',
    margin: 0,
  } as CSSProperties,
  subtitle: {
    fontSize: '12px',
    marginTop: '8px',
  } as CSSProperties,
};

export function EditorView() {
  return (
    <div style={styles.container}>
      <div style={styles.placeholder}>
        <p style={styles.title}>エディタビュー</p>
        <p style={styles.subtitle}>時間記録とメモ機能は次のフェーズで実装します</p>
      </div>
    </div>
  );
}
