import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import L from "leaflet";
import { Marker, useMap } from "react-leaflet";

import { promiseToFlyTo, getCurrentLocation } from "lib/map";

import Layout from "components/Layout";
import Container from "components/Container";
import Map from "components/Map";

import axios from 'axios'

import { useTracker } from "hooks";

const LOCATION = { lat: 0, lng: 0 };   // middle of the world

const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;
const ZOOM = 10;

const timeToZoom = 2000;

function countryPointToLayer(feature = {}, latlng) {
  const { properties = {} } = feature;
  let updatedFormatted;
  let casesString;

  const {
    country,
    updated,
    cases,
    deaths,
    recovered
  } = properties;

  casesString = `${cases}`;

  if (cases > 1000000) {
    casesString = `${casesString.slice(0, -6)}M+`;
  } else if (cases > 1000) {
    casesString = `${casesString.slice(0, -3)}k+`;
  }

  if (updated) {
    updatedFormatted = new Date(updated).toLocaleString();
  }

  const html = `
    <span class="icon-marker">
      <span class="icon-marker-tooltip">
        <h2>${country}</h2>
        <ul>
          <li><strong>Confirmed:</strong> ${cases}</li>
          <li><strong>Deaths:</strong> ${deaths}</li>
          <li><strong>Recovered:</strong> ${recovered}</li>
          <li><strong>Last Update:</strong> ${updatedFormatted}</li>
        </ul>
      </span>
      ${casesString}
    </span>
  `;

  return L.marker(latlng, {
    icon: L.divIcon({
      className: 'icon',
      html
    }),
    riseOnHover: true
  });
}

const MapEffect = ({ markerRef }) => {
  console.log('in MapEffect...');
  const map = useMap();
  const { data: countries = [] } = useTracker({ api: 'countries' });

  useEffect(() => {
    if (!markerRef.current || !map) return;

    console.log('countries', countries);

    (async function run() {
      const hasCountries = Array.isArray(countries) && countries.length > 0;
      if (!hasCountries) {
        console.log('No countries, sorry!');
        return;
      }

      
      const geoJson = {
        type: 'FeatureCollection',
        features: countries.map((country = {}) => {
          const { countryInfo = {} } = country;
          const { lat, long: lng } = countryInfo;
          return {
            type: 'Feature',
            properties: {
              ...country,
            },
            geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            }
          };
        })
      };

      console.log('geoJson', geoJson);

      const geoJsonLayers = new L.GeoJSON(geoJson, {
        pointToLayer: countryPointToLayer
      });
      var _map = markerRef.current._map;
      geoJsonLayers.addTo(_map);

      const location = await getCurrentLocation().catch(() => LOCATION);
      setTimeout(async () => {
        await promiseToFlyTo(map, { zoom: ZOOM, center: location });
      }, timeToZoom);
    })();
  }, [map, markerRef, countries]); 
  return null;
};

MapEffect.propTypes = {
  markerRef: PropTypes.object,
};

const IndexPage = () => {
  const markerRef = useRef();

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: "OpenStreetMap",
    zoom: DEFAULT_ZOOM,
  };

  return (
    <Layout pageName="home">
      <Helmet><title>COVID-19 Across the Globe</title></Helmet>
      <Map {...mapSettings}>
        <MapEffect markerRef={markerRef} />
        <Marker ref={markerRef} position={CENTER} />
      </Map>

      <Container type="content" className="text-center home-start">
        <h2>Home Page</h2>
      </Container>
    </Layout>
  );
};

export default IndexPage;
