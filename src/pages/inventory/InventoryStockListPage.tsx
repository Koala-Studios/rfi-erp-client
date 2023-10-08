import React from "react";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listInventoryStock } from "../../logic/inventory-stock.logic";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { Button, Card } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FilterElement, IListData } from "../../logic/utils";
import {
  IInventoryStock,
  IInventoryStockGrouped,
} from "../../logic/inventory-stock.logic";
import DataFilter from "../../components/utils/DataFilter";
import { ExpandableDataTable } from "../../components/utils/ExpandableDataTable";

const filterArray: FilterElement[] = [
  { label: "Product Code", field: "product_code", type: "text"},
  { label: "Product Name", field: "name", type: "text"},
  { label: "Lot Number", field: "lot_number", type: "text"},
  { label: "Expirey Date", field: "expiry_date", type: "date"},
  { label: "Supplier Sku", field: "supplier_sku", type: "text"},
  { label: "Container Size", field: "container_size", type: "number"},
];

const InventoryStockListPage = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);

  const columns: GridColDef[] = [
    { field: "product_code", headerName: "Product Code", width: 100 },
    { field: "name", headerName: "Name", width: 100 },
    { field: "average_cost", headerName: "Avg Cost ($/KG)", width: 100 },
    { field: "received_amount", headerName: "Received Amount", width: 100 },
    { field: "used_amount", headerName: "Used Amount", width: 100 },
    { field: "allocated_amount", headerName: "Allocated Amount", width: 100 },
    {
      field: "quarantined_containers",
      headerName: "Quarantined Containers",
      width: 100,
    },
  ];
  const sub_columns: GridColDef[] = [
    { field: "lot_number", headerName: "Lot#", width: 100 },
    { field: "supplier_code", headerName: "Supplier", width: 100 },
    { field: "unit_cost", headerName: "Unit Cost ($/KG)", width: 100 },
    { field: "received_amount", headerName: "Received Amt", width: 100 },
    { field: "allocated_amount", headerName: "Container Size", width: 100 },
    { field: "quarantined_containers", headerName: "Used Amt", width: 100 },
    { field: "allocated_amount", headerName: "Allocated Amt", width: 100 },
    { field: "allocated_amount", headerName: "Qrntn Amt", width: 100 },
    { field: "received_date", headerName: "Received Date", width: 120 },
    { field: "expiry_date", headerName: "Expiry Date", width: 120 },
    { field: "allocated_amount", headerName: "Notes", width: 120 },
    { field: "extensions", headerName: "Extensions", width: 120 },
    { field: "supplier_sku", headerName: "Supplier SKU#", width: 120 },
    {
      field: "quarantined_containers",
      headerName: "Quarantined Containers",
      width: 120,
    },
  ];

  const auth = React.useContext(AuthContext);

  React.useEffect(() => {
    listInventoryStock(searchParams, filterArray, true).then((list) => {
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
          sub_rows: item.items.map((container: IInventoryStock) => {
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
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, [location.key]);
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
        <DataFilter filters={filterArray} />
      </Card>
      <div
        style={{ height: "calc(100% - 140px)", maxHeight: "calc(100% - 85px)" }}
      >
        <ExpandableDataTable
          rows={dataOptions.rows}
          columns={columns}
          sub_columns={sub_columns}
          listOptions={dataOptions.listOptions}
        ></ExpandableDataTable>
      </div>
    </>
  );
};

export default InventoryStockListPage;
