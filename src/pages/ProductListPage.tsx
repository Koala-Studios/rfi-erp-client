import React from "react";
import { DataTable } from "../components/utils/DataTable";
import { GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { listProducts, ProductStatus } from "../logic/product.logic";
import { AuthContext } from "../components/navigation/AuthProvider";

const columns: GridColDef[] = [
  // { field: "id", headerName: "ID", width: 300 },
  { field: "product_code", headerName: "Product Code", width: 150 },
  { field: "name", headerName: "Name", width: 250 },
  { field: "status", headerName: "Status", type: "string", width: 200 },
  { field: "cost", headerName: "Cost", type: "number", width: 150 },
];

const ProductListPage = () => {
  const auth = React.useContext(AuthContext);
  const [rows, setRows] = React.useState<any>(null);

  React.useEffect(() => {
    listProducts(auth.token, 25, 1).then((productList) => {
      const newRows = productList.map((product) => {
        return {
          id: product._id,
          product_code: product.product_code,
          name: product.name,
          cost: product.cost,
          status: ProductStatus[product.status - 1][0],
        };
      });
      setRows(newRows);
    });
  }, []);

  if (rows == null) return null;

  return <DataTable rows={rows!} columns={columns}></DataTable>;
};

export default ProductListPage;
