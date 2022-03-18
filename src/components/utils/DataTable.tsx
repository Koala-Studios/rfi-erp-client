import * as React from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridValueGetterParams,
} from "@mui/x-data-grid";

interface Props {
  rows: any[];
  columns: GridColDef[];
}

const CustomToolbar = () => {
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
};

export const DataTable: React.FC<Props> = ({ rows, columns }) => {
  return (
    <div style={{ height: 850, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={25}
        rowsPerPageOptions={[5]}
        components={{
          Toolbar: CustomToolbar,
        }}
      />
    </div>
  );
};
