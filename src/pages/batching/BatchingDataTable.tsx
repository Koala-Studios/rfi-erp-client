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

interface Props {
  rows: any[];
  columns: GridColDef[];
  sub_columns: GridColDef[];
  auto_height?: boolean;
  listOptions?: IListOptions;
  handleChooseContainer:  (row_id: string, value: any) => void;
  handleAddRow: (row_id:string) => void;
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
                row={row_item} handleAddRow={handleAddRow} handleChooseContainer={handleChooseContainer} handleEditCell={handleEditCell}></ExpandableRow>
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
  handleChooseContainer:(row_id: string, value: any) => void;
  handleEditCell:(row_id: string, field: string, value: any) => void;
  handleAddRow: (row_id:string) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const getClassName = (row:IBatchingContainer) => {
  
    if(row.amount_to_use < row.available_amount || row.confirm_lot_number === '') {
      return "YellowRow";
    } else if (
      row.lot_number != row.confirm_lot_number
    ) {
      return "RedRow";
    } else {
      return '';
    }
  };
  return (
    <>
      <TableRow
        sx={{
          "& > *": { borderBottom: "none!important" }
        }}
      >
        <TableCell sx={{ p: 0.7 }} width={50}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            // style={{ display: /*!props.row.sub_rows || props.row.sub_rows.length === 0 ? 'none' : */'block' }}
            style={{ display: !props.row.sub_rows || props.row.sub_rows.length === 0 ? 'none' : 'block' }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell >
        {props.columns.map((col:GridColDef, index) => (
          <>
            {index == 5 &&
            <div style={{width:155,maxWidth:155, height:35, maxHeight:35}}>
              <TableAutocomplete
              initialValue={props.row.lot_number}
                // readOnly={batching!.status === 6 || purchase!.status === 4}
                width={155}
                
                dbOption="container"
                handleEditRow={props.handleChooseContainer}
                rowParams={{...props.row.row_params, row:{_id: props.row._id}}}
                letterMin={-1}
                getOptionLabel={(item: IInventoryStock) => item._id ?
                  `${item.lot_number} | AV#: ${item.remaining_amount - item.allocated_amount}`: ''
                }
              />
            </div>

            }
            {index == 9 &&
            <TableCell  sx={{ p: 1, fontWeight: '500',fontSize: '0.9rem' }}>
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
                onClick={() => { props.handleAddRow(props.row['_id']); setOpen(true) }}
                >
                  +
                </Button>
              </strong> 
              </TableCell>
            }
            {index != 9 && index != 5 &&
              <CustomTableCell handleEditCell={props.handleEditCell} row={props.row} name={col.field} index={index} column={col} value={props.row[col.field]} ></CustomTableCell>
              
            }
          </>
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
            <DataGrid 
              rows={props.row.sub_rows}
              headerHeight={0}
              
              getRowClassName={(params) => getClassName(params.row)}
              components={{
                Header: () => null,
              }}
              // onCellEditCommit={}
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
const CustomTableCell = ( props:any) => {
  const [isEditMode, setEditMode ] = React.useState<boolean>(false);
  if(!props.row.renderCell){ return (
    <TableCell align="left" onDoubleClick={()=> {setEditMode(true); }} onAbort={()=>{setEditMode(false)}}>
      { isEditMode && props.column.editable ? (
              <Input
                defaultValue={props.row[props.column.field]}
                style={{height:19, margin:0, padding:0}}
                name={props.name ?? ''}
                onChange={(e) => props.handleEditCell(props.row._id,props.column.field, e.target.value)}
              />
              ) : (
                props.row[props.column.field]
              )}  
      </TableCell>
  )} else {
    return (
      props.row.renderCell
    );
  };
};
