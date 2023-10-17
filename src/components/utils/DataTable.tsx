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
import { useSearchParams } from "react-router-dom";

interface Props {
  title?: string;
  rows: any[];
  columns: GridColDef[];
  auto_height?: boolean;
  listOptions: IListOptions;
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

  const CustomPagination = () => {
  const [searchParams, setSearchParams] = useSearchParams();

    let currPage = 1;

    if (searchParams.has("page")) {
      currPage = parseInt(searchParams.get("page")!);
    }

    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <Pagination
          color="primary"
          count={listOptions!.totalPages }
          page={currPage}
          shape="rounded"
          variant="outlined"
          sx={{ mr: 2 }}
          onChange={(event, value) => {
            if (searchParams.has("page")) {
              searchParams.set("page", value.toString());
            } else {
              searchParams.append("page", value.toString());
            }

            setSearchParams(searchParams);
          }}
        />
        <Typography variant="subtitle2" sx={{ mr: 2 }}>{`${
          listOptions.pagingCounter
        }-${ listOptions.totalDocs > (listOptions.pagingCounter + listOptions.limit) ? (listOptions.pagingCounter + listOptions.limit) : listOptions.totalDocs} of ${
          listOptions.totalDocs
        }`}</Typography>
      </div>
    );
  };

  return (
    <div style={{ height: "calc(100% - 85px)", width: "100%", minHeight: 100 }}>
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
        rowCount={listOptions.totalDocs}
        rowsPerPageOptions={[25]}
        components={{
          Toolbar: CustomToolbar,
          Pagination: CustomPagination,
        }}
      />
    </div>
  );
};
