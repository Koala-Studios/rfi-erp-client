import React from "react";
import { DataTable } from "../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listSalesOrders } from "../logic/sales-order.logic";
import { AuthContext } from "../components/navigation/AuthProvider";
import { Button, Card, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { IListData } from "../logic/utils";

const SalesListPage = () => {
  const navigate = useNavigate();

  const columns: GridColDef[] = [
    { field: "order_code", headerName: "Order Code", width: 200 },
    { field: "customer", headerName: "Customer Name", width: 200 },
    { field: "date_orderd", headerName: "Purchase Date", width: 200 },
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
              navigate(`/sales-orders/${params.value}`, { replace: false })
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
    listSalesOrders(auth.token, 25, 1).then((list) => {
      const newRows = list!.docs.map((order) => {
        return {
          id: order._id,
          order_code: order.order_code,
          customer: order.customer,
          date_orderd: order.date_orderd
            .toString()
            .replace(/\T.+/, ""),
          status: order.status,
          item_count: order.order_items.length,
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, []);

  const createNewSalesOrder = () => {
    navigate(`/sales/new`, { replace: false });
  };



  if (dataOptions == null) return null;
  
  return (
    <>
    <Card
    variant="outlined"
    sx={{ mb: 2, p: 2, border: "1px solid #c9c9c9" }}
  >
    <Button variant="contained" color="primary" onClick={createNewSalesOrder}>
      + New Sales Order
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

export default SalesListPage;
