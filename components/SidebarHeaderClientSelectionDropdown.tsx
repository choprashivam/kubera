"use client";
import { api } from "~/trpc/react";
import ClientSelectionDropdown, { type ClientItem } from "./Admin/ClientSelectionDropdown";
import React, { useMemo } from "react";
import { useClientSelection } from "./Admin/ClientContext";

const SidebarHeaderClientSelectionDropdown: React.FC = () => {
  const { setSelectedClient, refreshRouter } = useClientSelection();
  const { data: clientsData, isLoading, error } = api.clientsInfo.getClientsInfo.useQuery();

  // Transform API data to match ClientItem interface
  const clients: ClientItem[] = useMemo(() => {
    return clientsData?.clientsInfo.map(client => ({
      key: `${client.clientName} - ${client.brokerId}`, // Use clientName - brokerId as the display key
      value: client.ifinId  // Use ifinId as the value
    })) ?? [];
  }, [clientsData]);

  if (isLoading) {
    return (
      <div className="px-4 py-2 text-sm text-gray-500">
        Loading clients...
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-2 text-sm text-red-500">
        Error loading clients
      </div>
    );
  }

  return (
    <ClientSelectionDropdown
      items={clients}
      onSelect={(client) => {
        setSelectedClient(client);
        refreshRouter()
        // Additional logic if needed
      }}
    />
  );
};

export default SidebarHeaderClientSelectionDropdown;