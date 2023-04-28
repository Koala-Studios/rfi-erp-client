import { Box, Tabs } from "@mui/material";
import React from "react";

export default function NavTabs({children}:any) {
    const [value, setValue] = React.useState(0);
  
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
    };
  
    return (
      <Box sx={{ width: '100%' }}>
        <Tabs value={value} onChange={handleChange} aria-label="nav tabs example">
            {children}
        </Tabs>
      </Box>
    );
  }