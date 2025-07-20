export class ClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

class ApiClient {
  private baseUrl: string = import.meta.env.VITE_BACKEND_URL + "/api";

  constructor(service?: string) {
    this.baseUrl = this.baseUrl + service;
  }

  private async fetch<T>(
    url: string,
    params?: Record<string, string>,
    options?: RequestInit,
  ): Promise<T> {
    try {
      const queryString =
        params && Object.keys(params).length
          ? "?" + new URLSearchParams(params).toString()
          : "";

      const response = await fetch(this.baseUrl + url + queryString, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ClientError(errorData.message, response.status);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }

  async get<T>(url: string, params?: Record<string, string>) {
    return this.fetch<T>(url, params);
  }

  async post<T>(url: string, body?: object, params?: Record<string, string>) {
    return this.fetch<T>(url, params, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async patch<T>(url: string, body?: object, params?: Record<string, string>) {
    return this.fetch<T>(url, params, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async put<T>(url: string, body?: object, params?: Record<string, string>) {
    return this.fetch<T>(url, params, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async delete<T>(url: string, params?: Record<string, string>) {
    return this.fetch<T>(url, params, {
      method: "DELETE",
    });
  }
}

export default ApiClient;
