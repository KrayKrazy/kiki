import { NextResponse } from 'next/server';
import { sendOrderToBrendi } from '@/lib/brendi';

// Esta rota receberá os POSTs (Webhooks) do Cakto sempre que um pagamento for aprovado
export async function POST(request: Request) {
  try {
    // Pegar o corpo da requisição enviada pelo Cakto
    const orderData = await request.json();
    
    console.log('Webhook recebido do Cakto! Pedido ID:', orderData.id || orderData.data?.id);

    try {
      // Tentar enviar o pedido para o Brendi
      const brendiResponse = await sendOrderToBrendi(orderData);
      
      return NextResponse.json(
        { message: 'Sucesso', data: brendiResponse },
        { status: 200 }
      );
    } catch (brendiError: any) {
      // Se o Brendi falhar, não devolve erro 500 para a Cakto
      // A Cakto precisa de um status 200 OK para salvar e validar o webhook.
      console.error('Erro ao comunicar com a API do Brendi:', brendiError.message);
      
      return NextResponse.json(
        { message: 'Webhook recebido, mas falha ao enviar pro Brendi', error: brendiError.message },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error('Erro na rota do Webhook do Cakto (JSON inválido?):', error);
    return NextResponse.json(
      { message: 'Erro ao processar requisição' },
      { status: 400 }
    );
  }
}
