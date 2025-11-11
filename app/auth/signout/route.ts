import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Sign out the user
  await supabase.auth.signOut()

  // Redirect to home page
  return NextResponse.redirect(new URL("/", request.url))
}
