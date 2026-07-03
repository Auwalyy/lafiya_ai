"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/api";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Invalid verification link."); return; }
    auth.verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((e) => { setStatus("error"); setMessage(e.message ?? "Verification failed."); });
  }, [token]);

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardContent className="p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Verifying your email...</h1>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Email verified!</h1>
            <p className="text-slate-500 text-sm mb-6">Your account is now active. You can sign in.</p>
            <Link href="/login">
              <Button className="w-full">Sign In</Button>
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Verification failed</h1>
            <p className="text-slate-500 text-sm mb-6">{message || "The link may be expired or invalid."}</p>
            <Link href="/login">
              <Button variant="outline" className="w-full">Back to Sign In</Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
