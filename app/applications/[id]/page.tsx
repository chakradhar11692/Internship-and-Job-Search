import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Calendar, MapPin, DollarSign, Building, ExternalLink } from "lucide-react"
import { ApplicationStatusUpdater } from "@/components/application-status-updater"
import { ApplicationNotes } from "@/components/application-notes"

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { id } = await params

  // Get application details with job information
  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .select(`
      *,
      job_listings (
        id,
        title,
        company,
        location,
        job_type,
        description,
        requirements,
        skills_required,
        salary_min,
        salary_max,
        application_deadline
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (applicationError || !application) {
    notFound()
  }

  const job = application.job_listings
  if (!job) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "Under Review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Interview Scheduled":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "Interview Completed":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
      case "Offer Received":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "Withdrawn":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `$${min.toLocaleString()}+`
    if (max) return `Up to $${max.toLocaleString()}`
    return null
  }

  const salary = formatSalary(job.salary_min, job.salary_max)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/applications">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Button>
            </Link>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="outline" type="submit">
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Information */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-3">{job.title}</CardTitle>
                    <div className="flex items-center gap-4 text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span className="font-medium">{job.company}</span>
                      </div>
                      {job.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.job_type && <Badge variant="outline">{job.job_type}</Badge>}
                      {salary && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {salary}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Link href={`/jobs/${job.id}`}>
                    <Button variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Job
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>

            {/* Job Description */}
            {job.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{job.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Application Notes */}
            <ApplicationNotes applicationId={application.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Status */}
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Badge className={`${getStatusColor(application.status)} text-sm px-3 py-1`}>
                    {application.status}
                  </Badge>

                  <ApplicationStatusUpdater
                    applicationId={application.id}
                    currentStatus={application.status}
                    interviewDate={application.interview_date}
                    followUpDate={application.follow_up_date}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Application Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Applied</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(application.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {application.interview_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Interview Scheduled</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(application.interview_date).toLocaleDateString()} at{" "}
                        {new Date(application.interview_date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {application.follow_up_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Follow Up</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(application.follow_up_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            {(application.contact_person || application.contact_email) && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {application.contact_person && (
                    <div>
                      <p className="text-sm font-medium">Contact Person</p>
                      <p className="text-sm text-muted-foreground">{application.contact_person}</p>
                    </div>
                  )}
                  {application.contact_email && (
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{application.contact_email}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
