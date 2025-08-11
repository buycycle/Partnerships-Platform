"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/lib/api"

interface AuthModalProps {
  onClose: () => void
  onAuthSuccess: (user: { email: string }) => void
}

export function AuthModal({ onClose, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
    // Basic validation
      if (isSignUp && (!firstName || !lastName || !phoneNumber)) {
        setError("Bitte alle Felder ausfüllen")
        setLoading(false)
        return
      }

    if (!email || !password) {
      setError("Bitte alle Felder ausfüllen")
      setLoading(false)
      return
    }

      if (password.length < 8) {
        setError("Passwort muss mindestens 8 Zeichen lang sein")
      setLoading(false)
      return
    }

      let userData
      if (isSignUp) {
        // Registration
        userData = await auth.register(firstName, lastName, email, password, phoneNumber)
      } else {
        // Login
        userData = await auth.login(email, password)
      }

      // Call success callback with user data
      onAuthSuccess(userData.user || { email })
      onClose()
    } catch (error) {
      console.error(`${isSignUp ? 'Registration' : 'Login'} error:`, error)
      
      // Extract error message from the error object
      let errorMessage = `${isSignUp ? 'Registration' : 'Login'} failed. Please try again.`;
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage)
    } finally {
    setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-xl font-normal text-black">buycycle.</span>
            <span className="bg-black text-white px-2 py-1 text-xs font-medium">Videos</span>
          </div>
          <CardTitle className="text-2xl">{isSignUp ? "Bei buycycle registrieren" : "Bei buycycle anmelden"}</CardTitle>
          <CardDescription>
            {isSignUp
              ? "Erstellen Sie ein Konto, um für Cycling-Videos zu stimmen"
              : "Melden Sie sich an, um für Ihre Lieblings-Cycling-Inhalte zu stimmen"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Vorname eingeben"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nachname eingeben"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Telefonnummer</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Telefonnummer eingeben"
                    required
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-Mail eingeben"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Passwort eingeben"
                required
                minLength={8}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-black hover:bg-gray-800" disabled={loading}>
              {loading ? "Lädt..." : isSignUp ? "Konto erstellen" : "Anmelden"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button 
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError("")
                setFirstName("")
                setLastName("")
                setEmail("")
                setPassword("")
                setPhoneNumber("")
              }} 
              className="text-sm text-gray-600 hover:text-black"
            >
              {isSignUp ? "Bereits ein Konto? Anmelden" : "Noch kein Konto? Registrieren"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
