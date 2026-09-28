import {
  GROUND_HEIGHT,
  GROUND_WIDTH,
  GROUND_Y,
  HEIGHT_Y,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  project,
} from './projection.js'
import { createRandom, pickWeighted, randomBetween } from './random.js'
import {
  createLandShape,
  extrusionPath,
  polygonPath,
  shade,
  smoothPath,
} from './shapes.js'

export { WORLD_HEIGHT, WORLD_WIDTH }

const DEFAULT_SHALLOW = '#cfe6f8'
// Makes every cliff taller or shorter at once
const CLIFF_SCALE = 1.8

const ROCK = ['#bdb2b5', '#a0959e', '#827889']
const SANDSTONE = ['#ecca94', '#d5aa7a', '#b98a6c']

// Each biome sets its colors, how tall its cliffs are, and what gets
// scattered across it. `density` is decorations per 10,000 sq px of land.
// `cliff` is the rock from the top band down; `beach` is how wide the sand
// rim is (0 means cliffs straight up from the water, no sand on top).
const BIOMES = {
  grassland: {
    land: '#b8dc8e',
    cliff: ROCK,
    height: 44,
    beach: 0,
    scatter: [['bush', 3], ['tree', 3], ['flowers', 3], ['hill', 1], ['crag', 0.3]],
    density: 1.8,
  },
  forest: {
    land: '#a5d484',
    cliff: ROCK,
    height: 44,
    beach: 0,
    scatter: [['tree', 6], ['pine', 3], ['bush', 1]],
    density: 3,
  },
  desert: {
    land: '#f3d99c',
    cliff: SANDSTONE,
    height: 34,
    beach: 0,
    scatter: [['dune', 5], ['cactus', 2], ['rock', 1], ['crag', 0.4]],
    density: 1,
  },
  snow: {
    land: '#eef4fb',
    cliff: ['#d7e2ef', '#b6c4d9', '#97a6c1'],
    height: 60,
    beach: 0,
    shallow: '#d9ecfa',
    scatter: [['snowPine', 5], ['snowRock', 1]],
    density: 1.7,
  },
  volcanic: {
    land: '#c7a497',
    cliff: ['#9b817a', '#7b6566', '#5f4d55'],
    height: 64,
    beach: 0,
    scatter: [['rock', 2], ['lavaRock', 2], ['crag', 1]],
    density: 1,
  },
  jungle: {
    land: '#8fd08a',
    cliff: ['#a9a58f', '#8b8878', '#6f6e66'],
    height: 40,
    beach: 0,
    scatter: [['jungleTree', 6], ['palm', 3], ['bush', 2]],
    density: 3.2,
  },
  crystal: {
    land: '#dccdf2',
    cliff: ['#cbb8e7', '#ad97d6', '#907cc2'],
    height: 52,
    beach: 0,
    scatter: [['crystal', 4], ['flowers', 1]],
    density: 1.5,
  },
  swamp: {
    land: '#a9c79c',
    cliff: ['#909d7d', '#77846b', '#626e5b'],
    height: 14,
    beach: 0,
    scatter: [['reeds', 4], ['pond', 2], ['swampTree', 3]],
    density: 1.8,
  },
  autumn: {
    // Olive-gold, so autumn fields don't read as beach sand
    land: '#d4cf8b',
    cliff: ROCK,
    height: 40,
    beach: 0,
    scatter: [['autumnTree', 6], ['pumpkin', 1], ['bush', 1]],
    density: 2.2,
  },
  alpine: {
    land: '#c3dca4',
    cliff: ['#b3aab5', '#948aa0', '#776e88'],
    height: 84,
    beach: 0,
    scatter: [['mountain', 3], ['pine', 3], ['crag', 2]],
    density: 1.2,
  },
  bamboo: {
    land: '#a9d9a0',
    cliff: ['#b2b4a4', '#93978a', '#777d73'],
    height: 56,
    beach: 0,
    scatter: [['bamboo', 5], ['bush', 2], ['pine', 1]],
    density: 2.4,
  },
  tropical: {
    land: '#b6e08e',
    sand: '#f8e6b3',
    cliff: ['#f0d6a0', '#dcbc88', '#c4a077'],
    height: 12,
    beach: 40,
    scatter: [['palm', 3], ['bush', 1]],
    density: 1.8,
  },
  rocky: {
    land: '#c8c9d3',
    cliff: ['#b3b0bd', '#96929f', '#7a7686'],
    height: 46,
    beach: 0,
    scatter: [['rock', 1], ['crag', 1]],
    density: 1.4,
  },
  stack: {
    land: '#b8dc8e',
    cliff: ['#b7aeb2', '#9a8f98', '#7d7385'],
    height: 150,
    beach: 0,
    scatter: [['bush', 1]],
    density: 2,
  },
  ice: {
    land: '#f5faff',
    cliff: ['#e6f1fd', '#cbe0f5', '#b0cbe9'],
    height: 20,
    beach: 0,
    scatter: [['iceChunk', 1]],
    density: 0.8,
  },
  mushroom: {
    land: '#c6e3a0',
    cliff: ['#c3aeb8', '#a791a1', '#8b778a'],
    height: 40,
    beach: 0,
    scatter: [['mushroom', 4], ['flowers', 2]],
    density: 1.5,
  },
}

