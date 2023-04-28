import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useNavigate } from 'react-router-dom';

interface LinkTabProps {
  label: string;
  href: string;
}

function LinkTab(props: LinkTabProps) {
  
  const navigate = useNavigate();
  return (
    <Tab
      component="a"
      onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
        navigate(props.href);
      }}
      {...props}
    />
  );
}


export default LinkTab;