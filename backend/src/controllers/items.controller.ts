import { Request, Response } from "express";
import { ItemService } from "../services/item.service";
import { handleHttp } from "../utils/error.handle";

import mpClient from "../config/mercadopago";
import { Preference } from "mercadopago";

/**
 * 📦 Obtener todos los items
 * Usado por listados en frontend
 */
export const getItems = async (
  _req: Request,
  res: Response
) => {
  try {
    const items = await ItemService.getItems();

    res.status(200).json({
      ok: true,
      data: items,
    });
  } catch (error) {
    console.error(error);
    handleHttp(res, "ERROR_GET_ITEMS");
  }
};

/**
 * 🚤 Crear item (embarcación, vehículo, etc)
 * Devuelve item + link de MercadoPago
 */
export const createItem = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, price, description } = req.body;

    // 🛑 Validación mínima (frontend depende de esto)
    if (!name || !price) {
      return res.status(400).json({
        ok: false,
        message: "Nombre y precio son obligatorios",
      });
    }

    const item = await ItemService.createItem({
      name,
      price,
      description,
    });

    // 🟦 MercadoPago
    const preference = new Preference(mpClient);

    const mpResponse = await preference.create({
      body: {
        items: [
          {
            id: item.id.toString(),
            title: item.name,
            quantity: 1,
            unit_price: item.price,
          },
        ],
        back_urls: {
          success: "https://tuapp.com/success",
          failure: "https://tuapp.com/failure",
          pending: "https://tuapp.com/pending",
        },
        auto_return: "approved",
      },
    });

    res.status(201).json({
      ok: true,
      data: {
        item,
        paymentUrl: mpResponse.init_point,
      },
    });
  } catch (error) {
    console.error(error);
    handleHttp(res, "ERROR_CREATE_ITEM");
  }
};


// import { Request, Response } from "express";
// import { ItemService } from "../services/item.service";
// import { handleHttp } from "../utils/error.handle";

// import mpClient from "../config/mercadopago";
// import { Preference } from "mercadopago";

// export const getItems = async (req: Request, res: Response) => {
//   try {
//     const items = await ItemService.getItems();
//     res.json(items);
//   } catch {
//     handleHttp(res, "ERROR_GET_ITEMS");
//   }
// };

// export const createItem = async (req: Request, res: Response) => {
//   try {
//     const item = await ItemService.createItem(req.body);

//     const preference = new Preference(mpClient);

//     const mpResponse = await preference.create({
//       body: {
//         items: [
//           {
//             id: item.id.toString(), // ✅ OBLIGATORIO
//             title: item.name,
//             quantity: 1,
//             unit_price: item.price,
//           },
//         ],
//         back_urls: {
//           success: "https://tuapp.com/success",
//           failure: "https://tuapp.com/failure",
//           pending: "https://tuapp.com/pending",
//         },
//         auto_return: "approved",
//       },
//     });


//     res.status(201).json({
//       item,
//       mp_link: mpResponse.init_point,
//     });
//   } catch (error) {
//     console.error(error);
//     handleHttp(res, "ERROR_CREATE_ITEM");
//   }
// };
