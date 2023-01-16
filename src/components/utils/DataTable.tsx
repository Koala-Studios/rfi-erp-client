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
import { Pagination, Typography } from "@mui/material";
import { IListOptions } from "../../logic/utils";

interface Props {
  title?: string;
  rows: any[];
  columns: GridColDef[];
  auto_height?: boolean;
  listOptions?: IListOptions;
  handleDBClick?: GridEventListener<"rowClick">;
  setCurrentPage?: (page: number) => void;
  currentPage?: number;
}

export const DataTable: React.FC<Props> = ({
  title,
  rows,
  columns,
  auto_height = false,
  listOptions,
  handleDBClick,
  setCurrentPage,
  currentPage,
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

  const CustomPagination = () => {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <Pagination
          color="primary"
          count={listOptions!.totalPages - 1}
          page={currentPage!}
          shape="rounded"
          variant="outlined"
          sx={{ mr: 2 }}
          //@ts-ignore
          onChange={(event, value) => setCurrentPage(value)}
        />
        <Typography variant="subtitle2" sx={{ mr: 2 }}>{`${
          listOptions!.pagingCounter
        }-${listOptions!.pagingCounter + listOptions!.limit} of ${
          listOptions!.totalDocs
        }`}</Typography>
      </div>
    );
  };

  return (
    <div
      style={{ height: "calc(100% - 100px)", width: "100%", minHeight: 100 }}
    >
      <DataGrid
        // onPageChange={(page) => setCurrentPage(page)}
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
        rowCount={listOptions!.totalDocs}
        rowsPerPageOptions={[25]}
        components={{
          Toolbar: CustomToolbar,
          Pagination: CustomPagination,
        }}
      />
    </div>
  );
};
