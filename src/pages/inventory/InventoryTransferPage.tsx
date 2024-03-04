import { Button, Card } from "@mui/material";
import StandaloneAutocomplete from "../../components/utils/StandaloneAutocomplete";
import React, { useEffect } from "react";
import { ILocation } from "../../logic/location.logic";
import {
  IInventoryStock,
  listLocationContainers,
  moveBulkContainers,
} from "../../logic/inventory-stock.logic";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { IListOptions } from "../../logic/utils";
import Checkbox from "@mui/material/Checkbox";

export const InventoryTransferPage = () => {
  const [selectedLocation, setSelectedLocation] = React.useState<ILocation>();
  const [locationContainers, setLocationContainers] =
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
    setLocationContainers(
      locationContainers?.filter((a) => !sel_containers.includes(a._id))
    );
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
    { field: "product_code", headerName: "Product Code", width: 120 },
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
        console.log(list, "test");
        const newRows = list!.map((container) => {
          return { ...container, checked: false };
        });
        setLocationContainers(newRows);
      });
    } else {
      setLocationContainers([]);
    }
  }, [selectedLocation]);

  return (
    <>
      <Card style={{ marginBottom: "20px", marginTop: 16, padding: 16 }}>
        <h2>Single Movement</h2>
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
                if (selectedContainers.length > 0 && targetBulkLocation) {
                  handleMoveBulkContainers(
                    selectedContainers,
                    targetBulkLocation!
                  );
                } else {
                  console.log("not working");
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
                  initialValue={undefined}
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
            </div>

            <div>
              <h2>Target</h2>
              <div style={{ width: "250px", marginBottom: "20px" }}>
                <StandaloneAutocomplete
                  initialValue={undefined}
                  onChange={(e, value) => {
                    setTargetBulkLocation(value);
                  }}
                  label={"Target Location"}
                  letterMin={0}
                  dbOption={"location"}
                  getOptionLabel={(item: ILocation) => {
                    return item.code + " | " + item.name;
                  }}
                />
              </div>
            </div>
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
      </Card>
    </>
  );
};

export default InventoryTransferPage;
