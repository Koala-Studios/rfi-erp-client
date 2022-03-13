import { Button, Card, Typography } from "@mui/material";
import { Field, Form, Formik } from "formik";
import React, { useContext } from "react";
import { FormField } from "../components/utils/FormField";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import "../styles/SignIn.css";
import { ISignIn, signIn } from "../logic/auth.logic";
import { AuthContext } from "../components/navigation/AuthProvider";
import { useNavigate } from "react-router-dom";

export const SignIn: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div>
      <Card className="signin-form" elevation={0}>
        <Typography variant="h5">Sign In</Typography>
        <Formik
          initialValues={{
            username: "test",
            password: "test1",
          }}
          onSubmit={(values: ISignIn) => {
            console.log(values);
            auth.signin(values, () => {
              navigate("/batching", { replace: true });
            });
            // signUp();
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
    </div>
  );
};
