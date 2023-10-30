import React from "react";
import NavTab from "../../components/utils/NavTab";
import LinkTab from "../../components/utils/LinkTab";
import { Button, Card, Chip } from "@mui/material";
import { DataGrid, GridCellParams, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { DataTable } from "../../components/utils/DataTable";
import { IMovement, listInventoryMovements } from "../../logic/inventory-movements.logic";
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



const getClassName = (params: GridCellParams) => {  
  if (params.field === 'amount') {
    if(params.row.amount <= 0) {
      if(params.row.movement_target_type === 'on_hold' 
      || params.row.movement_target_type === 'ordered' 
      || params.row.movement_target_type === 'allocated' 
       ) {
          return 'YellowRow'
       } else if( params.row.movement_target_type === 'on_hand' ) {
        return 'RedRow'
       }
    } else if (params.row.amount > 0) {
      if(params.row.movement_target_type === 'on_hold' 
      || params.row.movement_target_type === 'ordered' 
      || params.row.movement_target_type === 'allocated' 
       ) {
          return 'BlueRow'
       } else if( params.row.movement_target_type === 'on_hand' ) {
        return 'GreenRow'
       }
    }
  }
  return '';  
};


export const InventoryMovementPage = () => { //WILL BE USED FOR BOTH MATERIALS AND PRODUCTS!

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);
  const [currPage, setCurrPage] = React.useState<number>(1);

  const columns: GridColDef[] = [
    { field: "product_code", headerName: "Item Code", width: 120 },
    { field: "lot_number", headerName: "Lot Number", width: 300 },
    { field: "module_source", headerName: "Source", width: 120, align: "center" },
    // { field: "movement_target_type", headerName: "Type", width: 100, align: "center" },
    {
      field: "movement_target_type",
      headerName: "Type",
      width: 120,
      align: 'center',
      renderCell: (params: GridRenderCellParams<number>) => (
        <Chip
          label={getLabel(params)}
          sx={{
            fontWeight: 600,
          }}
          //@ts-ignore
          color={getColor(params)}
          size="small"
          variant="outlined"
        />
      ),
    },
    { field: "amount", headerName: "Amount", width: 130, align: "right", valueGetter: (params) => params.row.amount.toFixed(5) },
    { field: "movement_date", headerName: "Date", width: 120, align: "center", valueGetter: (params) => params.row.movement_date.split('T')[0] },
    { field: "movement_time", headerName: "Time", width: 120, align: "center", valueGetter: (params) => params.row.movement_date.split('T')[1].split('.')[0]},
    
  ];
  const getLabel = (params:GridRenderCellParams) => {
    switch(params.row.movement_target_type) {
      case 'on_hold':
        return 'On Hold';
      case 'on_hand':
        return 'On Hand';
      case 'allocated':
        return 'Allocated';
      case 'ordered':
        return 'Ordered';
      default:
        return params.row.movement_target_type;
    }
}
const getColor = (params:GridRenderCellParams) => {
  switch(params.row.movement_target_type) {
    case 'on_hold':
      return 'info';
    case 'on_hand':
      return 'success';
    case 'allocated':
      return 'warning';
    case 'ordered':
      return 'primary';
    return 'none';
  }
}
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
    <Card variant="outlined" style={{ padding:16, marginBottom: 10 }}>
    <DataTable
        rows={dataOptions.rows}
        columns={columns}
        auto_height={true}
        GetCellClassName={getClassName}
        listOptions={dataOptions.listOptions}
      ></DataTable>
    </Card>
  </>;
};

export default InventoryMovementPage;