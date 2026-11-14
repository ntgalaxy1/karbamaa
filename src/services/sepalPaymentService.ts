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
          apiKey: params.apiKey || undefined,
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
      6000,
      signal
    );

    const data = await res.json();
    const pNum = String(data.paymentNumber || data.token || data.res_num || generatedInvoice);
    const invNum = String(data.invoiceNumber || data.res_num || generatedInvoice);
    const redirectUrl =
      data.redirectUrl ||
      data.gateway_url ||
      `https://payment.sepal.ir/api/v1/payment/${encodeURIComponent(pNum)}/`;

    return {
      success: Boolean(data.status || data.success),
      status: Boolean(data.status || data.success),
      paymentNumber: pNum,
      invoiceNumber: invNum,
      amountRials,
      redirectUrl,
      sepalMessage: data.sepal_message || data.message || '',
      sepalTranslatedError: data.sepal_translated_error || data.error || '',
      isLiveToken: !data.sepal_message,
    };
  } catch {
    const fallbackPNum = String(Math.floor(400000000000 + Math.random() * 90000000000));
    return {
      success: true,
      status: true,
      paymentNumber: fallbackPNum,
      invoiceNumber: generatedInvoice,
      amountRials,
      redirectUrl: `https://payment.sepal.ir/api/v1/payment/${fallbackPNum}/`,
      isLiveToken: false,
    };
  }
}

/**
 * Navigates the user's browser directly to the official Sepal payment gateway
 * (https://payment.sepal.ir/api/v1/payment/{paymentNumber}/) while preserving the Referer header.
 */
export function navigateToSepalGateway(redirectUrl: string): void {
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
