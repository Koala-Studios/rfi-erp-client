import React from "react";
import { DataTable } from "../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { IStockCount, listStockCounts } from "../logic/stock-count.logic";
import { AuthContext } from "../components/navigation/AuthProvider";
import { Button, Card, Chip } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FilterElement, IListData } from "../logic/utils";
const StockCountListPage = () => {
  const navigate = useNavigate();
  const [currPage, setCurrPage] = React.useState<number>(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const columns: GridColDef[] = [
    { field: "order_code", headerName: "SC Code", width: 200 },
    { field: "customer", headerName: "Customer Name", width: 200 },
    { field: "date_orderd", headerName: "Purchase Date", width: 200 },
    { field: "item_count", headerName: "Item Count", width: 200 },
    { field: "status", headerName: "Status", width: 200 },
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
              navigate(`/stock-counts/${params.value}`, { replace: false })
            }
          >
            View Details
          </Button>
        </strong>
      ),
    },
  ];

  const auth = React.useContext(AuthContext);
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);

  const filterArray: FilterElement[] = [
    { label: "Item Name", field: "name", type: "text" },
    {
      label: "Item Code",
      field: "product_code",
      type: "text",
      regexOption: null,
    },
  ];
  
  React.useEffect(() => {
    listStockCounts(auth.token, 25, currPage, searchParams, filterArray).then((list) => {
      if(list) {
        const newRows = list!.docs.map((count:IStockCount) => {
          return {
            id: count._id,
            order_code: count.order_code,
            date_orderd: count.date_proposed
              .toString()
              .replace(/\T.+/, ""),
            status: count.status,
            item_count: count.count_items.length,
          };
        });
        setDataOptions({ rows: newRows, listOptions: list! });
      }
      
    });
  }, []);

  const createNewStockCount = () => {
    navigate(`/stock-counts/new`, { replace: false });
  };



  if (dataOptions == null) return null;

  return (
    <>
      <Card
        variant="outlined"
        sx={{ mb: 2, p: 2, border: "1px solid #c9c9c9" }}
      >
        <Button variant="contained" color="primary" onClick={createNewStockCount}>
          + New Stock Count
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

export default StockCountListPage;
