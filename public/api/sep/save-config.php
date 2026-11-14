<?php
/**
 * سامانه کارباما - ذخیره دائمی کلید وب‌سرویس درگاه سپال (apiKey) روی سرور هاست
 * POST /api/sep/save-config.php
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

$apiKey = isset($inputData['sepalApiKey']) ? trim(strval($inputData['sepalApiKey'])) : (isset($inputData['apiKey']) ? trim(strval($inputData['apiKey'])) : '');
$uniqueCode = isset($inputData['sepalUniqueCode']) ? trim(strval($inputData['sepalUniqueCode'])) : '';

if (empty($apiKey)) {
    sendJsonResponse([
        'success' => false,
        'status' => false,
        'error' => 'کلید وب‌سرویس درگاه سپال (apiKey) ارسال نشده است.'
    ], 400);
}

saveConfiguredSepalApiKey($apiKey, $uniqueCode);

sendJsonResponse([
    'success' => true,
    'status' => true,
    'message' => 'کلید وب‌سرویس درگاه سپال با موفقیت روی سرور ذخیره شد.',
    'sepalApiKey' => $apiKey
]);
