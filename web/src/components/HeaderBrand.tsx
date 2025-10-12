import Image from 'next/image';

interface HeaderBrandProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

/**
 * HeaderBrand - Official FamilyDash brand component
 * 
 * IMPORTANT: This component uses the exact logo from /assets/brand/
 * DO NOT modify to use SVG interpretations or recreate the logo
 * 
 * @param size - Logo size in pixels (default: 32)
 * @param showText - Whether to show "FamilyDash" text (default: true)
 * @param className - Additional CSS classes
 */
export default function HeaderBrand({ 
  size = 32, 
  showText = true,
  className = "" 
}: HeaderBrandProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/assets/brand/logo-256.png"
        alt="FamilyDash"
        width={size}
        height={size}
        priority
        style={{
          width: size,
          height: size,
        }}
      />
      {showText && (
        <span className="font-semibold text-lg">FamilyDash</span>
      )}
    </div>
  );
}

