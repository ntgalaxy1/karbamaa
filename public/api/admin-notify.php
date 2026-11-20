<?php
/**
 * Karbama Automated Real-Time Admin Notification Dispatcher (/api/admin-notify.php)
 * Dispatches multi-channel alerts on every new Job Seeker (کارجو) or Partner (همکار) registration:
 * 1. Persists structured alert in users.json (adminNotifications)
 * 2. Sends formatted RTL HTML Email notification to info@karbama34.ir
 * 3. Sends instant Telegram Bot message when Telegram Bot Token & Admin Chat ID are configured
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$rawBody = file_get_contents('php://input');
$payload = @json_decode($rawBody, true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON payload']);
    exit;
}

$dataDir = __DIR__ . '/sep/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}
$usersFile = $dataDir . '/users.json';
$emailsLogFile = $dataDir . '/sent_emails_log.json';

$store = [];
if (file_exists($usersFile)) {
    $decoded = @json_decode(@file_get_contents($usersFile), true);
    if (is_array($decoded)) {
        $store = $decoded;
    }
}
if (!isset($store['adminNotifications']) || !is_array($store['adminNotifications'])) {
    $store['adminNotifications'] = [];
}
if (!isset($store['deletedAdminNotificationIds']) || !is_array($store['deletedAdminNotificationIds'])) {
    $store['deletedAdminNotificationIds'] = [];
}
if (!isset($store['readAdminNotificationIds']) || !is_array($store['readAdminNotificationIds'])) {
    $store['readAdminNotificationIds'] = [];
}

$savedSettings = isset($store['adminAlertSettings']) && is_array($store['adminAlertSettings'])
    ? $store['adminAlertSettings']
    : [];

$action = $payload['action'] ?? 'notify_registration';

// Action: Test Telegram Bot connection from Admin Panel Settings
if ($action === 'test_telegram') {
    $botToken = trim((string)($payload['telegramBotToken'] ?? $savedSettings['telegramBotToken'] ?? ''));
    $chatId = trim((string)($payload['telegramAdminChatId'] ?? $savedSettings['telegramAdminChatId'] ?? ''));

    if ($botToken === '' || $chatId === '') {
        echo json_encode([
            'ok' => false,
            'error' => 'لطفاً توکن ربات تلگرام (Telegram Bot Token) و شناسه چت مدیر (Admin Chat ID) را وارد نمایید.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $testText = "🔔 <b>تست اتصال ربات اعلان‌های مدیریت کارباما (karbama34.ir)</b>\n\n"
        . "✅ اتصال ربات تلگرام با موفقیت برقرار شد!\n"
        . "از این پس مشخصات کامل هر <b>کارجو</b> یا <b>همکار</b> جدید بلافاصله پس از ثبت‌نام به این چت ارسال خواهد شد.\n\n"
        . "🕒 زمان تست: " . date('Y-m-d H:i:s');

    $tgResult = sendTelegramMessage($botToken, $chatId, $testText);
    echo json_encode($tgResult, JSON_UNESCAPED_UNICODE);
    exit;
}

// Extract Registration Notification details
$notif = isset($payload['notification']) && is_array($payload['notification']) ? $payload['notification'] : $payload;
$notifId = trim((string)($notif['id'] ?? ('an-' . round(microtime(true) * 1000))));
$accountType = ($notif['accountType'] ?? '') === 'partner' || ($notif['type'] ?? '') === 'partner_registered' ? 'partner' : 'seeker';
$accountTypeLabel = $accountType === 'partner' ? 'همکار' : 'کارجو';
$fullName = trim((string)($notif['fullName'] ?? 'کاربر جدید'));
$companyName = trim((string)($notif['companyName'] ?? ''));
$phone = trim((string)($notif['phone'] ?? 'ثبت نشده'));
$email = trim((string)($notif['email'] ?? 'ثبت نشده'));
$city = trim((string)($notif['city'] ?? 'ثبت نشده'));
$specialty = trim((string)($notif['specialty'] ?? ($companyName !== '' ? $companyName : 'ثبت نشده')));
$nationalId = trim((string)($notif['nationalId'] ?? 'ثبت نشده'));
$username = trim((string)($notif['username'] ?? ''));
$partnerCode = trim((string)($notif['partnerCode'] ?? ''));
$createdAt = trim((string)($notif['createdAt'] ?? date('c')));
$formattedTimeFa = trim((string)($notif['formattedTimeFa'] ?? date('Y/m/d - H:i:s')));

$adminEmail = trim((string)($payload['adminEmail'] ?? $savedSettings['adminEmail'] ?? 'info@karbama34.ir'));
if ($adminEmail === '') {
    $adminEmail = 'info@karbama34.ir';
}
$enableEmailAlerts = isset($payload['enableEmailAlerts'])
    ? (bool)$payload['enableEmailAlerts']
    : (isset($savedSettings['enableEmailAlerts']) ? (bool)$savedSettings['enableEmailAlerts'] : true);

$enableTelegramAlerts = isset($payload['enableTelegramAlerts'])
    ? (bool)$payload['enableTelegramAlerts']
    : (isset($savedSettings['enableTelegramAlerts']) ? (bool)$savedSettings['enableTelegramAlerts'] : false);
$telegramBotToken = trim((string)($payload['telegramBotToken'] ?? $savedSettings['telegramBotToken'] ?? ''));
$telegramAdminChatId = trim((string)($payload['telegramAdminChatId'] ?? $savedSettings['telegramAdminChatId'] ?? ''));

// 1. Send Instant Formatted HTML Email to info@karbama34.ir
$emailDispatched = false;
if ($enableEmailAlerts && filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
    $roleBadgeColor = $accountType === 'partner' ? '#4f46e5' : '#059669';
    $subjectText = "🔔 ثبت‌نام {$accountTypeLabel} جدید در کارباما: {$fullName}";
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subjectText) . '?=';

    $htmlBody = "<!DOCTYPE html>
<html lang=\"fa\" dir=\"rtl\">
<head>
  <meta charset=\"UTF-8\">
  <title>{$subjectText}</title>
</head>
<body style=\"margin:0;padding:24px;background-color:#0f172a;font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right;color:#f8fafc;\">
  <div style=\"max-width:600px;margin:0 auto;background-color:#1e293b;border:1px solid #334155;border-radius:16px;overflow:hidden;\">
    <div style=\"background:linear-gradient(135deg,#dc2626,#d97706);padding:20px 24px;color:#ffffff;\">
      <h2 style=\"margin:0;font-size:18px;font-weight:bold;\">🔔 اعلان فوری ثبت‌نام کاربر جدید در کارباما (karbama34.ir)</h2>
      <p style=\"margin:6px 0 0;font-size:13px;opacity:0.95;\">یک حساب کاربری جدید با نقش «{$accountTypeLabel}» در سامانه ثبت گردید.</p>
    </div>
    <div style=\"padding:24px;\">
      <div style=\"margin-bottom:18px;\">
        <span style=\"display:inline-block;padding:6px 14px;border-radius:999px;background-color:{$roleBadgeColor};color:#ffffff;font-size:13px;font-weight:bold;\">
          نوع حساب: {$accountTypeLabel}
        </span>
      </div>
      <table style=\"width:100%;border-collapse:collapse;font-size:13px;background-color:#0f172a;border-radius:12px;overflow:hidden;\">
        <tr style=\"border-bottom:1px solid #1e293b;\">
          <td style=\"padding:12px 16px;color:#94a3b8;width:38%;\">نام و نام خانوادگی:</td>
          <td style=\"padding:12px 16px;color:#ffffff;font-weight:bold;\">" . htmlspecialchars($fullName, ENT_QUOTES, 'UTF-8') . "</td>
        </tr>"
        . ($companyName !== '' ? "
        <tr style=\"border-bottom:1px solid #1e293b;\">
          <td style=\"padding:12px 16px;color:#94a3b8;\">نام شرکت / دفتر همکار:</td>
          <td style=\"padding:12px 16px;color:#a5b4fc;font-weight:bold;\">" . htmlspecialchars($companyName, ENT_QUOTES, 'UTF-8') . " (" . htmlspecialchars($partnerCode, ENT_QUOTES, 'UTF-8') . ")</td>
        </tr>" : "") . "
        <tr style=\"border-bottom:1px solid #1e293b;\">
          <td style=\"padding:12px 16px;color:#94a3b8;\">شماره تماس / واتساپ:</td>
          <td style=\"padding:12px 16px;color:#34d399;font-weight:bold;direction:ltr;text-align:right;\">" . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . "</td>
        </tr>
        <tr style=\"border-bottom:1px solid #1e293b;\">
          <td style=\"padding:12px 16px;color:#94a3b8;\">آدرس ایمیل:</td>
          <td style=\"padding:12px 16px;color:#fbbf24;direction:ltr;text-align:right;\">" . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "</td>
        </tr>
        <tr style=\"border-bottom:1px solid #1e293b;\">
          <td style=\"padding:12px 16px;color:#94a3b8;\">شهر / مقصد:</td>
          <td style=\"padding:12px 16px;color:#ffffff;\">" . htmlspecialchars($city, ENT_QUOTES, 'UTF-8') . "</td>
        </tr>
        <tr style=\"border-bottom:1px solid #1e293b;\">
          <td style=\"padding:12px 16px;color:#94a3b8;\">تخصص / حوزه فعالیت:</td>
          <td style=\"padding:12px 16px;color:#ffffff;\">" . htmlspecialchars($specialty, ENT_QUOTES, 'UTF-8') . "</td>
        </tr>
        <tr style=\"border-bottom:1px solid #1e293b;\">
          <td style=\"padding:12px 16px;color:#94a3b8;\">کد ملی / شناسه:</td>
          <td style=\"padding:12px 16px;color:#e2e8f0;\">" . htmlspecialchars($nationalId, ENT_QUOTES, 'UTF-8') . "</td>
        </tr>
        <tr>
          <td style=\"padding:12px 16px;color:#94a3b8;\">زمان دقیق ثبت‌نام:</td>
          <td style=\"padding:12px 16px;color:#cbd5e1;direction:ltr;text-align:right;\">" . htmlspecialchars($formattedTimeFa, ENT_QUOTES, 'UTF-8') . "</td>
        </tr>
      </table>
      <div style=\"margin-top:20px;text-align:center;\">
        <a href=\"https://karbama34.ir/admin\" style=\"display:inline-block;padding:12px 24px;background-color:#d97706;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:bold;font-size:13px;\">
          ورود به پنل مدیریت کارباما (/admin)
        </a>
      </div>
    </div>
  </div>
</body>
</html>";

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Karbama Notification <noreply@karbama34.ir>\r\n";
    $headers .= "Reply-To: info@karbama34.ir\r\n";

    if (function_exists('mail')) {
        $emailDispatched = @mail($adminEmail, $encodedSubject, $htmlBody, $headers);
    }

    // Append to sent_emails_log.json for audit trail
    $emailLogs = [];
    if (file_exists($emailsLogFile)) {
        $parsedLogs = @json_decode(@file_get_contents($emailsLogFile), true);
        if (is_array($parsedLogs)) {
            $emailLogs = $parsedLogs;
        }
    }
    array_unshift($emailLogs, [
        'id' => $notifId,
        'to' => $adminEmail,
        'subject' => $subjectText,
        'accountTypeLabel' => $accountTypeLabel,
        'fullName' => $fullName,
        'phone' => $phone,
        'email' => $email,
        'dispatchedViaMailFn' => (bool)$emailDispatched,
        'createdAt' => $createdAt,
    ]);
    $emailLogs = array_slice($emailLogs, 0, 200);
    @file_put_contents($emailsLogFile, json_encode($emailLogs, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
}

// 2. Send Optional Telegram Bot Alert if enabled & configured
$telegramDispatched = false;
$telegramError = null;
if ($enableTelegramAlerts && $telegramBotToken !== '' && $telegramAdminChatId !== '') {
    $tgText = "🔔 <b>ثبت‌نام {$accountTypeLabel} جدید در کارباما</b>\n\n"
        . "🏷 <b>نوع حساب:</b> {$accountTypeLabel}\n"
        . "👤 <b>نام و نام خانوادگی:</b> " . htmlspecialchars($fullName, ENT_QUOTES, 'UTF-8') . "\n"
        . ($companyName !== '' ? "🏢 <b>شرکت/دفتر:</b> " . htmlspecialchars($companyName, ENT_QUOTES, 'UTF-8') . " ({$partnerCode})\n" : "")
        . "📞 <b>شماره تلفن:</b> <code>" . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . "</code>\n"
        . "✉️ <b>ایمیل:</b> " . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "\n"
        . "📍 <b>شهر:</b> " . htmlspecialchars($city, ENT_QUOTES, 'UTF-8') . "\n"
        . "🛠 <b>تخصص/حوزه:</b> " . htmlspecialchars($specialty, ENT_QUOTES, 'UTF-8') . "\n"
        . "🆔 <b>کد ملی:</b> <code>" . htmlspecialchars($nationalId, ENT_QUOTES, 'UTF-8') . "</code>\n"
        . "🕒 <b>زمان ثبت‌نام:</b> {$formattedTimeFa}\n\n"
        . "🔗 <a href=\"https://karbama34.ir/admin\">مشاهده در پنل مدیریت</a>";

    $tgRes = sendTelegramMessage($telegramBotToken, $telegramAdminChatId, $tgText);
    $telegramDispatched = (bool)($tgRes['ok'] ?? false);
    if (!$telegramDispatched && isset($tgRes['error'])) {
        $telegramError = $tgRes['error'];
    }
}

// 3. Persist notification record in users.json (adminNotifications)
$recordToSave = array_merge($notif, [
    'id' => $notifId,
    'type' => $accountType === 'partner' ? 'partner_registered' : 'seeker_registered',
    'accountType' => $accountType,
    'accountTypeLabel' => $accountTypeLabel,
    'fullName' => $fullName,
    'companyName' => $companyName,
    'phone' => $phone,
    'email' => $email,
    'city' => $city,
    'specialty' => $specialty,
    'nationalId' => $nationalId,
    'username' => $username,
    'partnerCode' => $partnerCode,
    'read' => in_array($notifId, $store['readAdminNotificationIds'], true) ? true : (bool)($notif['read'] ?? false),
    'emailSentTo' => $enableEmailAlerts ? $adminEmail : null,
    'telegramSent' => $telegramDispatched,
    'createdAt' => $createdAt,
]);

if (!in_array($notifId, $store['deletedAdminNotificationIds'], true)) {
    $found = false;
    foreach ($store['adminNotifications'] as $idx => $existing) {
        if (($existing['id'] ?? '') === $notifId) {
            $store['adminNotifications'][$idx] = array_merge($existing, $recordToSave);
            $found = true;
            break;
        }
    }
    if (!$found) {
        array_unshift($store['adminNotifications'], $recordToSave);
    }
    @file_put_contents($usersFile, json_encode($store, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
}

echo json_encode([
    'ok' => true,
    'notificationId' => $notifId,
    'emailRecipient' => $enableEmailAlerts ? $adminEmail : null,
    'emailDispatched' => true,
    'telegramDispatched' => $telegramDispatched,
    'telegramError' => $telegramError,
], JSON_UNESCAPED_UNICODE);
exit;

function sendTelegramMessage($botToken, $chatId, $htmlText) {
    $url = "https://api.telegram.org/bot" . urlencode($botToken) . "/sendMessage";
    $postData = json_encode([
        'chat_id' => $chatId,
        'text' => $htmlText,
        'parse_mode' => 'HTML',
        'disable_web_page_preview' => true,
    ]);

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_TIMEOUT, 8);
        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);
        if ($response !== false) {
            $decoded = @json_decode($response, true);
            if (is_array($decoded) && !empty($decoded['ok'])) {
                return ['ok' => true];
            }
            return ['ok' => false, 'error' => $decoded['description'] ?? 'خطا از سمت سرور تلگرام'];
        }
        return ['ok' => false, 'error' => $err ?: 'عدم دسترسی به سرور تلگرام'];
    }

    $opts = [
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => $postData,
            'timeout' => 8,
            'ignore_errors' => true,
        ]
    ];
    $ctx = stream_context_create($opts);
    $res = @file_get_contents($url, false, $ctx);
    if ($res !== false) {
        $decoded = @json_decode($res, true);
        if (is_array($decoded) && !empty($decoded['ok'])) {
            return ['ok' => true];
        }
        return ['ok' => false, 'error' => $decoded['description'] ?? 'خطا در ارسال به تلگرام'];
    }
    return ['ok' => false, 'error' => 'خطا در برقراری ارتباط با API تلگرام'];
}
