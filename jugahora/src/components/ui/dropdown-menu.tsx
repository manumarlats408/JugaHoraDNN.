"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
}

const DropdownMenu = React.forwardRef<
  HTMLDivElement,
  DropdownMenuProps
>((props, ref) => {
  return <div ref={ref}>{props.children}</div>
})
DropdownMenu.displayName = "DropdownMenu"

interface DropdownMenuTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & DropdownMenuTriggerProps
>(({ asChild, children, ...props }, ref) => {
  const Comp = asChild ? React.cloneElement(children as React.ReactElement, { ref, ...props }) : (
    <button ref={ref} type="button" {...props}>
      {children}
    </button>
  )
  return Comp
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

interface DropdownMenuContentProps {
  align?: "start" | "center" | "end"
  children: React.ReactNode
  className?: string
}

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & DropdownMenuContentProps
>(({ align = "center", className, children, ...props }, ref) => {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref && 'current' in ref && ref.current && !(ref.current as HTMLElement).contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [ref])

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "top-full mt-1",
        {
          "left-0": align === "start",
          "left-1/2 -translate-x-1/2": align === "center",
          "right-0": align === "end",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = "DropdownMenuItem"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
}
