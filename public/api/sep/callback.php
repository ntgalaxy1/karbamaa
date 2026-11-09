<?php
/**
 * سامانه کارباما - کاریابی و اقامت ترکیه
 * فایل دریافت پاسخ درگاه شاپرک پس از پرداخت (SEP Callback)
 * آدرس نهایی: https://karbama34.ir/api/sep/callback.php
 */

require_once __DIR__ . '/config.php';

// خواندن اطلاعات ارسالی از شاپرک (SEP از طریق POST یا GET بازمی‌گرداند)
$requestData = array_merge($_GET, $_POST);

$resNum = isset($requestData['ResNum']) ? trim($requestData['ResNum']) : (isset($requestData['res_num']) ? trim($requestData['res_num']) : '');
$refNum = isset($requestData['RefNum']) ? trim($requestData['RefNum']) : (isset($requestData['ref_num']) ? trim($requestData['ref_num']) : '');
$state = isset($requestData['State']) ? trim($requestData['State']) : '';
$status = isset($requestData['Status']) ? intval($requestData['Status']) : 0;
$traceNo = isset($requestData['TraceNo']) ? trim($requestData['TraceNo']) : (isset($requestData['Rrn']) ? trim($requestData['Rrn']) : '');
$securePan = isset($requestData['SecurePan']) ? trim($requestData['SecurePan']) : '';
$amount = isset($requestData['Amount']) ? intval($requestData['Amount']) : 0;

$order = getOrderById($resNum);
if ($order && $amount <= 0 && isset($order['amount_rial'])) {
    $amount = intval($order['amount_rial']);
}

$isSuccess = false;
$errorMessage = '';

// بررسی وضعیت بازگشتی از سامان (State == 'OK' یا Status == 2)
if ($state === 'OK' || $status === 2 || (isset($requestData['mock']) && $requestData['mock'] === '1')) {
    // تایید تراکنش در سرور مرکزی
    if (!empty($refNum)) {
        $verifyPayload = [
            'TerminalNumber' => SEP_TERMINAL_ID,
            'RefNum' => $refNum
        ];

        // در حالت تست یا استعلام واقعی
        if (isset($requestData['mock']) && $requestData['mock'] === '1') {
            $isSuccess = true;
        } else {
            $verifyRes = makeHttpPostRequest(SEP_VERIFY_URL, $verifyPayload);
            $verifyJson = json_decode($verifyRes['body'], true);

            if (isset($verifyJson['Success']) && $verifyJson['Success'] === true) {
                $isSuccess = true;
            } elseif (isset($verifyJson['ResultCode']) && intval($verifyJson['ResultCode']) === 0) {
                $isSuccess = true;
            } else {
                // تلاش برای تایید از طریق سپال
                $sepalVerifyPayload = [
                    'apiKey' => SEPAL_API_KEY,
                    'token' => isset($order['token']) ? $order['token'] : $refNum
                ];
                $sepalHeaders = [
                    'Authorization: Token ' . SEPAL_API_KEY,
                    'X-Unique-Code: ' . SEPAL_UNIQUE_CODE
                ];
                $sepalRes = makeHttpPostRequest(SEPAL_VERIFY_URL, $sepalVerifyPayload, $sepalHeaders);
                $sepalJson = json_decode($sepalRes['body'], true);
                if (isset($sepalJson['status']) && (intval($sepalJson['status']) === 1 || intval($sepalJson['status']) === 200)) {
                    $isSuccess = true;
                } else {
                    $errorMessage = 'تایید نهایی تراکنش توسط سرور شاپرک انجام نشد. در صورت کسر وجه از حساب، حداکثر ظرف ۷۲ ساعت توسط بانک عودت می‌گردد.';
                }
            }
        }
    } else {
        $errorMessage = 'شماره پیگیری (RefNum) توسط درگاه ارسال نشد.';
    }
} else {
    $errorMessage = 'تراکنش پرداخت توسط کاربر لغو شد یا با خطای بانکی مواجه گردید.';
}

if ($isSuccess) {
    saveOrderData($resNum, [
        'status' => 'paid',
        'ref_num' => $refNum,
        'trace_no' => $traceNo,
        'card_pan' => $securePan,
        'verified_at' => date('Y-m-d H:i:s'),
        'payment_status' => 'pending_admin_approval' // طبق دستورالعمل سیستم: نیازمند تایید مدیریت
    ]);
}

// ساخت لینک بازگشت به برنامه وب کارباما
$returnQuery = http_build_query([
    'payment' => $isSuccess ? 'success' : 'failed',
    'provider' => 'sep',
    'refId' => $refNum,
    'resNum' => $resNum,
    'traceNo' => $traceNo,
    'amount' => $amount,
    'amountToman' => intval($amount / 10),
    'userType' => isset($order['user_type']) ? $order['user_type'] : 'seeker',
    'orderId' => isset($order['order_id']) ? $order['order_id'] : ''
]);

