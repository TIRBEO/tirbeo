import { NextRequest } from 'next/server';
import { listUsers, getUserDetail, updateUser, deleteUser, updateUserRoles, banUserHandler, unbanUserHandler } from '../../../../../lib/adminHandlers';

export async function GET(request: NextRequest, { params }: { params: Promise<{ action: string[] }> }) {
  const { action } = await params;
  const [userId] = action || [];
  if (userId) return getUserDetail(request, userId);
  return listUsers(request);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ action: string[] }> }) {
  const { action } = await params;
  const [userId] = action || [];
  if (!userId) return new Response('Missing user id', { status: 400 });

  if (action?.[1] === 'roles') {
    return updateUserRoles(request, userId);
  }
  return updateUser(request, userId);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ action: string[] }> }) {
  const { action } = await params;
  const [userId] = action || [];
  if (!userId) return new Response('Missing user id', { status: 400 });
  return deleteUser(request, userId);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ action: string[] }> }) {
  const { action } = await params;
  const [userId, subAction] = action || [];
  if (!userId) return new Response('Missing user id', { status: 400 });

  if (subAction === 'ban') return banUserHandler(request, userId);
  if (subAction === 'unban') return unbanUserHandler(request, userId);

  return new Response('Unknown action', { status: 400 });
}
