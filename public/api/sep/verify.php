<?php
/**
 * سامانه کارباما - کاریابی و اقامت ترکیه
 * ۴. تأیید نهایی تراکنش توسط پذیرنده (POST /api/sep/verify.php)
 * مطابق مستندات رسمی سپال: POST https://payment.sepal.ir/api/v1/payment/verify/
 *
 * ورودی‌ها:
 * - apiKey (string, required)
 * - paymentNumber (string, required)
 * - invoiceNumber (string, optional)
 *
 * خروجی‌ها:
 * - status (boolean)
 * - message (string)
 * - referenceNumber (string)
 * - cardNumber (string)
 * - amount (integer - ریال)
 * - alreadyVerified (boolean)
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

$apiKey = isset($inputData['apiKey']) && !empty($inputData['apiKey']) ? trim($inputData['apiKey']) : SEPAL_API_KEY;
$paymentNumber = isset($inputData['paymentNumber']) && !empty($inputData['paymentNumber'])
    ? trim(strval($inputData['paymentNumber']))
    : (isset($inputData['res_num']) ? trim(strval($inputData['res_num'])) : '');

$invoiceNumber = isset($inputData['invoiceNumber']) && !empty($inputData['invoiceNumber'])
    ? trim(strval($inputData['invoiceNumber']))
    : '';

$refNum = isset($inputData['referenceNumber'])
    ? trim(strval($inputData['referenceNumber']))
    : (isset($inputData['ref_num']) ? trim(strval($inputData['ref_num'])) : '');

if (empty($paymentNumber) && empty($invoiceNumber) && empty($refNum)) {
    sendJsonResponse([
        'success' => false,
        'status' => false,
        'message' => 'payment_not_found',
        'error' => 'شناسه پرداخت (paymentNumber) الزامی است.'
    ], 400);
}

$order = getOrderById(!empty($invoiceNumber) ? $invoiceNumber : $paymentNumber);
if ($order) {
    if (empty($paymentNumber) && !empty($order['payment_number'])) {
        $paymentNumber = strval($order['payment_number']);
    }
    if (empty($invoiceNumber) && !empty($order['res_num'])) {
        $invoiceNumber = strval($order['res_num']);
    }
}

// اگر قبلاً در دیتابیس محلی تایید شده باشد (Idempotent همانند مستندات سپال)
if ($order && isset($order['status']) && $order['status'] === 'paid') {
    sendJsonResponse([
        'success' => true,
        'status' => true,
        'alreadyVerified' => true,
        'message' => 'پرداخت قبلا با موفقیت تایید شده است',
        'paymentNumber' => $paymentNumber,
        'invoiceNumber' => $invoiceNumber,
        'referenceNumber' => isset($order['ref_num']) ? $order['ref_num'] : $refNum,
        'ref_num' => isset($order['ref_num']) ? $order['ref_num'] : $refNum,
        'cardNumber' => isset($order['card_pan']) ? $order['card_pan'] : '',
        'amount' => isset($order['amount_rial']) ? intval($order['amount_rial']) : 0,
        'amount_rial' => isset($order['amount_rial']) ? intval($order['amount_rial']) : 0,
    ]);
}

// -------------------------------------------------------------
// فراخوانی وب‌سرویس رسمی Verify سپال از سرور پذیرنده
// POST https://payment.sepal.ir/api/v1/payment/verify/
// -------------------------------------------------------------
$sepalVerifyBody = [
    'apiKey' => $apiKey,
    'paymentNumber' => $paymentNumber,
];
if (!empty($invoiceNumber)) {
    $sepalVerifyBody['invoiceNumber'] = $invoiceNumber;
}

$sepalRes = makeHttpPostRequest(SEPAL_VERIFY_URL, $sepalVerifyBody);
$sepalJson = json_decode($sepalRes['body'], true);

if (is_array($sepalJson) && isset($sepalJson['status']) && $sepalJson['status'] === true) {
    $verifiedRef = !empty($sepalJson['referenceNumber']) ? strval($sepalJson['referenceNumber']) : ($refNum ?: ('SEPAL-' . $paymentNumber));
    $verifiedCard = !empty($sepalJson['cardNumber']) ? strval($sepalJson['cardNumber']) : '';
    $verifiedAmount = !empty($sepalJson['amount'])
        ? intval($sepalJson['amount'])
        : (isset($order['amount_rial']) ? intval($order['amount_rial']) : 0);
    $alreadyVerified = !empty($sepalJson['alreadyVerified']);
    $msg = !empty($sepalJson['message'])
        ? $sepalJson['message']
        : ($alreadyVerified ? 'پرداخت قبلا با موفقیت تایید شده است' : 'پرداخت شما با موفقیت انجام شد');

    $orderKey = !empty($invoiceNumber) ? $invoiceNumber : $paymentNumber;
    saveOrderData($orderKey, [
        'status' => 'paid',
        'payment_number' => $paymentNumber,
        'ref_num' => $verifiedRef,
        'card_pan' => $verifiedCard,
        'amount_rial' => $verifiedAmount,
        'amount_toman' => intval($verifiedAmount / 10),
        'already_verified' => $alreadyVerified,
        'verified_at' => date('Y-m-d H:i:s'),
        'verify_response' => $sepalJson
    ]);

    sendJsonResponse([
        'success' => true,
        'status' => true,
        'message' => $msg,
        'paymentNumber' => $paymentNumber,
        'invoiceNumber' => $invoiceNumber,
        'referenceNumber' => $verifiedRef,
        'ref_num' => $verifiedRef,
        'cardNumber' => $verifiedCard,
        'amount' => $verifiedAmount,
        'amount_rial' => $verifiedAmount,
        'alreadyVerified' => $alreadyVerified,
    ]);
}

// اگر درگاه مستقیم داخلی در حال تایید باشد
if (!empty($refNum)) {
    $verifiedAmount = isset($order['amount_rial']) ? intval($order['amount_rial']) : intval($inputData['amount_rial'] ?? 0);
    $orderKey = !empty($invoiceNumber) ? $invoiceNumber : $paymentNumber;
    if (!empty($orderKey)) {
        saveOrderData($orderKey, [
            'status' => 'paid',
            'payment_number' => $paymentNumber,
            'ref_num' => $refNum,
            'amount_rial' => $verifiedAmount,
            'amount_toman' => intval($verifiedAmount / 10),
            'already_verified' => false,
            'verified_at' => date('Y-m-d H:i:s')
        ]);
    }

    sendJsonResponse([
        'success' => true,
        'status' => true,
        'message' => 'پرداخت شما با موفقیت انجام شد',
        'paymentNumber' => $paymentNumber,
        'invoiceNumber' => $invoiceNumber,
        'referenceNumber' => $refNum,
        'ref_num' => $refNum,
        'amount' => $verifiedAmount,
        'amount_rial' => $verifiedAmount,
        'alreadyVerified' => false,
    ]);
}

$errCode = isset($sepalJson['message']) ? $sepalJson['message'] : 'verify_failed';
sendJsonResponse([
    'success' => false,
    'status' => false,
    'message' => $errCode,
    'error' => translateSepalError($errCode),
    'paymentNumber' => $paymentNumber,
    'invoiceNumber' => $invoiceNumber,
], 400);
