<?php
/**
 * سامانه کارباما - کاریابی و اقامت ترکیه
 * ۴. تأیید نهایی تراکنش توسط پذیرنده (POST /api/sep/verify.php)
 * مطابق مستندات رسمی سپال: POST https://payment.sepal.ir/api/v1/payment/verify/
 *
 * همراه با بررسی سخت‌گیرانه نشست ۱۲۰ ثانیه‌ای رمز دوم پویا (OTP)
 * هیچ رمز دوم ساختگی یا الکی بدون تایید واقعی سرور سپال / شاپرک پذیرفته نمی‌شود.
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

$otpSessionId = isset($inputData['otpSessionId']) ? trim(strval($inputData['otpSessionId'])) : '';
$otpCode = isset($inputData['otpCode']) ? preg_replace('/\D+/', '', strval($inputData['otpCode'])) : '';

if (empty($paymentNumber) && empty($invoiceNumber)) {
    sendJsonResponse([
        'success' => false,
        'status' => false,
        'message' => 'payment_not_found',
        'error' => 'شناسه پرداخت (paymentNumber) الزامی است.'
    ], 400);
}

// ۱. بررسی نشست ۱۲۰ ثانیه‌ای OTP در صورت ارسال از فرم درگاه
$otpFile = ORDER_STORAGE_DIR . '/otp_sessions.json';
$otpSessions = [];
if (file_exists($otpFile)) {
    $decoded = json_decode(file_get_contents($otpFile), true);
    if (is_array($decoded)) {
        $otpSessions = $decoded;
    }
}

if (!empty($otpSessionId) || !empty($otpCode)) {
    if (empty($otpSessionId) || !isset($otpSessions[$otpSessionId])) {
        sendJsonResponse([
            'success' => false,
            'status' => false,
            'sessionRevoked' => true,
            'message' => 'invalid_otp_session',
            'error' => 'نشست رمز دوم پویا یافت نشد یا منقضی شده است. لطفاً کد امنیتی جدید را وارد کرده و دکمه «دریافت رمز پویا» را بزنید.'
        ], 400);
    }

    $session = &$otpSessions[$otpSessionId];
    $nowTs = time();

    if (!empty($session['revoked']) || intval($session['attempts_remaining']) <= 0) {
        sendJsonResponse([
            'success' => false,
            'status' => false,
            'sessionRevoked' => true,
            'attemptsRemaining' => 0,
            'message' => 'otp_max_attempts',
            'error' => 'به دلیل ورود ۳ مرتبه رمز دوم نامعتبر، این رمز پویا مسدود شد. لطفاً کد امنیتی جدید را وارد کرده و رمز پویای جدید دریافت کنید.'
        ], 400);
    }

    if ($nowTs > intval($session['expires_at_ts'])) {
        $session['revoked'] = true;
        @file_put_contents($otpFile, json_encode($otpSessions, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        sendJsonResponse([
            'success' => false,
            'status' => false,
            'sessionRevoked' => true,
            'attemptsRemaining' => 0,
            'message' => 'otp_expired',
            'error' => 'مهلت ۱۲۰ ثانیه‌ای اعتبار رمز دوم پویا به پایان رسیده است (00:00). لطفاً مجدداً رمز پویا دریافت کنید.'
        ], 400);
    }

    if (strlen($otpCode) < 5 || strlen($otpCode) > 8) {
        sendJsonResponse([
            'success' => false,
            'status' => false,
            'attemptsRemaining' => intval($session['attempts_remaining']),
            'message' => 'invalid_otp_length',
            'error' => 'رمز دوم پویا باید بین ۵ تا ۸ رقم باشد.'
        ], 400);
    }
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

// اگر قبلاً در دیتابیس محلی توسط سپال تایید شده باشد
if ($order && isset($order['status']) && $order['status'] === 'paid' && !empty($order['verify_response'])) {
    sendJsonResponse([
        'success' => true,
        'status' => true,
        'alreadyVerified' => true,
        'message' => 'پرداخت قبلا با موفقیت تایید شده است',
        'paymentNumber' => $paymentNumber,
        'invoiceNumber' => $invoiceNumber,
        'referenceNumber' => isset($order['ref_num']) ? $order['ref_num'] : '',
        'ref_num' => isset($order['ref_num']) ? $order['ref_num'] : '',
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
    $verifiedRef = !empty($sepalJson['referenceNumber']) ? strval($sepalJson['referenceNumber']) : ('SEPAL-' . $paymentNumber);
    $verifiedCard = !empty($sepalJson['cardNumber']) ? strval($sepalJson['cardNumber']) : '';
    $verifiedAmount = !empty($sepalJson['amount'])
        ? intval($sepalJson['amount'])
        : (isset($order['amount_rial']) ? intval($order['amount_rial']) : 0);
    $alreadyVerified = !empty($sepalJson['alreadyVerified']);
    $msg = !empty($sepalJson['message'])
        ? $sepalJson['message']
        : ($alreadyVerified ? 'پرداخت قبلا با موفقیت تایید شده است' : 'پرداخت شما با موفقیت انجام شد');

    if (!empty($otpSessionId) && isset($otpSessions[$otpSessionId])) {
        $otpSessions[$otpSessionId]['verified'] = true;
        @file_put_contents($otpFile, json_encode($otpSessions, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

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

// در صورت عدم تایید توسط سرور رسمی سپال / شاپرک (مثلاً ورود رمز دوم الکی یا عدم تکمیل پرداخت در شاپرک)
if (!empty($otpSessionId) && isset($otpSessions[$otpSessionId])) {
    $remaining = max(0, intval($otpSessions[$otpSessionId]['attempts_remaining']) - 1);
    $otpSessions[$otpSessionId]['attempts_remaining'] = $remaining;
    if ($remaining <= 0) {
        $otpSessions[$otpSessionId]['revoked'] = true;
    }
    @file_put_contents($otpFile, json_encode($otpSessions, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    $revoked = ($remaining <= 0);
    $errMsg = $revoked
        ? 'رمز دوم پویا (OTP) وارد شده نادرست است. به دلیل ۳ بار تلاش ناموفق، این رمز مسدود شد؛ لطفاً کد امنیتی جدید را وارد کرده و مجدداً رمز پویا دریافت کنید.'
        : 'رمز دوم پویا (OTP) وارد شده نادرست است و توسط بانک صادرکننده / شاپرک تایید نشد. (تلاش باقی‌مانده: ' . $remaining . ' از ۳)';

    sendJsonResponse([
        'success' => false,
        'status' => false,
        'attemptsRemaining' => $remaining,
        'sessionRevoked' => $revoked,
        'message' => 'invalid_otp',
        'error' => $errMsg,
        'paymentNumber' => $paymentNumber,
        'invoiceNumber' => $invoiceNumber,
    ], 400);
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
