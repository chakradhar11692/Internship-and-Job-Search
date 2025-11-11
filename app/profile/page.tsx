import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { User, GraduationCap, Code, Plus, Edit } from "lucide-react"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user skills
  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get user projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">← Dashboard</Button>
            </Link>
            <h1 className="text-2xl font-bold">My Profile</h1>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="outline" type="submit">
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Personal Information */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your basic information and contact details</CardDescription>
            </div>
            <Link href="/profile/edit">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-lg">{profile?.full_name || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-lg">{profile?.email || user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-lg">{profile?.phone || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">University</label>
                <p className="text-lg">{profile?.university || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Degree</label>
                <p className="text-lg">{profile?.degree || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Graduation Year</label>
                <p className="text-lg">{profile?.graduation_year || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">GPA</label>
                <p className="text-lg">{profile?.gpa || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Skills & Expertise
              </CardTitle>
              <CardDescription>Your technical and professional skills</CardDescription>
            </div>
            <Link href="/profile/skills">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {skills && skills.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.map((skill) => (
                  <div key={skill.id} className="p-4 border rounded-lg">
                    <h3 className="font-medium">{skill.skill_name}</h3>
                    <p className="text-sm text-muted-foreground">{skill.proficiency_level}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No skills added yet</p>
                <Link href="/profile/skills">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Skill
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Projects & Experience
              </CardTitle>
              <CardDescription>Showcase your work and achievements</CardDescription>
            </div>
            <Link href="/profile/projects">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {projects && projects.length > 0 ? (
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
                      <Link href={`/profile/projects/${project.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    <p className="text-muted-foreground mb-4">{project.description}</p>
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
                          className="text-sm text-primary hover:underline"
                        >
                          GitHub →
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Live Demo →
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
                <Link href="/profile/projects">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Project
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
