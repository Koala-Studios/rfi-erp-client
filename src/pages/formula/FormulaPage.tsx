import React from "react";
import { DataTable } from "../../components/utils/DataTable";
import { GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { getFormula } from "../../logic/formula.logic";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@mui/material";

const columns: GridColDef[] = [
  // { field: "id", headerName: "ID", width: 300 },
  // { field: "date", headerName: "Date Created", width: 250 },
  { field: "material_code", headerName: "Material Code", width: 150 },
  { field: "material_name", headerName: "Material Name", width: 300 },
  { field: "quantity", headerName: "Qty(%)", type: "number", width: 90 },
  { field: "cost", headerName: "Cost($)", type: "number", width: 100 },
  { field: "notes", headerName: "Notes", type: "number", width: 400 },
];

const FormulaPage = () => {
  const auth = React.useContext(AuthContext);
  const [rows, setRows] = React.useState<any>(null);
  const { id, version } = useParams();
  // const { approved_version } = useParams();
  React.useEffect(() => {
    getFormula(id!, parseInt(version!)).then((formula) => {
      console.log(formula, " TEST");
      if (!formula?.formula_items) {
        setRows({});
      } else {
        const newRows = formula!.formula_items.map((item) => {
          return {
            id: item.material_id,
            material_code: item.material_code,
            material_name: item.material_name,
            cost: item.cost * (item.amount / 100),
            quantity: item.amount,
            notes: item.notes,
          };
        });
        setRows(newRows);
      }
    });
  }, []);

  if (rows == null) return null;

  return (
    <Card variant="outlined" sx={{ padding: 3, overflowY: "auto" }}>
      {/* <DataTable auto_height={true} rows={rows!} columns={columns}></DataTable> */}
    </Card>
  );
};

export default FormulaPage;
