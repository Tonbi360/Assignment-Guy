import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabase";

// Extend Express Request to carry the authenticated Supabase user ID
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Middleware: verifies the Supabase JWT from the Authorization Bearer header.
 * Attaches `req.userId` (the Supabase auth.users UUID) on success.
 * Returns 401 if the token is missing, invalid, or expired.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
      code: "UNAUTHORIZED",
    });
    return;
  }

  const token = authHeader.slice(7);

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired session. Please sign in again.",
      code: "INVALID_TOKEN",
    });
    return;
  }

  req.userId = user.id;
  next();
}
