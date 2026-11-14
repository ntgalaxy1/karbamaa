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
        'isLiveToken' => false,
        'message' => 'invalid_amount',
        'error' => 'مبلغ تراکنش به ریال نباید کمتر از ۱۰۰,۰۰۰ ریال (۱۰,۰۰۰ تومان) باشد.'
    ], 400);
}

if ($amountRial <= 0) {
    $amountRial = 27300000; // مبلغ پیش‌فرض به ریال
}

// ۲. پارامترهای ورودی مطابق جدول مستندات سپال
$serverConfiguredKey = getConfiguredSepalApiKey();
$requestedApiKey = isset($inputData['apiKey']) && !empty($inputData['apiKey']) ? trim(strval($inputData['apiKey'])) : '';

// اگر کلید جدیدی توسط کاربر/مدیر ارسال شده باشد، اولویت با آن است و در صورت موفقیت روی سرور ذخیره می‌شود
$apiKey = !empty($requestedApiKey) ? $requestedApiKey : $serverConfiguredKey;

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
function buildSepalRequestBody($keyToUse, $amountRial, $callbackUrl, $invoiceNumber, $callbackMethod, $payerName, $payerMobile, $payerEmail, $description, $freezeCardNumber, $freezeCardNumberList, $affiliateCode) {
    $body = [
        'apiKey' => $keyToUse,
        'amount' => $amountRial,
        'callbackUrl' => $callbackUrl,
        'invoiceNumber' => $invoiceNumber,
        'callbackMethod' => $callbackMethod,
    ];
    if (!empty($payerName)) $body['payerName'] = $payerName;
    if (!empty($payerMobile)) $body['payerMobile'] = $payerMobile;
    if (!empty($payerEmail)) $body['payerEmail'] = $payerEmail;
    if (!empty($description)) $body['description'] = $description;
    if (!empty($freezeCardNumber) && strlen($freezeCardNumber) === 16) {
        $body['freezeCardNumber'] = $freezeCardNumber;
    } elseif (!empty($freezeCardNumberList)) {
        $body['freezeCardNumberList'] = $freezeCardNumberList;
    }
    if (!empty($affiliateCode)) $body['affiliateCode'] = $affiliateCode;
    return $body;
}

$sepalRequestBody = buildSepalRequestBody($apiKey, $amountRial, $callbackUrl, $invoiceNumber, $callbackMethod, $payerName, $payerMobile, $payerEmail, $description, $freezeCardNumber, $freezeCardNumberList, $affiliateCode);
$sepalRes = makeHttpPostRequest(SEPAL_REQUEST_URL, $sepalRequestBody);
$sepalJson = json_decode($sepalRes['body'], true);

// اگر کلید ارسالی از مرورگر قدیمی بود ولی کلید ذخیره‌شده روی سرور متفاوت است، کلید سرور را نیز امتحان کن
if ((!is_array($sepalJson) || empty($sepalJson['status'])) && !empty($serverConfiguredKey) && $serverConfiguredKey !== $apiKey) {
    $retryBody = buildSepalRequestBody($serverConfiguredKey, $amountRial, $callbackUrl, $invoiceNumber, $callbackMethod, $payerName, $payerMobile, $payerEmail, $description, $freezeCardNumber, $freezeCardNumberList, $affiliateCode);
    $retryRes = makeHttpPostRequest(SEPAL_REQUEST_URL, $retryBody);
    $retryJson = json_decode($retryRes['body'], true);
    if (is_array($retryJson) && !empty($retryJson['status']) && !empty($retryJson['paymentNumber'])) {
        $sepalJson = $retryJson;
        $apiKey = $serverConfiguredKey;
    }
}

if (is_array($sepalJson) && !empty($sepalJson['status']) && !empty($sepalJson['paymentNumber'])) {
    // اگر کلید جدیدی ارسال شده بود که کار کرد، آن را برای تمام کاربران ذخیره کن
    if (!empty($requestedApiKey) && $requestedApiKey === $apiKey) {
        saveConfiguredSepalApiKey($apiKey);
    }

    $paymentNumber = trim(strval($sepalJson['paymentNumber']));
    // آدرس مرحله ۲: دریافت توکن و هدایت مرورگر پرداخت‌کننده به درگاه (همراه با Referer دامنه پذیرنده)
    $gatewayRedirectUrl = SEPAL_GATEWAY_BASE_URL . rawurlencode($paymentNumber) . '/';

    saveOrderData($invoiceNumber, [
        'payment_number' => $paymentNumber,
        'token' => $paymentNumber,
        'gateway_url' => $gatewayRedirectUrl,
        'provider' => 'sepal',
        'sepal_api_note' => 'OK'
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
        'isLiveToken' => true,
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
// توجه بسیار مهم: هرگز paymentNumber جعلی ساخته نمی‌شود تا کاربر به صفحه «پرداخت یافت نشد» هدایت نشود!
$sepalErrorMsg = isset($sepalJson['message']) && !empty($sepalJson['message'])
    ? trim(strval($sepalJson['message']))
    : (!empty($sepalRes['error']) ? ('خطای ارتباط شبکه با سرور سپال: ' . $sepalRes['error']) : 'invalid_gateway');

$serverIp = isset($_SERVER['SERVER_ADDR']) ? $_SERVER['SERVER_ADDR'] : '';

saveOrderData($invoiceNumber, [
    'payment_number' => '',
    'token' => '',
    'gateway_url' => '',
    'sepal_api_note' => $sepalErrorMsg
]);

sendJsonResponse([
    'success' => false,
    'status' => false,
    'isLiveToken' => false,
    'provider' => 'sepal',
    'paymentNumber' => '',
    'invoiceNumber' => $invoiceNumber,
    'res_num' => $invoiceNumber,
    'token' => '',
    'amount' => $amountRial,
    'amount_rial' => $amountRial,
    'amount_toman' => intval($amountRial / 10),
    'gateway_url' => '',
    'redirectUrl' => '',
    'callback_url' => $callbackUrl,
    'server_ip' => $serverIp,
    'sepal_message' => $sepalErrorMsg,
    'sepal_translated_error' => translateSepalError($sepalErrorMsg),
    'error' => translateSepalError($sepalErrorMsg)
]);