// How far above its base each kind of decoration reaches, for sizing layers
const DECORATION_HEIGHT = {
  mountain: 80,
  snowMountain: 80,
  castle: 110,
  giantTree: 190,
  pagoda: 110,
  lighthouse: 80,
  volcano: 100,
  greekTemple: 70,
  stepTemple: 70,
  windmill: 80,
  obelisk: 80,
}

// The hand-placed landmasses, in ground coordinates. `zones` add clusters
// (mountain ranges, forests), `landmarks` are one-off buildings (offsets from
// the center), `rivers` and `lakes` are how many of each to try for.
const LANDMASSES = [
  {
    name: 'Evergreen Reach',
    biome: 'grassland',
    cx: 2250, cy: 2450, r: 600, sx: 1.45, sy: 1.05, rot: -0.12,
    rivers: 2, lakes: 2,
    zones: [
      { dx: 430, dy: -300, r: 240, count: 10, types: [['mountain', 3], ['crag', 1]] },
      { dx: -520, dy: 170, r: 280, count: 80, types: [['tree', 3], ['pine', 2]] },
    ],
    landmarks: [
      { type: 'castle', dx: -30, dy: -40, s: 1.4 },
      { type: 'windmill', dx: 230, dy: 240 },
      { type: 'hut', dx: -170, dy: 280 },
      { type: 'hut', dx: -110, dy: 320 },
      { type: 'hut', dx: -235, dy: 330 },
      { type: 'stoneCircle', dx: 620, dy: 160 },
    ],
  },
  {
    name: 'Sunscorch Dunes',
    biome: 'desert',
    cx: 5400, cy: 2700, r: 560, sx: 1.3, sy: 1.05, rot: 0.15,
    zones: [
      { dx: -260, dy: 200, r: 90, count: 8, types: [['palm', 1]] },
      { dx: -255, dy: 215, r: 14, count: 1, types: [['pond', 1]] },
    ],
    landmarks: [
      { type: 'pyramid', dx: 80, dy: -80, s: 1.6 },
      { type: 'pyramid', dx: 240, dy: 10, s: 1.05 },
      { type: 'obelisk', dx: -60, dy: -10 },
    ],
  },
  {
    name: 'Frostpeak',
    biome: 'snow',
    cx: 2600, cy: 620, r: 420, sx: 1.7, sy: 0.75, rot: 0.05,
    zones: [
      { dx: 200, dy: -40, r: 200, count: 8, types: [['snowMountain', 1]] },
    ],
    landmarks: [
      { type: 'igloo', dx: -320, dy: 50 },
      { type: 'igloo', dx: -240, dy: 90, s: 0.8 },
    ],
  },
  {
    name: 'Emberpeak',
    biome: 'volcanic',
    cx: 6300, cy: 800, r: 300, sx: 1.1, sy: 1, rot: 0,
    landmarks: [{ type: 'volcano', dx: 0, dy: 50, s: 1.6 }],
  },
  {
    name: 'Verdant Tangle',
    biome: 'jungle',
    cx: 2300, cy: 4450, r: 480, sx: 1.4, sy: 0.85, rot: 0.08,
    rivers: 2, lakes: 1,
    landmarks: [
      { type: 'stepTemple', dx: 90, dy: -30, s: 1.5 },
      { type: 'ruins', dx: -300, dy: 40, s: 1.1 },
    ],
  },
  {
    name: 'Glimmer Isle',
    biome: 'crystal',
    cx: 700, cy: 4300, r: 300, sx: 1.15, sy: 1, rot: 0.3,
  },
  {
    name: 'Murkmire',
    biome: 'swamp',
    cx: 5900, cy: 4400, r: 380, sx: 1.3, sy: 0.9, rot: -0.1,
  },
  {
    name: 'Amberleaf',
    biome: 'autumn',
    cx: 800, cy: 750, r: 340, sx: 1.2, sy: 1, rot: 0.2,
    rivers: 1,
    landmarks: [
      { type: 'hut', dx: 40, dy: 30 },
      { type: 'windmill', dx: -120, dy: -60, s: 0.9 },
    ],
  },
  {
    name: 'Craggy Spires',
    biome: 'alpine',
    cx: 4050, cy: 1400, r: 300, sx: 1.2, sy: 1, rot: 0.4,
    rivers: 1,
    zones: [{ dx: 0, dy: -20, r: 150, count: 6, types: [['mountain', 2], ['crag', 1]] }],
  },
  {
    name: 'Jade Terraces',
    biome: 'bamboo',
    cx: 3800, cy: 4000, r: 260, sx: 1.2, sy: 1, rot: -0.3,
    rivers: 1,
    landmarks: [{ type: 'pagoda', dx: 20, dy: -20, s: 1.3 }],
  },
  {
    name: 'Olympa',
    biome: 'rocky',
    cx: 4700, cy: 4700, r: 200, sx: 1.1, sy: 0.9,
    landmarks: [{ type: 'greekTemple', dx: 0, dy: 0, s: 1.4 }],
  },
  {
    name: 'Whisperwood',
    biome: 'forest',
    cx: 6750, cy: 3500, r: 190, sx: 1, sy: 1.2,
    landmarks: [{ type: 'giantTree', dx: 0, dy: 10, s: 1.1 }],
  },
  {
    name: 'Stonehollow',
    biome: 'grassland',
    cx: 6350, cy: 1750, r: 150,
    landmarks: [{ type: 'stoneCircle', dx: 0, dy: 0, s: 1.2 }],
  },
  // Coral Keys: a cluster, named on its southernmost island so the label
  // sits below the group
  { biome: 'tropical', cx: 5000, cy: 1300, r: 120 },
  { biome: 'tropical', cx: 5200, cy: 1440, r: 95 },
  { name: 'Coral Keys', biome: 'tropical', cx: 4900, cy: 1520, r: 80 },
  { biome: 'tropical', cx: 5250, cy: 1210, r: 70 },
  {
    name: 'Lighthouse Rock',
    biome: 'rocky',
    cx: 6900, cy: 2300, r: 100,
    landmarks: [{ type: 'lighthouse', dx: 0, dy: 10, s: 1.3 }],
  },
  { biome: 'stack', cx: 6760, cy: 2080, r: 24 },
  { biome: 'stack', cx: 7030, cy: 2540, r: 20 },
  { biome: 'stack', cx: 6680, cy: 2580, r: 28 },
  {
    name: 'Lost Cay',
    biome: 'tropical',
    cx: 1150, cy: 3550, r: 90,
    landmarks: [{ type: 'treasure', dx: 5, dy: 5 }],
  },
  { name: 'Drift Floes', biome: 'ice', cx: 4720, cy: 330, r: 90, sx: 1.3 },
  { biome: 'ice', cx: 4930, cy: 420, r: 60, sx: 1.2 },
  { biome: 'ice', cx: 5080, cy: 290, r: 48 },
  { biome: 'ice', cx: 4520, cy: 470, r: 40 },
  {
    name: 'Toadstool Isle',
    biome: 'mushroom',
    cx: 380, cy: 2450, r: 240, sx: 0.9, sy: 1.2,
  },
  { name: 'Pebblebrook', biome: 'grassland', cx: 1700, cy: 1250, r: 160 },
  { name: 'Palmrest', biome: 'tropical', cx: 4600, cy: 3800, r: 130 },
  { name: 'Gull Rock', biome: 'rocky', cx: 3350, cy: 1750, r: 90 },
  { biome: 'stack', cx: 3230, cy: 1620, r: 22 },
  { name: 'Sable Key', biome: 'tropical', cx: 3400, cy: 3300, r: 110 },
]

