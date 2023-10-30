import React from "react";
import NavTab from "../../components/utils/NavTab";
import LinkTab from "../../components/utils/LinkTab";
import { Button, Card } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams, GridRowClassNameParams } from "@mui/x-data-grid";
import { DataTable } from "../../components/utils/DataTable";
import { listInventoryMovements } from "../../logic/inventory-movements.logic";
import { FilterElement, IListData } from "../../logic/utils";
import { useLocation, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { IInventoryStock, listInventoryContainers } from "../../logic/inventory-stock.logic";

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

export const InventoryContainerPage = () => { //WILL BE USED FOR BOTH MATERIALS AND PRODUCTS!

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);
  const [currPage, setCurrPage] = React.useState<number>(1);

  const columns: GridColDef[] = [
    { field: "product_code", headerName: "Item Code", width: 120 },
    // { field: "name", headerName: "Name", width: 240 },
    { field: "lot_number", headerName: "Lot Number", width: 100 },
    { field: "unit_cost", headerName: "Unit Cost", align:'right', width: 90, valueGetter: (params) => params.row.unit_cost.toFixed(2) },
    { field: "container_size", headerName: "Cont Size",align:'right',  width: 120 },
    { field: "sample", type:"boolean" ,headerName: "Sample?", width: 80 },
    { field: "received_amount", headerName: "Rec Qty", width: 120, valueGetter: (params) => params.row.received_amount.toFixed(5) },
    { field: "remaining_amount", headerName: "Rem Qty", width: 120, valueGetter: (params) => params.row.remaining_amount.toFixed(5) },
    { field: "allocated_amount", description:"Allocated Quantity", headerName: "Alloc Qty", width: 120, valueGetter: (params) => params.row.allocated_amount.toFixed(5) },
    { field: "quarantined_containers", description:"Quarantined Containers", headerName: "Quar Conts", width: 100 },
    { field: "supplier_code", headerName: "Sup Code", width: 110 },
    { field: "supplier_sku", headerName: "Sup SKU", width: 130 },
    { field: "received_date", headerName: "Rec Date", width: 100, valueGetter: (params) => params.row.received_date ? params.row.received_date.split('T')[0] : ''},
    { field: "expiry_date", headerName: "Exp Date", width: 100, valueGetter: (params) => params.row.expiry_date ? params.row.expiry_date.split('T')[0] : '' },
    { field: "notes", headerName: "Notes", width: 250 },
  ];

  React.useEffect(() => {
    listInventoryContainers(searchParams, filterArray, id).then((list) => {
      const newRows =  list!.docs.map((item) => {
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

export default InventoryContainerPage;