import { useEffect, useRef } from 'react'

// How quickly a flick slows down after you let go (fraction of speed kept
// every 16ms). Higher glides further.
const FRICTION = 0.93
const MIN_SPEED = 0.02 // px per ms
const MAX_SPEED = 2.5 // px per ms, so a hard flick can't fling across the world
const KEY_STEP = 120
const MAX_ZOOM = 1 // the drawings are made for 1x; beyond that they'd blur
const BUTTON_ZOOM = 1.4

// Drag, scroll and pinch to move around a large `world` element inside a
// smaller `viewport`. The world is moved with a transform directly (no React
// re-render per frame), kept inside the edges, and glides a little after a
// flick. Returns refs for both elements and `controlsRef` for zoom buttons.
export function usePanZoom({ worldWidth, worldHeight, onFirstMove }) {
  const viewportRef = useRef(null)
  const worldRef = useRef(null)
  const controlsRef = useRef(null)

  useEffect(() => {
    const viewport = viewportRef.current
    const world = worldRef.current
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    let x = 0
    let y = 0
    let zoom = 1
    let drag = null
    let glideFrame = null
    let hasMoved = false

    // Zoomed all the way out, the whole world fits on screen
    const minZoom = () =>
      Math.min(
        MAX_ZOOM,
        viewport.clientWidth / worldWidth,
        viewport.clientHeight / worldHeight,
      )

    // Keeps the world covering the screen; if it's smaller than the screen on
    // an axis (zoomed out), centers it on that axis instead
    function clampAxis(value, viewSize, worldSize) {
      const scaled = worldSize * zoom
      if (scaled <= viewSize) return { value: (viewSize - scaled) / 2, hit: true }
      const clamped = Math.min(0, Math.max(viewSize - scaled, value))
      return { value: clamped, hit: clamped !== value }
    }

    function clamp() {
      const cx = clampAxis(x, viewport.clientWidth, worldWidth)
      const cy = clampAxis(y, viewport.clientHeight, worldHeight)
      x = cx.value
      y = cy.value
      return { hitX: cx.hit, hitY: cy.hit }
    }

    function apply() {
      world.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${zoom})`
    }

    function markMoved() {
      if (hasMoved) return
      hasMoved = true
      onFirstMove?.()
    }

    function moveBy(dx, dy) {
      x += dx
      y += dy
      const hits = clamp()
      apply()
      markMoved()
      return hits
    }

    // Zooms while keeping the point under (px, py) fixed on screen
    function zoomAt(factor, px, py) {
      const next = Math.min(MAX_ZOOM, Math.max(minZoom(), zoom * factor))
      if (next === zoom) return
      const worldX = (px - x) / zoom
      const worldY = (py - y) / zoom
      zoom = next
      x = px - worldX * zoom
      y = py - worldY * zoom
      clamp()
      apply()
      markMoved()
    }

    function zoomAtCenter(factor) {
      stopGlide()
      zoomAt(factor, viewport.clientWidth / 2, viewport.clientHeight / 2)
    }

    function stopGlide() {
      if (glideFrame) cancelAnimationFrame(glideFrame)
      glideFrame = null
    }

    function glide(vx, vy) {
      const speed = Math.hypot(vx, vy)
      if (speed > MAX_SPEED) {
        vx = (vx / speed) * MAX_SPEED
        vy = (vy / speed) * MAX_SPEED
      }
      let last = performance.now()
      function step(now) {
        const dt = Math.min(now - last, 40)
        last = now
        const { hitX, hitY } = moveBy(vx * dt, vy * dt)
        const decay = Math.pow(FRICTION, dt / 16)
        vx = hitX ? 0 : vx * decay
        vy = hitY ? 0 : vy * decay
        glideFrame =
          Math.hypot(vx, vy) > MIN_SPEED ? requestAnimationFrame(step) : null
      }
      glideFrame = requestAnimationFrame(step)
    }

    function pointInViewport(event) {
      const rect = viewport.getBoundingClientRect()
      return [event.clientX - rect.left, event.clientY - rect.top]
    }

    // Start zoomed all the way out, with the whole world centered
    zoom = minZoom()
    clamp()
    apply()

    function onPointerDown(event) {
      if (event.button !== 0 || event.target.closest('button')) return
      stopGlide()
      viewport.setPointerCapture(event.pointerId)
      drag = {
        id: event.pointerId,
        lastX: event.clientX,
        lastY: event.clientY,
        samples: [{ x: event.clientX, y: event.clientY, t: event.timeStamp }],
      }
      viewport.classList.add('is-dragging')
    }

    function onPointerMove(event) {
      if (!drag || event.pointerId !== drag.id) return
      moveBy(event.clientX - drag.lastX, event.clientY - drag.lastY)
      drag.lastX = event.clientX
      drag.lastY = event.clientY
      drag.samples.push({ x: event.clientX, y: event.clientY, t: event.timeStamp })
      // Only the last ~100ms matter for how fast the flick was
      while (drag.samples.length > 2 && event.timeStamp - drag.samples[0].t > 100) {
        drag.samples.shift()
      }
    }

    function onPointerUp(event) {
      if (!drag || event.pointerId !== drag.id) return
      const first = drag.samples[0]
      const last = drag.samples[drag.samples.length - 1]
      const dt = last.t - first.t
      const heldStill = event.timeStamp - last.t > 80
      drag = null
      viewport.classList.remove('is-dragging')
      if (reduceMotion || heldStill || dt <= 0) return
      glide((last.x - first.x) / dt, (last.y - first.y) / dt)
    }

    // Trackpad pinches arrive as wheel events with ctrlKey set (Chrome,
    // Firefox, Edge), as does ctrl/cmd + mouse wheel. Plain two-finger
    // scrolling pans.
    function onWheel(event) {
      event.preventDefault()
      stopGlide()
      if (event.ctrlKey || event.metaKey) {
        const [px, py] = pointInViewport(event)
        zoomAt(Math.exp(-event.deltaY * 0.01), px, py)
      } else {
        moveBy(-event.deltaX, -event.deltaY)
      }
    }

    // Safari reports trackpad pinches as its own gesture events instead
    let gestureScale = 1
    function onGestureStart(event) {
      event.preventDefault()
      stopGlide()
      gestureScale = 1
    }
    function onGestureChange(event) {
      event.preventDefault()
      const [px, py] = pointInViewport(event)
      zoomAt(event.scale / gestureScale, px, py)
      gestureScale = event.scale
    }

    function onKeyDown(event) {
      const steps = {
        ArrowLeft: [KEY_STEP, 0],
        ArrowRight: [-KEY_STEP, 0],
        ArrowUp: [0, KEY_STEP],
        ArrowDown: [0, -KEY_STEP],
      }
      if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        zoomAtCenter(BUTTON_ZOOM)
      } else if (event.key === '-' || event.key === '_') {
        event.preventDefault()
        zoomAtCenter(1 / BUTTON_ZOOM)
      } else if (steps[event.key]) {
        event.preventDefault()
        stopGlide()
        moveBy(...steps[event.key])
      }
    }

    controlsRef.current = {
      zoomIn: () => zoomAtCenter(BUTTON_ZOOM),
      zoomOut: () => zoomAtCenter(1 / BUTTON_ZOOM),
    }

    const resizeObserver = new ResizeObserver(() => {
      zoom = Math.max(minZoom(), zoom)
      clamp()
      apply()
    })

    viewport.addEventListener('pointerdown', onPointerDown)
    viewport.addEventListener('pointermove', onPointerMove)
    viewport.addEventListener('pointerup', onPointerUp)
    viewport.addEventListener('pointercancel', onPointerUp)
    viewport.addEventListener('wheel', onWheel, { passive: false })
    viewport.addEventListener('gesturestart', onGestureStart)
    viewport.addEventListener('gesturechange', onGestureChange)
    viewport.addEventListener('keydown', onKeyDown)
    resizeObserver.observe(viewport)

    return () => {
      stopGlide()
      controlsRef.current = null
      viewport.removeEventListener('pointerdown', onPointerDown)
      viewport.removeEventListener('pointermove', onPointerMove)
      viewport.removeEventListener('pointerup', onPointerUp)
      viewport.removeEventListener('pointercancel', onPointerUp)
      viewport.removeEventListener('wheel', onWheel)
      viewport.removeEventListener('gesturestart', onGestureStart)
      viewport.removeEventListener('gesturechange', onGestureChange)
      viewport.removeEventListener('keydown', onKeyDown)
      resizeObserver.disconnect()
    }
  }, [worldWidth, worldHeight, onFirstMove])

  return { viewportRef, worldRef, controlsRef }
}
