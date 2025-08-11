"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface RegistrationFormProps {
  onSuccess?: (userData: any) => void
  onSwitchToLogin?: () => void
}

export function RegistrationForm({ onSuccess, onSwitchToLogin }: RegistrationFormProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Basic validation
      if (!firstName || !lastName || !email || !password || !confirmPassword || !phoneNumber) {
        setError("Bitte alle Felder ausfüllen")
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError("Passwörter stimmen nicht überein")
        setLoading(false)
        return
      }

      if (password.length < 8) {
        setError("Passwort muss mindestens 8 Zeichen lang sein")
        setLoading(false)
        return
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError("Bitte geben Sie eine gültige E-Mail-Adresse ein")
        setLoading(false)
        return
      }

      // Registration
      const userData = await auth.register(firstName, lastName, email, password, phoneNumber)
      
      toast({
        title: "Registrierung erfolgreich",
        description: "Ihr Konto wurde erfolgreich erstellt!"
      })

      // Call success callback
      if (onSuccess) {
        onSuccess(userData.user || { email, first_name: firstName, last_name: lastName })
      }

    } catch (error) {
      console.error('Registration error:', error)
      
      // Extract specific error message from the error object
      let errorMessage = "Registration failed. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage)
      
      toast({
        title: "Registrierung fehlgeschlagen",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-xl font-normal text-black">buycycle.</span>
          <span className="bg-black text-white px-2 py-1 text-xs font-medium">Videos</span>
        </div>
        <CardTitle className="text-2xl">Konto erstellen</CardTitle>
        <CardDescription>
          Treten Sie buycycle bei, um für Cycling-Videos zu stimmen und sich mit der Community zu engagieren
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname</Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Vorname"
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
                placeholder="Nachname"
                required
              />
            </div>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort erstellen"
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Passwort bestätigen"
              required
              minLength={8}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-black hover:bg-gray-800" 
            disabled={loading}
          >
            {loading ? "Konto wird erstellt..." : "Konto erstellen"}
          </Button>
        </form>

        {onSwitchToLogin && (
          <div className="mt-4 text-center">
            <button 
              type="button"
              onClick={onSwitchToLogin}
              className="text-sm text-gray-600 hover:text-black"
            >
              Bereits ein Konto? Anmelden
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Mit der Erstellung eines Kontos stimmen Sie unseren Nutzungsbedingungen und Datenschutzrichtlinien zu.
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 