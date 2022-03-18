import React from "react";
import { DataTable } from "../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listProducts, ProductStatus } from "../logic/product.logic";
import { AuthContext } from "../components/navigation/AuthProvider";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ProductListPage = () => {
  const navigate = useNavigate();

  const columns: GridColDef[] = [
    // { field: "id", headerName: "ID", width: 300 },
    { field: "product_code", headerName: "Product Code", width: 200 },
    { field: "name", headerName: "Product Name", width: 250 },
    {
      field: "approved_version",
      headerName: "Approved Version",
      width: 200,
    },
    { field: "cost", headerName: "Cost", width: 200 },
    {
      field: "id",
      headerName: "Actions",
      align: "left",
      width: 250,
      renderCell: (params: GridRenderCellParams<Date>) => (
        <strong>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() =>
              navigate(`/products/${params.value}`, { replace: false })
            }
          >
            View Details
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            style={{ marginLeft: 16 }}
            onClick={() =>
              navigate(`/products/${params.value}`, { replace: false })
            }
          >
            Formula
          </Button>
        </strong>
      ),
    },
  ];

  const auth = React.useContext(AuthContext);
  const [rows, setRows] = React.useState<any>(null);

  React.useEffect(() => {
    listProducts(auth.token, 25, 1).then((productList) => {
      const newRows = productList.map((product) => {
        return {
          id: product._id,
          product_code: product.product_code,
          name: product.name,
          approved_version: product.approved_version,
          cost: `$${product.cost}`,
        };
      });
      setRows(newRows);
    });
  }, []);

  if (rows == null) return null;

  return <DataTable rows={rows!} columns={columns}></DataTable>;
};

export default ProductListPage;
