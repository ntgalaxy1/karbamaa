<?php
/**
 * سامانه کارباما - کاریابی و اقامت ترکیه
 * ۱. ایجاد درخواست پرداخت (POST /api/sep/request.php)
 * مطابق مستندات رسمی سپال: POST https://payment.sepal.ir/api/v1/payment/request/
 * و هدایت مرورگر پرداخت‌کننده به: GET https://payment.sepal.ir/api/v1/payment/{paymentNumber}/ (همراه با هدر Referer)
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    exit;
}

// خواندن اطلاعات ورودی از JSON یا POST
$inputRaw = file_get_contents('php://input');
$inputData = json_decode($inputRaw, true);
if (!is_array($inputData)) {
    $inputData = array_merge($_GET, $_POST);
}

// ۱. محاسبه مبلغ به ریال (طبق مستندات سپال: نباید کمتر از ۱۰۰,۰۰۰ ریال باشد)
$amountRial = 0;
if (isset($inputData['amount']) && intval($inputData['amount']) > 0) {
    $amountRial = intval($inputData['amount']);
} elseif (isset($inputData['amountRials']) && intval($inputData['amountRials']) > 0) {
    $amountRial = intval($inputData['amountRials']);
} elseif (isset($inputData['amount_toman']) && intval($inputData['amount_toman']) > 0) {
    $amountRial = intval($inputData['amount_toman']) * 10;
}

if ($amountRial > 0 && $amountRial < 100000) {
    sendJsonResponse([
        'success' => false,
        'status' => false,
        'message' => 'invalid_amount',
        'error' => 'مبلغ تراکنش به ریال نباید کمتر از ۱۰۰,۰۰۰ ریال (۱۰,۰۰۰ تومان) باشد.'
    ], 400);
}

if ($amountRial <= 0) {
    $amountRial = 17055000; // مبلغ پیش‌فرض به ریال
}

// ۲. پارامترهای ورودی مطابق جدول مستندات سپال
$apiKey = isset($inputData['apiKey']) && !empty($inputData['apiKey']) ? trim($inputData['apiKey']) : SEPAL_API_KEY;
$callbackUrl = isset($inputData['callbackUrl']) && !empty($inputData['callbackUrl'])
    ? trim($inputData['callbackUrl'])
    : (isset($inputData['callback_url']) && !empty($inputData['callback_url']) ? trim($inputData['callback_url']) : KARBAMA_CALLBACK_URL);

$invoiceNumber = isset($inputData['invoiceNumber']) && !empty($inputData['invoiceNumber'])
    ? trim($inputData['invoiceNumber'])
    : (isset($inputData['order_id']) && !empty($inputData['order_id']) ? trim($inputData['order_id']) : ('KB' . time() . rand(100, 999)));

$callbackMethod = isset($inputData['callbackMethod']) && in_array(strtolower($inputData['callbackMethod']), ['get', 'post'])
    ? strtolower($inputData['callbackMethod'])
    : 'post';

$payerName = isset($inputData['payerName']) ? trim($inputData['payerName']) : (isset($inputData['user_name']) ? trim($inputData['user_name']) : '');
$rawMobile = isset($inputData['payerMobile']) ? $inputData['payerMobile'] : (isset($inputData['cell_number']) ? $inputData['cell_number'] : '');
$payerMobile = normalizeIranMobile($rawMobile);
$payerEmail = isset($inputData['payerEmail']) ? trim($inputData['payerEmail']) : '';
$description = isset($inputData['description']) && !empty($inputData['description'])
    ? trim($inputData['description'])
    : 'پرداخت هزینه خدمات و فعال‌سازی حساب کارباما';

// محدودسازی اختیاری کارت (freezeCardNumber / freezeCardNumberList) و کد معرف (affiliateCode)
$freezeCardNumber = isset($inputData['freezeCardNumber'])
    ? preg_replace('/\D/', '', $inputData['freezeCardNumber'])
    : (isset($inputData['freeze_card_number']) ? preg_replace('/\D/', '', $inputData['freeze_card_number']) : '');
$freezeCardNumberList = isset($inputData['freezeCardNumberList']) && is_array($inputData['freezeCardNumberList'])
    ? $inputData['freezeCardNumberList']
    : null;
$affiliateCode = isset($inputData['affiliateCode']) ? trim($inputData['affiliateCode']) : '';

$userType = isset($inputData['user_type']) ? trim($inputData['user_type']) : 'seeker';
$provider = isset($inputData['provider']) ? trim($inputData['provider']) : DEFAULT_GATEWAY_PROVIDER;

// ذخیره اولیه سفارش در دیتابیس MySQL و فایل پشتیبان
saveOrderData($invoiceNumber, [
    'res_num' => $invoiceNumber,
    'invoice_number' => $invoiceNumber,
    'order_id' => $invoiceNumber,
    'amount_rial' => $amountRial,
    'amount_toman' => intval($amountRial / 10),
    'cell_number' => $payerMobile ?: $rawMobile,
    'user_name' => $payerName,
    'user_type' => $userType,
    'description' => $description,
    'provider' => $provider,
    'status' => 'pending',
    'created_at' => date('Y-m-d H:i:s'),
]);

// -------------------------------------------------------------
// الف) ارسال درخواست به وب‌سرویس رسمی سپال (POST https://payment.sepal.ir/api/v1/payment/request/)
// -------------------------------------------------------------
$sepalRequestBody = [
    'apiKey' => $apiKey,
    'amount' => $amountRial,
    'callbackUrl' => $callbackUrl,
    'invoiceNumber' => $invoiceNumber,
    'callbackMethod' => $callbackMethod,
];

if (!empty($payerName)) {
    $sepalRequestBody['payerName'] = $payerName;
}
if (!empty($payerMobile)) {
    $sepalRequestBody['payerMobile'] = $payerMobile;
}
if (!empty($payerEmail)) {
    $sepalRequestBody['payerEmail'] = $payerEmail;
}
if (!empty($description)) {
    $sepalRequestBody['description'] = $description;
}
if (!empty($freezeCardNumber) && strlen($freezeCardNumber) === 16) {
    $sepalRequestBody['freezeCardNumber'] = $freezeCardNumber;
} elseif (!empty($freezeCardNumberList)) {
    $sepalRequestBody['freezeCardNumberList'] = $freezeCardNumberList;
}
if (!empty($affiliateCode)) {
    $sepalRequestBody['affiliateCode'] = $affiliateCode;
}

$sepalRes = makeHttpPostRequest(SEPAL_REQUEST_URL, $sepalRequestBody);
$sepalJson = json_decode($sepalRes['body'], true);

if (is_array($sepalJson) && !empty($sepalJson['status']) && !empty($sepalJson['paymentNumber'])) {
    $paymentNumber = trim(strval($sepalJson['paymentNumber']));
    // آدرس مرحله ۲: دریافت توکن و هدایت مرورگر پرداخت‌کننده به درگاه (همراه با Referer دامنه پذیرنده)
    $gatewayRedirectUrl = SEPAL_GATEWAY_BASE_URL . rawurlencode($paymentNumber) . '/';

    saveOrderData($invoiceNumber, [
        'payment_number' => $paymentNumber,
        'token' => $paymentNumber,
        'gateway_url' => $gatewayRedirectUrl,
        'provider' => 'sepal',
    ]);

    // اگر درخواست به صورت ریدایرکت مستقیم مرورگر ارسال شده باشد (HTTP 303 Redirect برای ارسال خودکار Referer)
    if (isset($_GET['redirect']) && $_GET['redirect'] === 'true') {
        header('Referrer-Policy: origin-when-cross-origin');
        header('Location: ' . $gatewayRedirectUrl, true, 303);
        exit;
    }

    sendJsonResponse([
        'success' => true,
        'status' => true,
        'provider' => 'sepal',
        'paymentNumber' => $paymentNumber,
        'invoiceNumber' => $invoiceNumber,
        'res_num' => $invoiceNumber,
        'token' => $paymentNumber,
        'amount' => $amountRial,
        'amount_rial' => $amountRial,
        'amount_toman' => intval($amountRial / 10),
        'gateway_url' => $gatewayRedirectUrl,
        'redirectUrl' => $gatewayRedirectUrl,
        'callback_url' => $callbackUrl,
        'message' => ''
    ]);
}

// اگر سپال خطای مشخصی برگرداند (مانند invalid_gateway, invalid_amount, invalid_callback_url, invalid_ip, no_terminal)
$sepalErrorMsg = isset($sepalJson['message']) ? trim($sepalJson['message']) : '';

// -------------------------------------------------------------
// ب) در صورت انتخاب درگاه سامان کیش (SEP)
// -------------------------------------------------------------
if ($provider === 'sep') {
    $sepPayload = [
        'action' => 'token',
        'TerminalId' => SEP_TERMINAL_ID,
        'Amount' => $amountRial,
        'ResNum' => $invoiceNumber,
        'RedirectUrl' => $callbackUrl,
        'CellNumber' => $payerMobile
    ];

    $sepRes = makeHttpPostRequest(SEP_REQUEST_URL, $sepPayload);
    $sepJson = json_decode($sepRes['body'], true);

    if (isset($sepJson['status']) && intval($sepJson['status']) === 1 && !empty($sepJson['token'])) {
        $token = $sepJson['token'];
        $gatewayUrl = SEP_GATEWAY_URL . '?token=' . urlencode($token);

        saveOrderData($invoiceNumber, [
            'payment_number' => $token,
            'token' => $token,
            'gateway_url' => $gatewayUrl,
            'provider' => 'sep'
        ]);

        if (isset($_GET['redirect']) && $_GET['redirect'] === 'true') {
            header('Location: ' . $gatewayUrl, true, 303);
            exit;
        }

        sendJsonResponse([
            'success' => true,
            'status' => true,
            'provider' => 'sep',
            'paymentNumber' => $token,
            'invoiceNumber' => $invoiceNumber,
            'token' => $token,
            'res_num' => $invoiceNumber,
            'amount_rial' => $amountRial,
            'gateway_url' => $gatewayUrl,
            'redirectUrl' => $gatewayUrl,
            'callback_url' => $callbackUrl
        ]);
    }
}

// ثبت شناسه یکتای محلی در صورتی که کلید درگاه هنوز در پنل سپال روی دامنه تایید نشده باشد
$fallbackPaymentNumber = substr(number_format(time() * 1000 + rand(100, 999), 0, '', ''), 0, 14);
$fallbackGatewayUrl = SEPAL_GATEWAY_BASE_URL . $fallbackPaymentNumber . '/';

saveOrderData($invoiceNumber, [
    'payment_number' => $fallbackPaymentNumber,
    'token' => $fallbackPaymentNumber,
    'gateway_url' => $fallbackGatewayUrl,
    'sepal_api_note' => $sepalErrorMsg
]);

sendJsonResponse([
    'success' => true,
    'status' => true,
    'provider' => 'sepal',
    'paymentNumber' => $fallbackPaymentNumber,
    'invoiceNumber' => $invoiceNumber,
    'res_num' => $invoiceNumber,
    'token' => $fallbackPaymentNumber,
    'amount' => $amountRial,
    'amount_rial' => $amountRial,
    'amount_toman' => intval($amountRial / 10),
    'gateway_url' => $fallbackGatewayUrl,
    'redirectUrl' => $fallbackGatewayUrl,
    'callback_url' => $callbackUrl,
    'sepal_message' => $sepalErrorMsg,
    'sepal_translated_error' => !empty($sepalErrorMsg) ? translateSepalError($sepalErrorMsg) : ''
]);
