"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import "react-day-picker/dist/style.css" // <--- ¡IMPORTANTE!

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const customEsLocale = {
  ...es,
  options: {
    ...es.options,
    weekStartsOn: 1 as const,
  },
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={customEsLocale}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-4",
        caption: "flex justify-between items-center px-2",
        caption_label: "text-sm font-medium",
        nav: "flex items-center space-x-1",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-6 w-6 p-0 text-muted-foreground"
        ),
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7", // <-- ¡Clave!
        head_cell: "text-muted-foreground w-9 h-9 font-normal text-[0.75rem] text-center",
        row: "grid grid-cols-7", // <-- ¡Clave!
        cell: "w-9 h-9 text-center text-sm p-0 relative",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        
        day_selected: "bg-primary text-primary-foreground",
        day_today: "border border-primary text-primary",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "bg-accent text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
