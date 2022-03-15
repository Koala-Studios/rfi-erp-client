import React from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { SignInPage } from "./pages/SignInPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthProvider, {
  RequireAuth,
} from "./components/navigation/AuthProvider";
import BatchingListPage from "./pages/BatchingListPage";
import { Navbar } from "./components/navigation/Navbar";
import ProductListPage from "./pages/ProductListPage";

const mainTheme = createTheme({
  palette: {
    primary: { main: "rgb(5, 30, 52)" },
    // background: {
    //   paper: "rgb(5, 30, 52)",
    // },
    secondary: {
      main: "#2c394e",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={mainTheme}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<SignInPage />} />

            <Route
              path="/"
              element={
                <RequireAuth>
                  <BatchingListPage />
                </RequireAuth>
              }
            />
            <Route
              path="/batching"
              element={
                <RequireAuth>
                  <Navbar>
                    <BatchingListPage />
                  </Navbar>
                </RequireAuth>
              }
            />
            <Route
              path="/products"
              element={
                <RequireAuth>
                  <Navbar>
                    <ProductListPage />
                  </Navbar>
                </RequireAuth>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
