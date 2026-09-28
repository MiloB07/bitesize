const TAU = Math.PI * 2

// A rough, natural-looking coastline: a circle whose radius is pushed around
// by broad waves (overall shape), bumps (peninsulas and bays), fine waves and
// per-point noise (jagged edges). Then stretched and rotated.
// Works in ground coordinates.
export function createLandShape(
  random,
  { cx, cy, r, sx = 1, sy = 1, rot = 0, rough = 1 },
) {
  const count = r > 160 ? 170 : r > 60 ? 100 : 44

  const broad = [2, 3, 4, 5, 7].map((k) => ({
    k,
    amp: ((0.4 + random() * 0.6) * 0.12) / (k * 0.55),
    phase: random() * TAU,
  }))
  const fine = [11, 16, 23, 31].map((k) => ({
    k,
    amp: (0.5 + random() * 0.5) * 0.024 * rough,
    phase: random() * TAU,
  }))
  const bumps = Array.from({ length: r > 60 ? 2 + Math.floor(random() * 3) : 0 }, () => ({
    at: random() * TAU,
    width: 0.2 + random() * 0.4,
    amp: -0.2 + random() * 0.5,
  }))

  const radii = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * TAU
    let factor = 1
    for (const { k, amp, phase } of [...broad, ...fine]) {
      factor += amp * Math.sin(k * angle + phase)
    }
    for (const bump of bumps) {
      const diff = Math.atan2(Math.sin(angle - bump.at), Math.cos(angle - bump.at))
      factor += bump.amp * Math.exp(-((diff / bump.width) ** 2))
    }
    factor *= 1 + (random() - 0.5) * 0.06 * rough
    return r * Math.max(0.35, factor)
  })

  function radiusAt(angle) {
    const t = (((angle % TAU) + TAU) % TAU) / TAU * count
    const i = Math.floor(t) % count
    const next = (i + 1) % count
    const f = t - Math.floor(t)
    return radii[i] * (1 - f) + radii[next] * f
  }

  const cos = Math.cos(rot)
  const sin = Math.sin(rot)

  function outline(scale = 1) {
    return radii.map((radius, i) => {
      const angle = (i / count) * TAU
      const lx = Math.cos(angle) * radius * scale * sx
      const ly = Math.sin(angle) * radius * scale * sy
      return [cx + lx * cos - ly * sin, cy + lx * sin + ly * cos]
    })
  }

  function contains(x, y, scale = 1) {
    const dx = x - cx
    const dy = y - cy
    const lx = (dx * cos + dy * sin) / sx
    const ly = (-dx * sin + dy * cos) / sy
    return Math.hypot(lx, ly) < radiusAt(Math.atan2(ly, lx)) * scale
  }

  // Rough outer size, used to keep landmasses apart
  const extent = Math.max(...radii) * Math.max(sx, sy)

  return { cx, cy, extent, contains, outline }
}

const f = (n) => n.toFixed(1)

// Straight-edged closed path, which keeps coastlines jagged
export function polygonPath(points) {
  return `M${points.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`
}

// Smooth open path through points, for rivers
export function smoothPath(points) {
  let d = `M${f(points[0][0])} ${f(points[0][1])}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`
  }
  return d
}

// The solid you get by pushing a flat outline (already on screen) straight up
// by `drop` pixels: the outline, its raised copy, and the walls between them.
// Only walls facing the camera are included; the rest are hidden anyway.
export function extrusionPath(base, drop) {
  const n = base.length
  let area = 0
  for (let i = 0; i < n; i++) {
    const [x1, y1] = base[i]
    const [x2, y2] = base[(i + 1) % n]
    area += x1 * y2 - x2 * y1
  }
  const raised = base.map(([x, y]) => [x, y - drop])
  let d = polygonPath(base) + polygonPath(raised)
  for (let i = 0; i < n; i++) {
    const a = base[i]
    const b = base[(i + 1) % n]
    const dx = b[0] - a[0]
    // Outward normal's vertical part; positive means the wall faces us
    const normalY = area > 0 ? -dx : dx
    if (normalY < -0.5) continue
    d += `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}L${f(b[0])} ${f(b[1] - drop)}L${f(a[0])} ${f(a[1] - drop)}Z`
  }
  return d
}

// Mixes a hex color toward white (amount > 0) or black (amount < 0)
export function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16)
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  const target = amount > 0 ? 255 : 0
  const mixed = channels.map((c) =>
    Math.round(c + (target - c) * Math.abs(amount)),
  )
  return `#${mixed.map((c) => c.toString(16).padStart(2, '0')).join('')}`
}
