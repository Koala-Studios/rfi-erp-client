import { Button, Card, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../components/navigation/AuthProvider";
import { getProduct, IProduct } from "../logic/product.logic";

export const ProductDetailPage = () => {
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
      <Typography variant="h6">Product Code: {product.product_code}</Typography>
      <Typography variant="h6">
        Approved Version: {product.approved_version}
      </Typography>
      <Typography variant="h6">Cost: {product.cost}</Typography>
      <Button sx={{ marginTop: 3 }} variant="outlined">
        View Formula
      </Button>
    </Card>
  );
};
