// Placeholder profile picture: a little yellow duck in a circle
function DuckAvatar({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label="Duck profile picture"
    >
      <defs>
        <clipPath id="duck-avatar-clip">
          <circle cx="20" cy="20" r="20" />
        </clipPath>
      </defs>
      <g clipPath="url(#duck-avatar-clip)">
        <rect width="40" height="40" fill="#e3eefa" />
        {/* water */}
        <rect y="31" width="40" height="9" fill="#bcd5f0" />
        {/* tail */}
        <path d="M6 24 L3 18 L11 22 Z" fill="#ffd257" />
        {/* body */}
        <ellipse cx="17" cy="27" rx="11" ry="7" fill="#ffd95e" />
        {/* wing */}
        <ellipse cx="15" cy="26.5" rx="5.5" ry="3.2" fill="#f7c843" />
        {/* head */}
        <circle cx="25" cy="15" r="7" fill="#ffd95e" />
        {/* beak */}
        <path
          d="M30.5 14.5 Q36.5 15 36 17 Q35.5 19 30.5 18.5 Z"
          fill="#ff9f45"
        />
        {/* eye */}
        <circle cx="27" cy="13" r="1.4" fill="#2f3a4a" />
        <circle cx="27.4" cy="12.6" r="0.45" fill="#ffffff" />
        {/* cheek */}
        <circle cx="26" cy="17.5" r="1.4" fill="#ffb3a1" opacity="0.7" />
      </g>
    </svg>
  )
}

export default DuckAvatar
