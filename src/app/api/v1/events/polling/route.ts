import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  // Padrão Open Delivery: retornar os eventos pendentes para o POS (Brendi)
  
  // O Brendi pode ficar consultando a cada 30 segundos
  // Retornamos todos os eventos na fila.
  
  // Se não houver eventos, o padrão Open Delivery diz para retornar 204 No Content,
  // ou 200 com array vazio (depende da implementação, geralmente 200 [] é seguro).
  
  if (db.events.length === 0) {
    return NextResponse.json([], { status: 200 }); // Retorna vazio se não tiver pedidos
  }

  return NextResponse.json(db.events, { status: 200 });
}
