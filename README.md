# 📱 سامانه و اپلیکیشن کاریابی و اقامت کارباما (Karbama)
### نسخه رسمی: `v10.0.0.21` | کد نسخه: `100021` | بسته اندروید: `app.karbama.twa`

[![Release](https://img.shields.io/github/v/release/ntgalaxy1/karbamaa?color=10b981&label=آخرین%20نسخه&logo=github)](https://github.com/ntgalaxy1/karbamaa/releases/latest)
[![Android](https://img.shields.io/badge/اندروید-APK%20%7C%20AAB-38bdf8?logo=android)](https://github.com/ntgalaxy1/karbamaa/releases/latest)
[![Cafe Bazaar](https://img.shields.io/badge/کافه%20بازار-آماده%20انتشار-16a34a)](https://github.com/ntgalaxy1/karbamaa/releases/latest)
[![License](https://img.shields.io/badge/مجوز-اختصاصی%20کارباما-f59e0b)]()

کارباما یک پلتفرم جامع دو زبانه (فارسی - ترکی) برای کاریابی، استخدام، کاریابی تخصصی، خدمات اقامت، رزرو هتل و مبادلات مالی ایرانیان در ترکیه است.

---

## 📥 دانلود مستقیم آخرین نسخه رسمی (v10.0.0.21)

| فایل | توضیحات | لینک دانلود مستقیم |
| :--- | :--- | :--- |
| 📱 **APK مستقیم اندروید** | فایل نصبی مستقیم برای گوشی‌های اندروید (نسخه 10.0.0.21) | [دانلود مستقیم karbama-v10.0.0.21.apk](https://github.com/ntgalaxy1/karbamaa/releases/download/v10.0.0.21/karbama-v10.0.0.21.apk) |
| 🚀 **لینک همیشگی APK** | لینک دانلود ثابت آخرین نسخه به روز رسانی شده | [دانلود مستقیم karbama-latest.apk](https://github.com/ntgalaxy1/karbamaa/releases/download/v10.0.0.21/karbama-latest.apk) |
| 📦 **اندروید باندل کافه‌بازار (AAB)** | پکیج استاندارد مخصوص آپلود در پیشخوان کافه‌بازار | [دانلود karbama-v10.0.0.21.aab](https://github.com/ntgalaxy1/karbamaa/releases/download/v10.0.0.21/karbama-v10.0.0.21.aab) |
| 🗜️ **پکیج کامل کافه‌بازار (ZIP)** | بسته فشرده شامل تمام فایل‌ها، کلیدهای امضا و مستندات | [دانلود karbama-cafebazaar-package.zip](https://github.com/ntgalaxy1/karbamaa/releases/download/v10.0.0.21/karbama-cafebazaar-package.zip) |
| 🌐 **بسته هاست شخصی (dist.zip)** | آماده آپلود مستقیم در `public_html` هاست cPanel / DirectAdmin | [دانلود karbama-dist.zip](https://github.com/ntgalaxy1/karbamaa/releases/download/v10.0.0.21/karbama-dist.zip) |

👉 **[مشاهده صفحه کامل ریلیز در گیت‌هاب (GitHub Releases)](https://github.com/ntgalaxy1/karbamaa/releases/tag/v10.0.0.21)**

---

## 📋 تغییرات و بهینه‌سازی‌های نسخه ۱۰.۰.۰.۲۱ (v10.0.0.21)

1. **📏 یکسان‌سازی دقیق ابعاد مودال در هر ۳ تب (Modal Uniform Sizing & Viewport Stability):**
   - رفع کامل مشکل تفاوت سایز باکس مودال در تب‌های «ورود به حساب»، «ثبت‌نام کاربر» و «انتخاب زبان سیستم»
   - تثبیت ارتفاع کادر مودال به صورت یکنواخت (`h-[88vh] min-h-[560px] max-h-[720px]`) جهت جلوگیری از تغییر سایز، پرش و لرزش صفحه هنگام سوئیچ تب‌ها
   - تراز وسط قرار گرفتن متقارن فرم ورود و تنظیمات زبان در داخل فضای ثابت بدون جمع‌شدن یا کشیدگی کادر
   - چسبان شدن (Sticky) نشانگر ۴ مرحله‌ای ثبت‌نام جهت اسکرول روان و دسترسی مداوم در فیلدهای طولانی
   - هماهنگی رنگ تب‌های فعال (`bg-red-600`) و حفظ موقعیت هدر در تمام حالات

2. **📱 رفع قطعی مشکل تغییر سایز صفحه هنگام سوئیچ تب‌ها (Mobile Viewport & Jitter Fix):**
   - رفع کامل لرزش و پرش ناخواسته صفحه هنگام جابجایی بین تب‌های ثبت آگهی، ثبت رزومه و جستجوی کار
   - تنظیم دقیق متاتگ‌های Viewport موبایل (`user-scalable=no`, `viewport-fit=cover`, `interactive-widget=resizes-content`)
   - اعمال فونت حداقل 16px برای تمام فیلدهای متنی (`input`, `textarea`, `select`) جهت جلوگیری از زوم خودکار کیبورد موبایل

3. **🤝 امکان ثبت‌نام و مدیریت همکاران در پنل مدیریت:**
   - بخش ویژه ثبت مشخصات، شماره تماس، کد ملی/پاسپورت و حیطه فعالیت همکاران در بخش ادمین
   - اصلاح دسترسی‌ها و هماهنگی برچسب نقش‌ها در صفحه ورود اختصاصی

4. **🧹 اسکریپت پاکسازی دیتابیس آزمایشی (Firebase DB Purge):**
   - اسکریپت اختصاصی جهت حذف کلیه آگهی‌ها و کارجویان تستی و پیش‌فرض برای بهره‌برداری نهایی سیستم

5. **🛡️ نماد اعتماد الکترونیکی (اینماد):**
   - تعبیه نماد رسمی اینماد در فوتر تمامی بخش‌های سامانه جهت اعتماد و امنیت کامل کاربران

6. **🎨 آیکون استاندارد و لوگوی رسمی اپلیکیشن:**
   - تولید و پیکربندی آیکون‌های استاندارد و تطبیق‌پذیر (Adaptive Icons) در تمام لانچرهای اندروید

---

## 🛠️ مشخصات فنی پکیج اندروید

- **نام بسته (Package ID):** `app.karbama.twa`
- **نسخه (Version Name):** `10.0.0.21`
- **کد نسخه (Version Code):** `100021`
- **حداقل اندروید مورد نیاز:** اندروید ۵.۰ (API 21) به بالا
- **امضای دیجیتال:** `JAR V1` + `APK Signature Scheme V2` (سازگار با کافه‌بازار و گوگل‌پلی)
- **فناوری:** PWA / TWA + React 19 + Tailwind CSS + Vite + Firebase Firestore

---

## 💻 دستورات اجرا و انتشار

```bash
# نصب پکیج‌ها
npm install

# اجرای سرور توسعه
npm run dev

# بیلد نسخه تجاری و تولید خودکار فایل نصبی APK و AAB
npm run build

# اسکریپت انتشار خودکار
bash scripts/publish-to-github.sh
```

---

توسعه‌یافته با ❤️ برای ایرانیان مقیم ترکیه  
توسعه‌دهنده: ناصر توکلی ([@Ntgalaxy](https://github.com/ntgalaxy1))
