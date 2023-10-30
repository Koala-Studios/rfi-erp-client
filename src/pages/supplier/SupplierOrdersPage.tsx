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

export const SupplierOrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);
  const [currPage, setCurrPage] = React.useState<number>(1);

  const columns: GridColDef[] = [
    { field: "supplier_code", headerName: "Order Code", width: 120 },
    
  ];

  React.useEffect(() => {
    listSupplierOrders(searchParams, filterArray, id).then((list) => {
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

export default SupplierOrdersPage;