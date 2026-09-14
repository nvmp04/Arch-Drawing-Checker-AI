export const apiClient = { get: async <T>(path: string): Promise<T> => { void path; return Promise.reject(new Error("API client has not been configured.")); } };
