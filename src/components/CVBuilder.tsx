import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AuthModal } from './AuthModal';
import {
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  Plus,
  Trash2,
  Eye,
  Edit3,
  HelpCircle,
  FileCheck,
  Share2,
  RefreshCw,
  Info,
  Car,
  Flag,
  FileBadge,
  Lock,
} from 'lucide-react';

export interface TurkishCVData {
  // Kişisel Bilgiler
  fullName: string;
  birthDate: string;
  birthPlace: string;
  gender: string;
  maritalStatus: string;
  nationality: string;
  foreignIdNo: string; // Yabancı Kimlik No (99...) veya Pasaport
  residenceStatus: string; // İkamet İzni Durumu
  drivingLicense: string; // Sürücü Belgesi
  militaryStatus: string; // Askerlik Durumu
  phone: string;
  email: string;
  city: string;
  address: string;
  photoUrl: string;

  // Kariyer Hedefi / Özet
  jobTitle: string; // Hedeflenen Pozisyon (Örn: Tekstil Ustası, Garson, Kaynakçı)
  summary: string; // Kariyer Özeti (Türkçe)

  // İş Deneyimi
  experiences: {
    id: string;
    position: string;
    company: string;
    cityCountry: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
  }[];

  // Eğitim
  educations: {
    id: string;
    degree: string; // Lise, Ön Lisans, Lisans, vb.
    school: string;
    department: string;
    graduationYear: string;
  }[];

  // Beceriler
  skills: {
    id: string;
    name: string;
    level: string; // Başlangıç, Orta, İleri, Uzman
  }[];

  // Yabancı Diller
  languages: {
    id: string;
    language: string;
    level: string; // Ana Dil, C2, C1, B2, B1, A2, A1
  }[];

  // Sertifikalar
  certificates: {
    id: string;
    title: string;
    issuer: string;
    year: string;
  }[];

  // Referanslar
  references: {
    id: string;
    name: string;
    companyPosition: string;
    phone: string;
  }[];
}

const SAMPLE_TEMPLATES: Record<string, Partial<TurkishCVData>> = {
  tekstil: {
    jobTitle: 'Tekstil & Konfeksiyon Ustası / Dikiş Makinecisi',
    summary:
      "Tekstil ve hazır giyim sektöründe 6 yılı aşkın deneyime sahip, düz dikiş, overlok ve reçme makinelerini seri ve hatasız kullanabilen dikiş ustasıyım. Model dikimi, kalite kontrol ve yüksek tempolu atölye ortamında ekip çalışmasına uyumluyum. Türkiye'de yasal çalışma izni ile uzun vadeli ve istikrarlı bir iş arıyorum.",
    skills: [
      { id: '1', name: 'Düz Dikiş Makinesi', level: 'Uzman' },
      { id: '2', name: 'Overlok & Reçme', level: 'İleri' },
      { id: '3', name: 'Modelhane & Numune Dikimi', level: 'İleri' },
      { id: '4', name: 'Tekstil Kalite Kontrol', level: 'İleri' },
      { id: '5', name: 'Seri Üretim & Hızlı Montaj', level: 'Uzman' },
    ],
  },
  restoran: {
    jobTitle: 'Deneyimli Garson & Servis Elemanı',
    summary:
      "Restoran ve kafe sektöründe 4 yıllık servis ve misafir karşılama tecrübem bulunmaktadır. Güler yüzlü iletişim, müşteri memnuniyeti, salon düzeni ve POS cihazı kullanımında yetkinim. Yoğun saatlerde hızlı ve soğukkanlı servis yapabilir, vardiyalı çalışma saatlerine ve takım ruhuna tam uyum sağlarım.",
    skills: [
      { id: '1', name: 'Masa Servisi & Misafir Karşılama', level: 'Uzman' },
      { id: '2', name: 'Sipariş Alma & Adisyon Takibi', level: 'İleri' },
      { id: '3', name: 'Sıcak & Soğuk İçecek Servisi', level: 'İleri' },
      { id: '4', name: 'Hijyen & Sanitasyon Kuralları', level: 'Uzman' },
      { id: '5', name: 'POS & Kasa Sistemleri', level: 'Orta' },
    ],
  },
  insaat: {
    jobTitle: 'Gazaltı / Elektrot Kaynakçısı & Demir Ustası',
    summary:
      "Şantiye ve çelik konstrüksiyon imalatında 7 yıllık aktif iş tecrübesine sahibim. MIG/MAG gazaltı ve elektrik ark kaynağı, teknik çizim okuma, montaj ve iş güvenliği (İSG) standartlarına tam uyum ile çalışırım. Ağır iş şartlarına dayanıklı, disiplinli ve uzun süreli çalışmaya hazırım.",
    skills: [
      { id: '1', name: 'MIG / MAG Gazaltı Kaynağı', level: 'Uzman' },
      { id: '2', name: 'Elektrik Ark Kaynağı', level: 'İleri' },
      { id: '3', name: 'Çelik Konstrüksiyon & Montaj', level: 'İleri' },
      { id: '4', name: 'Teknik Resim & Proje Okuma', level: 'Orta' },
      { id: '5', name: 'İş Sağlığı ve Güvenliği (İSG)', level: 'Uzman' },
    ],
  },
  otel: {
    jobTitle: 'Otel Kat Hizmetleri / Resepsiyon Destek Elemanı',
    summary:
      "Turizm ve otelcilik alanında misafir memnuniyeti odaklı çalışan, oda temizliği, kat düzeni ve resepsiyon karşılama süreçlerine hakim personelim. Farsça ve Türkçe dillerinde akıcı iletişim kurabilir, otel hijyen standartlarına titizlikle uyarım.",
    skills: [
      { id: '1', name: 'Oda Temizliği & Kat Hizmetleri (Housekeeping)', level: 'Uzman' },
      { id: '2', name: 'Otel Hijyen & Kimyasal Standartları', level: 'İleri' },
      { id: '3', name: 'Misafir İlişkileri & Karşılama', level: 'İleri' },
      { id: '4', name: 'Çamaşırhane & Ütü Operasyonu', level: 'İleri' },
    ],
  },
};

