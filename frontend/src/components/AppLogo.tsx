export default function AppLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 40 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* Solid bottom edge for the 3D look */}
      <rect y="4" width="40" height="40" rx="12" fill="#5B3FD9" />
      <rect width="40" height="40" rx="12" fill="#7C5CFC" />

      <path
        d="M25 15C25 13.3431 23.6569 12 22 12H17C14.2386 12 12 14.2386 12 17C12 19.7614 14.2386 22 17 22H23C24.6569 22 26 23.3431 26 25C26 26.6569 24.6569 28 23 28H15"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="27" cy="13" r="3.2" fill="#FFC800" stroke="#7C5CFC" strokeWidth="1.5" />
    </svg>
  );
}
