import React from "react";
import { Link } from "gatsby";
import { FaGithub } from "react-icons/fa";
import { useSiteMetadata } from "hooks";
import Container from "components/Container";

const Header = () => {
  const { companyName } = useSiteMetadata();

  const headerContainerStyle = {
    backgroundColor: "#E6E6FA",
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
          <li>            
            <a
              href="https://github.com/your-github-link"             
            >
              <FaGithub />
            </a>
          </li>
        </ul>
      </Container>
    </header>
  );
};

export default Header;
