import React, { useContext, useEffect, useState, useCallback } from "react";
// import { Navbar, Container, Nav } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link, useNavigate } from "react-router-dom";
import { DarkModeContext, LangContext } from "../App";
import { isLoggedIn, getUserId } from "../helper/helper";
import DarkModeBTNToggle from "./DarkModeBTNToggle";
import LangSelectDropdown from "./LangSelectDropdown";
import { UITextContext } from "./TranslationWrapper";

export default function Navigation({ handleLangChange, handleDarkmodeChange }) {
  const navigate = useNavigate();
  const darkMode = useContext(DarkModeContext);
  const handleNavigate = (navigateTo) => {
    navigate(navigateTo, { replace: true });
  };

  const UIText = useContext(UITextContext);

  if (!UIText) return <>loading</>;

  return (
    <>
      {UIText && (
        <Navbar
          collapseOnSelect
          expand="xl"
          bg="light"
          variant="light"
          sticky="top"
        >
          <Container>
            <Navbar.Brand className="navbrand">
              {/* {async () => await getText("Product Manager")} */}
              {/* {getText("Product Manager")} */}
              {UIText.productManager}
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="me-auto">
                {isLoggedIn() && (
                  <>
                    <Nav.Link
                      onClick={() => handleNavigate("/products")}
                      // href="#products"
                    >
                      {UIText.products}
                    </Nav.Link>
                    <Nav.Link
                      onClick={() => handleNavigate("/products/deleted")}
                      // href="#deletedproducts"
                    >
                      {UIText.deletedProducts}
                    </Nav.Link>
                    <Nav.Link onClick={() => handleNavigate("/users")}>
                      {UIText.users}
                    </Nav.Link>
                    <Nav.Link onClick={() => handleNavigate("/testdict")}>
                      TEST DICT OLD!
                    </Nav.Link>
                  </>
                )}
              </Nav>
              <Nav>
                <DarkModeBTNToggle
                  handleDarkmodeChange={handleDarkmodeChange}
                />
                <LangSelectDropdown handleLangChange={handleLangChange} />
                {isLoggedIn() ? (
                  <NavDropdown
                    title={UIText.profile}
                    id="collasible-nav-dropdown"
                  >
                    <NavDropdown.Item
                      onClick={() => handleNavigate(`/viewer/${getUserId()}`)}
                      className="navlink"
                    >
                      {UIText.viewer}
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item
                      onClick={() => handleNavigate("/logout")}
                      className="navlink"
                    >
                      {UIText.logout}
                    </NavDropdown.Item>
                  </NavDropdown>
                ) : (
                  <Nav.Link onClick={() => handleNavigate("/login")}>
                    {UIText.login}
                  </Nav.Link>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}
    </>
  );
}
