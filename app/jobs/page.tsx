import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Briefcase } from "lucide-react"
import { JobFilters } from "@/components/job-filters"
import { JobCard } from "@/components/job-card"

interface SearchParams {
  search?: string
  type?: string
  location?: string
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const params = await searchParams

  // Build query based on search parameters
  let query = supabase.from("job_listings").select("*").eq("is_active", true).order("created_at", { ascending: false })

  // Apply filters
  if (params.search) {
    query = query.or(
      `title.ilike.%${params.search}%,company.ilike.%${params.search}%,description.ilike.%${params.search}%`,
    )
  }

  if (params.type) {
    query = query.eq("job_type", params.type)
  }

  if (params.location) {
    query = query.ilike("location", `%${params.location}%`)
  }

  const { data: jobs, error: jobsError } = await query

  if (jobsError) {
    console.error("Error fetching jobs:", jobsError)
  }

  // Get user's applications to show applied status
  const { data: applications } = await supabase.from("applications").select("job_id").eq("user_id", user.id)

  const appliedJobIds = new Set(applications?.map((app) => app.job_id) || [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">← Dashboard</Button>
            </Link>
            <h1 className="text-2xl font-bold">Job Opportunities</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/applications">
              <Button variant="outline">My Applications</Button>
            </Link>
            <form action="/auth/signout" method="post">
              <Button variant="outline" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2 text-balance">Find Your Next Opportunity</h2>
            <p className="text-muted-foreground text-pretty">
              Discover internships and jobs that match your skills and career goals.
            </p>
          </div>
          <JobFilters />
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {jobs?.length || 0} opportunities found
            {params.search && ` for "${params.search}"`}
            {params.type && ` in ${params.type}`}
            {params.location && ` in ${params.location}`}
          </p>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {jobs && jobs.length > 0 ? (
            jobs.map((job) => <JobCard key={job.id} job={job} isApplied={appliedJobIds.has(job.id)} />)
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or check back later for new opportunities.
                </p>
                <Link href="/jobs">
                  <Button>Clear Filters</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
