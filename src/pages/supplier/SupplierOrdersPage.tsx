import React from "react";
import NavTab from "../../components/utils/NavTab";
import LinkTab from "../../components/utils/LinkTab";
import { Button, Card, Chip } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams, GridRowClassNameParams } from "@mui/x-data-grid";
import { DataTable } from "../../components/utils/DataTable";
import { listInventoryMovements } from "../../logic/inventory-movements.logic";
import { FilterElement, IListData } from "../../logic/utils";
import { useLocation, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { IInventoryStock, listInventoryContainers } from "../../logic/inventory-stock.logic";
import { listSupplierOrders } from "../../logic/purchase-order.logic";

//label,field,type
const filterArray: FilterElement[] = [
  { label: "Item Name", field: "name", type: "text" },
  {
    label: "Item Code",
    field: "product_code",
    type: "text",
    regexOption: null,
  },
];
  
const PurchaseStatus = [
  ["AWAITING SHIPPING", "warning"],
  ["AWAITING ARRIVAL", "warning"],
  ["PARTIALLY RECEIVED", "success"],
  ["RECEIVED", "success"],
  ["ABANDONED", "error"],
  ["DRAFT", "warning"],
  ["ERROR", 'error']
];

export const SupplierOrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);
  const [currPage, setCurrPage] = React.useState<number>(1);

  const columns: GridColDef[] = [
    { field: "order_code", headerName: "Order Code", width: 150 },
    { field: "date_purchased", headerName: "Date Purchased", width: 170 },
    { field: "order_items", headerName: "Item Count", width: 100, valueGetter(params) {
      return params.row.order_items.length
    }, align:'center' },
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
    // { field: "supplier", headerName: "Supplier Code", width: 160 , valueGetter(params) {
    //   return params.row.supplier.length
    // }, },
    // { field: "order_code", headerName: "Order Code", width: 150 },
    
  ];

  React.useEffect(() => {
    listSupplierOrders(searchParams, filterArray, id).then((list) => {
      console.log("sad")
      const newRows =  list!.docs.map((item) => {
        console.log(item, ' TESTING')
        return {...item, id: item._id}
      }
      )
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, [currPage, location.key]);

  if (dataOptions == null) return null;

  return <>
    <Card variant="outlined" style={{ padding:16, marginBottom: 10 }}>
    <DataTable
        rows={dataOptions.rows}
        columns={columns}
        auto_height={true}
        listOptions={dataOptions.listOptions}
      ></DataTable>
    </Card>
  </>;
};

export default SupplierOrdersPage;