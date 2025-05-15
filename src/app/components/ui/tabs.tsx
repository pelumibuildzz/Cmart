"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
  selectedTab: string
  setSelectedTab: (tab: string) => void
} | null>(null)

export function Tabs({
  defaultValue,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  defaultValue: string
}) {
  const [selectedTab, setSelectedTab] = React.useState(defaultValue)

  return (
    <TabsContext.Provider value={{ selectedTab, setSelectedTab }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex space-x-1 rounded-md bg-gray-100 p-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string
}) {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs")
  }
  
  const { selectedTab, setSelectedTab } = context
  const isSelected = selectedTab === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={() => setSelectedTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isSelected
          ? "bg-white text-primary shadow-sm"
          : "text-secondary/60 hover:text-secondary/80",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value: string
}) {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("TabsContent must be used within Tabs")
  }
  
  const { selectedTab } = context
  const isSelected = selectedTab === value

  if (!isSelected) {
    return null
  }

  return (
    <div
      role="tabpanel"
      className={cn("mt-2", className)}
      {...props}
    >
      {children}
    </div>
  )
} 