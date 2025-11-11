import { createClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { data: conversations, error } = await supabase
    .from("chat_conversations")
    .select(`
      id,
      title,
      created_at,
      chat_messages (
        id,
        role,
        content,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return new Response("Failed to fetch conversations", { status: 500 })
  }

  return Response.json({ conversations })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { title } = await req.json()

  const { data: conversation, error } = await supabase
    .from("chat_conversations")
    .insert({
      user_id: user.id,
      title: title || "New Conversation",
    })
    .select()
    .single()

  if (error) {
    return new Response("Failed to create conversation", { status: 500 })
  }

  return Response.json({ conversation })
}
