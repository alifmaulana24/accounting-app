"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
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
import { Plus, Loader2 } from "lucide-react";
import type {
  Account,
  AccountFieldErrors,
  AccountType,
  CreateAccountFormData,
  CreateAccountResponse,
  NormalBalance,
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
// Account Form
// ---------------------------------------------------------------------------

interface AccountFormProps {
  onSuccess: (account: Account, message: string) => Promise<void>;
  onClose: () => void;
}

function AccountForm({ onSuccess, onClose }: AccountFormProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<AccountFieldErrors>({});
  const [serverError, setServerError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<CreateAccountFormData>({
    code: "",
    name: "",
    accountType: "",
    normalBalance: "",
  });

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

    if (!formData.accountType) {
      errors.accountType = ["Tipe akun wajib dipilih"];
    }

    if (!formData.normalBalance) {
      errors.normalBalance = ["Saldo normal wajib dipilih"];
    }

    return errors;
  }

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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validasi klien sebelum mengirim ke API
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    submitAccount();
  }

  async function submitAccount() {
    setIsPending(true);
    setFieldErrors({});
    setServerError(null);

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code.trim(),
          name: formData.name.trim(),
          accountType: formData.accountType,
          normalBalance: formData.normalBalance,
        }),
      });

      const json: CreateAccountResponse = await res.json();

      // Success: 201 { message, data }
      if (res.status === 201 && "data" in json) {
        await onSuccess(json.data, json.message);
        onClose();
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

      setServerError("error" in json ? json.error : "Terjadi kesalahan. Silakan coba lagi.");
    } catch {
      setServerError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Kode Akun" htmlFor="account-code" required error={fieldErrors.code}>
        <Input
          id="account-code"
          name="code"
          value={formData.code}
          onChange={handleCodeChange}
          placeholder="Contoh: 101"
          inputMode="numeric"
          maxLength={3}
          disabled={isPending}
          aria-invalid={!!fieldErrors.code}
          autoComplete="off"
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground">
          Masukkan 3 digit angka.
        </p>
      </FormField>

      <FormField label="Nama Akun" htmlFor="account-name" required error={fieldErrors.name}>
        <Input
          id="account-name"
          name="name"
          value={formData.name}
          onChange={handleNameChange}
          placeholder="Contoh: Kas"
          maxLength={100}
          disabled={isPending}
          aria-invalid={!!fieldErrors.name}
        />
      </FormField>

      <FormField label="Tipe Akun" required error={fieldErrors.accountType}>
        <EnumSelect<AccountType>
          value={formData.accountType}
          options={ACCOUNT_TYPES}
          placeholder="Pilih tipe akun"
          disabled={isPending}
          invalid={!!fieldErrors.accountType}
          onValueChange={(v) => {
            setFormData((prev) => ({ ...prev, accountType: v }));
            clearFieldError("accountType");
          }}
        />
      </FormField>

      <FormField label="Saldo Normal" required error={fieldErrors.normalBalance}>
        <EnumSelect<NormalBalance>
          value={formData.normalBalance}
          options={NORMAL_BALANCES}
          placeholder="Pilih saldo normal"
          disabled={isPending}
          invalid={!!fieldErrors.normalBalance}
          onValueChange={(v) => {
            setFormData((prev) => ({ ...prev, normalBalance: v }));
            clearFieldError("normalBalance");
          }}
        />
      </FormField>

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
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Account Dialog
// ---------------------------------------------------------------------------

interface AccountDialogProps {
  onAccountAdded: (account: Account, message: string) => Promise<void>;
}

export function AccountDialog({ onAccountAdded }: AccountDialogProps) {
  const [open, setOpen] = React.useState(false);

  function handleClose() {
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-1.5">
            <Plus className="size-4" />
            Tambah Akun
          </Button>
        }
      />
      <DialogPopup>
        <DialogCloseButton />
        <DialogHeader className="mb-4">
          <DialogTitle>Tambah Akun</DialogTitle>
          <DialogDescription>
            Isi informasi akun baru. Status akun otomatis aktif setelah disimpan.
          </DialogDescription>
        </DialogHeader>
        <AccountForm onSuccess={onAccountAdded} onClose={handleClose} />
      </DialogPopup>
    </Dialog>
  );
}
