import { NextRequest } from 'next/server';
import { listWorkspaces, deleteWorkspace } from '../../../../../lib/adminHandlers';

export async function GET(request: NextRequest) {
  return listWorkspaces(request);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ action: string[] }> }) {
  const { action } = await params;
  const [workspaceId] = action || [];
  if (!workspaceId) return new Response('Missing workspace id', { status: 400 });
  return deleteWorkspace(request, workspaceId);
}
