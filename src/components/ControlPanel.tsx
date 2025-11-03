import type { FrameController } from '@/utils/frame-controller';

interface ControlPanelProps {
  controller: FrameController;
}

export function ControlPanel({ controller }: ControlPanelProps) {
  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    margin: '0 4px',
    backgroundColor: '#333',
    color: '#fff',
    border: '1px solid #555',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: '16px',
    marginTop: '8px',
  };

  return (
    <div style={containerStyle}>
      <button
        style={buttonStyle}
        onClick={() => controller.skip(-1)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#444';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#333';
        }}
      >
        -1
      </button>

      <button
        style={buttonStyle}
        onClick={() => controller.skip(1)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#444';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#333';
        }}
      >
        +1
      </button>
    </div>
  );
}
