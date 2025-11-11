import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MapPin, Calendar, DollarSign, Building, Clock, Eye } from "lucide-react"

interface Application {
  id: string
  status: string
  applied_at: string
  interview_date: string | null
  follow_up_date: string | null
  notes: string | null
  job_listings: {
    id: string
    title: string
    company: string
    location: string | null
    job_type: string | null
    salary_min: number | null
    salary_max: number | null
    application_deadline: string | null
  } | null
}

interface ApplicationCardProps {
  application: Application
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const job = application.job_listings
  if (!job) return null

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
  const daysSinceApplied = Math.floor(
    (new Date().getTime() - new Date(application.applied_at).getTime()) / (1000 * 60 * 60 * 24),
  )

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
            <div className="flex items-center gap-4 text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span>{job.company}</span>
              </div>
              {job.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
              {job.job_type && <Badge variant="outline">{job.job_type}</Badge>}
              {salary && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {salary}
                </Badge>
              )}
            </div>
          </div>
          <Link href={`/applications/${application.id}`}>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Applied</p>
              <p className="text-muted-foreground">
                {new Date(application.applied_at).toLocaleDateString()}
                <span className="ml-1">({daysSinceApplied} days ago)</span>
              </p>
            </div>
          </div>

          {application.interview_date && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Interview</p>
                <p className="text-muted-foreground">{new Date(application.interview_date).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {application.follow_up_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Follow Up</p>
                <p className="text-muted-foreground">{new Date(application.follow_up_date).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>

        {application.notes && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground line-clamp-2">{application.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
