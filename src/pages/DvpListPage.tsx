import React from "react";
import { DataTable } from "../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listProducts } from "../logic/product.logic";
import { AuthContext } from "../components/navigation/AuthProvider";
import { Button, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ProductStatus = [
  ["Pending", "error"],
  ["In Progress", "warning"],
  ["Awaiting Approval", "info"],
  ["Approved", "success"],
];

const ProductListPage = () => {
  const navigate = useNavigate();

  const columns: GridColDef[] = [
    { field: "product_code", headerName: "Product Code", width: 200 },
    { field: "name", headerName: "Product Name", width: 250 },
    {
      field: "status",
      headerName: "Status",
      width: 200,
      renderCell: (params: GridRenderCellParams<number>) => (
        <Chip
          label={ProductStatus[params.value - 1][0]}
          sx={{
            fontWeight: 600,
          }}
          //@ts-ignore
          color={ProductStatus[params.value - 1][1]}
          variant="outlined"
        />
      ),
    },
    {
      field: "approved_version",
      headerName: "Latest Version",
      width: 200,
    },
    { field: "cost", headerName: "Cost", width: 200 },
    {
      field: "id",
      headerName: "Actions",
      align: "left",
      width: 250,
      renderCell: (params: GridRenderCellParams<string>) => (
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
    listProducts(auth.token, false, 25, 1).then((productList) => {
      const newRows = productList.map((product) => {
        return {
          id: product._id,
          product_code: product.product_code,
          name: product.name,
          status: product.status,
          approved_version: product.approved_version,
          cost: product.cost ? `$${product.cost}` : "-",
        };
      });
      setRows(newRows);
    });
  }, []);

  if (rows == null) return null;

  return <DataTable rows={rows!} columns={columns}></DataTable>;
};

export default ProductListPage;
