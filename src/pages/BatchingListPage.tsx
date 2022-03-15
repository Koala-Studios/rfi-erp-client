import React from "react";
import { DataTable } from "../components/utils/DataTable";
import { GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { listBatching } from "../logic/batching.logic";
import { AuthContext } from "../components/navigation/AuthProvider";

const columns: GridColDef[] = [
  // { field: "id", headerName: "ID", width: 300 },
  { field: "date", headerName: "Date Created", width: 250 },
  { field: "product_code", headerName: "Product Code", width: 150 },
  { field: "quantity", headerName: "Quantity", type: "number", width: 150 },
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
