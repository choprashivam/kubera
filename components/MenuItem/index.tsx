import { usePathname } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { MenuItemProps } from "../../app/menuItems";
import LogoutLink from "../LogoutLink";

const DarkModeSwitcher = dynamic(() => import("../DarkModeSwitcher"), { ssr: false });

export const MenuItem: React.FC<MenuItemProps> = (props) => {
  const pathname = usePathname();

  const isActive = (itemHref: string | undefined) => {
    if (!itemHref) return false;
    
    const normalizedPathname = pathname.toLowerCase();
    const normalizedHref = itemHref.toLowerCase();

    if (normalizedHref === '/home') {
      return normalizedPathname === '/' || normalizedPathname.startsWith('/home');
    }

    if (normalizedPathname.startsWith(normalizedHref)) {
      if (normalizedPathname.length > normalizedHref.length) {
        return normalizedPathname[normalizedHref.length] === '/';
      }
      return true;
    }

    return false;
  };

  if ('isDivider' in props && props.isDivider) {
    return <div className="border-t my-2" />;
  }

  const { href, title, icon: Icon } = props;

  if (href) {
    return (
      <li>
        <Link
          href={href}
          className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${isActive(href) ? "text-white bg-graydark dark:bg-meta-4" : "text-bodydark1"}`}
        >
          <Icon size={20} />
          {title}
        </Link>
      </li>
    );
  }

  if (title === "Dark Mode") {
    return (
      <li className="group relative flex items-center gap-2.5 justify-between rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4">
        <Icon size={20} /> {title}
        <div className="ml-auto">
          <DarkModeSwitcher />
        </div>
      </li>
    );
  }

  if (title === "Log Out") {
    return (
      <li>
        <LogoutLink
          className="group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4"
        >
          <Icon size={20} /> {title}
        </LogoutLink>
      </li>
    );
  }

  return null;
};