import { useEffect, useState } from "react";
import { useTheme } from '~/app/ThemeContext';
import { AiFillSun } from "react-icons/ai";
import { BsFillMoonStarsFill } from "react-icons/bs";

const DarkModeSwitcher: React.FC = () => {
  const { colorMode, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  return (
    <label
    className={`relative m-0 block h-6 w-13.5 rounded-full ${
      colorMode === "dark" ? "bg-primary" : "bg-stroke"
      }`}
    >
      <input
        type="checkbox"
        onChange={toggleTheme}
        checked={colorMode === "dark"}
        className="dur absolute top-0 z-50 m-0 h-full w-full cursor-pointer opacity-0"
      />
      <span
        className={`absolute left-[3px] top-1/2 flex h-6 w-6 -translate-y-1/2 translate-x-0 items-center justify-center rounded-full bg-white shadow-switcher duration-75 ease-linear ${
          colorMode === "dark" ? "!right-[3px] !translate-x-full" : ""
          }`}
      >
        <span className="dark:hidden">
          <AiFillSun color="#1C2434" />
        </span>
        <span className="hidden dark:inline-block">
          <BsFillMoonStarsFill color="#1C2434" />
        </span>
      </span>
    </label>
  );
};

export default DarkModeSwitcher;