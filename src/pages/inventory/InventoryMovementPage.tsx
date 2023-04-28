import React from "react";
import NavTab from "../../components/utils/NavTab";
import LinkTab from "../../components/utils/LinkTab";
import { Button, Card } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { DataTable } from "../../components/utils/DataTable";
import { listInventoryMovements } from "../../logic/inventory-movements.logic";
import { FilterElement, IListData } from "../../logic/utils";
import { useLocation, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { AuthContext } from "../../components/navigation/AuthProvider";

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
export const InventoryMovementPage = () => { //WILL BE USED FOR BOTH MATERIALS AND PRODUCTS!

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const auth = React.useContext(AuthContext);
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);
  const [currPage, setCurrPage] = React.useState<number>(1);

  const columns: GridColDef[] = [
    { field: "product_code", headerName: "Item Code", width: 120 },
    { field: "name", headerName: "Item Name", width: 300 },
    { field: "module_source", headerName: "Mvmt Source", width: 120, align: "center" },
    { field: "movement_target_type", headerName: "Mvmt Type", width: 100, align: "center" },
    { field: "amount", headerName: "Amount", width: 150, align: "right", valueGetter: (params) => params.row.amount.toFixed(5) },
    
  ];

  React.useEffect(() => {
    listInventoryMovements(searchParams, filterArray, id).then((list) => {
      const newRows =  list!.docs.map((item) => {
        return {...item, id: item._id}
      }
      )
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, [currPage, location.key]);

  if (dataOptions == null) return null;

  return <>
          <NavTab>
            <LinkTab label="Details" href="./../" />
            <LinkTab label="Suppliers" href="./../suppliers" />
            <LinkTab label="Movements" href="." />
            <LinkTab label="Usage Stats" href="./../stats" />
          </NavTab>
    <Card variant="outlined" style={{ paddingLeft:16, paddingRight:16,paddingBottom:16, marginBottom: 10 }}>
    <DataTable
        rows={dataOptions.rows}
        columns={columns}
        auto_height={true}
        listOptions={dataOptions.listOptions}
      ></DataTable>
    </Card>
  </>;
};

export default InventoryMovementPage;