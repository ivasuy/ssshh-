"use client";

import { useEffect, useState } from "react";

interface DisclaimerPopupProps {
  isOpen: boolean;
  onAcknowledge: () => void;
}

export default function DisclaimerPopup({
  isOpen,
  onAcknowledge,
}: DisclaimerPopupProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const fullText = `⚠️ Before You Post, Read This!

You are responsible for what you post. We don't verify content, and we don't take responsibility for what you say.
Do NOT post private details (no doxxing, no personal addresses, no phone numbers).
Free speech is welcome, but hate speech, threats, and illegal content will be removed. Serious violations may lead to legal action.
Once posted, your truth will be live for 24 hours. After that, it's gone forever.
By posting, you agree to our Terms of Service and Content Policy.`;

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setDisplayedText("");
      setIsTypingComplete(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullText.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 15); // Speed of typewriter effect

      return () => clearTimeout(timeout);
    } else {
      setIsTypingComplete(true);
    }
  }, [currentIndex, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-black border-2 border-green-500 rounded-md max-w-2xl w-full relative terminal-screen">
        <div className="flex justify-between items-center border-b border-green-500 p-3">
          <div className="text-green-400 font-bold tracking-wider">
            SYSTEM WARNING
          </div>
        </div>

        <div className="p-6">
          <pre className="whitespace-pre-wrap text-green-400 font-mono">
            {displayedText}
          </pre>
          {!isTypingComplete && (
            <span className="inline-block w-2 h-5 bg-green-400 animate-pulse ml-1"></span>
          )}
        </div>

        <div className="border-t border-green-500 p-4 flex justify-center">
          {isTypingComplete && (
            <button
              onClick={onAcknowledge}
              className="border border-green-500 text-green-400 px-6 py-2 rounded-md hover:bg-green-500 hover:text-black transition-colors font-mono"
            >
              &lt; ACKNOWLEDGE &gt;
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .terminal-screen {
          box-shadow: 0 0 20px rgba(0, 255, 128, 0.5);
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
