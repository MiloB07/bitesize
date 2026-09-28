// Flat, pastel drawings in the same style as the duck avatar: simple shapes,
// no outlines, a lighter highlight on top. Each one is drawn with its base at
// (0, 0) so it can be sorted by y and stood on the land.

const SHADOW = 'rgba(40, 60, 50, 0.12)'

function Shadow({ rx = 10 }) {
  return <ellipse cx="0" cy="0" rx={rx} ry={rx * 0.3} fill={SHADOW} />
}

function RoundTree({ canopy, highlight, size = 12 }) {
  return (
    <>
      <Shadow rx={size * 0.85} />
      <rect x="-2.5" y="-10" width="5" height="10" rx="1.5" fill="#a57a55" />
      <circle cx="0" cy={-10 - size * 0.7} r={size} fill={canopy} />
      <circle
        cx={-size * 0.35}
        cy={-10 - size * 1.05}
        r={size * 0.38}
        fill={highlight}
      />
    </>
  )
}

function Pine({ snowy }) {
  const dark = snowy ? '#6f9f90' : '#5f9e6e'
  const light = snowy ? '#80b0a0' : '#72b27e'
  return (
    <>
      <Shadow rx={9} />
      <rect x="-2" y="-8" width="4" height="8" rx="1" fill="#9b7352" />
      <polygon points="-11,-6 11,-6 0,-26" fill={dark} />
      <polygon points="-8,-17 8,-17 0,-36" fill={light} />
      {snowy && (
        <>
          <polygon points="-4,-28 4,-28 0,-36" fill="#ffffff" />
          <polygon points="-5.5,-18 5.5,-18 0,-25" fill="#f4f9ff" />
        </>
      )}
    </>
  )
}

// Jagged, multi-peak mountain: lit on the left, in shadow on the right
function Mountain({ snowy }) {
  const body = snowy ? '#bcc7dc' : '#aaa4c3'
  const shadow = snowy ? '#9eabc8' : '#8c85ab'
  return (
    <>
      <Shadow rx={44} />
      <polygon
        points="-48,0 -34,-28 -28,-24 -14,-56 -8,-50 0,-72 8,-58 15,-62 27,-34 33,-38 48,0"
        fill={body}
      />
      <polygon
        points="0,-72 8,-58 15,-62 27,-34 33,-38 48,0 8,0 3,-24 -3,-44"
        fill={shadow}
      />
      <polygon
        points={
          snowy
            ? '-26,-32 -14,-56 -8,-50 0,-72 8,-58 15,-62 22,-44 14,-46 8,-38 2,-46 -5,-40 -12,-44 -18,-34'
            : '-12,-52 -8,-50 0,-72 8,-58 13,-60 10,-52 5,-55 0,-48 -5,-52'
        }
        fill="#ffffff"
      />
      <polygon points="-34,-28 -28,-24 -30,-14 -38,-18" fill={shade(body)} />
    </>
  )
}

// A lighter facet, so rock faces catch the light
function shade(color) {
  return color === '#bcc7dc' ? '#cdd6e7' : '#bcb7d2'
}

function Crag() {
  return (
    <>
      <Shadow rx={13} />
      <polygon points="-12,0 -10,-20 -6,-26 -2,-44 3,-30 7,-34 11,-16 13,0" fill="#aba2ad" />
      <polygon points="-2,-44 3,-30 7,-34 11,-16 13,0 2,0 1,-22" fill="#8c8394" />
      <polygon points="-10,-20 -6,-26 -5,-14" fill="#c2bac4" />
    </>
  )
}

function Palm() {
  return (
    <>
      <Shadow rx={9} />
      <path
        d="M0 0 Q5 -14 2 -30"
        stroke="#b88c5d"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <g transform="translate(2 -30)">
        <ellipse rx="13" ry="4" fill="#5fb562" transform="rotate(-25) translate(9 0)" />
        <ellipse rx="13" ry="4" fill="#6cc46c" transform="rotate(20) translate(9 0)" />
        <ellipse rx="13" ry="4" fill="#5fb562" transform="rotate(200) translate(9 0)" />
        <ellipse rx="13" ry="4" fill="#6cc46c" transform="rotate(160) translate(9 0)" />
        <ellipse rx="11" ry="3.5" fill="#79cd76" transform="rotate(-90) translate(6 0)" />
        <circle cx="-2" cy="3" r="2.4" fill="#9b6b45" />
        <circle cx="2.5" cy="3.5" r="2.4" fill="#8a5d3b" />
      </g>
    </>
  )
}

