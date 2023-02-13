import {
  Button,
  Divider,
  Grid,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilterElement, paramsToObject } from "../../logic/utils";
import { redirect } from "react-router-dom";
import SimpleSelect from "./SimpleSelect";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";

interface Props {
  filters: FilterElement[];
  params: URLSearchParams;
}

let paramsObj: any;

const DataFilter: React.FC<Props> = ({ params, filters }) => {
  const navigate = useNavigate();
  const filterEls = useRef<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open === false) {
      filterEls.current = [];

      return;
    }
    paramsObj = paramsToObject(params);

    if (Object.keys(paramsObj).length === 0) return;

    for (let i = 0; i < filters.length; i++) {
      filterEls.current[i].value = paramsObj[filters[i].field]
        ? paramsObj[filters[i].field]
        : "";
    }
  }, [open]);

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
    navigate("", { replace: false });
    setOpen(false);
  };

  const createFields = () => {
    return filters.map((item, idx) => {
      if (item.type === "dropdown") {
        return (
          <Grid key={idx} item xs={2}>
            <SimpleSelect
              label={item.label}
              options={item.options!}
              inputRef={(element: any) => filterEls.current.push(element)}
            />
          </Grid>
        );
      }

      return (
        <Grid key={idx} item xs={2}>
          <TextField
            inputRef={(element: any) => filterEls.current.push(element)}
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

  if (open === false) {
    return (
      <Tooltip title="Search and Filter" arrow>
        <Button
          onClick={() => setOpen(true)}
          variant="outlined"
          color="primary"
          sx={{ mr: 2, pl: 0.8, pr: 0.8 }}
        >
          <SearchIcon fontSize="medium" />
          <FilterListIcon fontSize="medium" />
        </Button>
      </Tooltip>
    );
  }

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {createFields()}
      <Grid item xs={12}>
        <Button
          onClick={handleSearchClicked}
          variant="contained"
          color="primary"
          sx={{ mr: 2, pl: 1.2 }}
        >
          <SearchIcon fontSize="small" sx={{ mr: 0.5 }} />
          Search
        </Button>

        <Button onClick={handleClearAll} variant="outlined" color="primary">
          Clear All
        </Button>
        <Divider sx={{ mt: 2 }} />
      </Grid>
    </Grid>
  );
};

export default DataFilter;
