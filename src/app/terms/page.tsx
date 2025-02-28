"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TermsPage() {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const fullText = `
Welcome to Whispr 👋

Before you spill the tea, let's keep things clear. By using this platform, you agree to these terms. Nothing crazy—just making sure everyone plays fair.

1️⃣ What This Platform Is About
This is an anonymous truth-sharing space—speak your mind without fear.
We don't verify posts (so don't believe everything at first glance).
Posts auto-delete after 24 hours—no receipts, no history.

2️⃣ Your Responsibilities 🚀
By posting, you agree:
✅ You own your words. Whatever you say is your responsibility (not ours).
✅ No illegal, violent, or doxxing content (be chill, don't ruin lives).
✅ No spamming or flooding (keep it real, don't be annoying).
✅ If you break these rules, we can remove your post or restrict access.

3️⃣ Free Speech, But… 🚨
We believe in free speech, but there are limits:
❌ No hate speech, direct threats, or harassment.
❌ No spreading false rumors with intent to harm.
❌ No posting personal contact info (doxxing = instant ban).

4️⃣ Auto-Deletion & Data Privacy 💨
Posts vanish in 24 hours—like they never existed.
We don't keep permanent user data (so even if someone asks, we got nothing to share).

5️⃣ Liability Disclaimer (The Legal Shield 🛡️)
We don't endorse or verify any posts.
If you get mad about a post, take it up with the user who posted it (not us).
We aren't responsible for what happens because of content posted here.

🎯 TL;DR: Post whatever you want (within reason), but take responsibility for your words.

🚀 Ready? Cool. Let's go.
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
          <h1 className="text-5xl font-bold tracking-wider">
            TERMS OF SERVICE
          </h1>
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
