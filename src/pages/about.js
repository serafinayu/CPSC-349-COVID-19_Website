import React from "react";
import { Helmet } from "react-helmet";

import { useSiteMetadata } from "hooks";

import Layout from "components/Layout";
import Container from "components/Container";

const SecondPage = () => {
  const { siteDescription } = useSiteMetadata();

  const institutionInfo = {
    name: "California State University Fullerton (CSUF)",
    course: "CPSC 349 - Front-end Web Development (Fall 2023, Section 01, 13660)",
  };

  const devTeam = [
    "Serafina Yu",
    "An Dao",
    "Francisco Ramirez",
    "Josue Han Yan Tai Liu",
  ];

  return (
    <Layout pageName="about">
      <Helmet>
        <title>About</title>
      </Helmet>
      <Container type="content">
        <h1>About</h1>

        <h2>Institution Info</h2>
        <p>
          Name: {institutionInfo.name}
          <br />
          Course: {institutionInfo.course}
        </p>

        <h2>Dev Team</h2>
        <ul>
          {devTeam.map((teamMember, index) => (
            <li key={index}>{teamMember}</li>
          ))}
        </ul>

        <h2>Site Description</h2>
        <p>{siteDescription}</p>
      </Container>
    </Layout>
  );
};

export default SecondPage;
