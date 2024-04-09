import {
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { IListOptions } from "../../logic/utils";
import React, { useEffect } from "react";
import { IBatchingContainer } from "../../logic/batching.logic";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { TableTexfield } from "../utils/TableComponents";

interface Props {
  children: any;
}

export interface TableGridColDef extends GridColDef {
  customRender?: any;
}

export const ExpandableRow = (props: {
  columns: GridColDef[];
  sub_columns: TableGridColDef[];
  row: any;
  handleChooseContainer: (row_id: string, value: any) => void;
  handleEditCell: (row_id: string, field: string, value: any) => void;
  handleAddRow: (row_id: string) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const getQtyColor = (has_enough: boolean) => {
    switch (has_enough) {
      case false:
        return "#EEB9BA";
      case true:
        return "#a1eb7c";
    }
    /*Explanation:
    0: not enough,
    1: enough,
    2: enough with incoming,
    3: enough for this, but not for all,
    4: enough for this, but not for all with incoming
    */
  };
  const getQtyToolTip = (has_enough: boolean) => {
    switch (has_enough) {
      case false:
        return "Not Enough";
      case true:
        return "Enough";
    }
    /*Explanation:
    0: not enough,
    1: enough,
    2: enough with incoming,
    3: enough for this, but not for all,
    4: enough for this, but not for all with incoming
    */
  };
  useEffect(() => {
    window.addEventListener("BatchingRowAdd", (e: any) => {
      if (e.detail._id === props.row["_id"]) {
        setOpen(true);
      }
    });
  }, []);
  // const getClassName = (row: IBatchingContainer) => { //TODO: Gotta do the row colors if available QTY isn't enough.
  //   if (
  //     row.amount_to_use < row.available_amount ||
  //     row.confirm_lot_number === ""
  //   ) {
  //     return "YellowRow";
  //   } else if (row.lot_number !==row.confirm_lot_number) {
  //     return "RedRow";
  //   } else {
  //     return "";
  //   }
  // };
  return (
    <>
      <TableRow
        sx={{
          maxHeight: "40px",
          "& > *": {
            borderRight: "1px solid #00000010",
            borderBottom: "1px solid #00000010",
          },
        }}
        key={props.row._id}
      >
        <Tooltip
          title={getQtyToolTip(props.row.has_enough)}
          TransitionProps={{ timeout: 350 }}
          placement="right"
        >
          <TableCell
            sx={{
              p: 0,
              mH: 40,
              backgroundColor: getQtyColor(props.row.has_enough),
            }}
            height={35}
            width={25}
          >
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
              // style={{ display: /*!props.row.sub_rows || props.row.sub_rows.length === 0 ? 'none' : */'block' }}
              style={{
                marginLeft: 5,
                width: 40,
                display:
                  !props.row.sub_rows || props.row.sub_rows.length === 0
                    ? "none"
                    : "block",
              }}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
        </Tooltip>
        {props.columns.map((col: TableGridColDef, index) => {
          if (col.customRender) {
            return <>{col.customRender(props.row)}</>;
          }
          if (col.valueGetter) {
            return (
              <TableCell
                sx={{
                  width: col.width,
                  maxWidth: col.width,
                  p: 0,
                  textAlign: col.align,
                }}
              >
                {col.valueGetter(props.row)}
              </TableCell>
            );
          }
          if (col.editable) {
            return (
              <TableCell sx={{ width: col.width, maxWidth: col.width, p: 0 }}>
                <TableTexfield
                  type={col.type}
                  width={col.width}
                  initialValue={
                    props.row[col.field] ? props.row[col.field] : ""
                  }
                  handleEditRow={(value: string) => {
                    if (value !== "") {
                      props.handleEditCell(props.row["_id"], col.field, value);
                    }
                  }}
                />
              </TableCell>
            );
          }

          return (
            <TableCell
              align={col.align}
              sx={{ width: col.width, maxWidth: col.width, p: 0, pl: "10px" }}
            >
              {props.row[col.field]}
            </TableCell>
          );
        })}
      </TableRow>
      <TableRow sx={{ p: 0, m: 0 }}>
        <TableCell sx={{ p: 0, m: 0 }} colSpan={7}></TableCell>
        <TableCell
          sx={{ p: 0 }}
          // style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={6}
        >
          <Collapse
            in={open}
            timeout="auto"
            unmountOnExit
            sx={{ width: "100%" }}
          >
            <TableContainer>
              <Table
                aria-label="collapsible table"
                style={{ width: "100%", position: "relative" }}
              >
                <TableBody
                  style={{
                    width: "100%",
                    overflowY: "scroll",
                    height: "400px!important",
                  }}
                >
                  {props.row.sub_rows.map((row_item: any, index: number) => {
                    return (
                      <TableRow
                        sx={{
                          p: 0,
                          m: 0,
                          width: "100%",
                          height: "40px",
                          "& > *": {
                            border: "1px solid #00000010",
                            borderTop: "none",
                          },
                        }}
                      >
                        {props.sub_columns.map(
                          (col: TableGridColDef, index) => {
                            if (col.customRender) {
                              return <>{col.customRender(row_item)}</>;
                            }
                            if (col.editable) {
                              return (
                                <TableCell
                                  sx={{
                                    width: col.width,
                                    maxWidth: col.width,
                                    p: 0,
                                  }}
                                >
                                  <TableTexfield
                                    type={col.type}
                                    width={col.width}
                                    initialValue={
                                      row_item[col.field]
                                        ? row_item[col.field]
                                        : ""
                                    }
                                    handleEditRow={(value: string) => {
                                      if (value !== "") {
                                        props.handleEditCell(
                                          row_item["_id"],
                                          col.field,
                                          value
                                        );
                                      }
                                    }}
                                  />
                                </TableCell>
                              );
                            }

                            return (
                              <TableCell
                                sx={{
                                  width: col.width,
                                  maxWidth: col.width,
                                  pl: "10px",
                                }}
                              >
                                {props.row[col.field]}
                              </TableCell>
                            );
                          }
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
