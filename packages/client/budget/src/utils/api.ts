export const apiFetch = async (
    url: string,
    options: RequestInit,
    getAccessToken: () => string | null,
    refreshFn: () => Promise<string>
): Promise<Response> => {
    const headers = new Headers(options.headers ?? {});
    const token = getAccessToken();
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    let response = await fetch(url, { ...options, headers });

    if (response.status !== 401) {
        return response;
    }

    const newToken = await refreshFn();
    const retryHeaders = new Headers(options.headers ?? {});
    if (newToken) {
        retryHeaders.set('Authorization', `Bearer ${newToken}`);
    }

    response = await fetch(url, { ...options, headers: retryHeaders });
    return response;
};
