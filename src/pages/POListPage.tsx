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
    { field: "supplier", headerName: "Supplier Name", width: 200 },
    { field: "date_purchased", headerName: "Purchase Date", width: 200 },
    { field: "item_count", headerName: "Item Count", width: 200 },
    { field: "status", headerName: "Status", width: 200 },
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
        </strong>
      )
    }
  ];

  const auth = React.useContext(AuthContext);
  const [rows, setRows] = React.useState<any>(null);

  React.useEffect(() => {
    listPOs(auth.token, 25, 1).then((purchaseList) => {
      console.log(purchaseList)
      const newRows = purchaseList.map((purchase) => {
        return {
          id: purchase._id,
          order_code: purchase.order_code,
          supplier: purchase.supplier,
          date_purchased: purchase.date_purchased.toString().replace(/\T.+/, ''),
          status: purchase.status,
          item_count: purchase.order_items.length
        };
      });
      setRows(newRows);
    });
  }, []);

  if (rows == null) return null;

  return <DataTable rows={rows!} columns={columns}></DataTable>;
};

export default POListPage;
