// Frontend/src/components/ui/Alert.jsx
import * as React from "react";
// Assuming you have a cn utility using clsx and tailwind-merge (as per your dependencies)
import { cn } from "@/utils/cn"; 
import { cva } from "class-variance-authority"; // You have "class-variance-authority" installed

// --- 1. Alert Component Styles (using cva) ---

const alertVariants = cva(
  "relative w-full rounded-card border p-4 [&>svg]:absolute [&>svg]:text-foreground [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        // Primary variant (e.g., for verification/processing)
        default: "bg-background text-foreground", 
        // Success variant (e.g., for payment success)
        success: "border-green-400/50 text-green-700 bg-green-50", 
        // Destructive variant (e.g., for payment failure or errors)
        destructive:
          "border-red-400/50 text-red-700 bg-red-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// --- 2. Alert Component ---

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

// --- 3. Alert Title Component ---

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

// --- 4. Alert Description Component ---

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

// --- 5. Export Components ---

export { Alert, AlertTitle, AlertDescription };