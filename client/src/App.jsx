import React, { useState, useEffect, useRef } from "react";
import "./index.css";
import { HashRouter as Router, Route, NavLink, Routes } from "react-router-dom";
import Load from "./components/Load";
import Home from "./components/Home";
import CO2 from "./components/Co2";
import FlowRate from "./components/FlowRate";
import Temp from "./components/Temp";
import Humidity from "./components/Humidity";
import Contacts from "./components/Contact";
import TDS from "./components/TDS";
import Level from "./components/Level";
import CamView from "./components/CamView";
import Ph from "./components/Ph";
import Light from "./components/Light";

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
      {loading ? (
        <div
          id="loader"
          className="load d-flex justify-content-center align-items-center"
        >
          <Load />
        </div>
      ) : (
        <Router>
          <div className="App1 d-flex justify-content-center">
            <nav className="navbar navbar-expand-lg navbar-light w-100">
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
                    Hydroponic Dashboard
                  </div>
                </NavLink>
                <div
                  className="collapse navbar-collapse justify-content-center"
                  id="navbarTogglerDemo03"
                  ref={navbarCollapse}
                >
                  <ul className="navbar-nav mb-2 mb-lg-0">
                    <li className="nav-item">
                      <NavLink
                        className="nav-NavLink mx-3 p-3"
                        to="/"
                        onClick={handleNavLinkClick}
                      >
                        Home
                      </NavLink>
                    </li>

                    {/* Environment Sensors Dropdown */}
                    <li className="nav-item dropdown">
                      <span
                        className="nav-link dropdown-toggle mx-3 p-3"
                        id="envDropdown"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Environment Sensors
                      </span>
                      <ul
                        className="dropdown-menu"
                        aria-labelledby="envDropdown"
                      >
                        <li>
                          <NavLink
                            className="dropdown-item"
                            to="/Temp"
                            onClick={handleNavLinkClick}
                          >
                            Temperature
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            className="dropdown-item"
                            to="/Humidity"
                            onClick={handleNavLinkClick}
                          >
                            Humidity
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            className="dropdown-item"
                            to="/CO2"
                            onClick={handleNavLinkClick}
                          >
                            CO₂ Levels
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            className="dropdown-item"
                            to="/light"
                            onClick={handleNavLinkClick}
                          >
                            Light_Intensity
                          </NavLink>
                        </li>
                      </ul>
                    </li>

                    {/* Water Sensors Dropdown */}
                    <li className="nav-item dropdown">
                      <span
                        className="nav-link dropdown-toggle mx-3 p-3"
                        id="waterDropdown"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Water Sensors
                      </span>
                      <ul
                        className="dropdown-menu"
                        aria-labelledby="waterDropdown"
                      >
                        <li>
                          <NavLink
                            className="dropdown-item"
                            to="/tds"
                            onClick={handleNavLinkClick}
                          >
                            TDS (Total Dissolved Solids)
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            className="dropdown-item"
                            to="/FlowRate"
                            onClick={handleNavLinkClick}
                          >
                            Water Flow Rate
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            className="dropdown-item"
                            to="/level"
                            onClick={handleNavLinkClick}
                          >
                            Water Level
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            className="dropdown-item"
                            to="/Ph"
                            onClick={handleNavLinkClick}
                          >
                            pH Value
                          </NavLink>
                        </li>
                      </ul>
                    </li>

                    <li className="nav-item">
                      <NavLink
                        className="nav-NavLink mx-3 p-3"
                        to="/CamView"
                        onClick={handleNavLinkClick}
                      >
                        Camera View
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink
                        className="nav-NavLink mx-3 p-3"
                        to="/Contacts"
                        onClick={handleNavLinkClick}
                      >
                        Contact Us
                      </NavLink>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
          </div>

          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/CO2" element={<CO2 />} />
            <Route exact path="/FlowRate" element={<FlowRate />} />
            <Route exact path="/Temp" element={<Temp />} />
            <Route exact path="/Humidity" element={<Humidity />} />
            <Route exact path="/Contacts" element={<Contacts />} />
            <Route exact path="/TDS" element={<TDS />} />
            <Route exact path="/Level" element={<Level />} />
            <Route exact path="/CamView" element={<CamView />} />
            <Route exact path="/Ph" element={<Ph />} />
            <Route exact path="/Light" element={<Light />} />
          </Routes>
        </Router>
      )}

      <div className="Footer vanishIn d-flex justify-content-center">
        Designed by: <p className="Footer-text ms-1">Abdul Rahman</p>
      </div>
    </>
  );
}

export default App;
