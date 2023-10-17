import React from "react";
import { DataTable } from "../../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listPOs } from "../../logic/purchase-order.logic";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { Button, Card, Chip } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FilterElement, IListData } from "../../logic/utils";
import DataFilter from "../../components/utils/DataFilter";

const PurchaseListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);

  
const PurchaseStatus = [
  ["AWAITING SHIPPING", "warning"],
  ["AWAITING ARRIVAL", "warning"],
  ["PARTIALLY RECEIVED", "success"],
  ["RECEIVED", "success"],
  ["ABANDONED", "error"],
  ["DRAFT", "warning"],
  ["ERROR", 'error']
];


  const filterArray: FilterElement[] = [
    { label: "Order Code", field: "order_code", type: "text" },
    { label: "Date Purchased", field: "date_purchased", type: "date" },
    { label: "Date Arrived", field: "date_arrived", type: "date" },
    { label: "Shipping Code", field: "shipping_code", type: "text" },
    { label: "Supplier", field: "supplier", type: "dropdown", options: [{value: "sup", text: "Sup_1"}, {value: "Rolling", text: "Sup_2"}] },
    { label: "Status", field: "status", type: "dropdown", options: [{value: 1, text: "Ok"}, {value: 2, text: "\!Ok"}] },
  ];
  const columns: GridColDef[] = [
    { field: "order_code", headerName: "Order Code", width: 150 },
    { field: "supplier", headerName: "Supplier", width: 130 },
    { field: "date_purchased", headerName: "Purchase Date", width: 130 },
    { field: "item_count", headerName: "Item #", width: 80 },
    {
      field: "status",
      headerName: "Status",
      width: 200,
      align: 'center',
      renderCell: (params: GridRenderCellParams<number>) => (
        <Chip
          label={PurchaseStatus[params.value ? params.value - 1 : 6][0]}
          sx={{
            fontWeight: 600,
          }}
          //@ts-ignore
          color={PurchaseStatus[params.value ? params.value - 1 : 6][1]}
          variant="outlined"
        />
      ),
    },
    { field: "notes", headerName: "Notes", width: 250 },
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
  React.useEffect(() => {
    listPOs(searchParams, filterArray).then((list) => {
      const newRows = list!.docs.map((purchase) => {
        return {
          id: purchase._id,
          order_code: purchase.order_code,
          supplier: purchase.supplier.name,
          date_purchased: purchase.date_purchased
            ? purchase.date_purchased.toString().replace(/\T.+/, "")
            : "Not Set",
          status: purchase.status,
          item_count: purchase.order_items.length,
          notes: purchase.notes
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, [location.key]);
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
      <DataFilter filters={filterArray}></DataFilter>
        <Button
          variant="contained"
          color="primary"
          onClick={createNewPurchaseOrder}
        >
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

export default PurchaseListPage;
