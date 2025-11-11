import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, ExternalLink, Github } from "lucide-react"

interface Resume {
  id: string
  title: string
  template: string
  content: {
    personal: {
      name: string
      email: string
      phone: string
      location: string
      summary: string
    }
    education: {
      university: string
      degree: string
      graduation_year: string
      gpa: string
    }
    skills: string[]
    projects: Array<{
      title: string
      description: string
      technologies: string[]
      github_url: string
      demo_url: string
      duration: string
    }>
    experience: Array<{
      title: string
      company: string
      duration: string
      description: string
    }>
  }
}

interface ResumePreviewProps {
  resume: Resume
}

export function ResumePreview({ resume }: ResumePreviewProps) {
  const { content } = resume

  return (
    <Card className="max-w-4xl mx-auto bg-white text-black shadow-lg">
      <CardContent className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{content.personal.name}</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600 flex-wrap">
            {content.personal.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{content.personal.email}</span>
              </div>
            )}
            {content.personal.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{content.personal.phone}</span>
              </div>
            )}
            {content.personal.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{content.personal.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        {content.personal.summary && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-blue-600 border-b border-blue-200 pb-1">Professional Summary</h2>
            <p className="text-gray-700 leading-relaxed">{content.personal.summary}</p>
          </div>
        )}

        {/* Education */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3 text-blue-600 border-b border-blue-200 pb-1">Education</h2>
          <div>
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold">{content.education.degree}</h3>
              <span className="text-sm text-gray-600">{content.education.graduation_year}</span>
            </div>
            <p className="text-gray-700">{content.education.university}</p>
            {content.education.gpa && <p className="text-sm text-gray-600">GPA: {content.education.gpa}</p>}
          </div>
        </div>

        {/* Skills */}
        {content.skills && content.skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-blue-600 border-b border-blue-200 pb-1">Technical Skills</h2>
            <div className="flex flex-wrap gap-2">
              {content.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-800">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {content.projects && content.projects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-blue-600 border-b border-blue-200 pb-1">Projects</h2>
            <div className="space-y-4">
              {content.projects.map((project, index) => (
                <div key={index}>
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold">{project.title}</h3>
                    {project.duration && <span className="text-sm text-gray-600">{project.duration}</span>}
                  </div>
                  <p className="text-gray-700 mb-2 leading-relaxed">{project.description}</p>

                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {project.technologies.map((tech, techIndex) => (
                        <Badge key={techIndex} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4 text-sm">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Github className="h-3 w-3" />
                        GitHub
                      </a>
                    )}
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {content.experience && content.experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-blue-600 border-b border-blue-200 pb-1">Experience</h2>
            <div className="space-y-4">
              {content.experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-semibold">{exp.title}</h3>
                      <p className="text-gray-700">{exp.company}</p>
                    </div>
                    <span className="text-sm text-gray-600">{exp.duration}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
