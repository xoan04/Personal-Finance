"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFinance } from "@/context/finance-context"
import { currencies } from "@/lib/types"
import { ChevronDown } from "lucide-react"

export function CurrencySelector() {
  const { data, changeCurrency } = useFinance()
  const { currency } = data

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
        >
          <span className="text-sm sm:text-base">{currency.symbol}</span>
          <span className="text-sm sm:text-base hidden xs:inline-block">{currency.code}</span>
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[280px] sm:w-[320px]"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-sm sm:text-base px-3 py-2">
          Seleccionar moneda
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => changeCurrency(curr)}
            className={`px-3 py-2 ${curr.code === currency.code ? "bg-muted" : ""}`}
          >
            <div className="flex items-center gap-2 w-full">
              <span className="text-sm sm:text-base font-medium min-w-[24px]">
                {curr.symbol}
              </span>
              <span className="text-sm sm:text-base font-medium">
                {curr.code}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground ml-auto">
                {curr.name}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
