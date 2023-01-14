import React from "react";
import { DataTable } from "../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listPOs } from "../logic/purchase-order.logic";
import { AuthContext } from "../components/navigation/AuthProvider";
import { Button, Card, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { IListData } from "../logic/utils";

const POListPage = () => {
  const navigate = useNavigate();

  const columns: GridColDef[] = [
    { field: "order_code", headerName: "Order Code", width: 200 },
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
              navigate(`/purchase-orders/${params.value}`, { replace: false })
            }
          >
            View Details
          </Button>
        </strong>
      ),
    },
  ];

  const auth = React.useContext(AuthContext);
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);

  React.useEffect(() => {
    listPOs(auth.token, 25, 1).then((list) => {
      const newRows = list!.docs.map((purchase) => {
        return {
          id: purchase._id,
          order_code: purchase.order_code,
          supplier: purchase.supplier,
          date_purchased: purchase.date_purchased
            .toString()
            .replace(/\T.+/, ""),
          status: purchase.status,
          item_count: purchase.order_items.length,
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, []);
  const createNewPurchaseOrder = () => {
    navigate(`/purchase-orders/new`, { replace: false });
  };

  if (dataOptions == null) return null;
  
  return (
    <>
      <Card
        variant="outlined"
        sx={{ mb: 2, p: 2, border: "1px solid #c9c9c9" }}
      >
        <Button variant="contained" color="primary" onClick={createNewPurchaseOrder}>
          + New Purchase Order
        </Button>
      </Card>
        <DataTable
      rows={dataOptions.rows}
      columns={columns}
      listOptions={dataOptions.listOptions}
    ></DataTable>
      </>

  );
};

export default POListPage;
