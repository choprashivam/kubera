import { useEffect, useRef, useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { dropDownMenuItems } from "~/app/menuItems";
import { MenuItem } from "../MenuItem";

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const dropdown = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(event.target as Node) ||
        trigger.current?.contains(event.target as Node)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // Close if the esc key is pressed
  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (!dropdownOpen || event.key !== "Escape") return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <div className="relative">
      <button
        ref={trigger}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        aria-expanded={dropdownOpen}
      >
        <ul className="flex items-center gap-1 2xsm:gap-1">
          <FaUserAlt size={28} />
          <IoIosArrowDown />
        </ul>
      </button>

      {/* <!-- Dropdown Start --> */}
      <div
        ref={dropdown}
        className={`absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-boxdark shadow-default dark:border-strokedark dark:bg-boxdark ${dropdownOpen ? "block" : "hidden"
          }`}
        aria-hidden={!dropdownOpen}
        tabIndex={-1}
      >
        <ul className="mb-6 flex flex-col gap-1.5">
          {dropDownMenuItems.map((item) => (
            <MenuItem key={item._key} {...item} />
          ))}
        </ul>
        <ul className="hidden lg:flex flex-col gap-1.5  ">
          {dropDownMenuItems.map((item) => (
            <MenuItem key={item._key} {...item} />
          ))}
        </ul>
      </div>
      {/* <!-- Dropdown End --> */}
    </div>
  );
};

export default DropdownUser;
