/**
 * Mock Translation Service
 * Simulates calling Google Translate API
 * Caches results in localStorage to prevent redundant "calls"
 */

export const translateText = async (
  text: string,
  targetLang: "zh" | "en"
): Promise<string> => {
  // 1. Check Cache
  const cacheKey = `trans_${targetLang}_${text.substring(0, 20)}_${
    text.length
  }`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    // Check expiry (24 hours)
    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
      return data.result;
    }
  }

  // 2. Simulate API Delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // 3. Mock Translation Logic (In a real app, fetch Google/DeepL API here)
  // Since we don't have a real API key, we will append a tag to show it "worked"
  // or return a placeholder for demo purposes.

  let result = text;

  // Very basic mock replacement to prove functionality
  if (targetLang === "zh") {
    result = text
      .replace(/The/g, "这")
      .replace(/ is /g, "是")
      .replace(/a /g, "一个")
      .replace(/model/g, "模型")
      .replace(/paper/g, "论文")
      .replace(/results/g, "结果");
    result = `[机器翻译] ` + result;
  } else {
    result = `[Machine Translated] ` + text;
  }

  // 4. Save to Cache
  localStorage.setItem(
    cacheKey,
    JSON.stringify({
      result,
      timestamp: Date.now(),
    })
  );

  return result;
};
