import React from "react";

type BadgeVariant = "healthy" | "warning" | "critical" | "neutral";

interface BadgeProps {
    variant: BadgeVariant;
    children: React.ReactNode;
}

export const Badge = ({ variant, children }: BadgeProps) => {
    const styles = {
        healthy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        warning: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        critical: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        neutral: "bg-slate-500/10 text-slate-400 border-slate-500/20"
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
            {children}
        </span>
    );
};
