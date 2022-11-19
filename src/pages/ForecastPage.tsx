import { Box, Button, Card, TextField, Typography } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { GridColDef } from "@mui/x-data-grid";
import React from "react";
import { AuthContext } from "../components/navigation/AuthProvider";
import { DataTable } from "../components/utils/DataTable";
import {
  calculateForecast,
  IForecast,
  IProductLine,
} from "../logic/forecast.logic";
import Delete from "@mui/icons-material/Delete";


const materialColumns: GridColDef[] = [
  { field: "product_code", headerName: "Product Code", width: 150 },
  { field: "amount", headerName: "Quantity", type: "number", width: 150 },
];

export const ForecastPage = () => {
  const auth = React.useContext(AuthContext);

  const [lineItems, SetLineItems] = React.useState<IProductLine[]>([
    {
      product_id: "",
      product_code: "",
      name: "",
      amount: "",
    },
  ]);
  const [materialRows, setMaterialRows] = React.useState<IForecast[] | null>(
    null
  );

  const handleAddLine = (lineProduct: IProductLine) => {
    const index = lineItems.indexOf(lineProduct) + 1;
    SetLineItems([
      ...(lineItems.slice(0, index)),
      {
        product_id: "",
        product_code: "",
        name: "",
        amount: "",
      },
      ...(lineItems.slice(index, lineItems.length))
    ]);
  };
  const handleRemoveLine = (lineProduct: IProductLine) => {
    if (lineItems.length <= 1) return;
    const index = lineItems.indexOf(lineProduct);

    if (index >= 0) {
      lineItems.splice(index, 1);
      SetLineItems([...lineItems]);
    }
  };

  const handleTextOnChange = (index: number, type: number, value: string) => {
    if (type === 1) {
      lineItems.at(index)!.product_code = value.toUpperCase();
    } else if (type === 2) {
      lineItems.at(index)!.name = value;
    } else if (type === 3 && (value === "" || Number(value))) {
      lineItems.at(index)!.amount = value;
    }

    SetLineItems([...lineItems]);
  };

  const handleCalculate = () => {
    if (lineItems.length === 0) return;

    //TODO:Remove elements that are not filled in

    const forecastList: IForecast[] = lineItems.map((line) => {
      return { product_code: line.product_code, amount: Number(line.amount) };
    });

    calculateForecast(auth.token, forecastList).then((result: IForecast[]) => {
      const newRows = result.map((item, idx) => {
        return {
          id: idx,
          product_code: item.product_code,
          amount: item.amount,
        };
      });

      setMaterialRows(newRows);
    });
  };

  return (
    <Box component="div">
      <Card
        variant="outlined"
        sx={{ padding: 4, marginBottom: 3 }}
        component="div"
      >
        <Box component="div" sx={{ display: "inline" }}>
          {/* <Button
            size="large"
            variant="outlined"
            onClick={handleAddLine}
            sx={{ marginRight: 4 }}
          >
            + Add Line
          </Button> */}
          <Button size="large" variant="contained" onClick={handleCalculate}>
            Calculate
          </Button>
        </Box>
        {lineItems.map((lineProduct: IProductLine, index) => {
          return (
            <Box sx={{ marginTop: 3 }}>
              <Box component="div" sx={{ display: "flex", gridGap: 30 }}>
              <Button
                  sx={{ borderColor: "red!important", color: "red!important" }}
                  variant="outlined"
                  onClick={() => handleRemoveLine(lineProduct)}
                >
                  <DeleteIcon/>
                </Button>
                <Button
            size="large"
            variant="outlined"
            onClick={() => handleAddLine(lineProduct)}
            sx={{ borderColor: "green!important", color: "green!important" }}
          >
            +
          </Button>
                <TextField
                  size="small"
                  label="Product Code"
                  variant="outlined"
                  value={lineProduct.product_code}
                  onChange={(event) =>
                    handleTextOnChange(index, 1, event.target.value)
                  }
                />
                <TextField
                  sx={{ width: 450 }}
                  size="small"
                  label="Name"
                  variant="outlined"
                  value={lineProduct.name}
                  onChange={(event) =>
                    handleTextOnChange(index, 2, event.target.value)
                  }
                />
                <TextField
                  size="small"
                  type="number"
                  label="Quantity (KG)"
                  variant="outlined"
                  value={lineProduct.amount}
                  onChange={(event) =>
                    handleTextOnChange(index, 3, event.target.value)
                  }
                />
              </Box>
            </Box>
          );
        })}
      </Card>
      {materialRows ? (
        <Box>
          <DataTable title="Forecast Results" rows={materialRows!} columns={materialColumns}></DataTable>
        </Box>
      ) : null}
    </Box>
  );
};
