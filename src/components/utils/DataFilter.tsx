import { Button, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { paramsToObject } from "../../logic/utils";

interface Props {
  params: URLSearchParams;
}

const DataFilter: React.FC<Props> = ({ params }) => {
  const [paramsObj, setParamsObj] = useState<any>();

  useEffect(() => {
    console.log("params", paramsToObject(params));
    setParamsObj(paramsToObject(params));
  }, []);

  return (
    <>
      <TextField
        spellCheck="false"
        InputLabelProps={{ shrink: true }}
        fullWidth
        size="small"
        variant="outlined"
        label={"batch_code"}
        value={paramsObj ? paramsObj["batch_code"] : ""}
      ></TextField>
      <Button variant="contained" color="primary">
        Search
      </Button>
    </>
  );
};

export default DataFilter;
