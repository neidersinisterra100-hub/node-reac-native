import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { createItemSchema, updateItemSchema, idParamSchema } from "../schemas/item.schema.js";
import { getItems, createItem } from "../controllers/items.controller.js";

const router = Router();

router.get("/items", getItems);
router.post("/items", validate({ body: createItemSchema }), createItem);

export { router };
