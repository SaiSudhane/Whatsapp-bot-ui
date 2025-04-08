import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Determine if we should use the FastAPI backend
  const isExternalApi = url.startsWith('/api/') && !url.includes('/api/messages') && !url.includes('/api/register');
  const baseUrl = isExternalApi ? 'https://backend.myadvisor.sg' : '';
  const finalUrl = isExternalApi ? url.replace('/api', '') : url;
  
  const res = await fetch(`${baseUrl}${finalUrl}`, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: isExternalApi ? 'omit' : 'include', // Don't send cookies to external API
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const isExternalApi = url.startsWith('/api/') && !url.includes('/api/messages') && !url.includes('/api/register');
    const baseUrl = isExternalApi ? 'https://backend.myadvisor.sg' : '';
    const finalUrl = isExternalApi ? url.replace('/api', '') : url;
    
    const res = await fetch(`${baseUrl}${finalUrl}`, {
      credentials: isExternalApi ? 'omit' : 'include',
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
