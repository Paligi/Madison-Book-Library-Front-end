import { useState, useEffect } from "react";
/**
 * ChatMessage
 *
 * Renders a single chat message (user or assistant). For assistant
 * messages this component shows the avatar, the message content, and
 * action buttons (copy, share, thumbs up/down). It also supports an
 * inline feedback prompt that asks the user whether they'd like to
 * provide more detailed feedback about the conversation.
 *
 * Props:
 * - message: the message payload (id, role, content)
 * - isLastAssistantMessage: whether this assistant message is the
 *   most recent assistant message in the conversation (used to show
 *   the inline feedback prompt)
 * - onOpenFeedback: callback that opens the extended feedback modal
 * - showFeedbackPrompt: when true, the inline prompt will be shown
 * - onPromptHandled: called after the user dismisses the prompt or
 *   opens the extended modal (so the page can mark the prompt handled)
 */
import { Share2, Copy, RotateCw, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageProps {
  message: Message;
  isLastAssistantMessage?: boolean;
  onOpenFeedback?: () => void;
  showFeedbackPrompt?: boolean;
  onPromptHandled?: () => void;
  onReask?: (text: string) => void;
}

export function ChatMessage({ message, isLastAssistantMessage, onOpenFeedback, showFeedbackPrompt, onPromptHandled, onReask }: ChatMessageProps) {
  const [thumbsState, setThumbsState] = useState<"up" | "down" | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(() => (showFeedbackPrompt ?? false));

  useEffect(() => {
    if (showFeedbackPrompt) setShowPrompt(true);
  }, [showFeedbackPrompt]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Copied to clipboard");
  };

  const handleShare = () => {
    const shareText = message.content;
    if (navigator.share) {
      try {
        navigator.share({ text: shareText }).catch(() => {});
        toast.success("Opened share dialog");
        return;
      } catch (e) {}
    }
    // fallback: copy message text to clipboard as shareable content
    navigator.clipboard.writeText(window.location.href + "\n\n" + shareText).then(() => {
      toast.success("Share text copied to clipboard");
    }).catch(() => {
      toast.error("Unable to copy share text");
    });
  };

  const handleThumbsUp = () => {
    if (thumbsState === "up") {
      setThumbsState(null);
      setShowPrompt(false);
      toast.success("Feedback removed");
      try {
        fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "remove", type: "thumbs_up", messageId: message.id }) }).catch(() => {});
      } catch (e) {}
    } else {
      setThumbsState("up");
      setShowPrompt(true);
      toast.success("Thanks for the positive feedback!");
      try {
        fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "up", messageId: message.id, message: message.content }) }).catch(() => {});
      } catch (e) {}
    }
  };

  const handleThumbsDown = () => {
    if (thumbsState === "down") {
      setThumbsState(null);
      setShowPrompt(false);
      toast.success("Feedback removed");
      try {
        fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "remove", type: "thumbs_down", messageId: message.id }) }).catch(() => {});
      } catch (e) {}
    } else {
      setThumbsState("down");
      setShowPrompt(true);
      toast.success("Thanks for your feedback");
      try {
        fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "down", messageId: message.id, message: message.content }) }).catch(() => {});
      } catch (e) {}
    }
  };

  const handleReask = () => {
    if (typeof onReask === "function") {
      onReask(message.content);
      toast.success("Message copied to input");
    } else {
      // fallback: copy to clipboard
      navigator.clipboard.writeText(message.content).then(() => {
        toast.success("Message copied to clipboard");
      });
    }
  };

  // showPrompt controls whether the single-step feedback prompt is visible

  if (message.role === "user") {
    return (
      <div className="flex gap-4 justify-end">
        <div className="rounded-2xl px-4 py-3 max-w-[80%]" style={{ backgroundColor: "var(--accent)" }}>
          <p style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}>{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-amber-600 to-rose-700 text-white">
          M
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap" style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}>{message.content}</p>
          </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-1 mt-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleThumbsUp}
            style={ thumbsState === "up" ? { backgroundColor: "var(--accent)", color: "var(--foreground)" } : { color: "var(--foreground)" }}
          >
            <ThumbsUp className={`w-4 h-4 ${thumbsState === "up" ? "fill-current" : ""}`} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleThumbsDown}
            style={ thumbsState === "down" ? { backgroundColor: "var(--accent)", color: "var(--foreground)" } : { color: "var(--foreground)" }}
          >
            <ThumbsDown className={`w-4 h-4 ${thumbsState === "down" ? "fill-current" : ""}`} />
          </Button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleShare}
            style={{ color: "var(--foreground)" }}
          >
            <Share2 className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCopy}
            style={{ color: "var(--foreground)" }}
          >
            <Copy className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleReask}
            style={{ color: "var(--foreground)" }}
          >
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Feedback Notification - Only show for last assistant message */}
        {isLastAssistantMessage && onOpenFeedback && (showFeedbackPrompt ?? true) && showPrompt && (
          <div className="mt-4">
            <div className="rounded-lg p-4 flex items-center justify-between" style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5" style={{ color: "var(--foreground)" }} />
                  <p className="text-sm" style={{ color: "var(--foreground)" }}>Would you like to give some feedback to this conversation?</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setShowPrompt(false); onPromptHandled && onPromptHandled(); }}>
                  Dismiss
                </Button>
                  <Button size="sm" onClick={() => { setShowPrompt(false); onOpenFeedback && onOpenFeedback(); onPromptHandled && onPromptHandled(); }} style={{ backgroundColor: "var(--accent)", color: "var(--foreground)" }}>
                  Give Feedback
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}