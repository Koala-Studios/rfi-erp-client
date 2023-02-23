import React from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {
  createTheme,
  Shadows,
  ThemeOptions,
  ThemeProvider,
} from "@mui/material/styles";
import { SignInPage } from "./pages/SignInPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthProvider, {
  RequireAuth,
} from "./components/navigation/AuthProvider";
import BatchingListPage from "./pages/BatchingListPage";
import { Navbar } from "./components/navigation/Navbar";
import ProductListPage from "./pages/ProductListPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ForecastPage } from "./pages/ForecastPage";
import InventoryListPage from "./pages/InventoryListPage";
import SupplierListPage from "./pages/SupplierListPage";
import { SupplierDetailPage } from "./pages/SupplierDetailPage";
import { CustomerDetailPage } from "./pages/CustomerDetailPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import UserListPage from "./pages/UserListPage";
import DvpListPage from "./pages/DvpListPage";
import FormulaPage from "./pages/FormulaPage";
import POListPage from "./pages/POListPage";
import ProjectListPage from "./pages/ProjectListPage";
import { PurchaseDetailPage } from "./pages/PurchaseDetailPage";
import SalesListPage from "./pages/SalesListPage";
import { SalesDetailPage } from "./pages/SalesDetailPage";
import FormulaDevPage from "./pages/FormulaDevPage";
import { ProjectDetails } from "./components/project/ProjectDetails";
import CustomerListPage from "./pages/CustomerListPage";
import InventoryStockListPage from "./pages/InventoryStockListPage";
import { SnackbarProvider } from "notistack";

const mainTheme = createTheme({
  palette: {
    primary: { main: "#061e3d" },
    success: { main: "#008060" },
    secondary: {
      main: "#fff",
    },
  },
  shadows: Array(25).fill("none") as Shadows,
});

function App() {
  return (
    <ThemeProvider theme={mainTheme}>
      <SnackbarProvider
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        autoHideDuration={2000}
        maxSnack={4}
      >
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<SignInPage />} />
              <Route path="/login" element={<SignInPage />} />

              {/* <Route
              path="/"
              element={
                <RequireAuth>
                  <BatchingListPage />
                </RequireAuth>
              }
            /> */}
              <Route
                path="/inventory"
                element={
                  <RequireAuth>
                    <Navbar title="Inventory">
                      <InventoryListPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
                path="/inventory-stock"
                element={
                  <RequireAuth>
                    <Navbar title="Inventory Stock">
                      <InventoryStockListPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
                path="/projects"
                element={
                  <RequireAuth>
                    <Navbar title="Projects">
                      <ProjectListPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <RequireAuth>
                    <Navbar title="Projects Details">
                      <ProjectDetails />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
                path="/purchase-orders"
                element={
                  <RequireAuth>
                    <Navbar title="Purchase Orders">
                      <POListPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
                path="/purchase-orders/:id"
                element={
                  <RequireAuth>
                    <Navbar title="Purchase Order">
                      <PurchaseDetailPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
                path="/sales-orders"
                element={
                  <RequireAuth>
                    <Navbar title="Sales Orders">
                      <SalesListPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
                path="/sales-orders/:id"
                element={
                  <RequireAuth>
                    <Navbar title="Sales Order">
                      <SalesDetailPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
                path="/stock-count"
                element={
                  <RequireAuth>
                    <Navbar title="Stock Count">
                      <UserListPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
                path="/users"
                element={
                  <RequireAuth>
                    <Navbar title="Users">
                      <UserListPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
                path="/users/:id"
                element={
                  <RequireAuth>
                    <Navbar title="User Details">
                      <UserDetailPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
                path="/customers"
                element={
                  <RequireAuth>
                    <Navbar title="Customers">
                      <CustomerListPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
                path="/customers/:id"
                element={
                  <RequireAuth>
                    <Navbar title="Customer Details">
                      <CustomerDetailPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
                path="/suppliers"
                element={
                  <RequireAuth>
                    <Navbar title="Suppliers">
                      <SupplierListPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
                path="/suppliers/:id"
                element={
                  <RequireAuth>
                    <Navbar title="Supplier Details">
                      <SupplierDetailPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
                path="/batching"
                element={
                  <RequireAuth>
                    <Navbar title="Batching">
                      <BatchingListPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
                path="/products"
                element={
                  <RequireAuth>
                    <Navbar title="Products">
                      <ProductListPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
                path="/development"
                element={
                  <RequireAuth>
                    <Navbar title="Development">
                      <DvpListPage />
                    </Navbar>
                  </RequireAuth>
                }
              />

              <Route
                path="/products/:id"
                element={
                  <RequireAuth>
                    <Navbar title="Product Details">
                      <ProductDetailPage />
                    </Navbar>
                  </RequireAuth>
                }
              />

              <Route
                path="/formula/:id/:version"
                element={
                  <RequireAuth>
                    <Navbar title="Formula Page">
                      <FormulaPage />
                    </Navbar>
                  </RequireAuth>
                }
              />

              <Route
                path="/formula/develop/:id/:version"
                element={
                  <RequireAuth>
                    <Navbar title="Formula Development Page">
                      <FormulaDevPage />
                    </Navbar>
                  </RequireAuth>
                }
              />

              <Route
                path="/forecast"
                element={
                  <RequireAuth>
                    <Navbar title="Forecast Calculator">
                      <ForecastPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
