"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function ContentPolicyPage() {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const fullText = `
CONTENT POLICY (aka, What You Can & Can't Post)

🚀 What's Allowed?
✅ Workplace confessions (talk about your company, boss, layoffs, etc.).
✅ Anonymous truths about society, politics, relationships, mental health.
✅ Leaked insights (as long as it doesn't expose private identities).

🚨 What's NOT Allowed?
❌ Hate speech & discrimination (we keep it real, but not hateful).
❌ Threats or inciting harm (you can be mad, but don't be dangerous).
❌ Doxxing (personal info, addresses, phone numbers, etc.).
❌ Mass disinformation or fake drama for clout.

📌 What Happens If You Violate These?
⚠️ Posts that break these rules will be flagged & removed.
⚠️ If you repeatedly violate these, you will lose access to the platform.
⚠️ Serious violations (doxxing, threats, illegal content) may lead to LEGAL ACTION against you.
⚠️ We fully comply with legal authorities in extreme cases involving criminal behavior.

🎯 TL;DR: Truth = 🔥. Hate speech = 🚫. Fake news = 🤡. Doxxing = ⚖️ (Legal action). Keep it real.
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
          <h1 className="text-5xl font-bold tracking-wider">CONTENT POLICY</h1>
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
