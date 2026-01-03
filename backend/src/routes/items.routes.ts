import { Router } from "express";
import { validate } from "../middlewares/validate";
import { createItemSchema, updateItemSchema, idParamSchema } from "../schemas/item.schema";
import { getItems, createItem } from "../controllers/items.controller";

const router = Router();

router.get("/items", getItems);
router.post("/items", validate({ body: createItemSchema }), createItem);

export { router };
