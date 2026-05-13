export default function AppLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F46E5" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#bgGrad)" />
      
      {/* Sleek S curve (Trademark-quality monogram) */}
      <path
        d="M25 15C25 13.3431 23.6569 12 22 12H17C14.2386 12 12 14.2386 12 17C12 19.7614 14.2386 22 17 22H23C24.6569 22 26 23.3431 26 25C26 26.6569 24.6569 28 23 28H15"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Gold Spark Accent */}
      <circle cx="26" cy="14" r="2.5" fill="#FBBF24" />
    </svg>
  );
}
