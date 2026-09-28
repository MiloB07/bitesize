import { useCallback, useMemo, useState } from 'react'
import Decoration from './Decoration.jsx'
import { WORLD_HEIGHT, WORLD_WIDTH, generateWorld } from './generateWorld.js'
import { shade } from './shapes.js'
import {
  Balloon,
  Birds,
  Cloud,
  LighthouseGlow,
  Ship,
  Splash,
  VolcanoSmoke,
  Waterfall,
  Wave,
  Whale,
  Whirlpool,
} from './Sprites.jsx'
import { usePanZoom } from './usePanZoom.js'
import './WorldMap.css'

// Islands rise out of the ocean one by one, in a random order each visit
const FIRST_ISLAND_MS = 350
const EMERGE_SPREAD_MS = 2600
const EMERGE_JITTER_MS = 150
// After an island first dips back down, its trees and buildings sprout, one
// row at a time from back to front
const SPROUT_AFTER_MS = 600
const SPROUT_ROW_GAP_MS = 110
// When names and extras (waterfalls, smoke, lamp glow) fade in
const SETTLED_MS = 900

function makeEmergeDelays(count) {
  const order = Array.from({ length: count }, (_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  const delays = new Array(count)
  order.forEach((islandIndex, rank) => {
    delays[islandIndex] = Math.round(
      FIRST_ISLAND_MS +
        (rank / Math.max(1, count - 1)) * EMERGE_SPREAD_MS +
        Math.random() * EMERGE_JITTER_MS,
    )
  })
  return delays
}

function WorldMap() {
  const world = useMemo(() => generateWorld(), [])
  const [delays] = useState(() => makeEmergeDelays(world.islands.length))
  const [seaDelays] = useState(() =>
    world.seaFeatures.map(
      () => FIRST_ISLAND_MS + Math.random() * EMERGE_SPREAD_MS,
    ),
  )
  const [hasMoved, setHasMoved] = useState(false)
  const handleFirstMove = useCallback(() => setHasMoved(true), [])
  const { viewportRef, worldRef, controlsRef } = usePanZoom({
    worldWidth: WORLD_WIDTH,
    worldHeight: WORLD_HEIGHT,
    onFirstMove: handleFirstMove,
  })

  return (
    <div
      className="world-map"
      ref={viewportRef}
      tabIndex={0}
      role="region"
      aria-label="World map. Drag, scroll, or use the arrow keys to look around; pinch or press plus and minus to zoom."
    >
      <div
        className="world-map__world"
        ref={worldRef}
        style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT }}
      >
        <svg
          className="world-map__ocean"
          width={WORLD_WIDTH}
          height={WORLD_HEIGHT}
          viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
          aria-hidden="true"
        >
          <defs>
            {/* Slightly deeper blue toward the horizon (the top) */}
            <linearGradient id="ocean-depth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a9cdef" />
              <stop offset="1" stopColor="#b8d8f4" />
            </linearGradient>
          </defs>
          <rect width={WORLD_WIDTH} height={WORLD_HEIGHT} fill="url(#ocean-depth)" />
          {world.deepPatches.map((patch, i) => (
            <ellipse
              key={i}
              cx={patch.x}
              cy={patch.y}
              rx={patch.rx}
              ry={patch.ry}
              fill="#a3c9ed"
              opacity="0.55"
            />
          ))}
        </svg>

        {world.waves.map((wave, i) => (
          <Wave key={i} {...wave} />
        ))}
        {world.whirlpools.map((whirlpool, i) => (
          <Whirlpool key={i} {...whirlpool} />
        ))}

        {/* All shallow water sits below all land, so neighbors blend */}
        {world.islands.map((island, i) => (
          <IslandLayer
            key={i}
            island={island}
            className="island--shallow"
            delay={delays[i]}
          >
            <path d={island.shallow} fill={island.shallowColor} />
          </IslandLayer>
        ))}
        {world.islands.map(
          (island, i) =>
            island.splashSize > 120 && (
              <Splash
                key={i}
                x={island.center.x}
                y={island.center.y}
                size={island.splashSize}
                delay={delays[i] + 120}
              />
            ),
        )}

        {world.seaFeatures.map((feature, i) => (
          <SeaFeature key={i} feature={feature} delay={seaDelays[i]} />
        ))}

        {world.islands.map((island, i) => (
          <Island key={i} island={island} index={i} delay={delays[i]} />
        ))}

        {world.islands.map(
          (island, i) =>
            island.name && (
              <p
                key={island.name}
                className="world-map__label"
                style={{
                  left: island.label.x,
                  top: island.label.y,
                  animationDelay: `${delays[i] + SETTLED_MS}ms`,
                }}
              >
                {island.name}
              </p>
            ),
        )}

        {world.ships.map((ship, i) => (
          <Ship key={i} {...ship} />
        ))}
        {world.whales.map((whale, i) => (
          <Whale key={i} {...whale} />
        ))}
        {world.volcano && (
          <IslandExtra delay={delays[world.volcano.island] + SETTLED_MS}>
            <VolcanoSmoke {...world.volcano} />
          </IslandExtra>
        )}
        {world.lighthouse && (
          <IslandExtra delay={delays[world.lighthouse.island] + SETTLED_MS}>
            <LighthouseGlow {...world.lighthouse} />
          </IslandExtra>
        )}
        {world.balloons.map((balloon, i) => (
          <Balloon key={i} {...balloon} />
        ))}
        {world.birds.map((flock, i) => (
          <Birds key={i} {...flock} />
        ))}
        {world.clouds.map((cloud, i) => (
          <Cloud key={i} {...cloud} />
        ))}
      </div>

      <div className="world-map__zoom">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => controlsRef.current?.zoomIn()}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => controlsRef.current?.zoomOut()}
        >
          −
        </button>
      </div>
      <Compass />
      <p className="world-map__hint" data-hidden={hasMoved}>
        Drag to explore · pinch to zoom
      </p>
    </div>
  )
}

