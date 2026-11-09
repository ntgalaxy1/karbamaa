<?php
/**
 * سامانه کارباما - کاریابی و اقامت ترکیه
 * فایل تنظیمات درگاه پرداخت الکترونیک سامان (SEP) و سپال شاپرک
 * آدرس سایت: https://karbama34.ir
 */

// نمایش خطاهای حیاتی برای رفع اشکال (در محیط عملیاتی خاموش کنید)
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// جلوگیری از دسترسی نامعتبر
if (!defined('KARBAMA_SEP_GATEWAY')) {
    define('KARBAMA_SEP_GATEWAY', true);
}

// -------------------------------------------------------------
// تنظیمات اصلی درگاه و دامنه
// -------------------------------------------------------------
define('KARBAMA_DOMAIN', 'https://karbama34.ir');
define('KARBAMA_CALLBACK_URL', 'https://karbama34.ir/api/sep/callback.php');
define('KARBAMA_RETURN_APP_URL', 'https://karbama34.ir/#/payment-result');

// نوع درگاه پیش‌فرض: 'sep' (سامان کیش شاپرک) یا 'sepal' (سپال شاپرک)
define('DEFAULT_GATEWAY_PROVIDER', 'sep');

// اطلاعات درگاه سامان کیش (SEP)
define('SEP_TERMINAL_ID', '14589230'); // کد ترمینال درگاه سامان (از قرارداد سپ)
define('SEP_REQUEST_URL', 'https://sep.shaparak.ir/MobilePG/MobilePayment');
define('SEP_GATEWAY_URL', 'https://sep.shaparak.ir/OnlinePG/OnlinePG');
define('SEP_VERIFY_URL', 'https://sep.shaparak.ir/verifyTxnRandomSessionkey/ipg/VerifyTransaction');

// اطلاعات درگاه سپال (Sepal) به عنوان درگاه پشتیبان
define('SEPAL_API_KEY', 'KhAv64ZBs0TRkItY76JdXTqbWLWpNWP62WbI82_uF7WRhBZkrknQhWJ_8XPCT6GH9mYJ4RN2IPw3GPAPM8BbczDX_D_WM_D21iCdheiRYcKGRfUzUApcgKiDvVX3_gFFcf97acb85862596f273e16f1ad8db6be38bd1c999905e697b4dc0c83b1d37777mqbmWX2P9dGTVatC9_w3c9CpttcFTcM0is-H3hoUpDzGlBDl1-2TTJ3afXexyEHc');
define('SEPAL_UNIQUE_CODE', '2930311446');
define('SEPAL_REQUEST_URL', 'https://api.sepal.ir/v1/payment/request');
define('SEPAL_VERIFY_URL', 'https://api.sepal.ir/v1/payment/verify');

// مسیر فایل دیتابیس محلی سفارشات (بدون نیاز به نصب مای‌اس‌کیو‌ال اضافی)
define('ORDERS_DB_FILE', __DIR__ . '/orders_data.json');

// تنظیمات اختیاری دیتابیس MySQL (در صورت تمایل به ذخیره مستقیم در جدول کارباما)
define('DB_HOST', 'localhost');
define('DB_NAME', 'karbama_db');
define('DB_USER', 'karbama_user');
define('DB_PASS', '');

// -------------------------------------------------------------
// توابع کمکی
// -------------------------------------------------------------

function getOrdersData() {
    if (!file_exists(ORDERS_DB_FILE)) {
        return [];
    }
    $content = file_get_contents(ORDERS_DB_FILE);
    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

function saveOrderData($orderId, $orderInfo) {
    $orders = getOrdersData();
    $orders[$orderId] = array_merge(isset($orders[$orderId]) ? $orders[$orderId] : [], $orderInfo, [
        'updated_at' => date('Y-m-d H:i:s')
    ]);
    file_put_contents(ORDERS_DB_FILE, json_encode($orders, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    return true;
}

function getOrderById($orderId) {
    $orders = getOrdersData();
    return isset($orders[$orderId]) ? $orders[$orderId] : null;
}

function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function makeHttpPostRequest($url, $payload, $headers = []) {
    $ch = curl_init();
    $defaultHeaders = [
        'Content-Type: application/json',
        'Accept: application/json',
        'User-Agent: KarbamaPaymentClient/10.0'
    ];
    $mergedHeaders = array_merge($defaultHeaders, $headers);

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, is_array($payload) ? json_encode($payload) : $payload);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $mergedHeaders);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    return [
        'code' => $httpCode,
        'body' => $response,
        'error' => $curlError
    ];
}
