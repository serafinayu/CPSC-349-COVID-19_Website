import { useEffect, useState } from 'react';
import axios from 'axios';

const API_HOST = 'https:/disease.sh/v3/covid-19';

const ENDPOINTS = [
    {
        id: 'all',
        path: '/all',
        isDefault: true
    },
    {
        id: 'countries',
        path: '/countries'
    }
];

const defaultState = {
    data: null,
    state: 'ready'
};

const useTracker = ({ api = 'all', searchTerm = '' }) => {
    const [tracker = {}, updateTracker] = useState(defaultState);

    async function fetchTracker() {
        let route = ENDPOINTS.find(({ id } = {}) => id === api);

        if (!route) {
            route = ENDPOINTS.find(({ isDefault } = {}) => !!isDefault);
        }

        let response;

        try {
            updateTracker((prev) => ({
                ...prev,
                state: 'loading'
            }));
            if (searchTerm) {
                // If a searchTerm is provided, search by country or area name
                response = await axios.get(`${API_HOST}${route.path}/${searchTerm}`);
            } else {
                // Otherwise, fetch data from the specified API endpoint
                response = await axios.get(`${API_HOST}${route.path}`);
            }
        } catch (e) {
            updateTracker((prev) => ({
                ...prev,
                state: 'error',
                error: e
            }));
            return;
        }

        const data = response.data;

        updateTracker((prev) => ({
            ...prev,
            state: 'ready',
            data
        }));
    }

    useEffect(() => {
        fetchTracker();
    }, [api, searchTerm]);

    return {
        fetchTracker,
        ...tracker
    };
};

export default useTracker;
