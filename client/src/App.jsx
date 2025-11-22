import React, { useState, useRef } from "react";
import "./index.css";
import { HashRouter as Router, Route, NavLink, Routes } from "react-router-dom";
import Home from "./components/Home";
import Contacts from "./components/Contact";
import CamView from "./components/CamView";
import SensorData from "./components/SensorData";
import AnalysisDashboard from "./components/AnalysisDashboard";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { DataProvider } from "./context/DataContext";

function App() {
  const [loading] = useState(false);
  const navbarCollapse = useRef(null);

  const handleNavLinkClick = () => {
    const navbar = navbarCollapse.current;
    if (navbar?.classList.contains("show")) {
      navbar.classList.remove("show");
    }
  };

  return (
    <>
      <style>
        {`
        .cont {
          height: 82vh;
          overflow-y: auto;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .navbar { background-color: #000 !important; }
        .nav-link, .navbar-brand, .dropdown-item { color: #00ff66 !important; }
        .nav-link.active, .dropdown-item.active { color: #fff !important; font-weight: bold; }
        .dropdown-menu { background-color: #111; border: none; }
        .dropdown-item:hover { background-color: #00ff66; color: #000 !important; }
      `}
      </style>

      {loading ? (
        <div id="loader" className="load d-flex justify-content-center align-items-center">
          <Load />
        </div>
      ) : (
        <DataProvider pollMs={2000}>
          <Router>
            <div className="App1 d-flex justify-content-center">
              <nav className="navbar navbar-expand-lg navbar-dark w-100">
                <div className="container-fluid px-4">
                  <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarTogglerDemo03"
                    aria-controls="navbarTogglerDemo03"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                  >
                    <span className="navbar-toggler-icon"></span>
                  </button>

                  <NavLink className="navbar-brand" to="/">
                    <div className="glitch" data-text="Hydroponic Dashboard">
                      HYDROPONIC DASHBOARD
                    </div>
                  </NavLink>

                  <div
                    className="collapse navbar-collapse justify-content-center"
                    id="navbarTogglerDemo03"
                    ref={navbarCollapse}
                  >
                    <ul className="navbar-nav mb-2 mb-lg-0">
                      <li className="nav-item">
                        <NavLink className="nav-link mx-3 p-3" to="/" onClick={handleNavLinkClick}>
                          Home
                        </NavLink>
                      </li>

                      {/* Environment Sensors */}
                      <li className="nav-item dropdown">
                        <a
                          className="nav-link dropdown-toggle mx-3 p-3"
                          href="#"
                          id="envDropdown"
                          role="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          Environment Sensors
                        </a>
                        <ul className="dropdown-menu" aria-labelledby="envDropdown">
                          <li>
                            <NavLink className="dropdown-item" to="/Temp" onClick={handleNavLinkClick}>
                              Temperature
                            </NavLink>
                          </li>
                          <li>
                            <NavLink className="dropdown-item" to="/Humidity" onClick={handleNavLinkClick}>
                              Humidity
                            </NavLink>
                          </li>
                          <li>
                            <NavLink className="dropdown-item" to="/CO2" onClick={handleNavLinkClick}>
                              CO₂ Levels
                            </NavLink>
                          </li>
                          <li>
                            <NavLink className="dropdown-item" to="/Light" onClick={handleNavLinkClick}>
                              Light Intensity
                            </NavLink>
                          </li>
                        </ul>
                      </li>

                      {/* Water Sensors */}
                      <li className="nav-item dropdown">
                        <a
                          className="nav-link dropdown-toggle mx-3 p-3"
                          href="#"
                          id="waterDropdown"
                          role="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          Water Sensors
                        </a>
                        <ul className="dropdown-menu" aria-labelledby="waterDropdown">
                          <li>
                            <NavLink className="dropdown-item" to="/TDS" onClick={handleNavLinkClick}>
                              TDS
                            </NavLink>
                          </li>
                          <li>
                            <NavLink className="dropdown-item" to="/FlowRate" onClick={handleNavLinkClick}>
                              Water Flow Rate
                            </NavLink>
                          </li>
                          <li>
                            <NavLink className="dropdown-item" to="/Level" onClick={handleNavLinkClick}>
                              Water Level
                            </NavLink>
                          </li>
                          <li>
                            <NavLink className="dropdown-item" to="/Ph" onClick={handleNavLinkClick}>
                              pH Value
                            </NavLink>
                          </li>
                        </ul>
                      </li>

                      {/* Power Sensors */}
                      <li className="nav-item dropdown">
                        <a
                          className="nav-link dropdown-toggle mx-3 p-3"
                          href="#"
                          id="powerDropdown"
                          role="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          Power Sensors
                        </a>
                        <ul className="dropdown-menu" aria-labelledby="powerDropdown">
                          <li>
                            <NavLink className="dropdown-item" to="/BatteryCurrent" onClick={handleNavLinkClick}>
                              Battery Current
                            </NavLink>
                          </li>
                          <li>
                            <NavLink className="dropdown-item" to="/LoadCurrent" onClick={handleNavLinkClick}>
                              Load Current
                            </NavLink>
                          </li>
                          <li>
                            <NavLink className="dropdown-item" to="/SolarCurrent" onClick={handleNavLinkClick}>
                              Solar Current
                            </NavLink>
                          </li>
                        </ul>
                      </li>

                      <li className="nav-item">
                        <NavLink className="nav-link mx-3 p-3" to="/analysis" onClick={handleNavLinkClick}>
                          Analysis
                        </NavLink>
                      </li>

                      <li className="nav-item">
                        <NavLink className="nav-link mx-3 p-3" to="/CamView" onClick={handleNavLinkClick}>
                          Camera View
                        </NavLink>
                      </li>

                      <li className="nav-item">
                        <NavLink className="nav-link mx-3 p-3" to="/Contacts" onClick={handleNavLinkClick}>
                          Contact Us
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </nav>
            </div>

            <Routes className="text-light">
              <Route exact path="/" element={<Home />} />
              <Route
                path="/Temp"
                element={<SensorData key="Temp" label="Temperature" dataKey="Temperature" avgKey="Avg_Temp" chartColor="rgba(255,99,132,1)" unit="°C" />}
              />
              <Route
                path="/Humidity"
                element={<SensorData key="Humidity" label="Humidity" dataKey="Humidity" avgKey="Avg_Humid" chartColor="rgba(75,192,192,1)" unit="%" />}
              />
              <Route
                path="/CO2"
                element={<SensorData key="CO2" label="CO₂ Levels" dataKey="CO2" avgKey="Avg_CO2" chartColor="rgba(153,102,255,1)" unit="ppm" />}
              />
              <Route
                path="/Light"
                element={<SensorData key="Light" label="Light Intensity" dataKey="Lux" avgKey="Avg_Lux" chartColor="rgba(255,206,86,1)" unit="Lux" />}
              />
              <Route
                path="/TDS"
                element={<SensorData key="TDS" label="TDS" dataKey="TDS" avgKey="Avg_TDS" chartColor="rgba(54,162,235,1)" unit="ppm" />}
              />
              <Route
                path="/Ph"
                element={<SensorData key="Ph" label="pH Level" dataKey="pH" avgKey="Avg_pH" chartColor="rgba(255,159,64,1)" unit="" />}
              />
              <Route
                path="/FlowRate"
                element={<SensorData key="FlowRate" label="Water Flow Rate" dataKey="FlowRate" avgKey="Avg_FlowRate" chartColor="rgba(0,200,150,1)" unit="L/min" />}
              />
              <Route
                path="/Level"
                element={<SensorData key="Level" label="Water Level" dataKey="Level" avgKey="Avg_Level" chartColor="rgba(200,100,255,1)" unit="cm" />}
              />
              <Route
                path="/BatteryCurrent"
                element={<SensorData key="BatteryCurrent" label="Battery Current" dataKey="BatteryCurrent" avgKey="Avg_BatteryCurrent" chartColor="rgba(255,99,132,1)" unit="A" />}
              />
              <Route
                path="/LoadCurrent"
                element={<SensorData key="LoadCurrent" label="Load Current" dataKey="LoadCurrent" avgKey="Avg_LoadCurrent" chartColor="rgba(54,162,235,1)" unit="A" />}
              />
              <Route
                path="/SolarCurrent"
                element={<SensorData key="SolarCurrent" label="Solar Current" dataKey="SolarCurrent" avgKey="Avg_SolarCurrent" chartColor="rgba(255,206,86,1)" unit="A" />}
              />
              <Route path="/analysis" element={<AnalysisDashboard />} />
              <Route exact path="/Contacts" element={<Contacts />} />
              <Route exact path="/CamView" element={<CamView />} />
            </Routes>
          </Router>
        </DataProvider>
      )}

      <div className="Footer vanishIn d-flex justify-content-center">
        Designed by: <p className="Footer-text ms-1">Abdul Rahman</p>
      </div>
    </>
  );
}

export default App;
