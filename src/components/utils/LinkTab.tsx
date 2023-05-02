import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useNavigate } from 'react-router-dom';

interface LinkTabProps {
  label: string;
  href: string;
  tab_id: string | undefined;
  disable: boolean | undefined;
}

function LinkTab(props: LinkTabProps, ) {
  
  const navigate = useNavigate();
  return (
    <Tab
      component="a"
      disabled={props.disable}
      onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
        navigate((props.tab_id != undefined ? './../' : '././') + props.href, {replace:true});
      }}
      {...props}
    />
  );
}


export default LinkTab;