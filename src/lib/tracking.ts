// Biblioteca de rastreamento para tráfego pago
// Dispara eventos para Meta Pixel, Google Analytics (GA4) e GTM dataLayer

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

// ─── META PIXEL + GA4 EVENTS ────────────────────────────────────────────────

export function trackViewContent(product: { id: string; title: string; price: number }) {
  // Meta Pixel - ViewContent
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_name: product.title,
      content_type: 'product',
      value: product.price,
      currency: 'BRL'
    });
  }
  // Google Analytics 4 - view_item
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'view_item',
      ecommerce: {
        items: [{
          item_id: product.id,
          item_name: product.title,
          price: product.price,
          currency: 'BRL'
        }]
      }
    });
  }
}

export function trackAddToCart(product: { id: string; title: string; price: number; quantity: number }) {
  // Meta Pixel - AddToCart
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [product.id],
      content_name: product.title,
      content_type: 'product',
      value: product.price * product.quantity,
      currency: 'BRL'
    });
  }
  // Google Analytics 4 - add_to_cart
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'add_to_cart',
      ecommerce: {
        items: [{
          item_id: product.id,
          item_name: product.title,
          price: product.price,
          quantity: product.quantity,
          currency: 'BRL'
        }]
      }
    });
  }
}

export function trackInitiateCheckout(cartItems: any[], total: number) {
  // Meta Pixel - InitiateCheckout
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: cartItems.map(i => i.id),
      num_items: cartItems.reduce((acc, i) => acc + i.quantity, 0),
      value: total,
      currency: 'BRL'
    });
  }
  // Google Analytics 4 - begin_checkout
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'begin_checkout',
      ecommerce: {
        value: total,
        currency: 'BRL',
        items: cartItems.map(i => ({
          item_id: i.id,
          item_name: i.title,
          price: i.price,
          quantity: i.quantity
        }))
      }
    });
  }
}

export function trackPageView(pageName: string) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({ event: 'page_view', page_name: pageName });
  }
}
