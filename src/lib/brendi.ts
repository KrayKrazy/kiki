const BRENDI_API_URL = process.env.BRENDI_API_URL || 'https://api.brendi.com.br';
const BRENDI_CLIENT_ID = process.env.BRENDI_CLIENT_ID || '6168a806-dd41-424e-844a-0120a5b13828';
const BRENDI_API_TOKEN = process.env.BRENDI_API_TOKEN || '231f8979cda81f3096089dc963626ee9f50730772f1a7cac0a0e1b225e27f6ca5b503fac54e3abd72017db904915df0e';

export async function sendOrderToBrendi(orderData: any) {
  try {
    const payload = {
      external_id: String(orderData.data?.id || orderData.id || ''),
      customer: {
        name: orderData.data?.customer?.name || '',
        phone: orderData.data?.customer?.phone || '',
        email: orderData.data?.customer?.email || ''
      },
      delivery_address: {
        street: orderData.data?.shipping?.street || orderData.data?.address?.street || '',
        number: orderData.data?.shipping?.number || orderData.data?.address?.number || 'S/N',
        city: orderData.data?.shipping?.city || orderData.data?.address?.city || '',
        state: orderData.data?.shipping?.state || orderData.data?.address?.state || '',
        zipcode: orderData.data?.shipping?.zipcode || orderData.data?.address?.zipcode || ''
      },
      // Como o Cakto agrupa tudo no nome da oferta, enviamos como 1 item genérico contendo a descrição completa
      items: [
        {
          external_id: String(orderData.data?.offer?.id || 'cakto-item'),
          name: orderData.data?.offer?.name || 'Pedido Kikis Burguer',
          quantity: 1,
          price: parseFloat(orderData.data?.amount || '0')
        }
      ],
      payment: {
        method: orderData.data?.paymentMethodName === 'Pix' ? 'PIX' : 'ONLINE',
        total_amount: parseFloat(orderData.data?.amount || '0'),
        status: orderData.status === 'paid' || orderData.event === 'purchase_approved' ? 'PAID' : 'PENDING'
      },
      notes: 'Pedido recebido via Cakto Webhook'
    };

    console.log('Enviando pedido ao Brendi:', JSON.stringify(payload, null, 2));

    // Chamada real ao Brendi
    const response = await fetch(`${BRENDI_API_URL}/v1/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BRENDI_API_TOKEN}`,
        'X-Client-Id': BRENDI_CLIENT_ID,
        'client_id': BRENDI_CLIENT_ID, // Enviando em ambos os formatos comuns por segurança
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log(`[Brendi API] Status ${response.status}:`, responseText.substring(0, 300));

    if (!response.ok) {
      throw new Error(`Brendi API error (${response.status}): ${responseText.substring(0, 200)}`);
    }

    return JSON.parse(responseText);

  } catch (error) {
    console.error('Erro ao enviar pedido para o Brendi:', error);
    throw error;
  }
}