// Things out on the open water, in ground coordinates
const SEA_FEATURES = [
  { type: 'seaArch', x: 3480, y: 2050, s: 1.3 },
  { type: 'seaArch', x: 1500, y: 3950, s: 1 },
  { type: 'shipwreck', x: 1350, y: 3380, s: 1.2 },
  { type: 'shipwreck', x: 6150, y: 3300, s: 1 },
]
const WHIRLPOOLS = [{ x: 3950, y: 3050 }, { x: 900, y: 1800 }]
const SHIPS = [
  { x: 3500, y: 3700 },
  { x: 1300, y: 3000, flip: true },
  { x: 6150, y: 1650 },
  { x: 3300, y: 1100, flip: true },
]
const WHALES = [
  { x: 4450, y: 4950 },
  { x: 500, y: 1650, flip: true },
  { x: 6900, y: 4800 },
]

export function generateWorld(seed = 11) {
  const random = createRandom(seed)
  const islands = []
  const placed = []

  function isFree(x, y, radius) {
    return placed.every((p) => Math.hypot(p.x - x, p.y - y) > p.radius + radius)
  }

  function addIsland(spec) {
    const biome = BIOMES[spec.biome]
    const shape = createLandShape(random, {
      ...spec,
      rough: spec.biome === 'tropical' || spec.biome === 'ice' ? 0.6 : 1,
    })
    const radius = spec.r * Math.min(spec.sx ?? 1, spec.sy ?? 1)
    const height =
      biome.height *
      (spec.biome === 'stack' ? 1.3 : CLIFF_SCALE) *
      randomBetween(random, 0.85, 1.15) *
      (spec.r < 40 && spec.biome !== 'stack' ? 0.6 : 1)
    const landScale = biome.beach
      ? Math.max(0.55, 1 - biome.beach / radius)
      : 1
    const shallowScale = Math.min(1.7, 1 + 60 / radius)
    const island = {
      name: spec.name,
      biome: spec.biome,
      shape,
      height,
      landScale,
      shallowScale,
      decorations: [],
      rivers: [],
      lakes: [],
      waterfalls: [],
    }
    islands.push(island)
    return island
  }

  // Scatters decorations over the island (or one zone of it)
  function scatter(island, { count, types, zone }) {
    const { shape, landScale } = island
    const reach = zone ? zone.r : shape.extent
    const centerX = zone ? shape.cx + zone.dx : shape.cx
    const centerY = zone ? shape.cy + zone.dy : shape.cy
    let made = 0
    for (let attempt = 0; attempt < count * 25 && made < count; attempt++) {
      const angle = random() * Math.PI * 2
      const dist = Math.sqrt(random()) * reach
      const x = centerX + Math.cos(angle) * dist
      const y = centerY + Math.sin(angle) * dist
      if (!shape.contains(x, y, landScale * 0.84)) continue
      const type = pickWeighted(random, types)
      const big = type.includes('ountain')
      const s = big
        ? randomBetween(random, 0.8, 1.4)
        : randomBetween(random, 0.8, 1.2)
      const radius = (big ? 36 : 11) * s
      if (!isFree(x, y, radius)) continue
      placed.push({ x, y, radius })
      island.decorations.push({ type, gx: x, gy: y, s, flip: random() < 0.5 })
      made++
    }
  }

  // A river winds from inland toward the south coast (the side facing the
  // camera) and, where it meets a cliff, pours off it as a waterfall
  function addRiver(island) {
    const { shape, landScale } = island
    let start = null
    for (let attempt = 0; attempt < 40 && !start; attempt++) {
      const x = shape.cx + (random() - 0.5) * shape.extent * 0.8
      const y = shape.cy - random() * shape.extent * 0.45
      if (shape.contains(x, y, landScale * 0.55) && isFree(x, y, 30)) {
        start = [x, y]
      }
    }
    if (!start) return

    const target = Math.PI / 2 + (random() - 0.5) * 1.2
    const phase = random() * Math.PI * 2
    const points = [start]
    let [x, y] = start
    let exited = false
    for (let step = 0; step < 500; step++) {
      const heading =
        target + Math.sin(step * 0.16 + phase) * 0.75 + (random() - 0.5) * 0.35
      x += Math.cos(heading) * 13
      y += Math.sin(heading) * 13
      points.push([x, y])
      if (!shape.contains(x, y, landScale * 0.99)) {
        exited = true
        break
      }
    }
    if (!exited || points.length < 12) return

    for (const [px, py] of points) placed.push({ x: px, y: py, radius: 16 })
    island.rivers.push(points)

    // Only cliffs facing us get a waterfall; beaches don't have one
    const [ex, ey] = points[points.length - 2]
    const facesUs = !shape.contains(ex, ey + 40, 1)
    if (island.height > 20 && facesUs) island.waterfalls.push([ex, ey])

    // Rivers start at a small lake
    island.lakes.push({ x: start[0], y: start[1], r: randomBetween(random, 34, 48) })
    placed.push({ x: start[0], y: start[1], radius: 55 })
  }

  function addLake(island) {
    const { shape } = island
    for (let attempt = 0; attempt < 60; attempt++) {
      const x = shape.cx + (random() - 0.5) * shape.extent
      const y = shape.cy + (random() - 0.5) * shape.extent * 0.8
      const r = randomBetween(random, 50, 90)
      if (shape.contains(x, y, 0.6) && isFree(x, y, r + 20)) {
        island.lakes.push({ x, y, r })
        placed.push({ x, y, radius: r + 20 })
        return
      }
    }
  }

  for (const spec of LANDMASSES) {
    const biome = BIOMES[spec.biome]
    const island = addIsland(spec)

    for (const landmark of spec.landmarks ?? []) {
      const x = spec.cx + landmark.dx
      const y = spec.cy + landmark.dy
      const s = landmark.s ?? 1
      placed.push({ x, y, radius: 60 * s })
      island.decorations.push({ type: landmark.type, gx: x, gy: y, s, flip: false })
    }
    for (let i = 0; i < (spec.rivers ?? 0); i++) addRiver(island)
    for (let i = 0; i < (spec.lakes ?? 0); i++) addLake(island)
    for (const zone of spec.zones ?? []) {
      scatter(island, { count: zone.count, types: zone.types, zone })
    }

    const area = Math.PI * spec.r ** 2 * (spec.sx ?? 1) * (spec.sy ?? 1)
    const count = Math.round(
      (area / 10000) * biome.density * island.landScale ** 2,
    )
    scatter(island, { count, types: biome.scatter })
  }

  // Small islets and sea stacks in the open water between the landmasses
  const clearOf = (x, y, r, gap) =>
    islands.every(
      ({ shape }) =>
        Math.hypot(shape.cx - x, shape.cy - y) > shape.extent + r + gap,
    )
  for (let attempt = 0, made = 0; attempt < 1200 && made < 60; attempt++) {
    const r = randomBetween(random, 16, 42)
    const x = randomBetween(random, 150, GROUND_WIDTH - 150)
    const y = randomBetween(random, 150, GROUND_HEIGHT - 150)
    if (!clearOf(x, y, r, 110)) continue
    const roll = random()
    const biome = roll < 0.25 ? 'tropical' : roll < 0.45 ? 'stack' : 'rocky'
    const island = addIsland({
      biome,
      cx: x,
      cy: y,
      r: biome === 'stack' ? r * 0.7 : r,
      sx: randomBetween(random, 0.9, 1.4),
      rot: random() * 3,
    })
    scatter(island, {
      count: biome === 'rocky' ? 2 : 1,
      types:
        biome === 'tropical'
          ? [['palm', 1]]
          : biome === 'stack'
            ? [['bush', 1]]
            : [['rock', 1], ['crag', 1]],
    })
    made++
  }

  for (const island of islands) finishIsland(island, random)

  // Back-to-front, so nearer islands draw over farther ones
  islands.sort((a, b) => a.shape.cy - b.shape.cy)

  const isOcean = (x, y, margin = 1.35) =>
    islands.every(({ shape }) => !shape.contains(x, y, margin))
  const onScreen = ({ x, y, ...rest }) => {
    const [sx, sy] = project(x, y)
    return { ...rest, x: sx, y: sy }
  }

  const deepPatches = Array.from({ length: 22 }, () => {
    const [x, y] = project(random() * GROUND_WIDTH, random() * GROUND_HEIGHT)
    const rx = randomBetween(random, 300, 640)
    return { x, y, rx, ry: rx * randomBetween(random, 0.45, 0.7) * GROUND_Y }
  })

  const waves = []
  for (let attempt = 0; attempt < 4000 && waves.length < 420; attempt++) {
    const x = random() * GROUND_WIDTH
    const y = random() * GROUND_HEIGHT
    if (!isOcean(x, y, 1.6)) continue
    const [sx, sy] = project(x, y)
    waves.push({
      x: sx,
      y: sy,
      delay: -random() * 6,
      s: randomBetween(random, 0.8, 1.3),
    })
  }

  const clouds = Array.from({ length: 18 }, () => ({
    x: randomBetween(random, 150, WORLD_WIDTH - 450),
    y: randomBetween(random, 120, WORLD_HEIGHT - 250),
    s: randomBetween(random, 0.9, 1.7),
    duration: randomBetween(random, 38, 60),
    delay: -random() * 40,
  }))

  const balloons = [
    { x: 3050, y: 2150, delay: 0 },
    { x: 5900, y: 3500, delay: -3 },
    { x: 1500, y: 700, delay: -5 },
  ].map(onScreen)

  const birds = Array.from({ length: 7 }, () => ({
    x: randomBetween(random, 300, WORLD_WIDTH - 900),
    y: randomBetween(random, 200, WORLD_HEIGHT - 400),
    duration: randomBetween(random, 26, 40),
    delay: -random() * 30,
    count: 3 + Math.floor(random() * 3),
  }))

  // Animated extras that belong to an island, tagged with which one so they
  // can appear along with it
  function findLandmark(type) {
    for (const [index, island] of islands.entries()) {
      const found = island.decorations.find((d) => d.type === type)
      if (found) return { ...found, island: index }
    }
    return null
  }

  return {
    islands,
    deepPatches,
    waves,
    clouds,
    balloons,
    birds,
    seaFeatures: SEA_FEATURES.filter(({ x, y }) => isOcean(x, y, 1.1)).map(
      onScreen,
    ),
    whirlpools: WHIRLPOOLS.filter(({ x, y }) => isOcean(x, y)).map(onScreen),
    ships: SHIPS.filter(({ x, y }) => isOcean(x, y)).map(onScreen),
    whales: WHALES.filter(({ x, y }) => isOcean(x, y)).map(onScreen),
    volcano: findLandmark('volcano'),
    lighthouse: findLandmark('lighthouse'),
  }
}

