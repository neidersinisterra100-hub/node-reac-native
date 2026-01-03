// // backend/src/services/payment.service.ts
// import mercadopago from "../config/mercadopago.js";

// export const createPaymentPreference = async (amount: number, title: string) => {
//   const preference = {
//     items: [
//       {
//         title,
//         quantity: 1,
//         currency_id: "ARS",
//         unit_price: amount,
//       },
//     ],
//   };

//   const response = await mercadopago.preferences.create(preference);
//   return response.body.init_point; // URL para redirigir al pago
// };
