import React from "react";
import { DataTable } from "../../components/utils/DataTable";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Button, Card, Rating, Tooltip } from "@mui/material";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { FilterElement, IListData } from "../../logic/utils";
import DataFilter from "../../components/utils/DataFilter";
import {
  listCustomerProducts,
  updateCustomerProducts,
} from "../../logic/customer-product.logic";
import { ICustomer } from "../../logic/customer.logic";
import { ObjectID, ObjectId } from "bson";
import reportWebVitals from "../../reportWebVitals";
import TableAutocomplete from "../../components/utils/TableAutocomplete";
import { IProduct } from "../../logic/product.logic";
import SaveForm from "../../components/forms/SaveForm";

let savedRows: any[] | null = null;

const CustomerProductPage = (props: { customer: ICustomer }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [productsSaved, setProductsSaved] = React.useState<boolean>(true);
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);
  const filterArray: FilterElement[] = [
    {
      label: "Product Code",
      field: "product_code",
      type: "text",
    },
    {
      label: "Customer Sku",
      field: "name",
      type: "text",
    },
    {
      label: "Customer Product Name",
      field: "name",
      type: "text",
    },

    {
      label: "Price/KG",
      field: "price",
      type: "number",
    },
  ];
  const columns: GridColDef[] = [
    {
      field: "product.product_code",
      headerName: "Internal Code",
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (row_params: GridRenderCellParams<string>) => (
        <TableAutocomplete
          initialValue={row_params.row.product.product_code}
          dbOption="approved-product"
          width={160}
          handleEditRow={handleEditProductRow}
          rowParams={row_params}
          letterMin={0}
          getOptionLabel={(item: IProduct) =>
            item.name ? `${item.product_code} | ${item.name}` : ""
          }
        />
      ),
    },
    {
      field: "customer_sku",
      headerName: "Customer SKU",
      width: 120,
      editable: true,
    },
    {
      field: "c_prod_name",
      headerName: "Product Name",
      width: 350,
      editable: true,
    },
    {
      field: "price",
      headerName: "Price/KG",
      width: 120,
      editable: true,
    },
    {
      field: "rec_dose",
      headerName: "Rec Dose",
      width: 80,
      editable: true,
    },
  ];

  const saveProducts = async () => {
    let allValid = true;
    const changedRows = dataOptions!.rows.filter((row: any) => {
      return (
        savedRows?.findIndex((r: any) => {
          return row === r;
        }) === -1
      );
    });
    console.log(changedRows, "changed");
    allValid =
      changedRows.length != 0 &&
      changedRows.filter((r: any) => {
        return (
          r!.product._id == "" || r!.c_prod_name == "" || r!.customer_sku == ""
        );
      }).length == 0;
    if (allValid === false) {
      setProductsSaved(true);
      window.dispatchEvent(
        new CustomEvent("NotificationEvent", {
          detail: {
            text: "Changes Not Saved. Some inputs are invalid",
            color: "error",
          },
        })
      );
      return;
    }

    //send new project to server
    const test = await updateCustomerProducts(changedRows);
    savedRows = dataOptions!.rows;
    window.dispatchEvent(
      new CustomEvent("NotificationEvent", {
        detail: {
          text: test.data.message,
          color: test.data.res ? "success" : "error",
        },
      })
    );
    setProductsSaved(true);
  };

  const cancelSaveProducts = () => {
    setDataOptions({ rows: savedRows, listOptions: dataOptions!.listOptions });
    setProductsSaved(true);
  };

  const GetProdLabel = (item: any): any => {
    if (item) {
      if (item.product_code) {
        return item.product_code + " | " + item!.name;
      } else {
        return "";
      }
    }
    return "";
  };

  React.useEffect(() => {
    listCustomerProducts(searchParams, filterArray, id).then((list) => {
      setDataOptions({ rows: list!.docs, listOptions: list! });
      savedRows = list!.docs;
    });
    setProductsSaved(true);
  }, [location.key]);

  React.useEffect(() => {
    if (
      dataOptions == null ||
      dataOptions!.rows == null ||
      savedRows == null ||
      productsSaved === false
    )
      return;
    if (JSON.stringify(savedRows) !== JSON.stringify(dataOptions!.rows)) {
      console.log("Bruh test", savedRows, dataOptions!.rows);
      setProductsSaved(false);
    }
  }, [dataOptions!]);

  const handleEditProductRow = (rowid: string, value: IProduct) => {
    let pList = dataOptions!.rows.slice();
    const rowIdx = dataOptions!.rows.findIndex((r: any) => r._id === rowid);
    pList[rowIdx].product.product_code = value ? value.product_code : "";
    pList[rowIdx].product._id = value ? value._id : "";
    pList[rowIdx].product.name = value ? value.name : "";
    setDataOptions({ rows: pList, listOptions: dataOptions!.listOptions });
  };

  const addProductRow = () => {
    setDataOptions({
      rows: [
        {
          _id: new ObjectID().toHexString(),
          product: {},
          customer: {
            _id: props.customer._id,
            code: props.customer.code,
            name: props.customer.name,
          },
          rec_dose: 0.02,
          customer_sku: "",
          c_prod_name: "",
          price: 0,
          discount_rates: [],
        },
        ...dataOptions!.rows,
      ],
      listOptions: dataOptions!.listOptions,
    });
  };

  if (dataOptions == null) return null;

  function handleEditCell(row_id: string, field: string, value: any) {
    const rowIndex = dataOptions!.rows.findIndex((r: any) => r._id === row_id);
    setDataOptions({
      rows: [
        ...dataOptions!.rows.slice(0, rowIndex),
        {
          ...dataOptions!.rows[rowIndex],
          [field]: value,
        },
        ...dataOptions!.rows.slice(
          rowIndex == dataOptions!.rows.length ? rowIndex : rowIndex + 1
        ),
      ],
      listOptions: dataOptions!.listOptions,
    });
  }

  return (
    <>
      <Card
        variant="outlined"
        sx={{ mb: 2, p: 2, border: "1px solid #c9c9c9" }}
      >
        <DataFilter filters={filterArray}></DataFilter>
        <Button variant="contained" color="primary" onClick={addProductRow}>
          + New Customer Product
        </Button>
        <SaveForm
          display={!productsSaved}
          onSave={saveProducts}
          onCancel={cancelSaveProducts}
          location="bottom"
        ></SaveForm>
      </Card>
      <DataTable
        rows={dataOptions.rows}
        columns={columns}
        GetRowId={(row) => row._id}
        auto_height
        OnCellKeyDown={(params, event) => {
          if (event.code == "Space") {
            event.stopPropagation();
          }
        }}
        listOptions={dataOptions.listOptions}
        OnCellEditCommit={(e, value) => {
          handleEditCell(e.id, e.field, e.value);
        }}
      ></DataTable>
    </>
  );
};
export default CustomerProductPage;
