import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import L from "leaflet";
import { Marker, useMap } from "react-leaflet";
import axios from 'axios';

import { promiseToFlyTo, getCurrentLocation } from "lib/map";

import Layout from "components/Layout";
import Container from "components/Container";
import Map from "components/Map";
import SearchBar from "components/SearchBar";
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

const searchLocation = async (searchTerm) => {
  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchTerm)}.json?access_token=YOUR_MAPBOX_ACCESS_TOKEN`
    );

    if (response.data && response.data.features && response.data.features.length > 0) {
      const { center } = response.data.features[0];
      return { lat: center[1], lon: center[0] };
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error);
  }

  return null;
};

const MapEffect = ({ markerRef, searchTerm }) => {
  const map = useMap();
  const { data: countries = [] } = useTracker({ api: 'countries' });

  useEffect(() => {
    if (!markerRef.current || !map) return;

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

      const geoJsonLayers = new L.GeoJSON(geoJson, {
        pointToLayer: countryPointToLayer
      });
      var _map = markerRef.current._map;
      geoJsonLayers.addTo(_map);

      const location = await getCurrentLocation().catch(() => LOCATION);
      setTimeout(async () => {
        await promiseToFlyTo(map, { zoom: ZOOM, center: location });
      }, timeToZoom);

      // Fly to the selected country or area based on the searchTerm
      if (searchTerm) {
        const coordinates = await searchLocation(searchTerm);
        if (coordinates) {
          await promiseToFlyTo(map, { zoom: ZOOM, center: [coordinates.lat, coordinates.lon] });
        } else {
          console.log('Location not found.');
        }
      }
    })();
  }, [map, markerRef, countries, searchTerm]); 
  return null;
};

MapEffect.propTypes = {
  markerRef: PropTypes.object,
  searchTerm: PropTypes.string, // Pass searchTerm as a prop
};

const IndexPage = () => {
  const markerRef = useRef();
  const [searchTerm, setSearchTerm] = useState('');

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: "OpenStreetMap",
    zoom: DEFAULT_ZOOM,
  };

  const handleSearch = (term) => {
    setSearchTerm(term); // Update the search term when searching
  };

  return (
    <Layout pageName="home">
    <Helmet><title>COVID-19 Across the Globe</title></Helmet>
    <SearchBar onSearch={handleSearch} /> {/* Render the SearchBar component */}
    <Map {...mapSettings}>
      <MapEffect markerRef={markerRef} searchTerm={searchTerm} />
      <Marker ref={markerRef} position={CENTER} />
    </Map>
  
    <Container type="content" className="text-center home-start">
      <h2>Home Page</h2>
    </Container>
  </Layout>
  );
};

export default IndexPage;
