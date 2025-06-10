"use client";
import { useState } from "react";
import TotalPnlCard from "~/components/Cards/TotalPnlCard";
import RealisedPnlCard from "~/components/Cards/RealisedPnlCard";
import UnrealisedPnlCard from "~/components/Cards/UnrealisedPnlCard";

interface PnLToggleProps {
    ifinId: string;
}

export function PnlCardsToggle({ ifinId }: PnLToggleProps) {
    const [showDetails, setShowDetails] = useState(false);

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    return (
        <>
            <div onClick={toggleDetails} className="cursor-pointer">
                <TotalPnlCard ifinId={ifinId} />
            </div>
            {showDetails && (
                <>
                    <RealisedPnlCard ifinId={ifinId} />
                    <UnrealisedPnlCard ifinId={ifinId} />
                </>
            )}
        </>
    );
}