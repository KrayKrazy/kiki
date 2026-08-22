import axios from 'axios';

const BRENDI_API_URL = process.env.BRENDI_API_URL || 'https://api.brendi.com.br/v1';
const BRENDI_API_TOKEN = process.env.BRENDI_API_TOKEN || 'SEU_TOKEN_DO_BRENDI_AQUI';

export async function sendOrderToBrendi(orderData: any) {
  try {
    const payload = {
      external_id: orderData.id.toString(),
      customer: {
        name: orderData.customer?.first_name + ' ' + orderData.customer?.last_name,
        phone: orderData.customer?.phone || '',
        email: orderData.customer?.email || ''
      },
      delivery_address: {
        street: orderData.shipping_address?.address1,
        number: orderData.shipping_address?.address2 || 'S/N',
        city: orderData.shipping_address?.city,
        state: orderData.shipping_address?.province_code,
        zipcode: orderData.shipping_address?.zip
      },
      items: orderData.line_items.map((item: any) => ({
        external_id: item.product_id.toString(),
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price)
      })),
      payment: {
        method: 'ONLINE',
        total_amount: parseFloat(orderData.total_price),
        status: 'PAID'
      },
      notes: orderData.note || 'Pedido feito via Shopify'
    };

    console.log('Pedido para o Brendi:', JSON.stringify(payload, null, 2));
    return { success: true, brendiOrderId: 'BRD-' + Math.floor(Math.random() * 10000) };
  } catch (error) {
    console.error('Erro ao enviar pedido:', error);
    throw error;
  }
}
