import React from "react";
import { DataTable } from "../../components/utils/DataTable";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { Button, Card, Rating } from "@mui/material";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FilterElement, IListData } from "../../logic/utils";
import DataFilter from "../../components/utils/DataFilter";
import { ISupplierProduct, listSupplierProducts } from "../../logic/supplier-product.logic";
import { ObjectID } from "bson";
import TableAutocomplete from "../../components/utils/TableAutocomplete";
import { IInventory } from "../../logic/inventory.logic";

const SupplierProductPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [rows, setRows] = React.useState<ISupplierProduct[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);
  const filterArray: FilterElement[] = [
    {
        label: "Product Code",
        field: "product_code",
        type: "text",
      },{
        label: "Product Name",
        field: "name",
        type: "text",
      },{
        label: "Supplier Sku",
        field: "name",
        type: "text",
      },{
        label: "Cost/KG",
        field: "cost",
        type: "number",
      },{
        label: "Cas Number",
        field: "cas_number",
        type: "text",
      },
  
  ];
  const columns: GridColDef[] = [
    { field: "product_code", headerName: "Product Code", width: 120 },
    {
      field: "name",
      headerName: "Product Name",
      width: 350,
      sortable: false,
      filterable: false,
      renderCell: (row_params: GridRenderCellParams<string>) => (
        <TableAutocomplete
          dbOption="material"
          handleEditRow={handleEditProductRow}
          rowParams={row_params}
          initialValue={row_params.row.name}
          letterMin={0}
          getOptionLabel={(item: IInventory) =>
            item ? 
            `${item.product_code} | ${item.name}` : ''
          }
        />
      ),
    },
    {
      field: "cost",
      headerName: "Cost/KG",
      width: 120,
      editable:true
    },
    { field: "description", headerName: "Description", width: 350, editable:true },
    { field: "supplier_sku", headerName: "Supplier SKU", width: 140, editable:true },
    { field: "cas_number", headerName: "Cas Number", width: 140, editable:true },
  ];


  React.useEffect(() => {
    listSupplierProducts(searchParams, filterArray).then((list) => {
      const newRows = list!.docs.map((product:ISupplierProduct) => {
        return {
          ...product,
          _id: product._id,

        };
      });
      setRows(newRows)
    });
  }, [location.key]);
  const createNewSupplierProduct = () => {
    setRows([...rows.slice(0),  {
      _id: new ObjectID().toHexString(),
      product_id: '',
      supplier: {_id: '', code:'', name: ''},
      supplier_sku: '',
      product_code: '',
      name: '',
      cost: 0,
      discount_rates: [],
      description: '',
      cas_number: '',
    }])
  };

  const handleEditProductRow = (rowid: string, value: IInventory) => {
    let pList = rows!.slice();
    const rowIdx = rows!.findIndex((r) => r._id === rowid);
    pList[rowIdx].product_code = value.product_code;
    pList[rowIdx].product_id = value._id;
    pList[rowIdx].name = value.name;

    setRows(pList);
  };

  if (rows == null) return null;

  return (
    <>
      <Card
        variant="outlined"
        sx={{ mb: 2, p: 2, border: "1px solid #c9c9c9" }}
      >
        <DataFilter filters={filterArray}></DataFilter>
        <Button variant="contained" color="primary" onClick={createNewSupplierProduct}>
          + New Supplier Product
        </Button>
      </Card>
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight={true}
        rowHeight={45}
        editMode="cell"
        getRowId={(row) => row._id}
        />
    </>
  );
};

export default SupplierProductPage;
