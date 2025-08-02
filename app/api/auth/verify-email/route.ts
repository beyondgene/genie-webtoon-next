// app/api/auth/verify-email/route.ts
import { NextRequest } from "next/server";
import { verifyEmail } from "@/controllers/auth/verifyEmailController";

export async function GET(req: NextRequest) {
  return verifyEmail(req);
}
