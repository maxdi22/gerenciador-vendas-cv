import React from "react";
import { cn } from "../../lib/utils";

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card = ({ children, className }: CardProps) => {
    return (
        <div className={cn("bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm", className)}>
            {children}
        </div>
    );
};
