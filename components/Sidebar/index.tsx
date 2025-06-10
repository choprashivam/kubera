"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { PiArrowLeftLight } from "react-icons/pi";
import { FaWhatsapp } from "react-icons/fa";
import { adminMenuItems, menuItems, optionMenuItems } from "../../app/menuItems";
import { MenuItem } from "../MenuItem";
import SidebarHeaderClientSelectionDropdown from "../SidebarHeaderClientSelectionDropdown";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  isAdmin: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, isAdmin }) => {
  const trigger = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_SUPPORT_NUMBER;

  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(event.target as Node) ||
        trigger.current.contains(event.target as Node)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (!sidebarOpen || event.key !== "Escape") return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-200 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-6 py-4.5 lg:py-5.5 ml-2">
        <Link href="/">
          <Image
            width={176}
            height={32}
            src={"/images/logo/brand-dark-t-o.png"}
            alt="Logo"
            priority
            style={{ width: 'auto', height: 'auto' }}
          />
        </Link>
        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <PiArrowLeftLight className="-mt-4" size={28} />
        </button>
      </div>

      {/* User Info */}
      {/* <nav className="lg:px-6">
          <div className="hidden lg:flex flex-col px-4 py-1 text-sm">
            <div className="font-light">Customer Name</div>
            <div className="font-thin">BrokerID</div>
          </div>
        </nav> */}

      {/* Client Selection Dropdown */}
      {isAdmin && (
        <nav className="lg:px-4">
          <div className="hidden lg:flex flex-col px-4 py-1">
            <SidebarHeaderClientSelectionDropdown />
          </div>
        </nav>
      )}

      {/* Sidebar content */}
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-2 px-4 py-4 lg:mt-4 lg:px-6">
          <div>
            <ul className="flex flex-col gap-1.5">
              {(isAdmin ? adminMenuItems : menuItems).map((item) => (
                <MenuItem key={item._key} {...item} />
              ))}
            </ul>
            <ul className="hidden lg:flex flex-col gap-1.5">
              {optionMenuItems.map((item) => (
                <MenuItem key={item._key} {...item} />
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Contact Us Link */}
      <div className="mt-auto px-4 py-4 lg:px-6">
        <Link
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello,+I+need+help!`}
          target="_blank"
          className="group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4"
        >
          <FaWhatsapp size={20} color="25D366" />
          <span>Contact Us</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;