import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';

export async function GET() {
  try {
    const adminCount = await prisma.user.count({
      where: { adminRole: { not: null } },
    });

    let sessionTableExists = false;
    try {
      await prisma.session.count();
      sessionTableExists = true;
    } catch {
      sessionTableExists = false;
    }

    let dbOk = false;
    try {
      await prisma.$connect();
      dbOk = true;
    } catch {
      dbOk = false;
    }

    return NextResponse.json({
      dbConnected: dbOk,
      sessionTableExists,
      adminCount,
      setupRequired: adminCount === 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
