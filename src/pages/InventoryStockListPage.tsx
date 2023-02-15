import React from "react";
import { DataTable } from "../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listInventoryStock } from "../logic/inventory-stock.logic";
import { AuthContext } from "../components/navigation/AuthProvider";
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
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setTokenSourceMapRange } from "typescript";
import { FilterElement, IListData } from "../logic/utils";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  IInventoryStock,
  IInventoryStockGrouped,
} from "../logic/inventory-stock.logic";
import DataFilter from "../components/utils/DataFilter";
import TablePagination from "@mui/material/TablePagination";

const filterArray: FilterElement[] = [
  {
    label: "Product Code",
    field: "product_code",
    type: "text",
    regexOption: null,
  },
  { label: "Product Name", field: "name", type: "text" },
];

const ExpandableRow = (props: { row: IInventoryStockGrouped }) => {
  const row = props.row;
  const [open, setOpen] = React.useState(false);

  return (
    //THIS IS FOR TEST OF CONCEPT, WILL BE CHANGED!!!
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
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ p: 1 }} width={120}>
          <Typography variant="subtitle2">{row.product_code}</Typography>
        </TableCell>
        <TableCell sx={{ p: "0px 16px", width: "35%" }}>
          <Typography variant="subtitle2">{row.name}</Typography>
        </TableCell>
        <TableCell sx={{ p: 1 }}>{row.average_cost}</TableCell>
        <TableCell sx={{ p: 1 }}>{row.received_amount}</TableCell>
        <TableCell sx={{ p: 1 }}>{row.used_amount}</TableCell>
        <TableCell sx={{ p: 1 }}>{row.allocated_amount}</TableCell>
        <TableCell sx={{ p: 1 }}>{row.quarantined_containers}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          sx={{ p: 0 }}
          // style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={8}
        >
          <Collapse
            in={open}
            timeout="auto"
            unmountOnExit
            sx={{ background: "#ededed", pl: 3.5 }}
          >
            <Box sx={{ margin: 1, p: "0 16px" }}>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ p: 1 }}>Lot#</TableCell>
                    <TableCell sx={{ p: 1 }}>Supplier</TableCell>
                    <TableCell sx={{ p: 1 }}>Unit Cost ($/KG)</TableCell>
                    <TableCell sx={{ p: 1 }}>Received Amt</TableCell>
                    <TableCell sx={{ p: 1 }}>Container Size</TableCell>
                    <TableCell sx={{ p: 1 }}>Used Amt</TableCell>
                    <TableCell sx={{ p: 1 }}>Allocated Amt</TableCell>
                    <TableCell sx={{ p: 1 }}>Qrntn Amt</TableCell>
                    <TableCell sx={{ p: 1 }}>Received Date</TableCell>
                    <TableCell sx={{ p: 1 }}>Expiry Date</TableCell>
                    <TableCell sx={{ p: 1 }}>Notes</TableCell>
                    <TableCell sx={{ p: 1 }}>Extensions</TableCell>
                    <TableCell sx={{ p: 1 }}>Supplier SKU#</TableCell>
                    {/*//TODO: QC stuff */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.items.map((item: IInventoryStock) => (
                    <TableRow key={item._id.toString()}>
                      <TableCell sx={{ p: 1 }} width={120}>
                        {item.lot_number}
                      </TableCell>
                      <TableCell sx={{ p: 1 }}>
                        <Typography variant="subtitle2">
                          {item.supplier_code}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ p: 1 }}>
                        {(item.unit_cost + 0).toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ p: 1 }}>
                        {item.received_amount}
                      </TableCell>
                      <TableCell sx={{ p: 1 }}>{item.container_size}</TableCell>
                      <TableCell sx={{ p: 1 }}>{item.used_amount}</TableCell>
                      <TableCell sx={{ p: 1 }}>
                        {item.allocated_amount}
                      </TableCell>
                      <TableCell sx={{ p: 1 }}>
                        {item.quarantined_containers}
                      </TableCell>
                      <TableCell sx={{ p: 1 }} width={120}>
                        {item.received_date}
                      </TableCell>
                      <TableCell sx={{ p: 1 }} width={120}>
                        {item.expiry_date}
                      </TableCell>
                      <TableCell sx={{ p: 1 }}>{item.notes}</TableCell>
                      <TableCell sx={{ p: 1 }}>
                        {item.extensions.length}
                      </TableCell>
                      <TableCell sx={{ p: 1 }}>{item.supplier_sku}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const InventoryStockListPage = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const columns: GridColDef[] = [
    { field: "product_id", headerName: "Item Code", width: 120 },
    { field: "name", headerName: "Item Name", width: 300 },
    { field: "cost", headerName: "Cost/KG", width: 100, align: "right" },
    { field: "on_hand", headerName: "On Hand", width: 100, align: "right" },
    {
      field: "reorder_amount",
      headerName: "Reorder Amt",
      width: 100,
      align: "right",
    },
    { field: "on_order", headerName: "On Order", width: 100, align: "right" },
    {
      field: "quarantined",
      headerName: "Quarantined",
      width: 100,
      align: "right",
    },
    { field: "allocated", headerName: "Allocated", width: 100, align: "right" },
    {
      field: "id",
      headerName: "Actions",
      align: "left",
      width: 120,
      renderCell: (params: GridRenderCellParams<string>) => (
        <strong>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() =>
              navigate(`/products/${params.value}`, { replace: false })
            }
          >
            View Details
          </Button>
        </strong>
      ),
    },
  ];

  const auth = React.useContext(AuthContext);
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);

  React.useEffect(() => {
    listInventoryStock(auth.token, 25, 1, true).then((list) => {
      console.log(list);
      const newRows = list!.docs.map((item) => {
        return {
          //grouped
          id: item._id.toString(),
          product_id: item.product_id,
          product_code: item.product_code,
          name: item.name,
          average_cost: item.average_cost,
          received_amount: item.received_amount,
          used_amount: item.used_amount,
          allocated_amount: item.allocated_amount,
          quarantined_containers: item.quarantined_containers,
          items: item.items.map((container: IInventoryStock) => {
            return {
              _id: container._id,
              product_id: container.product_id,
              product_code: container.product_code,
              name: container.name,
              unit_cost: container.unit_cost,
              container_size: container.container_size,
              received_amount: container.received_amount,
              used_amount: container.used_amount,
              allocated_amount: container.allocated_amount,
              quarantined_containers: container.quarantined_containers,

              lot_number: container.lot_number,

              supplier_code: container.supplier_code,
              supplier_id: container.supplier_id,
              supplier_sku: container.supplier_sku,

              received_date: container.received_date
                ? container.received_date.toString().split("T")[0]
                : "unknown",
              expiry_date: container.expiry_date
                ? container.expiry_date.toString().split("T")[0]
                : "unknown",
              notes: container.notes,
              extensions: container.extensions.length,
              qc_tests: container.qc_tests.length,
            };
          }),
        };

        // return {
        //   //regular
        //   id: item._id,
        //   product_id: item.product_code,
        //   name: item.name,
        //   cost: item.cost,
        //   reorder_amount: item.reorder_amount ?? 0,
        //   on_hand: item.on_hand ?? 0,
        //   on_order: item.on_order ?? 0,
        //   quarantined: item.quarantined ?? 0,
        //   allocated: item.allocated ?? 0,
        // };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, []);
  const createNewMaterial = () => {
    navigate(`/inventory-stock/new`, { replace: false });
  };

  if (dataOptions == null) return null;

  return (
    <>
      <Card
        variant="outlined"
        sx={{ mb: 2, p: 2, border: "1px solid #c9c9c9" }}
      >
        <DataFilter filters={filterArray} params={searchParams} />
      </Card>
      <div
        style={{ height: "calc(100% - 140px)", maxHeight: "calc(100% - 85px)" }}
      >
        <TableContainer
          component={Paper}
          style={{
            width: "100%",
            minHeight: 100,
            height: "100%",
            border: "1px solid #c9c9c9",
            borderRadius: "5px 5px 0 0",
          }}
        >
          <Table
            aria-label="collapsible table"
            style={{ position: "relative" }}
          >
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
                <TableCell sx={{ p: 1 }} />
                <TableCell sx={{ p: 1 }}>Product Code</TableCell>
                <TableCell sx={{ p: 1 }}>Name</TableCell>
                <TableCell sx={{ p: 1 }}>Avg Cost ($/KG)</TableCell>
                <TableCell sx={{ p: 1 }}>Received Amount</TableCell>
                <TableCell sx={{ p: 1 }}>Used Amount</TableCell>
                <TableCell sx={{ p: 1 }}>Allocated Amount</TableCell>
                <TableCell sx={{ p: 1 }}>Quarantined Containers</TableCell>
              </TableRow>
            </TableHead>
            <TableBody style={{ overflowY: "scroll" }}>
              {dataOptions.rows.map((row: IInventoryStockGrouped) => (
                <ExpandableRow key={row.name} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Pagination
          color="primary"
          count={10}
          page={1}
          shape="rounded"
          variant="outlined"
          sx={{
            p: 1,
            borderRadius: "0 0 5px 5px",
            background: "white",
            border: "1px solid #c9c9c9",
            borderTop: "none",
            ul: { justifyContent: "end" },
          }}
        />
      </div>
      {/* <DataTable
      rows={dataOptions.rows}
      columns={columns}
      listOptions={dataOptions.listOptions}
    ></DataTable> */}
    </>
  );
};

export default InventoryStockListPage;
