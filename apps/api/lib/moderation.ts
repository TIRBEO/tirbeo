import { prisma } from './db/prisma';

export async function listReports(options: {
  limit?: number; offset?: number; status?: string; targetType?: string; reason?: string;
}) {
  const where: Record<string, unknown> = {};
  if (options.status) where.status = options.status;
  if (options.targetType) where.targetType = options.targetType;
  if (options.reason) where.reason = options.reason;

  const limit = Math.min(options.limit || 50, 200);
  const offset = options.offset || 0;

  const [items, total] = await Promise.all([
    prisma.contentReport.findMany({
      where: where as any,
      orderBy: { createdAt: 'desc' },
      take: limit, skip: offset,
      include: {
        reporter: { select: { id: true, email: true, name: true } },
        reviewedBy: { select: { id: true, email: true, name: true } },
      },
    }),
    prisma.contentReport.count({ where: where as any }),
  ]);
  return { items, total, limit, offset };
}

export async function getReportStats() {
  const groups = await prisma.contentReport.groupBy({ by: ['status'], _count: true });
  const typeGroups = await prisma.contentReport.groupBy({ by: ['targetType'], _count: true });
  const reasonGroups = await prisma.contentReport.groupBy({ by: ['reason'], _count: true });
  return { byStatus: groups, byType: typeGroups, byReason: reasonGroups };
}

export async function updateReport(id: string, data: {
  status?: string; reviewedById?: string; action?: string; notes?: string;
}) {
  return prisma.contentReport.update({
    where: { id },
    data: {
      ...(data.status && { status: data.status, reviewedAt: new Date() }),
      ...(data.reviewedById && { reviewedById: data.reviewedById }),
      ...(data.action !== undefined && { action: data.action }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });
}
