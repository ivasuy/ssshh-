"use client";

import { Menu, X, Globe } from "lucide-react";
import { CreditMeter } from "./credit-meter";
import { LocationFilter } from "./location-filter";
import { motion, AnimatePresence } from "framer-motion";
import Btn03 from "../ui/btn03";
import { useEffect, useState } from "react";
import BlinkingCursor from "../ui/blinking-cursor";

interface NavbarProps {
  user: any;
  location: string;
  setLocation: (value: string) => void;
  onShareClick: () => void;
}

export function Navbar({
  user,
  location,
  setLocation,
  onShareClick,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Globe className="h-6 w-6 text-cyber-green" />
              <h1 className="font-pixel text-cyber-green text-xl">
                Anonymous Gossips
                <BlinkingCursor />
              </h1>
            </motion.div>
            <div className="hidden md:flex">
              {user && (
                <span className="text-xl text-green-500 font-mono">
                  {user.username}
                </span>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <LocationFilter location={location} setLocation={setLocation} />
              {user && <CreditMeter user={user} />}
              <Btn03
                className="bg-green-600 hover:bg-green-900 transition-colors"
                onClick={onShareClick}
              >
                Share Gossip
              </Btn03>
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
                className="md:hidden mt-4 flex flex-col items-center space-y-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {user && (
                  <span className="text-sm text-green-500 font-mono">
                    {user.username}
                  </span>
                )}
                <LocationFilter location={location} setLocation={setLocation} />
                {user && <CreditMeter user={user} />}
                <Btn03
                  className="bg-green-600 hover:bg-green-900 transition-colors"
                  onClick={onShareClick}
                >
                  Share Gossip
                </Btn03>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}
