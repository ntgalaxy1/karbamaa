<?php
/**
 * سامانه کارباما - کاریابی و اقامت ترکیه
 * ۳. بازگشت به پذیرنده (CallbackUrl: https://karbama34.ir/api/sep/callback.php)
 * و ۴. فراخوانی تأیید نهایی (POST https://payment.sepal.ir/api/v1/payment/verify/) از سرور پذیرنده
 *
 * پارامترهای ارسالی از سپال به callbackUrl پذیرنده (GET یا POST):
 * - status: integer (1 = موفق اولیه، 0 = ناموفق)
 * - paymentNumber: string (شناسه پرداخت)
 * - invoiceNumber: string (شماره فاکتور)
 * - در صورت status=1 همچنین: amount (ریال)، cardNumber (شماره کارت)، referenceNumber (شماره مرجع)
 */

require_once __DIR__ . '/config.php';

$requestData = array_merge($_GET, $_POST);

// ۱. دریافت پارامترهای استاندارد سپال (Sepal Callback) و سامان (SEP Callback)
$paymentNumber = isset($requestData['paymentNumber'])
    ? trim(strval($requestData['paymentNumber']))
    : (isset($requestData['payment_number']) ? trim(strval($requestData['payment_number'])) : '');

$invoiceNumber = isset($requestData['invoiceNumber'])
    ? trim(strval($requestData['invoiceNumber']))
    : (isset($requestData['ResNum'])
        ? trim(strval($requestData['ResNum']))
        : (isset($requestData['res_num']) ? trim(strval($requestData['res_num'])) : ''));

$sepalStatus = isset($requestData['status']) ? intval($requestData['status']) : -1;
$sepState = isset($requestData['State']) ? trim(strval($requestData['State'])) : '';
$sepStatus = isset($requestData['Status']) ? intval($requestData['Status']) : -1;

$referenceNumber = isset($requestData['referenceNumber'])
    ? trim(strval($requestData['referenceNumber']))
    : (isset($requestData['RefNum'])
        ? trim(strval($requestData['RefNum']))
        : (isset($requestData['ref_num']) ? trim(strval($requestData['ref_num'])) : ''));

$cardNumber = isset($requestData['cardNumber'])
    ? trim(strval($requestData['cardNumber']))
    : (isset($requestData['SecurePan']) ? trim(strval($requestData['SecurePan'])) : '');

$amount = isset($requestData['amount'])
    ? intval($requestData['amount'])
    : (isset($requestData['Amount']) ? intval($requestData['Amount']) : 0);

$traceNo = isset($requestData['TraceNo']) ? trim(strval($requestData['TraceNo'])) : $referenceNumber;

// بازیابی سفارش از دیتابیس
$order = getOrderById(!empty($invoiceNumber) ? $invoiceNumber : $paymentNumber);
if ($order) {
    if (empty($invoiceNumber) && !empty($order['res_num'])) {
        $invoiceNumber = $order['res_num'];
    }
    if (empty($paymentNumber) && !empty($order['payment_number'])) {
        $paymentNumber = $order['payment_number'];
    }
    if ($amount <= 0 && !empty($order['amount_rial'])) {
        $amount = intval($order['amount_rial']);
    }
}

$isSuccess = false;
$alreadyVerified = false;
$verifyMessage = '';
$errorMessage = '';

