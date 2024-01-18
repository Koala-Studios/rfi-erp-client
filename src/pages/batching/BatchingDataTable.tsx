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
  Input,
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
import TableAutocomplete from "../../components/utils/TableAutocomplete";
import { IBatchingContainer } from "../../logic/batching.logic";
import { IInventoryStock } from "../../logic/inventory-stock.logic";
import { TableTexfield } from "../../components/utils/TableComponents";
import { ExpandableRow } from "../../components/batching/BatchingTable";

interface Props {
  rows: any[];
  columns: GridColDef[];
  sub_columns: GridColDef[];
  auto_height?: boolean;
  listOptions?: IListOptions;
  handleChooseContainer: (row_id: string, value: any) => void;
  handleAddRow: (row_id: string) => void;
  handleEditCell: (row_id: string, field: string, value: any) => void;
  handleDBClick?: GridEventListener<"rowClick">;
}

export const BatchingDataTable: React.FC<Props> = ({
  rows,
  columns,
  sub_columns,
  handleAddRow,
  handleEditCell,
  handleChooseContainer,
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
        <Table aria-label="collapsible table" style={{ position: "relative" }} >
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
                <TableCell sx={{ p: 1 }} width={col.width}>
                  {col.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody style={{ overflowY: "scroll", height: "400px!important" }}>
            {/* {dataOptions.rows.map((row: IInventoryStockGrouped) => (
                    <ExpandableRow key={row.name} row={row} />
                  ))} */}
            {rows.map((row_item) => (
              <ExpandableRow
                key={row_item._id}
                columns={columns}
                sub_columns={sub_columns}
                row={row_item}
                handleAddRow={handleAddRow}
                handleChooseContainer={handleChooseContainer}
                handleEditCell={handleEditCell}
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


const CustomTableCell = (props: any) => {
  const [isEditMode, setEditMode] = React.useState<boolean>(false);
  if (!props.row.renderCell) {
    return (
      <TableCell
        align="left"
        onDoubleClick={() => {
          setEditMode(true);
        }}
        onAbort={() => {
          setEditMode(false);
        }}
      >
        {isEditMode && props.column.editable ? (
          <Input
            defaultValue={props.row[props.column.field]}
            style={{ height: 19, margin: 0, padding: 0 }}
            name={props.name ?? ""}
            type={props.column.type}
            inputProps={props.column.type === 'number' ? { min: 0 } : {}}
            
            onChange={(e) =>{
              console.log('aaaaa', e.target.value);
              props.handleEditCell(
                props.row._id,
                props.column.field,
                e.target.value
              )}
            }
          />
        ) : (
          props.row[props.column.field]
        )}
      </TableCell>
    );
  } else {
    return props.row.renderCell;
  }
};
