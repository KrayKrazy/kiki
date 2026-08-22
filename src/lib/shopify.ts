// Configurações do Shopify (devem vir do .env)
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'sua-loja.myshopify.com';
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || 'SEU_TOKEN_AQUI';

export async function shopifyFetch({ query, variables }: { query: string; variables?: any }) {
  const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN
      },
      body: JSON.stringify({ query, variables })
    });

    return await response.json();
  } catch (error) {
    console.error('Erro na chamada do Shopify:', error);
    throw error;
  }
}

// Exemplo de query para buscar os produtos
export async function getProducts() {
  const query = `
    query getProducts {
      products(first: 10) {
        edges {
          node {
            id
            title
            description
            variants(first: 1) {
              edges {
                node {
                  id
                  price {
                    amount
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  // return await shopifyFetch({ query });
  return []; // Retorno vazio por enquanto
}
