import React from "react";
import { DataTable } from "../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listPOs } from "../logic/purchase-order.logic";
import { AuthContext } from "../components/navigation/AuthProvider";
import { Button, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";


const POListPage = () => {
  const navigate = useNavigate();

  const columns: GridColDef[] = [
    { field: "order_code", headerName: "Product Code", width: 200 },
  ];

  const auth = React.useContext(AuthContext);
  const [rows, setRows] = React.useState<any>(null);

  React.useEffect(() => {
    listPOs(auth.token, 25, 1).then((purchaseList) => {
      console.log(purchaseList)
      const newRows = purchaseList.map((purchase) => {
        return {
          id: purchase._id,
          product_code: purchase.order_code,
        };
      });
      setRows(newRows);
    });
  }, []);

  if (rows == null) return null;

  return <DataTable rows={rows!} columns={columns}></DataTable>;
};

export default POListPage;
