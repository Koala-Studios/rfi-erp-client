import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Button, Card, TextField, Typography } from "@mui/material";
import { Field, Form, Formik, useFormik } from "formik";
import React, { useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../components/navigation/AuthProvider";
import { FormField } from "../components/utils/FormField";
import { ISignIn } from "../logic/auth.logic";
import RFI_Logo from "../resources/rfi_logo_R.svg";
import "../styles/SignIn.css";

export const SignInPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <Card
      className="signin-page"
      sx={{
        width: "100vw",
        height: "100vh",
        borderRadius: 0,
        display: "flex",
        backgroundColor: "#061e3d",
      }}
    >
      <Card
        className="signin-form"
        variant="outlined"
        sx={{ boxShadow: "0 0 30px 4px #041326" }}
      >
        <img src={RFI_Logo} alt="RFI Logo" width={100} height={100} />
        <Typography variant="h5">Sign In</Typography>
        <Formik
          enableReinitialize
          initialValues={{
            username: "",
            password: "",
          }}
          onSubmit={(values: ISignIn) => {
            console.log(values);
            auth.signin(values, () => {
              if (searchParams.has("returnUrl")) {
                navigate(searchParams.get("returnUrl")!, { replace: true });
              } else {
                navigate("/projects", { replace: true });
              }
            });
          }}
        >
          {({ values, handleChange, handleBlur }) => (
            <Form>
              <div className="form-field">
                <TextField
                  sx={{ width: "100%" }}
                  name="username"
                  label="Username or Email*"
                  // component={FormField}
                  onChange={handleChange}
                />
              </div>
              <div className="form-field">
                <TextField
                  sx={{ width: "100%" }}
                  name="password"
                  label="Password*"
                  type="password"
                  // component={FormField}
                  onChange={handleChange}
                />
              </div>
              <Button
                fullWidth
                disableElevation
                size="large"
                type="submit"
                variant="contained"
                color="primary"
                endIcon={<NavigateNextIcon />}
              >
                Sign In
              </Button>
            </Form>
          )}
        </Formik>
      </Card>
    </Card>
  );
};
