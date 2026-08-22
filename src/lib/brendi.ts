const BRENDI_API_URL = process.env.BRENDI_API_URL || 'https://api.brendi.com.br';
const BRENDI_CLIENT_ID = process.env.BRENDI_CLIENT_ID || '6168a806-dd41-424e-844a-0120a5b13828';
const BRENDI_API_TOKEN = process.env.BRENDI_API_TOKEN || '231f8979cda81f3096089dc963626ee9f50730772f1a7cac0a0e1b225e27f6ca5b503fac54e3abd72017db904915df0e';

export async function sendOrderToBrendi(orderData: any) {
  try {
    const payload = {
      external_id: String(orderData.id || orderData.transaction_id || ''),
      customer: {
        name: `${orderData.customer?.first_name || ''} ${orderData.customer?.last_name || ''}`.trim(),
        phone: orderData.customer?.phone || '',
        email: orderData.customer?.email || ''
      },
      delivery_address: {
        street: orderData.shipping_address?.address1 || '',
        number: orderData.shipping_address?.address2 || 'S/N',
        city: orderData.shipping_address?.city || '',
        state: orderData.shipping_address?.province_code || '',
        zipcode: orderData.shipping_address?.zip || ''
      },
      items: (orderData.line_items || []).map((item: any) => ({
        external_id: String(item.product_id || ''),
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price)
      })),
      payment: {
        method: 'ONLINE',
        total_amount: parseFloat(orderData.total_price || '0'),
        status: 'PAID'
      },
      notes: orderData.note || 'Pedido feito via Cakto'
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
