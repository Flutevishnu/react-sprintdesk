import { type RequestOptions } from "../../features/tasks/model";


export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
    readonly status: number;
    readonly fieldErrors?: FieldErrors;

    constructor(status: number, message:string, fieldErrors?: FieldErrors){
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.fieldErrors = fieldErrors;
    }
}


interface ErrorBody {
    message: string;
    fieldErrors?: FieldErrors;
}

function isStringRecord(value: unknown): value is FieldErrors {
    return (
        typeof value === 'object' &&
        value !== null &&
        Object.values(value).every((v) => typeof v === 'string')
    );
}

async function readErrorBody(response: Response): Promise<ErrorBody> {
    try {
        const data: unknown = await response.json();
        if (typeof data === 'object' && data !== null) {
            const message = 'message' in data && typeof data.message === 'string' ? data.message : undefined;
            const fieldErrors = 'errors' in data && isStringRecord(data.errors) ? data.errors : undefined;
            if (message !== undefined) return { message, fieldErrors };
        }
    } catch {
        // body was not JSON
    }
    return {
        message: response.statusText || `Request failed with status ${response.status}`,
    };
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
        const { message, fieldErrors } = await readErrorBody(response);
        throw new ApiError(response.status, message, fieldErrors);
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


export function isAbortError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';
}