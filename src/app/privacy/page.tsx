"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPage() {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const fullText = `
PRIVACY POLICY

1️⃣ What We Collect (Spoiler: Almost Nothing)
No names, no emails, no phone numbers—you're a ghost here.
We store temporary metadata (like IP logs for security purposes)—but auto-delete it after 24 hours.
If you react, comment, or post—it's wiped after 24 hours too.

2️⃣ What We Do With Your Data
Short answer? Nothing creepy.
We use it to stop spam & abuse, and then it's gone.
We don't sell, trade, or share data with anyone.

3️⃣ How Safe Is This? 🔐
Since we don't keep permanent records, even if the FBI, your boss, or your ex asks us for data—there's nothing to show.

🎯 TL;DR: Your data doesn't stay here. Post. Engage. Vanish. That's it.
`;

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullText.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 10); // Speed of typewriter effect

      return () => clearTimeout(timeout);
    }
  }, [currentIndex]);

  return (
    <div className="min-h-screen bg-black text-green-400 p-6 font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="border border-green-500 p-4 mb-6 rounded-md flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center hover:text-green-300 transition-colors"
          >
            <ChevronLeft className="mr-2" />
            Back to Home
          </Link>
          <h1 className="text-5xl font-bold tracking-wider">PRIVACY POLICY</h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        <div className="border border-green-500 p-6 rounded-md bg-black/50 terminal-screen text-xl">
          <pre className="whitespace-pre-wrap">{displayedText}</pre>
          {currentIndex < fullText.length && (
            <span className="inline-block w-2 h-5 bg-green-400 animate-pulse ml-1"></span>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-block border border-green-500 px-6 py-2 rounded-md hover:bg-green-500 hover:text-black transition-colors"
          >
            &lt; ACKNOWLEDGE &gt;
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .terminal-screen {
          box-shadow: 0 0 10px rgba(0, 255, 128, 0.5);
          background-image: radial-gradient(
            rgba(0, 50, 0, 0.3) 1px,
            transparent 0
          );
          background-size: 4px 4px;
          position: relative;
          overflow: hidden;
        }

        .terminal-screen::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: repeating-linear-gradient(
            to right,
            transparent,
            transparent 50%,
            rgba(0, 255, 128, 0.5) 50%,
            rgba(0, 255, 128, 0.5) 100%
          );
          background-size: 4px 1px;
          animation: scan 8s linear infinite;
          opacity: 0.5;
          pointer-events: none;
        }

        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(100vh);
          }
        }
      `}</style>
    </div>
  );
}
