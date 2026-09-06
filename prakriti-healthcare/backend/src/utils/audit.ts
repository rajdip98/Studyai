import type { Request } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

export async function recordAudit(
  req: Request,
  action: string,
  opts: { userId?: string; targetType?: string; targetId?: string; metadata?: Record<string, unknown> } = {},
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: opts.userId,
        action,
        targetType: opts.targetType,
        targetId: opts.targetId,
        ip: req.ip,
        userAgent: req.header("user-agent"),
        metadata: opts.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    // Audit logging must never break the primary request flow.
    logger.error({ err, action }, "Failed to write audit log");
  }
}
