import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Briefcase, Calendar, ArrowLeft, Plus, Filter } from "lucide-react"
import { ApplicationCard } from "@/components/application-card"
import { ApplicationStats } from "@/components/application-stats"

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user's applications with job details
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      job_listings (
        id,
        title,
        company,
        location,
        job_type,
        salary_min,
        salary_max,
        application_deadline
      )
    `)
    .eq("user_id", user.id)
    .order("applied_at", { ascending: false })

  // Get application statistics
  const stats = {
    total: applications?.length || 0,
    applied: applications?.filter((app) => app.status === "Applied").length || 0,
    interviews:
      applications?.filter((app) => ["Interview Scheduled", "Interview Completed"].includes(app.status)).length || 0,
    offers: applications?.filter((app) => app.status === "Offer Received").length || 0,
    rejected: applications?.filter((app) => app.status === "Rejected").length || 0,
  }

  // Get upcoming interviews
  const upcomingInterviews =
    applications
      ?.filter(
        (app) =>
          app.interview_date && new Date(app.interview_date) > new Date() && app.status === "Interview Scheduled",
      )
      .sort((a, b) => new Date(a.interview_date!).getTime() - new Date(b.interview_date!).getTime()) || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">My Applications</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/jobs">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Find Jobs
              </Button>
            </Link>
            <form action="/auth/signout" method="post">
              <Button variant="outline" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Statistics */}
        <ApplicationStats stats={stats} />

        {/* Upcoming Interviews */}
        {upcomingInterviews.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Interviews
              </CardTitle>
              <CardDescription>Don't forget to prepare for these scheduled interviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingInterviews.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{application.job_listings?.title}</h3>
                      <p className="text-sm text-muted-foreground">{application.job_listings?.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{new Date(application.interview_date!).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(application.interview_date!).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Link href={`/applications/${application.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Applications List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">All Applications ({stats.total})</h2>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {applications && applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start applying to jobs to track your application progress here.
                </p>
                <Link href="/jobs">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Browse Jobs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
