import type { NextFunction, Request, Response } from "express";

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Wraps async route handlers so rejected promises reach the centralized
// error handler instead of crashing the process / hanging the request.
export default function asyncHandler(fn: Handler) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
