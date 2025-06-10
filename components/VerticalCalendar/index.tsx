import React from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  subDays,
  addDays,
} from "date-fns";
import { UTCDate } from "@date-fns/utc";

const getWeeksInMonth = (year: number, month: number) => {
  const firstDay = startOfMonth(new Date(year, month - 1));
  const lastDay = endOfMonth(new Date(year, month - 1));

  return Math.ceil((getDay(firstDay) + lastDay.getDate()) / 7);
};

interface VerticalCalendarProps {
  year: number;
  month: number;
}

const VerticalCalendar: React.FC<VerticalCalendarProps> = ({ year, month }) => {
  const firstDay = startOfMonth(new UTCDate(year, month - 1, 1));
  const lastDay = endOfMonth(new UTCDate(year, month - 1));
  const startDayOfWeek = getDay(firstDay);
  const calendarStart = subDays(firstDay, startDayOfWeek);

  const weeksInMonth = getWeeksInMonth(year, month);
  const totalDays = weeksInMonth * 7;

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: addDays(calendarStart, totalDays - 1),
  });

  const getBackgroundColor = (/*dayIndex: number*/) => {
    // if (dayIndex%7 === 0 || dayIndex%7 === 6) return "border border-grey-300";
    const levels = ["100", "200", "300", "400", "500", "600", "700", "800"];
    const colors = ["grey", "red", "green"];
    const randomLevel = levels[Math.floor(Math.random() * levels.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return randomColor === "grey"
      ? "bg-grey-300"
      : `bg-${randomColor}-${randomLevel}`;
  };

  const isValidDay = (day: Date) => day >= firstDay && day <= lastDay && day <= new UTCDate();
  const isWorkDay = (day: Date) => day.getDay() != 0 && day.getDay() != 6

  return (
    <div className="flex flex-col items-end ml-2 pr-2 pb-2">
      <label className="text-sm text-grey-500">{format(firstDay, "MMM")}</label>
      <div className="grid grid-rows-5 grid-flow-col gap-1">
        {calendarDays.map((day/*, index*/) => {
          if(!isWorkDay(day))
              return
          const klassName = `w-4 h-4 rounded-full flex ${isValidDay(day) ? getBackgroundColor(/*index*/) : "bg-grey-200"}`
          return (
            <div key={day.toUTCString()} className={klassName}>
              {/* {day.getUTCDate()} */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VerticalCalendar;