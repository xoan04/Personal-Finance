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
        <Button variant="outline" className="flex items-center gap-2">
          <span>{currency.symbol}</span>
          <span>{currency.code}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Seleccionar moneda</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => changeCurrency(curr)}
            className={curr.code === currency.code ? "bg-muted" : ""}
          >
            <span className="mr-2">{curr.symbol}</span>
            <span className="mr-auto">{curr.code}</span>
            <span className="text-muted-foreground text-xs">{curr.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
