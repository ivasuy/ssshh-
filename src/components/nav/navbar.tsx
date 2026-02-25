"use client";

import { Menu, X, Globe, LogIn, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import BlinkingCursor from "../ui/blinking-cursor";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/", label: "Radar", description: "Tech signals" },
  { href: "/library", label: "Library", description: "Templates & repos" },
  { href: "/cards", label: "Cards", description: "Tech glossary" },
  { href: "/opportunities", label: "Contribute", description: "Issues & bounties" },
  { href: "/lounge", label: "Lounge", description: "Community notes" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, loading, signIn, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <motion.nav
      className={`crt fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2 shadow-lg bg-cyber-black/90" : "py-4 bg-cyber-black/80"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="retro-border backdrop-blur-md rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <Link href="/">
              <motion.div
                className="flex items-center justify-center space-x-2 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Globe className="h-6 w-6 text-cyber-green" />
                <h1 className="font-pixel text-cyber-green text-xl">
                  SSH
                  <BlinkingCursor />
                </h1>
              </motion.div>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href}>
                  <motion.button
                    className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                      isActive(item.href)
                        ? "bg-green-600/30 text-green-400 border border-green-500/50"
                        : "text-green-500/70 hover:text-green-400 hover:bg-green-600/10"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                  </motion.button>
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-green-600/20 animate-pulse" />
              ) : user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {user.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full border border-green-500"
                      />
                    ) : (
                      <User className="w-8 h-8 text-green-500" />
                    )}
                    <span className="text-sm text-green-500 font-mono max-w-[120px] truncate">
                      {user.displayName}
                    </span>
                  </div>
                  <motion.button
                    onClick={signOut}
                    className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors font-mono text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Exit</span>
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={signIn}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors font-mono text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </motion.button>
              )}
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? (
                  <X className="h-6 w-6 text-cyber-green" />
                ) : (
                  <Menu className="h-6 w-6 text-cyber-green" />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="md:hidden mt-4 flex flex-col space-y-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {NAV_ITEMS.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <motion.button
                      onClick={() => setIsOpen(false)}
                      className={`w-full px-4 py-3 rounded-lg font-mono text-sm text-left transition-all ${
                        isActive(item.href)
                          ? "bg-green-600/30 text-green-400 border border-green-500/50"
                          : "text-green-500/70 hover:text-green-400 hover:bg-green-600/10"
                      }`}
                    >
                      <div>{item.label}</div>
                      <div className="text-xs text-green-500/50">{item.description}</div>
                    </motion.button>
                  </Link>
                ))}

                <div className="pt-4 border-t border-green-500/20">
                  {loading ? (
                    <div className="w-full h-10 rounded-lg bg-green-600/20 animate-pulse" />
                  ) : user ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 px-4">
                        {user.photoUrl ? (
                          <img
                            src={user.photoUrl}
                            alt={user.displayName}
                            className="w-8 h-8 rounded-full border border-green-500"
                          />
                        ) : (
                          <User className="w-8 h-8 text-green-500" />
                        )}
                        <span className="text-sm text-green-500 font-mono">
                          {user.displayName}
                        </span>
                      </div>
                      <motion.button
                        onClick={() => {
                          signOut();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors font-mono text-sm"
                        whileTap={{ scale: 0.95 }}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      onClick={() => {
                        signIn();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors font-mono text-sm"
                      whileTap={{ scale: 0.95 }}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In with Google</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}
