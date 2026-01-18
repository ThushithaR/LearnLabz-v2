"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none active:scale-95",
                    {
                        "bg-accent text-background hover:bg-accentHover": variant === "primary",
                        "bg-surface text-textPrimary hover:bg-highlight border border-white/10": variant === "secondary",
                        "border-2 border-accent text-accent hover:bg-accent/10": variant === "outline",
                        "hover:bg-white/5 text-textSecondary hover:text-textPrimary": variant === "ghost",
                        "h-8 px-3 text-sm": size === "sm",
                        "h-10 px-5 text-base": size === "md",
                        "h-12 px-8 text-lg": size === "lg",
                        "h-9 w-9 p-0": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
