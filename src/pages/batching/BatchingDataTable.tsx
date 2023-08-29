import * as React from "react";
import {
  GridRenderCellParams,
  useGridApiContext,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridValueGetterParams,
  GridEventListener,
} from "@mui/x-data-grid";
import {
  Box,
  Button,
  Card,
  Collapse,
  IconButton,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { IListOptions } from "../../logic/utils";
import { useSearchParams } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { DataGrid } from "@mui/x-data-grid";

interface Props {
  rows: any[];
  columns: GridColDef[];
  sub_columns: GridColDef[];
  auto_height?: boolean;
  listOptions?: IListOptions;
  handleDBClick?: GridEventListener<"rowClick">;
}

export const BatchingDataTable: React.FC<Props> = ({
  rows,
  columns,
  sub_columns,
  auto_height = false,
  listOptions = null,
  handleDBClick,
}) => {
  const CustomPagination = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    let currPage = 1;

    if (searchParams.has("page")) {
      currPage = parseInt(searchParams.get("page")!);
    }

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* (listOptions && <Pagination
          color="primary"
          count={listOptions!.totalPages - 1}
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
        />)
        (listOptions && <Typography variant="subtitle2" sx={{ mr: 2 }}>{`${
          listOptions!.pagingCounter
        }-${listOptions!.pagingCounter + listOptions!.limit} of ${
          listOptions!.totalDocs
        }`}</Typography>) */}
      </div>
    );
  };

  return (
    <div style={{ height: "calc(100%)", maxHeight: "calc(100%)" }}>
      <TableContainer
        component={Paper}
        style={{
          width: "100%",
          minHeight: 100,
          height: "100%",
          border: "1px solid #c9c9c9",
          borderBottom: "none",
          borderRadius: "5px 5px 0 0",
        }}
      >
        <Table aria-label="collapsible table" style={{ position: "relative" }}>
          <TableHead
            style={{
              position: "sticky",
              top: 0,
              background: "white",
              boxShadow: "0 1px 0 0 #e1e1e1",
              zIndex: 10,
            }}
          >
            <TableRow
              sx={{
                maxHeight: 50,
                height: 50,
              }}
            >
              <TableCell sx={{ p: 1 }}></TableCell>
              {columns.map((col) => (
                <TableCell sx={{ p: 1 }} width={col.width}>{col.headerName}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody style={{ overflowY: "scroll", height: "400px!important" }}>
            {/* {dataOptions.rows.map((row: IInventoryStockGrouped) => (
                    <ExpandableRow key={row.name} row={row} />
                  ))} */}
            {rows.map((row_item) => (
              <ExpandableRow
                key={row_item.name}
                columns={columns}
                sub_columns={sub_columns}
                row={row_item}
              ></ExpandableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div
        style={{
          background: "white",
          padding: 10,
          width: "100%",
          display: "flex",
          justifyContent: "end",
          border: "1px solid #c9c9c9",
          borderTop: "1px solid #e1e1e1 ",
          borderRadius: "0 0 4px 4px",
        }}
      >
        <CustomPagination />
      </div>
    </div>
  );
};

const ExpandableRow = (props: {
  columns: GridColDef[];
  sub_columns: GridColDef[];
  row: any;
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow
        sx={{
          "& > *": { borderBottom: "none!important" },
        }}
      >
        <TableCell sx={{ p: 0.7 }} width={50}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            style={{ display: props.row.sub_rows.length === 0 ? 'none' : 'block' }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        {props.columns.map((col, index) => (
          <TableCell sx={{ p: 1, fontWeight: '500', fontSize: '0.9rem' }}>
            {index == 9 &&
              <strong>
                <Button
                  variant="outlined"
                  color="info"
                  size="small"
                  style={{
                    backgroundColor: "#1144ff15",
                    fontSize: "19px",
                    maxWidth: "40px",
                    maxHeight: "30px",
                    minWidth: "40px",
                    minHeight: "30px",
                  }}
                // onClick={() => handleAddRow()}
                >
                  +
                </Button>
              </strong>
            }
            {props.row[col.field]}</TableCell>
        ))}
      </TableRow>
      <TableRow>
        <TableCell
          sx={{ p: 0 }}
          // style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={12}
        >
          <Collapse
            in={open}
            timeout="auto"
            unmountOnExit
            sx={{ background: "#ebedf0" ,float: 'right' }}
          >
            {/* <Box sx={{
              marginBottom: 2, p: "0 0px"
            }}> */}

            {console.log(props.sub_columns)}
            <DataGrid rows={props.row.sub_rows}
              headerHeight={0}
              components={{
                Header: () => null,
              }}
              columns={props.sub_columns}
              getRowId={(row) => row._id}
              sx={{ width: '655px', float: 'right', height: ((40.5 * (props.row.sub_rows.length))), maxHeight: '200px' }} rowHeight={39} hideFooter={true}
            />
            {/* </Box> */}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
