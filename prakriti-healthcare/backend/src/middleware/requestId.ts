import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

// Correlates a client request across logs, error trackers (Sentry), and
// support tickets ("what's your request ID?").
export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = req.header("x-request-id") ?? randomUUID();
  res.setHeader("X-Request-Id", id);
  next();
}
