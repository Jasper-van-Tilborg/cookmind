'use client';

interface ScanningAreaProps {
  width?: number;
  height?: number;
}

export default function ScanningArea({ width = 250, height = 250 }: ScanningAreaProps) {
  const cornerSize = 30;
  const cornerThickness = 4;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        pointerEvents: 'none',
      }}
    >
      {/* Scanning area frame */}
      <div
        className="relative"
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        {/* Top-left corner */}
        <div
          className="absolute top-0 left-0"
          style={{
            width: `${cornerSize}px`,
            height: `${cornerSize}px`,
            borderTop: `${cornerThickness}px solid #1F6F54`,
            borderLeft: `${cornerThickness}px solid #1F6F54`,
          }}
        />

        {/* Top-right corner */}
        <div
          className="absolute top-0 right-0"
          style={{
            width: `${cornerSize}px`,
            height: `${cornerSize}px`,
            borderTop: `${cornerThickness}px solid #1F6F54`,
            borderRight: `${cornerThickness}px solid #1F6F54`,
          }}
        />

        {/* Bottom-left corner */}
        <div
          className="absolute bottom-0 left-0"
          style={{
            width: `${cornerSize}px`,
            height: `${cornerSize}px`,
            borderBottom: `${cornerThickness}px solid #1F6F54`,
            borderLeft: `${cornerThickness}px solid #1F6F54`,
          }}
        />

        {/* Bottom-right corner */}
        <div
          className="absolute bottom-0 right-0"
          style={{
            width: `${cornerSize}px`,
            height: `${cornerSize}px`,
            borderBottom: `${cornerThickness}px solid #1F6F54`,
            borderRight: `${cornerThickness}px solid #1F6F54`,
          }}
        />
      </div>
    </div>
  );
}
