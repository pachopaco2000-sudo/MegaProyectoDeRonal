import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Destinos from "./pages/Destinos";
import Admin from "./pages/Admin";
import AdminLayout from "./pages/Admin/AdminLayout";
import DestinosAd from "./pages/Admin/DestinosAd";
import UsuariosAd from "./pages/Admin/UsuariosAd";
import RestaurantesAd from "./pages/Admin/RestaurantesAd";
import ReservasAd from "./pages/Admin/ReservasAd";
import AlertasAd from "./pages/Admin/AlertasAd";

import Actividades from "./pages/Actividades";
import ActividadesAd from "./pages/Admin/ActividadesAd";
import DestinoDetalle from "./pages/DestinoDetalle";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/destinos" element={<Destinos />} />
      <Route path="/destinos/:id" element={<DestinoDetalle />} />
      <Route path="/actividades" element={<Actividades />} />

      {/* Rutas de Administración */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Admin />} />
        <Route path="destinos" element={<DestinosAd />} />
        <Route path="usuarios" element={<UsuariosAd />} />
        <Route path="restaurantes" element={<RestaurantesAd />} />
        <Route path="actividades" element={<ActividadesAd />} />
        <Route path="reservas" element={<ReservasAd />} />
        <Route path="alertas" element={<AlertasAd />} />
      </Route>
    </Routes>
  );
}

export default App;




