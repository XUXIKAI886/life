
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export interface UserInput {
  name?: string;
  gender: Gender;
  birthYear: string;   // 出生年份 (如 1990)
  yearPillar: string;  // 年柱
  monthPillar: string; // 月柱
  dayPillar: string;   // 日柱
  hourPillar: string;  // 时柱
  startAge: string;    // 起运年龄 (虚岁)
  firstDaYun: string;  // 第一步大运干支
}

export interface KLinePoint {
  age: number;
  year: number;
  ganZhi: string; // 当年的流年干支 (如：甲辰)
  daYun?: string; // 当前所在的大运（如：甲子大运），用于图表标记
  open: number;
  close: number;
  high: number;
  low: number;
  score: number;
  reason: string; // 这里现在需要存储详细的流年描述
}

export interface AnalysisData {
  bazi: string[]; // [Year, Month, Day, Hour] pillars
  
  // 新增：核心分析
  coreAnalysis?: {
    dayMaster: string;
    strength: string;
    strengthReason: string;
    pattern: string;
    patternReason: string;
    usefulGod: string;
    usefulGodReason: string;
    favorableGod: string;
    unfavorableGod: string;
  } | null;
  
  // 新增：十神分析
  tenGods?: {
    distribution: string;
    keyPatterns: string[];
    analysis: string;
  } | null;
  
  // 新增：神煞分析
  shenSha?: {
    auspicious: string[];
    inauspicious: string[];
    analysis: string;
  } | null;
  
  summary: string;
  summaryScore: number; // 0-10
  
  industry: string;
  industryScore: number; // 0-10
  
  wealth: string;
  wealthScore: number; // 0-10
  
  health: string;
  healthScore: number; // 0-10
  
  family: string;
  familyScore: number; // 0-10
  
  // 情感分析
  romance?: string;
  romanceScore?: number;
}

export interface LifeDestinyResult {
  chartData: KLinePoint[];
  analysis: AnalysisData;
}
