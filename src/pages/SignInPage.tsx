import { Button, Card, Typography } from "@mui/material";
import { Field, Form, Formik } from "formik";
import React, { useContext } from "react";
import { FormField } from "../components/utils/FormField";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import "../styles/SignIn.css";
import { ISignIn } from "../logic/auth.logic";
import { AuthContext } from "../components/navigation/AuthProvider";
import { useNavigate, useSearchParams } from "react-router-dom";
import RFI_Logo from "../resources/rfi_logo_R.svg";

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
            username: "test",
            password: "test1",
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
                <Field
                  name="username"
                  label="Username or Email*"
                  component={FormField}
                />
              </div>
              <div className="form-field">
                <Field
                  name="password"
                  label="Password*"
                  type="password"
                  component={FormField}
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
