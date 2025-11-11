import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MapPin, Clock, DollarSign, Calendar, Building, CheckCircle } from "lucide-react"

interface Job {
  id: string
  title: string
  company: string
  location: string | null
  job_type: string | null
  description: string | null
  requirements: string[] | null
  skills_required: string[] | null
  salary_min: number | null
  salary_max: number | null
  application_deadline: string | null
  created_at: string
}

interface JobCardProps {
  job: Job
  isApplied: boolean
}

export function JobCard({ job, isApplied }: JobCardProps) {
  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `$${min.toLocaleString()}+`
    if (max) return `Up to $${max.toLocaleString()}`
    return null
  }

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null
    const date = new Date(deadline)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Deadline passed"
    if (diffDays === 0) return "Due today"
    if (diffDays === 1) return "Due tomorrow"
    return `${diffDays} days left`
  }

  const salary = formatSalary(job.salary_min, job.salary_max)
  const deadline = formatDeadline(job.application_deadline)
  const isDeadlineSoon =
    job.application_deadline &&
    new Date(job.application_deadline).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000

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
              {job.job_type && (
                <Badge variant={job.job_type === "Internship" ? "secondary" : "default"}>{job.job_type}</Badge>
              )}
              {salary && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {salary}
                </Badge>
              )}
              {deadline && (
                <Badge variant={isDeadlineSoon ? "destructive" : "outline"} className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {deadline}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {isApplied ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Applied
              </Badge>
            ) : (
              <Link href={`/jobs/${job.id}`}>
                <Button>View Details</Button>
              </Link>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <CardDescription className="mb-4 line-clamp-3">{job.description}</CardDescription>

        {job.skills_required && job.skills_required.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Required Skills:</p>
            <div className="flex flex-wrap gap-1">
              {job.skills_required.slice(0, 6).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills_required.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{job.skills_required.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
          </div>

          {!isApplied && (
            <Link href={`/jobs/${job.id}`}>
              <Button variant="outline" size="sm">
                Learn More
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
