"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Save } from "lucide-react"

interface ApplicationStatusUpdaterProps {
  applicationId: string
  currentStatus: string
  interviewDate: string | null
  followUpDate: string | null
}

export function ApplicationStatusUpdater({
  applicationId,
  currentStatus,
  interviewDate,
  followUpDate,
}: ApplicationStatusUpdaterProps) {
  const [status, setStatus] = useState(currentStatus)
  const [interview, setInterview] = useState(interviewDate ? new Date(interviewDate).toISOString().slice(0, 16) : "")
  const [followUp, setFollowUp] = useState(followUpDate ? new Date(followUpDate).toISOString().slice(0, 10) : "")
  const [notes, setNotes] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleUpdate = async () => {
    setIsUpdating(true)
    setError(null)

    try {
      const updates: any = {
        status,
        interview_date: interview ? new Date(interview).toISOString() : null,
        follow_up_date: followUp ? new Date(followUp).toISOString() : null,
      }

      if (notes.trim()) updates.notes = notes
      if (contactPerson.trim()) updates.contact_person = contactPerson
      if (contactEmail.trim()) updates.contact_email = contactEmail

      const { error: updateError } = await supabase.from("applications").update(updates).eq("id", applicationId)

      if (updateError) throw updateError

      router.refresh()
    } catch (error) {
      console.error("Error updating application:", error)
      setError("Failed to update application")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Applied">Applied</SelectItem>
            <SelectItem value="Under Review">Under Review</SelectItem>
            <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
            <SelectItem value="Interview Completed">Interview Completed</SelectItem>
            <SelectItem value="Offer Received">Offer Received</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Withdrawn">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(status === "Interview Scheduled" || status === "Interview Completed") && (
        <div className="space-y-2">
          <Label htmlFor="interview">Interview Date & Time</Label>
          <Input
            id="interview"
            type="datetime-local"
            value={interview}
            onChange={(e) => setInterview(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="followUp">Follow Up Date</Label>
        <Input id="followUp" type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPerson">Contact Person</Label>
        <Input
          id="contactPerson"
          placeholder="Hiring Manager Name"
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input
          id="contactEmail"
          type="email"
          placeholder="recruiter@company.com"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add any notes about this application..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      <Button onClick={handleUpdate} disabled={isUpdating} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        {isUpdating ? "Updating..." : "Update Application"}
      </Button>
    </div>
  )
}