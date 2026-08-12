"use client"

import * as React from "react"
import { Palette } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeSwitcher() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-full shadow-sm h-10 w-10">
        <Palette className="h-[1.2rem] w-[1.2rem] transition-all" />
        <span className="sr-only">Tema Değiştir</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("fistik-serbet")}>
          <span className="w-3 h-3 rounded-full bg-[#27AE60] mr-2"></span>
          Taze Fıstık ve Şerbet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("bakir-firin")}>
          <span className="w-3 h-3 rounded-full bg-[#D35400] mr-2"></span>
          Bakır Tepsi ve Fırın
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("gece-carsisi")}>
          <span className="w-3 h-3 rounded-full bg-[#00FF66] mr-2"></span>
          Gece Çarşısı (Karanlık)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("kutnu-mozaik")}>
          <span className="w-3 h-3 rounded-full bg-[#C0392B] mr-2"></span>
          Kutnu Kumaşı
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
