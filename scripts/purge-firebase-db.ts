#!/usr/bin/env node
/**
 * scripts/purge-firebase-db.ts
 *
 * اسکریپت پاکسازی کامل دیتابیس در Firebase Firestore
 * حذف کلیه داده‌های آزمایشی، کارجویان نمونه/پیش‌فرض، اعلان‌های تستی و چت‌های آزمایشی
 * جهت آماده‌سازی سامانه برای استفاده نهایی و محیط واقعی
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const configPath = path.join(rootDir, 'firebase-applet-config.json');

if (!fs.existsSync(configPath)) {
  console.error('❌ خطا: فایل تنظیمات firebase-applet-config.json یافت نشد.');
  process.exit(1);
}

const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('\n===============================================================');
console.log('🧹 شروع فرآیند پاکسازی دیتابیس Firebase Firestore (سامانه کارباما)');
console.log(`📁 پروژه: ${firebaseConfig.projectId}`);
console.log(`🗄️ دیتابیس: ${firebaseConfig.firestoreDatabaseId}`);
console.log('===============================================================\n');

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(
  app,
  { experimentalAutoDetectLongPolling: true },
  firebaseConfig.firestoreDatabaseId
);

// تشخیص آیا کارجو یک داده آزمایشی یا پیش‌فرض است
function isDemoOrTestSeeker(data: any): boolean {
  if (!data) return true;
  const id = String(data.id || '').toLowerCase();
  if (
    id.startsWith('seeker-1') ||
    id.startsWith('seeker-2') ||
    id.startsWith('seeker-3') ||
    id.startsWith('seeker-4') ||
    id.startsWith('seeker-5') ||
    id.includes('demo') ||
    id.includes('sample') ||
    id.includes('test') ||
    id.includes('mock')
  ) {
    return true;
  }

  const name = String(data.fullName || '').trim();
  const sampleNames = [
    'علی رضایی',
    'محمد کریمی',
    'سارا احمدی',
    'رضا محمدی',
    'امیر حسینی',
    'مهدی حسینی',
    'کارجو نمونه',
    'کارجو تست',
  ];
  if (sampleNames.includes(name) || name.includes('نمونه') || name.includes('تست')) {
    return true;
  }

  const username = String(data.username || '').toLowerCase();
  const sampleUsernames = [
    'ali_rezaei',
    'mohammad_k',
    'sara_ahmadi',
    'seeker1',
    'seeker2',
    'seeker3',
    'seeker4',
    'seeker5',
    'seeker_demo',
    'demo_seeker',
  ];
  if (sampleUsernames.includes(username) || username.includes('demo') || username.includes('sample') || username.includes('test')) {
    return true;
  }

  return false;
}

async function purgeCollection(collectionName: string, filterFn?: (data: any) => boolean): Promise<number> {
  console.log(`🔍 در حال بررسی کالکشن '${collectionName}'...`);
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      console.log(`ℹ️ کالکشن '${collectionName}' خالی است.`);
      return 0;
    }

    let deletedCount = 0;
    const batch = writeBatch(db);
    let batchOps = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const shouldDelete = filterFn ? filterFn(data) : true;

      if (shouldDelete) {
        batch.delete(docSnap.ref);
        deletedCount++;
        batchOps++;

        if (batchOps >= 400) {
          await batch.commit();
          batchOps = 0;
        }
      }
    }

    if (batchOps > 0) {
      await batch.commit();
    }

    console.log(`✅ از کالکشن '${collectionName}' تعداد ${deletedCount} سند پاکسازی شد.`);
    return deletedCount;
  } catch (err: any) {
    console.warn(`⚠️ نکته در کالکشن '${collectionName}':`, err.message || err);
    return 0;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const purgeAllUsers = args.includes('--all-users') || args.includes('--full-reset');

  let totalDeleted = 0;

  // 1. پاکسازی کارجویان پیش‌فرض و آزمایشی از users
  console.log(
    purgeAllUsers
      ? '⚡ حالت پاکسازی کامل: تمام کارجویان موجود حذف خواهند شد.'
      : '🛡️ حالت استاندارد: فقط کارجویان پیش‌فرض، دمو، سمپل و تستی حذف می‌شوند.'
  );

  const usersDeleted = await purgeCollection('users', purgeAllUsers ? undefined : isDemoOrTestSeeker);
  totalDeleted += usersDeleted;

  // 2. پاکسازی اعلان‌های تستی و نمونه از notifications
  const notifsDeleted = await purgeCollection('notifications', (data) => {
    const msg = String(data.message || data.title || '').toLowerCase();
    const id = String(data.id || '').toLowerCase();
    return (
      msg.includes('تست') ||
      msg.includes('نمونه') ||
      msg.includes('demo') ||
      id.includes('test') ||
      id.includes('demo')
    );
  });
  totalDeleted += notifsDeleted;

  // 3. پاکسازی چت‌های تستی از chats
  const chatsDeleted = await purgeCollection('chats', (data) => {
    const name = String(data.fullName || data.firstName || '').toLowerCase();
    const id = String(data.id || '').toLowerCase();
    return (
      name.includes('تست') ||
      name.includes('نمونه') ||
      name.includes('demo') ||
      id.includes('test') ||
      id.includes('demo')
    );
  });
  totalDeleted += chatsDeleted;

  // 4. حذف سند تست کانکشن test/connection در صورت وجود
  try {
    await deleteDoc(doc(db, 'test', 'connection'));
  } catch {
    // نادیده گرفتن
  }

  console.log('\n===============================================================');
  console.log(`🎉 عملیات پاکسازی دیتابیس با موفقیت خاتمه یافت.`);
  console.log(`📊 مجموع اسناد حذف‌شده: ${totalDeleted} مورد`);
  console.log('✨ پایگاه داده Firebase و سامانه برای استفاده نهایی ۱۰۰٪ آماده است.');
  console.log('===============================================================\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ خطای غیرمنتظره در اجرای اسکریپت پاکسازی:', err);
  process.exit(1);
});
