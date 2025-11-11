import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Briefcase, MessageSquare, FileText, TrendingUp, Users } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-balance">CareerCoach AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6 text-balance bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Your AI-Powered Career Coach
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Get personalized career guidance, find the perfect internships and jobs, and accelerate your professional
            journey with intelligent matching and AI-powered insights.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8">
                Start Your Journey
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold mb-4 text-balance">Everything You Need to Succeed</h3>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Our comprehensive platform combines AI intelligence with practical tools to guide your career journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader>
              <Briefcase className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Smart Job Matching</CardTitle>
              <CardDescription>
                AI-powered matching algorithm that finds opportunities perfectly aligned with your skills and
                aspirations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-primary mb-4" />
              <CardTitle>AI Career Coach</CardTitle>
              <CardDescription>
                Get personalized advice, interview preparation, and career guidance from our intelligent assistant.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader>
              <FileText className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Resume Builder</CardTitle>
              <CardDescription>
                Create professional resumes tailored to specific roles with AI-powered optimization and feedback.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>
                Monitor your applications, track your skill development, and measure your career growth over time.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Profile Management</CardTitle>
              <CardDescription>
                Showcase your skills, projects, and achievements in a comprehensive professional profile.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader>
              <GraduationCap className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Student-Focused</CardTitle>
              <CardDescription>
                Designed specifically for students and new graduates entering the competitive job market.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4 text-balance">Ready to Launch Your Career?</h3>
          <p className="text-lg text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Join thousands of students who have successfully landed their dream internships and jobs with CareerCoach
            AI.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="text-lg px-8">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 CareerCoach AI. Empowering the next generation of professionals.</p>
        </div>
      </footer>
    </div>
  )
}
