import React from "react";
import { DataTable } from "../../components/utils/DataTable";
import { GridColDef, GridRenderCellParams, GridValueGetterParams } from "@mui/x-data-grid";
import { listBatching } from "../../logic/batching.logic";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { FilterElement, IListData } from "../../logic/utils";
import { Button, Card, Chip, Divider } from "@mui/material";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import DataFilter from "../../components/utils/DataFilter";
import RunningWithErrorsIcon from '@mui/icons-material/RunningWithErrors';

//label,field,type
const filterArray: FilterElement[] = [
  {
    label: "Product Code",
    field: "product_code",
    type: "text",
  },
  { label: "Product Name", field: "name", type: "text"},
  { label: "Batch Code", field: "batch_code", type: "text" },
  { label: "Status", field: "status", type: "dropdown", options: [{value: 1, text: "Ok"}, {value: 2, text: "\!Ok"}] },
  { label: "Date Created", field: "date_created", type: "date" },
  { label: "Date Due", field: "date_needed", type: "date" },
  { label: "Quantity", field: "quantity", type: "number", regexOption: null },

];


const BatchingStatus = [
  ["DRAFT", "warning"],
  ["SCHEDULED", "warning"],
  ["IN PROGRESS", "warning"],
  ["FINISHED", "success"],
  ["ABANDONED", "error"],
  ["CANCELLED", "error"],
];


const BatchingListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);

  const columns: GridColDef[] = [
    // { field: "id", headerName: "ID", width: 300 },
    {field: "has_enough", headerName: 'Inv', width: 30, renderCell: (params: GridRenderCellParams<number>) => (
      <div> {params.row.has_enough == false ? <RunningWithErrorsIcon style={{color:params.row.status === 1 ? 'orange' : 'red'}}></RunningWithErrorsIcon> :  ''}</div>
    ),},
    { field: "date", headerName: "Date Created", width: 120 },
    { field: "date_needed",  headerName: "Date Due", type: "date" },
    { field: "product_code", headerName: "Product Code", width: 120 },
    { field: "name", headerName: "Product Name", width: 320 },
    { field: "batch_code", headerName: "Batch Code", width: 120 },
    { field: "quantity", headerName: "Quantity", type: "number", width: 90 },
    {
      field: "status",
      headerName: "Status",
      width: 200,
      align: 'center',
      renderCell: (params: GridRenderCellParams<number>) => (
        <Chip
          label={BatchingStatus[params.value ? params.value - 1 : 5][0]}
          sx={{
            fontWeight: 600,
          }}
          //@ts-ignore
          color={BatchingStatus[params.value ? params.value - 1 : 5][1]}
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
          date_needed: batch.date_needed ? batch.date_needed.toString().replace(/\T.+/, "") : '',
          quantity: batch.quantity,
          product_code: batch.product_code,
          name: batch.name,
          status: batch.status,
          has_enough: batch.has_enough
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
