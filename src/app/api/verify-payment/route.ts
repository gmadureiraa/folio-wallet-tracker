import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/verify-tx";
import { createClient } from "@supabase/supabase-js";
import type { ChainKey } from "@/lib/payment-config";

export async function POST(req: NextRequest) {
  try {
    const { txHash, chain, token, amount } = await req.json();

    if (!txHash || !chain || !token || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const receivingWallet = process.env.NEXT_PUBLIC_PAYMENT_WALLET;
    if (!receivingWallet) {
      return NextResponse.json({ error: "Payment wallet not configured" }, { status: 503 });
    }

    const result = await verifyPayment({
      txHash,
      chain: chain as ChainKey,
      token,
      expectedAmount: amount,
      receivingWallet,
    });

    if (result.valid) {
      // Try to record payment and upgrade user if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        try {
          const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

          // Read user from the Authorization header (bearer token from the client session)
          const authHeader = req.headers.get("authorization");
          let userId: string | null = null;

          if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.slice(7);
            const { data: { user } } = await supabaseAdmin.auth.getUser(token);
            userId = user?.id ?? null;
          }

          if (userId) {
            // Insert payment record
            await supabaseAdmin.from("payments").insert({
              user_id: userId,
              tx_hash: txHash,
              chain,
              token,
              amount,
              verified: true,
              created_at: new Date().toISOString(),
            });

            // Upgrade user profile to pro (1 year)
            const expiresAt = new Date();
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);

            await supabaseAdmin.from("profiles").upsert({
              id: userId,
              plan: "pro",
              plan_expires_at: expiresAt.toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: "id" });
          }
        } catch (dbError) {
          // Log but don't fail the payment verification
          console.error("Failed to record payment in DB:", dbError);
        }
      }

      return NextResponse.json({ success: true, message: "Payment verified! Pro plan activated." });
    }

    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed" },
      { status: 500 }
    );
  }
}
