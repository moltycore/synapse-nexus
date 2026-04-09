import { useState, useRef, useCallback } from "react";
import { Cpu, Copy, Share2, MoreHorizontal, Check } from "lucide-react";

interface ChatMessageProps {
  query: string;
  primeResult: string;
  timestamp: string;
  mode: "solo" | "nexus";
  visionSuggest?: string;
}

const CodeBlock = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);
  
  const lines = content.slice(3, -3).trim().split('\n');
  const firstLine = lines[0].trim();
  const hasLang = firstLine && !firstLine.includes(' ');
  const language = hasLang ? firstLine : 'code';
  const codeData = hasLang ? lines.slice(1).join('\n') : lines.join('\n');

  const copyCode = async () => {
    await navigator.clipboard.writeText(codeData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 w-full rounded-xl border border-white/5 bg-zinc-900 overflow-hidden select-text">
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/20 border-b border-white/5 select-none">
        <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">{language}</span>
        <button onClick={copyCode} className="text-white/40 hover:text-white transition-colors" title="Copy Code">
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-3">
        <pre className="text-xs text-foreground/80 font-mono whitespace-pre-wrap break-all leading-relaxed">
          {codeData}
        </pre>
      </div>
    </div>
  );
};

const renderMessage = (text: string) => {
  if (!text) return null;
  const blocks = text.split(/(```[\s\S]*?```)/g);
  
  return blocks.map((block, i) => {
    if (block.startsWith('```') && block.endsWith('```')) {
      return <CodeBlock key={i} content={block} />;
    }
    return (
      <span key={i} className="whitespace-pre-wrap break-words">
        {block}
      </span>
    );
  });
};

export default function ChatMessage({ query = "", primeResult = "", timestamp = "", mode = "solo" }: ChatMessageProps) {
  const [aiCopied, setAiCopied] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleAiCopy = async () => {
    try {
      await navigator.clipboard.writeText(primeResult);
      setAiCopied(true);
      setTimeout(() => setAiCopied(false), 2000); 
    } catch (err) {
      console.error("Clipboard write failed:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Synapse Prime Result',
          text: primeResult,
        });
      } catch (err) {
        console.error("Share API failed:", err);
      }
    }
  };

  const startPress = useCallback(() => {
    pressTimer.current = setTimeout(() => {
      const selection = window.getSelection()?.toString();
      if (!selection && query) {
        navigator.clipboard.writeText(query).catch(() => {});
      }
    }, 500); 
  }, [query]);

  const cancelPress = useCallback(() => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  }, []);

  if (!query && !primeResult) return null;

  return (
    <div className="space-y-5 w-full pb-4 max-w-full">
      {query && (
        <div className="flex justify-end relative select-none">
          <div 
            className="w-fit max-w-[95%] bg-white/10 border border-white/15 rounded-2xl rounded-tr-sm px-4 pt-3 pb-5 relative hover:bg-white/14 transition-colors"
            onMouseDown={startPress}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress}
            onTouchStart={startPress}
            onTouchEnd={cancelPress}
            onTouchMove={cancelPress}
          >
            {mode === "nexus" && (
              <Cpu size={14} className="absolute top-2 right-2 text-white/25" />
            )}
            
            <p className={`text-sm text-foreground/90 leading-relaxed break-words select-text ${mode === "nexus" ? "pr-5" : ""}`}>
              {query}
            </p>
            <span className="absolute bottom-1 right-3 text-[9px] text-muted-foreground/60 select-none">{timestamp}</span>
          </div>
        </div>
      )}

      {primeResult && (
        <div className="flex flex-col items-start gap-2 w-full select-none pl-1">
          <div className="w-full max-w-full overflow-hidden">
            <div className="text-sm text-foreground/90 leading-relaxed select-text">
              {renderMessage(primeResult)}
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-1 text-white/40 select-none">
            <button onClick={handleAiCopy} className="hover:text-white transition-colors" title="Copy Full Payload">
              {aiCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} strokeWidth={2} />}
            </button>
            <button onClick={handleShare} className="hover:text-white transition-colors" title="Share Payload">
              <Share2 size={14} strokeWidth={2} />
            </button>
            <button className="hover:text-white transition-colors" title="System Override">
              <MoreHorizontal size={14} strokeWidth={2} />
            </button>
            <span className="text-[10px] text-muted-foreground/50 ml-2">{timestamp}</span>
          </div>
        </div>
      )}
    </div>
  );
                    }
