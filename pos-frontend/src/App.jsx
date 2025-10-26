import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Home, Auth, Orders, Tables, Menu, Dashboard } from "./pages";
import Header from "./components/shared/Header";
import { useSelector } from "react-redux";
import useLoadData from "./hooks/useLoadData";
import FullScreenLoader from "./components/shared/FullScreenLoader"
import SuperAdmin from "./components/superAdminDashboard/SuperAdmin";
import Login from "./components/authSuperAdmin/Login";
import Register from "./components/authSuperAdmin/Register";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";

function Layout() {
  const isLoading = useLoadData();
  const location = useLocation();
  const hideHeaderRoutes = ["/auth"];
  const { isAuth } = useSelector(state => state.user);

  if (isLoading) return <FullScreenLoader />

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Home />
          }
        />
        <Route path="/auth"
          element={<Auth />}
        />
        <Route
          path="/orders"
          element={
            <Orders />
          }
        />
        <Route
          path="/superAdminlogin"
          element={<Login />}
        />
        <Route
          path="/superAdminRegister"
          element={<Register />}
        />
        <Route
          path="/superAdmin"
          element={
            <SuperAdmin />
          }
        />
        <Route
          path="/adminDashboard"
          element={
            <AdminDashboard />
          }
        />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </>
  );
}

function ProtectedRoutes({ children }) {
  const { isAuth } = useSelector((state) => state.user);
  if (!isAuth) {
    return <Navigate to="/auth" />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
