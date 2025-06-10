"use client";
import React, { createContext, type ReactNode, useContext, useState } from "react";
import type { ClientItem } from "./ClientSelectionDropdown";
import { useRouter } from "next/navigation";

// Define the shape of the context
interface ClientSelectionContextType {
    selectedClient: ClientItem | null;
    setSelectedClient: (client: ClientItem | null) => void;
    refreshRouter: () => void;
}

// Create the context with a default value
const ClientSelectionContext = createContext<ClientSelectionContextType>({
    selectedClient: null,
    setSelectedClient: () => {
        // No-op implementation to satisfy ESLint
        return;
    },
    refreshRouter: () => {
        // No-op implementation to satisfy ESLint
        return;
    }
});

// Provider component
export const ClientSelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedClient, setSelectedClient] = useState<ClientItem | null>(null);
    const router = useRouter();

    // Function to refresh the router
    const refreshRouter = () => {
        router.refresh();
    };

    return (
        <ClientSelectionContext.Provider value={{
            selectedClient,
            setSelectedClient,
            refreshRouter
        }}>
            {children}
        </ClientSelectionContext.Provider>
    );
};

// Custom hook for easy context consumption
export const useClientSelection = () => {
    const context = useContext(ClientSelectionContext);

    if (!context) {
        throw new Error('useClientSelection must be used within a ClientSelectionProvider');
    }

    return context;
};