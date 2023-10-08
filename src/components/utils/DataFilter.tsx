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
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FilterElement, paramsToObject } from "../../logic/utils";
import { redirect } from "react-router-dom";
import SimpleSelect from "./SimpleSelect";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import RemoveIcon from '@mui/icons-material/Remove';
interface Props {
  filters: FilterElement[];
}

let paramsObj: any;

const DataFilter: React.FC<Props> = ({ filters }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterEls = useRef<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    console.log(filters)
    if (open === false) {
      filterEls.current = [];

      return;
    }

    for (let i = 0; i < filters.length; i++) {
      const val = searchParams.get(filters[i].field);
      console.log(val)
      if (val) {
        filterEls.current[i].value = val;
      }
    }
  }, [open]);

  const handleSearchClicked = () => {
    for (let i = 0; i < filters.length; i++) {
      const filterVal = filterEls.current[i].value;

      if (filterVal && filterVal !== "") {
        if (searchParams.has(filters[i].field)) {
          searchParams.set(filters[i].field, filterVal);
          console.log("set value");
        } else {
          searchParams.append(filters[i].field, filterVal);
          console.log("added value");
        }
      } else if (searchParams.has(filters[i].field)) {
        searchParams.delete(filters[i].field);
      }
    }
    setSearchParams(searchParams);
    console.log(searchParams);
  };

  const handleClearAll = () => {
    for (let i = 0; i < filters.length; i++) {
      filterEls.current[i].value = "";
    }
    navigate("", { replace: false });
    setOpen(false);
  };

  const filterPush = (element: any, dropdown: boolean) => {
    if(filterEls.current.length < filters.length) {
      if(dropdown){
        filterEls.current.push(element.node)

        return
      }

      filterEls.current.push(element)
    }
  }

  const createFields = () => {
    return filters.map((item, idx) => {
      if (item.type === "dropdown") { 
        return (
          <Grid key={idx} item xs={2}>
            <SimpleSelect
              label={item.label}
              options={item.options!}
              inputRef={(element: any) => filterPush(element, true)}
            />
          </Grid>
        );
      }

      return (
        <Grid key={idx} item xs={2}>
          <TextField
            inputRef={(element: any) => filterPush(element, false)}
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
      <Grid item xs={0.6}>
      <Button onClick={handleClearAll} variant="outlined" color="primary"
          sx={{ mr: 2, pl: 0.8, pr: 0.8 }}>
          <SearchIcon fontSize="medium" />
          <RemoveIcon></RemoveIcon>
        </Button>
      </Grid>

      {createFields()}
      <Grid item xs={3}>

        <Button
          onClick={handleSearchClicked}
          variant="contained"
          color="primary"
          sx={{ mr: 2, pl: 1.2 }}
        >
          <SearchIcon fontSize="small" sx={{ mr: 0.5 }} />
          Search
        </Button>
      </Grid>
    </Grid>
  );
};

export default DataFilter;
