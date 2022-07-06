import * as React from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { Typography } from "@mui/material";

interface Props {
  title?: string;
  rows: any[];
  columns: GridColDef[];
}

export const DataTable: React.FC<Props> = ({ title, rows, columns }) => {
  const CustomToolbar: React.FC = () => {
    return (
      <GridToolbarContainer>
        {title ? <Typography variant="h6">{title}</Typography> : null}
        <GridToolbarFilterButton />
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  };

  return (
    <div style={{ height: "calc(90vh - 64px)", width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={25}
        pagination
        rowsPerPageOptions={[5]}
        components={{
          Toolbar: CustomToolbar,
        }}
      />
    </div>
  );
};
