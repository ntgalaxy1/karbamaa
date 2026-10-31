import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  SeekerResume,
  EducationEntry,
  ExperienceEntry,
  PortfolioItem,
  LanguageSkill,
  TurkishLevel,
  ResidenceStatus,
} from '../types';
import {
  FileText,
  Printer,
  Download,
  Share2,
  ExternalLink,
  Plus,
  Trash2,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Sparkles,
  CheckCircle2,
  Eye,
  Edit3,
  Link as LinkIcon,
  Phone,
  MapPin,
  Calendar,
  Building2,
  FileCheck2,
  User,
  Copy,
  Check,
  Lock,
} from 'lucide-react';

export const ResumeBuilder: React.FC = () => {
  const { currentSeeker, updateResume, showToast, isAdminLoggedIn } = useApp();

  // If no seeker is logged in
  if (!currentSeeker) {
    return null;
  }

  const isAccessUnlocked = Boolean(
    isAdminLoggedIn || (currentSeeker && currentSeeker.verificationStatus === 'approved')
  );

  const existingResume: SeekerResume = currentSeeker.resume || {
    headline: 'کارجوی جویای کار در ترکیه',
    summary: currentSeeker.bio || 'دارای انگیزه بالا و متعهد به کار، آماده همکاری با کارفرمایان ترکیه.',
    education: [
      {
        id: 'edu-' + Date.now(),
        degree: 'دیپلم',
        field: 'عمومی',
        institution: 'دبیرستان',
        city: 'ایران',
        graduationYear: '۱۳۹۸',
      },
    ],
    experience: [
      {
        id: 'exp-' + Date.now(),
        title: 'همکار فروش و امور سالن',
        company: 'مجموعه تجاری و پذیرایی',
        city: 'تهران',
        startDate: '۱۴۰۰',
        endDate: '۱۴۰۲',
        isCurrent: false,
        description: 'پاسخگویی به مراجعین، هماهنگی امور اجرایی و کنترل کیفیت سفارش‌ها.',
      },
    ],
    skillsList: currentSeeker.skills && currentSeeker.skills.length > 0 ? currentSeeker.skills : ['انضباط کاری', 'آشنایی با ترکی'],
    languages: [
      { id: 'l-1', language: 'فارسی', level: 'زبان مادری' },
      { id: 'l-2', language: 'ترکی استانبولی', level: 'مکالمه کاری' },
    ],
    portfolio: [
      {
        id: 'p-1',
        title: 'مدرک فنی و حرفه‌ای / گواهی مهارت',
        type: 'certificate',
        url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
        description: 'گواهینامه دوره‌های تخصصی',
      },
    ],
  };

  // State
  const [headline, setHeadline] = useState(existingResume.headline || '');
  const [summary, setSummary] = useState(existingResume.summary || '');
  const [education, setEducation] = useState<EducationEntry[]>(existingResume.education || []);
  const [experience, setExperience] = useState<ExperienceEntry[]>(existingResume.experience || []);
  const [skillsList, setSkillsList] = useState<string[]>(existingResume.skillsList || []);
  const [skillInput, setSkillInput] = useState('');
  const [languages, setLanguages] = useState<LanguageSkill[]>(existingResume.languages || []);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(existingResume.portfolio || []);
  
  // UI Tabs
  const [activeSubTab, setActiveSubTab] = useState<'form' | 'preview'>('form');
  const [copiedLink, setCopiedLink] = useState(false);

  // Add Education item
  const handleAddEducation = () => {
    const newEdu: EducationEntry = {
      id: 'edu-' + Date.now(),
      degree: '',
      field: '',
      institution: '',
      city: '',
      graduationYear: '',
    };
    setEducation([...education, newEdu]);
  };

  const handleRemoveEducation = (id: string) => {
    setEducation(education.filter((e) => e.id !== id));
  };

  const handleUpdateEducation = (id: string, field: keyof EducationEntry, value: string) => {
    setEducation(
      education.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  // Add Experience item
  const handleAddExperience = () => {
    const newExp: ExperienceEntry = {
      id: 'exp-' + Date.now(),
      title: '',
      company: '',
      city: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    };
    setExperience([...experience, newExp]);
  };

  const handleRemoveExperience = (id: string) => {
    setExperience(experience.filter((e) => e.id !== id));
  };

  const handleUpdateExperience = (
    id: string,
    field: keyof ExperienceEntry,
    value: string | boolean
  ) => {
    setExperience(
      experience.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  // Skill management
  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    if (!skillsList.includes(skillInput.trim())) {
      setSkillsList([...skillsList, skillInput.trim()]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillsList(skillsList.filter((s) => s !== skill));
  };

  // Language management
  const handleAddLanguage = () => {
    const newLang: LanguageSkill = {
      id: 'lang-' + Date.now(),
      language: '',
      level: 'متوسط',
    };
    setLanguages([...languages, newLang]);
  };

  const handleRemoveLanguage = (id: string) => {
    setLanguages(languages.filter((l) => l.id !== id));
  };

  const handleUpdateLanguage = (id: string, field: keyof LanguageSkill, value: string) => {
    setLanguages(
      languages.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  // Portfolio management
  const handleAddPortfolio = () => {
    const newItem: PortfolioItem = {
      id: 'port-' + Date.now(),
      title: '',
      type: 'link',
      url: '',
      description: '',
    };
    setPortfolio([...portfolio, newItem]);
  };

  const handleRemovePortfolio = (id: string) => {
    setPortfolio(portfolio.filter((p) => p.id !== id));
  };

  const handleUpdatePortfolio = (
    id: string,
    field: keyof PortfolioItem,
    value: string
  ) => {
    setPortfolio(
      portfolio.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Save Resume handler
  const handleSaveResume = () => {
    const newResumeData: SeekerResume = {
      headline: headline.trim(),
      summary: summary.trim(),
      education: education.filter((e) => e.degree.trim() || e.field.trim()),
      experience: experience.filter((e) => e.title.trim() || e.company.trim()),
      skillsList,
      languages: languages.filter((l) => l.language.trim()),
      portfolio: portfolio.filter((p) => p.title.trim() || p.url.trim()),
      updatedAt: new Date().toISOString().split('T')[0],
    };

    updateResume(newResumeData);
  };

  // Trigger PDF print
  const handlePrintPDF = () => {
    if (!isAccessUnlocked) {
      showToast('چاپ و دریافت فایل PDF رزومه قفل است؛ ابتدا باید پرداخت ۵۰۰ لیر توسط مدیریت تایید شود.', 'error');
      return;
    }

    // Switch to preview view first
    setActiveSubTab('preview');
    setTimeout(() => {
      try {
        window.print();
      } catch {
        showToast('برای چاپ رزومه از کلیدهای Ctrl+P استفاده نمایید', 'info');
      }
    }, 200);
  };

  const handleCopyCVLink = () => {
    if (!isAccessUnlocked) {
      showToast('اشتراک‌گذاری لینک رزومه قفل است؛ این بخش پس از تایید مدیریت فعال خواهد شد.', 'error');
      return;
    }

    let url = '?cv=' + currentSeeker.username;
    try {
      if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
        url = window.location.origin + '?cv=' + currentSeeker.username;
      }
    } catch {
      // origin may be restricted
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url).catch(() => {});
      }
      setCopiedLink(true);
      showToast('لینک صفحه اختصاصی رزومه کپی شد!', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToast('لینک اختصاصی: ' + url, 'info');
    }
  };

  // Calculate completeness percentage
  const calcCompleteness = () => {
    let score = 20; // Basic seeker info
    if (headline) score += 15;
    if (summary) score += 15;
    if (education.length > 0) score += 15;
    if (experience.length > 0) score += 15;
    if (skillsList.length > 0) score += 10;
    if (portfolio.length > 0) score += 10;
    return Math.min(score, 100);
  };

  const completeness = calcCompleteness();

  return (
    <div className="space-y-6">
      {/* Resume Builder Header Bar */}
      <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white dark:text-white light:text-slate-900">
              رزومه‌ساز آنلاین کارباما (CV Builder)
            </h2>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              تکمیل {completeness}٪
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 mt-1">
            سوابق تحصیلی، شغلی، مهارت‌ها و نمونه‌کارهای خود را ثبت کنید تا رزومه دوزبانه استاندارد دریافت نمایید.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sub Tab Switcher */}
          <div className="flex items-center bg-slate-800 dark:bg-slate-800 light:bg-slate-100 p-1 rounded-xl border border-slate-700 dark:border-slate-700 light:border-slate-300 text-xs">
            <button
              onClick={() => setActiveSubTab('form')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeSubTab === 'form'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              ویرایش فرم
            </button>
            <button
              onClick={() => setActiveSubTab('preview')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeSubTab === 'preview'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              پیش‌نمایش زنده
            </button>
          </div>

          <button
            onClick={handleSaveResume}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-700/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            ذخیره رزومه
          </button>

          <button
            onClick={handlePrintPDF}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
              isAccessUnlocked
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-700/20'
                : 'bg-slate-800 text-amber-300 border border-amber-500/30 hover:bg-slate-700'
            }`}
            title={isAccessUnlocked ? 'چاپ یا دریافت فایل PDF استاندارد' : 'قفل است (نیازمند تایید پرداخت ۵۰۰ لیر)'}
          >
            {isAccessUnlocked ? <Printer className="w-4 h-4" /> : <Lock className="w-4 h-4 text-amber-400" />}
            <span>{isAccessUnlocked ? 'خروجی PDF / پرینت' : 'PDF (قفل 🔒)'}</span>
          </button>

          <button
            onClick={handleCopyCVLink}
            className={`p-2 rounded-xl border transition ${
              isAccessUnlocked
                ? 'bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 text-slate-300 dark:text-slate-300 light:text-slate-700 border-slate-700 dark:border-slate-700 light:border-slate-300'
                : 'bg-slate-800 text-amber-300 border-amber-500/30 hover:bg-slate-700'
            }`}
            title={isAccessUnlocked ? 'اشتراک‌گذاری لینک اختصاصی رزومه' : 'قفل است (نیازمند تایید پرداخت ۵۰۰ لیر)'}
          >
            {isAccessUnlocked ? (
              copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>
      </div>

      {/* Form Mode */}
      {activeSubTab === 'form' && (
        <div className="space-y-6">
          {/* Section 1: Headline & Summary */}
          <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-red-500" />
              عنوان حرفه‌ای و خلاصه رزومه
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1.5">
                  عنوان شغلی اصلی (Headline)
                </label>
                <input
                  type="text"
                  placeholder="مثال: سرآشپز بین‌المللی، تکنسین برق صنعتی، مترجم ترکی"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-50 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-white dark:text-white light:text-slate-900 focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1.5">
                  شهر مد نظر در ترکیه
                </label>
                <input
                  type="text"
                  readOnly
                  value={currentSeeker.targetCity}
                  className="w-full bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1.5">
                درباره من و خلاصه حرفه‌ای (Professional Summary)
              </label>
              <textarea
                rows={3}
                placeholder="توضیح مختصری از سوابق، نقاط قوت و تعهد کاری خود برای معرفی به کارفرمایان ترکیه بنویسید..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-50 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl p-3 text-xs text-white dark:text-white light:text-slate-900 focus:outline-hidden focus:border-red-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Work Experience */}
          <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-red-500" />
                سوابق کاری و تجربیات حرفه‌ای ({experience.length})
              </h3>
              <button
                type="button"
                onClick={handleAddExperience}
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                افزودن سابقه شغلی
              </button>
            </div>

            {experience.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4 border border-dashed border-slate-800 rounded-xl">
                هیچ سابقه شغلی ثبت نشده است. روی «افزودن سابقه شغلی» کلیک کنید.
              </p>
            ) : (
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div
                    key={exp.id}
                    className="p-4 bg-slate-800/70 dark:bg-slate-800/70 light:bg-slate-50 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl space-y-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="absolute top-3 left-3 p-1 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700"
                      title="حذف این سابقه"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">سمت / عنوان شغلی</label>
                        <input
                          type="text"
                          placeholder="مثلاً سرآشپز کباب"
                          value={exp.title}
                          onChange={(e) => handleUpdateExperience(exp.id, 'title', e.target.value)}
                          className="w-full bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg px-3 py-2 text-xs text-white dark:text-white light:text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">نام شرکت یا مجموعه</label>
                        <input
                          type="text"
                          placeholder="مثلاً رستوران سنتی"
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                          className="w-full bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg px-3 py-2 text-xs text-white dark:text-white light:text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">شهر و کشور</label>
                        <input
                          type="text"
                          placeholder="مثلاً استانبول، ترکیه"
                          value={exp.city}
                          onChange={(e) => handleUpdateExperience(exp.id, 'city', e.target.value)}
                          className="w-full bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg px-3 py-2 text-xs text-white dark:text-white light:text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">تاریخ شروع</label>
                        <input
                          type="text"
                          placeholder="مثلاً ۱۴۰۰ یا ۲۰۲۲"
                          value={exp.startDate}
                          onChange={(e) => handleUpdateExperience(exp.id, 'startDate', e.target.value)}
                          className="w-full bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg px-3 py-2 text-xs text-white dark:text-white light:text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">تاریخ پایان</label>
                        <input
                          type="text"
                          placeholder="مثلاً ۱۴۰۲ یا اکنون"
                          value={exp.endDate}
                          onChange={(e) => handleUpdateExperience(exp.id, 'endDate', e.target.value)}
                          className="w-full bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg px-3 py-2 text-xs text-white dark:text-white light:text-slate-900"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exp.isCurrent}
                            onChange={(e) => handleUpdateExperience(exp.id, 'isCurrent', e.target.checked)}
                            className="rounded border-slate-700 text-red-600 focus:ring-0"
                          />
                          همچنان در این شغل مشغول به کار هستم
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">شرح وظایف و دستاوردها</label>
                      <textarea
                        rows={2}
                        placeholder="مسئولیت‌ها، ماشین‌آلات مورد استفاده یا افتخارات شغلی..."
                        value={exp.description}
                        onChange={(e) => handleUpdateExperience(exp.id, 'description', e.target.value)}
                        className="w-full bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg p-2.5 text-xs text-white dark:text-white light:text-slate-900"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Education */}
          <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-red-500" />
                تحصیلات و دوره‌های آموزشی معتبر ({education.length})
              </h3>
              <button
                type="button"
                onClick={handleAddEducation}
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                افزودن مدرک تحصیلی
              </button>
            </div>

            {education.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4 border border-dashed border-slate-800 rounded-xl">
                مدرک تحصیلی ثبت نشده است. روی «افزودن مدرک تحصیلی» کلیک کنید.
              </p>
            ) : (
              <div className="space-y-4">
                {education.map((edu) => (
                  <div
                    key={edu.id}
                    className="p-4 bg-slate-800/70 dark:bg-slate-800/70 light:bg-slate-50 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl space-y-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(edu.id)}
                      className="absolute top-3 left-3 p-1 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700"
                      title="حذف مدرک"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">مقطع تحصیلی</label>
                        <input
                          type="text"
                          placeholder="مثلاً کارشناسی، دیپلم، فنی‌حرفه‌ای"
                          value={edu.degree}
                          onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                          className="w-full bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg px-3 py-2 text-xs text-white dark:text-white light:text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">رشته تحصیلی</label>
                        <input
                          type="text"
                          placeholder="مثلاً هتلداری، مهندسی، آشپزی"
                          value={edu.field}
                          onChange={(e) => handleUpdateEducation(edu.id, 'field', e.target.value)}
                          className="w-full bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg px-3 py-2 text-xs text-white dark:text-white light:text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">دانشگاه / موسسه آموزشی</label>
                        <input
                          type="text"
                          placeholder="مثلاً دانشگاه تهران"
                          value={edu.institution}
                          onChange={(e) => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                          className="w-full bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg px-3 py-2 text-xs text-white dark:text-white light:text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">سال فراغت از تحصیل</label>
                        <input
                          type="text"
                          placeholder="مثلاً ۱۳۹۹ یا ۲۰۲۰"
                          value={edu.graduationYear}
                          onChange={(e) => handleUpdateEducation(edu.id, 'graduationYear', e.target.value)}
                          className="w-full bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg px-3 py-2 text-xs text-white dark:text-white light:text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Skills & Languages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills */}
            <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-500" />
                مهارت‌های تخصصی و کاربردی
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="مهارت جدید را بنویسید..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 bg-slate-800 dark:bg-slate-800 light:bg-slate-50 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl px-3 py-2 text-xs text-white dark:text-white light:text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3.5 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-500 transition"
                >
                  افزودن
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {skillsList.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 text-slate-200 dark:text-slate-200 light:text-slate-800 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg text-xs"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-red-500" />
                  زبان‌های خارجی
                </h3>
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="text-xs text-red-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  افزودن زبان
                </button>
              </div>

              <div className="space-y-2">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="نام زبان (ترکی، انگلیسی...)"
                      value={lang.language}
                      onChange={(e) => handleUpdateLanguage(lang.id, 'language', e.target.value)}
                      className="flex-1 bg-slate-800 dark:bg-slate-800 light:bg-slate-50 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-white dark:text-white light:text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="سطح (مکالمه کاری، مسلط)"
                      value={lang.level}
                      onChange={(e) => handleUpdateLanguage(lang.id, 'level', e.target.value)}
                      className="w-36 bg-slate-800 dark:bg-slate-800 light:bg-slate-50 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-white dark:text-white light:text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(lang.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Portfolio & Certificates */}
          <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-red-500" />
                نمونه‌کارها، مدارک و لینک‌ها ({portfolio.length})
              </h3>
              <button
                type="button"
                onClick={handleAddPortfolio}
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                افزودن نمونه‌کار / مدرک
              </button>
            </div>

            {portfolio.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4 border border-dashed border-slate-800 rounded-xl">
                هیچ نمونه‌کاری ثبت نشده است. لینک گالری کار، وب‌سایت، مدرک یا فایل خود را اضافه کنید.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-800/70 dark:bg-slate-800/70 light:bg-slate-50 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl space-y-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemovePortfolio(item.id)}
                      className="absolute top-3 left-3 p-1 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">عنوان نمونه‌کار یا مدرک</label>
                      <input
                        type="text"
                        placeholder="مثلاً گواهینامه جوشکاری، کاتالوگ آشپزی، پیج نمونه‌کار"
                        value={item.title}
                        onChange={(e) => handleUpdatePortfolio(item.id, 'title', e.target.value)}
                        className="w-full bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg px-3 py-1.5 text-xs text-white dark:text-white light:text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="block text-[11px] text-slate-400 mb-1">نوع</label>
                        <select
                          value={item.type}
                          onChange={(e) => handleUpdatePortfolio(item.id, 'type', e.target.value as any)}
                          className="w-full bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg px-2 py-1.5 text-xs text-white dark:text-white light:text-slate-900"
                        >
                          <option value="link">لینک وب‌سایت</option>
                          <option value="image">عکس / گالری</option>
                          <option value="certificate">مدرک رسمی</option>
                          <option value="sample">نمونه‌کار</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[11px] text-slate-400 mb-1">آدرس اینترنتی (URL)</label>
                        <input
                          type="url"
                          dir="ltr"
                          placeholder="https://..."
                          value={item.url}
                          onChange={(e) => handleUpdatePortfolio(item.id, 'url', e.target.value)}
                          className="w-full bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-left text-white dark:text-white light:text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">توضیح کوتاه</label>
                      <input
                        type="text"
                        placeholder="توضیح مختصر در خصوص این مدرک یا نمونه کار..."
                        value={item.description || ''}
                        onChange={(e) => handleUpdatePortfolio(item.id, 'description', e.target.value)}
                        className="w-full bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg px-3 py-1.5 text-xs text-white dark:text-white light:text-slate-900"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Mode / Dedicated A4 View (Printable) */}
      {activeSubTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs text-slate-300 print:hidden">
            <span>
              💡 این پیش‌نمایش صفحه اختصاصی و استاندارد رزومه کارباما است. با زدن دکمه <strong>پرینت / PDF</strong> می‌توانید آن را به صورت فایل ذخیره کنید.
            </span>
            <button
              onClick={handlePrintPDF}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              پرینت صفحه
            </button>
          </div>

          {/* Printable A4 CV Container */}
          <div
            id="karbama-cv-printable"
            className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-200 max-w-4xl mx-auto space-y-6 print:shadow-none print:border-none print:p-0 print:m-0"
            dir="rtl"
          >
            {/* CV Header */}
            <div className="border-b-2 border-red-600 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950">
                    {currentSeeker.fullName}
                  </h1>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">
                    کارباما CV
                  </span>
                </div>
                <p className="text-base font-bold text-red-600">
                  {headline || 'کارجوی متخصص در ترکیه'}
                </p>
                <p className="text-xs text-slate-500">
                  نام پدر: {currentSeeker.fatherName} | کد ملی: {currentSeeker.nationalId}
                </p>
              </div>

              {/* Contact / Location block */}
              <div className="text-left sm:text-left text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200" dir="ltr">
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-red-600" />
                  <span className="font-mono font-bold text-slate-800">{currentSeeker.phone}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  <span>{currentSeeker.targetCity} - ترکیه</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-red-600" />
                  <span>سطح ترکی: {currentSeeker.turkishLevel === 'fluent' ? 'مسلط' : currentSeeker.turkishLevel === 'intermediate' ? 'متوسط' : 'مقدماتی'}</span>
                </p>
              </div>
            </div>

            {/* About / Summary */}
            {summary && (
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-slate-900 border-r-4 border-red-600 pr-2">
                  درباره من و خلاصه حرفه‌ای (Hakkımda)
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed text-justify bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  {summary}
                </p>
              </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-slate-900 border-r-4 border-red-600 pr-2">
                  سوابق و تجربیات شغلی (İş Deneyimi)
                </h2>
                <div className="space-y-3">
                  {experience.map((exp) => (
                    <div key={exp.id} className="p-3.5 rounded-xl border border-slate-200 bg-white">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="font-bold text-xs text-slate-900">
                          {exp.title} - <span className="text-red-700">{exp.company}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {exp.startDate} تا {exp.isCurrent ? 'اکنون (شاغل)' : exp.endDate} | {exp.city}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-slate-900 border-r-4 border-red-600 pr-2">
                  سوابق تحصیلی و آموزشی (Eğitim)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {education.map((edu) => (
                    <div key={edu.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                      <p className="font-bold text-xs text-slate-900">{edu.degree} - {edu.field}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">{edu.institution} ({edu.city})</p>
                      <p className="text-[10px] text-slate-500 mt-1">سال فراغت: {edu.graduationYear}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills & Languages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Skills */}
              {skillsList.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-sm font-bold text-slate-900 border-r-4 border-red-600 pr-2">
                    مهارت‌های کلیدی (Beceriler)
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {skillsList.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 rounded-md text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {languages.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-sm font-bold text-slate-900 border-r-4 border-red-600 pr-2">
                    زبان‌ها (Diller)
                  </h2>
                  <div className="space-y-1.5">
                    {languages.map((l) => (
                      <div key={l.id} className="flex items-center justify-between text-xs border-b border-slate-100 pb-1">
                        <span className="font-bold text-slate-800">{l.language}</span>
                        <span className="text-slate-500">{l.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Portfolio & Certs */}
            {portfolio.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-slate-900 border-r-4 border-red-600 pr-2">
                  نمونه‌کارها و مدارک (Sertifikalar ve Projeler)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {portfolio.map((p) => (
                    <div key={p.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{p.title}</p>
                        {p.description && <p className="text-[10px] text-slate-500">{p.description}</p>}
                      </div>
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-red-600 hover:text-red-700 p-1 flex items-center gap-1 font-mono text-[10px]"
                        >
                          مشاهده <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CV Footer */}
            <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 flex items-center justify-between">
              <span>تولید شده توسط سامانه هوشمند کارباما (Karbama)</span>
              <span>تاریخ تایید رزومه: {new Date().toLocaleDateString('fa-IR')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
