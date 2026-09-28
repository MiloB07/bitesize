// The camera looks down at the ground at this angle (90 would be straight
// down, a bird's-eye view). Lower angles tilt the view more and show taller
// cliff walls.
export const CAMERA_ANGLE_DEG = 65

const angle = (CAMERA_ANGLE_DEG * Math.PI) / 180

// Ground distances north-south get foreshortened, and heights show up as a
// fraction of their size
export const GROUND_Y = Math.sin(angle)
export const HEIGHT_Y = Math.cos(angle)

// Size of the world's ground, before projecting
export const GROUND_WIDTH = 7200
export const GROUND_HEIGHT = 5200

// Room above the northernmost ground for tall things (mountains, cliffs)
const TOP_MARGIN = 170

// Size of the world as drawn on screen
export const WORLD_WIDTH = GROUND_WIDTH
export const WORLD_HEIGHT = Math.ceil(GROUND_HEIGHT * GROUND_Y + TOP_MARGIN)

// Ground position (x, y) at height z → where it's drawn on screen
export function project(x, y, z = 0) {
  return [x, y * GROUND_Y + TOP_MARGIN - z * HEIGHT_Y]
}