// One island: its ground (cliffs, top, rivers, lakes) rises out of the water,
// then its trees and buildings sprout row by row
function Island({ island, index, delay }) {
  const topGradient = `island-top-${index}`
  return (
    <>
      <IslandLayer
        island={island}
        className="island--land"
        delay={delay}
        style={{ '--rise': `${island.rise}px` }}
      >
        <defs>
          <linearGradient id={topGradient} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={shade(island.topColor, 0.14)} />
            <stop offset="1" stopColor={island.topColor} />
          </linearGradient>
        </defs>

        <path
          d={island.foam}
          fill="none"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="9"
          strokeLinejoin="round"
        />
        {island.cliffs.map((band, i) => (
          <path key={i} d={band.path} fill={band.color} />
        ))}
        {island.cracks.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke={island.crackColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.55"
          />
        ))}
        {island.waterfallShapes.map(({ x, top, bottom, width }, i) => (
          <polygon
            key={i}
            points={`${x - width / 2},${top} ${x + width / 2},${top} ${x + width * 0.75},${bottom} ${x - width * 0.75},${bottom}`}
            fill="#c4e4fb"
          />
        ))}

        <path d={island.top} fill={`url(#${topGradient})`} />
        {island.land && <path d={island.land} fill={island.landColor} />}
        {/* Lit rim along the top of the cliffs */}
        <path
          d={island.top}
          fill="none"
          stroke={island.rimColor}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {island.lakeShapes.map(({ x, y, rx, ry }, i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={rx + 7} ry={ry + 5} fill={island.bankColor} />
            <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#9fd0f2" />
            <ellipse cx={x - rx * 0.25} cy={y - ry * 0.3} rx={rx * 0.4} ry={ry * 0.25} fill="#c7e6fb" />
          </g>
        ))}
        {island.riverPaths.map((d, i) => (
          <g key={i} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={d} stroke={island.bankColor} strokeWidth="19" />
            <path d={d} stroke="#93cbf0" strokeWidth="12" />
            <path d={d} stroke="#c4e4fb" strokeWidth="3" />
          </g>
        ))}
      </IslandLayer>

      {island.waterfallShapes.map((waterfall, i) => (
        <IslandExtra key={i} delay={delay + SETTLED_MS}>
          <Waterfall {...waterfall} />
        </IslandExtra>
      ))}

      {island.decorationRows.map((row, i) => (
        <IslandLayer
          key={i}
          island={island}
          className="island--sprout"
          delay={delay + SPROUT_AFTER_MS + i * SPROUT_ROW_GAP_MS}
          originY={Math.max(...row.map((d) => d.y))}
        >
          {row.map((decoration, j) => (
            <Decoration key={j} {...decoration} />
          ))}
        </IslandLayer>
      ))}
    </>
  )
}

// One layer of an island, sized to fit it and drawn in world coordinates.
// It scales around the island's center (or `originY` for sprouting rows).
function IslandLayer({ island, className, delay, originY, style, children }) {
  const { x, y, width, height } = island.bounds
  return (
    <div
      className={`island ${className}`}
      style={{
        left: x,
        top: y,
        width,
        height,
        transformOrigin: `${island.center.x - x}px ${(originY ?? island.center.y) - y}px`,
        animationDelay: `${delay}ms`,
        ...style,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`${x} ${y} ${width} ${height}`}
        aria-hidden="true"
      >
        {children}
      </svg>
    </div>
  )
}

// Fades in something that belongs to an island once the island has landed
function IslandExtra({ delay, children }) {
  return (
    <div className="island-extra" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

// Arches and wrecks out on the water rise up on their own schedule
function SeaFeature({ feature, delay }) {
  return (
    <div
      className="island island--sprout"
      style={{
        left: feature.x - 70,
        top: feature.y - 100,
        width: 140,
        height: 112,
        transformOrigin: '70px 100px',
        animationDelay: `${delay}ms`,
      }}
    >
      <svg viewBox="-70 -100 140 112" width="140" height="112" aria-hidden="true">
        <Decoration type={feature.type} x={0} y={0} s={feature.s} flip={false} />
      </svg>
    </div>
  )
}

function Compass() {
  return (
    <svg className="world-map__compass" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="rgba(255, 255, 255, 0.85)" />
      <circle cx="32" cy="32" r="24" fill="none" stroke="#d7e3f1" strokeWidth="2" />
      <polygon points="32,8 37,32 32,30 27,32" fill="#e97777" />
      <polygon points="32,56 37,32 32,34 27,32" fill="#9fb4cf" />
      <polygon points="8,32 32,27 30,32 32,37" fill="#c3d2e4" />
      <polygon points="56,32 32,27 34,32 32,37" fill="#c3d2e4" />
      <circle cx="32" cy="32" r="3" fill="#ffffff" />
    </svg>
  )
}

export default WorldMap
