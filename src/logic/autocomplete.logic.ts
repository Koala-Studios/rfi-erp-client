import { lookupCustomer } from "./customer.logic";
import { lookupInventory } from "./inventory.logic";
import { lookupProductType } from "./product-type.logic";
import { lookupSupplier } from "./supplier.logic";
import { lookupUser } from "./user.logic";

export const lookup = async (
  query: string,
  dbOption:
    | "customer"
    | "inventory"
    | "user"
    | "products"
    | "supplier"
    | "product-type"
    | "product-type-mat"
    | "approved-products",
  letterMin: number
) => {
  if (query.length < letterMin) return [];

  if (dbOption === "customer") {
    return await lookupCustomer(query);
  } else if (dbOption === "supplier") {
    return await lookupSupplier(query);
  } else if (dbOption === "inventory") {
    return await lookupInventory(query, false);
  } else if (dbOption === "user") {
    return await lookupUser(query);
  } else if (dbOption === "products") {
    return await lookupInventory(query, true);
  } else if (dbOption === "approved-products") {
    return await lookupInventory(query, true, true);
  } else if (dbOption === "product-type") {
    return await lookupProductType(query, true);
  } else if (dbOption === "product-type-mat") {
    return await lookupProductType(query, false);
  }

  return [];
};
