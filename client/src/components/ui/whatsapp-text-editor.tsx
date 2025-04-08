import { FC, useState, useEffect, ChangeEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Type, List, Code } from "lucide-react";

interface WhatsAppTextEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
}

const WhatsAppTextEditor: FC<WhatsAppTextEditorProps> = ({
  id,
  value,
  onChange,
  placeholder = "Type your message...",
  maxLength,
  rows = 4
}) => {
  const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  
  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(maxLength && newValue.length > maxLength ? newValue.slice(0, maxLength) : newValue);
    
    // Save cursor position
    setSelection({
      start: e.target.selectionStart || 0,
      end: e.target.selectionEnd || 0
    });
  };
  
  const insertFormat = (prefix: string, suffix: string) => {
    const before = value.substring(0, selection.start);
    const selected = value.substring(selection.start, selection.end);
    const after = value.substring(selection.end);
    
    const newValue = `${before}${prefix}${selected}${suffix}${after}`;
    onChange(newValue);
    
    // Set focus back to textarea with proper cursor position
    setTimeout(() => {
      const textarea = document.getElementById(id || "whatsapp-editor") as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        const newPosition = selection.start + prefix.length + selected.length + suffix.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };
  
  const formatBold = () => insertFormat("*", "*");
  const formatItalic = () => insertFormat("_", "_");
  const formatMonospace = () => insertFormat("```", "```");
  const formatStrikethrough = () => insertFormat("~", "~");
  const formatBulletList = () => {
    // Insert a bullet point at the beginning of each line in selection
    const before = value.substring(0, selection.start);
    const selected = value.substring(selection.start, selection.end);
    const after = value.substring(selection.end);
    
    // Format each line with a bullet
    const formattedText = selected
      .split("\n")
      .map(line => (line.trim() ? `• ${line}` : line))
      .join("\n");
    
    const newValue = `${before}${formattedText}${after}`;
    onChange(newValue);
  };

  return (
    <div className="border rounded-md">
      <div className="flex items-center gap-1 p-2 border-b bg-slate-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatBold}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatItalic}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatStrikethrough}
          title="Strikethrough"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatMonospace}
          title="Monospace"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatBulletList}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
      
      <Textarea
        id={id || "whatsapp-editor"}
        value={value}
        onChange={handleTextareaChange}
        placeholder={placeholder}
        rows={rows}
        className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-transparent"
        onSelect={(e) => {
          const target = e.target as HTMLTextAreaElement;
          setSelection({
            start: target.selectionStart || 0,
            end: target.selectionEnd || 0
          });
        }}
      />
      
      {maxLength && (
        <div className="p-2 text-xs text-right text-slate-500 border-t">
          <span className={value.length > (maxLength * 0.9) ? "text-orange-500" : ""}>
            {value.length}
          </span>
          <span>/{maxLength}</span>
        </div>
      )}
    </div>
  );
};

export default WhatsAppTextEditor;