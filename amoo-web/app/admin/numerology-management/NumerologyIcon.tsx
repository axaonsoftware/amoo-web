export default function NumerologyIcon({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="7" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="16.3" cy="9.6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="16.3" cy="14.6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="7.7" cy="14.6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="7.7" cy="9.6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
