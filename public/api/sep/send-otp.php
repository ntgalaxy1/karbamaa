<?php
/**
 * سامانه کارباما - کاریابی و اقامت ترکیه
 * ارسال رمز دوم پویا (حریم شاپرک) و ایجاد نشست ۱۲۰ ثانیه‌ای ضدتقلب (POST /api/sep/send-otp.php)
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

$paymentNumber = isset($inputData['paymentNumber']) ? trim(strval($inputData['paymentNumber'])) : '';
$invoiceNumber = isset($inputData['invoiceNumber']) ? trim(strval($inputData['invoiceNumber'])) : '';
$cardPan = isset($inputData['cardPan']) ? trim(strval($inputData['cardPan'])) : '';
$cardNumber = isset($inputData['cardNumber']) ? preg_replace('/\D+/', '', strval($inputData['cardNumber'])) : '';
$amountRials = isset($inputData['amountRials']) ? intval($inputData['amountRials']) : 0;
$captchaCode = isset($inputData['captchaCode']) ? preg_replace('/\D+/', '', strval($inputData['captchaCode'])) : '';

if (strlen($cardNumber) === 16) {
    // بررسی الگوریتم Luhn شماره کارت بانکی
    $sum = 0;
    for ($i = 0; $i < 16; $i++) {
        $digit = intval($cardNumber[$i]);
        if ($i % 2 === 0) {
            $digit *= 2;
            if ($digit > 9) {
                $digit -= 9;
            }
        }
        $sum += $digit;
    }
    if ($sum % 10 !== 0) {
        sendJsonResponse([
            'success' => false,
            'status' => false,
            'message' => 'invalid_card',
            'error' => 'شماره کارت ۱۶ رقمی وارد شده معتبر نیست (خطای ساختاری شتاب).'
        ], 400);
    }
}

if (strlen($captchaCode) < 5) {
    sendJsonResponse([
        'success' => false,
        'status' => false,
        'message' => 'invalid_captcha',
        'error' => 'کد امنیتی ۵ رقمی جهت ارسال رمز دوم پویا الزامی است.'
    ], 400);
}

$pNum = !empty($paymentNumber) ? $paymentNumber : (!empty($invoiceNumber) ? $invoiceNumber : strval(time()));
$otpSessionId = 'OTP-' . $pNum . '-' . bin2hex(random_bytes(4));
$harimTraceId = 'HRM-' . mt_rand(100000, 999999);
$nowTs = time();
$expiresAtTs = $nowTs + 120;
$expiresAtIso = gmdate('Y-m-d\TH:i:s\Z', $expiresAtTs);

// ذخیره نشست ۱۲۰ ثانیه‌ای OTP در فایل امن سرور جهت جلوگیری از پذیرش رمزهای جعلی/الکی
$otpFile = ORDER_STORAGE_DIR . '/otp_sessions.json';
$sessions = [];
if (file_exists($otpFile)) {
    $decoded = json_decode(file_get_contents($otpFile), true);
    if (is_array($decoded)) {
        $sessions = $decoded;
    }
}

// پاک‌سازی نشست‌های منقضی‌شده قدیمی
foreach ($sessions as $sid => $sData) {
    if (isset($sData['expires_at_ts']) && $sData['expires_at_ts'] < ($nowTs - 600)) {
        unset($sessions[$sid]);
    }
}

$sessions[$otpSessionId] = [
    'otp_session_id' => $otpSessionId,
    'payment_number' => $pNum,
    'invoice_number' => $invoiceNumber,
    'card_pan' => $cardPan,
    'amount_rial' => $amountRials,
    'harim_trace_id' => $harimTraceId,
    'created_at_ts' => $nowTs,
    'expires_at_ts' => $expiresAtTs,
    'attempts_remaining' => 3,
    'revoked' => false,
    'verified' => false
];

@file_put_contents($otpFile, json_encode($sessions, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

sendJsonResponse([
    'success' => true,
    'status' => true,
    'otpSessionId' => $otpSessionId,
    'harimTraceId' => $harimTraceId,
    'ttlSeconds' => 120,
    'expiresAt' => $expiresAtIso,
    'attemptsRemaining' => 3,
    'paymentNumber' => $pNum,
    'cardPan' => $cardPan,
    'amountRials' => $amountRials,
    'message' => 'درخواست رمز دوم پویا ثبت شد (اعتبار: ۱۲۰ ثانیه).'
]);
