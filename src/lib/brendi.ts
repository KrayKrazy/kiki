const BRENDI_API_URL = process.env.BRENDI_API_URL || 'https://api.brendi.com.br/v1';
const BRENDI_API_TOKEN = process.env.BRENDI_API_TOKEN || 'SEU_TOKEN_DO_BRENDI_AQUI';

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

    // Chamada real ao Brendi (ativada quando o token estiver configurado)
    if (BRENDI_API_TOKEN !== 'SEU_TOKEN_DO_BRENDI_AQUI') {
      const response = await fetch(`${BRENDI_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BRENDI_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Brendi API error: ${response.status}`);
      }

      return await response.json();
    }

    // Retorno simulado enquanto o token não está configurado
    return { success: true, brendiOrderId: 'BRD-' + Math.floor(Math.random() * 10000) };

  } catch (error) {
    console.error('Erro ao enviar pedido para o Brendi:', error);
    throw error;
  }
}
