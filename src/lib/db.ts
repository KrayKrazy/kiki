const globalAny = global as any;

if (!globalAny.__db) {
  globalAny.__db = {
    orders: {} as Record<string, any>,
    events: [] as any[],
    pendingAddresses: {} as Record<string, any>
  };
}

export const db = globalAny.__db;

export function addOrderEvent(orderData: any) {
  const orderId = orderData.id || `ORD-${Date.now()}`;
  
  // Extrai o endereço vindo direto do webhook da Cakto (Produto Físico)
  const customerInfo = orderData.data?.customer || {};
  const shippingInfo = orderData.data?.shipping || orderData.data?.address || {};
  
  const address = {
    street: shippingInfo.street || shippingInfo.address || customerInfo.address || "Endereço não informado",
    number: shippingInfo.number || "S/N",
    neighborhood: shippingInfo.neighborhood || shippingInfo.district || "Bairro não informado"
  };
  
  // Salva o pedido completo para quando o Brendi (ou nosso painel) pedir os detalhes
  db.orders[orderId] = {
    id: orderId,
    type: "DELIVERY",
    displayId: orderId.substring(0, 5),
    createdAt: new Date().toISOString(),
    orderTiming: "IMMEDIATE",
    preparationStartDateTime: new Date().toISOString(),
    merchant: {
      id: process.env.BRENDI_CLIENT_ID || "kikis-burguer",
      name: "Kikis Burguer"
    },
    customer: {
      id: "cust-1",
      phone: orderData.data?.customer?.phone || "00000000000",
      documentNumber: "00000000000",
      name: orderData.data?.customer?.name || "Cliente Cakto",
    },
    deliveryAddress: address,
    items: [
      {
        id: "item-1",
        name: orderData.data?.offer?.name || "Pedido Cakto",
        quantity: 1,
        price: parseFloat(orderData.data?.amount || "0"),
        totalPrice: parseFloat(orderData.data?.amount || "0")
      }
    ],
    total: {
      orderAmount: parseFloat(orderData.data?.amount || "0"),
      deliveryFee: 0,
      totalPrice: parseFloat(orderData.data?.amount || "0")
    },
    payments: [
      {
        methods: [
          {
            value: parseFloat(orderData.data?.amount || "0"),
            method: orderData.data?.paymentMethodName === 'Pix' ? 'PIX' : 'CREDIT',
            prepaid: true,
            currency: "BRL"
          }
        ]
      }
    ]
  };

  // Cria o evento que o Brendi vai ler no Polling
  const eventId = `EVT-${Date.now()}-${Math.floor(Math.random()*1000)}`;
  db.events.push({
    eventId: eventId,
    eventType: "CREATED",
    orderId: orderId,
    orderUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://kikisburger.vercel.app'}/api/v1/orders/${orderId}`,
    createdAt: new Date().toISOString(),
    sourceAppId: "kikis-app"
  });

  console.log(`[Open Delivery] Pedido ${orderId} salvo na fila para o Brendi buscar.`);
}
