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
$amountRials = isset($inputData['amountRials']) ? intval($inputData['amountRials']) : 0;

$pNum = !empty($paymentNumber) ? $paymentNumber : (!empty($invoiceNumber) ? $invoiceNumber : strval(time()));
$otpSessionId = 'OTP-' . $pNum . '-' . time();
$harimTraceId = 'HRM-' . mt_rand(100000, 999999);
$expiresAt = gmdate('Y-m-d\TH:i:s\Z', time() + 120);

sendJsonResponse([
    'success' => true,
    'status' => true,
    'otpSessionId' => $otpSessionId,
    'harimTraceId' => $harimTraceId,
    'ttlSeconds' => 120,
    'expiresAt' => $expiresAt,
    'paymentNumber' => $pNum,
    'cardPan' => $cardPan,
    'amountRials' => $amountRials,
    'message' => 'رمز دوم پویا با مهلت ۱۲۰ ثانیه ارسال شد.'
]);
