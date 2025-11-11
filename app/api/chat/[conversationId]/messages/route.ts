import { createClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { conversationId } = await params

  // Verify user owns this conversation
  const { data: conversation } = await supabase
    .from("chat_conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .single()

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 })
  }

  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) {
    return new Response("Failed to fetch messages", { status: 500 })
  }

  return Response.json({ messages })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { conversationId } = await params
  const { role, content } = await req.json()

  // Verify user owns this conversation
  const { data: conversation } = await supabase
    .from("chat_conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .single()

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 })
  }

  const { data: message, error } = await supabase
    .from("chat_messages")
    .insert({
      conversation_id: conversationId,
      role,
      content,
    })
    .select()
    .single()

  if (error) {
    return new Response("Failed to save message", { status: 500 })
  }

  return Response.json({ message })
}
