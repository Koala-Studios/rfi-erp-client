import React from "react";
import { DataTable } from "../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listProducts } from "../logic/product.logic";
import { AuthContext } from "../components/navigation/AuthProvider";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { IListData } from "../logic/utils";

const ProductListPage = () => {
  const navigate = useNavigate();

  const columns: GridColDef[] = [
    // { field: "id", headerName: "ID", width: 300 },
    { field: "product_code", headerName: "Product Code", width: 120 },
    { field: "name", headerName: "Product Name", width: 300 },
    {
      field: "approved_version",
      headerName: "Approved Version",
      width: 200,
    },
    { field: "cost", headerName: "Cost/KG", width: 100, align: "right" },
    { field: "on_hand", headerName: "On Hand", width: 100, align: "right" },
    { field: "on_order", headerName: "On Order", width: 100, align: "right" },
    {
      field: "quarantined",
      headerName: "Quarantined",
      width: 100,
      align: "right",
    },
    { field: "allocated", headerName: "Allocated", width: 100, align: "right" },
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
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);

  React.useEffect(() => {
    listProducts(auth.token, 25, 1,true).then((list) => {
      const newRows = list!.docs.map((product) => {
        return {
          id: product._id,
          product_code: product.product_code,
          name: product.name,
          approved_version: product.approved_version,
          cost: `$${product.cost}`,
          on_hand: product.on_hand ? product.on_hand : 0,
          on_order: product.on_order ? product.on_order : 0,
          quarantined: product.quarantined ? product.quarantined : 0,
          allocated: product.allocated ? product.allocated : 0,
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, []);

  if (dataOptions == null) return null;
  
  return (
    <DataTable
      rows={dataOptions.rows}
      columns={columns}
      listOptions={dataOptions.listOptions}
    ></DataTable>
  );
};

export default ProductListPage;
