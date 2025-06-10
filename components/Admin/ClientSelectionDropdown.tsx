"use client";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import React, { useMemo, useState } from 'react';

export interface ClientItem {
    key: string;
    value: string;
}

interface ClientSelectionDropdownProps {
    items: ClientItem[];
    onSelect?: (item: ClientItem) => void;
}

const ClientSelectionDropdown: React.FC<ClientSelectionDropdownProps> = ({
    items,
    onSelect
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<ClientItem | null>(null);

    // Filter and search items
    const filteredItems = useMemo(() => {
        if (!items?.length) return [];
        return items.filter(item =>
            item.key.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm]);

    // Handle item selection
    const handleItemSelect = (item: ClientItem) => {
        setSelectedItem(item);
        onSelect?.(item);
    };

    return (
        <Menu as="div" className="relative inline-block text-left w-full">
            <div>
                <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    {selectedItem?.key ?? 'Select Client'}
                    <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
                </MenuButton>
            </div>

            <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
                {/* Search Input */}
                <div className="p-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                </div>

                {/* Menu Items */}
                <div className="py-1 max-h-60 overflow-y-auto">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <MenuItem key={item.key}>
                                {({ focus }) => (
                                    <button
                                        onClick={() => handleItemSelect(item)}
                                        className={`
                                            block w-full text-left px-4 py-2 text-sm 
                                            ${focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}
                                            ${selectedItem?.key === item.key ? 'bg-blue-50' : ''}
                                        `}
                                    >
                                        {item.key}
                                    </button>
                                )}
                            </MenuItem>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-sm text-gray-500 text-center">
                            No clients found
                        </div>
                    )}
                </div>
            </MenuItems>
        </Menu>
    )
}

export default ClientSelectionDropdown;