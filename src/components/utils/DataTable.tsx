import * as React from "react";
import {
  DataGrid,
  GridColDef,
  GridEventListener,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { Typography } from "@mui/material";
import { IListOptions } from "../../logic/utils";

interface Props {
  title?: string;
  rows: any[];
  columns: GridColDef[];
  auto_height?: boolean;
  listOptions?: IListOptions;
  handleDBClick?: GridEventListener<"rowClick">;
}

export const DataTable: React.FC<Props> = ({
  title,
  rows,
  columns,
  auto_height = false,
  listOptions,
  handleDBClick,
}) => {
  const CustomToolbar: React.FC = () => {
    return (
      <GridToolbarContainer>
        {title ? <Typography variant="h6">{title}</Typography> : null}
        {/* <GridToolbarFilterButton
          onResize={() => {}}
          onResizeCapture={() => {}}
        /> */}
        {/* <GridToolbarExport /> */}
      </GridToolbarContainer>
    );
  };

  return (
    <div style={{ height: "100%", width: "100%", minHeight: 100 }}>
      <DataGrid
        onRowDoubleClick={handleDBClick}
        style={{
          border: "1px solid #c9c9c9",
        }}
        rows={rows}
        columns={columns}
        autoHeight={auto_height}
        rowHeight={39}
        pageSize={25}
        pagination
        // rowCount={listOptions!.totalDocs}
        rowsPerPageOptions={[25]}
        components={{
          Toolbar: CustomToolbar,
        }}
      />
    </div>
  );
};