// -------------------------------------------------------------
// الف) بررسی بازگشت موفق اولیه از سپال (status == 1) و فراخوانی سرور به سرور Verify
// طبق مستندات سپال: status=1 به معنای تأیید قطعی نیست؛ پذیرنده باید Verify را از سرور خود فراخوانی کند
// -------------------------------------------------------------
if ($sepalStatus === 1 && !empty($paymentNumber)) {
    $sepalVerifyPayload = [
        'apiKey' => SEPAL_API_KEY,
        'paymentNumber' => $paymentNumber,
    ];
    if (!empty($invoiceNumber)) {
        $sepalVerifyPayload['invoiceNumber'] = $invoiceNumber;
    }

    $verifyRes = makeHttpPostRequest(SEPAL_VERIFY_URL, $sepalVerifyPayload);
    $verifyJson = json_decode($verifyRes['body'], true);

    if (is_array($verifyJson) && isset($verifyJson['status']) && $verifyJson['status'] === true) {
        $isSuccess = true;
        $alreadyVerified = !empty($verifyJson['alreadyVerified']);
        $verifyMessage = isset($verifyJson['message']) ? $verifyJson['message'] : 'پرداخت شما با موفقیت انجام شد';
        if (!empty($verifyJson['referenceNumber'])) {
            $referenceNumber = strval($verifyJson['referenceNumber']);
        }
        if (!empty($verifyJson['cardNumber'])) {
            $cardNumber = strval($verifyJson['cardNumber']);
        }
        if (!empty($verifyJson['amount'])) {
            $amount = intval($verifyJson['amount']);
        }
    } else {
        $errCode = isset($verifyJson['message']) ? $verifyJson['message'] : 'verify_failed';
        $errorMessage = translateSepalError($errCode);
    }
}
// -------------------------------------------------------------
// ب) بررسی بازگشت از درگاه سامان کیش (SEP: State === 'OK' || Status === 2)
// -------------------------------------------------------------
elseif ($sepState === 'OK' || $sepStatus === 2) {
    if (!empty($referenceNumber)) {
        $sepVerifyPayload = [
            'TerminalNumber' => SEP_TERMINAL_ID,
            'RefNum' => $referenceNumber
        ];
        $verifyRes = makeHttpPostRequest(SEP_VERIFY_URL, $sepVerifyPayload);
        $verifyJson = json_decode($verifyRes['body'], true);

        if (
            (isset($verifyJson['Success']) && $verifyJson['Success'] === true) ||
            (isset($verifyJson['ResultCode']) && intval($verifyJson['ResultCode']) === 0)
        ) {
            $isSuccess = true;
            $verifyMessage = 'پرداخت شما با موفقیت انجام شد';
        } else {
            $errorMessage = 'تایید نهایی تراکنش توسط سرور شاپرک انجام نشد. در صورت کسر وجه، ظرف ۷۲ ساعت به حساب شما بازمی‌گردد.';
        }
    } else {
        $errorMessage = 'شماره مرجع بانکی (referenceNumber / RefNum) دریافت نشد.';
    }
} else {
    $errorMessage = 'تراکنش پرداخت توسط کاربر لغو شد یا از سمت بانک ناموفق اعلام گردید (status=0).';
}

// ذخیره نتیجه نهایی در دیتابیس
$orderKey = !empty($invoiceNumber) ? $invoiceNumber : $paymentNumber;
if ($isSuccess && !empty($orderKey)) {
    saveOrderData($orderKey, [
        'res_num' => $invoiceNumber ?: $orderKey,
        'payment_number' => $paymentNumber,
        'status' => 'paid',
        'ref_num' => $referenceNumber ?: $paymentNumber,
        'trace_no' => $traceNo ?: $referenceNumber,
        'card_pan' => $cardNumber,
        'amount_rial' => $amount,
        'amount_toman' => intval($amount / 10),
        'already_verified' => $alreadyVerified,
        'verified_at' => date('Y-m-d H:i:s'),
        'payment_status' => 'pending_admin_approval'
    ]);
} elseif (!empty($orderKey)) {
    saveOrderData($orderKey, [
        'payment_number' => $paymentNumber,
        'status' => 'failed',
        'error_message' => $errorMessage
    ]);
}

$returnQuery = http_build_query([
    'payment' => $isSuccess ? 'success' : 'failed',
    'provider' => 'sepal',
    'paymentNumber' => $paymentNumber,
    'invoiceNumber' => $invoiceNumber,
    'refId' => $referenceNumber ?: $paymentNumber,
    'resNum' => $invoiceNumber,
    'cardNumber' => $cardNumber,
    'amount' => $amount,
    'amountToman' => intval($amount / 10),
    'alreadyVerified' => $alreadyVerified ? '1' : '0',
    'userType' => isset($order['user_type']) ? $order['user_type'] : 'seeker',
    'orderId' => isset($order['order_id']) ? $order['order_id'] : $invoiceNumber
]);

