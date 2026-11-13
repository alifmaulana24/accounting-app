"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "cn";

// ---------------------------------------------------------------------------
// EnumSelect: pemilih nilai enum berbasis DropdownMenu (mengikuti pola
// dropdown filter pada tabel) untuk field Tipe Akun & Saldo Normal.
// ---------------------------------------------------------------------------

interface EnumSelectProps<T extends string> {
  value: T | "";
  options: readonly T[];
  placeholder: string;
  disabled?: boolean;
  invalid?: boolean;
  onValueChange: (value: T) => void;
}

export function EnumSelect<T extends string>({
  value,
  options,
  placeholder,
  disabled,
  invalid,
  onValueChange,
}: EnumSelectProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={invalid}
            className={cn(
              "w-full justify-between font-normal gap-1.5",
              !value && "text-muted-foreground",
              invalid && "border-destructive"
            )}
          >
            <span className="truncate">{value || placeholder}</span>
            <ChevronDown className="size-4 text-muted-foreground shrink-0" />
          </Button>
        }
      />
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(v) => onValueChange(v as T)}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {option}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
