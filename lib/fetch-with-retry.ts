// lib/fetch-with-retry.ts

export interface RetryOptions {
  retries?: number;
  timeoutMs?: number;
  backoffMs?: number;
  retryOn?: number[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  retries: 2,
  timeoutMs: 10000,
  backoffMs: 500,
  retryOn: [408, 429, 500, 502, 503, 504],
};

/**
 * Error yang dilempar ketika sebuah request ke layanan eksternal gagal
 * (setelah retry habis, timeout, atau response non-2xx).
 * `status` diisi jika kegagalan berasal dari response HTTP nyata.
 */
export class UpstreamError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "UpstreamError";
    this.status = status;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * fetch wrapper dengan:
 * - Timeout otomatis (AbortController)
 * - Retry dengan exponential backoff untuk status yang termasuk retryOn
 *   atau kegagalan jaringan/timeout
 *
 * Status 4xx selain yang ada di retryOn (mis. 400/401/403/404) TIDAK di-retry
 * karena mengulang request yang sama tidak akan mengubah hasil.
 */
export async function fetchWithRetry(
  input: string,
  init: RequestInit = {},
  options: RetryOptions = {}
): Promise<Response> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), opts.timeoutMs);

    try {
      const res = await fetch(input, { ...init, signal: controller.signal });
      clearTimeout(timeoutId);

      const shouldRetryStatus =
        !res.ok && opts.retryOn.includes(res.status) && attempt < opts.retries;

      if (shouldRetryStatus) {
        await sleep(opts.backoffMs * Math.pow(2, attempt));
        continue;
      }

      return res;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;

      const isAbort = err?.name === "AbortError";
      const isLastAttempt = attempt === opts.retries;

      if (isLastAttempt) {
        throw new UpstreamError(
          isAbort
            ? `Request ke ${input} timeout setelah ${opts.timeoutMs}ms`
            : `Request ke ${input} gagal: ${err?.message || "Unknown network error"}`
        );
      }

      await sleep(opts.backoffMs * Math.pow(2, attempt));
    }
  }

  throw new UpstreamError(
    `Request ke ${input} gagal setelah ${opts.retries + 1} percobaan: ${
      (lastError as any)?.message || "Unknown error"
    }`
  );
}
