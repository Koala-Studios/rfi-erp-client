import React from "react";
import { DataTable } from "../../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listInventory } from "../../logic/inventory.logic";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { Button, Card } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { setTokenSourceMapRange } from "typescript";
import { FilterElement, IListData } from "../../logic/utils";
import DataFilter from "../../components/utils/DataFilter";

//label,field,type
const filterArray: FilterElement[] = [
  { label: "Item Name", field: "name", type: "text" },
  {
    label: "Item Code",
    field: "product_code",
    type: "text",
    regexOption: null,
  },
  { label: "Product Alias", field: "aliases", type: "text"},
  { label: "Cas number", field: "cas_number", type: "text"},
  { label: "Regulatory", field: "regulatory", type: "text"}, // Look at regulatory obj
  { label: "Dietary", field: "dietary", type: "text"},
  { label: "Product Type", field: "product_type", type: "text"},
  { label: "Date Created", field: "date_created", type: "date"},
  { label: "Solid", field: "is_solid", type: "text"},
];

const MaterialListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const auth = React.useContext(AuthContext);
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);
  const [currPage, setCurrPage] = React.useState<number>(1);

  const columns: GridColDef[] = [
    { field: "product_id", headerName: "Item Code", width: 120 },
    { field: "name", headerName: "Item Name", width: 300 },
    { field: "cost", headerName: "Cost/KG", width: 100, align: "right" },
    { field: "on_hand", headerName: "On Hand", width: 100, align: "right" },
    {
      field: "reorder_amount",
      headerName: "Reorder Amt",
      width: 100,
      align: "right",
    },
    { field: "ordered", headerName: "Ordered", width: 100, align: "right" },
    {
      field: "quarantined",
      headerName: "Quarantined",
      width: 100,
      align: "right",
    },
    { field: "allocated", headerName: "Allocated", width: 100, align: "right" },
    {
      field: "id",
      headerName: "Actions",
      align: "left",
      width: 120,
      renderCell: (params: GridRenderCellParams<string>) => (
        <strong>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              console.log(params.row)
              if(params.row.is_raw) {
              navigate(`/inventory/${params.value}`, { replace: false })
              } else {
              navigate(`/products/${params.value}`, { replace: false })
              }
            }
            }
          >
            View Details
          </Button>
        </strong>
      ),
    },
  ];

  React.useEffect(() => { //TODO: SET THE LIST HERE TO ONLY RAW MATERIALS, DO THIS WITH FILTERS!
    listInventory(searchParams, filterArray, false).then((list) => {
      const newRows = list!.docs.map((item) => {
        return {
          id: item._id,
          product_id: item.product_code,
          name: item.name,
          cost: item.cost,
          reorder_amount: item.reorder_amount ?? 0,
          on_hand: item.on_hand ?? 0,
          ordered: item.ordered ?? 0,
          quarantined: item.quarantined ?? 0,
          allocated: item.allocated ?? 0,
          is_raw: item.is_raw
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, [currPage, location.key]);
  const createNewMaterial = (is_raw:boolean) => {
    navigate( is_raw ? `/inventory/new` : `/products/new/material` , { replace: false });
  };

  if (dataOptions == null) return null;

  return (
    <>
      <Card
        variant="outlined"
        sx={{ mb: 2, p: 2, border: "1px solid #c9c9c9" }}
      >
        <DataFilter filters={filterArray}></DataFilter>

        <Button variant="contained" color="primary" onClick={() => {createNewMaterial(true)}} sx={{mr:2}}>
          + New Raw Mat
        </Button>
        <Button variant="contained" color="primary" onClick={() => {createNewMaterial(false)}}>
          + New N-Raw Mat
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

export default MaterialListPage;
