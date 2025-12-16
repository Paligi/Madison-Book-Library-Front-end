import { useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation?: { role: string; content: string }[];
}

export function FeedbackModal({ isOpen, onClose, conversation }: FeedbackModalProps) {
  const [helpfulnessRating, setHelpfulnessRating] = useState(0);
  const [hoveredHelpfulStar, setHoveredHelpfulStar] = useState(0);
  // Rating for whether the answer successfully cited library documents
  const [citationRating, setCitationRating] = useState(0);
  const [hoveredCitationStar, setHoveredCitationStar] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");

  const handleSubmit = () => {
    if (helpfulnessRating === 0 && citationRating === 0 && !feedbackText.trim()) {
      toast.error("Please provide at least one rating or feedback");
      return;
    }

    // send extended feedback to backend
    try {
      fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "extended",
          helpfulnessRating,
          citationRating,
          feedbackText,
          conversation: conversation || [],
        }),
      }).catch(() => {});
    } catch (e) {}

    toast.success("Thank you for your feedback!");
    handleClose();
  };

  const handleClose = () => {
    setHelpfulnessRating(0);
    setHoveredHelpfulStar(0);
    setCitationRating(0);
    setHoveredCitationStar(0);
    setFeedbackText("");
    onClose();
  };

  const renderStars = (
    rating: number,
    hoveredStar: number,
    onRate: (rating: number) => void,
    onHover: (rating: number) => void
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hoveredStar || rating);
          return (
            <button
              key={star}
              onClick={() => onRate(star)}
              onMouseEnter={() => onHover(star)}
              onMouseLeave={() => onHover(0)}
              className="transition-transform hover:scale-110"
              aria-label={`Rate ${star} stars`}
            >
              <Star className="w-6 h-6 transition-colors" style={{ color: isFilled ? "var(--accent-strong)" : "#d1d5db", fill: isFilled ? "var(--accent)" : "#d1d5db" }} />
            </button>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl" style={{ color: "var(--foreground)" }}>Provide Feedback</h2>
            <button
              onClick={handleClose}
              className="transition-colors"
              style={{ color: "var(--foreground)" }}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Helpfulness Rating */}
            <div>
                <p className="text-sm mb-3" style={{ color: "var(--foreground)" }}>How helpful was this conversation?</p>
                {renderStars(
                  helpfulnessRating,
                  hoveredHelpfulStar,
                  setHelpfulnessRating,
                  setHoveredHelpfulStar
                )}
            </div>

              {/* Citation Question */}
              <div>
                <p className="text-sm mb-3" style={{ color: "var(--foreground)" }}>
                  Did the answer successfully cite documents from Madison's library?
                </p>
                {renderStars(
                  citationRating,
                  hoveredCitationStar,
                  setCitationRating,
                  setHoveredCitationStar
                )}
              </div>

            {/* Feedback Input */}
            <div>
              <label htmlFor="feedback" className="text-sm mb-2 block" style={{ color: "var(--foreground)" }}>
                Additional feedback (optional)
              </label>
              <Textarea
                id="feedback"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us more about your experience..."
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={handleClose} style={{ color: "var(--foreground)", borderColor: "var(--accent)" }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={helpfulnessRating === 0 && citationRating === 0 && !feedbackText.trim()}
              style={helpfulnessRating === 0 && citationRating === 0 && !feedbackText.trim() ? { backgroundColor: "var(--accent)", opacity: 0.45, color: "var(--foreground)" } : { backgroundColor: "var(--accent)", color: "var(--foreground)" }}
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}