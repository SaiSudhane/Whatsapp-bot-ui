import React, { useState, useEffect, useRef } from "react";
import { Textarea } from "./textarea";
import { Label } from "./label";
import { Button } from "./button";
import { Bold, Italic, Strikethrough, List, Code } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  maxLength?: number;
  error?: string;
  className?: string;
}

const WhatsAppTextEditor: React.FC<WhatsAppTextEditorProps> = ({
  value,
  onChange,
  label,
  placeholder = "Type your message here...",
  maxLength = 4000,
  error,
  className
}) => {
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (cursorPosition !== null && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
      setCursorPosition(null);
    }
  }, [cursorPosition, value]);

  const insertFormatting = (startChar: string, endChar: string = startChar) => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);
    
    const newText = beforeText + startChar + selectedText + endChar + afterText;
    onChange(newText);
    
    // Calculate new cursor position
    const newPosition = end + startChar.length + endChar.length;
    setCursorPosition(newPosition);
  };

  const handleBold = () => insertFormatting('*');
  const handleItalic = () => insertFormatting('_');
  const handleStrikethrough = () => insertFormatting('~');
  const handleCode = () => insertFormatting('```', '```');
  
  const handleList = () => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const textBeforeCursor = value.substring(0, start);
    const textAfterCursor = value.substring(start);
    
    // Check if cursor is at the beginning of a line
    const isAtLineStart = start === 0 || textBeforeCursor.endsWith('\n');
    
    if (isAtLineStart) {
      // Add bullet point at cursor position
      const newText = textBeforeCursor + '• ' + textAfterCursor;
      onChange(newText);
      setCursorPosition(start + 2);
    } else {
      // Add line break and bullet point
      const newText = textBeforeCursor + '\n• ' + textAfterCursor;
      onChange(newText);
      setCursorPosition(start + 3);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      <div className="border rounded-md focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
        <div className="flex items-center px-3 py-2 border-b bg-slate-50">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={handleBold}
            className="w-9 h-9 p-0"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button 
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleItalic}
            className="w-9 h-9 p-0"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button 
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleStrikethrough}
            className="w-9 h-9 p-0"
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button 
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCode}
            className="w-9 h-9 p-0"
            title="Code"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button 
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleList}
            className="w-9 h-9 p-0"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[150px] border-0 focus-visible:ring-0 resize-y"
        />
        
        <div className="flex justify-between items-center px-3 py-2 border-t text-xs text-slate-500">
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-1">
              <Bold className="h-3 w-3" /> <span>*bold*</span>
            </div>
            <div className="flex items-center gap-1">
              <Italic className="h-3 w-3" /> <span>_italic_</span>
            </div>
            <div className="flex items-center gap-1">
              <Strikethrough className="h-3 w-3" /> <span>~strike~</span>
            </div>
          </div>
          <div>
            {value.length} / {maxLength}
          </div>
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default WhatsAppTextEditor;