import * as React from "react"

import { cn } from "@/lib/utils"

// Ledger data grid: bronze header bar over stamped parchment rows.
// Cell padding is 3px/6px (density grid), never the stock 16px.
const Table = React.memo(React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("v-ledger caption-bottom text-[13px]", className)}
      {...props}
    />
  </div>
)))
Table.displayName = "Table"

const TableHeader = React.memo(React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-0", className)} {...props} />
)))
TableHeader.displayName = "TableHeader"

const TableBody = React.memo(React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
)))
TableBody.displayName = "TableBody"

const TableFooter = React.memo(React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t-2 border-[#332d20] font-bold [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
)))
TableFooter.displayName = "TableFooter"

const TableRow = React.memo(React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn("border-0", className)}
    {...props}
  />
)))
TableRow.displayName = "TableRow"

const TableHead = React.memo(React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "v-ledger-head [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
)))
TableHead.displayName = "TableHead"

const TableCell = React.memo(React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("[&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
)))
TableCell.displayName = "TableCell"

const TableCaption = React.memo(React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-2 text-[11px] text-[#979083]", className)}
    {...props}
  />
)))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
