const crypto = require("crypto");
const axios = require("axios");

class PaymentGateway {
  constructor(instAxios, API_KEY, INTEGRATION_ID, HMAC_SECRET) {
    if (!instAxios) throw new Error("axios instance is required");
    if (!API_KEY) throw new Error("API_KEY is required");
    if (!INTEGRATION_ID) throw new Error("INTEGRATION_ID is required");

    this.axios = instAxios;
    this.api_key = API_KEY;
    this.token = "";
    this.lastOrder = {};
    this.lastPaymentGetewayToken = "";
    this.integration_id = Number(INTEGRATION_ID);
    this.HMAC_SECRET = HMAC_SECRET;
  }

  getToken = async () => {
    try {
      const token = await paymobAPI.post("/auth/tokens", {
        api_key: this.api_key,
      });
      // console.log(token);
      this.token = token.data.token;
      // console.log("token", this.token);
      return this;
    } catch (error) {
      console.log("axios error ");
      console.error(error.response.data);
    }
  };

  createOrder = async ({ id, priceInCents, name, description }) => {
    // console.log(priceInCents, name, description);
    if (!this.token)
      throw new Error("Token is not set please call getToken first");
    if (!priceInCents || !name || !description)
      throw new Error("priceInCents, name, description are required");

    const body = {
      auth_token: this.token,
      delivery_needed: "false",
      amount_cents: priceInCents,
      currency: "EGP",
      merchant_order_id: id,
      items: [
        {
          name: name,
          amount_cents: priceInCents,
          description: description,
          quantity: 1,
        },
      ],
    };
    // console.log("data", body);
    this.lastOrder = (await this.axios.post("/ecommerce/orders", body)).data;
    // console.log("last order", this.lastOrder);
    return this.lastOrder;
  };

  createPaymentGateway = async ({
    uEmail,
    uFirstName,
    uLastName,
    uPhoneNumber,
    orderId,
    priceInCents,
  }) => {
    // console.log(
    //   "email",
    //   uEmail,
    //   "first",
    //   uFirstName,
    //   "last",
    //   uLastName,
    //   "phone",
    //   uPhoneNumber,
    //   "id",
    //   orderId,
    //   "price",
    //   priceInCents
    // );
    if (!this.lastOrder || !this.token)
      throw new Error("Order is not set please call createOrder first");
    if (!uEmail || !uFirstName || !uLastName || !uPhoneNumber)
      throw new Error(
        "uEmail, uFirstName, uLastName, uPhoneNumber are required"
      );

    const body = {
      auth_token: this.token,
      amount_cents: priceInCents || this.lastOrder.amount_cents,
      currency: "EGP",
      expiration: 3600,
      order_id: orderId || this.lastOrder.id,
      integration_id: this.integration_id,
      lock_order_when_paid: "true",
      billing_data: {
        email: uEmail,
        first_name: uFirstName,
        last_name: uLastName,
        phone_number: uPhoneNumber,
        apartment: "NA",
        floor: "NA",
        street: "NA",
        building: "NA",
        shipping_method: "NA",
        postal_code: "NA",
        city: "NA",
        country: "NA",
        state: "NA",
      },
    };
    // console.log(body);
    const paymentToken = (
      await this.axios.post("/acceptance/payment_keys", body)
    ).data.token;
    // console.log("payment token", paymentToken);
    return paymentToken;
  };

  createRufund = async (trxId, refundAmountInCents) => {
    try {
      const body = {
        auth_token: this.token,
        transaction_id: trxId,
        amount_cents: refundAmountInCents,
      };

      return (await this.axios.post("/acceptance/void_refund/refund", body))
        .data;
    } catch (err) {
      console.log("error", err.message);
    }
  };

  static verifyHmac = (res, HMAC, KEY) => {
    const {
      amount_cents,
      created_at,
      currency,
      error_occured,
      has_parent_transaction,
      id,
      integration_id,
      is_3d_secure,
      is_auth,
      is_capture,
      is_refunded,
      is_standalone_payment,
      is_voided,
      order,
      owner,
      pending,
      source_data,
      success,
    } = res.obj;

    const order_id = order.id;
    const {
      pan: source_data_pan,
      type: source_data_type,
      sub_type: source_data_sub_type,
    } = source_data;

    const stringHash = `${amount_cents}${created_at}${currency}${error_occured}${has_parent_transaction}${id}${integration_id}${is_3d_secure}${is_auth}${is_capture}${is_refunded}${is_standalone_payment}${is_voided}${order_id}${owner}${pending}${source_data_pan}${source_data_sub_type}${source_data_type}${success}`;

    const hash = crypto
      .createHmac("sha512", KEY)
      .update(stringHash)
      .digest("hex");

    return hash === HMAC;
  };
}
const paymobAPI = axios.create({
  baseURL: "https://accept.paymob.com/api/",
});
module.exports = {
  PaymentGateway,
  paymobAPI,
};
