// app/api/auth/signup/route.ts
import { NextRequest } from "next/server";
import { signup } from "@/controllers/auth/signupController";

export async function POST(req: NextRequest) {
  return signup(req);
}
