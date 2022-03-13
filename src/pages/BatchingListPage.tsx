import React from "react";
import { DataTable } from "../components/utils/DataTable";
import { GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { listBatching } from "../logic/batching.logic";
import { AuthContext } from "../components/navigation/AuthProvider";

// const columns: GridColDef[] = [
//   { field: "id", headerName: "ID", width: 70 },
//   { field: "firstName", headerName: "First name", width: 130 },
//   { field: "lastName", headerName: "Last name", width: 130 },
//   {
//     field: "age",
//     headerName: "Age",
//     type: "number",
//     width: 90,
//   },
//   {
//     field: "fullName",
//     headerName: "Full name",
//     description: "This column has a value getter and is not sortable.",
//     sortable: false,
//     width: 160,
//     valueGetter: (params: GridValueGetterParams) =>
//       `${params.row.firstName || ""} ${params.row.lastName || ""}`,
//   },
// ];

//{ batch_code: batch.batch_code, date:batch.date_created, product_code: batch.quantity }
const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 300 },
  { field: "date", headerName: "Date Created", width: 300 },
  { field: "product_code", headerName: "Product Code", width: 300 },
  { field: "quantity", headerName: "Quantity", type: "number", width: 300 },
];

const BatchingListPage = () => {
  const auth = React.useContext(AuthContext);
  const [rows, setRows] = React.useState<any>(null);

  React.useEffect(() => {
    listBatching(auth.token, 25, 1).then((batchingList) => {
      console.log(rows);

      const newRows = batchingList.map((batch) => {
        return {
          id: batch._id,
          batch_code: batch.batch_code,
          date: batch.date_created,
          quantity: batch.quantity,
          product_code: batch.product_code,
        };
      });
      setRows(newRows);
    });
  }, []);

  if (rows == null) return null;

  return <DataTable rows={rows!} columns={columns}></DataTable>;
};

export default BatchingListPage;
