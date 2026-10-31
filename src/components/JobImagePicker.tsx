import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Sparkles,
  Check,
  X,
  Camera,
  Layers,
  Link as LinkIcon,
} from 'lucide-react';

export interface JobImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  category?: string;
}

// Curated high quality presets for common jobs in Turkey
export const PRESET_JOB_PHOTOS: { category: string; label: string; photos: { title: string; url: string }[] }[] = [
  {
    category: 'restaurant',
    label: 'رستوران و کافه',
    photos: [
      {
        title: 'آشپزی و غذای گرم رستورانی',
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'کباب سنتی و تخته‌کاری',
        url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'باریستا و آماده‌سازی قهوه',
        url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'سالن‌کاری و سرو غذا',
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'پخت پیتزا و فست‌فود',
        url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'شیرینی‌پزی و باقلوا',
        url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    category: 'textile',
    label: 'خیاطی و پوشاک',
    photos: [
      {
        title: 'چرخکار صنعتی و دوخت تریکو',
        url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'کارگاه تولید پوشاک مرتر',
        url: 'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'الگوکشی و برش پارچه',
        url: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'اتوکاری صنعتی و بسته‌بندی',
        url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    category: 'construction',
    label: 'ساختمان و فنی',
    photos: [
      {
        title: 'نقاشی ساختمان و بتونه‌کاری',
        url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'کاشی‌کاری و سرامیک مدرن',
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'برق‌کاری و سیم‌کشی ساختمان',
        url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'جوشکاری و اسکلت فلزی',
        url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    category: 'hotel',
    label: 'هتل و گردشگری',
    photos: [
      {
        title: 'لابی و پذیرش هتل لوکس',
        url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'اتاق هتل و خدمات خانه‌داری',
        url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'هتل ۵ ستاره ساحلی آنتالیا',
        url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    category: 'realestate',
    label: 'املاک و مستغلات',
    photos: [
      {
        title: 'مشاوره خرید و اجاره ملک',
        url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'برج‌ها و سیته‌های استانبول',
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    category: 'warehouse',
    label: 'انبار و کارگو',
    photos: [
      {
        title: 'انبارداری و لجستیک کالا',
        url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'بسته‌بندی کارگو و باربری',
        url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    category: 'beauty',
    label: 'آرایشگری و زیبایی',
    photos: [
      {
        title: 'پیرایش و آرایشگری مردانه',
        url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'سالن زیبایی و میکاپ بانوان',
        url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    category: 'sales',
    label: 'فروشگاه و مارکت',
    photos: [
      {
        title: 'فروشندگی بوتیک و مد',
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'صندوق‌داری و سوپرمارکت',
        url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    category: 'furniture',
    label: 'نجاری و مبلمان',
    photos: [
      {
        title: 'کارگاه نجاری و صنایع چوب',
        url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'ساخت کابینت و دکوراسیون داخلی',
        url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    category: 'transport',
    label: 'دلیوری و رانندگی',
    photos: [
      {
        title: 'پیک موتوری و تحویل سفارش',
        url: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'ترنسفر مسافربری و خودرو',
        url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
];

export const JobImagePicker: React.FC<JobImagePickerProps> = ({
  value,
  onChange,
  category = 'restaurant',
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [selectedCategory, setSelectedCategory] = useState<string>(category || 'restaurant');
  const [customUrl, setCustomUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle client-side file upload from device gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use Canvas to compress image if large
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1000;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          onChange(compressedDataUrl);
        } else {
          onChange(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    onChange(url);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onChange(customUrl.trim());
      setCustomUrl('');
    }
  };

  const currentCategoryPresets =
    PRESET_JOB_PHOTOS.find((p) => p.category === selectedCategory) || PRESET_JOB_PHOTOS[0];

  return (
    <div className="space-y-3 p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
      <div className="flex items-center justify-between">
        <label className="text-slate-200 font-bold flex items-center gap-1.5 text-xs">
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <span>عکس آگهی شغل (انتخاب از گالری یا تصاویر آماده)</span>
        </label>
        {value && (
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <Check className="w-3 h-3" />
            عکس انتخاب شد
          </span>
        )}
      </div>

      {/* Current Preview */}
      {value && (
        <div className="relative rounded-xl overflow-hidden border border-slate-700 h-36 bg-slate-800 flex items-center justify-center group">
          <img
            src={value}
            alt="پیش‌نمایش عکس شغل"
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
            <span className="text-[11px] text-white font-medium bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs">
              عکس فعال آگهی
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 left-2 p-1 bg-red-600/90 text-white rounded-lg text-xs hover:bg-red-500 transition shadow-md"
            title="حذف این عکس"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition ${
            activeTab === 'presets'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          گالری عکس‌های آماده
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition ${
            activeTab === 'upload'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          آپلود از گالری گوشی
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition ${
            activeTab === 'url'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          لینک مستقیم
        </button>
      </div>

      {/* Tab 1: Presets Gallery */}
      {activeTab === 'presets' && (
        <div className="space-y-2.5">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {PRESET_JOB_PHOTOS.map((group) => (
              <button
                key={group.category}
                type="button"
                onClick={() => setSelectedCategory(group.category)}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition ${
                  selectedCategory === group.category
                    ? 'bg-slate-700 text-white font-bold border border-amber-500/50'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
            {currentCategoryPresets.photos.map((item, idx) => {
              const isSelected = value === item.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(item.url)}
                  className={`relative rounded-xl overflow-hidden border text-right transition group h-24 ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/50'
                      : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-1.5 flex flex-col justify-end">
                    <span className="text-[10px] text-white font-medium leading-tight line-clamp-1">
                      {item.title}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Upload from Device Gallery */}
      {activeTab === 'upload' && (
        <div className="p-4 border-2 border-dashed border-slate-700 hover:border-amber-500/70 rounded-2xl text-center space-y-3 bg-slate-900/50 transition">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="job-gallery-file-input"
          />

          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6" />
          </div>

          <div>
            <h4 className="text-xs font-bold text-white mb-0.5">انتخاب عکس از گالری دستگاه</h4>
            <p className="text-[11px] text-slate-400">
              عکس مورد نظر را از گالری گوشی، تبلت یا کامپیوتر خود بارگذاری کنید (PNG، JPG یا WEBP).
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl text-xs shadow-md transition inline-flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4" />
            <span>باز کردن گالری تصاویر</span>
          </button>
        </div>
      )}

      {/* Tab 3: Custom Web Link */}
      {activeTab === 'url' && (
        <form onSubmit={handleApplyCustomUrl} className="flex gap-2">
          <input
            type="url"
            dir="ltr"
            placeholder="https://example.com/photo.jpg"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 text-left font-mono focus:outline-hidden"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition shrink-0"
          >
            اعمال
          </button>
        </form>
      )}
    </div>
  );
};
