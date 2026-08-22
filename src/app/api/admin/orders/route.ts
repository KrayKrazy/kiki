import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  // Retorna os pedidos ordenados por data (mais recentes primeiro)
  const orders = Object.values(db.orders).sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return NextResponse.json({ orders }, { status: 200 });
}
