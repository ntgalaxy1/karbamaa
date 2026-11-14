export interface SepalGatewayRequestParams {
  amountToman: number;
  description: string;
  payerName?: string;
  payerMobile?: string;
  payerEmail?: string;
  apiKey?: string;
  invoiceNumber?: string;
}

export interface SepalGatewaySessionResult {
  success: boolean;
  status: boolean;
  paymentNumber: string;
  invoiceNumber: string;
  amountRials: number;
  redirectUrl: string;
  sepalMessage?: string;
  sepalTranslatedError?: string;
  serverIp?: string;
  isLiveToken: boolean;
}

/**
 * Non-blocking asynchronous helper with AbortController timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
  externalSignal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController();
  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', onExternalAbort, { once: true });
    }
  }

  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
    if (externalSignal) {
      externalSignal.removeEventListener('abort', onExternalAbort);
    }
  }
}

/**
 * Step 1 & 2 of Official Sepal IPG v1:
 * Calls POST /api/sep/request.php -> POST https://payment.sepal.ir/api/v1/payment/request/
 * Obtains paymentNumber and returns the direct Sepal gateway redirect URL:
 * https://payment.sepal.ir/api/v1/payment/{paymentNumber}/
 *
 * IMPORTANT: Never generates a fake paymentNumber if Sepal returns status: false,
 * preventing the browser from landing on Sepal's "پرداخت یافت نشد" error page.
 */
export async function requestSepalGatewayRedirectAsync(
  params: SepalGatewayRequestParams,
  signal?: AbortSignal
): Promise<SepalGatewaySessionResult> {
  const amountRials = Math.max(100000, Math.round(params.amountToman * 10));
  const generatedInvoice =
    params.invoiceNumber || `KB${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

  try {
    const res = await fetchWithTimeout(
      '/api/sep/request.php',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          apiKey: params.apiKey ? params.apiKey.trim() : undefined,
          amount: amountRials,
          amount_toman: params.amountToman,
          invoiceNumber: generatedInvoice,
          callbackUrl: 'https://karbama34.ir/api/sep/callback.php',
          callbackMethod: 'post',
          payerName: params.payerName || 'کاربر کارباما',
          payerMobile: params.payerMobile || '',
          payerEmail: params.payerEmail || '',
          description: params.description || 'پرداخت هزینه خدمات سامانه کاریابی کارباما',
        }),
      },
      10000,
      signal
    );

    const data = await res.json();
    const hasRealPaymentNumber =
      Boolean(data.status || data.success) &&
      Boolean(data.paymentNumber) &&
      !data.sepal_message;

    const pNum = hasRealPaymentNumber ? String(data.paymentNumber).trim() : '';
    const invNum = String(data.invoiceNumber || data.res_num || generatedInvoice);
    const redirectUrl = pNum
      ? data.redirectUrl ||
        data.gateway_url ||
        `https://payment.sepal.ir/api/v1/payment/${encodeURIComponent(pNum)}/`
      : '';

    return {
      success: hasRealPaymentNumber,
      status: hasRealPaymentNumber,
      paymentNumber: pNum,
      invoiceNumber: invNum,
      amountRials,
      redirectUrl,
      sepalMessage: data.sepal_message || data.message || '',
      sepalTranslatedError:
        data.sepal_translated_error ||
        data.error ||
        (hasRealPaymentNumber ? '' : 'کلید وب‌سرویس درگاه (apiKey) در پنل سپال تایید نشد.'),
      serverIp: data.server_ip || '',
      isLiveToken: hasRealPaymentNumber,
    };
  } catch (err: any) {
    return {
      success: false,
      status: false,
      paymentNumber: '',
      invoiceNumber: generatedInvoice,
      amountRials,
      redirectUrl: '',
      sepalMessage: 'network_error',
      sepalTranslatedError:
        'خطا در ارتباط با وب‌سرویس درگاه سپال. لطفاً اتصال اینترنت را بررسی کرده و مجدداً تلاش کنید.',
      isLiveToken: false,
    };
  }
}

/**
 * Saves the Sepal payment gateway apiKey on the server (/api/sep/save-config.php)
 */
export async function saveSepalGatewayApiKeyOnServer(
  sepalApiKey: string,
  sepalUniqueCode?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/sep/save-config.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sepalApiKey: sepalApiKey.trim(),
        sepalUniqueCode: sepalUniqueCode?.trim() || '',
      }),
    });
    const data = await res.json();
    return {
      success: Boolean(data.success || data.status),
      message: data.message,
      error: data.error,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'خطا در ذخیره کلید وب‌سرویس درگاه سپال روی سرور',
    };
  }
}

/**
 * Navigates the user's browser directly to the official Sepal payment gateway
 * (https://payment.sepal.ir/api/v1/payment/{paymentNumber}/) while preserving the Referer header.
 */
export function navigateToSepalGateway(redirectUrl: string): void {
  if (!redirectUrl) return;
  try {
    // Ensure Referrer-Policy meta allows sending origin Referer to payment.sepal.ir
    let metaReferrer = document.querySelector('meta[name="referrer"]') as HTMLMetaElement | null;
    if (!metaReferrer) {
      metaReferrer = document.createElement('meta');
      metaReferrer.name = 'referrer';
      document.head.appendChild(metaReferrer);
    }
    metaReferrer.content = 'origin-when-cross-origin';

    // Submit a standard HTML GET form with target="_top" so browser sends Referer header
    // and breaks out of any preview iframe (since payment.sepal.ir sends X-Frame-Options: DENY)
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = redirectUrl;
    form.target = '_top';
    form.style.display = 'none';
    document.body.appendChild(form);
    form.submit();

    // Fallback direct location navigation if top-level window is same-origin
    setTimeout(() => {
      try {
        if (window.top && window.top !== window) {
          window.top.location.href = redirectUrl;
        } else {
          window.location.href = redirectUrl;
        }
      } catch {
        window.location.href = redirectUrl;
      }
    }, 150);
  } catch {
    window.location.href = redirectUrl;
  }
}
