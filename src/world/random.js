// Small seeded random number generator (mulberry32), so the world comes out
// the same every time the page loads
export function createRandom(seed) {
  let state = seed >>> 0
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomBetween(random, min, max) {
  return min + random() * (max - min)
}

export function pickWeighted(random, options) {
  const total = options.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = random() * total
  for (const [value, weight] of options) {
    roll -= weight
    if (roll <= 0) return value
  }
  return options[options.length - 1][0]
}
