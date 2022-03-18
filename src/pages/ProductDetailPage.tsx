import { Button, Card, IconButton, Typography } from "@mui/material";
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

  useEffect(() => {
    getProduct(auth.token, id!).then((product) => {
      setProduct(product);
    });
  }, []);

  if (product == null) return null;

  return (
    <Card variant="outlined" sx={{ padding: 3 }}>
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
      <Typography variant="h6">Product Code: {product.product_code}</Typography>
      <Typography variant="h6">Product Name: {product.name}</Typography>
      <Typography variant="h6">
        Approved Version: {product.approved_version}
      </Typography>
      <Typography variant="h6">Cost: {product.cost}</Typography>
      <Button sx={{ marginTop: 3 }} variant="contained" size="large">
        View Formula
      </Button>
    </Card>
  );
};
