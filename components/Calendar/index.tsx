import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { EventInput } from '@fullcalendar/core';

const WeekdayCalendar: React.FC = () => {
    const events: EventInput[] = [
        { title: 'Rs.12345', start: new Date() },
        { title: '-55665', start: new Date("26-Sep-2024"), interactive: false, ui:{textColor:"#d61234"} },
    ];

    return (
        <div className="h-full p-4 bg-white dark:bg-boxdark shadow-lg rounded-lg overflow-hidden">
            <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    right: 'prev today next',
                    left: 'title',
                }}
                weekends={false}
                dayHeaderClassNames="bg-meta-9"
                events={events}
                // eventContent={{}}
                height="100%"
                lazyFetching={true}
            />
        </div>
    );
};

export default WeekdayCalendar;

