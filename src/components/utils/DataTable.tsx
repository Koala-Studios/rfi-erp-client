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
  auto_height?: boolean;
}

export const DataTable: React.FC<Props> = ({
  title,
  rows,
  columns,
  auto_height = false,
}) => {
  const CustomToolbar: React.FC = () => {
    return (
      <GridToolbarContainer>
        {title ? <Typography variant="h6">{title}</Typography> : null}
        {/* <GridToolbarFilterButton /> */}
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  };

  return (
    <div style={{ height: "100%", width: "100%", minHeight: 100 }}>
      <DataGrid
        style={{
          border: "1px solid #c9c9c9",
        }}
        rows={rows}
        columns={columns}
        autoHeight={auto_height}
        rowHeight={39}
        pageSize={25}
        pagination
        rowsPerPageOptions={[5, 25]}
        components={{
          Toolbar: CustomToolbar,
        }}
      />
    </div>
  );
};
