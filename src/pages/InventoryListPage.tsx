import React from "react";
import { DataTable } from "../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listInventory } from "../logic/inventory.logic";
import { AuthContext } from "../components/navigation/AuthProvider";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { setTokenSourceMapRange } from "typescript";
import { IListData } from "../logic/utils";

const InventoryListPage = () => {
  const navigate = useNavigate();

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
    { field: "on_order", headerName: "On Order", width: 100, align: "right" },
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
      width: 250,
      renderCell: (params: GridRenderCellParams<string>) => (
        <strong>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() =>
              navigate(`/products/${params.value}`, { replace: false })
            }
          >
            View Details
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            style={{ marginLeft: 16 }}
            onClick={() =>
              navigate(`/formula/${params.value}`, { replace: false })
            }
          >
            Formula
          </Button>
        </strong>
      ),
    },
  ];

  const auth = React.useContext(AuthContext);
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);

  React.useEffect(() => {
    listInventory(auth.token, 25, 1).then((list) => {
      const newRows = list!.docs.map((item) => {
        let on_hand = 0;
        let on_order = 0;
        let quarantined = 0;
        let allocated = 0;
        item!.stock.map((stock: { on_hand: any; on_order: any; quarantined: any; allocated: any; }) => {
          on_hand += stock.on_hand ? stock.on_hand : 0;
          on_order += stock.on_order ? stock.on_order : 0;
          quarantined += stock.quarantined ? stock.quarantined : 0;
          allocated += stock.allocated ? stock.allocated : 0;
        });
        return {
          id: item._id,
          product_id: item.product_code,
          name: item.name,
          cost: item.cost,
          reorder_amount: item.reorder_amount ? item.reorder_amount : 0,
          on_hand: item.on_hand ? item.on_hand : 0,
          on_order: item.on_order ? item.on_order : 0,
          quarantined: item.quarantined ? item.quarantined : 0,
          allocated: item.allocated ? item.allocated : 0,
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, []);

  if (dataOptions == null) return null;

  return (
    <DataTable
      rows={dataOptions.rows}
      columns={columns}
      listOptions={dataOptions.listOptions}
    ></DataTable>
  );
};

export default InventoryListPage;
