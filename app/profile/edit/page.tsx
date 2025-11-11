"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { User } from "lucide-react"

interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  university: string | null
  degree: string | null
  graduation_year: number | null
  gpa: number | null
  school_name: string | null
  school_percentage: number | null
  school_completion_year: number | null
  intermediate_college: string | null
  intermediate_stream: string | null
  intermediate_percentage: number | null
  intermediate_completion_year: number | null
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()
        
        if (authError) {
          console.error("Auth error:", authError)
          setError("Authentication failed. Please try logging in again.")
          return
        }

        if (!user) {
          router.push("/auth/login")
          return
        }

        console.log("Fetching profile for user:", user.id)
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) {
          console.error("Database error:", error)
          // If profile doesn't exist, create it
          if (error.code === "PGRST116") {
            console.log("Profile not found, creating new profile...")
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                email: user.email,
                full_name: "",
              })
              .select()
              .single()

            if (createError) {
              console.error("Error creating profile:", createError)
              setError("Failed to create profile. Please try logging out and back in.")
              return
            }

            setProfile(newProfile)
            return
          }
          
          setError(`Failed to load profile: ${error.message}`)
          return
        }

        if (!data) {
          console.error("No profile data found")
          setError("Profile data not found")
          return
        }

        console.log("Profile loaded successfully:", data)
        setProfile(data)
      } catch (error: any) {
        console.error("Error loading profile:", error)
        setError(error?.message || "Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!profile) return

    setIsSaving(true)
    setError(null)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          university: profile.university,
          degree: profile.degree,
          graduation_year: profile.graduation_year,
          gpa: profile.gpa,
          school_name: profile.school_name,
          school_percentage: profile.school_percentage,
          school_completion_year: profile.school_completion_year,
          intermediate_college: profile.intermediate_college,
          intermediate_stream: profile.intermediate_stream,
          intermediate_percentage: profile.intermediate_percentage,
          intermediate_completion_year: profile.intermediate_completion_year,
        })
        .eq("id", profile.id)

      if (error) throw error
      router.push("/profile")
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load profile</p>
          <Link href="/profile">
            <Button className="mt-4">Back to Profile</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button variant="ghost">← Back to Profile</Button>
            </Link>
            <h1 className="text-2xl font-bold">Edit Profile</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {error && (
          <div className="mb-6 p-4 text-destructive-foreground bg-destructive/10 border-2 border-destructive rounded-lg">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
            {error.includes("Authentication failed") && (
              <Button variant="outline" className="mt-2" onClick={() => router.push("/auth/login")}>
                Go to Login
              </Button>
            )}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your personal and academic information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={profile.full_name || ""}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    type="text"
                    value={profile.university || ""}
                    onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                    placeholder="University of Technology"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="degree">Degree Program</Label>
                  <Input
                    id="degree"
                    type="text"
                    value={profile.degree || ""}
                    onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                    placeholder="Computer Science"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Select
                    value={profile.graduation_year?.toString() || ""}
                    onValueChange={(value) => setProfile({ ...profile, graduation_year: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA (Optional)</Label>
                  <Input
                    id="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={profile.gpa || ""}
                    onChange={(e) => setProfile({ ...profile, gpa: Number.parseFloat(e.target.value) || null })}
                    placeholder="8.75"
                  />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Education Details</CardTitle>
                  <CardDescription>Your academic background</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* School Details */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">School Education</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="schoolName">School Name</Label>
                          <Input
                            id="schoolName"
                            value={profile?.school_name || ""}
                            onChange={(e) => setProfile({ ...profile, school_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schoolPercentage">Percentage/CGPA</Label>
                          <Input
                            id="schoolPercentage"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={profile?.school_percentage || ""}
                            onChange={(e) => setProfile({ ...profile, school_percentage: parseFloat(e.target.value) || null })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schoolCompletionYear">Completion Year</Label>
                          <Input
                            id="schoolCompletionYear"
                            type="number"
                            value={profile?.school_completion_year || ""}
                            onChange={(e) => setProfile({ ...profile, school_completion_year: parseInt(e.target.value) || null })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Intermediate/Junior College Details */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Intermediate/Junior College</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="intermediateCollege">College Name</Label>
                          <Input
                            id="intermediateCollege"
                            value={profile?.intermediate_college || ""}
                            onChange={(e) => setProfile({ ...profile, intermediate_college: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="intermediateStream">Stream</Label>
                          <Input
                            id="intermediateStream"
                            value={profile?.intermediate_stream || ""}
                            onChange={(e) => setProfile({ ...profile, intermediate_stream: e.target.value })}
                            placeholder="e.g., Science, Commerce, Arts"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="intermediatePercentage">Percentage/CGPA</Label>
                          <Input
                            id="intermediatePercentage"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={profile?.intermediate_percentage || ""}
                            onChange={(e) => setProfile({ ...profile, intermediate_percentage: parseFloat(e.target.value) || null })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="intermediateCompletionYear">Completion Year</Label>
                          <Input
                            id="intermediateCompletionYear"
                            type="number"
                            value={profile?.intermediate_completion_year || ""}
                            onChange={(e) => setProfile({ ...profile, intermediate_completion_year: parseInt(e.target.value) || null })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* University Details */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">University Education</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Existing university education fields */}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {error && (
                <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={isSaving} className="flex-1">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Link href="/profile">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}