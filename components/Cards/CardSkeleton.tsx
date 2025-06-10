import React from 'react';

/**
 * CardSkeleton component for displaying a loading state
 */
const CardSkeleton: React.FC = () => (
    <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mt-4 flex items-end justify-between">
            <div>
                <div className="h-8 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-600 mb-2" /> {/* Total */}
                <div className="h-4 w-20 animate-pulse rounded bg-gray-300 dark:bg-gray-600" /> {/* Title */}
            </div>
            <div className="flex items-center gap-1">
                <div className="h-4 w-12 animate-pulse rounded bg-gray-300 dark:bg-gray-600" /> {/* Rate */}
                <div className="h-4 w-4 animate-pulse rounded bg-gray-300 dark:bg-gray-600" /> {/* Arrow */}
            </div>
        </div>
    </div>
);

export default CardSkeleton;