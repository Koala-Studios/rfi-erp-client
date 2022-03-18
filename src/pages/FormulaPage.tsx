import React from "react";
import { DataTable } from "../components/utils/DataTable";
import { GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { AuthContext } from "../components/navigation/AuthProvider";
import { getFormula } from "../logic/formula.logic";

const columns: GridColDef[] = [
  // { field: "id", headerName: "ID", width: 300 },
  { field: "date", headerName: "Date Created", width: 250 },
  { field: "material_code", headerName: "Material Code", width: 150 },
  { field: "quantity", headerName: "Quantity", type: "number", width: 150 },
];

const BatchingListPage = () => {
  const auth = React.useContext(AuthContext);
  const [rows, setRows] = React.useState<any>(null);

  React.useEffect(() => {
    getFormula(auth.token, 25, 1).then((formula) => {
      const newRows = formula!.formula_items.map((item) => {
        return {
          id: item.material_id,
          material_code: item.material_code,
          quantity: item.amount,
        };
      });
      setRows(newRows);
    });
  }, []);

  if (rows == null) return null;

  return <DataTable rows={rows!} columns={columns}></DataTable>;
};

export default BatchingListPage;
