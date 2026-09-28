import { flushSync } from 'react-dom'

// Keep in sync with --ease-in-out in index.css
const EASE_IN_OUT = 'cubic-bezier(0.77, 0, 0.175, 1)'
const DURATION_MS = 550

// Runs `update` (a React state change) so the new screen grows out of
// `originEl` in a circle. Falls back to an instant switch in browsers without
// View Transitions, and to a plain crossfade for reduced-motion users.
export function transitionFrom(originEl, update) {
  const applyUpdate = () => flushSync(update)

  if (!document.startViewTransition) {
    applyUpdate()
    return
  }

  const transition = document.startViewTransition(applyUpdate)

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const rect = originEl.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  // Distance to the farthest corner, so the circle covers the whole screen
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  )

  function growCircle() {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${radius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: DURATION_MS,
        easing: EASE_IN_OUT,
        pseudoElement: '::view-transition-new(root)',
      },
    )
  }

  // `ready` rejects if the browser skips the transition (e.g. the tab is
  // hidden); the screen still switches, there's just no circle
  transition.ready.then(growCircle, () => {})
}

// A quick grow-and-wiggle on the clicked tab, to confirm the click. It pivots
// from the tab's bottom edge so the tab stays attached to the bar. With reduced
// motion there's no movement, just a brief brightening.
export function wiggleTab(tabEl) {
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  if (reduceMotion) {
    tabEl.animate(
      { filter: ['brightness(1)', 'brightness(1.25)', 'brightness(1)'] },
      { duration: 300, easing: 'ease' },
    )
    return
  }

  tabEl.animate(
    [
      { transform: 'scale(1) rotate(0deg)' },
      { transform: 'scale(1.08) rotate(-2.5deg)', offset: 0.3 },
      { transform: 'scale(1.08) rotate(2deg)', offset: 0.55 },
      { transform: 'scale(1.04) rotate(-1deg)', offset: 0.8 },
      { transform: 'scale(1) rotate(0deg)' },
    ],
    { duration: 380, easing: 'ease-in-out' },
  )
}
