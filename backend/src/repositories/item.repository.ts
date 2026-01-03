import { ItemModel } from "../models/item.model.js";

export const ItemRepository = {
  getAll: () => ItemModel.find(),
  getById: (id: string) => ItemModel.findById(id),
  create: (data: any) => new ItemModel(data).save(),
  update: (id: string, data: any) => ItemModel.findByIdAndUpdate(id, data, { new: true }),
  delete: (id: string) => ItemModel.findByIdAndDelete(id)
};
