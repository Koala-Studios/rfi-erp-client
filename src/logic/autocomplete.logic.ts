import { lookupCustomer } from "./customer.logic";
import { lookupInventory } from "./inventory.logic";
import { lookupUser } from "./user.logic";

export const lookup = async (
  token: string,
  query: string,
  dbOption: "customer" | "inventory" | "user" | "products",
  letterMin: number
) => {
  if (query.length < letterMin) return [];

  if (dbOption === "customer") {
    return await lookupCustomer(token, query);
  } else if (dbOption === "inventory") {
    return await lookupInventory(token, query, false);
  } else if (dbOption === "user") {
    return await lookupUser(token, query);
  }  else if (dbOption === "products") {
    return await lookupInventory(token, query, true);
  }

  return [];
};
