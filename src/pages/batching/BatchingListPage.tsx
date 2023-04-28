import React from "react";
import { DataTable } from "../../components/utils/DataTable";
import { GridColDef, GridRenderCellParams, GridValueGetterParams } from "@mui/x-data-grid";
import { listBatching } from "../../logic/batching.logic";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { FilterElement, IListData } from "../../logic/utils";
import { Button, Card, Divider } from "@mui/material";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import DataFilter from "../../components/utils/DataFilter";

//label,field,type
const filterArray: FilterElement[] = [
  {
    label: "Product Code",
    field: "product_code",
    type: "text",
  },
  { label: "Batch Code", field: "batch_code", type: "text" },
  { label: "Quantity", field: "quantity", type: "number", regexOption: null },

];

const BatchingListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);

  const columns: GridColDef[] = [
    // { field: "id", headerName: "ID", width: 300 },
    { field: "date", headerName: "Date Created", width: 120 },
    { field: "product_code", headerName: "Product Code", width: 120 },
    { field: "product_name", headerName: "Product Name", width: 320 },
    { field: "batch_code", headerName: "Batch Code", width: 120 },
    { field: "quantity", headerName: "Quantity", type: "number", width: 90 },
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
              navigate(`/batching/${params.value}`, { replace: false })
            }
          >
            View Details
          </Button>
        </strong>
      ),
    },
  ];
  


  React.useEffect(() => {
    listBatching(searchParams, filterArray).then((list) => {
      const newRows = list!.docs.map((batch) => {
        return {
          id: batch._id,
          batch_code: batch.batch_code,
          date: batch.date_created.toString().replace(/\T.+/, ""),
          quantity: batch.quantity,
          product_code: batch.product_code,
          product_name: batch.product_name,
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, [location.key]);
  const createNewBatching = () => {
    navigate(`/batching/new`, { replace: false });
  };

  if (dataOptions == null) return null;

  return (
    <>
      <Card
        variant="outlined"
        sx={{ mb: 2, p: 2, border: "1px solid #c9c9c9" }}
      >
        <DataFilter filters={filterArray}></DataFilter>

        <Button variant="contained" color="primary" onClick={createNewBatching}>
          + New Production
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

export default BatchingListPage;
