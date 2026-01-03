import { ItemRepository } from "../repositories/item.repository.js";

export const ItemService = {
  getItems: () => ItemRepository.getAll(),
  getItem: (id: string) => ItemRepository.getById(id),
  createItem: (data: any) => ItemRepository.create(data),
  updateItem: (id: string, data: any) => ItemRepository.update(id, data),
  deleteItem: (id: string) => ItemRepository.delete(id)
};
