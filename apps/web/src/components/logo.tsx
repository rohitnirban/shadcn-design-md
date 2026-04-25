import Link from "next/link";

export const LogoSVG = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        width="256"
        height="256"
        rx="64"
        className="fill-foreground"
      />
      <path
        d="M72.5 109.5H183.5M109.5 183.5V109.5M84.8333 72.5H171.167C177.978 72.5 183.5 78.0218 183.5 84.8333V171.167C183.5 177.978 177.978 183.5 171.167 183.5H84.8333C78.0218 183.5 72.5 177.978 72.5 171.167V84.8333C72.5 78.0218 78.0218 72.5 84.8333 72.5Z"
        className="stroke-background"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <LogoSVG />
      <span className="text-foreground text-xl font-medium tracking-tight">
        DESIGN.md
      </span>
    </Link>
  );
};
