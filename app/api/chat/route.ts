import { convertToModelMessages, streamText, type UIMessage } from "ai"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Get user profile and context for personalized responses
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: skills } = await supabase.from("skills").select("skill_name, proficiency_level").eq("user_id", user.id)

  const { data: projects } = await supabase
    .from("projects")
    .select("title, description, technologies")
    .eq("user_id", user.id)

  const { data: applications } = await supabase
    .from("applications")
    .select(`
      status,
      applied_at,
      job_listings (
        title,
        company,
        job_type
      )
    `)
    .eq("user_id", user.id)
    .order("applied_at", { ascending: false })
    .limit(5)

  // Build context for the AI
  const userContext = {
    profile: profile
      ? {
          name: profile.full_name,
          university: profile.university,
          degree: profile.degree,
          graduation_year: profile.graduation_year,
          gpa: profile.gpa,
        }
      : null,
    skills: skills?.map((s) => `${s.skill_name} (${s.proficiency_level})`) || [],
    projects:
      projects?.map((p) => ({
        title: p.title,
        description: p.description,
        technologies: p.technologies,
      })) || [],
    recent_applications:
      applications?.map((a) => ({
        job_title: a.job_listings?.title,
        company: a.job_listings?.company,
        job_type: a.job_listings?.job_type,
        status: a.status,
        applied_date: a.applied_at,
      })) || [],
  }

  const systemPrompt = `You are CareerCoach AI, a helpful and knowledgeable career advisor specifically designed to help students and new graduates with their career journey. You provide personalized advice based on their profile, skills, and career goals.

User Context:
${JSON.stringify(userContext, null, 2)}

Guidelines for responses:
1. Be encouraging, supportive, and professional
2. Provide specific, actionable advice tailored to their background
3. Reference their skills, projects, and profile when relevant
4. Help with resume tips, interview preparation, job search strategies, and career planning
5. Suggest skill development based on their current level and career goals
6. Keep responses concise but comprehensive (2-4 paragraphs max)
7. If they ask about specific jobs or companies, provide general industry insights
8. Encourage them to complete their profile if information is missing
9. Be honest about market realities while remaining optimistic

Remember: You're helping shape the next generation of professionals. Be their mentor and guide.`

  const prompt = convertToModelMessages([{ role: "system", content: systemPrompt }, ...messages])

  const result = streamText({
    model: "openai/gpt-4o",
    messages: prompt,
    abortSignal: req.signal,
    maxOutputTokens: 1000,
    temperature: 0.7,
  })

  return result.toUIMessageStreamResponse()
}
