import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

type Schemas = Partial<{ body: ZodTypeAny; query: ZodTypeAny; params: ZodTypeAny }>;

/**
 * Validates & type-narrows request input against Zod schemas before it
 * reaches business logic. This is the primary defense against injection and
 * mass-assignment: unknown fields are stripped, types are coerced/rejected,
 * and constraints (length, format, enum) are enforced at the boundary.
 */
export function validate(schemas: Schemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      next();
    } catch (err) {
      next(err);
    }
  };
}
