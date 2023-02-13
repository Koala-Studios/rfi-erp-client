import React from "react";
import { DataTable } from "../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listInventoryStock } from "../logic/inventory-stock.logic";
import { AuthContext } from "../components/navigation/AuthProvider";
import { Box, Button, Card, Collapse, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { setTokenSourceMapRange } from "typescript";
import { IListData } from "../logic/utils";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { IInventoryStock, IInventoryStockGrouped} from "../logic/inventory-stock.logic"

const ExpandableRow = (props: { row:IInventoryStockGrouped }) => {
  const row  = props.row;
  const [open, setOpen] = React.useState(false);

  return ( //THIS IS FOR TEST OF CONCEPT, WILL BE CHANGED!!! 
    <React.Fragment>
      <TableRow  sx={{'& > *': { borderBottom: 'unset' }  }}>
        <TableCell sx={{padding: "0px 16px"}} width={50} >
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{padding: "0px 16px"}} width={120}>{row.product_code}</TableCell>
        <TableCell sx={{padding: "0px 16px", width:"40%"}}>{row.name}</TableCell>
        <TableCell sx={{padding: "0px 16px"}} >{row.average_cost}</TableCell>
        <TableCell sx={{padding: "0px 16px"}} >{row.received_amount}</TableCell>
        <TableCell sx={{padding: "0px 16px"}} >{row.used_amount}</TableCell>
        <TableCell sx={{padding: "0px 16px"}} >{row.allocated_amount}</TableCell>
        <TableCell sx={{padding: "0px 16px"}} >{row.quarantined_containers}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{padding: "0px 16px"}} style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit sx={{ background: "#e4e6ee"}}>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{padding: "0px 16px"}}>Lot#</TableCell>
                    <TableCell sx={{padding: "0px 16px"}}>Supplier</TableCell>
                    <TableCell sx={{padding: "0px 16px"}}>Unit Cost ($/KG)</TableCell>
                    <TableCell sx={{padding: "0px 16px"}}>Received Amt</TableCell>
                    <TableCell sx={{padding: "0px 16px"}}>Container Size</TableCell>
                    <TableCell sx={{padding: "0px 16px"}}>Used Amt</TableCell>
                    <TableCell sx={{padding: "0px 16px"}}>Allocated Amt</TableCell>
                    <TableCell sx={{padding: "0px 16px"}}>Qrntn Amt</TableCell>
                    <TableCell sx={{padding: "0px 16px"}}>Received Date</TableCell>
                    <TableCell sx={{padding: "0px 16px"}}>Expiry Date</TableCell>
                    <TableCell sx={{padding: "0px 16px"}}>Notes</TableCell>
                    <TableCell sx={{padding: "0px 16px"}}>Extensions</TableCell>
                    <TableCell sx={{padding: "0px 16px"}}>Supplier SKU#</TableCell>
                    {/*//TODO: QC stuff */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.items.map((item:IInventoryStock) => (
                    <TableRow key={item._id.toString() }>
                      <TableCell width={120} >
                        {item.lot_number}
                      </TableCell>
                      <TableCell  sx={{padding: "0px 16px"}} >{item.supplier_code}</TableCell>
                      <TableCell >{(item.unit_cost + 0).toFixed(2)}</TableCell>
                      <TableCell >{item.received_amount}</TableCell>
                      <TableCell >{item.container_size}</TableCell>
                      <TableCell >{item.used_amount}</TableCell>
                      <TableCell >{item.allocated_amount}</TableCell>
                      <TableCell >{item.quarantined_containers}</TableCell>
                      <TableCell width={120}>{item.received_date}</TableCell> 
                      <TableCell width={120}>{item.expiry_date}</TableCell>
                      <TableCell >{item.notes}</TableCell>
                      <TableCell >{item.extensions.length}</TableCell>
                      <TableCell >{item.supplier_sku}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}


const InventoryStockListPage = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

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
      console.log(list)
      const newRows = list!.docs.map((item) => {

        return { //grouped
          id: item._id.toString(),
          product_id: item.product_id,
          product_code: item.product_code,
          name: item.name,
          average_cost: item.average_cost,
          received_amount: item.received_amount,
          used_amount: item.used_amount,
          allocated_amount: item.allocated_amount,
          quarantined_containers: item.quarantined_containers,
          items: item.items.map((container:IInventoryStock) => {
            return {
              _id:container._id,
              product_id:container.product_id,
              product_code:container.product_code,
              name:container.name,
              unit_cost:container.unit_cost,
              container_size:container.container_size,
              received_amount:container.received_amount,
              used_amount:container.used_amount,
              allocated_amount:container.allocated_amount,
              quarantined_containers:container.quarantined_containers,
              
              lot_number: container.lot_number,
            
              supplier_code: container.supplier_code,
              supplier_id: container.supplier_id,
              supplier_sku: container.supplier_sku,
            
              received_date: container.received_date ?container.received_date.toString().split("T")[0] : 'unknown',
              expiry_date: container.expiry_date ? container.expiry_date.toString().split("T")[0] : 'unknown',
              notes: container.notes,
              extensions: container.extensions.length ,
              qc_tests: container.qc_tests.length
            }
          })
        }

        return { //regular
          id: item._id,
          product_id: item.product_code,
          name: item.name,
          cost: item.cost,
          reorder_amount: item.reorder_amount ?? 0,
          on_hand: item.on_hand ?? 0,
          on_order: item.on_order ?? 0,
          quarantined: item.quarantined ?? 0,
          allocated: item.allocated ?? 0,
        };
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
  </Card>
  <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow sx={{maxHeight:39, height:39}}>
            <TableCell sx={{padding: "0px 16px"}} />
            <TableCell sx={{padding: "0px 16px"}}>Product Code</TableCell>
            <TableCell sx={{padding: "0px 16px"}}>Name</TableCell>
            <TableCell sx={{padding: "0px 16px"}}>Avg Cost ($/KG)</TableCell>
            <TableCell sx={{padding: "0px 16px"}}>Received Amount</TableCell>
            <TableCell sx={{padding: "0px 16px"}}>Used Amount</TableCell>
            <TableCell sx={{padding: "0px 16px"}}>Allocated Amount</TableCell>
            <TableCell sx={{padding: "0px 16px"}}>Quarantined Containers</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataOptions.rows.map((row:IInventoryStockGrouped) => (
            <ExpandableRow key={row.name} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>



    {/* <DataTable
      rows={dataOptions.rows}
      columns={columns}
      listOptions={dataOptions.listOptions}
    ></DataTable> */}
    </>
  );
};

export default InventoryStockListPage;
