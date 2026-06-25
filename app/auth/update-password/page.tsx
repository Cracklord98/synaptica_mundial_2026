import { UpdatePasswordForm } from "@/components/update-password-form";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams?: Promise<{
    code?: string;
    token_hash?: string;
    type?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};

  if (params.code || params.token_hash) {
    const redirectParams = new URLSearchParams();
    if (params.code) redirectParams.set("code", params.code);
    if (params.token_hash) redirectParams.set("token_hash", params.token_hash);
    if (params.type) redirectParams.set("type", params.type);
    redirectParams.set("next", "/auth/update-password");

    redirect(`/auth/confirm?${redirectParams.toString()}`);
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
