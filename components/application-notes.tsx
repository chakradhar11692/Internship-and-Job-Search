"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { Plus, MessageSquare } from "lucide-react"

interface Note {
  id: string
  note_type: string
  content: string
  created_at: string
}

interface ApplicationNotesProps {
  applicationId: string
}

export function ApplicationNotes({ applicationId }: ApplicationNotesProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState("")
  const [noteType, setNoteType] = useState("general")
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function loadNotes() {
      try {
        const { data, error } = await supabase
          .from("application_notes")
          .select("*")
          .eq("application_id", applicationId)
          .order("created_at", { ascending: false })

        if (error) throw error
        setNotes(data || [])
      } catch (error) {
        console.error("Error loading notes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotes()
  }, [supabase, applicationId])

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setIsAdding(true)
    try {
      const { data, error } = await supabase
        .from("application_notes")
        .insert({
          application_id: applicationId,
          note_type: noteType,
          content: newNote.trim()
        })
        .select()
        .single()

      if (error) throw error
      
      setNotes([data, ...notes])
      setNewNote("")
      setNoteType("general")
      setShowAddForm(false)
    } catch (error) {
      console.error("Error adding note:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'interview':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'follow_up':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'offer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'rejection':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case 'interview':
        return 'Interview'
      case 'follow_up':
        return 'Follow Up'
      case 'offer':
        return 'Offer'
      case 'rejection':
        return 'Rejection'
      default:
        return 'General'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Notes & Updates
            </CardTitle>
            <CardDescription>Track your thoughts and updates about this application</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Add Note Form */}
        {showAddForm && (
          <div className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Select value={noteType} onValueChange={setNoteType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Note</SelectItem>
                  <SelectItem value="interview">Interview Note</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="offer">Offer Details</SelectItem>
                  <SelectItem value="rejection">Rejection Feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Add your note here..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddNote} disabled={isAdding || !newNote.trim()}>
                {isAdding ? "Adding..." : "Add Note"}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Notes List */}
        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getNoteTypeColor(note.note_type)}>
                    {getNoteTypeLabel(note.note_type)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notes yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}