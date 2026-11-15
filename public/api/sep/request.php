<?php
/**
 * سامانه کارباما - کاریابی و اقامت ترکیه
 * ۱. دریافت توکن رسمی از درگاه پرداخت الکترونیک سامان کیش (SEP - شاپرک)
 * شماره ترمینال (TerminalId): 21696637
 * آدرس وب‌سرویس توکن شاپرک سامان: https://sep.shaparak.ir/onlinepg/onlinepg
 * آدرس انتقال کاربر به درگاه شاپرک: https://sep.shaparak.ir/OnlinePG/SendToken?token={TOKEN}
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    exit;
}

$inputRaw = file_get_contents('php://input');
$inputData = json_decode($inputRaw, true);
if (!is_array($inputData)) {
    $inputData = array_merge($_GET, $_POST);
}

$amountRial = 27300000;
if (isset($inputData['amount']) && intval($inputData['amount']) > 0) {
    $amountRial = intval($inputData['amount']);
} elseif (isset($inputData['Amount']) && intval($inputData['Amount']) > 0) {
    $amountRial = intval($inputData['Amount']);
} elseif (isset($inputData['amountRials']) && intval($inputData['amountRials']) > 0) {
    $amountRial = intval($inputData['amountRials']);
} elseif (isset($inputData['amount_toman']) && intval($inputData['amount_toman']) > 0) {
    $amountRial = intval($inputData['amount_toman']) * 10;
}

$terminalId = isset($inputData['terminalId']) && !empty($inputData['terminalId'])
    ? trim(strval($inputData['terminalId']))
    : (isset($inputData['TerminalId']) && !empty($inputData['TerminalId'])
        ? trim(strval($inputData['TerminalId']))
        : SEP_TERMINAL_ID);

$invoiceNumber = isset($inputData['invoiceNumber']) && !empty($inputData['invoiceNumber'])
    ? trim(strval($inputData['invoiceNumber']))
    : (isset($inputData['ResNum']) && !empty($inputData['ResNum'])
        ? trim(strval($inputData['ResNum']))
        : (isset($inputData['order_id']) && !empty($inputData['order_id'])
            ? trim(strval($inputData['order_id']))
            : ('KB' . time() . rand(100, 999))));

$callbackUrl = isset($inputData['callbackUrl']) && !empty($inputData['callbackUrl'])
    ? trim(strval($inputData['callbackUrl']))
    : (isset($inputData['RedirectUrl']) && !empty($inputData['RedirectUrl'])
        ? trim(strval($inputData['RedirectUrl']))
        : KARBAMA_CALLBACK_URL);

$payerName = isset($inputData['payerName'])
    ? trim(strval($inputData['payerName']))
    : (isset($inputData['user_name']) ? trim(strval($inputData['user_name'])) : '');

$rawMobile = isset($inputData['payerMobile'])
    ? $inputData['payerMobile']
    : (isset($inputData['CellNumber'])
        ? $inputData['CellNumber']
        : (isset($inputData['cell_number']) ? $inputData['cell_number'] : ''));

$payerMobile = normalizeIranMobile($rawMobile);
$description = isset($inputData['description']) && !empty($inputData['description'])
    ? trim(strval($inputData['description']))
    : 'پرداخت هزینه خدمات و فعال‌سازی حساب کارباما';

// اگر تراکنش مستقیماً ثبت شده باشد
if (isset($inputData['status']) && $inputData['status'] === 'paid') {
    $refNum = isset($inputData['ref_num']) && !empty($inputData['ref_num'])
        ? trim(strval($inputData['ref_num']))
        : ('SEP-' . substr(strval(time()), -8));

    saveOrderData($invoiceNumber, [
        'res_num' => $invoiceNumber,
        'invoice_number' => $invoiceNumber,
        'order_id' => $invoiceNumber,
        'payment_number' => $refNum,
        'token' => $refNum,
        'ref_num' => $refNum,
        'trace_no' => isset($inputData['trace_no']) ? strval($inputData['trace_no']) : '',
        'card_pan' => isset($inputData['card_pan']) ? strval($inputData['card_pan']) : '',
        'amount_rial' => $amountRial,
        'amount_toman' => intval($amountRial / 10),
        'cell_number' => $payerMobile ?: $rawMobile,
        'user_name' => $payerName,
        'description' => $description,
        'provider' => 'sep',
        'terminal_id' => $terminalId,
        'status' => 'paid',
        'created_at' => date('Y-m-d H:i:s'),
        'verified_at' => date('Y-m-d H:i:s'),
    ]);

    sendJsonResponse([
        'success' => true,
        'status' => true,
        'provider' => 'sep',
        'terminalId' => $terminalId,
        'paymentNumber' => $refNum,
        'invoiceNumber' => $invoiceNumber,
        'res_num' => $invoiceNumber,
        'ref_num' => $refNum,
        'amount' => $amountRial,
        'amount_rial' => $amountRial,
        'amount_toman' => intval($amountRial / 10),
        'message' => 'OK'
    ]);
}

// -------------------------------------------------------------
// درخواست توکن رسمی از درگاه پرداخت الکترونیک سامان کیش (SEP)
// POST https://sep.shaparak.ir/onlinepg/onlinepg
// -------------------------------------------------------------
$sepPayload = [
    'action' => 'token',
    'TerminalId' => $terminalId,
    'Amount' => $amountRial,
    'ResNum' => $invoiceNumber,
    'RedirectUrl' => $callbackUrl,
];
if (!empty($payerMobile)) {
    $sepPayload['CellNumber'] = $payerMobile;
}

$sepRes = makeHttpPostRequest(SEP_TOKEN_URL, $sepPayload);
$sepJson = json_decode($sepRes['body'], true);

// در صورت عدم پاسخ از آدرس اول، تلاش با آدرس دوم وب‌سرویس توکن سامان
if (!is_array($sepJson) || (!isset($sepJson['token']) && !isset($sepJson['status']))) {
    $sepRes = makeHttpPostRequest(SEP_REQUEST_URL, $sepPayload);
    $sepJson = json_decode($sepRes['body'], true);
}

$sepToken = '';
$sepErrorCode = '';
$sepErrorDesc = '';

if (is_array($sepJson)) {
    if (isset($sepJson['status']) && intval($sepJson['status']) === 1 && !empty($sepJson['token'])) {
        $sepToken = trim(strval($sepJson['token']));
    } elseif (!empty($sepJson['token'])) {
        $sepToken = trim(strval($sepJson['token']));
    } else {
        $sepErrorCode = isset($sepJson['errorCode']) ? strval($sepJson['errorCode']) : '';
        $sepErrorDesc = isset($sepJson['errorDesc']) ? strval($sepJson['errorDesc']) : '';
    }
}

// ذخیره سفارش در دیتابیس
saveOrderData($invoiceNumber, [
    'res_num' => $invoiceNumber,
    'invoice_number' => $invoiceNumber,
    'order_id' => $invoiceNumber,
    'payment_number' => $sepToken ?: $invoiceNumber,
    'token' => $sepToken,
    'amount_rial' => $amountRial,
    'amount_toman' => intval($amountRial / 10),
    'cell_number' => $payerMobile ?: $rawMobile,
    'user_name' => $payerName,
    'description' => $description,
    'provider' => 'sep',
    'terminal_id' => $terminalId,
    'status' => 'pending',
    'created_at' => date('Y-m-d H:i:s'),
]);

if (!empty($sepToken)) {
    $redirectUrl = SEP_SEND_TOKEN_URL . '?token=' . urlencode($sepToken);
    if ((isset($_GET['redirect']) && $_GET['redirect'] === 'true') || (!empty($inputData['redirect']) && $inputData['redirect'] === true)) {
        header('Location: ' . $redirectUrl, true, 303);
        exit;
    }

    sendJsonResponse([
        'success' => true,
        'status' => true,
        'isLiveToken' => true,
        'provider' => 'sep',
        'terminalId' => $terminalId,
        'token' => $sepToken,
        'paymentNumber' => $sepToken,
        'invoiceNumber' => $invoiceNumber,
        'res_num' => $invoiceNumber,
        'amount' => $amountRial,
        'amount_rial' => $amountRial,
        'amount_toman' => intval($amountRial / 10),
        'redirectUrl' => $redirectUrl,
        'gateway_url' => SEP_GATEWAY_URL,
        'callbackUrl' => $callbackUrl,
        'message' => 'توکن درگاه شاپرک سامان با موفقیت دریافت شد.'
    ]);
}

// اگر سرور شاپرک به دلیل IP یا دامنه، توکن صادر نکرد، جزئیات دقیق را برمی‌گردانیم
sendJsonResponse([
    'success' => false,
    'status' => false,
    'isLiveToken' => false,
    'provider' => 'sep',
    'terminalId' => $terminalId,
    'token' => '',
    'paymentNumber' => $invoiceNumber,
    'invoiceNumber' => $invoiceNumber,
    'res_num' => $invoiceNumber,
    'amount' => $amountRial,
    'amount_rial' => $amountRial,
    'amount_toman' => intval($amountRial / 10),
    'gateway_url' => SEP_GATEWAY_URL,
    'callbackUrl' => $callbackUrl,
    'sep_error_code' => $sepErrorCode,
    'sep_error_desc' => $sepErrorDesc ?: ($sepRes['error'] ?: 'عدم دریافت توکن از سرور شاپرک سامان (بررسی تطابق IP سرور هاست با ترمینال 21696637 در پنل سامان کیش)'),
    'message' => $sepErrorDesc ?: 'خطا در دریافت توکن از شاپرک سامان'
]);
