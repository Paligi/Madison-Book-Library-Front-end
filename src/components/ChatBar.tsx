import { useState, useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onContextChange?: (selected: string[]) => void;
  // If the parent sends `isStreaming=true`, the send button turns into
  // a stop button and `onStop` will be called when clicked.
  isStreaming?: boolean;
  onStop?: () => void;
};

// Structured list: `id` is the exact filename key sent to the backend
// `label` is the human-friendly display shown in the UI (Title — Author)
export const CONTEXT_OPTIONS: { id: string; label: string }[] = [
  { id: "blackstone -- commentaries v1", label: "Blackstone — Commentaries on the Laws of England, Vol. 1" },
  { id: "blackstone -- commentaries v2", label: "Blackstone — Commentaries on the Laws of England, Vol. 2" },
  { id: "blackstone -- commentaries v3", label: "Blackstone — Commentaries on the Laws of England, Vol. 3" },
  { id: "blackstone -- commentaries v4", label: "Blackstone — Commentaries on the Laws of England, Vol. 4" },
  { id: "De Lolme -- The Constitution of England", label: "De Lolme — The Constitution of England" },
  { id: "Filmer -- The Anarchy of a Limited or Mixed Monarchy", label: "Filmer — The Anarchy of a Limited or Mixed Monarchy" },
  { id: "Harrington -- The Commonwealth of Oceana", label: "Harrington — The Commonwealth of Oceana" },
  { id: "Hunton -- A Treatise of Monarchy", label: "Hunton — A Treatise of Monarchy" },
  { id: "Locke -- Second Treatise of Government", label: "Locke — Second Treatise of Government" },
  { id: "Montesquieu -- spirit of laws", label: "Montesquieu — The Spirit of Laws" },
  { id: "Rousseau -- The Social Contract", label: "Rousseau — The Social Contract" },
  { id: "Vattel -- The Law of Nations", label: "Vattel — The Law of Nations" },
];

export default function ChatBar({ value, onChange, onSend, onContextChange, isStreaming, onStop }: Props) {
  // ChatBar renders the user input area and a compact Books selector.
  // It exposes the `onContextChange` callback to inform the page which
  // book contexts are selected. The `CONTEXT_OPTIONS` constant is the
  // authoritative mapping of book filename IDs to human-friendly labels.
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([CONTEXT_OPTIONS[0].id, CONTEXT_OPTIONS[1].id]);

  const toggleOption = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]));
  };

  const allSelected = selected.length === CONTEXT_OPTIONS.length;
  const toggleAll = () => {
    setSelected(allSelected ? [] : CONTEXT_OPTIONS.map((o) => o.id));
  };

  const confirm = () => {
    onContextChange?.(selected);
    setOpen(false);
  };

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (open && wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Auto-resize textarea when `value` changes
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div className="w-full relative" ref={wrapperRef}>
      {/* Chat bar with chips inside the warm autumn area */}
      <div className="rounded-2xl shadow-sm px-4 py-3 flex flex-col gap-3" style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}>
        <div className="flex items-top gap-2">
          {/* Circular Books icon (emoji) on the left */}
          <button
            className="h-10 w-10 min-h-[2.5rem] min-w-[2.5rem] rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--accent)", color: "var(--foreground)", border: "1px solid var(--accent)" }}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            aria-expanded={open}
            aria-label="Books"
            title="Books"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </button>

          {/* Selected book chips in the same row */}
            <div className="flex items-center gap-2 flex-wrap">
              {CONTEXT_OPTIONS.filter((o) => selected.includes(o.id)).map((s) => (
                <span key={s.id} className="text-xs px-3 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: "var(--accent)", color: "var(--foreground)", border: "1px solid var(--accent)" }}>
                  {s.label}
                </span>
              ))}
            </div>
        </div>

        <div className="flex items-end gap-3">
          <textarea
            id="chat-input"
            rows={1}
            ref={textareaRef}
            style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}
            className="flex-1 bg-transparent outline-none text-base py-2 resize-none overflow-hidden"
            placeholder="Message"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />

          <div className="flex-shrink-0">
            {!isStreaming ? (
              <button
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--accent)", color: "var(--foreground)" }}
                onClick={onSend}
                aria-label="Send"
                title="Send"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M3.4 20.4L21 12 3.4 3.6 3 10l12 2-12 2z" />
                </svg>
              </button>
            ) : (
              <button
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--foreground)", color: "#fff" }}
                onClick={() => onStop && onStop()}
                aria-label="Stop"
                title="Stop"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* dropdown moved below (single instance) — handled after the main white area */}
      </div>

      {/* single dropdown panel (appears once, left anchored) */}
      {open && (
        <div className="absolute bottom-full mb-3 left-4 w-[28rem] max-w-[95vw] rounded-2xl bg-white border border-zinc-200 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
            <div className="flex items-center gap-2 text-sm text-zinc-700">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              <button className="underline" onClick={toggleAll}>
                {allSelected ? "Deselect All" : "Select All"}
              </button>
            </div>
            <span className="text-sm text-zinc-500">Selected: {selected.length}</span>
          </div>

          <div className="max-h-72 overflow-auto">
            {CONTEXT_OPTIONS.map((opt) => {
              const isSel = selected.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 px-4 py-3 text-sm border-b border-zinc-100 ${isSel ? 'bg-indigo-50 text-indigo-800' : 'text-zinc-800'}`}
                >
                  <input
                    type="checkbox"
                    checked={isSel}
                    onChange={() => toggleOption(opt.id)}
                  />
                  <span className={`truncate ${isSel ? 'font-semibold' : ''}`}>{opt.label}</span>
                </label>
              );
            })}
          </div>

          <div className="px-4 py-3">
            <button
              onClick={confirm}
              className="w-full rounded-xl bg-black text-white px-4 py-2"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}