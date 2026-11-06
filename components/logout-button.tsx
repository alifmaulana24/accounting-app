"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon" | "xs";
  showIcon?: boolean;
  label?: string;
}

export function LogoutButton({
  className,
  variant = "ghost",
  size = "default",
  showIcon = true,
  label = "Logout",
}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={isPending}
      onClick={handleLogout}
      className={cn("cursor-pointer", className)}
    >
      {showIcon && <LogOut className="size-4 shrink-0" />}
      <span>{isPending ? "Keluar..." : label}</span>
    </Button>
  );
}

