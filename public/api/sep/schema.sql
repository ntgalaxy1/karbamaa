-- ======================================================================
-- ساختار جدول دیتابیس MySQL برای تراکنش‌های درگاه پرداخت سامان (SEP) کارباما
-- دامنه: https://karbama34.ir
-- قابل ایمپورت مستقیم در phpMyAdmin سی‌پنل یا دایرکت‌ادمین
-- ======================================================================

CREATE TABLE IF NOT EXISTS `karbama_sep_orders` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `res_num` VARCHAR(64) NOT NULL COMMENT 'شماره فاکتور یکتا ارسالی به شاپرک (ResNum)',
  `order_id` VARCHAR(64) DEFAULT NULL COMMENT 'شناسه سفارش یا کد ملی کاربر در کارباما',
  `ref_num` VARCHAR(128) DEFAULT NULL COMMENT 'رسید دیجیتالی شاپرک (RefNum)',
  `trace_no` VARCHAR(64) DEFAULT NULL COMMENT 'شماره مرجع بانکی (TraceNo / RRN)',
  `token` VARCHAR(255) DEFAULT NULL COMMENT 'توکن دریافتی از SEP',
  `amount_rial` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'مبلغ تراکنش به ریال',
  `amount_toman` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'مبلغ تراکنش به تومان',
  `cell_number` VARCHAR(32) DEFAULT NULL COMMENT 'شماره موبایل پرداخت‌کننده',
  `user_name` VARCHAR(128) DEFAULT NULL COMMENT 'نام پرداخت‌کننده',
  `user_type` VARCHAR(32) DEFAULT 'seeker' COMMENT 'نوع کاربر: seeker یا employer',
  `card_pan` VARCHAR(32) DEFAULT NULL COMMENT 'شماره کارت ماسک‌شده (SecurePan)',
  `provider` VARCHAR(32) DEFAULT 'sep' COMMENT 'درگاه: sep یا sepal',
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT 'وضعیت: pending, paid, failed',
  `admin_approval_status` VARCHAR(32) NOT NULL DEFAULT 'pending_admin_approval' COMMENT 'وضعیت تایید مدیریت جهت باز شدن قفل',
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `verified_at` DATETIME DEFAULT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_res_num` (`res_num`),
  KEY `idx_ref_num` (`ref_num`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
