import Link from "next/link";
import Image from "next/image";
interface BrandLogoProps {
  className?: string;
}
const BrandLogo = ({ className = "" }: BrandLogoProps) => {
  return (
    <Link className="m-auto inline-block" href="/">
      <div className={`${className}`}>
        <Image
          className={`w-full max-w-[400px] dark:hidden pointer-events-none`}
          src={"/images/logo/brand-light-t-o.png"}
          alt="iFinStrats Logo"
          width={400}
          height={1}
          style={{ height: "auto" }}
          priority
        />
        <Image
          className={`hidden w-full max-w-[400px] dark:block pointer-events-none`}
          src={"/images/logo/brand-dark-t-o.png"}
          alt="iFinStrats Logo"
          width={400}
          height={1}
          style={{ height: "auto" }}
          priority
        />
      </div>
    </Link>
  );
};

export default BrandLogo;