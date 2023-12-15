import React from "react";
import { Link } from "gatsby";
import { useSiteMetadata } from "hooks";
import Container from "components/Container";

const Header = () => {
  const { companyName } = useSiteMetadata();

  // Define a custom style for the header container background
  const headerContainerStyle = {
    backgroundColor: "#00FFFF", // Cyan color, which complements purple
  };

  return (
    <header style={headerContainerStyle}>
      <Container type="content">
        <p>
          <Link to="/">{companyName}</Link>
        </p>
        <ul>
          <li>
            <Link to="/about/">About</Link>
          </li>          
        </ul>
      </Container>
    </header>
  );
};

export default Header;