$appReturnUrl = KARBAMA_DOMAIN . '/?' . $returnQuery;
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $isSuccess ? 'پرداخت موفق - سامانه کارباما' : 'نتیجه پرداخت - سامانه کارباما'; ?></title>
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
        <h1><?php echo htmlspecialchars($verifyMessage ?: 'پرداخت شما با موفقیت انجام شد'); ?></h1>
        <p class="subtitle">تأیید قطعی تراکنش (Verify) توسط سرور پذیرنده انجام و ثبت گردید.</p>

        <div class="details-box">
            <div class="detail-row">
                <span class="detail-label">مبلغ تأییدشده:</span>
                <span class="detail-value" style="color: #34d399; font-size: 14px;">
                    <?php echo number_format(intval($amount / 10)); ?> تومان
                    <small style="color: #94a3b8; font-size: 10px;">(<?php echo number_format($amount); ?> ریال)</small>
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">شناسه یکتای پرداخت (paymentNumber):</span>
                <span class="detail-value"><?php echo htmlspecialchars($paymentNumber); ?></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">شماره پیگیری بانکی (referenceNumber):</span>
                <span class="detail-value"><?php echo htmlspecialchars($referenceNumber ?: $paymentNumber); ?></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">شماره فاکتور پذیرنده (invoiceNumber):</span>
                <span class="detail-value"><?php echo htmlspecialchars($invoiceNumber); ?></span>
            </div>
            <?php if (!empty($cardNumber)): ?>
            <div class="detail-row">
                <span class="detail-label">شماره کارت پرداخت‌کننده:</span>
                <span class="detail-value" dir="ltr"><?php echo htmlspecialchars($cardNumber); ?></span>
            </div>
            <?php endif; ?>
            <div class="detail-row">
                <span class="detail-label">تاریخ و زمان:</span>
                <span class="detail-value"><?php echo date('Y/m/d H:i'); ?></span>
            </div>
        </div>

        <div class="notice-box">
            <strong>توجه:</strong>
            تراکنش شما تایید قطعی شد و در نوبت بررسی مدیریت کارباما قرار گرفت. پس از تایید مدیریت، قفل دسترسی حساب شما فعال خواهد شد.
        </div>

        <a href="<?php echo htmlspecialchars($appReturnUrl); ?>" class="btn">
            بازگشت به سامانه کارباما
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
        <h1 style="color: #f87171;">پرداخت تایید نشد</h1>
        <p class="subtitle"><?php echo htmlspecialchars(!empty($errorMessage) ? $errorMessage : 'متاسفانه پرداخت تایید نشد.'); ?></p>

        <div class="details-box">
            <?php if (!empty($paymentNumber)): ?>
            <div class="detail-row">
                <span class="detail-label">شناسه پرداخت (paymentNumber):</span>
                <span class="detail-value"><?php echo htmlspecialchars($paymentNumber); ?></span>
            </div>
            <?php endif; ?>
            <?php if (!empty($invoiceNumber)): ?>
            <div class="detail-row">
                <span class="detail-label">شماره فاکتور (invoiceNumber):</span>
                <span class="detail-value"><?php echo htmlspecialchars($invoiceNumber); ?></span>
            </div>
            <?php endif; ?>
            <div class="detail-row">
                <span class="detail-label">وضعیت:</span>
                <span class="detail-value" style="color: #f87171;">ناموفق / تایید نشده</span>
            </div>
        </div>

        <a href="<?php echo htmlspecialchars($appReturnUrl); ?>" class="btn failed">
            بازگشت به برنامه و تلاش مجدد
        </a>
    <?php endif; ?>
</div>

</body>
</html>
