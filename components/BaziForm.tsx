
import React, { useState, useMemo } from 'react';
import { UserInput, Gender } from '../types';
import { Loader2, Sparkles, TrendingUp } from 'lucide-react';

// 干支格式验证正则
const GANZHI_PATTERN = /^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/;

interface BaziFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

const BaziForm: React.FC<BaziFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<UserInput>({
    name: '',
    gender: Gender.MALE,
    birthYear: '',
    yearPillar: '',
    monthPillar: '',
    dayPillar: '',
    hourPillar: '',
    startAge: '',
    firstDaYun: '',
  });

  const [formErrors, setFormErrors] = useState<{
    birthYear?: string;
    startAge?: string;
    yearPillar?: string;
    monthPillar?: string;
    dayPillar?: string;
    hourPillar?: string;
    firstDaYun?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: typeof formErrors = {};

    // 出生年份验证
    const year = parseInt(formData.birthYear);
    if (!formData.birthYear.trim()) {
      errors.birthYear = '请输入出生年份';
    } else if (isNaN(year) || year < 1900 || year > 2100) {
      errors.birthYear = '请输入有效的年份 (1900-2100)';
    }

    // 起运年龄验证
    const age = parseInt(formData.startAge);
    if (!formData.startAge.trim()) {
      errors.startAge = '请输入起运年龄';
    } else if (isNaN(age) || age < 1 || age > 100) {
      errors.startAge = '起运年龄必须在 1-100 之间';
    }

    // 干支格式验证
    if (!formData.yearPillar.trim()) {
      errors.yearPillar = '请输入年柱';
    } else if (!GANZHI_PATTERN.test(formData.yearPillar.trim())) {
      errors.yearPillar = '格式不正确（如：甲子）';
    }
    if (!formData.monthPillar.trim()) {
      errors.monthPillar = '请输入月柱';
    } else if (!GANZHI_PATTERN.test(formData.monthPillar.trim())) {
      errors.monthPillar = '格式不正确（如：丙寅）';
    }
    if (!formData.dayPillar.trim()) {
      errors.dayPillar = '请输入日柱';
    } else if (!GANZHI_PATTERN.test(formData.dayPillar.trim())) {
      errors.dayPillar = '格式不正确（如：戊辰）';
    }
    if (!formData.hourPillar.trim()) {
      errors.hourPillar = '请输入时柱';
    } else if (!GANZHI_PATTERN.test(formData.hourPillar.trim())) {
      errors.hourPillar = '格式不正确（如：壬戌）';
    }
    if (!formData.firstDaYun.trim()) {
      errors.firstDaYun = '请输入第一步大运';
    } else if (!GANZHI_PATTERN.test(formData.firstDaYun.trim())) {
      errors.firstDaYun = '格式不正确（如：丁卯）';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onSubmit(formData);
  };

  // Calculate direction for UI feedback
  const daYunDirectionInfo = useMemo(() => {
    if (!formData.yearPillar) return '等待输入年柱...';
    
    const firstChar = formData.yearPillar.trim().charAt(0);
    const yinStems = ['乙', '丁', '己', '辛', '癸'];
    
    const isYangYear = !yinStems.includes(firstChar);
    
    let isForward = false;
    if (formData.gender === Gender.MALE) {
      isForward = isYangYear; // Male Yang = Forward, Male Yin = Backward
    } else {
      isForward = !isYangYear; // Female Yin = Forward, Female Yang = Backward
    }
    
    return isForward ? '顺行 (阳男/阴女)' : '逆行 (阴男/阳女)';
  }, [formData.yearPillar, formData.gender]);

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-serif-sc font-bold text-gray-800 mb-2">八字排盘</h2>
        <p className="text-gray-500 text-sm">请输入四柱与大运信息以生成分析</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Name & Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">姓名 (可选)</label>
             <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="姓名"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: Gender.MALE })}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${
                  formData.gender === Gender.MALE
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                乾造 (男)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: Gender.FEMALE })}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${
                  formData.gender === Gender.FEMALE
                    ? 'bg-white text-pink-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                坤造 (女)
              </button>
            </div>
          </div>
        </div>

        {/* Four Pillars Manual Input */}
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
          <div className="flex items-center gap-2 mb-3 text-amber-800 text-sm font-bold">
            <Sparkles className="w-4 h-4" />
            <span>输入四柱干支 (必填)</span>
          </div>
          
          {/* Birth Year Input - Added as requested */}
          <div className="mb-4">
             <label className="block text-xs font-bold text-gray-600 mb-1">出生年份 (阳历)</label>
             <input
                type="number"
                name="birthYear"
                required
                min="1900"
                max="2100"
                value={formData.birthYear}
                onChange={handleChange}
                placeholder="如: 1990"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white font-bold ${formErrors.birthYear ? 'border-red-500 bg-red-50' : 'border-amber-200'}`}
              />
              {formErrors.birthYear && <p className="text-red-500 text-xs mt-1">{formErrors.birthYear}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">年柱 (Year)</label>
              <input
                type="text"
                name="yearPillar"
                required
                maxLength={2}
                value={formData.yearPillar}
                onChange={handleChange}
                placeholder="如: 甲子"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white text-center font-serif-sc font-bold ${formErrors.yearPillar ? 'border-red-500 bg-red-50' : 'border-amber-200'}`}
              />
              {formErrors.yearPillar && <p className="text-red-500 text-xs mt-1">{formErrors.yearPillar}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">月柱 (Month)</label>
              <input
                type="text"
                name="monthPillar"
                required
                maxLength={2}
                value={formData.monthPillar}
                onChange={handleChange}
                placeholder="如: 丙寅"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white text-center font-serif-sc font-bold ${formErrors.monthPillar ? 'border-red-500 bg-red-50' : 'border-amber-200'}`}
              />
              {formErrors.monthPillar && <p className="text-red-500 text-xs mt-1">{formErrors.monthPillar}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">日柱 (Day)</label>
              <input
                type="text"
                name="dayPillar"
                required
                maxLength={2}
                value={formData.dayPillar}
                onChange={handleChange}
                placeholder="如: 戊辰"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white text-center font-serif-sc font-bold ${formErrors.dayPillar ? 'border-red-500 bg-red-50' : 'border-amber-200'}`}
              />
              {formErrors.dayPillar && <p className="text-red-500 text-xs mt-1">{formErrors.dayPillar}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">时柱 (Hour)</label>
              <input
                type="text"
                name="hourPillar"
                required
                maxLength={2}
                value={formData.hourPillar}
                onChange={handleChange}
                placeholder="如: 壬戌"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white text-center font-serif-sc font-bold ${formErrors.hourPillar ? 'border-red-500 bg-red-50' : 'border-amber-200'}`}
              />
              {formErrors.hourPillar && <p className="text-red-500 text-xs mt-1">{formErrors.hourPillar}</p>}
            </div>
          </div>
        </div>

        {/* Da Yun Manual Input */}
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <div className="flex items-center gap-2 mb-3 text-indigo-800 text-sm font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>大运排盘信息 (必填)</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">起运年龄 (虚岁)</label>
              <input
                type="number"
                name="startAge"
                required
                min="1"
                max="100"
                value={formData.startAge}
                onChange={handleChange}
                placeholder="如: 3"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-center font-bold ${formErrors.startAge ? 'border-red-500 bg-red-50' : 'border-indigo-200'}`}
              />
              {formErrors.startAge && <p className="text-red-500 text-xs mt-1">{formErrors.startAge}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">第一步大运</label>
              <input
                type="text"
                name="firstDaYun"
                required
                maxLength={2}
                value={formData.firstDaYun}
                onChange={handleChange}
                placeholder="如: 丁卯"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-center font-serif-sc font-bold ${formErrors.firstDaYun ? 'border-red-500 bg-red-50' : 'border-indigo-200'}`}
              />
              {formErrors.firstDaYun && <p className="text-red-500 text-xs mt-1">{formErrors.firstDaYun}</p>}
            </div>
          </div>
           <p className="text-xs text-indigo-600/70 mt-2 text-center">
             当前大运排序规则：
             <span className="font-bold text-indigo-900">{daYunDirectionInfo}</span>
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-indigo-900 to-gray-900 hover:from-black hover:to-black text-white font-bold py-3.5 rounded-xl shadow-lg transform transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              <span>大师推演中(3-5分钟)</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 text-amber-300" />
              <span>生成人生K线</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default BaziForm;
