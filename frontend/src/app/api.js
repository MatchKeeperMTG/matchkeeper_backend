export const inDevEnvironment = !!process && process.env.NODE_ENV === 'development';

/**
 * Creates a full API URL given an endpoint in the format `/some/endpoint`
 * @param {string} endpoint 
 */
export function apiURL(endpoint) {
    if (!endpoint.startsWith("/")) {
        endpoint = `/${endpoint}`;
    }

    if (inDevEnvironment) {
        return `http://localhost:8080${endpoint}`;
    } else {
        return `${endpoint}`;
    }
}