"use client"

import type React from "react"
import { useChat, type Message } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { useRef, useEffect } from "react"
import { MessageSquare, Send, Bot, User, ArrowLeft } from "lucide-react"

interface ChatMessage extends Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { messages: rawMessages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const messages = rawMessages as ChatMessage[]

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSuggestedQuestion = (question: string) => {
    if (isLoading) return
    handleInputChange({ target: { value: question } } as React.ChangeEvent<HTMLInputElement>)
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>
    handleSubmit(fakeEvent)
  }

  const suggestedQuestions = [
    "How can I improve my resume?",
    "What skills should I focus on for software engineering roles?",
    "How do I prepare for technical interviews?",
    "What are some good entry-level positions for my background?",
    "How can I make my projects stand out to employers?",
    "What should I include in my cover letter?",
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">AI Career Coach</h1>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="outline" type="submit">
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          {/* Sidebar with suggestions */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Quick Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full text-left justify-start h-auto p-3 text-sm"
                      onClick={() => handleSuggestedQuestion(question)}
                      disabled={isLoading}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Your Personal Career Coach
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center py-8">
                        <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Welcome to your AI Career Coach!</h3>
                        <p className="text-muted-foreground mb-4">
                          I'm here to help you with career advice, resume tips, interview preparation, and more. Ask me
                          anything about your career journey!
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try asking one of the suggested questions or start with your own question.
                        </p>
                      </div>
                    )}

                    {messages.map((message: ChatMessage) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex gap-3 max-w-[80%] ${
                            message.role === "user" ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </div>
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="flex gap-3 max-w-[80%]">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-secondary text-secondary-foreground">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div className="rounded-lg px-4 py-2 bg-muted">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              <span className="text-sm text-muted-foreground">Thinking...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask me about your career, resume, interviews, or anything else..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!input || isLoading} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}