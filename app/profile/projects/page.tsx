"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Code, Plus, Trash2, ExternalLink, Github } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string | null
  technologies: string[] | null
  github_url: string | null
  demo_url: string | null
  start_date: string | null
  end_date: string | null
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    technologies: "",
    github_url: "",
    demo_url: "",
    start_date: "",
    end_date: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadProjects() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setProjects(data || [])
      } catch (error) {
        console.error("Error loading projects:", error)
        setError("Failed to load projects")
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [supabase, router])

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProject.title) return

    setIsAdding(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const technologies = newProject.technologies
        ? newProject.technologies
            .split(",")
            .map((tech) => tech.trim())
            .filter((tech) => tech)
        : []

      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          title: newProject.title,
          description: newProject.description || null,
          technologies: technologies.length > 0 ? technologies : null,
          github_url: newProject.github_url || null,
          demo_url: newProject.demo_url || null,
          start_date: newProject.start_date || null,
          end_date: newProject.end_date || null,
        })
        .select()
        .single()

      if (error) throw error
      setProjects([data, ...projects])
      setNewProject({
        title: "",
        description: "",
        technologies: "",
        github_url: "",
        demo_url: "",
        start_date: "",
        end_date: "",
      })
      setShowAddForm(false)
    } catch (error) {
      console.error("Error adding project:", error)
      setError("Failed to add project")
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectId)

      if (error) throw error
      setProjects(projects.filter((project) => project.id !== projectId))
    } catch (error) {
      console.error("Error deleting project:", error)
      setError("Failed to delete project")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading projects...</p>
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
            <h1 className="text-2xl font-bold">Manage Projects</h1>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Add New Project Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Project
              </CardTitle>
              <CardDescription>Showcase your work and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProject} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      type="text"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      placeholder="My Awesome Project"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="technologies">Technologies</Label>
                    <Input
                      id="technologies"
                      type="text"
                      value={newProject.technologies}
                      onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                      placeholder="React, Node.js, MongoDB (comma-separated)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newProject.start_date}
                      onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newProject.end_date}
                      onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="githubUrl">GitHub URL</Label>
                    <Input
                      id="githubUrl"
                      type="url"
                      value={newProject.github_url}
                      onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })}
                      placeholder="https://github.com/username/project"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="demoUrl">Demo URL</Label>
                    <Input
                      id="demoUrl"
                      type="url"
                      value={newProject.demo_url}
                      onChange={(e) => setNewProject({ ...newProject, demo_url: e.target.value })}
                      placeholder="https://myproject.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Describe your project, what it does, and what you learned..."
                    rows={4}
                  />
                </div>

                {error && (
                  <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button type="submit" disabled={isAdding}>
                    {isAdding ? "Adding..." : "Add Project"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Projects List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Your Projects ({projects.length})
            </CardTitle>
            <CardDescription>Showcase your work and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <div className="space-y-6">
                {projects.map((project) => (
                  <div key={project.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {project.start_date && new Date(project.start_date).toLocaleDateString()} -{" "}
                          {project.end_date ? new Date(project.end_date).toLocaleDateString() : "Present"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {project.description && <p className="text-muted-foreground mb-4">{project.description}</p>}

                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.map((tech, index) => (
                          <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-4">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <Github className="h-4 w-4" />
                          GitHub
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No projects added yet</p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
