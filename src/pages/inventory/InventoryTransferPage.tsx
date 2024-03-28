import {
  Button,
  Card,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import StandaloneAutocomplete from "../../components/utils/StandaloneAutocomplete";
import React, { useEffect } from "react";
import { ILocation } from "../../logic/location.logic";
import {
  IInventoryStock,
  listLocationContainers,
  moveBulkContainers,
} from "../../logic/inventory-stock.logic";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Checkbox from "@mui/material/Checkbox";
import BiotechIcon from "@mui/icons-material/Biotech";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { MoreHoriz } from "@mui/icons-material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

interface ActionProps {
  tableParams: GridRenderCellParams<string>;
  handleDeleteRow: (id: string) => void;
}

const TableActions: React.FC<ActionProps> = ({
  tableParams,
  handleDeleteRow,
}) => {
  // const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleApprove = () => {
    window.dispatchEvent(
      new CustomEvent("ValidateForm", {
        detail: {
          formType: "approve",
          onSubmit: () => {
            console.log("OBJECT APPROVED");
          },
        },
      })
    );

    handleClose();
  };
  const handleDelete = () => {
    window.dispatchEvent(
      new CustomEvent("ValidateForm", {
        detail: {
          formType: "delete",
          onSubmit: () => {
            console.log("OBJECT DELETED");
            handleDeleteRow(tableParams.id.toString());
          },
        },
      })
    );

    handleClose();
  };

  return (
    <div>
      {/* <IconButton
        color="primary"
        size="small"
        // disabled={!tableParams.row.product_id || tableParams.row.product_id === "" }
        onClick={
          () => {}
          // navigate(`/products/${tableParams.row.product_id}`, { replace: false })
        }
      >
        <VisibilityIcon fontSize="small" />
      </IconButton> */}
      <IconButton onClick={handleClick} color="primary" style={{ width: 30 }}>
        <MoreHoriz />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        sx={{ border: "1px solid #00000015" }}
        PaperProps={{
          elevation: 0,
          sx: {
            width: 150,
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 0.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              left: 0,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateX(15px) translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
      >
        <MenuItem sx={{ p: 2 }} onClick={handleClose}>
          <BiotechIcon sx={{ mr: 2 }} /> QC Test
        </MenuItem>
        <MenuItem
          sx={{ background: "#ff221115", color: "#ff2211", p: 2 }}
          onClick={handleDelete}
        >
          <DeleteOutlineIcon sx={{ mr: 2 }} /> Dispose
        </MenuItem>
      </Menu>
    </div>
  );
};

export const InventoryTransferPage = () => {
  const [selectedLocation, setSelectedLocation] = React.useState<ILocation>();
  const [locationContainers, setLocationContainers] =
    React.useState<IInventoryStock[]>();
  const [targetContainers, setTargetContainers] =
    React.useState<IInventoryStock[]>();

  const [selectedContainers, setSelectedContainers] = React.useState<string[]>(
    []
  );
  const [selectedContainer, setSelectedContainer] =
    React.useState<IInventoryStock>();
  const [targetLocation, setTargetLocation] = React.useState<ILocation>();
  const [targetBulkLocation, setTargetBulkLocation] =
    React.useState<ILocation>();
  const label = { inputProps: { "aria-label": "Checkbox demo" } };

  const handleSelectContainer = (row_id: string, checked: boolean) => {
    if (checked) {
      setSelectedContainers(selectedContainers.filter((a) => a !== row_id));
    } else {
      setSelectedContainers([...selectedContainers, row_id]);
    }
    const tempContainers = locationContainers?.map((container) => {
      return container._id == row_id
        ? { ...container, checked: !checked }
        : container;
    });
    setLocationContainers(tempContainers);
  };

  const handleMoveBulkContainers = (
    sel_containers: string[],
    target_location: { _id: string; code: string }
  ) => {
    moveBulkContainers(sel_containers, target_location);
    setSelectedContainers([]);
    const _selected = locationContainers?.filter((a) =>
      sel_containers.includes(a._id)
    );
    setLocationContainers(
      locationContainers?.filter((a) => !sel_containers.includes(a._id))
    );
    setTargetContainers([..._selected!, ...targetContainers!]);
  };

  const getBkgColor = (row: IInventoryStock) => {
    return row.quarantined
      ? "#d69a9a"
      : row.qc_tests.length > 0 && row.qc_tests[0].passed
      ? ""
      : "#fff1a2";
  };
  const getTooltip = (row: IInventoryStock) => {
    return row.quarantined
      ? "Quarantined"
      : row.qc_tests.length > 0 && row.qc_tests[0].passed
      ? ""
      : "Pending QC";
  };

  const columns: GridColDef[] = [
    {
      field: "_id",
      headerName: "Sel",
      align: "left",
      width: 50,
      renderCell: (params: GridRenderCellParams<string>) => (
        <Checkbox
          checked={params.row.checked}
          onClick={(e) =>
            handleSelectContainer(params.row._id, params.row.checked)
          }
        />
      ),
    },
    { field: "lot_number", headerName: "Lot Number", width: 120 },
    { field: "product_code", headerName: "Prod Code", width: 90 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "container_size", headerName: "Cont Size", width: 50 },
    { field: "remaining_amount", headerName: "Curr Qty", width: 90 },
    {
      field: "expiry_date",
      headerName: "Received Date",
      type: "date",
      width: 100,
      valueGetter: (params: any) =>
        params.row.expiry_date ? params.row.expiry_date.split("T")[0] : "null",
    },
    {
      field: "qc_tests",
      headerName: "Status",
      width: 20,
      renderCell: (params: GridRenderCellParams<string>) => (
        <Tooltip
          title={getTooltip(params.row)}
          TransitionProps={{ timeout: 350 }}
          placement="right"
        >
          <div
            style={{
              height: "100%",
              width: 30,
              backgroundColor: getBkgColor(params.row),
            }}
          >
            {params.row.quarantined && (
              <TableActions
                tableParams={params}
                handleDeleteRow={function (id: string): void {
                  throw new Error("Function not implemented.");
                }}
              />
            )}
          </div>
        </Tooltip>
      ),
    },
  ];

  const targetColumns: GridColDef[] = [
    { field: "lot_number", headerName: "Lot Number", width: 120 },
    { field: "product_code", headerName: "Prod Code", width: 90 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "container_size", headerName: "Cont Size", width: 80 },
    { field: "remaining_amount", headerName: "Current Qty", width: 90 },
    {
      field: "expiry_date",
      headerName: "Received Date",
      type: "date",
      width: 120,
      valueGetter: (params: any) =>
        params.row.expiry_date ? params.row.expiry_date.split("T")[0] : "null",
    },
  ];

  useEffect(() => {
    if (selectedLocation) {
      listLocationContainers(selectedLocation._id).then((list) => {
        const newRows = list!.map((container) => {
          return { ...container, checked: false };
        });
        setLocationContainers(newRows);
      });
    } else {
      setLocationContainers([]);
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (targetBulkLocation) {
      listLocationContainers(targetBulkLocation._id).then((list) => {
        const newRows = list!.map((container) => {
          return { ...container, checked: false };
        });
        setTargetContainers(newRows);
      });
    } else {
      setTargetContainers([]);
    }
  }, [targetBulkLocation]);

  return (
    <>
      <Card style={{ marginBottom: "20px", marginTop: 16, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Single Movement</h2>

          <div style={{ margin: "1.2em" }}>
            <Button
              variant="contained"
              // disabled={id === "new" || stockCount!.status != 1}
              onClick={() => {
                if (selectedContainer && targetLocation) {
                  handleMoveBulkContainers(
                    [selectedContainer!._id],
                    targetLocation!
                  );
                } else {
                  window.dispatchEvent(
                    new CustomEvent("NotificationEvent", {
                      detail: {
                        color: "error",
                        text:
                          selectedContainers.length == 0
                            ? "No Container Selected"
                            : "Target Location Empty",
                      },
                    })
                  );
                }
              }}
            >
              Move Container
            </Button>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <div style={{ width: "50%" }}>
            <h2> Source</h2>
            <StandaloneAutocomplete
              initialValue={selectedContainer}
              onChange={(e, value) => {
                setSelectedContainer(value);
              }}
              label={"Selected Container"}
              letterMin={0}
              dbOption={"inventory-stock"}
              getOptionLabel={(item: IInventoryStock) => {
                return (
                  item.lot_number +
                  " | " +
                  item.product_code +
                  " | " +
                  item.name +
                  " Size: " +
                  item.container_size +
                  "KG"
                );
              }}
            />
          </div>
          <div>
            <h2>Target</h2>
          </div>
        </div>
      </Card>

      {/* BUlK MOVEMENTS */}
      <Card style={{ marginBottom: "20px", marginTop: 16, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Bulk Movement</h2>

          <div style={{ margin: "1.2em" }}>
            <Button
              variant="contained"
              // disabled={id === "new" || stockCount!.status != 1}
              onClick={() => {
                if (
                  selectedContainers.length > 0 &&
                  targetBulkLocation &&
                  targetBulkLocation._id != selectedLocation!._id
                ) {
                  handleMoveBulkContainers(
                    selectedContainers,
                    targetBulkLocation!
                  );
                } else {
                  window.dispatchEvent(
                    new CustomEvent("NotificationEvent", {
                      detail: {
                        color: "error",
                        text:
                          selectedContainers.length == 0
                            ? "No Containers Selected"
                            : "Target Location Same As Source Or Empty",
                      },
                    })
                  );
                }
              }}
            >
              Move Selected
            </Button>
          </div>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 20,
              width: "100%",
            }}
          >
            <div style={{ width: "50%" }}>
              <h2> Source</h2>
              <div style={{ width: "250px", marginBottom: "20px" }}>
                <StandaloneAutocomplete
                  initialValue={selectedLocation}
                  onChange={(e, value) => {
                    setSelectedLocation(value);
                  }}
                  label={"Source Location"}
                  letterMin={0}
                  dbOption={"location"}
                  getOptionLabel={(item: ILocation) => {
                    return item.code + " | " + item.name;
                  }}
                />
              </div>
              {locationContainers && (
                <DataGrid
                  getRowId={(row) => row._id}
                  sx={{ maxHeight: "500px", height: "500px" }}
                  columns={columns}
                  rowHeight={40}
                  rows={locationContainers!}
                ></DataGrid>
              )}
            </div>

            <div style={{ width: "50%" }}>
              <h2>Target</h2>
              <div style={{ width: "250px", marginBottom: "20px" }}>
                <StandaloneAutocomplete
                  initialValue={targetBulkLocation}
                  onChange={(e, value) => {
                    if (value._id != selectedLocation!._id) {
                      setTargetBulkLocation(value);
                    } else {
                      setTargetBulkLocation(undefined);
                      window.dispatchEvent(
                        new CustomEvent("NotificationEvent", {
                          detail: {
                            color: "error",
                            text: "Can't choose the same locations on both sides!",
                          },
                        })
                      );
                    }
                  }}
                  label={"Target Location"}
                  letterMin={0}
                  dbOption={"location"}
                  getOptionLabel={(item: ILocation) => {
                    return item.code + " | " + item.name;
                  }}
                />
              </div>
              {targetContainers && (
                <DataGrid
                  getRowId={(row) => row._id}
                  sx={{ maxHeight: "500px", height: "500px", width: "100%" }}
                  columns={targetColumns}
                  rowHeight={40}
                  rows={targetContainers!}
                ></DataGrid>
              )}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default InventoryTransferPage;
