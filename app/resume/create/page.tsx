"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { FileText, ArrowLeft, Wand2, Save } from "lucide-react"

interface Profile {
  full_name: string | null
  email: string
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

interface Skill {
  skill_name: string
  proficiency_level: string
}

interface Project {
  title: string
  description: string | null
  technologies: string[] | null
  github_url: string | null
  demo_url: string | null
  start_date: string | null
  end_date: string | null
}

interface ResumeData {
  personal: {
    name: string
    email: string
    phone: string
    location: string
    summary: string
  }
  education: {
    school_name: string
    school_percentage: string
    school_completion_year: string
    intermediate_college: string
    intermediate_stream: string
    intermediate_percentage: string
    intermediate_completion_year: string
    university: string
    degree: string
    graduation_year: string
    gpa: string
  }
  skills: string[]
  projects: Array<{
    title: string
    description: string
    technologies: string[]
    github_url: string
    demo_url: string
    duration: string
  }>
  experience: Array<{
    title: string
    company: string
    duration: string
    description: string
  }>
}

export default function CreateResumePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [resumeData, setResumeData] = useState<ResumeData>({
    personal: {
      name: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
    },
    education: {
      school_name: "",
      school_percentage: "",
      school_completion_year: "",
      intermediate_college: "",
      intermediate_stream: "",
      intermediate_percentage: "",
      intermediate_completion_year: "",
      university: "",
      degree: "",
      graduation_year: "",
      gpa: "",
    },
    skills: [],
    projects: [],
    experience: [],
  })
  const [resumeTitle, setResumeTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadUserData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }

        // Load profile
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        // Load skills
        const { data: skillsData } = await supabase.from("skills").select("*").eq("user_id", user.id)

        // Load projects
        const { data: projectsData } = await supabase.from("projects").select("*").eq("user_id", user.id)

        if (profileData) {
          setProfile(profileData)
          setResumeData((prev) => ({
            ...prev,
            personal: {
              name: profileData.full_name || "",
              email: profileData.email || user.email || "",
              phone: profileData.phone || "",
              location: profileData.university || "",
              summary: "",
            },
            education: {
              school_name: profileData.school_name || "",
              school_percentage: profileData.school_percentage?.toString() || "",
              school_completion_year: profileData.school_completion_year?.toString() || "",
              intermediate_college: profileData.intermediate_college || "",
              intermediate_stream: profileData.intermediate_stream || "",
              intermediate_percentage: profileData.intermediate_percentage?.toString() || "",
              intermediate_completion_year: profileData.intermediate_completion_year?.toString() || "",
              university: profileData.university || "",
              degree: profileData.degree || "",
              graduation_year: profileData.graduation_year?.toString() || "",
              gpa: profileData.gpa?.toString() || "",
            },
          }))
        }

        if (skillsData) {
          setSkills(skillsData)
          setResumeData((prev) => ({
            ...prev,
            skills: skillsData.map((skill) => skill.skill_name),
          }))
        }

        if (projectsData) {
          setProjects(projectsData)
          setResumeData((prev) => ({
            ...prev,
            projects: projectsData.map((project) => ({
              title: project.title,
              description: project.description || "",
              technologies: project.technologies || [],
              github_url: project.github_url || "",
              demo_url: project.demo_url || "",
              duration:
                project.start_date && project.end_date
                  ? `${new Date(project.start_date).toLocaleDateString()} - ${new Date(project.end_date).toLocaleDateString()}`
                  : project.start_date
                    ? `${new Date(project.start_date).toLocaleDateString()} - Present`
                    : "",
            })),
          }))
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        setError("Failed to load profile data")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [supabase, router])

