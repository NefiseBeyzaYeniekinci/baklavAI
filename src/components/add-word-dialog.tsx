"use client"

import { useState } from "react"
import { BookPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function AddWordDialog() {
  const [open, setOpen] = useState(false)
  const [word, setWord] = useState("")
  const [meaning, setMeaning] = useState("")

  const handleSave = () => {
    // In a real app, this would save to Firebase/Supabase
    console.log("Saving word:", word, meaning)
    setOpen(false)
    setWord("")
    setMeaning("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex w-full items-center gap-4 px-4 py-3.5 rounded-[1.25rem] transition-all duration-200 text-left bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground">
        <BookPlus className="w-[18px] h-[18px] text-muted-foreground/70" />
        <span className="text-[15px]">Sözlüğe Ekle</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Antep Sözlüğüne Ekle</DialogTitle>
          <DialogDescription>
            BaklavAI'nin öğrenmesi için yöresel bir kelime ve anlamını ekleyin.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="word" className="text-right text-sm font-medium">
              Kelime
            </label>
            <Input
              id="word"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Örn: Sahre"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="meaning" className="text-right text-sm font-medium">
              Anlamı
            </label>
            <Input
              id="meaning"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="Örn: Piknik"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={!word || !meaning}>
            Sözlüğe Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
