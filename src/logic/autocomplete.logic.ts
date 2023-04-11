import { lookupCustomer } from "./customer.logic";
import { lookupInventory } from "./inventory.logic";
import { lookupProductType } from "./product-type.logic";
import { lookupProduct } from "./product.logic";
import { lookupSupplier } from "./supplier.logic";
import { lookupUser } from "./user.logic";

export const lookup = async (
  query: string,
  dbOption:
    | "customer"
    | "inventory"// all products and materials
    | "material" // not for sale
    | "raw-mat" //is raw, not for sale
    | "non-raw-mat" //is not raw, not for sale
    | "product" //for sale
    | "approved-product" //approved and for sale
    | "approved-product-all" //for sale and not for sale, just approved that matters
    | "non-approved-product-all" //for sale and not for sale, just not approved that matters
    | "user"
    | "supplier"
    | "product-type"
    | "product-type-mat",
  letterMin: number
) => {
  if (query.length < letterMin) return [];

  if (dbOption === "customer") {
    return await lookupCustomer(query);
  } else if (dbOption === "supplier") {
    return await lookupSupplier(query);
  } else if (dbOption === "user") {
    return await lookupUser(query);
  }
  
  else if (dbOption === "inventory") {
    return await lookupInventory(query, null, null, true);
  } else if (dbOption === "material") {
    return await lookupInventory(query, false, null, true);
  } else if (dbOption === "raw-mat") {
    return await lookupInventory(query, false, true,  null);
  } else if (dbOption === "non-raw-mat") {
    return await lookupInventory(query, false, false, true);
  }
  
  else if (dbOption === "product") {
    return await lookupProduct(query, true, null);
  } else if (dbOption === "approved-product") {
    return await lookupProduct(query, true, true);
  } else if (dbOption === "approved-product-all") {
    return await lookupProduct(query, null, true);
  } else if (dbOption === "non-approved-product-all") {
    return await lookupProduct(query, null, false);
  }
  
  else if (dbOption === "product-type") {
    return await lookupProductType(query, true);
  } else if (dbOption === "product-type-mat") {
    return await lookupProductType(query, false);
  }

  return [];
};
