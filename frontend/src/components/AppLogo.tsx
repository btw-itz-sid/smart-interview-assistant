/** Logo — inline SVG so it works without any public/ file dependency */
export default function AppLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: 8, flexShrink: 0 }}
    >
      {/* Background */}
      <rect width="32" height="32" rx="8" fill="#4f46e5" />

      {/* Chat bubble outline */}
      <path
        d="M6 10C6 8.34 7.34 7 9 7H23C24.66 7 26 8.34 26 10V18C26 19.66 24.66 21 23 21H18L14 25V21H9C7.34 21 6 19.66 6 18V10Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
        opacity="0.4"
      />

      {/* Lightning bolt */}
      <path
        d="M18 7.5L12 16.5H16L14 24.5L20 15.5H16L18 7.5Z"
        fill="white"
      />
    </svg>
  );
}
