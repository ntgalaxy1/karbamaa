<?php
/**
 * سامانه کارباما - کاریابی و اقامت ترکیه
 * فایل تنظیمات درگاه پرداخت الکترونیک سامان (SEP) و دیتابیس MySQL
 * آدرس سایت: https://karbama34.ir
 * آدرس بازگشت شاپرک: https://karbama34.ir/api/sep/callback.php
 */

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

if (!defined('KARBAMA_SEP_GATEWAY')) {
    define('KARBAMA_SEP_GATEWAY', true);
}

// -------------------------------------------------------------
// تنظیمات اصلی درگاه پرداخت و دامنه کارباما
// -------------------------------------------------------------
define('KARBAMA_DOMAIN', 'https://karbama34.ir');
define('KARBAMA_CALLBACK_URL', 'https://karbama34.ir/api/sep/callback.php');
define('KARBAMA_RETURN_APP_URL', 'https://karbama34.ir/#/payment-result');

// نوع درگاه پیش‌فرض: 'sep' (سامان کیش شاپرک) یا 'sepal' (سپال شاپرک)
define('DEFAULT_GATEWAY_PROVIDER', 'sep');

// اطلاعات درگاه سامان کیش (SEP)
define('SEP_TERMINAL_ID', '14589230'); // کد ترمینال درگاه سامان (از پنل سامان کیش)
define('SEP_REQUEST_URL', 'https://sep.shaparak.ir/MobilePG/MobilePayment');
define('SEP_GATEWAY_URL', 'https://sep.shaparak.ir/OnlinePG/OnlinePG');
define('SEP_VERIFY_URL', 'https://sep.shaparak.ir/verifyTxnRandomSessionkey/ipg/VerifyTransaction');

// اطلاعات درگاه سپال (Sepal) به عنوان درگاه پشتیبان
define('SEPAL_API_KEY', 'KhAv64ZBs0TRkItY76JdXTqbWLWpNWP62WbI82_uF7WRhBZkrknQhWJ_8XPCT6GH9mYJ4RN2IPw3GPAPM8BbczDX_D_WM_D21iCdheiRYcKGRfUzUApcgKiDvVX3_gFFcf97acb85862596f273e16f1ad8db6be38bd1c999905e697b4dc0c83b1d37777mqbmWX2P9dGTVatC9_w3c9CpttcFTcM0is-H3hoUpDzGlBDl1-2TTJ3afXexyEHc');
define('SEPAL_UNIQUE_CODE', '2930311446');
define('SEPAL_REQUEST_URL', 'https://api.sepal.ir/v1/payment/request');
define('SEPAL_VERIFY_URL', 'https://api.sepal.ir/v1/payment/verify');

// -------------------------------------------------------------
// تنظیمات دیتابیس MySQL هاست (cPanel / DirectAdmin)
// -------------------------------------------------------------
define('DB_HOST', 'localhost');
define('DB_NAME', 'karbama_db');
define('DB_USER', 'karbama_user');
define('DB_PASS', '');

// مسیر فایل پشتیبان JSON (برای کارکرد بدون وقفه حتی پیش از ساخت دیتابیس MySQL)
define('ORDERS_DB_FILE', __DIR__ . '/orders_data.json');

/**
 * اتصال امن PDO به دیتابیس MySQL و ساخت خودکار جدول در صورت عدم وجود
 */
function getDbConnection() {
    static $pdo = null;
    static $attempted = false;

    if ($attempted) {
        return $pdo;
    }
    $attempted = true;

    if (!class_exists('PDO')) {
        return null;
    }

    try {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 3,
        ]);

        $pdo->exec("CREATE TABLE IF NOT EXISTS `karbama_sep_orders` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `res_num` VARCHAR(64) NOT NULL,
            `order_id` VARCHAR(64) DEFAULT NULL,
            `ref_num` VARCHAR(128) DEFAULT NULL,
            `trace_no` VARCHAR(64) DEFAULT NULL,
            `token` VARCHAR(255) DEFAULT NULL,
            `amount_rial` BIGINT UNSIGNED NOT NULL DEFAULT 0,
            `amount_toman` BIGINT UNSIGNED NOT NULL DEFAULT 0,
            `cell_number` VARCHAR(32) DEFAULT NULL,
            `user_name` VARCHAR(128) DEFAULT NULL,
            `user_type` VARCHAR(32) DEFAULT 'seeker',
            `card_pan` VARCHAR(32) DEFAULT NULL,
            `provider` VARCHAR(32) DEFAULT 'sep',
            `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
            `admin_approval_status` VARCHAR(32) NOT NULL DEFAULT 'pending_admin_approval',
            `description` TEXT DEFAULT NULL,
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `verified_at` DATETIME DEFAULT NULL,
            `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `idx_res_num` (`res_num`),
            KEY `idx_ref_num` (`ref_num`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    } catch (Exception $e) {
        $pdo = null;
    }

    return $pdo;
}

