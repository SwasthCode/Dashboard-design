const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/';

interface RequestOptions {
    headers?: Record<string, string>;
    token?: string;
    isFormData?: boolean;
}

const getHeaders = (options: RequestOptions = {}, isFormData: boolean = false) => {
    const headers: Record<string, string> = { ...options.headers };

    // Add Authorization header if token is present
    const token = options.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Set Content-Type to application/json if it's not FormData
    // If it IS FormData, let the browser set the Content-Type (and boundary)
    if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
};

const getURL = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `${baseUrl}${url.startsWith('/') ? url.slice(1) : url}`;
};

const request = async (method: string, url: string, data?: any, options?: RequestOptions) => {
    const isFormData = data instanceof FormData || options?.isFormData;
    const headers = getHeaders(options, isFormData); // Correctly passing isFormData as the second argument which is boolean

    const config: RequestInit = {
        method,
        headers,
    };

    if (data) {
        config.body = isFormData ? data : JSON.stringify(data);
    }

    try {
        const fullUrl = getURL(url);
        const response = await fetch(fullUrl, config);

        // Try to parse JSON response
        let responseData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

        if (!response.ok) {
            // Create a comprehensive error object
            const error: any = new Error(responseData?.message || response.statusText || 'Something went wrong');
            error.status = response.status;
            error.data = responseData;
            throw error;
        }

        return responseData;
    } catch (error: any) {
        // Re-throw the error so the caller can handle it
        console.error(`API Request Error [${method} ${url}]:`, error);
        throw error;
    }
};

const https = {
    get: (url: string, options?: RequestOptions) => request('GET', url, undefined, options),
    post: (url: string, data: any, options?: RequestOptions) => request('POST', url, data, options),
    put: (url: string, data: any, options?: RequestOptions) => request('PUT', url, data, options),
    delete: (url: string, options?: RequestOptions) => request('DELETE', url, undefined, options),
    patch: (url: string, data: any, options?: RequestOptions) => request('PATCH', url, data, options),
};

export default https;
