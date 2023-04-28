import React from "react";
import { DataTable } from "../../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { IStockCount, listStockCounts } from "../../logic/stock-count.logic";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { Button, Card, Chip } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FilterElement, IListData } from "../../logic/utils";
import DataFilter from "../../components/utils/DataFilter";
const StockCountListPage = () => {
  const navigate = useNavigate();
  const [currPage, setCurrPage] = React.useState<number>(1);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);
  
const StockCountStatus = [
  ["DRAFT", "warning"],
  ["SUBMITTED", "warning"],
  ["APPROVED", "success"],
  ["ABANDONED", "error"],
];
  const columns: GridColDef[] = [
    { field: "count_code", headerName: "Count Code", width: 200 },
    { field: "created_date", headerName: "Created Date", width: 120,
     valueGetter: (params) =>  params.row.created_date.split('T')[0] 
    },
    { field: "approved_date", headerName: "Approved Date", width: 120,
    valueGetter: (params) =>  params.row.approved_date ? params.row.approved_date.split('T')[0] : null
   },
    { field: "item_count", headerName: "Item Count", width: 100, align:'center',
    valueGetter: (params) => params.row.count_items.length },
    {
      field: "status",
      headerName: "Status",
      width: 200,
      align:'center',
      renderCell: (params: GridRenderCellParams<number>) => (
        <Chip
          label={StockCountStatus[params.value ? params.value - 1 : 0][0]}
          sx={{
            fontWeight: 600,
          }}
          //@ts-ignore
          color={StockCountStatus[params.value ? params.value - 1 : 0][1]}
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
    listStockCounts(searchParams, filterArray).then((list) => {
      if(list) {
        const newRows = list!.docs.map((count:IStockCount) => {
          return {
            id: count._id,
            ...count
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
        <DataFilter filters={filterArray}></DataFilter>

        <Button
          variant="contained"
          color="primary"
          onClick={createNewStockCount}
        >
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
