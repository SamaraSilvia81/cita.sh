export function ScribbleUnderline({ width = 200, color = '#93032E' }: { width?: number; color?: string }) {
  // Um único traço, cor cheia — antes eram dois traços sobrepostos com
  // opacidades diferentes, o que lavava a cor. Agora é uma cor só, mais forte.
  return (
    <svg width={width} height="10" viewBox={`0 0 ${width} 10`} fill="none" className="hero-underline">
      <path
        d={`M5 6 C${width * 0.12} 2, ${width * 0.22} 8, ${width * 0.32} 4 C${width * 0.42} 0, ${width * 0.52} 8, ${width * 0.62} 4 C${width * 0.72} 0, ${width * 0.82} 7, ${width * 0.97} 3`}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HandArrow({ direction = 'down', color = '#93032E' }: { direction?: 'down' | 'right' | 'up-right'; color?: string }) {
  if (direction === 'down') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ verticalAlign: 'middle' }}>
        <path d="M7 1 L7 10 M4 7 L7 10 L10 7" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (direction === 'up-right') {
    return (
      <svg width="20" height="16" viewBox="0 0 20 16" fill="none" style={{ verticalAlign: 'middle' }}>
        <path d="M2 14 C5 6, 8 2, 18 2" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M14 0 L18 2 L14 5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle' }}>
      <path d="M3 8 L13 8 M10 5 L13 8 L10 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