// Turns an island's ground-space shape into everything needed to draw it on
// screen: shallow water, layered cliff walls, the top surface, rivers, lakes,
// waterfalls, decorations (in depth order) and a box that fits it all
function finishIsland(island, random) {
  const biome = BIOMES[island.biome]
  const { shape, height, landScale } = island
  const drop = height * HEIGHT_Y
  const toScreen = (points, z) => points.map(([x, y]) => project(x, y, z))

  const base = toScreen(shape.outline(1), 0)
  const top = toScreen(shape.outline(1), height)

  island.shallow = polygonPath(toScreen(shape.outline(island.shallowScale), 0))
  island.shallowColor = biome.shallow ?? DEFAULT_SHALLOW
  island.foam = polygonPath(base)

  // Cliff walls in three rock bands, darkest at the waterline
  const [light, mid, dark] = biome.cliff
  const bands = [
    [0, 0.34, dark],
    [0.34, 0.68, mid],
    [0.68, 1, light],
  ]
  island.cliffs = bands.map(([from, to, color]) => ({
    color,
    path: extrusionPath(
      base.map(([x, y]) => [x, y - from * drop]),
      (to - from) * drop,
    ),
  }))

  // A few cracks running down the walls that face us
  island.cracks = []
  if (drop > 8) {
    const facing = top.filter((point, i) => top[(i + 1) % top.length][0] < point[0])
    const crackCount = Math.min(14, Math.floor(facing.length / 6))
    for (let i = 0; i < crackCount; i++) {
      const [x, y] = facing[Math.floor(random() * facing.length)]
      const length = drop * randomBetween(random, 0.3, 0.85)
      const pts = [[x, y + 2]]
      for (let t = 1; t <= 3; t++) {
        pts.push([x + (random() - 0.5) * 5, y + (length * t) / 3])
      }
      island.cracks.push(
        `M${pts.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join('L')}`,
      )
    }
  }
  island.crackColor = shade(dark, -0.15)

  island.top = polygonPath(top)
  island.topColor = biome.sand ?? biome.land
  island.land =
    landScale < 1 ? polygonPath(toScreen(shape.outline(landScale), height)) : null
  island.landColor = biome.land
  island.rimColor = shade(biome.sand ?? biome.land, 0.35)

  island.lakeShapes = island.lakes.map(({ x, y, r }) => {
    const [sx, sy] = project(x, y, height)
    return { x: sx, y: sy, rx: r, ry: r * 0.6 * GROUND_Y }
  })
  island.riverPaths = island.rivers.map((points) =>
    smoothPath(toScreen(points, height)),
  )
  island.bankColor = shade(biome.land, -0.12)

  island.waterfallShapes = island.waterfalls.map(([x, y]) => {
    const [tx, ty] = project(x, y, height)
    return { x: tx, top: ty, bottom: ty + drop, width: 13 }
  })

  island.decorations = island.decorations
    .sort((a, b) => a.gy - b.gy)
    .map(({ gx, gy, ...rest }) => {
      const [x, y] = project(gx, gy, height)
      return { ...rest, x, y }
    })

  // Decorations are split into rows (back to front) that sprout one after
  // another once the island lands; small islands keep them in one piece
  const rowCount = island.decorations.length >= 12 ? 3 : 1
  const perRow = Math.ceil(island.decorations.length / rowCount)
  island.decorationRows = Array.from({ length: rowCount }, (_, i) =>
    island.decorations.slice(i * perRow, (i + 1) * perRow),
  ).filter((row) => row.length)

  // A box that fits the shallows, the raised top and everything on it
  const xs = []
  const ys = []
  for (const [x, y] of toScreen(shape.outline(island.shallowScale), 0)) {
    xs.push(x)
    ys.push(y)
  }
  for (const [, y] of top) ys.push(y)
  for (const { x, y, s, type } of island.decorations) {
    xs.push(x - 90 * s, x + 90 * s)
    ys.push(y - (DECORATION_HEIGHT[type] ?? 55) * s, y + 12)
  }
  const minX = Math.floor(Math.min(...xs)) - 6
  const minY = Math.floor(Math.min(...ys)) - 6
  island.bounds = {
    x: minX,
    y: minY,
    width: Math.ceil(Math.max(...xs)) + 6 - minX,
    height: Math.ceil(Math.max(...ys)) + 6 - minY,
  }

  const [cx, cy] = project(shape.cx, shape.cy, 0)
  island.center = { x: cx, y: cy }
  island.label = { x: cx, y: Math.max(...base.map(([, y]) => y)) + 56 }
  island.rise = drop + 70
  island.splashSize = shape.extent * 2.2
}
