"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MessageSquare } from "lucide-react"

export function FeedbackForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatusMessage(null)

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setStatusMessage({
          type: "success",
          message: "¡Gracias por tu feedback! Hemos recibido tu mensaje correctamente.",
        })
        setFormData({ name: "", email: "", message: "" })
        setTimeout(() => {
          setIsOpen(false)
          setStatusMessage(null)
        }, 2000)
      } else {
        const data = await response.json()
        throw new Error(data.error || "Error al enviar el feedback")
      }
    } catch (error) {
      setStatusMessage({
        type: "error",
        message: error instanceof Error ? error.message : "Hubo un problema al enviar tu feedback. Inténtalo de nuevo.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-green-600 transition-colors">
          <MessageSquare className="w-3 h-3 mr-1" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-green-700">Enviar Feedback</DialogTitle>
          <DialogDescription>
            Comparte tus sugerencias para mejorar JugáHora. Tu opinión es importante para nosotros.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {statusMessage && (
            <div
              className={`p-3 rounded-md ${
                statusMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {statusMessage.message}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nombre
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Mensaje
            </label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              className="min-h-[100px] border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
              {isSubmitting ? "Enviando..." : "Enviar feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

