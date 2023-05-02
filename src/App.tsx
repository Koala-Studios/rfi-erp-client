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
import BatchingListPage from "./pages/batching/BatchingListPage";
import { Navbar } from "./components/navigation/Navbar";
import ProductListPage from "./pages/product/ProductListPage";
import { ProductDetailPage } from "./pages/product/ProductDetailPage";
import { ForecastPage } from "./pages/ForecastPage";
import InventoryListPage from "./pages/inventory/InventoryListPage";
import SupplierListPage from "./pages/supplier/SupplierListPage";
import { SupplierDetailPage } from "./pages/supplier/SupplierDetailPage";
import { CustomerDetailPage } from "./pages/customer/CustomerDetailPage";
import { UserDetailPage } from "./pages/user/UserDetailPage";
import UserListPage from "./pages/user/UserListPage";
import FormulaListPage from "./pages/formula/FormulaListPage";
import FormulaPage from "./pages/formula/FormulaPage";
import PurchaseListPage from "./pages/purchasing/PurchaseListPage";
import ProjectListPage from "./pages/project/ProjectListPage";
import { PurchaseDetailPage } from "./pages/purchasing/PurchaseDetailPage";
import SalesListPage from "./pages/sales/SalesListPage";
import { SalesDetailPage } from "./pages/sales/SalesDetailPage";
import FormulaDevPage from "./pages/formula/FormulaDevPage";
import { ProjectDetails } from "./components/project/ProjectDetails";
import CustomerListPage from "./pages/customer/CustomerListPage";
import InventoryStockListPage from "./pages/inventory/InventoryStockListPage";
import { SnackbarProvider } from "notistack";
import StockCountListPage from "./pages/stock-count/StockCountListPage";
import { StockCountDetailPage } from "./pages/stock-count/StockCountDetailPage";
import { BatchingDetailPage } from "./pages/batching/BatchingDetailPage";
import { ProductTypeDetailPage } from "./pages/product-type/ProductTypeDetailPage";
import ProductTypeListPage from "./pages/product-type/ProductTypeListPage";
import { InventoryDetailPage } from "./pages/inventory/InventoryDetailPage";
import MaterialListPage from "./pages/inventory/MaterialListPage";
import InventoryMovementPage from "./pages/inventory/InventoryMovementPage";

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
                path="/inventory/:id/:tab_id?"
                element={
                  <RequireAuth>
                    <Navbar title="Inventory Details">
                      <InventoryDetailPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
              path="/materials"
                element={
                  <RequireAuth>
                    <Navbar title="Materials">
                      <MaterialListPage />
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
                      <PurchaseListPage />
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
                path="/stock-counts"
                element={
                  <RequireAuth>
                    <Navbar title="Stock Counts">
                      <StockCountListPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
                path="/stock-counts/:id"
                element={
                  <RequireAuth>
                    <Navbar title="Stock Count">
                      <StockCountDetailPage />
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
                path="/product-types"
                element={
                  <RequireAuth>
                    <Navbar title="Product Types">
                      <ProductTypeListPage />
                    </Navbar>
                  </RequireAuth>
                }
              />
              <Route
                path="/product-types/:id"
                element={
                  <RequireAuth>
                    <Navbar title="Product Type Details">
                      <ProductTypeDetailPage />
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
                path="/batching/:id"
                element={
                  <RequireAuth>
                    <Navbar title="Batching">
                      <BatchingDetailPage />
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
                      <FormulaListPage />
                    </Navbar>
                  </RequireAuth>
                }
              />

              <Route
                path="/products/:id/:tab_id?"
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
