import { Button, Card, Chip, Grid, IconButton, TextField, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../components/navigation/AuthProvider";
import { getProduct, IProduct } from "../logic/product.logic";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = React.useContext(AuthContext);
  const [product, setProduct] = React.useState<IProduct | null>(null);
  const ProductStatus = [
    ["Pending", "error"],
    ["In Progress", "warning"],
    ["Awaiting Approval", "info"],
    ["Approved", "success"],
    ["Error", "error"],
  ];
  
  useEffect(() => {
    getProduct(auth.token, id!).then((product) => {
      setProduct(product);
      console.log(product)
    });
  }, []);

  if (product == null) return null;

  return (
    
    <Card variant="outlined" style={{ padding: 16, marginBottom:10 }}>
      <Button
        sx={{ marginBottom: 4 }}
        aria-label="go back"
        size="large"
        variant="outlined"
        onClick={() => navigate(-1)}
      >
        <ArrowBackIcon
          fontSize="small"
          sx={{
            marginRight: 1,
          }}
        />
        Back to Products
      </Button>

      <Button
        sx={{ marginLeft:4, marginBottom: 4, alignSelf:'right' }}
        aria-label="save changes"
        size="large"
        variant="contained"
        onClick={() => navigate(-1)}
      >
        Save Changes
      </Button>
    <div style={{ display: "flex", gap: 16, marginBottom: 10}}>
      <Grid container spacing={3}>
      <Grid item xs={2.5}>
          <TextField
            fullWidth
            InputLabelProps={{ shrink: true }}
            size="small"
            variant="outlined"
            label={"Created Date"}
            InputProps={{
              readOnly: true,
            }}
            type={"date"}
          ></TextField>
        </Grid>
        <Grid item xs={2.5}>
          {/* <DatePicker
            label="Basic example"
            value={undefined}
            // onChange={(newValue) => {
            //   setValue(newValue);
            // }}
            renderInput={(params) => <TextField {...params} />}
          /> */}
          <TextField 
            fullWidth
            InputLabelProps={{ shrink: true }}
            size="small"
            variant="outlined"
            label={"Approved Date"}
            InputProps={{
              readOnly: true,
            }}
            type={"date"}
          ></TextField>
        </Grid>

        <Grid item xs={3.5}></Grid>
        <Grid item xs={1.5}>
          <TextField
            spellCheck="false"
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
            variant="outlined"
            label={"Versions"}
            defaultValue={product?.versions ? product?.versions : '0'}
            InputProps={{
              readOnly: true,
            }}
          ></TextField>
        </Grid>
        <Grid item xs={2}>
        <Chip
            label={ProductStatus[product?.status ? product.status - 1 : 4][0]}
            sx={{
              width:'100%',
              height:'100%',
              fontWeight: 600,
            }}
            //@ts-ignore
            color={ProductStatus[product?.status ? product.status - 1 : 4][1]}
            variant="outlined"
              />
        </Grid>
        <Grid item xs={2}>
          <TextField
            spellCheck="false"
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
            variant="outlined"
            defaultValue={product?.product_code ? product?.product_code : ''}
            InputProps={{
              readOnly: true,
            }}
            label={"Product Code"}
          ></TextField>
        </Grid>
        <Grid item xs={5}>
          <TextField
            spellCheck="false"
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
            variant="outlined"
            label={"Product Name"}
            defaultValue={product?.name ? product?.name : ''}
            InputProps={{
            }}
          ></TextField>
        </Grid>
        <Grid item xs={5}></Grid>

        <Grid item xs={12}>
          <TextField
            spellCheck="false"
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
            variant="outlined"
            label={"Flavor Profile"}
            multiline
            rows={6}
          ></TextField>
        </Grid>
      </Grid>

      <Card
        variant="outlined"
        style={{ width: "40%", minWidth: "40%", padding: 16 }}
      >
        <div>
          <Typography variant="h6">Overview Stats</Typography>
        </div>

      </Card>
    </div>
    

  </Card>
  );
};
