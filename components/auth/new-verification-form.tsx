// components/auth/new-verification-form.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { newVerification } from "@/src/actions/new-verification";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormSuccess } from "@/components/form-success";
import { FormError } from "@/components/form-error";

export const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Missing token!");
      return;
    }

    newVerification(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
      })
      .catch(() => {
        setError("Something went wrong!");
      });
  }, [token]);

  return (
    <CardWrapper
      headerLabel="Verify Your Email"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      {!success && !error && <p>Verifying...</p>}
      <FormSuccess message={success ?? ""} />
      <FormError message={error ?? ""} />
    </CardWrapper>
  );
};