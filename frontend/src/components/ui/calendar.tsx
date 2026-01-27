"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, CaptionProps, useNavigation } from "react-day-picker";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

import { cn } from "./utils";

function CustomCaption(props: CaptionProps) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();
  return (
    <div className="flex items-center justify-between px-1 py-2">
      <button
        type="button"
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
        className="h-7 w-7 bg-transparent p-0 hover:bg-[#f5f1e8] inline-flex items-center justify-center rounded-md border border-[#e8e3d6] text-[#737373] hover:text-[#1a1a1a] transition-colors disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm font-medium text-[#1a1a1a]">
        {format(props.displayMonth, "yyyy年M月", { locale: zhCN })}
      </span>
      <button
        type="button"
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
        className="h-7 w-7 bg-transparent p-0 hover:bg-[#f5f1e8] inline-flex items-center justify-center rounded-md border border-[#e8e3d6] text-[#737373] hover:text-[#1a1a1a] transition-colors disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "hidden",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-[#737373] rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "h-9 w-9 text-center text-sm p-0 relative",
          "[&:has([aria-selected].day-outside)]:bg-[#f5f1e8]/50",
          "[&:has([aria-selected])]:bg-[#f5f1e8]",
          "first:[&:has([aria-selected])]:rounded-l-md",
          "last:[&:has([aria-selected])]:rounded-r-md",
          "focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          "h-9 w-9 p-0 font-normal inline-flex items-center justify-center rounded-md text-[#1a1a1a]",
          "hover:bg-[#f5f1e8]",
          "focus:bg-[#f5f1e8]",
          "aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-[#2d5f3f] text-white hover:bg-[#3d7a54] hover:text-white focus:bg-[#2d5f3f] focus:text-white",
        day_today: "bg-[#f5f1e8] text-[#2d5f3f] font-medium",
        day_outside:
          "day-outside text-[#a0a0a0] aria-selected:bg-[#f5f1e8]/50 aria-selected:text-[#737373]",
        day_disabled: "text-[#a0a0a0] opacity-50",
        day_range_middle:
          "aria-selected:bg-[#f5f1e8] aria-selected:text-[#1a1a1a]",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: CustomCaption,
      }}
      {...props}
    />
  );
}

export { Calendar };
