"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  Bold, 
  Italic, 
  Underline,
  List,
  ListOrdered,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Code,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}

export function RichTextEditor({ value, onChange, placeholder, error }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showHtml, setShowHtml] = useState(false)

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const handleImageUpload = async () => {
    const input = document.createElement("input")
    input.setAttribute("type", "file")
    input.setAttribute("accept", "image/*")
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      try {
        const formData = new FormData()
        formData.append("file", file)

        const token = localStorage.getItem("token")
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/files/upload/image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        )

        if (!response.ok) {
          throw new Error("Görsel yüklenemedi")
        }

        const result = await response.json()
        execCommand("insertImage", result.url)
      } catch (error) {
        console.error("Image upload error:", error)
        alert("Görsel yüklenemedi")
      }
    }
  }

  const handleVideoUpload = async () => {
    const input = document.createElement("input")
    input.setAttribute("type", "file")
    input.setAttribute("accept", "video/*")
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      try {
        const formData = new FormData()
        formData.append("file", file)

        const token = localStorage.getItem("token")
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/files/upload/video`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        )

        if (!response.ok) {
          throw new Error("Video yüklenemedi")
        }

        const result = await response.json()
        const videoHtml = `<video src="${result.url}" controls style="max-width: 100%; height: auto;"></video>`
        // insertHTML komutu için manuel ekleme
        if (editorRef.current) {
          const selection = window.getSelection()
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            range.deleteContents()
            const tempDiv = document.createElement("div")
            tempDiv.innerHTML = videoHtml
            const fragment = document.createDocumentFragment()
            while (tempDiv.firstChild) {
              fragment.appendChild(tempDiv.firstChild)
            }
            range.insertNode(fragment)
            selection.removeAllRanges()
            selection.addRange(range)
            handleInput()
          }
        }
      } catch (error) {
        console.error("Video upload error:", error)
        alert("Video yüklenemedi")
      }
    }
  }

  const setLink = () => {
    const url = window.prompt("URL girin:")
    if (url) {
      execCommand("createLink", url)
    }
  }

  return (
    <div className={`rich-text-editor border rounded-lg ${error ? "border-red-500" : ""}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b p-2 bg-gray-50 rounded-t-lg">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("bold")}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("italic")}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("underline")}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("formatBlock", "<h1>")}
            onMouseDown={(e) => e.preventDefault()}
          >
            H1
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("formatBlock", "<h2>")}
            onMouseDown={(e) => e.preventDefault()}
          >
            H2
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("formatBlock", "<h3>")}
            onMouseDown={(e) => e.preventDefault()}
          >
            H3
          </Button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("insertUnorderedList")}
            onMouseDown={(e) => e.preventDefault()}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("insertOrderedList")}
            onMouseDown={(e) => e.preventDefault()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        {/* Media */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleImageUpload}
            onMouseDown={(e) => e.preventDefault()}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleVideoUpload}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={setLink}
            onMouseDown={(e) => e.preventDefault()}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* HTML View */}
        <div className="flex items-center gap-1">
          <Dialog open={showHtml} onOpenChange={setShowHtml}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
              >
                <Code className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>HTML Kodu</DialogTitle>
                <DialogDescription>
                  İçeriğin HTML kodunu görüntüleyebilir veya düzenleyebilirsiniz.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={value}
                  onChange={(e) => {
                    onChange(e.target.value)
                    if (editorRef.current) {
                      editorRef.current.innerHTML = e.target.value
                    }
                  }}
                  className="font-mono text-sm min-h-[400px]"
                  placeholder="HTML kodu buraya görünecek..."
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowHtml(false)}
                  >
                    Kapat
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (editorRef.current) {
                        editorRef.current.innerHTML = value
                      }
                      setShowHtml(false)
                    }}
                  >
                    Uygula
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[400px] max-h-[600px] overflow-y-auto p-4 focus:outline-none prose prose-lg max-w-none"
        style={{
          minHeight: "400px",
        }}
        suppressContentEditableWarning
      />
      
      {error && <p className="mt-2 px-4 pb-2 text-sm text-red-500">{error}</p>}
    </div>
  )
}
