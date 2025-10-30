import React, { useEffect, useState } from "react";
import "../Styles/Navbar.css";
import logo from "../assets/Logo.png";
import { useTranslation } from "react-i18next";

const MOBILE_BREAKPOINT = 992;

const Navbar = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= MOBILE_BREAKPOINT && open) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  useEffect(() => {
    const onKey = (e) => (e.key === "Escape" ? setOpen(false) : null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const closeOnNav = () => setOpen(false);

  return (
    <header className="navbar" role="banner">
      <div className="navbar-left">
        <a href="/" className="navbar-brand" aria-label={t("navbar.home")}>
          <img src={logo} alt={t("navbar.logoAlt")} className="navbar-logo" />
        </a>
      </div>

      {/* Burger button (shown on mobile) */}
      <button
        className={`navbar-toggle ${open ? "is-open" : ""}`}
        aria-label={
          open
            ? t("navbar.closeMenu") || "Close menu"
            : t("navbar.openMenu") || "Open menu"
        }
        aria-expanded={open}
        aria-controls="primary-collapsible"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      {/* Collapsible area (nav + right block) */}
      <div
        id="primary-collapsible"
        className={`navbar-collapsible ${open ? "open" : ""}`}
      >
        <nav className="navbar-nav" role="navigation" aria-label="Primary">
          <a href="/" className="nav-link" onClick={closeOnNav}>
            {t("navbar.home")}
          </a>
          <a href="#" className="nav-link" onClick={closeOnNav}>
            {t("navbar.menu")}
          </a>
          <a href="#" className="nav-link" onClick={closeOnNav}>
            {t("navbar.contact")}
          </a>
          <a href="#" className="nav-link" onClick={closeOnNav}>
            {t("navbar.admin")}
          </a>
        </nav>

        <div className="navbar-right">
          <div
            className="lang-switch"
            role="group"
            aria-label={t("navbar.language") || "Language"}
          >
            <button className="lang-btn selected" type="button">
              {" "}
              {t("navbar.fr")}{" "}
            </button>
            <button className="lang-btn" type="button">
              {" "}
              {t("navbar.en")}{" "}
            </button>
            <button className="lang-btn" type="button">
              {" "}
              {t("navbar.ar")}{" "}
            </button>
          </div>
          <div className="social-icons">
            <a href="#" aria-label="Facebook">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" aria-label="LinkedIn">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="#" aria-label="Website">
              <i className="fas fa-globe"></i>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