function Bush() {
  return (
    <>
      <Shadow rx={10} />
      <circle cx="-5" cy="-5" r="6" fill="#86c26b" />
      <circle cx="5" cy="-5" r="6" fill="#86c26b" />
      <circle cx="0" cy="-9" r="7" fill="#93cc77" />
      <circle cx="-2" cy="-12" r="2.5" fill="#aad990" />
    </>
  )
}

function Flowers() {
  return (
    <>
      <circle cx="-5" cy="-2" r="2.3" fill="#f7a8c4" />
      <circle cx="2" cy="-4" r="2.3" fill="#fff3a8" />
      <circle cx="6" cy="0" r="2.3" fill="#ffffff" />
      <circle cx="-1" cy="1" r="2" fill="#f7a8c4" />
    </>
  )
}

function Hill() {
  return (
    <>
      <path d="M-28 0 Q0 -30 28 0 Z" fill="#a4cf7c" />
      <path d="M-16 -8 Q-6 -18 4 -15" stroke="#bfe39c" strokeWidth="3" strokeLinecap="round" fill="none" />
    </>
  )
}

function Rock({ body = '#b5b3c2', top = '#cfcdda', cap }) {
  return (
    <>
      <Shadow rx={9} />
      <ellipse cx="0" cy="-5" rx="9" ry="6.5" fill={body} />
      <ellipse cx="-2.5" cy="-8" rx="4" ry="2.5" fill={cap ?? top} />
    </>
  )
}

function LavaRock() {
  return (
    <>
      <Rock body="#8d716b" top="#a0857e" />
      <path d="M-4 -5 L0 -8 L4 -4" stroke="#ff9a5c" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </>
  )
}

function Cactus() {
  return (
    <>
      <Shadow rx={8} />
      <rect x="-4" y="-28" width="8" height="28" rx="4" fill="#7fbf73" />
      <rect x="3" y="-17" width="8" height="4.5" rx="2.2" fill="#7fbf73" />
      <rect x="7" y="-25" width="4.5" height="12" rx="2.2" fill="#7fbf73" />
      <rect x="-11" y="-13" width="8" height="4.5" rx="2.2" fill="#7fbf73" />
      <rect x="-11.5" y="-20" width="4.5" height="11" rx="2.2" fill="#7fbf73" />
      <rect x="-1.5" y="-25" width="2" height="20" rx="1" fill="#9ad28c" />
    </>
  )
}

function Dune() {
  return (
    <>
      <path d="M-26 0 Q-8 -13 10 -3 Q19 -9 28 0 Z" fill="#e8c886" />
      <path d="M-16 -4 Q-8 -9 0 -6" stroke="#f7e2ae" strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  )
}

function Crystal() {
  return (
    <>
      <Shadow rx={10} />
      <polygon points="8,0 12,-12 16,-20 18,-10 15,0" fill="#f2a9d2" />
      <polygon points="-4,0 -7,-20 0,-36 7,-20 4,0" fill="#b894ea" />
      <polygon points="0,-36 7,-20 4,0 0,0" fill="#cdb2f2" />
      <polygon points="-14,0 -15,-10 -10,-17 -7,-9 -8,0" fill="#9fc6f2" />
    </>
  )
}

function Pond() {
  return (
    <>
      <ellipse cx="0" cy="-4" rx="22" ry="9" fill="#9fd0cb" />
      <ellipse cx="-6" cy="-6" rx="8" ry="2.5" fill="#c3e5e1" />
      <circle cx="9" cy="-3" r="3" fill="#7fbf73" />
    </>
  )
}

