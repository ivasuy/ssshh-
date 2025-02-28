import { cn } from "@/lib/utils";

interface DisclaimerProps {
  className?: string;
}

export function Disclaimer({ className }: DisclaimerProps) {
  return (
    <div
      className={cn(
        "p-4 sm:p-5 bg-black border border-green-500 text-green-400 font-mono rounded-md w-full terminal-screen transition-all duration-300",
        className
      )}
    >
      <div className="flex items-start">
        <div className="min-w-5 text-xl sm:text-2xl">⚠️</div>
        <h3 className="font-bold tracking-wider text-green-300 text-sm sm:text-base ml-2">
          WHISPR DISCLAIMER: This is an anonymous truth-sharing platform.
        </h3>
      </div>

      <div className="mt-3 space-y-2">
        <ul className="space-y-2">
          {[
            "We do not verify or endorse any posts.",
            "Users are responsible for their own content.",
            "If something is false or misleading, use your judgment.",
            "This is for discussion & awareness, NOT official evidence.",
          ].map((item, index) => (
            <li key={index} className="flex items-start text-xs sm:text-sm">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-center text-xs sm:text-sm">
        <div className="min-w-5 text-lg sm:text-xl">🎯</div>
        <span className="font-bold tracking-wider text-green-300 ml-2">
          TL;DR:
        </span>
        <span className="ml-2">
          Think before you believe. Think before you post.
        </span>
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-green-500/20"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-green-500/20"></div>
      <div className="absolute left-0 top-0 bottom-0 w-px bg-green-500/20"></div>
      <div className="absolute right-0 top-0 bottom-0 w-px bg-green-500/20"></div>
    </div>
  );
}
