"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogCloseButton,
  DialogClose,
} from "@/components/ui/dialog";
import { FormField } from "@/components/accounts/form-field";
import { EnumSelect } from "@/components/accounts/enum-select";
import { Loader2 } from "lucide-react";
import type {
  Account,
  AccountFieldErrors,
  AccountType,
  EditAccountFormData,
  NormalBalance,
  UpdateAccountResponse,
} from "@/types/account";

const ACCOUNT_TYPES: readonly AccountType[] = [
  "ASSET",
  "LIABILITY",
  "EQUITY",
  "REVENUE",
  "EXPENSE",
];

const NORMAL_BALANCES: readonly NormalBalance[] = ["DEBIT", "CREDIT"];

// ---------------------------------------------------------------------------
// Account Edit Dialog
// ---------------------------------------------------------------------------

interface AccountEditDialogProps {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountUpdated: (updated: Account, message: string) => Promise<void>;
}

export function AccountEditDialog({
  account,
  open,
  onOpenChange,
  onAccountUpdated,
}: AccountEditDialogProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<AccountFieldErrors>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<EditAccountFormData>({
    code: "",
    name: "",
    accountType: "ASSET",
    normalBalance: "DEBIT",
    isActive: true,
  });

  // Sync form data when account changes
  React.useEffect(() => {
    if (account) {
      setFormData({
        code: account.code,
        name: account.name,
        accountType: account.accountType,
        normalBalance: account.normalBalance,
        isActive: account.isActive,
      });
      setFieldErrors({});
      setServerError(null);
    }
  }, [account]);

  function clearFieldError(key: keyof AccountFieldErrors) {
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
    if (serverError) setServerError(null);
  }

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setFormData((prev) => ({ ...prev, code: value }));
    clearFieldError("code");
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
    clearFieldError("name");
  }

  // Validasi input sebelum submit
  function validate(): AccountFieldErrors {
    const errors: AccountFieldErrors = {};

    if (!/^\d{3}$/.test(formData.code.trim())) {
      errors.code = ["Kode akun harus terdiri dari 3 digit angka"];
    }

    if (!formData.name.trim()) {
      errors.name = ["Nama akun wajib diisi"];
    } else if (formData.name.trim().length > 100) {
      errors.name = ["Nama akun maksimal 100 karakter"];
    }

    return errors;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!account) return;

    // Validasi klien sebelum mengirim ke API
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setIsPending(true);
    setFieldErrors({});
    setServerError(null);

    try {
      const res = await fetch(
        `/api/accounts/${encodeURIComponent(account.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: formData.code.trim(),
            name: formData.name.trim(),
            accountType: formData.accountType,
            normalBalance: formData.normalBalance,
            isActive: formData.isActive,
          }),
        }
      );

      const json: UpdateAccountResponse = await res.json();

      // Success: 200 { message, data }
      if (res.ok && "data" in json) {
        await onAccountUpdated(json.data, json.message);
        onOpenChange(false);
        return;
      }

      // Error validasi: 400 { error, details }
      if (
        res.status === 400 &&
        "details" in json &&
        json.details?.fieldErrors
      ) {
        const apiErrors: AccountFieldErrors = {};
        for (const key of ["code", "name", "accountType", "normalBalance"] as const) {
          const messages = json.details.fieldErrors[key];
          if (messages) apiErrors[key] = messages;
        }
        setFieldErrors(apiErrors);
        return;
      }

      setServerError("error" in json ? json.error : "Terjadi kesalahan koneksi. Silakan coba lagi.");
    } catch {
      setServerError("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup>
        <DialogCloseButton />
        <DialogHeader className="mb-4">
          <DialogTitle>Edit Akun</DialogTitle>
          <DialogDescription>
            Ubah informasi akun. Akun bawaan sistem tetap dapat diedit dan tidak
            dapat dihapus.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            label="Kode Akun"
            htmlFor="edit-account-code"
            required
            error={fieldErrors.code}
          >
            <Input
              id="edit-account-code"
              name="code"
              value={formData.code}
              onChange={handleCodeChange}
              placeholder="Contoh: 101"
              inputMode="numeric"
              maxLength={3}
              disabled={isPending}
              aria-invalid={!!fieldErrors.code}
              className="font-mono"
            />
          </FormField>

          <FormField
            label="Nama Akun"
            htmlFor="edit-account-name"
            required
            error={fieldErrors.name}
          >
            <Input
              id="edit-account-name"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Nama akun"
              maxLength={100}
              disabled={isPending}
              aria-invalid={!!fieldErrors.name}
            />
          </FormField>

          <FormField label="Tipe Akun" required>
            <EnumSelect<AccountType>
              value={formData.accountType}
              options={ACCOUNT_TYPES}
              placeholder="Pilih tipe akun"
              disabled={isPending}
              onValueChange={(v) => {
                setFormData((prev) => ({ ...prev, accountType: v }));
                clearFieldError("accountType");
              }}
            />
          </FormField>

          <FormField label="Saldo Normal" required>
            <EnumSelect<NormalBalance>
              value={formData.normalBalance}
              options={NORMAL_BALANCES}
              placeholder="Pilih saldo normal"
              disabled={isPending}
              onValueChange={(v) => {
                setFormData((prev) => ({ ...prev, normalBalance: v }));
                clearFieldError("normalBalance");
              }}
            />
          </FormField>

          {/* Status toggle (khusus edit) */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">Status</p>
              <p className="text-xs text-muted-foreground">
                {formData.isActive ? "Akun aktif" : "Akun nonaktif"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.isActive}
              onClick={() =>
                setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
              }
              disabled={isPending}
              className={[
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                formData.isActive ? "bg-primary" : "bg-input",
              ].join(" ")}
            >
              <span
                className={[
                  "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200",
                  formData.isActive ? "translate-x-4" : "translate-x-0",
                ].join(" ")}
              />
            </button>
          </div>

          {serverError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          )}

          <DialogFooter className="mt-2">
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={isPending}>
                  Batal
                </Button>
              }
            />
            <Button type="submit" disabled={isPending} className="gap-1.5">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
