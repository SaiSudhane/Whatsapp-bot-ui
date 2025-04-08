import { FC, useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Question, AddQuestion, UpdateQuestion } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import WhatsAppTextEditor from "@/components/ui/whatsapp-text-editor";
import { Input } from "@/components/ui/input";
import { QuestionsAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Question | null;
  advisorId?: number;
}

const MessageModal: FC<MessageModalProps> = ({ isOpen, onClose, message, advisorId }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [question, setQuestion] = useState("");
  const [triggerKeyword, setTriggerKeyword] = useState("");
  const [isPredefinedAnswer, setIsPredefinedAnswer] = useState(false);
  const [step, setStep] = useState<number>(1);
  
  const isEditing = !!message;
  
  // Reset form when modal opens/closes or message changes
  useEffect(() => {
    if (message) {
      setQuestion(message.question);
      setTriggerKeyword(message.triggerKeyword);
      setStep(message.step);
      // API doesn't seem to have this field in the response, but we'll keep it for future
      setIsPredefinedAnswer(false);
    } else {
      setQuestion("");
      setTriggerKeyword("");
      setIsPredefinedAnswer(false);
      
      // Get highest step number + 1 for new questions
      const questions = queryClient.getQueryData<Question[]>(['questions', advisorId]) || [];
      const maxStep = questions.length > 0 
        ? Math.max(...questions.map(q => q.step))
        : 0;
      setStep(maxStep + 1);
    }
  }, [message, isOpen, queryClient, advisorId]);
  
  // Add question mutation
  const createQuestionMutation = useMutation({
    mutationFn: (questionData: AddQuestion) => QuestionsAPI.addQuestion(questionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', advisorId] });
      toast({
        title: "Success",
        description: "Question created successfully"
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create question",
        variant: "destructive"
      });
    }
  });
  
  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: UpdateQuestion }) => 
      QuestionsAPI.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', advisorId] });
      toast({
        title: "Success",
        description: "Question updated successfully"
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update question",
        variant: "destructive"
      });
    }
  });
  
  const handleSave = () => {
    if (!question.trim()) {
      toast({
        title: "Validation error",
        description: "Question content is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!triggerKeyword.trim()) {
      toast({
        title: "Validation error",
        description: "Trigger keyword is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!advisorId) {
      toast({
        title: "Error",
        description: "Advisor ID is required",
        variant: "destructive"
      });
      return;
    }
    
    if (isEditing && message) {
      updateQuestionMutation.mutate({
        id: message.id,
        data: {
          step,
          question
        }
      });
    } else {
      createQuestionMutation.mutate({
        advisor_id: advisorId,
        question,
        triggerKeyword,
        is_predefined_answer: isPredefinedAnswer
      });
    }
  };
  
  const isPending = createQuestionMutation.isPending || updateQuestionMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isPending && !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Question" : "Create New Question"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Edit your question and its properties below." 
              : "Create a new question for your users."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="question-content" className="block text-sm font-medium text-slate-700 mb-1">
              Question Content
            </Label>
            <WhatsAppTextEditor
              id="question-content"
              value={question}
              onChange={setQuestion}
              placeholder="Type your question content here..."
              maxLength={1000}
              rows={6}
            />
          </div>

          {!isEditing && (
            <div>
              <Label htmlFor="trigger-keyword" className="block text-sm font-medium text-slate-700 mb-1">
                Trigger Keyword
              </Label>
              <Input
                id="trigger-keyword"
                value={triggerKeyword}
                onChange={(e) => setTriggerKeyword(e.target.value)}
                placeholder="Keyword that triggers this question"
                maxLength={50}
              />
              <p className="text-xs text-slate-500 mt-1">
                This is the keyword that will trigger this question
              </p>
            </div>
          )}
          
          {isEditing && (
            <div>
              <Label htmlFor="step-number" className="block text-sm font-medium text-slate-700 mb-1">
                Step Number
              </Label>
              <Input
                id="step-number"
                type="number"
                value={step}
                onChange={(e) => setStep(parseInt(e.target.value) || 1)}
                min={1}
              />
              <p className="text-xs text-slate-500 mt-1">
                The order in which this question appears
              </p>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="predefined-answer-toggle"
              checked={isPredefinedAnswer}
              onCheckedChange={(checked) => setIsPredefinedAnswer(checked as boolean)}
              disabled={isEditing}
            />
            <Label htmlFor="predefined-answer-toggle" className={isEditing ? "text-slate-400" : ""}>
              Predefined Answer Required
            </Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Question"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageModal;