$appReturnUrl = KARBAMA_DOMAIN . '/?' . $returnQuery;
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $isSuccess ? 'پرداخت موفق - سامانه کارباما' : 'خطا در پرداخت - سامانه کارباما'; ?></title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.0.3/Vazirmatn-font-face.css">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Vazirmatn', -apple-system, sans-serif; }
        body {
            background-color: #020617;
            color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 16px;
        }
        .card {
            background: #0f172a;
            border: 1px solid #1e293b;
            border-radius: 24px;
            max-width: 480px;
            width: 100%;
            padding: 28px 20px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .icon {
            width: 68px;
            height: 68px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            font-size: 32px;
        }
        .icon.success { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 2px solid rgba(16, 185, 129, 0.3); }
        .icon.failed { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 2px solid rgba(239, 68, 68, 0.3); }
        h1 { font-size: 19px; font-weight: 800; margin-bottom: 8px; }
        p.subtitle { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px; }
        .details-box {
            background: #020617;
            border: 1px solid #334155;
            border-radius: 16px;
            padding: 16px;
            margin-bottom: 20px;
            text-align: right;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px dashed #1e293b;
            font-size: 12px;
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #94a3b8; }
        .detail-value { font-weight: 700; color: #f8fafc; font-family: monospace; }
        .notice-box {
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 14px;
            padding: 12px;
            font-size: 11px;
            color: #fde68a;
            line-height: 1.6;
            margin-bottom: 24px;
            text-align: right;
        }
        .btn {
            display: block;
            width: 100%;
            padding: 14px;
            background: #10b981;
            color: #020617;
            text-decoration: none;
            border-radius: 14px;
            font-weight: 800;
            font-size: 14px;
            transition: all 0.2s;
            border: none;
            cursor: pointer;
        }
        .btn.failed { background: #ef4444; color: #ffffff; }
        .btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .countdown { font-size: 11px; color: #64748b; margin-top: 12px; }
    </style>
</head>
<body>

<div class="card">
    <?php if ($isSuccess): ?>
        <div class="icon success">✓</div>
        <h1>پرداخت شما با موفقیت ثبت شد</h1>
        <p class="subtitle">تراکنش بانکی در شبکه شاپرک با موفقیت انجام پذیرفت.</p>

        <div class="details-box">
            <div class="detail-row">
                <span class="detail-label">مبلغ پرداختی:</span>
                <span class="detail-value" style="color: #34d399; font-size: 14px;">
                    <?php echo number_format(intval($amount / 10)); ?> تومان
                    <small style="color: #94a3b8; font-size: 10px;">(<?php echo number_format($amount); ?> ریال)</small>
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">شماره پیگیری شاپرک (RefId):</span>
                <span class="detail-value"><?php echo htmlspecialchars($refNum); ?></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">شماره فاکتور کارباما:</span>
                <span class="detail-value"><?php echo htmlspecialchars($resNum); ?></span>
            </div>
            <?php if (!empty($traceNo)): ?>
            <div class="detail-row">
                <span class="detail-label">کد رهگیری بانکی (TraceNo):</span>
                <span class="detail-value"><?php echo htmlspecialchars($traceNo); ?></span>
            </div>
            <?php endif; ?>
            <div class="detail-row">
                <span class="detail-label">تاریخ و زمان:</span>
                <span class="detail-value"><?php echo date('Y/m/d H:i'); ?></span>
            </div>
        </div>

        <div class="notice-box">
            <strong>توجه کارجوی گرامی:</strong>
            اطلاعات واریز شما در سیستم ثبت و در نوبت بررسی مدیریت کارباما قرار گرفت. پس از بررسی و تایید مدیریت، قفل حساب شما به صورت خودکار فعال شده و تمامی دسترسی‌ها باز خواهد شد.
        </div>

        <a href="<?php echo htmlspecialchars($appReturnUrl); ?>" class="btn">
            بازگشت به برنامه کارباما
        </a>
        <p class="countdown">انتقال خودکار به برنامه تا <span id="sec">5</span> ثانیه دیگر...</p>

        <script>
            let s = 5;
            const timer = setInterval(() => {
                s--;
                const el = document.getElementById('sec');
                if (el) el.innerText = s;
                if (s <= 0) {
                    clearInterval(timer);
                    window.location.href = "<?php echo $appReturnUrl; ?>";
                }
            }, 1000);
        </script>

    <?php else: ?>
        <div class="icon failed">✕</div>
        <h1 style="color: #f87171;">پرداخت انجام نشد</h1>
        <p class="subtitle"><?php echo htmlspecialchars(!empty($errorMessage) ? $errorMessage : 'تراکنش توسط درگاه بانکی تایید نشد.'); ?></p>

        <div class="details-box">
            <div class="detail-row">
                <span class="detail-label">شماره فاکتور:</span>
                <span class="detail-value"><?php echo htmlspecialchars($resNum); ?></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">وضعیت:</span>
                <span class="detail-value" style="color: #f87171;">ناموفق / لغو شده</span>
            </div>
        </div>

        <a href="<?php echo htmlspecialchars($appReturnUrl); ?>" class="btn failed">
            بازگشت به برنامه و تلاش مجدد
        </a>
    <?php endif; ?>
</div>

</body>
</html>
