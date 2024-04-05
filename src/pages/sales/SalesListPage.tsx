import React from "react";
import { DataTable } from "../../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listSalesOrders } from "../../logic/sales-order.logic";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { Button, Card, Chip } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FilterElement, IListData } from "../../logic/utils";
import DataFilter from "../../components/utils/DataFilter";

const SalesListPage = () => {
  const SalesListStatus = [
    ["AWAITING SHIPPING", "warning"],
    ["AWAITING ARRIVAL", "warning"],
    ["PARTIALLY RECEIVED", "success"],
    ["RECEIVED", "success"],
    ["ABANDONED", "error"],
    ["DRAFT", "warning"],
    ["ERROR", "error"],
  ];
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);
  //label,field,type
  const filterArray: FilterElement[] = [
    {
      label: "Product Code",
      field: "product_code",
      type: "text",
    },
    { label: "Batch Code", field: "batch_code", type: "text" },
    { label: "Quantity", field: "quantity", type: "number", regexOption: null },
  ];
  const columns: GridColDef[] = [
    { field: "order_code", headerName: "Order Code", width: 200 },
    { field: "customer", headerName: "Customer Name", width: 200 },
    { field: "date_orderd", headerName: "Purchase Date", width: 200 },
    { field: "item_count", headerName: "Item Count", width: 200 },
    {
      field: "status",
      headerName: "Status",
      width: 200,
      align: "center",
      renderCell: (params: GridRenderCellParams<number>) => (
        <Chip
          label={SalesListStatus[params.value ? params.value - 1 : 6][0]}
          sx={{
            fontWeight: 600,
          }}
          //@ts-ignore
          color={SalesListStatus[params.value ? params.value - 1 : 6][1]}
          variant="outlined"
        />
      ),
    },
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

  React.useEffect(() => {
    listSalesOrders(searchParams, filterArray).then((list) => {
      const newRows = list!.docs.map((order) => {
        return {
          id: order._id,
          order_code: order.order_code,
          customer: order.customer.name,
          date_orderd: order.date_orderd
            ? order.date_orderd.toString().replace(/\T.+/, "")
            : "",
          status: order.status,
          item_count: order.order_items.length,
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, [location.key]);

  const createNewSalesOrder = () => {
    navigate(`/sales-orders/new`, { replace: false });
  };

  if (dataOptions == null) return null;

  return (
    <>
      <Card
        variant="outlined"
        sx={{ mb: 2, p: 2, border: "1px solid #c9c9c9" }}
      >
        <DataFilter filters={filterArray}></DataFilter>

        <Button
          variant="contained"
          color="primary"
          onClick={createNewSalesOrder}
        >
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
