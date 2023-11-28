import { Chip, Menu, MenuItem, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import { GridColDef, useGridApiContext } from "@mui/x-data-grid";
import React, { useState } from "react";


interface SingleDropdownCellProps{
    id?:any;
    value?:any;
    field?:any;
    options:(string | number)[][];
    handleEditRow: (rowid:string, newValue: number | string) => void;
    //value,text
    // options:{value:number | string, text:string}[];
}

export const SingleDropdownCell: React.FC<SingleDropdownCellProps> = ({id, value, field,options, handleEditRow}) => {
    const apiRef = useGridApiContext();
  
    const handleChange = (newValue: string | number) => {
      handleEditRow(id, newValue);
      handleClose()
    };
  
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };

    console.log(options);

    return (
        <>
        <Chip
        onClick={handleClick}
          label={options[value-1][1]}
          sx={{
            fontWeight: 600,
          }}
          //@ts-ignore
          color={options[value-1][2]}
          variant="outlined"
        />
        <Menu
         anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}        
        sx={{border:"1px solid #00000015"}}
        PaperProps={{
          elevation: 0,
          sx: {
            // width: 150,
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.2))",
            mt: 1,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        >

            {options.map((item)=>{
                return(
                <MenuItem key={item[0]} onClick={() => handleChange(item[0])} sx={{borderBottom:"1px solid #00000020", p:1}}>
                    <Chip
                        onClick={handleClick}
                        label={item[1]}
                        sx={{
                            fontWeight: 600,
                        }}
                        //@ts-ignore
                        color={item[2]}
                        variant="outlined"
                    />
                </MenuItem>)
            })}
        </Menu>
    </>

    );
  }

interface TableTexfieldProps {
    handleEditRow: (value:string) => void;
    width?: number;
    readOnly?:boolean;
    initialValue:string;
    type?: string;
}

export const TableTexfield: React.FC<TableTexfieldProps> = ({
    handleEditRow,
    initialValue,
    width = 150,
    type,
    readOnly = false
  }) => {
    const [editMode, setEditMode] = React.useState(false);
    
    if (readOnly == false && editMode) {
        return (
            <TextField
              variant="outlined"
              autoFocus
              type={type ? type : "text"}
              onBlur={(event)=> {
                handleEditRow(event.target.value);
                setEditMode(false)
              }}
              InputProps={{ sx: { borderRadius: 0 } }}
              sx={{
                width:width,
                maxWidth:width,
                // marginLeft: "-5%",
                // minWidth: "110%",
                // minHeight: "39px",
                margin:"0!important",
              }}
              placeholder={initialValue}
            //   {...params}
            />
          )
    } else {
      return (
        <div
          style={{
            width:width,
            maxWidth:width,
            padding: "16px",
          }}
          onDoubleClick={() => setEditMode(!readOnly)}
        >
          <Typography variant="subtitle2" style={{ fontSize: "15px" }}>
            {initialValue}
          </Typography>
        </div>
      );
    }
  };
  