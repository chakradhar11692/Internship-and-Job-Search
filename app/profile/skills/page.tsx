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
import { GraduationCap, Plus, Trash2 } from "lucide-react"

interface Skill {
  id: string
  skill_name: string
  proficiency_level: string
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [newSkill, setNewSkill] = useState({ name: "", level: "" })
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadSkills() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data, error } = await supabase
          .from("skills")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setSkills(data || [])
      } catch (error) {
        console.error("Error loading skills:", error)
        setError("Failed to load skills")
      } finally {
        setIsLoading(false)
      }
    }

    loadSkills()
  }, [supabase, router])

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkill.name || !newSkill.level) return

    setIsAdding(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("skills")
        .insert({
          user_id: user.id,
          skill_name: newSkill.name,
          proficiency_level: newSkill.level,
        })
        .select()
        .single()

      if (error) throw error
      setSkills([data, ...skills])
      setNewSkill({ name: "", level: "" })
    } catch (error) {
      console.error("Error adding skill:", error)
      setError("Failed to add skill")
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteSkill = async (skillId: string) => {
    try {
      const { error } = await supabase.from("skills").delete().eq("id", skillId)

      if (error) throw error
      setSkills(skills.filter((skill) => skill.id !== skillId))
    } catch (error) {
      console.error("Error deleting skill:", error)
      setError("Failed to delete skill")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading skills...</p>
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
            <h1 className="text-2xl font-bold">Manage Skills</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Add New Skill */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Skill
            </CardTitle>
            <CardDescription>Add a skill and specify your proficiency level</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="skillName">Skill Name</Label>
                  <Input
                    id="skillName"
                    type="text"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    placeholder="e.g., JavaScript, Python, React"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proficiencyLevel">Proficiency Level</Label>
                  <Select
                    value={newSkill.level}
                    onValueChange={(value) => setNewSkill({ ...newSkill, level: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={isAdding}>
                {isAdding ? "Adding..." : "Add Skill"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Skills List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Your Skills ({skills.length})
            </CardTitle>
            <CardDescription>Manage your technical and professional skills</CardDescription>
          </CardHeader>
          <CardContent>
            {skills.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.map((skill) => (
                  <div key={skill.id} className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{skill.skill_name}</h3>
                      <p className="text-sm text-muted-foreground">{skill.proficiency_level}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No skills added yet</p>
                <p className="text-sm text-muted-foreground">Add your first skill using the form above</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
