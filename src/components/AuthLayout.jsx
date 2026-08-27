import React from "react";
import MobileBackBar from "./directory/MobileBackBar";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen bg-background">
      <MobileBackBar />
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
            {children}
          </div>
          {footer &&
            <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
          }
        </div>
      </div>
    </div>
  );
}