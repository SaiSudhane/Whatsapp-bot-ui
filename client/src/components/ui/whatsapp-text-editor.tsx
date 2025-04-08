import { FC, useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  List, 
  Smile,
  Info
} from "lucide-react";

interface WhatsAppTextEditorProps {
  id: string;
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
  placeholder,
  maxLength = 1000,
  rows = 4
}) => {
  const [charCount, setCharCount] = useState(0);
  
  useEffect(() => {
    setCharCount(value.length);
  }, [value]);
  
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length <= maxLength) {
      onChange(newValue);
      setCharCount(newValue.length);
    }
  };
  
  const insertFormatting = (format: string) => {
    // Get the current cursor position or selection
    const textarea = document.getElementById(id) as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText;
    switch (format) {
      case 'bold':
        newText = value.substring(0, start) + '*' + selectedText + '*' + value.substring(end);
        break;
      case 'italic':
        newText = value.substring(0, start) + '_' + selectedText + '_' + value.substring(end);
        break;
      case 'strikethrough':
        newText = value.substring(0, start) + '~' + selectedText + '~' + value.substring(end);
        break;
      case 'code':
        newText = value.substring(0, start) + '```' + selectedText + '```' + value.substring(end);
        break;
      case 'list':
        newText = value.substring(0, start) + '• ' + selectedText + value.substring(end);
        break;
      case 'emoji':
        newText = value.substring(0, start) + '😊' + value.substring(end);
        break;
      default:
        return;
    }
    
    if (maxLength && newText.length <= maxLength) {
      onChange(newText);
      
      // Set cursor position after the formatting
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = format === 'emoji' ? start + 2 : end + 2;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };
  
  return (
    <div className="border border-slate-300 rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center space-x-1 border-b border-slate-200 p-2 bg-slate-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1.5 rounded hover:bg-slate-200 h-auto" 
                onClick={() => insertFormatting('bold')}
              >
                <Bold className="h-4 w-4 text-slate-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bold (*text*)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1.5 rounded hover:bg-slate-200 h-auto" 
                onClick={() => insertFormatting('italic')}
              >
                <Italic className="h-4 w-4 text-slate-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Italic (_text_)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1.5 rounded hover:bg-slate-200 h-auto" 
                onClick={() => insertFormatting('strikethrough')}
              >
                <Strikethrough className="h-4 w-4 text-slate-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Strikethrough (~text~)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <span className="border-r border-slate-300 h-6 mx-1"></span>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1.5 rounded hover:bg-slate-200 h-auto" 
                onClick={() => insertFormatting('code')}
              >
                <Code className="h-4 w-4 text-slate-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Monospace (```text```)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1.5 rounded hover:bg-slate-200 h-auto" 
                onClick={() => insertFormatting('list')}
              >
                <List className="h-4 w-4 text-slate-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>List (• item)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <span className="border-r border-slate-300 h-6 mx-1"></span>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1.5 rounded hover:bg-slate-200 h-auto" 
                onClick={() => insertFormatting('emoji')}
              >
                <Smile className="h-4 w-4 text-slate-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add Emoji</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1.5 rounded hover:bg-slate-200 h-auto ml-auto"
              >
                <Info className="h-4 w-4 text-slate-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p>
                WhatsApp formatting: <br />
                *bold* <br />
                _italic_ <br />
                ~strikethrough~ <br />
                ```monospace``` <br />
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Text Area */}
      <div className="relative">
        <Textarea
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
          className="block w-full p-3 text-slate-700 bg-white focus:outline-none resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <div className="absolute bottom-2 right-3 text-xs text-slate-500 select-none">
          <span>{charCount}</span>/{maxLength}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppTextEditor;
