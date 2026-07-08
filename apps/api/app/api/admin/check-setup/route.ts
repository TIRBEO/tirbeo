import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';

export async function GET() {
  const adminCount = await prisma.user.count({
    where: { adminRole: { not: null } },
  });
  return NextResponse.json({ setupRequired: adminCount === 0 });
}
