import * as React from "react";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";

interface Props {
  rows: any[];
  columns: GridColDef[];
}

export const DataTable: React.FC<Props> = ({ rows, columns }) => {
  return (
    <div style={{ height: 800, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={25}
        rowsPerPageOptions={[5]}
      />
    </div>
  );
};
