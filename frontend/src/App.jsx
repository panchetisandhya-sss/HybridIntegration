import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Navbar from "./pages/Navbar";
import UseCase from "./pages/UseCase";
import Simulation from "./pages/Simulation";
import Circuit from "./pages/Circuit";
import Histogram from "./pages/Histogram";
import History from "./pages/History";
import About from "./pages/About";
import Composer from "./pages/Composer";
export default function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/usecase" element={<UseCase />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/circuit" element={<Composer />} />
        <Route path="/histogram" element={<Histogram />} />
        <Route path="/history" element={<History />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}

