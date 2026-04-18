import React, { useState, useRef, useCallback } from "react";
import { Cpu, Copy, Share2, MoreHorizontal, Check, GitFork } from "lucide-react";
import { logger } from "@/utils/logger";

interface ChatMessageProps {
  id?: string;
  query: string;
  primeResult: string;
  timestamp: string;
  mode: "solo" | "nexus";
  visionSuggest?: string;
  onFork?: (id: string) => void;
}

const CodeBlock = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);
  
  const rawContent = content.replace(/^```|```$/g, '');
  const firstNewlineIdx = rawContent.indexOf('\n');
  
  let language = 'code';
  let codeData = rawContent;

  if (firstNewlineIdx !== -1) {
    const firstLine = rawContent.slice(0, firstNewlineIdx).trim();
    if (/^[a-zA-Z0-9_+-]+$/.test(firstLine)) {
      language = firstLine;
      codeData = rawContent.slice(firstNewlineIdx + 1);
    }
  }

  codeData = codeData.trim();

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error("Clipboard write failed", { error: err });
    }
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

function ChatMessage({ id, query = "", primeResult = "", timestamp = "", mode = "solo", onFork }: ChatMessageProps) {
  const [aiCopied, setAiCopied] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  const canShare = typeof navigator !== 'undefined' && Boolean(navigator.share);

  const handleAiCopy = async () => {
    try {
      await navigator.clipboard.writeText(primeResult);
      setAiCopied(true);
      setTimeout(() => setAiCopied(false), 2000); 
    } catch (err) {
      logger.error("Clipboard write failed", { error: err });
    }
  };

  const handleShare = async () => {
    if (canShare) {
      try {
        await navigator.share({
          title: 'Synapse Prime Result',
          text: primeResult,
        });
      } catch (err) {
        logger.error("Share API failed", { error: err });
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
            
            {canShare && (
              <button onClick={handleShare} className="hover:text-white transition-colors" title="Share Payload">
                <Share2 size={14} strokeWidth={2} />
              </button>
            )}
            
            {onFork && id && (
              <button onClick={() => onFork(id)} className="hover:text-emerald-500 transition-colors" title="Fork Path">
                <GitFork size={14} strokeWidth={2} />
              </button>
            )}
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

export default React.memo(ChatMessage, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.query === nextProps.query &&
    prevProps.primeResult === nextProps.primeResult &&
    prevProps.mode === nextProps.mode &&
    prevProps.onFork === nextProps.onFork
  );
});
