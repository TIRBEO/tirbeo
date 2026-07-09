import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from './db/prisma';
import { requireAdmin, requireRole, canManageRole, getAdminRole } from './session';
import { cachedJson } from './response';
import { createAuditEvent } from './audit';

async function auditLog(actorId: string, action: string, entityType: string, entityId: string, metadata?: Record<string, unknown>) {
  await prisma.log.create({
    data: {
      ip: '',
      method: 'ADMIN',
      path: `/admin/${entityType}/${entityId}`,
      userId: actorId,
      status: 0,
    },
  });
  await createAuditEvent({
    actorId,
    action,
    targetType: entityType,
    targetId: entityId,
    metadata,
    severity: action.includes('delete') ? 'warning' : 'info',
  });
}

// ─── Users (super_admin / admin / manager) ───

export async function listUsers(request: NextRequest) {
  const session = await requireRole(request, 'manager');
  if (session instanceof NextResponse) return session;

  const search = request.nextUrl.searchParams.get('search') || '';
  const page = Number(request.nextUrl.searchParams.get('page')) || 1;
  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit')) || 100, 500);

  const where: any = search
    ? { OR: [{ email: { contains: search } }, { name: { contains: search } }] }
    : {};

  // Super admin can see all users; others can only see non-super-admin users
  if (session.adminRole !== 'super_admin') {
    where.adminRole = { not: 'super_admin' };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        adminRole: true,
        photoUrl: true,
        phoneNumber: true,
        occupation: true,
        createdAt: true,
        lastActiveAt: true,
        roleAssignments: {
          select: { role: { select: { id: true, name: true, color: true, icon: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const mapped = users.map(u => ({
    ...u,
    roles: u.roleAssignments.map(a => a.role),
    roleAssignments: undefined,
  }));

  return NextResponse.json({ users: mapped, total, page, limit });
}

export async function getUserDetail(request: NextRequest, userId: string) {
  const session = await requireRole(request, 'manager');
  if (session instanceof NextResponse) return session;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      adminRole: true,
      photoUrl: true,
      secondaryEmail: true,
      phoneNumber: true,
      occupation: true,
      googleId: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { sessions: true, memberships: true, ownedWorkspaces: true } },
      roleAssignments: {
        select: { role: { select: { id: true, name: true, color: true, icon: true } } },
      },
    },
  });
  if (!user) return new NextResponse('User not found', { status: 404 });
  return NextResponse.json({ ...user, roles: user.roleAssignments.map(a => a.role), roleAssignments: undefined });
}

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  adminRole: z.enum(['super_admin', 'admin', 'manager', 'editor']).nullable().optional(),
  photoUrl: z.string().url().optional(),
  phoneNumber: z.string().optional(),
  occupation: z.string().optional(),
});

export async function updateUser(request: NextRequest, userId: string) {
  const session = await requireAdmin(request);
  if (session instanceof NextResponse) return session;

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) return new NextResponse('User not found', { status: 404 });

  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) return new NextResponse('Invalid payload', { status: 400 });

  if (parsed.data.adminRole !== undefined) {
    if (!canManageRole(session.adminRole, existing.adminRole)) {
      return new NextResponse('Cannot change role of this user', { status: 403 });
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
    select: {
      id: true,
      email: true,
      name: true,
      adminRole: true,
      photoUrl: true,
      phoneNumber: true,
      occupation: true,
    },
  });
  return NextResponse.json(updated);
}

export async function deleteUser(request: NextRequest, userId: string) {
  const session = await requireRole(request, 'super_admin');
  if (session instanceof NextResponse) return session;

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) return new NextResponse('User not found', { status: 404 });

  await prisma.user.delete({ where: { id: userId } });
  return new NextResponse('User deleted', { status: 200 });
}

// ─── Workspaces (super_admin / admin) ───

export async function listWorkspaces(request: NextRequest) {
  const session = await requireRole(request, 'admin');
  if (session instanceof NextResponse) return session;

  const page = Number(request.nextUrl.searchParams.get('page')) || 1;
  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit')) || 100, 500);

  const [workspaces, total] = await Promise.all([
    prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        ownerId: true,
        createdAt: true,
        owner: { select: { id: true, email: true, name: true } },
        _count: { select: { memberships: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.workspace.count(),
  ]);

  return NextResponse.json({ workspaces, total, page, limit });
}

export async function deleteWorkspace(request: NextRequest, workspaceId: string) {
  const session = await requireRole(request, 'super_admin');
  if (session instanceof NextResponse) return session;

  const existing = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!existing) return new NextResponse('Workspace not found', { status: 404 });

  await prisma.workspace.delete({ where: { id: workspaceId } });
  return new NextResponse('Workspace deleted', { status: 200 });
}

// ─── Stats (all admin roles) ───

export async function getStats(request: NextRequest) {
  const session = await requireAdmin(request);
  if (session instanceof NextResponse) return session;

  const [userCount, workspaceCount, routeCount, logCount, blocklistCount] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count(),
    prisma.route.count(),
    prisma.log.count(),
    prisma.blocklist.count(),
  ]);

  const adminUsers = await prisma.user.findMany({
    where: { adminRole: { not: null } },
    select: { id: true, email: true, name: true, adminRole: true },
  });

  return cachedJson({
    counts: { users: userCount, workspaces: workspaceCount, routes: routeCount, logs: logCount, blocked: blocklistCount },
    adminUsers,
  }, { ttl: 15, swr: 120 });
}

// ─── Seed ───

// ─── User Role Assignment (super_admin only) ───

export async function updateUserRoles(request: NextRequest, userId: string) {
  const session = await requireRole(request, 'super_admin');
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  const { roleIds } = body;
  if (!Array.isArray(roleIds)) {
    return new NextResponse('roleIds array required', { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) return new NextResponse('User not found', { status: 404 });

  // Delete all existing role assignments
  await prisma.userRole.deleteMany({ where: { userId } });

  // Create new assignments
  if (roleIds.length > 0) {
    const validRoles = await prisma.appRole.findMany({
      where: { id: { in: roleIds }, isSystem: false },
      select: { id: true },
    });
    const validIds = new Set(validRoles.map(r => r.id));
    const toCreate = roleIds.filter((id: string) => validIds.has(id));
    if (toCreate.length > 0) {
      await prisma.userRole.createMany({
        data: toCreate.map((roleId: string) => ({ userId, roleId })),
      });
    }
  }

  const updated = await prisma.userRole.findMany({
    where: { userId },
    include: { role: { select: { id: true, name: true, color: true, icon: true } } },
  });
  return NextResponse.json({ roles: updated.map(a => a.role) });
}

export async function seedAdminHandler(request: NextRequest) {
  const body = await request.json();
  const { email, adminRole } = body;

  if (!email || !adminRole) {
    return new NextResponse('email and adminRole required', { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return new NextResponse('User not found', { status: 404 });

  await prisma.user.update({
    where: { email },
    data: { adminRole },
  });

  return NextResponse.json({ message: `User ${email} promoted to ${adminRole}` });
}