export const CVBuilder: React.FC = () => {
  const { currentSeeker, showToast, isAdminLoggedIn } = useApp();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const isAccessUnlocked = Boolean(
    isAdminLoggedIn || (currentSeeker && currentSeeker.verificationStatus === 'approved')
  );

  const [cv, setCv] = useState<TurkishCVData>(() => {
    return {
      fullName: currentSeeker?.fullName || 'Ali Reza Ahmadi',
      birthDate: '1995-04-12',
      birthPlace: 'Tahran / İran',
      gender: currentSeeker?.gender === 'female' ? 'Kadın' : 'Erkek',
      maritalStatus: 'Bekar',
      nationality: 'İran (İran İslam Cumhuriyeti)',
      foreignIdNo: currentSeeker?.nationalId ? `99${currentSeeker.nationalId.slice(0, 9)}` : '99876543210',
      residenceStatus: currentSeeker?.residenceStatus === 'tourist'
        ? 'Kısa Dönem İkamet İzni (Var)'
        : currentSeeker?.residenceStatus === 'work_permit'
        ? 'Çalışma İzni (Var)'
        : 'İkamet / Çalışma İzni Başvuru Aşamasında',
      drivingLicense: 'B Sınıfı (Uluslararası / Geçerli)',
      militaryStatus: 'Muaf',
      phone: currentSeeker?.phone || '+90 552 123 4567',
      email: currentSeeker ? `${currentSeeker.username}@karbama.com` : 'ahmadi.work@gmail.com',
      city: currentSeeker?.targetCity || 'İstanbul',
      address: 'Fatih / İstanbul, Türkiye',
      photoUrl:
        currentSeeker?.fullBodyPhotoUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      jobTitle: 'Tekstil & Konfeksiyon Ustası / Dikiş Makinecisi',
      summary:
        "Tekstil ve hazır giyim sektöründe 6 yılı aşkın deneyime sahip, düz dikiş, overlok ve reçme makinelerini seri ve hatasız kullanabilen dikiş ustasıyım. Model dikimi, kalite kontrol ve yüksek tempolu atölye ortamında ekip çalışmasına uyumluyum. Türkiye'de yasal çalışma izni ile uzun vadeli ve istikrarlı bir iş arıyorum.",
      experiences: [
        {
          id: 'exp-1',
          position: 'Dikiş Makinesi Ustası',
          company: 'Moda Tekstil Ltd. Şti.',
          cityCountry: 'Zeytinburnu, İstanbul',
          startDate: '2021',
          endDate: 'Devam Ediyor',
          isCurrent: true,
          description:
            'Gömlek, pantolon ve triko imalatında düz makine ve overlok hatlarında seri dikim operasyonları; günlük 350+ parça kalite standartlarında üretim.',
        },
        {
          id: 'exp-2',
          position: 'Konfeksiyon Elemanı & Kalite Kontrol',
          company: 'Aydın Hazır Giyim',
          cityCountry: 'Tahran / İran',
          startDate: '2018',
          endDate: '2021',
          isCurrent: false,
          description:
            'Dikiş hatası tespiti, ara ütüleme ve paketleme öncesi son kontrol sorumluluğu; usta yardımcılığı.',
        },
      ],
      educations: [
        {
          id: 'edu-1',
          degree: 'Meslek Lisesi / Teknik Diploma',
          school: 'Tahran Teknik ve Meslek Enstitüsü',
          department: 'Tekstil ve Konfeksiyon Teknolojisi',
          graduationYear: '2017',
        },
      ],
      skills: [
        { id: 'sk-1', name: 'Düz Dikiş Makinesi (Sanayi Tipi)', level: 'Uzman' },
        { id: 'sk-2', name: 'Overlok (4 ve 5 İplik)', level: 'İleri' },
        { id: 'sk-3', name: 'Reçme & Etek Kıvırma', level: 'İleri' },
        { id: 'sk-4', name: 'Modelhane ve Numune Çıkarma', level: 'Orta' },
        { id: 'sk-5', name: 'İş Güvenliği & Atölye Düzeni', level: 'Uzman' },
      ],
      languages: [
        { id: 'lang-1', language: 'Farsça (Farsça)', level: 'Ana Dil (C2)' },
        { id: 'lang-2', language: 'Türkçe (Türkçe)', level: 'İyi Düzeyde / Akıcı Konuşma (B2)' },
        { id: 'lang-3', language: 'İngilizce (İngilizce)', level: 'Temel Mesleki (A2)' },
      ],
      certificates: [
        {
          id: 'cert-1',
          title: 'Tekstil Dikiş Operatörü Mesleki Yeterlilik Belgesi',
          issuer: 'Mesleki Eğitim Merkezi',
          year: '2019',
        },
        {
          id: 'cert-2',
          title: 'İş Sağlığı ve Güvenliği Temel Eğitimi',
          issuer: 'İSG Onaylı Eğitim',
          year: '2022',
        },
      ],
      references: [
        {
          id: 'ref-1',
          name: 'Mehmet Yılmaz',
          companyPosition: 'Moda Tekstil / Atölye Şefi',
          phone: '+90 532 999 8877',
        },
      ],
    };
  });

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('preview');
  const [copied, setCopied] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('İleri');

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Trigger standard browser print with print-tailored CSS
  const handlePrint = () => {
    if (!isAccessUnlocked) {
      showToast('امکان پرینت و خروجی رسمی رزومه قفل است؛ این بخش پس از ثبت‌نام، تسویه ۵۰۰ لیر و تایید مدیر فعال خواهد شد.', 'error');
      setAuthModalOpen(true);
      return;
    }

    // Switch to preview first if currently in edit
    if (activeTab !== 'preview') {
      setActiveTab('preview');
      setTimeout(() => {
        window.print();
      }, 200);
    } else {
      window.print();
    }
  };

  // Copy plain-text Turkish CV to clipboard for WhatsApp/Telegram/Recruiters
  const handleCopyText = async () => {
    if (!isAccessUnlocked) {
      showToast('کپی متن رزومه به کارفرما قفل است؛ جهت فعال‌سازی حساب، پرداخت ۵۰۰ لیر و تایید مدیر الزامی است.', 'error');
      setAuthModalOpen(true);
      return;
    }

    const textCV = `
=============================================
ÖZGEÇMİŞ / CURRICULUM VITAE (CV)
=============================================
Ad Soyad: ${cv.fullName}
Pozisyon / Görev: ${cv.jobTitle}
Telefon: ${cv.phone}
E-posta: ${cv.email}
Konum / Şehir: ${cv.city}, Türkiye
Adres: ${cv.address}

KİŞİSEL BİLGİLER:
- Uyruk: ${cv.nationality}
- Yabancı Kimlik / Pasaport: ${cv.foreignIdNo}
- İkamet İzni Durumu: ${cv.residenceStatus}
- Sürücü Belgesi: ${cv.drivingLicense}
- Askerlik Durumu: ${cv.militaryStatus}
- Doğum: ${cv.birthDate} (${cv.birthPlace})
- Medeni Durum: ${cv.maritalStatus}

KARİYER ÖZETİ:
${cv.summary}

İŞ DENEYİMLERİ:
${cv.experiences
  .map(
    (e) => `• ${e.position} | ${e.company} (${e.cityCountry})
  Tarih: ${e.startDate} - ${e.endDate}
  Açıklama: ${e.description}`
  )
  .join('\n\n')}

EĞİTİM BİLGİLERİ:
${cv.educations
  .map((ed) => `• ${ed.degree} - ${ed.department} | ${ed.school} (${ed.graduationYear})`)
  .join('\n')}

MESLEKİ BECERİLER:
${cv.skills.map((s) => `• ${s.name} (${s.level})`).join(' | ')}

YABANCI DİLLER:
${cv.languages.map((l) => `• ${l.language}: ${l.level}`).join('\n')}

SERTİFİKALAR:
${cv.certificates.map((c) => `• ${c.title} - ${c.issuer} (${c.year})`).join('\n')}

REFERANSLAR:
${cv.references.map((r) => `• ${r.name} (${r.companyPosition}) - Tel: ${r.phone}`).join('\n')}
=============================================
Karbama (کارباما) İş ve İstihdam Sistemi ile Oluşturulmuştur.
    `.trim();

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textCV);
      }
      setCopied(true);
      showToast('متن رزومه به زبان ترکی با موفقیت کپی شد', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('خطا در کپی متن رزومه', 'error');
    }
  };

  // Apply a sample industry preset
  const handleApplyPreset = (key: string) => {
    if (!isAccessUnlocked) {
      showToast('بارگذاری قالب‌های شرکتی قفل است؛ ابتدا در سامانه ثبت‌نام نمایید.', 'error');
      setAuthModalOpen(true);
      return;
    }

    const template = SAMPLE_TEMPLATES[key];
    if (template) {
      setCv((prev) => ({
        ...prev,
        ...template,
      }));
      showToast('قالب و متن استاندارد ترکیه‌ای با موفقیت بارگذاری شد', 'success');
    }
  };

  // Add Experience
  const handleAddExperience = () => {
    setCv((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          id: 'exp-' + Date.now(),
          position: '',
          company: '',
          cityCountry: 'İstanbul, Türkiye',
          startDate: '2022',
          endDate: 'Devam Ediyor',
          isCurrent: true,
          description: '',
        },
      ],
    }));
  };

  const handleRemoveExperience = (id: string) => {
    setCv((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((e) => e.id !== id),
    }));
  };

  // Add Education
  const handleAddEducation = () => {
    setCv((prev) => ({
      ...prev,
      educations: [
        ...prev.educations,
        {
          id: 'edu-' + Date.now(),
          degree: 'Lise / Ön Lisans',
          school: '',
          department: '',
          graduationYear: '2020',
        },
      ],
    }));
  };

  const handleRemoveEducation = (id: string) => {
    setCv((prev) => ({
      ...prev,
      educations: prev.educations.filter((e) => e.id !== id),
    }));
  };

  // Add Skill
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setCv((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          id: 'sk-' + Date.now(),
          name: newSkillName.trim(),
          level: newSkillLevel,
        },
      ],
    }));
    setNewSkillName('');
  };

  const handleRemoveSkill = (id: string) => {
    setCv((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
    }));
  };

  // Add Language
  const handleAddLanguage = () => {
    setCv((prev) => ({
      ...prev,
      languages: [
        ...prev.languages,
        {
          id: 'lang-' + Date.now(),
          language: 'İngilizce',
          level: 'B1 (Orta Düzey)',
        },
      ],
    }));
  };

  const handleRemoveLanguage = (id: string) => {
    setCv((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l.id !== id),
    }));
  };

  // Add Certificate
  const handleAddCertificate = () => {
    setCv((prev) => ({
      ...prev,
      certificates: [
        ...prev.certificates,
        {
          id: 'cert-' + Date.now(),
          title: '',
          issuer: '',
          year: new Date().getFullYear().toString(),
        },
      ],
    }));
  };

  const handleRemoveCertificate = (id: string) => {
    setCv((prev) => ({
      ...prev,
      certificates: prev.certificates.filter((c) => c.id !== id),
    }));
  };

  // Add Reference
  const handleAddReference = () => {
    setCv((prev) => ({
      ...prev,
      references: [
        ...prev.references,
        {
          id: 'ref-' + Date.now(),
          name: '',
          companyPosition: '',
          phone: '',
        },
      ],
    }));
  };

  const handleRemoveReference = (id: string) => {
    setCv((prev) => ({
      ...prev,
      references: prev.references.filter((r) => r.id !== id),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Global Locked Notice Banner for Non-registered or Unapproved Seeker */}
      {!isAccessUnlocked && (
        <div className="bg-gradient-to-r from-red-950/90 via-slate-900 to-amber-950/80 border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-amber-200">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-sm sm:text-base">
                  تمامی امکانات صدور و دانلود رزومه رسمی قفل است
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                  قفل امنیتی کارباما
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                {!currentSeeker
                  ? 'در حالت عادی و بدون ثبت‌نام، امکان پرینت، خروجی PDF و ارسال متن رسمی رزومه به کارفرمایان قفل می‌باشد. برای بازگشایی کامل، ابتدا ثبت‌نام کرده و پس از تسویه وجه (۵۰۰ لیر) و تایید مدیر، رزومه شما با سربرگ رسمی تاییدشده صادر می‌شود.'
                  : 'حساب شما ثبت شده اما در انتظار واریز وجه ۵۰۰ لیر و تایید نهایی مدیر سامانه است. پس از تایید مدیر، قابلیت چاپ و دانلود رزومه فعال می‌گردد.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!currentSeeker ? (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-700/30 transition flex items-center gap-1.5"
              >
                <User className="w-4 h-4" />
                <span>ثبت‌نام و فعال‌سازی حساب</span>
              </button>
            ) : (
              <span className="px-4 py-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold">
                در انتظار تایید مدیر ⏳
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top Header & Intro */}
      <div className="rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border border-red-500/30 p-6 sm:p-8 shadow-xl print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src="/logo.png"
              alt="کارباما"
              className="w-14 h-14 rounded-full object-cover border-2 border-amber-400/80 shadow-lg shrink-0 mt-1"
            />
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-500/30 text-xs font-semibold">
                <FileCheck className="w-3.5 h-3.5" />
                رزومه‌ساز رسمی کارباما (Standart Türk CV Formatı)
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                ساخت رزومه رسمی کارفرمایان ترکیه (Özgeçmiş)
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                مشخصات حرفه‌ای، تجربیات کاری و مهارت‌های خود را وارد کنید تا به‌صورت خودکار یک رزومه اداری و استاندارد به زبان ترکی با قالب A4 آماده چاپ (Print-Ready) و ذخیره PDF جهت ارسال به شرکت‌ها و کارفرمایان ترکیه تولید شود.
              </p>
            </div>
          </div>

          {/* Quick Actions (Print, Copy, Mode Switch) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg ${
                isAccessUnlocked
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-700/30'
                  : 'bg-slate-800 text-amber-300 border border-amber-500/30 hover:bg-slate-700'
              }`}
              title={isAccessUnlocked ? 'پرینت مستقیم یا ذخیره به صورت فایل PDF' : 'قفل است (نیازمند ثبت‌نام و تایید ۵۰۰ لیر)'}
            >
              {isAccessUnlocked ? <Printer className="w-4 h-4" /> : <Lock className="w-4 h-4 text-amber-400" />}
              <span>{isAccessUnlocked ? 'پرینت / دانلود PDF' : 'پرینت / PDF (قفل 🔒)'}</span>
            </button>

            <button
              onClick={handleCopyText}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                isAccessUnlocked
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-800 text-amber-300/90 border-amber-500/30 hover:bg-slate-700'
              }`}
              title={isAccessUnlocked ? 'کپی متن رزومه به ترکی جهت ارسال در واتساپ و تلگرام' : 'قفل است (نیازمند ثبت‌نام و تایید ۵۰۰ لیر)'}
            >
              {isAccessUnlocked ? (
                copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{copied ? 'کپی شد' : isAccessUnlocked ? 'کپی متن ترکی' : 'کپی متن (قفل 🔒)'}</span>
            </button>
          </div>
        </div>

        {/* Industry Fast Templates Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] text-slate-400 shrink-0 font-medium ml-1">
            ⚡ قالب‌های آماده بر اساس شغل:
          </span>
          <button
            onClick={() => handleApplyPreset('tekstil')}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs shrink-0 transition"
          >
            🧵 خیاطی و چرخکاری
          </button>
          <button
            onClick={() => handleApplyPreset('restoran')}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs shrink-0 transition"
          >
            🍽️ رستوران و سالن‌کاری
          </button>
          <button
            onClick={() => handleApplyPreset('insaat')}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs shrink-0 transition"
          >
            🏗️ جوشکاری و ساختمانی
          </button>
          <button
            onClick={() => handleApplyPreset('otel')}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs shrink-0 transition"
          >
            🏨 هتل و پذیرش
          </button>
        </div>
      </div>

      {/* Tabs Switcher: Edit Form vs Print-Preview */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'preview'
                ? 'bg-red-600 text-white shadow-md shadow-red-700/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            پیش‌نمایش استاندارد ترکی (Özgeçmiş A4)
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'edit'
                ? 'bg-red-600 text-white shadow-md shadow-red-700/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            ویرایش مشخصات و اطلاعات کارجو
          </button>
        </div>

        <div className="text-[11px] text-slate-400 hidden sm:block">
          💡 برای بهترین نتیجه در پرینت یا ذخیره PDF، تیک «Background graphics» را در پنجره مرورگر فعال نگه دارید.
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. EDIT MODE: Bilingual Persian / Turkish Forms */}
      {/* ========================================================================= */}
      {activeTab === 'edit' && (
        <div className="space-y-6 print:hidden">
          {/* Section A: Personal Details (Kişisel Bilgiler) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-4 h-4 text-red-500" />
              ۱. مشخصات فردی و هویتی (Kişisel Bilgiler)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  نام و نام خانوادگی به انگلیسی (Ad Soyad) *
                </label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="e.g. Ali Reza Ahmadi"
                  value={cv.fullName}
                  onChange={(e) => setCv({ ...cv, fullName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  عنوان شغلی / تخصص هدف (Hedef Pozisyon) *
                </label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="e.g. Tekstil Ustası, Garson, Kaynakçı"
                  value={cv.jobTitle}
                  onChange={(e) => setCv({ ...cv, jobTitle: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  شماره تماس / واتساپ (Telefon / WhatsApp) *
                </label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="+90 5xx xxx xxxx"
                  value={cv.phone}
                  onChange={(e) => setCv({ ...cv, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  ایمیل (E-posta)
                </label>
                <input
                  type="email"
                  dir="ltr"
                  placeholder="name@email.com"
                  value={cv.email}
                  onChange={(e) => setCv({ ...cv, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  شماره کیملیک خارجی یا پاسپورت (Yabancı Kimlik No / Pasaport)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="99... veya Pasaport No"
                  value={cv.foreignIdNo}
                  onChange={(e) => setCv({ ...cv, foreignIdNo: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  وضعیت اقامت در ترکیه (İkamet İzni Durumu)
                </label>
                <select
                  value={cv.residenceStatus}
                  onChange={(e) => setCv({ ...cv, residenceStatus: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-red-500"
                >
                  <option value="Kısa Dönem İkamet İzni (Var)">Kısa Dönem İkamet İzni (دارای اقامت کوتاه‌مدت)</option>
                  <option value="Çalışma İzni (Var)">Çalışma İzni (دارای مجوز کار رسمی)</option>
                  <option value="İkamet / Çalışma İzni Başvuru Aşamasında">Başvuru Aşamasında (در مرحله درخواست اقامت/کار)</option>
                  <option value="Turist Vizesi / Giriş Aşamasında">Turist / Giriş Aşamasında (متقاضی ورود / توریستی)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  تاریخ و محل تولد (Doğum Tarihi & Yeri)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="YYYY-MM-DD"
                    value={cv.birthDate}
                    onChange={(e) => setCv({ ...cv, birthDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="Şehir / Ülke"
                    value={cv.birthPlace}
                    onChange={(e) => setCv({ ...cv, birthPlace: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  گواهینامه رانندگی (Sürücü Belgesi / Ehliyet)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="B Sınıfı, C Sınıfı veya Yok"
                  value={cv.drivingLicense}
                  onChange={(e) => setCv({ ...cv, drivingLicense: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  وضعیت خدمت سربازی (Askerlik Durumu)
                </label>
                <select
                  value={cv.militaryStatus}
                  onChange={(e) => setCv({ ...cv, militaryStatus: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-red-500"
                >
                  <option value="Muaf">Muaf (معاف از خدمت)</option>
                  <option value="Yapıldı">Yapıldı (انجام شده / پایان خدمت)</option>
                  <option value="Tecilli">Tecilli (دارای معافیت تحصیلی/موقت)</option>
                  <option value="Muaf (Kadın)">Muaf - Kadın (خانم‌ها)</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-slate-300 font-bold mb-1">
                  نشانی سکونت در ترکیه یا ایران (Adres / Şehir)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="e.g. Fatih, İstanbul / Türkiye"
                  value={cv.address}
                  onChange={(e) => setCv({ ...cv, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Section B: Career Objective / Summary (Kariyer Özeti) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              ۲. خلاصه حرفه‌ای و انگیزه کاری (Kariyer Hedefi & Özet)
            </h3>
            <p className="text-xs text-slate-400">
              این متن اولین بخشی است که کارفرمای ترک در رزومه شما می‌خواند. می‌توانید از متن پیش‌فرض ترکی استفاده کنید یا آن را تغییر دهید.
            </p>
            <textarea
              rows={4}
              dir="ltr"
              value={cv.summary}
              onChange={(e) => setCv({ ...cv, summary: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-xs text-white leading-relaxed focus:outline-hidden focus:border-red-500 font-sans"
              placeholder="Türkiye'de çalışma tecrübenizi, becerilerinizi ve hedeflerinizi anlatan profesyonel özet..."
            />
          </div>

          {/* Section C: Work Experiences (İş Deneyimi) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                ۳. سوابق و تجربیات شغلی (İş Deneyimi) ({cv.experiences.length})
              </h3>
              <button
                type="button"
                onClick={handleAddExperience}
                className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                افزودن سابقه کاری جدید
              </button>
            </div>

            <div className="space-y-4">
              {cv.experiences.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3 relative text-xs"
                >
                  <button
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="absolute top-3 left-3 text-slate-400 hover:text-red-400 p-1 rounded-lg"
                    title="حذف سابقه"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="font-bold text-slate-300">
                    سابقه کاری شماره {idx + 1}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">سمت / عنوان شغل (Pozisyon) *</label>
                      <input
                        type="text"
                        dir="ltr"
                        placeholder="Örn: Dikiş Ustası, Garson"
                        value={exp.position}
                        onChange={(e) => {
                          const updated = [...cv.experiences];
                          updated[idx].position = e.target.value;
                          setCv({ ...cv, experiences: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">نام شرکت / کارگاه (Şirket Adı) *</label>
                      <input
                        type="text"
                        dir="ltr"
                        placeholder="Örn: Moda Tekstil Ltd."
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...cv.experiences];
                          updated[idx].company = e.target.value;
                          setCv({ ...cv, experiences: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">شهر و کشور (Şehir / Ülke)</label>
                      <input
                        type="text"
                        dir="ltr"
                        placeholder="İstanbul / Türkiye"
                        value={exp.cityCountry}
                        onChange={(e) => {
                          const updated = [...cv.experiences];
                          updated[idx].cityCountry = e.target.value;
                          setCv({ ...cv, experiences: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">بازه زمانی (Yıl / Tarih)</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          dir="ltr"
                          placeholder="Başlangıç (2020)"
                          value={exp.startDate}
                          onChange={(e) => {
                            const updated = [...cv.experiences];
                            updated[idx].startDate = e.target.value;
                            setCv({ ...cv, experiences: updated });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-white text-[11px]"
                        />
                        <input
                          type="text"
                          dir="ltr"
                          placeholder="Bitiş (Halen)"
                          value={exp.endDate}
                          onChange={(e) => {
                            const updated = [...cv.experiences];
                            updated[idx].endDate = e.target.value;
                            setCv({ ...cv, experiences: updated });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-white text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">شرح وظایف و کارهای انجام شده (Görev Tanımı ve Sorumluluklar)</label>
                    <textarea
                      rows={2}
                      dir="ltr"
                      placeholder="Yapılan işler, kullanılan makineler veya başarılar..."
                      value={exp.description}
                      onChange={(e) => {
                        const updated = [...cv.experiences];
                        updated[idx].description = e.target.value;
                        setCv({ ...cv, experiences: updated });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section D: Education (Eğitim Bilgileri) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                ۴. مدارک تحصیلی (Eğitim Bilgileri) ({cv.educations.length})
              </h3>
              <button
                type="button"
                onClick={handleAddEducation}
                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                افزودن مدرک
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cv.educations.map((edu, idx) => (
                <div
                  key={edu.id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3 relative text-xs"
                >
                  <button
                    onClick={() => handleRemoveEducation(edu.id)}
                    className="absolute top-3 left-3 text-slate-400 hover:text-red-400 p-1 rounded-lg"
                    title="حذف مدرک"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div>
                    <label className="block text-slate-400 mb-1">مقطع / نوع مدرک (Derece)</label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="Lise, Ön Lisans, Lisans, Meslek Okulu"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...cv.educations];
                        updated[idx].degree = e.target.value;
                        setCv({ ...cv, educations: updated });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">نام دانشگاه یا مدرسه (Okul / Üniversite)</label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="Okul adı"
                      value={edu.school}
                      onChange={(e) => {
                        const updated = [...cv.educations];
                        updated[idx].school = e.target.value;
                        setCv({ ...cv, educations: updated });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">رشته (Bölüm)</label>
                      <input
                        type="text"
                        dir="ltr"
                        placeholder="Bölüm"
                        value={edu.department}
                        onChange={(e) => {
                          const updated = [...cv.educations];
                          updated[idx].department = e.target.value;
                          setCv({ ...cv, educations: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">سال فراغت (Mezuniyet)</label>
                      <input
                        type="text"
                        dir="ltr"
                        placeholder="2018"
                        value={edu.graduationYear}
                        onChange={(e) => {
                          const updated = [...cv.educations];
                          updated[idx].graduationYear = e.target.value;
                          setCv({ ...cv, educations: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section E: Skills & Languages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Award className="w-4 h-4 text-purple-400" />
                ۵. مهارت‌های فنی و تخصصی (Beceriler)
              </h3>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  dir="ltr"
                  placeholder="Beceri adı (Örn: Dikiş, Kaynak, POS Cihazı)"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white"
                >
                  <option value="Uzman">Uzman (متخصص)</option>
                  <option value="İleri">İleri (پیشرفته)</option>
                  <option value="Orta">Orta (متوسط)</option>
                  <option value="Temel">Temel (مقدماتی)</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
                >
                  افزودن
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {cv.skills.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs"
                  >
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-[10px] text-purple-400 font-mono">({s.level})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s.id)}
                      className="text-slate-400 hover:text-red-400 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  ۶. زبان‌های خارجی (Yabancı Diller)
                </h3>
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="px-2.5 py-1 bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold"
                >
                  + زبان جدید
                </button>
              </div>

              <div className="space-y-3">
                {cv.languages.map((l, idx) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between gap-3 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 text-xs"
                  >
                    <input
                      type="text"
                      dir="ltr"
                      value={l.language}
                      onChange={(e) => {
                        const updated = [...cv.languages];
                        updated[idx].language = e.target.value;
                        setCv({ ...cv, languages: updated });
                      }}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                    <select
                      value={l.level}
                      onChange={(e) => {
                        const updated = [...cv.languages];
                        updated[idx].level = e.target.value;
                        setCv({ ...cv, languages: updated });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-[11px]"
                    >
                      <option value="Ana Dil (C2)">Ana Dil (زبان مادری)</option>
                      <option value="İleri Düzey (C1)">C1 - İleri (پیشرفته و روان)</option>
                      <option value="İyi Düzeyde / Akıcı Konuşma (B2)">B2 - İyi Düzey (مکالمه کاری روان)</option>
                      <option value="Orta Düzey (B1)">B1 - Orta (متوسط)</option>
                      <option value="Temel Düzey (A2)">A2 - Temel (مقدماتی)</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(l.id)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons at bottom of edit form */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setActiveTab('preview');
                showToast('پیش‌نمایش سند رزومه ترکیه‌ای آماده مشاهده است', 'success');
              }}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl text-xs shadow-xl transition flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>مشاهده و ذخیره پیش‌نمایش نهایی (Özgeçmiş A4)</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STANDARDIZED TURKISH CV (ÖZGEÇMİŞ) A4 PRINTER-FRIENDLY LAYOUT */}
      {/* ========================================================================= */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          {/* Print Toolbar Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden shadow-md">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>
                <strong>قالب استاندارد کارفرمایان ترکیه (Özgeçmiş / CV):</strong> این نسخه با ابعاد استاندارد A4 تنظیم شده و در پرینت به‌صورت کاملاً تمیز و بدون دکمه‌های اضافه چاپ می‌شود.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow transition"
              >
                <Printer className="w-4 h-4" />
                <span>پرینت / ذخیره به عنوان PDF</span>
              </button>

              <button
                onClick={handleCopyText}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                <span>کپی متن برای واتساپ</span>
              </button>
            </div>
          </div>

          {/* THE PRINTABLE A4 TURKISH CV DOCUMENT */}
          <div
            ref={printAreaRef}
            id="karbama-turkish-cv-document"
            className="w-full max-w-[850px] mx-auto bg-white text-slate-900 shadow-2xl rounded-2xl border border-slate-200 p-8 sm:p-12 font-sans transition-all print:p-0 print:m-0 print:border-none print:shadow-none print:w-full print:max-w-none print:text-black"
            dir="ltr"
            style={{
              fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            }}
          >
            {/* CV Header: Candidate Name, Title, and Contact Grid */}
            <header className="border-b-2 border-red-700 pb-6 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase">
                      {cv.fullName || 'AD SOYAD'}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded bg-red-100 text-red-800 text-[11px] font-extrabold tracking-wide print:border print:border-red-300">
                      ÖZGEÇMİŞ / CV
                    </span>
                  </div>

                  <p className="text-base font-bold text-red-700 tracking-wide uppercase">
                    {cv.jobTitle || 'HEDEF POZİSYON'}
                  </p>

                  <p className="text-xs text-slate-600 font-medium pt-1">
                    Uyruk: <span className="font-semibold text-slate-900">{cv.nationality}</span> | YKN / Pasaport:{' '}
                    <span className="font-mono font-semibold text-slate-900">{cv.foreignIdNo}</span>
                  </p>
                </div>

                {/* Optional Candidate Photo / Badge */}
                <div className="shrink-0 text-center">
                  <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-slate-300 bg-slate-100 shadow-xs flex items-center justify-center">
                    {cv.photoUrl ? (
                      <img
                        src={cv.photoUrl}
                        alt={cv.fullName}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center">
                        <User className="w-8 h-8" />
                        <span className="text-[9px] mt-1">FOTOĞRAF</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fast Contact Strip */}
              <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-red-700 shrink-0" />
                  <span className="font-mono font-bold text-slate-900">{cv.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-red-700 shrink-0" />
                  <span className="font-mono truncate">{cv.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-700 shrink-0" />
                  <span className="truncate">{cv.address || cv.city}</span>
                </div>
              </div>
            </header>

            {/* Main CV Body Grid (Two-Column Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column (1/3): Personal info, Languages, Skills */}
              <div className="space-y-6 md:border-r md:border-slate-200 md:pr-6">
                {/* Kişisel Bilgiler */}
                <section className="space-y-2.5">
                  <h2 className="text-xs font-black uppercase text-red-700 tracking-wider border-b border-red-200 pb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    KİŞİSEL BİLGİLER
                  </h2>
                  <div className="text-xs space-y-1.5 text-slate-700">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Doğum Tarihi / Yeri:</span>
                      <span className="font-semibold text-slate-900">
                        {cv.birthDate} ({cv.birthPlace})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">İkamet İzni Durumu:</span>
                      <span className="font-semibold text-slate-900">{cv.residenceStatus}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Sürücü Belgesi:</span>
                      <span className="font-semibold text-slate-900">{cv.drivingLicense}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Askerlik Durumu:</span>
                      <span className="font-semibold text-slate-900">{cv.militaryStatus}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Medeni Durum:</span>
                      <span className="font-semibold text-slate-900">{cv.maritalStatus}</span>
                    </div>
                  </div>
                </section>

                {/* Yabancı Diller */}
                {cv.languages.length > 0 && (
                  <section className="space-y-2.5">
                    <h2 className="text-xs font-black uppercase text-red-700 tracking-wider border-b border-red-200 pb-1 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      YABANCI DİLLER
                    </h2>
                    <div className="space-y-2 text-xs">
                      {cv.languages.map((l) => (
                        <div key={l.id} className="space-y-0.5">
                          <div className="flex justify-between font-bold text-slate-900 text-xs">
                            <span>{l.language}</span>
                            <span className="text-slate-600 font-normal text-[11px]">{l.level}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden print:border print:border-slate-300">
                            <div
                              className="bg-red-700 h-full rounded-full"
                              style={{
                                width: l.level.includes('Ana Dil')
                                  ? '100%'
                                  : l.level.includes('C1')
                                  ? '90%'
                                  : l.level.includes('B2')
                                  ? '75%'
                                  : l.level.includes('B1')
                                  ? '60%'
                                  : '40%',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Mesleki Beceriler */}
                {cv.skills.length > 0 && (
                  <section className="space-y-2.5">
                    <h2 className="text-xs font-black uppercase text-red-700 tracking-wider border-b border-red-200 pb-1 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      YETKİNLİKLER & BECERİLER
                    </h2>
                    <ul className="space-y-1.5 text-xs text-slate-800">
                      {cv.skills.map((s) => (
                        <li key={s.id} className="flex items-start gap-1.5">
                          <span className="text-red-700 font-bold text-sm leading-none">•</span>
                          <div>
                            <span className="font-semibold text-slate-900">{s.name}</span>
                            {s.level && (
                              <span className="text-[10px] text-slate-500 ml-1">({s.level})</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Sertifikalar */}
                {cv.certificates.length > 0 && (
                  <section className="space-y-2.5">
                    <h2 className="text-xs font-black uppercase text-red-700 tracking-wider border-b border-red-200 pb-1 flex items-center gap-1.5">
                      <FileBadge className="w-3.5 h-3.5" />
                      SERTİFİKALAR & KURSLAR
                    </h2>
                    <div className="space-y-2 text-xs">
                      {cv.certificates.map((c) => (
                        <div key={c.id}>
                          <p className="font-bold text-slate-900">{c.title}</p>
                          <p className="text-[11px] text-slate-600">
                            {c.issuer} {c.year ? `(${c.year})` : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Right Column (2/3): Career Summary, Experience, Education, References */}
              <div className="md:col-span-2 space-y-6">
                {/* Kariyer Özeti */}
                {cv.summary && (
                  <section className="space-y-2">
                    <h2 className="text-xs font-black uppercase text-red-700 tracking-wider border-b border-red-200 pb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      ÖZET BİLGİ & KARİYER HEDEFİ
                    </h2>
                    <p className="text-xs text-slate-800 leading-relaxed text-justify bg-slate-50 p-3.5 rounded-xl border border-slate-100 print:bg-transparent print:border-none print:p-0">
                      {cv.summary}
                    </p>
                  </section>
                )}

                {/* İş Deneyimleri */}
                {cv.experiences.length > 0 && (
                  <section className="space-y-3">
                    <h2 className="text-xs font-black uppercase text-red-700 tracking-wider border-b border-red-200 pb-1 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      İŞ DENEYİMİ (İŞ TECRÜBELERİ)
                    </h2>
                    <div className="space-y-4">
                      {cv.experiences.map((exp) => (
                        <div key={exp.id} className="space-y-1 relative pl-3 border-l-2 border-red-700/60">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h3 className="font-bold text-xs text-slate-950 uppercase">
                              {exp.position}
                            </h3>
                            <span className="text-[11px] font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded print:bg-transparent">
                              {exp.startDate} – {exp.endDate}
                            </span>
                          </div>

                          <div className="text-xs text-slate-700 font-semibold">
                            {exp.company} <span className="text-slate-400 font-normal">| {exp.cityCountry}</span>
                          </div>

                          {exp.description && (
                            <p className="text-xs text-slate-600 leading-relaxed pt-1">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Eğitim Bilgileri */}
                {cv.educations.length > 0 && (
                  <section className="space-y-3">
                    <h2 className="text-xs font-black uppercase text-red-700 tracking-wider border-b border-red-200 pb-1 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      EĞİTİM BİLGİLERİ
                    </h2>
                    <div className="space-y-3">
                      {cv.educations.map((edu) => (
                        <div key={edu.id} className="relative pl-3 border-l-2 border-slate-300 space-y-0.5">
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-bold text-xs text-slate-900">{edu.school}</h3>
                            <span className="text-[11px] font-mono text-slate-500 font-semibold">
                              {edu.graduationYear}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700">
                            <span className="font-medium text-slate-900">{edu.degree}</span> – {edu.department}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Referanslar */}
                {cv.references.length > 0 && (
                  <section className="space-y-2">
                    <h2 className="text-xs font-black uppercase text-red-700 tracking-wider border-b border-red-200 pb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      REFERANSLAR
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {cv.references.map((r) => (
                        <div key={r.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 print:bg-transparent">
                          <p className="font-bold text-slate-900">{r.name}</p>
                          <p className="text-[11px] text-slate-600">{r.companyPosition}</p>
                          {r.phone && <p className="text-[11px] font-mono text-slate-800 font-semibold pt-0.5">{r.phone}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* CV Footer Note */}
            <footer className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <img src="/logo.png" alt="Karbama" className="w-4 h-4 rounded-full object-cover" />
                <span>Bu özgeçmiş Karbama (کارباما) İş ve İstihdam Sistemi ile oluşturulmuştur.</span>
              </div>
              <span className="font-mono">Tarih: {new Date().toLocaleDateString('tr-TR')}</span>
            </footer>
          </div>
        </div>
      )}

      {/* Auth Modal for Unlocked Feature Registration/Login */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="login"
      />
    </div>
  );
};
