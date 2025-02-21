"use client";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { UserType } from "@/types/types";

const maxCredits = 5000;

interface CreditMeterProps {
  user: UserType;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function CreditMeter({ user }: CreditMeterProps) {
  const handleCashout = async () => {
    if (!user) return;
    if (user.credit < maxCredits) {
      alert("You need at least 5000 credits to cash out.");
      return;
    }
    try {
      const userRef = doc(db, "users", user.ip);
      await updateDoc(userRef, { credit: 0 });
      alert("Cashout request submitted! ₹500 will be sent soon.");
    } catch (error) {
      console.error("Error processing cashout:", error);
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center w-full sm:w-[200px]"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
    >
      <p className="text-sm text-muted-foreground mb-2">
        {user.credit.toFixed(1)} / {maxCredits}
      </p>
      <motion.div
        className="w-full"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Progress
          value={(user.credit / maxCredits) * 100}
          className="w-full h-2 bg-gray-300 rounded-full"
        />
      </motion.div>
      {user.credit >= maxCredits && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-2"
        >
          <Button
            className="w-full bg-green-500 hover:bg-green-600 text-white transition-colors"
            onClick={handleCashout}
          >
            Cashout ₹500
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
