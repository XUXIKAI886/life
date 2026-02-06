
import { UserInput, LifeDestinyResult, Gender } from "../types";
import { BAZI_SYSTEM_INSTRUCTION } from "../constants";

// 六十甲子完整序列
const SIXTY_JIAZI = [
  '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
  '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
  '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
  '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
  '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'
];

// 计算大运序列（前端预计算，不依赖 AI）
const calculateDaYunSequence = (firstDaYun: string, isForward: boolean, count: number): string[] => {
  const startIdx = SIXTY_JIAZI.indexOf(firstDaYun);
  if (startIdx === -1) return Array(count).fill(firstDaYun); // fallback
  
  return Array.from({ length: count }, (_, i) => {
    const idx = isForward
      ? (startIdx + i) % 60
      : (startIdx - i + 60) % 60;
    return SIXTY_JIAZI[idx];
  });
};

// 计算流年干支（根据出生年份推算）
const calculateYearGanZhi = (targetYear: number): string => {
  // 1984年是甲子年，以此为基准
  const baseYear = 1984;
  const diff = targetYear - baseYear;
  const idx = ((diff % 60) + 60) % 60;
  return SIXTY_JIAZI[idx];
};

// Helper to extract JSON from markdown code blocks or raw text
const extractJSON = (text: string): string => {
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
  const match = text.match(codeBlockRegex);
  if (match) {
    return match[1].trim();
  }
  return text.trim();
};

// Helper to determine stem polarity
const getStemPolarity = (pillar: string): 'YANG' | 'YIN' => {
  if (!pillar) return 'YANG'; // default
  const firstChar = pillar.trim().charAt(0);
  const yangStems = ['甲', '丙', '戊', '庚', '壬'];
  const yinStems = ['乙', '丁', '己', '辛', '癸'];
  
  if (yangStems.includes(firstChar)) return 'YANG';
  if (yinStems.includes(firstChar)) return 'YIN';
  return 'YANG'; // fallback
};

