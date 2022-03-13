import React from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { SignIn } from "./pages/SignIn";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthProvider, {
  RequireAuth,
} from "./components/navigation/AuthProvider";
import BatchingListPage from "./pages/BatchingListPage";

const mainTheme = createTheme({
  palette: {
    primary: {
      main: "#1e60ca",
    },
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
            <Route path="/login" element={<SignIn />} />

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
                  <BatchingListPage />
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
