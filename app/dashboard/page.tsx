import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Briefcase, MessageSquare, FileText, User, TrendingUp, Plus } from "lucide-react"

export default async function DashboardPage() {
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

  // Get recent applications count
  const { count: applicationsCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Get skills count
  const { count: skillsCount } = await supabase
    .from("skills")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Get projects count
  const { count: projectsCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome back, {profile?.full_name || user.email}</span>
            <form action="/auth/signout" method="post">
              <Button variant="outline" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-balance">Welcome to Your Career Hub</h2>
          <p className="text-muted-foreground text-pretty">
            Track your progress, explore opportunities, and get personalized career guidance.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applicationsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Total applications submitted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{skillsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Skills in your profile</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Projects showcased</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.full_name ? "Complete" : "Incomplete"}</div>
              <p className="text-xs text-muted-foreground">Profile status</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Complete Your Profile</CardTitle>
              </div>
              <CardDescription>Add your education, skills, and projects to get better job matches</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/profile">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <CardTitle>Browse Opportunities</CardTitle>
              </div>
              <CardDescription>Discover internships and jobs tailored to your skills and interests</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/jobs">
                <Button className="w-full">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Find Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle>AI Career Coach</CardTitle>
              </div>
              <CardDescription>Get personalized advice and guidance for your career journey</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/chat">
                <Button className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Resume Builder</CardTitle>
              </div>
              <CardDescription>Create and optimize your resume with AI-powered suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/resume">
                <Button className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Build Resume
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Track Applications</CardTitle>
              </div>
              <CardDescription>Monitor your job applications and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/applications">
                <Button className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Applications
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