export const generateLifeAnalysis = async (input: UserInput): Promise<LifeDestinyResult> => {
  
  // 从环境变量读取 API 配置
  const apiKey = import.meta.env.VITE_API_KEY;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const modelName = import.meta.env.VITE_API_MODEL;

  if (!apiKey || !apiKey.trim()) {
    throw new Error("环境变量 VITE_API_KEY 未配置");
  }
  if (!apiBaseUrl || !apiBaseUrl.trim()) {
    throw new Error("环境变量 VITE_API_BASE_URL 未配置");
  }

  // Remove trailing slash if present
  const cleanBaseUrl = apiBaseUrl.replace(/\/+$/, "");
  // Use env model name or fallback
  const targetModel = modelName && modelName.trim() ? modelName.trim() : "gpt-4o";

  const genderStr = input.gender === Gender.MALE ? '男 (乾造)' : '女 (坤造)';
  const startAgeInt = parseInt(input.startAge) || 1;
  
  // Calculate Da Yun Direction accurately
  const yearStemPolarity = getStemPolarity(input.yearPillar);
  let isForward = false;

  if (input.gender === Gender.MALE) {
    isForward = yearStemPolarity === 'YANG';
  } else {
    isForward = yearStemPolarity === 'YIN';
  }

  const daYunDirectionStr = isForward ? '顺行 (Forward)' : '逆行 (Backward)';
  
  // 前端预计算大运序列（10步大运）
  const daYunSequence = calculateDaYunSequence(input.firstDaYun, isForward, 10);
  
  // 前端预计算流年干支（1-100岁）
  const birthYearInt = parseInt(input.birthYear) || 1990;
  const liuNianList: string[] = [];
  for (let age = 1; age <= 100; age++) {
    const year = birthYearInt + age - 1;
    liuNianList.push(`${age}岁(${year}年)=${calculateYearGanZhi(year)}`);
  }

  const userPrompt = `
【命主基本信息】
性别：${genderStr}
姓名：${input.name || "未提供"}
出生年份：${input.birthYear}年（阳历）

【八字四柱】
年柱：${input.yearPillar}（天干属性：${yearStemPolarity === 'YANG' ? '阳干' : '阴干'}）
月柱：${input.monthPillar}（月令提纲，权重最高）
日柱：${input.dayPillar}（日主，分析核心）
时柱：${input.hourPillar}

【大运核心参数】
1. 起运年龄：${input.startAge}岁（虚岁）
2. 第一步大运：${input.firstDaYun}
3. 排序方向：${daYunDirectionStr}

【大运序列（已预计算，请直接使用）】
${daYunSequence.map((dy, i) => `第${i + 1}步大运：${dy}（${startAgeInt + i * 10}-${startAgeInt + i * 10 + 9}岁）`).join('\n')}

【流年干支对照表（已预计算，请直接使用）】
${liuNianList.slice(0, 20).join(', ')}
${liuNianList.slice(20, 40).join(', ')}
${liuNianList.slice(40, 60).join(', ')}
${liuNianList.slice(60, 80).join(', ')}
${liuNianList.slice(80, 100).join(', ')}

【大运填充规则】
- Age 1 至 ${startAgeInt - 1}岁：daYun = "童限"
- Age ${startAgeInt} 至 ${startAgeInt + 9}岁：daYun = "${daYunSequence[0]}"
- Age ${startAgeInt + 10} 至 ${startAgeInt + 19}岁：daYun = "${daYunSequence[1]}"
- 以此类推，每10年换一步大运

【分析任务清单 - 缺一不可】
□ 任务1：日主强弱判断（得令/得地/得势/得助 → 极强/偏强/中和/偏弱/极弱/从格）
□ 任务2：格局判定（正格或特殊格局，说明成格条件）
□ 任务3：用神喜忌确定（调候→格局→扶抑→通关优先级）
□ 任务4：十神组合分析（识别杀印相生、食神制杀、伤官配印等）
□ 任务5：神煞辅助判断（列出吉神凶煞及作用）
□ 任务6：五维深度分析（每项300字以上）
  - 事业行业：适合行业、发展模式、贵人方位、高峰期
  - 财富层级：财源类型、理财建议、财运周期
  - 身体健康：五行脏腑对应、易发疾病、养生建议
  - 六亲关系：父母缘、兄弟缘、子女运、贵人小人
  - 命理总评：格局层次、一生走向、关键转折点
□ 任务7：生成1-100岁流年K线数据（每年reason字段200-300字详批）

【特别警告】
⚠️ daYun字段：必须填大运干支（10年一变），绝对不要填流年干支
⚠️ ganZhi字段：填流年干支（每年一变，如2024=甲辰）
⚠️ reason字段：必须200-300字，禁止敷衍
⚠️ 本次分析不包含婚姻感情维度

请严格按照系统指令生成JSON数据。
  `;

  try {
    // 构建请求体
    const requestBody: Record<string, unknown> = {
      model: targetModel, 
      messages: [
        { role: "system", content: BAZI_SYSTEM_INSTRUCTION },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3
    };
    
    // 仅对 OpenAI 模型添加 response_format（Gemini 不支持）
    const isGeminiModel = targetModel.toLowerCase().includes('gemini');
    if (!isGeminiModel) {
      requestBody.response_format = { type: "json_object" };
    }

    const response = await fetch(`${cleanBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API 请求失败: ${response.status} - ${errText}`);
    }

    const jsonResult = await response.json();
    const content = jsonResult.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("模型未返回任何内容。");
    }

    // Extract JSON from potential markdown code blocks and parse
    const cleanedContent = extractJSON(content);
    const data = JSON.parse(cleanedContent);

    // 完整性校验
    const requiredFields = ['chartPoints', 'bazi', 'summary'];
    const missingFields = requiredFields.filter(f => !data[f]);
    if (missingFields.length > 0) {
      throw new Error(`模型返回数据不完整，缺失字段: ${missingFields.join(', ')}`);
    }
    
    if (!Array.isArray(data.chartPoints) || data.chartPoints.length === 0) {
      throw new Error("模型返回的 chartPoints 格式不正确或为空。");
    }

    return {
      chartData: data.chartPoints,
      analysis: {
        bazi: data.bazi || [],
        coreAnalysis: data.coreAnalysis || null,
        tenGods: data.tenGods || null,
        shenSha: data.shenSha || null,
        summary: data.summary || "无摘要",
        summaryScore: data.summaryScore || 5,
        industry: data.industry || "无",
        industryScore: data.industryScore || 5,
        wealth: data.wealth || "无",
        wealthScore: data.wealthScore || 5,
        health: data.health || "无",
        healthScore: data.healthScore || 5,
        family: data.family || "无",
        familyScore: data.familyScore || 5,
      },
    };
  } catch (error) {
    // 仅在开发环境输出错误日志
    if (import.meta.env.DEV) {
      console.error("Gemini/OpenAI API Error:", error);
    }
    throw error;
  }
};
