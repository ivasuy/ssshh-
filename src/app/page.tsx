"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/nav/navbar";
import { useUser } from "@/context/UserContext";
import { GossipForm } from "@/components/gossip/gossip-form";
import { GossipGrid } from "@/components/gossip/gossip-grid";
import { motion, AnimatePresence } from "framer-motion";
import FloatingPaths from "@/components/ui/floating-paths";
import { isIpBlocked } from "@/service/api";
import { redirect } from "next/navigation";
import DisclaimerPopup from "@/components/disclaimer-popup";
// import { Button } from "@/components/ui/button";

export default function Home() {
  const [location, setLocation] = useState("worldwide");
  const [keyword, setKeyword] = useState("trending news");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (user?.ip) {
      isIpBlocked(user.ip).then((blocked) => {
        if (blocked) setIsBlocked(true);
      });
    }
  }, [user]);

  useEffect(() => {
    const disclaimerAccepted = localStorage.getItem("disclaimerAccepted");
    if (!disclaimerAccepted) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleAcknowledge = () => {
    localStorage.setItem("disclaimerAccepted", "true");
    setShowDisclaimer(false);
  };

  if (isBlocked) redirect("/blocked");

  return (
    <div className="relative min-h-screen bg-[#0D0F1E] crt">
      <div className="fixed inset-0 z-0">
        <FloatingPaths />
      </div>
      {showDisclaimer && (
        <DisclaimerPopup
          isOpen={showDisclaimer}
          onAcknowledge={handleAcknowledge}
        />
      )}
      {user && (
        <Navbar
          user={user}
          location={location}
          keyword={keyword}
          setKeyword={setKeyword}
          setLocation={setLocation}
          onShareClick={() => setIsShareDialogOpen(true)}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {user && (
          <GossipGrid location={location} user={user} keyword={keyword} />
        )}
      </motion.div>

      <AnimatePresence>
        {isShareDialogOpen && (
          <GossipForm
            open={isShareDialogOpen}
            onOpenChange={setIsShareDialogOpen}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
