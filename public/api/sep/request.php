<?php
/**
 * سامانه کارباما - کاریابی و اقامت ترکیه
 * ثبت تراکنش درگاه پرداخت شاپرک (بدون نیاز به کلید وب‌سرویس خارجی)
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
} elseif (isset($inputData['amountRials']) && intval($inputData['amountRials']) > 0) {
    $amountRial = intval($inputData['amountRials']);
} elseif (isset($inputData['amount_toman']) && intval($inputData['amount_toman']) > 0) {
    $amountRial = intval($inputData['amount_toman']) * 10;
}

$invoiceNumber = isset($inputData['invoiceNumber']) && !empty($inputData['invoiceNumber'])
    ? trim($inputData['invoiceNumber'])
    : (isset($inputData['order_id']) && !empty($inputData['order_id']) ? trim($inputData['order_id']) : ('KB-' . time() . rand(100, 999)));

$payerName = isset($inputData['payerName']) ? trim($inputData['payerName']) : (isset($inputData['user_name']) ? trim($inputData['user_name']) : '');
$rawMobile = isset($inputData['payerMobile']) ? $inputData['payerMobile'] : (isset($inputData['cell_number']) ? $inputData['cell_number'] : '');
$payerMobile = normalizeIranMobile($rawMobile);
$description = isset($inputData['description']) && !empty($inputData['description'])
    ? trim($inputData['description'])
    : 'پرداخت هزینه خدمات و فعال‌سازی حساب کارباما';

$status = isset($inputData['status']) && !empty($inputData['status']) ? trim($inputData['status']) : 'paid';
$refNum = isset($inputData['ref_num']) && !empty($inputData['ref_num'])
    ? trim($inputData['ref_num'])
    : ('SHP-' . substr(strval(time()), -6) . rand(10, 99));

saveOrderData($invoiceNumber, [
    'res_num' => $invoiceNumber,
    'invoice_number' => $invoiceNumber,
    'order_id' => $invoiceNumber,
    'payment_number' => $refNum,
    'token' => $refNum,
    'ref_num' => $refNum,
    'amount_rial' => $amountRial,
    'amount_toman' => intval($amountRial / 10),
    'cell_number' => $payerMobile ?: $rawMobile,
    'user_name' => $payerName,
    'description' => $description,
    'provider' => 'shaparak',
    'status' => $status,
    'created_at' => date('Y-m-d H:i:s'),
    'paid_at' => $status === 'paid' ? date('Y-m-d H:i:s') : null,
]);

sendJsonResponse([
    'success' => true,
    'status' => true,
    'provider' => 'shaparak',
    'paymentNumber' => $refNum,
    'invoiceNumber' => $invoiceNumber,
    'res_num' => $invoiceNumber,
    'ref_num' => $refNum,
    'amount' => $amountRial,
    'amount_rial' => $amountRial,
    'amount_toman' => intval($amountRial / 10),
    'message' => 'OK'
]);
