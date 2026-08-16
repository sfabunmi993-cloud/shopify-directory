import React from "react";
import { motion } from "framer-motion";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ y: "-110vh", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 50, damping: 14, mass: 0.6 }}
          className="bg-card rounded-2xl shadow-sm border border-border p-8"
        >
          {children}
        </motion.div>
        {footer &&
        <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        }
      </div>
    </div>);

}