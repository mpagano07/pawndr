const { MercadoPagoConfig, PreApproval } = require('mercadopago');
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' });
const preapproval = new PreApproval(client);

async function run() {
  try {
    const res = await preapproval.create({
      body: {
        payer_email: 'test_user_123456@testuser.com',
        reason: 'Test',
        external_reference: '1234',
        auto_recurring: { frequency: 1, frequency_type: 'months', transaction_amount: 20000, currency_id: 'ARS' },
        back_url: 'http://lvh.me:3000/services'
      }
    });
    console.log("SUCCESS");
  } catch (err) {
    console.error(err.message, err.response);
  }
}
run();
