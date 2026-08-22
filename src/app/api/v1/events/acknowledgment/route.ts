import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // A estrutura esperada é um array de objetos com eventId
    const ackEvents = await request.json();

    if (Array.isArray(ackEvents)) {
      const ackIds = ackEvents.map(e => e.eventId || e.id);
      
      // Remove os eventos confirmados da fila para não enviar novamente
      const initialLength = db.events.length;
      db.events = db.events.filter(event => !ackIds.includes(event.eventId));
      
      console.log(`[Open Delivery] Brendi confirmou recebimento de ${initialLength - db.events.length} evento(s).`);
    }

    return NextResponse.json({}, { status: 202 });
  } catch (error) {
    console.error('Erro no Acknowledgment:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
