import { type RequestOptions } from "../../features/tasks/model";

export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message:string){
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}


async function readErrorMessage(response: Response) : Promise<string> {
    try {
        const data: unknown = await response.json()
        if (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string') {
            return data.message
        }
    }
    catch {
        // Error
    }

    return response.statusText || `Request failed with status ${response.status}`;
}


export async function request<T>(
    url: string,
    options: RequestOptions = {},
) : Promise<T> {
    const { method = "GET", body, signal} = options;

    const response: Response = await fetch(url, {
        method,
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal
    });

    if (!response.ok) {
        throw new ApiError(response.status, await readErrorMessage(response))
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}


export const http = {
    get: <T>(url: string, signal?: AbortSignal) => request<T>(url, { signal }),
    post: <T>(url: string, body: unknown, signal?: AbortSignal) => request<T>(url, { method: 'POST', body, signal }),
    patch: <T>(url: string, body: unknown, signal?: AbortSignal) => request<T>(url, { method: 'PATCH', body, signal }),
    delete: <T = void>(url: string, signal?: AbortSignal) => request<T>(url, { method: 'DELETE', signal }),
};

