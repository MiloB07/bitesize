// Small animated pieces that sit on top of the map. Each is its own element
// animated with CSS transform/opacity only, so the browser can move them
// without redrawing the big map underneath.

function Sprite({ x, y, width, height, className, style, children }) {
  return (
    <div
      className={`sprite ${className}`}
      style={{
        left: x - width / 2,
        top: y - height,
        width,
        height,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function Cloud({ x, y, s, duration, delay }) {
  return (
    <Sprite
      x={x}
      y={y}
      width={220 * s}
      height={110 * s}
      className="sprite--cloud"
      style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
    >
      <svg viewBox="0 0 220 110" width="100%" height="100%" aria-hidden="true">
        {/* soft shadow on the water below */}
        <ellipse cx="120" cy="100" rx="80" ry="10" fill="rgba(70, 110, 160, 0.12)" />
        <circle cx="70" cy="55" r="30" fill="#ffffff" />
        <circle cx="110" cy="42" r="38" fill="#ffffff" />
        <circle cx="152" cy="56" r="28" fill="#ffffff" />
        <rect x="45" y="55" width="130" height="28" rx="14" fill="#ffffff" />
        <circle cx="100" cy="30" r="12" fill="#f3f8ff" />
      </svg>
    </Sprite>
  )
}

export function Wave({ x, y, s, delay }) {
  return (
    <Sprite
      x={x}
      y={y}
      width={40 * s}
      height={12 * s}
      className="sprite--wave"
      style={{ animationDelay: `${delay}s` }}
    >
      <svg viewBox="0 0 40 12" width="100%" height="100%" aria-hidden="true">
        <path
          d="M2 8 Q8 2 14 8 Q20 2 26 8 Q32 2 38 8"
          stroke="#e4f1fc"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </Sprite>
  )
}

export function Ship({ x, y, flip }) {
  return (
    <Sprite x={x} y={y} width={70} height={70} className="sprite--ship">
      <svg
        viewBox="0 0 70 70"
        width="100%"
        height="100%"
        aria-hidden="true"
        style={flip ? { transform: 'scaleX(-1)' } : undefined}
      >
        <ellipse cx="35" cy="64" rx="30" ry="4" fill="rgba(70, 110, 160, 0.18)" />
        <path d="M6 48 L64 48 Q58 62 44 62 L24 62 Q12 62 6 48 Z" fill="#b8835a" />
        <rect x="6" y="46" width="58" height="4" rx="2" fill="#cf9a6d" />
        <rect x="33" y="10" width="3" height="38" fill="#8d6446" />
        <path d="M37 12 Q56 26 37 42 Z" fill="#ffffff" />
        <path d="M32 16 Q16 28 32 40 Z" fill="#f3f7fc" />
        <polygon points="36,6 46,9 36,12" fill="#e97777" />
      </svg>
    </Sprite>
  )
}

export function Whale({ x, y, flip }) {
  return (
    <Sprite x={x} y={y} width={90} height={60} className="sprite--whale">
      <svg
        viewBox="0 0 90 60"
        width="100%"
        height="100%"
        aria-hidden="true"
        style={flip ? { transform: 'scaleX(-1)' } : undefined}
      >
        <ellipse cx="42" cy="50" rx="36" ry="6" fill="#c7e0f5" />
        <path d="M12 50 Q14 30 40 30 Q62 30 66 50 Z" fill="#7d9cc9" />
        <path d="M20 44 Q30 40 44 42" stroke="#a5bfe0" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="54" cy="41" r="2" fill="#2f3a4a" />
        <path d="M66 50 Q74 42 72 32 Q80 34 86 28 Q84 40 72 44 Z" fill="#7d9cc9" />
        {/* water spout */}
        <path d="M36 28 Q34 18 28 14 M36 28 Q38 18 44 14 M36 28 L36 12" stroke="#e4f1fc" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    </Sprite>
  )
}

export function VolcanoSmoke({ x, y, s }) {
  return (
    // Puffs rise from the crater, which sits 82 units above the volcano's base
    <Sprite x={x} y={y - 82 * s} width={80} height={120} className="sprite--smoke">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="smoke-puff"
          style={{ animationDelay: `${-i * 1.4}s` }}
        />
      ))}
    </Sprite>
  )
}

export function LighthouseGlow({ x, y, s }) {
  // Centered on the lamp room, 57 units above the lighthouse's base
  return (
    <Sprite x={x} y={y - 57 * s + 45} width={90} height={90} className="sprite--glow" />
  )
}

// Water streaming down a cliff face, with foam where it hits the sea
export function Waterfall({ x, top, bottom, width }) {
  const height = bottom - top
  return (
    <>
      <div
        className="waterfall"
        style={{ left: x - width / 2, top, width, height: height + 2 }}
      />
      <div className="waterfall-foam" style={{ left: x - 22, top: bottom - 10 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ animationDelay: `${-i * 0.5}s` }} />
        ))}
      </div>
    </>
  )
}

export function Whirlpool({ x, y }) {
  return (
    <div className="whirlpool" style={{ left: x - 70, top: y - 32 }}>
      <svg viewBox="-70 -70 140 140" width="140" height="140" aria-hidden="true">
        <circle r="66" fill="#a6cbee" />
        <circle r="46" fill="#9ac2ea" />
        <circle r="24" fill="#8cb8e4" />
        <path
          d="M0 -60 A60 60 0 0 1 58 10 M0 60 A60 60 0 0 1 -58 -10 M0 -38 A38 38 0 0 1 36 12 M0 38 A38 38 0 0 1 -36 -12 M0 -16 A16 16 0 0 1 16 4"
          stroke="#e4f1fc"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  )
}

export function Balloon({ x, y, delay }) {
  return (
    <Sprite
      x={x}
      y={y - 180}
      width={60}
      height={90}
      className="sprite--balloon"
      style={{ animationDelay: `${delay}s` }}
    >
      <svg viewBox="0 0 60 90" width="100%" height="100%" aria-hidden="true">
        <path d="M30 2 C8 2 2 22 6 36 C10 50 22 58 26 66 L34 66 C38 58 50 50 54 36 C58 22 52 2 30 2 Z" fill="#f28c8c" />
        <path d="M30 2 C22 2 18 22 20 36 C22 50 26 58 28 66 L32 66 C34 58 38 50 40 36 C42 22 38 2 30 2 Z" fill="#ffd166" />
        <path d="M30 2 C40 2 50 12 52 26" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M26 66 L24 76 M34 66 L36 76" stroke="#8d6446" strokeWidth="1.2" />
        <rect x="22" y="76" width="16" height="11" rx="2" fill="#b8835a" />
      </svg>
    </Sprite>
  )
}

export function Birds({ x, y, count, duration, delay }) {
  return (
    <div
      className="birds"
      style={{
        left: x,
        top: y,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <svg
          key={i}
          className="bird"
          viewBox="0 0 24 10"
          width="24"
          height="10"
          aria-hidden="true"
          style={{
            left: i * 20 - (i % 2) * 8,
            top: Math.abs(i - (count - 1) / 2) * 12,
            animationDelay: `${-i * 0.13}s`,
          }}
        >
          <path d="M1 8 Q6 1 12 7 Q18 1 23 8" stroke="#5a6f8f" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </svg>
      ))}
    </div>
  )
}

// A ring of foam that spreads out when an island breaks the surface
export function Splash({ x, y, size, delay }) {
  return (
    <div
      className="splash"
      style={{
        left: x - size / 2,
        top: y - size * 0.23,
        width: size,
        height: size * 0.46,
        animationDelay: `${delay}ms`,
      }}
    />
  )
}
