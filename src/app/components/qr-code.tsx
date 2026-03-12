export function QRCode({ value }: { value: string }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-inner">
      <svg width="100%" height="100%" viewBox="0 0 256 256" className="mx-auto max-w-[200px] aspect-square">
        <rect width="256" height="256" fill="white"/>
        {/* This is a simplified static SVG representation of a QR code for visual purposes. */}
        <path fill="black" d="M0 0h80v80H0z m176 0h80v80h-80z M0 176h80v80H0z M24 24h32v32H24z m176 0h32v32h-32z M24 200h32v32H24z M96 12h16v16H96z m32 0h16v16h-16z m-32 32h16v16h-16z m-48 16h16v16H48z m128 0h16v16h-16z M96 60h16v16H96z m32 0h16v16h-16z m16 16h16v16h-16z M48 92h16v16H48z m16 16h16v16H64z m32 0h16v16H96z m32 0h16v16h-16z m32-16h16v16h-16z m-16 32h16v16h-16z m-48 0h16v16H96z m-32 16h16v16H64z M48 156h16v16H48z m64 16h16v16h-16z m32 0h16v16h-16z m-64 16h16v16H80z m-64 16h16v16H16z m32 0h16v16H48z m64 0h16v16h-16z m32 0h16v16h-16z m32 0h16v16h-16z m-32 32h16v16h-16z m-32 0h16v16h-16z m96 0h16v16h-16z"/>
      </svg>
      <p className="text-center text-xs text-muted-foreground mt-2 break-all">{value}</p>
    </div>
  );
}