  const generateSummary = async () => {
    setIsGeneratingSummary(true)
    try {
      const response = await fetch("/api/resume/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: resumeData.personal,
          education: resumeData.education,
          skills: resumeData.skills,
          projects: resumeData.projects,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate summary")

      const { summary } = await response.json()
      setResumeData((prev) => ({
        ...prev,
        personal: { ...prev.personal, summary },
      }))
    } catch (error) {
      console.error("Error generating summary:", error)
      setError("Failed to generate summary")
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const handleSave = async () => {
    if (!resumeTitle.trim()) {
      setError("Please enter a resume title")
      return
    }

    // Validate required fields
    if (!resumeData.personal.name) {
      setError("Please enter your full name")
      return
    }

    if (!resumeData.personal.email) {
      setError("Please enter your email")
      return
    }

    if (!resumeData.education.university || !resumeData.education.degree) {
      setError("Please enter your university and degree information")
      return
    }

    setIsSaving(true)
    setError(null)

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

      console.log("Saving resume with data:", { title: resumeTitle, content: resumeData })
      const { data: resume, error: saveError } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title: resumeTitle,
          template: "modern",
          content: resumeData,
        })
        .select()
        .single()

      if (saveError) {
        console.error("Database error:", saveError)
        setError(`Failed to save resume: ${saveError.message}`)
        return
      }

      if (!resume) {
        setError("Failed to save resume: No response from server")
        return
      }

      router.push(`/resume/${resume.id}`)
    } catch (error: any) {
      console.error("Error saving resume:", error)
      setError(error?.message || "Failed to save resume")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your profile data...</p>
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
            <Link href="/resume">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Resumes
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Create Resume</h1>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Resume"}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Resume Title */}
          <Card>
            <CardHeader>
              <CardTitle>Resume Details</CardTitle>
              <CardDescription>Give your resume a descriptive title</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="resumeTitle">Resume Title</Label>
                <Input
                  id="resumeTitle"
                  placeholder="e.g., Software Engineer Resume, Data Science Internship Resume"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your contact details and professional summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={resumeData.personal.name}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev,
                        personal: { ...prev.personal, name: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={resumeData.personal.email}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev,
                        personal: { ...prev.personal, email: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={resumeData.personal.phone}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev,
                        personal: { ...prev.personal, phone: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={resumeData.personal.location}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev,
                        personal: { ...prev.personal, location: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Button variant="outline" size="sm" onClick={generateSummary} disabled={isGeneratingSummary}>
                    <Wand2 className="h-4 w-4 mr-2" />
                    {isGeneratingSummary ? "Generating..." : "AI Generate"}
                  </Button>
                </div>
                <Textarea
                  id="summary"
                  placeholder="A brief professional summary highlighting your key strengths and career objectives..."
                  rows={4}
                  value={resumeData.personal.summary}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      personal: { ...prev.personal, summary: e.target.value },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle>Education Details</CardTitle>
              <CardDescription>Your complete academic background</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* School Education */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">School Education</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">School Name</Label>
                      <Input
                        id="schoolName"
                        value={resumeData.education.school_name}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            education: { ...prev.education, school_name: e.target.value },
                          }))
                        }
                        placeholder="Enter your school name"
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
                        value={resumeData.education.school_percentage}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            education: { ...prev.education, school_percentage: e.target.value },
                          }))
                        }
                        placeholder="e.g., 85.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schoolCompletionYear">Completion Year</Label>
                      <Input
                        id="schoolCompletionYear"
                        type="number"
                        value={resumeData.education.school_completion_year}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            education: { ...prev.education, school_completion_year: e.target.value },
                          }))
                        }
                        placeholder="e.g., 2020"
                      />
                    </div>
                  </div>
                </div>

                {/* Intermediate/Junior College */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Intermediate/Junior College</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="intermediateCollege">College Name</Label>
                      <Input
                        id="intermediateCollege"
                        value={resumeData.education.intermediate_college}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            education: { ...prev.education, intermediate_college: e.target.value },
                          }))
                        }
                        placeholder="Enter your college name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="intermediateStream">Stream</Label>
                      <Input
                        id="intermediateStream"
                        value={resumeData.education.intermediate_stream}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            education: { ...prev.education, intermediate_stream: e.target.value },
                          }))
                        }
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
                        value={resumeData.education.intermediate_percentage}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            education: { ...prev.education, intermediate_percentage: e.target.value },
                          }))
                        }
                        placeholder="e.g., 85.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="intermediateCompletionYear">Completion Year</Label>
                      <Input
                        id="intermediateCompletionYear"
                        type="number"
                        value={resumeData.education.intermediate_completion_year}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            education: { ...prev.education, intermediate_completion_year: e.target.value },
                          }))
                        }
                        placeholder="e.g., 2022"
                      />
                    </div>
                  </div>
                </div>

                {/* University Education */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">University Education</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="university">University</Label>
                      <Input
                        id="university"
                        value={resumeData.education.university}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            education: { ...prev.education, university: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="degree">Degree</Label>
                      <Input
                        id="degree"
                        value={resumeData.education.degree}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            education: { ...prev.education, degree: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">Graduation Year</Label>
                      <Input
                        id="graduationYear"
                        value={resumeData.education.graduation_year}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            education: { ...prev.education, graduation_year: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gpa">GPA (Optional)</Label>
                      <Input
                        id="gpa"
                        value={resumeData.education.gpa}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            education: { ...prev.education, gpa: e.target.value },
                          }))
                        }
                      />
                    </div>
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

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving Resume..." : "Save Resume"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
