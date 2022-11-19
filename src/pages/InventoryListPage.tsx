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

const InventoryListPage = () => {
  const navigate = useNavigate();

  const columns: GridColDef[] = [
    { field: "product_id", headerName: "Item Code", width: 120 },
    { field: "name", headerName: "Item Name", width: 300 },
    { field: "cost", headerName: "Cost/KG", width: 100, align:'right' },
    { field: "on_hand", headerName: "On Hand", width: 100, align:'right' },
    { field: "reorder_amount", headerName: "Reorder Amt", width: 100, align:'right'  },
    { field: "on_order", headerName: "On Order", width: 100, align:'right' },
    { field: "quarantined", headerName: "Quarantined", width: 100, align:'right' },
    { field: "allocated", headerName: "Allocated", width: 100, align:'right' },
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
  const [rows, setRows] = React.useState<any>(null);

  React.useEffect(() => {
    listInventory(auth.token, 1500, 1).then((inventoryList) => {
      const newRows = inventoryList.map((item) => {
        let on_hand = 0;
        let on_order = 0;
        let quarantined = 0;
        let allocated = 0;
        item.stock.map((stock) => {
          on_hand += stock.on_hand ? stock.on_hand : 0;
          on_order += stock.on_order ? stock.on_order : 0;
          quarantined += stock.quarantined ? stock.quarantined : 0;;
          allocated += stock.allocated ? stock.allocated : 0;;
        })
        return {
          id: item._id,
          product_id: item.product_code,
          name: item.name,
          cost: item.cost,
          reorder_amount: item.reorder_amount ? item.reorder_amount : 0,
          on_hand: on_hand,
          on_order:on_order,
          quarantined: quarantined,
          allocated: allocated,
        };
      });
      setRows(newRows);
    });
  }, []);

  if (rows == null) return null;

  return <DataTable rows={rows!} columns={columns}></DataTable>;
};

export default InventoryListPage;
