import { lookupCustomer } from "./customer.logic";
import { lookupInventoryStock } from "./inventory-stock.logic";
import { lookupInventory } from "./inventory.logic";
import { lookupLocation } from "./location.logic";
import { lookupProductType } from "./product-type.logic";
import { lookupProduct } from "./product.logic";
import { lookupSupplier } from "./supplier.logic";
import { lookupRoles, lookupUser } from "./user.logic";

export const lookup = async (
  query: string,
  dbOption:
    | "customer"
    | "supplier"
    | "inventory-stock"
    | "inventory" // all products and materials
    | "material" // not for sale
    | "raw-mat" //is raw, not for sale
    | "non-raw-mat" //is not raw, not for sale
    | "product" //for sale
    | "approved-product" //approved and for sale
    | "approved-product-all" //for sale and not for sale, just approved that matters
    | "non-approved-product-all" //for sale and not for sale, just not approved that matters
    | "user"
    | "product-type"
    | "product-type-mat"
    | "product-type-raw"
    | "location"
    | "container"
    | "roles",
  letterMin: number
) => {
  if (query.length < letterMin) return [];
  //TODO: CONVERT TO SWITCH STATEMENT LOL..

  if (dbOption === "inventory") {
    return await lookupInventory(query, undefined, undefined, true);
  }
  if (dbOption === "inventory-stock") {
    return await lookupInventoryStock(query);
  } else if (dbOption === "material") {
    return await lookupInventory(query, false, undefined, true);
  } else if (dbOption === "raw-mat") {
    return await lookupInventory(query, false, true, undefined);
  } else if (dbOption === "non-raw-mat") {
    return await lookupInventory(query, false, false, true);
  } else if (dbOption === "product") {
    return await lookupProduct(query, true, undefined);
  } else if (dbOption === "approved-product") {
    return await lookupProduct(query, true, true);
  } else if (dbOption === "approved-product-all") {
    return await lookupProduct(query, undefined, true);
  } else if (dbOption === "non-approved-product-all") {
    return await lookupProduct(query, undefined, false);
  } else if (dbOption === "product-type") {
    return await lookupProductType(query, true, false);
  } else if (dbOption === "product-type-mat") {
    return await lookupProductType(query, false, false);
  } else if (dbOption === "product-type-raw") {
    return await lookupProductType(query, false, true);
  } else if (dbOption === "customer") {
    return await lookupCustomer(query);
  } else if (dbOption === "supplier") {
    return await lookupSupplier(query);
  } else if (dbOption === "user") {
    return await lookupUser(query);
  } else if (dbOption === "location") {
    return await lookupLocation(query);
  } else if (dbOption === "container") {
    return await lookupInventoryStock(query);
  } else if (dbOption === "roles") {
    return await lookupRoles(query);
  }

  return [];
};
