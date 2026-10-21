export interface ApiErrorPayload {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export class ApiError extends Error {
  public statusCode: number;
  public errors?: Record<string, string[]>;

  constructor(message: string, statusCode = 500, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export function normalizeErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.errors && Object.keys(error.errors).length > 0) {
      const firstKey = Object.keys(error.errors)[0];
      const firstError = error.errors[firstKey]?.[0];
      if (firstError) return firstError;
    }
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as {
      response?: { data?: { message?: string; errors?: Record<string, string[]> }; status?: number };
    };
    if (axiosError.response?.data?.errors) {
      const firstKey = Object.keys(axiosError.response.data.errors)[0];
      const firstMsg = axiosError.response.data.errors[firstKey]?.[0];
      if (firstMsg) return firstMsg;
    }
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.status === 401) {
      return 'Sua sessão expirou. Por favor, autentique-se novamente.';
    }
    if (axiosError.response?.status === 403) {
      return 'Você não possui permissão para realizar esta operação.';
    }
    if (axiosError.response?.status === 404) {
      return 'O recurso solicitado não foi encontrado.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
}
