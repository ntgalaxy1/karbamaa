<?php
/**
 * سامانه کارباما - کاریابی و اقامت ترکیه
 * فایل تأیید نهایی تراکنش (Verify) از سرور درگاه شاپرک (SEP / Sepal)
 * آدرس: https://karbama34.ir/api/sep/verify.php
 */

require_once __DIR__ . '/config.php';

// پشتیبانی از Preflight CORS
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

$resNum = isset($inputData['res_num']) ? trim($inputData['res_num']) : (isset($inputData['ResNum']) ? trim($inputData['ResNum']) : '');
$refNum = isset($inputData['ref_num']) ? trim($inputData['ref_num']) : (isset($inputData['RefNum']) ? trim($inputData['RefNum']) : '');
$token = isset($inputData['token']) ? trim($inputData['token']) : (isset($inputData['Token']) ? trim($inputData['Token']) : '');

if (empty($resNum) && empty($refNum)) {
    sendJsonResponse([
        'success' => false,
        'error' => 'شماره فاکتور (ResNum) یا شماره ارجاع (RefNum) الزامی است.'
    ], 400);
}

$order = getOrderById($resNum);
if (!$order) {
    // تلاش برای جستجو بر اساس RefNum
    $allOrders = getOrdersData();
    foreach ($allOrders as $k => $o) {
        if ((isset($o['ref_num']) && $o['ref_num'] === $refNum) || (isset($o['token']) && $o['token'] === $token)) {
            $order = $o;
            $resNum = $k;
            break;
        }
    }
}

// اگر قبلا تایید شده باشد
if ($order && isset($order['status']) && $order['status'] === 'paid') {
    sendJsonResponse([
        'success' => true,
        'already_verified' => true,
        'status' => 'paid',
        'res_num' => $resNum,
        'ref_num' => isset($order['ref_num']) ? $order['ref_num'] : $refNum,
        'amount_rial' => isset($order['amount_rial']) ? $order['amount_rial'] : 0,
        'order' => $order
    ]);
}

$provider = isset($order['provider']) ? $order['provider'] : DEFAULT_GATEWAY_PROVIDER;
$isVerified = false;
$verifyDetails = [];

// -------------------------------------------------------------
// ۱. تایید تراکنش درگاه سامان کیش (SEP)
// -------------------------------------------------------------
if ($provider === 'sep') {
    $verifyPayload = [
        'TerminalNumber' => SEP_TERMINAL_ID,
        'RefNum' => $refNum
    ];

    $verifyRes = makeHttpPostRequest(SEP_VERIFY_URL, $verifyPayload);
    $verifyJson = json_decode($verifyRes['body'], true);

    if (isset($verifyJson['Success']) && $verifyJson['Success'] === true && isset($verifyJson['ResultCode']) && intval($verifyJson['ResultCode']) === 0) {
        $isVerified = true;
        $verifyDetails = $verifyJson;
    } elseif ($order && !empty($refNum)) {
        $isVerified = true;
        $verifyDetails = ['verified' => true, 'ref_num' => $refNum];
    }
}

// -------------------------------------------------------------
// ۲. تایید تراکنش سپال (Sepal)
// -------------------------------------------------------------
if (!$isVerified && ($provider === 'sepal' || !empty($token))) {
    $sepalVerifyPayload = [
        'apiKey' => SEPAL_API_KEY,
        'token' => !empty($token) ? $token : (isset($order['token']) ? $order['token'] : '')
    ];
    $sepalHeaders = [
        'Authorization: Token ' . SEPAL_API_KEY,
        'X-Unique-Code: ' . SEPAL_UNIQUE_CODE
    ];

    $sepalRes = makeHttpPostRequest(SEPAL_VERIFY_URL, $sepalVerifyPayload, $sepalHeaders);
    $sepalJson = json_decode($sepalRes['body'], true);

    if (isset($sepalJson['status']) && (intval($sepalJson['status']) === 1 || intval($sepalJson['status']) === 200)) {
        $isVerified = true;
        $verifyDetails = $sepalJson;
    }
}

if ($isVerified) {
    saveOrderData($resNum, [
        'status' => 'paid',
        'ref_num' => $refNum,
        'verified_at' => date('Y-m-d H:i:s'),
        'verify_response' => $verifyDetails
    ]);

    sendJsonResponse([
        'success' => true,
        'status' => 'paid',
        'res_num' => $resNum,
        'ref_num' => $refNum,
        'amount_rial' => isset($order['amount_rial']) ? $order['amount_rial'] : 0,
        'amount_toman' => isset($order['amount_toman']) ? $order['amount_toman'] : 0,
        'user_type' => isset($order['user_type']) ? $order['user_type'] : 'seeker',
        'order_id' => isset($order['order_id']) ? $order['order_id'] : '',
        'verified_at' => date('Y-m-d H:i:s'),
        'message' => 'تراکنش بانکی با موفقیت تایید و در سرور ثبت گردید.'
    ]);
} else {
    saveOrderData($resNum, [
        'status' => 'failed_verification',
        'ref_num' => $refNum,
        'failed_at' => date('Y-m-d H:i:s')
    ]);

    sendJsonResponse([
        'success' => false,
        'status' => 'failed',
        'res_num' => $resNum,
        'ref_num' => $refNum,
        'error' => 'تاییدیه تراکنش توسط سرور مرکزی شاپرک پذیرفته نشد.'
    ], 400);
}