function getOrdersData() {
    if (!file_exists(ORDERS_DB_FILE)) {
        return [];
    }
    $content = file_get_contents(ORDERS_DB_FILE);
    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

function saveOrderData($resNum, $orderInfo) {
    // ۱. ذخیره در دیتابیس MySQL در صورت برقراری اتصال
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $existing = getOrderByIdFromDb($resNum);
            $merged = array_merge($existing ? $existing : [], $orderInfo);

            $stmt = $pdo->prepare("INSERT INTO `karbama_sep_orders`
                (`res_num`, `order_id`, `ref_num`, `trace_no`, `token`, `amount_rial`, `amount_toman`, `cell_number`, `user_name`, `user_type`, `card_pan`, `provider`, `status`, `description`, `verified_at`)
                VALUES
                (:res_num, :order_id, :ref_num, :trace_no, :token, :amount_rial, :amount_toman, :cell_number, :user_name, :user_type, :card_pan, :provider, :status, :description, :verified_at)
                ON DUPLICATE KEY UPDATE
                `ref_num` = VALUES(`ref_num`),
                `trace_no` = VALUES(`trace_no`),
                `token` = VALUES(`token`),
                `card_pan` = VALUES(`card_pan`),
                `status` = VALUES(`status`),
                `verified_at` = VALUES(`verified_at`)");

            $stmt->execute([
                ':res_num' => $resNum,
                ':order_id' => isset($merged['order_id']) ? $merged['order_id'] : '',
                ':ref_num' => isset($merged['ref_num']) ? $merged['ref_num'] : null,
                ':trace_no' => isset($merged['trace_no']) ? $merged['trace_no'] : null,
                ':token' => isset($merged['token']) ? $merged['token'] : null,
                ':amount_rial' => isset($merged['amount_rial']) ? intval($merged['amount_rial']) : 0,
                ':amount_toman' => isset($merged['amount_toman']) ? intval($merged['amount_toman']) : 0,
                ':cell_number' => isset($merged['cell_number']) ? $merged['cell_number'] : '',
                ':user_name' => isset($merged['user_name']) ? $merged['user_name'] : '',
                ':user_type' => isset($merged['user_type']) ? $merged['user_type'] : 'seeker',
                ':card_pan' => isset($merged['card_pan']) ? $merged['card_pan'] : null,
                ':provider' => isset($merged['provider']) ? $merged['provider'] : 'sep',
                ':status' => isset($merged['status']) ? $merged['status'] : 'pending',
                ':description' => isset($merged['description']) ? $merged['description'] : '',
                ':verified_at' => isset($merged['verified_at']) ? $merged['verified_at'] : null,
            ]);
        } catch (Exception $e) {
            // ادامه ذخیره در فایل پشتیبان
        }
    }

    // ۲. ذخیره همزمان در فایل JSON برای اطمینان ۱۰۰٪
    $orders = getOrdersData();
    $orders[$resNum] = array_merge(isset($orders[$resNum]) ? $orders[$resNum] : [], $orderInfo, [
        'updated_at' => date('Y-m-d H:i:s')
    ]);
    @file_put_contents(ORDERS_DB_FILE, json_encode($orders, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    return true;
}

function getOrderByIdFromDb($resNum) {
    $pdo = getDbConnection();
    if (!$pdo) return null;
    try {
        $stmt = $pdo->prepare("SELECT * FROM `karbama_sep_orders` WHERE `res_num` = :res_num LIMIT 1");
        $stmt->execute([':res_num' => $resNum]);
        $row = $stmt->fetch();
        return $row ? $row : null;
    } catch (Exception $e) {
        return null;
    }
}

function getOrderById($resNum) {
    $dbOrder = getOrderByIdFromDb($resNum);
    if ($dbOrder) return $dbOrder;

    $orders = getOrdersData();
    return isset($orders[$resNum]) ? $orders[$resNum] : null;
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