function Reeds() {
  return (
    <>
      {[-5, 0, 5].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 0 L${x + (i - 1) * 2} -18`} stroke="#7f9a5e" strokeWidth="1.6" strokeLinecap="round" />
          <ellipse cx={x + (i - 1) * 2} cy={-20 + (i % 2) * 3} rx="2" ry="4" fill="#a9825a" />
        </g>
      ))}
    </>
  )
}

function Pumpkin() {
  return (
    <>
      <Shadow rx={7} />
      <ellipse cx="-3" cy="-5" rx="4.5" ry="5" fill="#ee9447" />
      <ellipse cx="3" cy="-5" rx="4.5" ry="5" fill="#ee9447" />
      <ellipse cx="0" cy="-5" rx="4" ry="5.5" fill="#f5a85e" />
      <rect x="-1" y="-13" width="2" height="4" rx="1" fill="#7a9a55" />
    </>
  )
}

function Mushroom() {
  return (
    <>
      <Shadow rx={14} />
      <rect x="-5" y="-17" width="10" height="17" rx="4" fill="#f7eedc" />
      <path d="M-19 -14 Q0 -44 19 -14 Q0 -10 -19 -14 Z" fill="#ef7472" />
      <circle cx="-8" cy="-22" r="2.6" fill="#ffffff" />
      <circle cx="4" cy="-28" r="3" fill="#ffffff" />
      <circle cx="10" cy="-19" r="2" fill="#ffffff" />
    </>
  )
}

function IceChunk() {
  return (
    <>
      <polygon points="-12,0 -10,-8 4,-11 12,-6 11,0" fill="#dbeaf8" />
      <polygon points="-10,-8 4,-11 12,-6 0,-5" fill="#ffffff" />
    </>
  )
}

function Castle() {
  return (
    <>
      <Shadow rx={48} />
      {/* side towers */}
      <rect x="-44" y="-52" width="18" height="52" rx="2" fill="#e6e0ef" />
      <rect x="26" y="-52" width="18" height="52" rx="2" fill="#dcd5e8" />
      <polygon points="-47,-50 -35,-72 -23,-50" fill="#7f93cc" />
      <polygon points="23,-50 35,-72 47,-50" fill="#6f83bd" />
      {/* walls and keep */}
      <rect x="-26" y="-36" width="52" height="36" fill="#eee9f5" />
      <rect x="-13" y="-66" width="26" height="40" rx="2" fill="#e6e0ef" />
      <polygon points="-16,-64 0,-90 16,-64" fill="#e98585" />
      <path d="M0 -90 L0 -102" stroke="#8b7f9e" strokeWidth="1.6" />
      <polygon points="0,-102 11,-98 0,-94" fill="#ffd166" />
      {/* battlements */}
      {[-24, -14, 4, 14].map((x) => (
        <rect key={x} x={x} y="-41" width="7" height="6" fill="#eee9f5" />
      ))}
      {/* door and windows */}
      <path d="M-7 0 L-7 -12 Q0 -20 7 -12 L7 0 Z" fill="#8f82a4" />
      <rect x="-3" y="-56" width="6" height="9" rx="3" fill="#8f82a4" />
      <rect x="-38" y="-38" width="6" height="9" rx="3" fill="#8f82a4" />
      <rect x="32" y="-38" width="6" height="9" rx="3" fill="#8f82a4" />
    </>
  )
}

function Hut() {
  return (
    <>
      <Shadow rx={14} />
      <rect x="-11" y="-16" width="22" height="16" rx="2" fill="#efd3a6" />
      <polygon points="-15,-14 0,-30 15,-14" fill="#d4845f" />
      <rect x="-3.5" y="-9" width="7" height="9" rx="2" fill="#a26f4f" />
    </>
  )
}

function Lighthouse() {
  return (
    <>
      <Shadow rx={14} />
      <polygon points="-9,0 9,0 6,-52 -6,-52" fill="#ffffff" />
      <polygon points="-8.2,-12 8.2,-12 7.6,-22 -7.6,-22" fill="#e97777" />
      <polygon points="-7,-32 7,-32 6.5,-42 -6.5,-42" fill="#e97777" />
      <rect x="-8" y="-62" width="16" height="10" rx="2" fill="#ffe28a" />
      <polygon points="-10,-62 0,-74 10,-62" fill="#e97777" />
      <rect x="-3" y="-8" width="6" height="8" rx="2" fill="#8f82a4" />
    </>
  )
}

function Volcano() {
  return (
    <>
      <Shadow rx={74} />
      <polygon points="-72,0 72,0 26,-82 -26,-82" fill="#9c7c73" />
      <polygon points="0,-82 26,-82 72,0 20,0" fill="#886b63" />
      <ellipse cx="0" cy="-82" rx="26" ry="7" fill="#ff8f5e" />
      <ellipse cx="-4" cy="-83" rx="12" ry="3" fill="#ffc07a" />
      <path d="M-14 -80 Q-18 -62 -26 -52 Q-30 -46 -24 -44 Q-18 -50 -12 -66 Z" fill="#ff8f5e" />
      <path d="M10 -80 Q14 -68 12 -60 Q14 -56 18 -60 Q20 -70 16 -80 Z" fill="#ff9f6a" />
    </>
  )
}

function Pyramid() {
  return (
    <>
      <Shadow rx={48} />
      <polygon points="-46,0 46,0 0,-56" fill="#f1d08c" />
      <polygon points="0,-56 46,0 10,0" fill="#dcb872" />
      <path d="M-30 -18 L22 -18 M-16 -36 L10 -36" stroke="#e5c27d" strokeWidth="2" />
      <rect x="-5" y="-9" width="10" height="9" rx="2" fill="#b89458" />
    </>
  )
}

function Treasure() {
  return (
    <>
      <path d="M-11 -14 L11 6 M11 -14 L-11 6" stroke="#e05a5a" strokeWidth="5" strokeLinecap="round" />
      <g transform="translate(22 4)">
        <Shadow rx={9} />
        <rect x="-8" y="-10" width="16" height="10" rx="2" fill="#b57a4e" />
        <path d="M-8 -10 Q0 -17 8 -10 Z" fill="#c98b5c" />
        <rect x="-8" y="-9" width="16" height="2" fill="#ffd166" />
        <rect x="-1.5" y="-9" width="3" height="4" rx="1" fill="#ffd166" />
      </g>
    </>
  )
}

function Igloo() {
  return (
    <>
      <Shadow rx={20} />
      <path d="M-20 0 Q-20 -24 0 -24 Q20 -24 20 0 Z" fill="#ffffff" />
      <path d="M-18 -9 L18 -9 M-12 -18 L12 -18 M-6 -24 L-8 -9 M8 -24 L6 -9" stroke="#dbe8f5" strokeWidth="1.5" />
      <path d="M-6 0 L-6 -6 Q0 -12 6 -6 L6 0 Z" fill="#9fb4cf" />
    </>
  )
}

function Ruins() {
  return (
    <>
      <Shadow rx={34} />
      <rect x="-28" y="-40" width="10" height="40" rx="2" fill="#d8d2c2" />
      <rect x="-10" y="-26" width="10" height="26" rx="2" fill="#cfc8b6" />
      <rect x="8" y="-34" width="10" height="34" rx="2" fill="#d8d2c2" />
      <rect x="-32" y="-46" width="54" height="7" rx="2" fill="#e2dccd" transform="rotate(-6 -5 -42)" />
      <rect x="18" y="-6" width="18" height="6" rx="2" fill="#cfc8b6" transform="rotate(12 27 -3)" />
      <path d="M-26 -30 Q-20 -24 -24 -14" stroke="#7fbf73" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  )
}

function StepTemple() {
  const tiers = [
    [-44, 14],
    [-34, 13],
    [-24, 12],
    [-15, 11],
  ]
  let y = 0
  return (
    <>
      <Shadow rx={50} />
      {tiers.map(([half, h]) => {
        const top = y - h
        const tier = (
          <g key={half}>
            <rect x={half} y={top} width={-half * 2} height={h} fill="#d9cfb6" />
            <rect x={-half * 0.25} y={top} width={-half * 1.25} height={h} fill="#c2b698" />
            <rect x={half} y={top} width={-half * 2} height="2.5" fill="#e8e0cb" />
          </g>
        )
        y = top
        return tier
      })}
      {/* stairs up the middle */}
      <polygon points="-9,0 9,0 5,-50 -5,-50" fill="#ebe4d2" />
      {[-8, -18, -28, -38].map((sy) => (
        <rect key={sy} x="-7" y={sy} width="14" height="1.6" fill="#d3c8ae" />
      ))}
      {/* shrine on top */}
      <rect x="-11" y="-66" width="22" height="16" fill="#d0c4a6" />
      <rect x="-4" y="-61" width="8" height="11" rx="1" fill="#6f6a60" />
      <rect x="-13" y="-69" width="26" height="4" fill="#e3dac4" />
      {/* moss */}
      <circle cx="-38" cy="-4" r="4" fill="#7fbf73" />
      <circle cx="30" cy="-17" r="3.5" fill="#7fbf73" />
      <circle cx="-20" cy="-40" r="3" fill="#8fcc80" />
    </>
  )
}

function GreekTemple() {
  const columns = [-30, -18, -6, 6, 18, 30]
  return (
    <>
      <Shadow rx={46} />
      <rect x="-42" y="-6" width="84" height="6" fill="#e4ddcf" />
      <rect x="-38" y="-11" width="76" height="5" fill="#eee8dc" />
      {columns.map((x) => (
        <g key={x}>
          <rect x={x - 3} y="-42" width="6" height="31" fill="#f8f4eb" />
          <rect x={x + 1} y="-42" width="2" height="31" fill="#e2dccd" />
        </g>
      ))}
      <rect x="-40" y="-48" width="80" height="6" fill="#ebe4d6" />
      <polygon points="-43,-48 0,-64 43,-48" fill="#f3eee4" />
      <polygon points="0,-64 43,-48 0,-48" fill="#e3dccd" />
      <circle cx="0" cy="-54" r="3" fill="#8fb3d9" />
    </>
  )
}

function Pagoda() {
  const tiers = [
    { w: 26, y: 0, h: 16 },
    { w: 20, y: -26, h: 14 },
    { w: 14, y: -50, h: 13 },
  ]
  return (
    <>
      <Shadow rx={30} />
      {tiers.map(({ w, y, h }) => (
        <g key={y}>
          <rect x={-w / 2} y={y - h} width={w} height={h} fill="#f3e6cf" />
          <rect x={w / 6} y={y - h} width={w / 3} height={h} fill="#e3d2b6" />
          <rect x="-3" y={y - h + 3} width="6" height={h - 3} fill="#b65f5a" />
          <path
            d={`M${-w / 2 - 12} ${y - h + 2} Q${-w / 2 - 4} ${y - h - 2} ${-w / 2} ${y - h - 8} L${w / 2} ${y - h - 8} Q${w / 2 + 4} ${y - h - 2} ${w / 2 + 12} ${y - h + 2} Z`}
            fill="#d96b6b"
          />
          <path
            d={`M${w / 4} ${y - h - 8} L${w / 2} ${y - h - 8} Q${w / 2 + 4} ${y - h - 2} ${w / 2 + 12} ${y - h + 2} L${w / 4} ${y - h + 2} Z`}
            fill="#bf5758"
          />
        </g>
      ))}
      <rect x="-1.2" y="-86" width="2.4" height="16" fill="#8a5d4a" />
      <circle cx="0" cy="-87" r="2.6" fill="#ffd166" />
    </>
  )
}

function Bamboo() {
  const stalks = [
    [-6, 42],
    [0, 50],
    [6, 38],
    [11, 30],
  ]
  return (
    <>
      <Shadow rx={12} />
      {stalks.map(([x, h]) => (
        <g key={x}>
          <rect x={x - 1.6} y={-h} width="3.2" height={h} rx="1.4" fill="#7cc47a" />
          {[0.3, 0.55, 0.8].map((t) => (
            <rect key={t} x={x - 2} y={-h * t} width="4" height="1.3" fill="#5fa65f" />
          ))}
          <ellipse cx={x + 5} cy={-h + 4} rx="6" ry="2" fill="#8fd08a" transform={`rotate(-25 ${x + 5} ${-h + 4})`} />
          <ellipse cx={x - 4} cy={-h * 0.6} rx="5" ry="1.8" fill="#8fd08a" transform={`rotate(25 ${x - 4} ${-h * 0.6})`} />
        </g>
      ))}
    </>
  )
}

function GiantTree() {
  return (
    <>
      <Shadow rx={70} />
      {/* roots and trunk */}
      <path
        d="M-34 0 Q-18 -6 -14 -30 L-12 -90 L12 -90 L14 -30 Q18 -6 36 0 Q16 -2 8 -8 L0 0 L-8 -8 Q-16 -2 -34 0 Z"
        fill="#a07550"
      />
      <path d="M2 -88 L12 -90 L14 -30 Q18 -6 36 0 Q16 -2 8 -8 L4 -40 Z" fill="#8a6344" />
      {/* canopy */}
      <circle cx="-38" cy="-118" r="36" fill="#5f9f58" />
      <circle cx="38" cy="-120" r="38" fill="#548f50" />
      <circle cx="0" cy="-150" r="46" fill="#6aae62" />
      <circle cx="-8" cy="-104" r="34" fill="#6aae62" />
      <circle cx="-20" cy="-164" r="15" fill="#86c47a" />
      <circle cx="-48" cy="-130" r="11" fill="#7ab96f" />
      <circle cx="24" cy="-150" r="9" fill="#7ab96f" />
      {/* glowing fruit */}
      <circle cx="18" cy="-112" r="3.5" fill="#ffd166" />
      <circle cx="-26" cy="-140" r="3" fill="#ffd166" />
      <circle cx="40" cy="-132" r="3" fill="#ffd166" />
    </>
  )
}

function StoneCircle() {
  // Stones around a flattened ring; back ones drawn first so front ones overlap
  const stones = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2
    return { x: Math.cos(angle) * 30, y: Math.sin(angle) * 12, back: Math.sin(angle) < 0 }
  }).sort((a, b) => a.y - b.y)
  return (
    <>
      <ellipse cx="0" cy="0" rx="40" ry="16" fill="rgba(40, 60, 50, 0.1)" />
      {stones.map(({ x, y }) => (
        <g key={`${x}-${y}`} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
          <rect x="-4.5" y="-20" width="9" height="20" rx="2" fill="#b9b6c2" />
          <rect x="0.5" y="-20" width="4" height="20" rx="1.5" fill="#a19eac" />
        </g>
      ))}
      <rect x="-7" y="-4" width="14" height="4" rx="1.5" fill="#c9c6d1" />
    </>
  )
}

function Windmill() {
  return (
    <>
      <Shadow rx={16} />
      <polygon points="-11,0 11,0 7,-42 -7,-42" fill="#f2e2c4" />
      <polygon points="2,0 11,0 7,-42 2,-42" fill="#e2cfab" />
      <polygon points="-10,-41 0,-54 10,-41" fill="#c97b5b" />
      <rect x="-3" y="-10" width="6" height="10" rx="2" fill="#a26f4f" />
      <g transform="translate(0 -44)">
        <rect x="-1.5" y="-30" width="3" height="60" fill="#8d6446" transform="rotate(20)" />
        <rect x="-1.5" y="-30" width="3" height="60" fill="#8d6446" transform="rotate(110)" />
        <rect x="1.5" y="-30" width="7" height="24" fill="#ffffff" transform="rotate(20)" />
        <rect x="1.5" y="-30" width="7" height="24" fill="#f3f7fc" transform="rotate(110)" />
        <rect x="1.5" y="-30" width="7" height="24" fill="#ffffff" transform="rotate(200)" />
        <rect x="1.5" y="-30" width="7" height="24" fill="#f3f7fc" transform="rotate(290)" />
        <circle r="3" fill="#8d6446" />
      </g>
    </>
  )
}

function Obelisk() {
  return (
    <>
      <Shadow rx={12} />
      <rect x="-10" y="-6" width="20" height="6" fill="#e0c486" />
      <polygon points="-6,-6 6,-6 4,-66 -4,-66" fill="#f0d496" />
      <polygon points="1,-6 6,-6 4,-66 1,-66" fill="#d8b877" />
      <polygon points="-4,-66 4,-66 0,-74" fill="#ffd166" />
    </>
  )
}

// On the open water: a rock arch with a grassy top, foam at its feet
function SeaArch() {
  return (
    <>
      <ellipse cx="0" cy="0" rx="50" ry="8" fill="#e6f2fc" opacity="0.8" />
      <path
        d="M-44 0 L-46 -38 Q-44 -74 0 -76 Q44 -74 46 -38 L44 0 L26 0 L26 -32 Q24 -54 0 -54 Q-24 -54 -26 -32 L-26 0 Z"
        fill="#a79da8"
      />
      <path d="M26 0 L26 -32 Q24 -54 8 -54 Q30 -60 38 -40 L44 0 Z" fill="#8a8092" />
      <path d="M-46 -40 Q-44 -80 0 -80 Q44 -80 46 -40 Q40 -70 0 -72 Q-40 -70 -46 -40 Z" fill="#a9d88d" />
      <path d="M-42 -20 L-38 -10 M34 -26 L37 -14" stroke="#7d7385" strokeWidth="1.5" />
    </>
  )
}

function Shipwreck() {
  return (
    <>
      <ellipse cx="0" cy="0" rx="42" ry="7" fill="#e6f2fc" opacity="0.7" />
      <g transform="rotate(-14)">
        <path d="M-36 -2 L30 -2 Q24 10 10 10 L-22 10 Q-32 10 -36 -2 Z" fill="#9c7353" />
        <rect x="-36" y="-5" width="66" height="4" rx="2" fill="#b58a63" />
        <rect x="-6" y="-44" width="3" height="40" fill="#7d5a40" />
        <path d="M-3 -40 L14 -30 L-3 -22 Z" fill="#e8e2d6" />
        <rect x="14" y="-24" width="3" height="20" fill="#7d5a40" transform="rotate(30 15 -14)" />
      </g>
    </>
  )
}

const DRAWINGS = {
  tree: () => <RoundTree canopy="#78b862" highlight="#93cc78" />,
  autumnTree: () => <RoundTree canopy="#f0a55a" highlight="#f7c381" />,
  jungleTree: () => <RoundTree canopy="#5aa95f" highlight="#79c47a" size={14} />,
  swampTree: () => <RoundTree canopy="#869f6c" highlight="#9db583" size={11} />,
  pine: () => <Pine />,
  snowPine: () => <Pine snowy />,
  mountain: () => <Mountain />,
  snowMountain: () => <Mountain snowy />,
  palm: Palm,
  bush: Bush,
  flowers: Flowers,
  hill: Hill,
  rock: () => <Rock />,
  snowRock: () => <Rock cap="#ffffff" />,
  lavaRock: LavaRock,
  cactus: Cactus,
  dune: Dune,
  crystal: Crystal,
  pond: Pond,
  reeds: Reeds,
  pumpkin: Pumpkin,
  mushroom: Mushroom,
  iceChunk: IceChunk,
  castle: Castle,
  hut: Hut,
  lighthouse: Lighthouse,
  volcano: Volcano,
  pyramid: Pyramid,
  treasure: Treasure,
  igloo: Igloo,
  ruins: Ruins,
  crag: Crag,
  stepTemple: StepTemple,
  greekTemple: GreekTemple,
  pagoda: Pagoda,
  bamboo: Bamboo,
  giantTree: GiantTree,
  stoneCircle: StoneCircle,
  windmill: Windmill,
  obelisk: Obelisk,
  seaArch: SeaArch,
  shipwreck: Shipwreck,
}

function Decoration({ type, x, y, s, flip }) {
  const Drawing = DRAWINGS[type]
  const sx = flip ? -s : s
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sx.toFixed(3)} ${s.toFixed(3)})`}>
      <Drawing />
    </g>
  )
}

export default Decoration
