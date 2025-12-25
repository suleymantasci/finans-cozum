const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // Market data için cache'i devre dışı bırak (gerçek zamanlı veriler için)
    cache: endpoint.includes('/market-data/') ? 'no-store' : options.cache || 'default',
    // Timeout için signal ekle (30 saniye)
    signal: options.signal || (typeof AbortController !== 'undefined' 
      ? new AbortController().signal 
      : undefined),
    ...options,
  };

  // Token varsa header'a ekle
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  // Timeout için AbortController oluştur
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller 
    ? setTimeout(() => controller.abort(), 30000) // 30 saniye timeout
    : null;

  try {
    const response = await fetch(url, {
      ...config,
      signal: controller?.signal || config.signal,
    });
    
    // Timeout'u temizle
    if (timeoutId) clearTimeout(timeoutId);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || 'Bir hata oluştu',
      response.status,
      errorData,
    );
  }

  // 204 No Content veya 205 Reset Content gibi boş response'lar için
  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  // Response body'si boş olabilir, kontrol et
  const contentType = response.headers.get('content-type');
  const text = await response.text();
  
  // Eğer body boşsa undefined döndür
  if (!text || text.trim() === '') {
    return undefined as T;
  }

  // JSON parse et
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    // JSON değilse text olarak döndür
    return text as T;
    }
  } catch (error: any) {
    // Timeout'u temizle
    if (timeoutId) clearTimeout(timeoutId);
    
    // Network hatası veya timeout
    if (error.name === 'AbortError' || error.message?.includes('fetch') || error.message === 'Failed to fetch') {
      throw new ApiError(
        'İstek zaman aşımına uğradı veya sunucuya ulaşılamadı. Lütfen tekrar deneyin.',
        0,
        { originalError: error.message },
      );
    }
    
    // Diğer hatalar
    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    fetchApi<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),
};

