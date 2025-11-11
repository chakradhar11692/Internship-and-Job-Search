import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { profile, education, skills, projects } = await req.json()

  const prompt = `Generate a professional resume summary for a student/new graduate with the following background:

Personal Info:
- Name: ${profile.name}
- Education: ${education.degree} at ${education.university} (Graduating ${education.graduation_year})
- GPA: ${education.gpa || "Not specified"}

Skills: ${skills.join(", ")}

Projects: ${projects.map((p: any) => `${p.title} - ${p.description}`).join("; ")}

Write a compelling 2-3 sentence professional summary that:
1. Highlights their academic background and key skills
2. Mentions relevant projects or experience
3. Shows enthusiasm for their field
4. Is tailored for entry-level positions or internships
5. Uses action words and quantifiable achievements where possible

Keep it concise, professional, and engaging. Focus on what makes them a strong candidate despite being early in their career.`

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      maxOutputTokens: 200,
      temperature: 0.7,
    })

    return Response.json({ summary: text.trim() })
  } catch (error) {
    console.error("Error generating summary:", error)
    return new Response("Failed to generate summary", { status: 500 })
  }
}
