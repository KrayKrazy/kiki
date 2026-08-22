// Um banco de dados em memória super simples para armazenar pedidos até o Brendi buscar.
// NOTA: Na Vercel (Serverless), a memória pode resetar. Para produção pesada, usaríamos Vercel KV (Redis).

const globalAny = global as any;

if (!globalAny.__db) {
  globalAny.__db = {
    orders: {} as Record<string, any>,
    events: [] as any[]
  };
}

export const db = globalAny.__db;

export function addOrderEvent(orderData: any) {
  const orderId = orderData.id || `ORD-${Date.now()}`;
  
  // Salva o pedido completo para quando o Brendi pedir os detalhes
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
