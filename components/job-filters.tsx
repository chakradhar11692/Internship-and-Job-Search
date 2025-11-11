"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export function JobFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [type, setType] = useState(searchParams.get("type") || "All Types")
  const [location, setLocation] = useState(searchParams.get("location") || "")

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (search) params.set("search", search)
    if (type !== "All Types") params.set("type", type)
    if (location) params.set("location", location)

    router.push(`/jobs?${params.toString()}`)
  }

  const handleClear = () => {
    setSearch("")
    setType("All Types")
    setLocation("")
    router.push("/jobs")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="bg-card p-6 rounded-lg border">
      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <div className="md:col-span-2">
          <Input
            placeholder="Search jobs, companies, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full"
          />
        </div>

        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Types">All Types</SelectItem>
            <SelectItem value="Internship">Internship</SelectItem>
            <SelectItem value="Full-time">Full-time</SelectItem>
            <SelectItem value="Part-time">Part-time</SelectItem>
            <SelectItem value="Contract">Contract</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSearch} className="flex-1 md:flex-none">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        <Button variant="outline" onClick={handleClear}>
          Clear Filters
        </Button>
      </div>
    </div>
  )
}
