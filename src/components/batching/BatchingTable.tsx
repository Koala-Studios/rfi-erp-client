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
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { IListOptions } from "../../logic/utils";
import React from "react";
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
  // const getClassName = (row: IBatchingContainer) => { //TODO: Gotta do the row colors if available QTY isn't enough.
  //   if (
  //     row.amount_to_use < row.available_amount ||
  //     row.confirm_lot_number === ""
  //   ) {
  //     return "YellowRow";
  //   } else if (row.lot_number != row.confirm_lot_number) {
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
      >
        <TableCell sx={{ p: 0, mH: 40 }} height={35} width={50}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            // style={{ display: /*!props.row.sub_rows || props.row.sub_rows.length === 0 ? 'none' : */'block' }}
            style={{
              display:
                !props.row.sub_rows || props.row.sub_rows.length === 0
                  ? "none"
                  : "block",
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        {props.columns.map((col: TableGridColDef, index) => {
          if (col.customRender) {
            return <>{col.customRender(props.row)}</>;
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
                    if (value != "") {
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
        <TableCell sx={{ p: 0, m: 0 }} colSpan={6}></TableCell>
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
                                      if (value != "") {
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
