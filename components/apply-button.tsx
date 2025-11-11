"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Send } from "lucide-react"

interface ApplyButtonProps {
  jobId: string
}

export function ApplyButton({ jobId }: ApplyButtonProps) {
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleApply = async () => {
    setIsApplying(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Check if user has already applied
      const { data: existingApplication } = await supabase
        .from("applications")
        .select("id")
        .eq("user_id", user.id)
        .eq("job_id", jobId)
        .single()

      if (existingApplication) {
        setError("You have already applied to this job")
        return
      }

      // Create application
      const { error: applicationError } = await supabase.from("applications").insert({
        user_id: user.id,
        job_id: jobId,
        status: "Applied",
      })

      if (applicationError) throw applicationError

      // Refresh the page to show updated status
      router.refresh()
    } catch (error) {
      console.error("Error applying to job:", error)
      setError("Failed to submit application. Please try again.")
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className="text-center">
      <Button onClick={handleApply} disabled={isApplying} className="w-full mb-4" size="lg">
        <Send className="h-4 w-4 mr-2" />
        {isApplying ? "Applying..." : "Apply Now"}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">Your profile information will be used for this application</p>
    </div>
  )
}
