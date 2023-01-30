import {
  Button,
  Grid,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilterElement, paramsToObject } from "../../logic/utils";
import { redirect } from "react-router-dom";
import SimpleSelect from "./SimpleSelect";

interface Props {
  filters: FilterElement[];
  params: URLSearchParams;
}

let paramsObj: any;

const DataFilter: React.FC<Props> = ({ params, filters }) => {
  const navigate = useNavigate();
  const filterEls = useRef<any[]>([]);

  useEffect(() => {
    paramsObj = paramsToObject(params);
    if (Object.keys(paramsObj).length === 0) return;

    for (let i = 0; i < filters.length; i++) {
      filterEls.current[i].value = paramsObj[filters[i].field]
        ? paramsObj[filters[i].field]
        : "";
    }
  }, []);

  const handleSearchClicked = () => {
    // if (!paramsObj) return;

    let query = "?";

    for (let i = 0; i < filters.length; i++) {
      const filterVal = filterEls.current[i].value;
      if (filterVal !== "") {
        query += `${filters[i].field}=${filterEls.current[i].value}&`;
      }
    }
    navigate(query, { replace: false });
    console.log(query);
  };

  const handleClearAll = () => {
    for (let i = 0; i < filters.length; i++) {
      filterEls.current[i].value = "";
    }
    navigate("", { replace: true });
  };

  const createFields = () => {
    return filters.map((item, idx) => {
      if (item.type === "dropdown") {
        return (
          <Grid item xs={2}>
            <SimpleSelect
              label={item.label}
              key={idx}
              options={item.options!}
              inputRef={(element: any) => filterEls.current.push(element)}
            />
          </Grid>
        );
      }

      return (
        <Grid item xs={2}>
          <TextField
            inputRef={(element: any) => filterEls.current.push(element)}
            key={idx}
            spellCheck="false"
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
            variant="outlined"
            type={item.type}
            label={item.label}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchClicked();
            }}
          ></TextField>
        </Grid>
      );
    });
  };

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {createFields()}
      <Grid item xs={12}>
        <Button
          onClick={handleSearchClicked}
          variant="contained"
          color="primary"
          sx={{ mr: 2 }}
        >
          Search
        </Button>
        <Button onClick={handleClearAll} variant="outlined" color="primary">
          Clear All
        </Button>
      </Grid>
    </Grid>
  );
};

export default DataFilter;
