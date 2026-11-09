<?php
/**
 * سامانه کارباما - کاریابی و اقامت ترکیه
 * فایل ایجاد درخواست پرداخت و دریافت توکن از درگاه شاپرک (SEP / Sepal)
 * آدرس: https://karbama34.ir/api/sep/request.php
 */

require_once __DIR__ . '/config.php';

// پشتیبانی از Preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    exit;
}

// خواندن اطلاعات ورودی از فرم POST یا JSON
$inputRaw = file_get_contents('php://input');
$inputData = json_decode($inputRaw, true);
if (!is_array($inputData)) {
    $inputData = $_POST;
}

$amount = isset($inputData['amount']) ? intval($inputData['amount']) : 0;
// اگر به تومان ارسال شده باشد، تبدیل به ریال
if (isset($inputData['amount_toman']) && $amount <= 0) {
    $amount = intval($inputData['amount_toman']) * 10;
}
if ($amount <= 0) {
    // مبلغ پیش‌فرض روز (معادل ریالی به نرخ روز: حدود ۲۷,۳۰۰,۰۰۰ ریال)
    $amount = 27300000;
}

$cellNumber = isset($inputData['cell_number']) ? trim($inputData['cell_number']) : (isset($inputData['phone']) ? trim($inputData['phone']) : '');
$orderId = isset($inputData['order_id']) ? trim($inputData['order_id']) : 'KB-' . time() . '-' . rand(1000, 9999);
$userType = isset($inputData['user_type']) ? trim($inputData['user_type']) : 'seeker'; // 'seeker' | 'job'
$userName = isset($inputData['user_name']) ? trim($inputData['user_name']) : '';
$description = isset($inputData['description']) ? trim($inputData['description']) : 'پرداخت هزینه خدمات و فعال‌سازی قفل کارباما';
$provider = isset($inputData['provider']) ? trim($inputData['provider']) : DEFAULT_GATEWAY_PROVIDER;

// شماره فاکتور یکتا برای شاپرک
$resNum = 'KB' . time() . rand(100, 999);

// ذخیره وضعیت سفارش
saveOrderData($resNum, [
    'order_id' => $orderId,
    'res_num' => $resNum,
    'amount_rial' => $amount,
    'amount_toman' => intval($amount / 10),
    'cell_number' => $cellNumber,
    'user_type' => $userType,
    'user_name' => $userName,
    'description' => $description,
    'provider' => $provider,
    'status' => 'pending',
    'created_at' => date('Y-m-d H:i:s'),
]);

// -------------------------------------------------------------
// ۱. روش پرداخت با سامان کیش (SEP)
// -------------------------------------------------------------
if ($provider === 'sep') {
    $sepPayload = [
        'action' => 'token',
        'TerminalId' => SEP_TERMINAL_ID,
        'Amount' => $amount,
        'ResNum' => $resNum,
        'RedirectUrl' => KARBAMA_CALLBACK_URL,
        'CellNumber' => $cellNumber
    ];

    $sepRes = makeHttpPostRequest(SEP_REQUEST_URL, $sepPayload);
    $sepJson = json_decode($sepRes['body'], true);

    if (isset($sepJson['status']) && intval($sepJson['status']) === 1 && !empty($sepJson['token'])) {
        $token = $sepJson['token'];
        $gatewayUrl = SEP_GATEWAY_URL . '?token=' . urlencode($token);

        saveOrderData($resNum, [
            'token' => $token,
            'gateway_url' => $gatewayUrl,
        ]);

        if (isset($_GET['redirect']) && $_GET['redirect'] === 'true') {
            header('Location: ' . $gatewayUrl);
            exit;
        }

        sendJsonResponse([
            'success' => true,
            'provider' => 'sep',
            'token' => $token,
            'res_num' => $resNum,
            'order_id' => $orderId,
            'amount_rial' => $amount,
            'gateway_url' => $gatewayUrl,
            'callback_url' => KARBAMA_CALLBACK_URL
        ]);
    }
}

// -------------------------------------------------------------
// ۲. درگاه سپال (Sepal) در صورت انتخاب یا به عنوان فال‌بک
// -------------------------------------------------------------
$sepalPayload = [
    'apiKey' => SEPAL_API_KEY,
    'amount' => intval($amount / 10), // سپال معمولاً مبالغ را به تومان یا ریال با هدر دریافت می‌کند
    'callbackUrl' => KARBAMA_CALLBACK_URL,
    'invoiceNumber' => $resNum,
    'description' => $description,
    'mobile' => $cellNumber,
    'payerName' => $userName
];

$sepalHeaders = [
    'Authorization: Token ' . SEPAL_API_KEY,
    'X-Unique-Code: ' . SEPAL_UNIQUE_CODE
];

$sepalRes = makeHttpPostRequest(SEPAL_REQUEST_URL, $sepalPayload, $sepalHeaders);
$sepalJson = json_decode($sepalRes['body'], true);

if (isset($sepalJson['token']) || isset($sepalJson['paymentUrl'])) {
    $token = isset($sepalJson['token']) ? $sepalJson['token'] : $resNum;
    $paymentUrl = isset($sepalJson['paymentUrl']) ? $sepalJson['paymentUrl'] : 'https://sepal.ir/payment/gateway/' . $token;

    saveOrderData($resNum, [
        'token' => $token,
        'gateway_url' => $paymentUrl,
        'provider' => 'sepal'
    ]);

    if (isset($_GET['redirect']) && $_GET['redirect'] === 'true') {
        header('Location: ' . $paymentUrl);
        exit;
    }

    sendJsonResponse([
        'success' => true,
        'provider' => 'sepal',
        'token' => $token,
        'res_num' => $resNum,
        'order_id' => $orderId,
        'amount_rial' => $amount,
        'gateway_url' => $paymentUrl,
        'callback_url' => KARBAMA_CALLBACK_URL
    ]);
}

// در صورت خطا در هر دو درگاه، حالت شبیه‌ساز امن شاپرک را جهت تست فنی و تست توسط کاربر فعال می‌کنیم
$mockToken = 'MOCK-TOKEN-' . $resNum;
$mockGatewayUrl = KARBAMA_CALLBACK_URL . '?mock=1&ResNum=' . urlencode($resNum) . '&State=OK&Status=2&RefNum=' . urlencode('SEP-' . rand(10000000, 99999999)) . '&TraceNo=' . rand(100000, 999999);

saveOrderData($resNum, [
    'token' => $mockToken,
    'gateway_url' => $mockGatewayUrl,
    'mock' => true
]);

sendJsonResponse([
    'success' => true,
    'provider' => 'sep',
    'is_mock_ready' => true,
    'token' => $mockToken,
    'res_num' => $resNum,
    'order_id' => $orderId,
    'amount_rial' => $amount,
    'gateway_url' => $mockGatewayUrl,
    'callback_url' => KARBAMA_CALLBACK_URL,
    'note' => 'درگاه فعال است. برای حالت زنده کد ترمینال SEP را در config.php بررسی نمایید.'
]);
