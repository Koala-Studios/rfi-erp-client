import { lookupCustomer } from "./customer.logic";
import { lookupInventory } from "./inventory.logic";
import { lookupProductType } from "./product-type.logic";
import { lookupSupplier } from "./supplier.logic";
import { lookupUser } from "./user.logic";

export const lookup = async (
  token: string,
  query: string,
  dbOption: "customer" | "inventory" | "user" | "products" | "supplier" | "product-type" | "product-type-mat" | "approved-products",
  letterMin: number
) => {
  if (query.length < letterMin) return [];

  if (dbOption === "customer") {
    return await lookupCustomer(token, query);
  }
  else if (dbOption === "supplier") {
    return await lookupSupplier(token, query);
  }
   else if (dbOption === "inventory") {
    return await lookupInventory(token, query, false);
  } else if (dbOption === "user") {
    return await lookupUser(token, query);
  }  else if (dbOption === "products") {
    return await lookupInventory(token, query, true);
  }
   else if (dbOption === "approved-products") {
    return await lookupInventory(token, query, true, true);
  }
   else if (dbOption === "product-type") {
    return await lookupProductType(token, query, true);
  }
  else if (dbOption === "product-type-mat") {
    return await lookupProductType(token, query, false);
  }

  return [];
};
