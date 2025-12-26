"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const index = require("./index-vXB5mSwm.js");
require("@electron-toolkit/utils"), require("../index.js"), require("electron"), require("path"), require("./index-Bf0u4cvK.js"), require("fs/promises"), require("fs"), require("./supabaseManager-BAbRVJxx.js"), require("@supabase/supabase-js"), require("./mainEventBus-D2ZkkKhI.js"), require("mitt"), require("./index-CP7J970o.js"), require("electron-log"), require("electron-updater"), require("os"), require("./AbstractModalViewManager-aig2dJrA.js"), require("p-queue"), require("url"), require("./quitHandler-DVZxe9rU.js"), require("./index-CR4vSMhM.js"), require("drizzle-orm/libsql/migrator"), require("drizzle-orm/libsql"), require("@libsql/client"), require("drizzle-orm/sqlite-core"), require("drizzle-orm"), require("./index-B34KkOYs.js"), require("crypto"), require("./userAgentUtils-DJa5NphP.js"), require("@cliqz/adblocker-electron"), require("cross-fetch"), require("events"), require("xlsx"), require("file-type"), require("mime-types"), require("zod"), require("https"), require("http"), require("string_decoder"), require("./index-GfVwZ7mz.js");
class QualityEvaluator {
  langsmithConfig;
  langsmithClient = null;
  constructor(langsmithConfig) {
    this.langsmithConfig = langsmithConfig;
  }
  /**
   * Evaluate execution quality with LLM
   */
  async evaluate(context, taskId) {
    console.log("[QualityEvaluator] 🎯 Starting quality evaluation...");
    console.log(`[QualityEvaluator] Task: ${context.task.substring(0, 60)}...`);
    console.log(`[QualityEvaluator] Cells: ${context.cells.length}, Hostname: ${context.hostname}`);
    let model;
    try {
      model = await index.a0("skillEvaluation");
    } catch {
      console.log("[QualityEvaluator] Using fallback model");
      model = await index.a3("skillEvaluation");
    }
    const tracingEnabled = this.langsmithConfig.tracing && !!this.langsmithConfig.apiKey;
    console.log(`[QualityEvaluator] 📊 LangSmith tracing: ${tracingEnabled ? "enabled" : "disabled"}`);
    try {
      if (tracingEnabled) {
        console.log("[QualityEvaluator] 📡 Using traced evaluation...");
        return await this.evaluateWithTracing(model, context, taskId);
      } else {
        console.log("[QualityEvaluator] 🚀 Using direct evaluation (no tracing)...");
        return await this.evaluateInternal(model, context, taskId);
      }
    } catch (error) {
      console.warn("[QualityEvaluator] ❌ Evaluation failed:", error.message);
      return this.getFallbackScore(context);
    }
  }
  /**
   * Internal evaluation (without tracing)
   */
  async evaluateInternal(model, context, taskId) {
    const prompt = this.buildEvaluationPrompt(context);
    const response = await model.client.chat.completions.create({
      model: model.model,
      temperature: model.config.temperature,
      max_tokens: model.config.maxTokens || null,
      messages: [{ role: "user", content: prompt }],
      stream: false,
      taskId
    });
    let responseText = "choices" in response && response.choices?.[0]?.message?.content ? response.choices[0].message.content : "";
    const finishReason = response.choices?.[0]?.finish_reason;
    console.log(`[QualityEvaluator] 🏁 Finish reason: ${finishReason}`);
    if (finishReason === "length") {
      console.warn("[QualityEvaluator] ⚠️ Response truncated due to max_tokens limit!");
    }
    if (!responseText) {
      console.log("[QualityEvaluator] ⚠️ LLM returned empty content");
      return this.getFallbackScore(context);
    }
    console.log(`[QualityEvaluator] 📄 LLM response length: ${responseText.length} chars`);
    console.log(`[QualityEvaluator] 📄 Response preview (first 300):`, responseText.substring(0, 300));
    const originalResponse = responseText;
    responseText = index.a4(responseText);
    console.log(`[QualityEvaluator] 🧹 After JSON cleaning: ${responseText.length} chars`);
    if (originalResponse !== responseText) {
      console.log(`[QualityEvaluator] 🧹 JSON extraction changed the response`);
    }
    return this.parseQualityScore(responseText, context);
  }
  /**
   * Evaluation with LangSmith tracing
   */
  async evaluateWithTracing(model, context, taskId) {
    try {
      if (!this.langsmithClient) {
        console.log("[QualityEvaluator] 🔧 Initializing LangSmith client...");
        const { Client } = await import("langsmith");
        this.langsmithClient = new Client({
          apiKey: this.langsmithConfig.apiKey,
          apiUrl: this.langsmithConfig.endpoint || "https://api.smith.langchain.com"
        });
        console.log("[QualityEvaluator] ✅ LangSmith client initialized");
      }
      const { traceable } = await import("langsmith/traceable");
      const prompt = this.buildEvaluationPrompt(context);
      const llmInput = {
        messages: [{ role: "user", content: prompt }],
        model: model.model,
        temperature: 0.3,
        max_tokens: 2e3
      };
      const tracedEvaluation = traceable(
        async (input) => {
          console.log("[QualityEvaluator] 📊 Executing traced evaluation...");
          try {
            const score = await this.evaluateInternal(model, context, taskId);
            console.log(`[QualityEvaluator] 📊 Traced evaluation result: ${score.overallScore}/100`);
            const outputContent = JSON.stringify(score, null, 2);
            return {
              choices: [{
                message: {
                  role: "assistant",
                  content: outputContent
                }
              }],
              quality_score: score,
              usage_metadata: {
                input_tokens: Math.floor(JSON.stringify(input.messages).length / 4),
                output_tokens: Math.floor(outputContent.length / 4),
                total_tokens: Math.floor((JSON.stringify(input.messages).length + outputContent.length) / 4)
              }
            };
          } catch (error) {
            const fallbackScore = this.getFallbackScore(context);
            return {
              choices: [{
                message: {
                  role: "assistant",
                  content: `Error: ${error.message}`
                }
              }],
              quality_score: fallbackScore,
              usage_metadata: {
                input_tokens: Math.floor(JSON.stringify(input.messages).length / 4),
                output_tokens: 0,
                total_tokens: Math.floor(JSON.stringify(input.messages).length / 4)
              }
            };
          }
        },
        {
          name: "Script Use - Quality Evaluation",
          run_type: "llm",
          metadata: {
            model: "skillEvaluation",
            temperature: 0.3,
            feature: "script_use_quality_evaluation",
            task: context.task.substring(0, 100),
            hostname: context.hostname,
            cellCount: context.cells.length,
            ls_provider: "uniapi",
            ls_model_name: model.model
          },
          client: this.langsmithClient,
          project_name: this.langsmithConfig.project || "flowith-browser"
        }
      );
      const response = await tracedEvaluation(llmInput);
      const result = response.quality_score;
      console.log(`[QualityEvaluator] 🔗 Trace recorded to LangSmith project: ${this.langsmithConfig.project || "flowith-browser"}`);
      return result;
    } catch (error) {
      console.warn("[QualityEvaluator] ⚠️ Tracing failed, falling back to non-traced evaluation");
      console.warn("[QualityEvaluator] Tracing error:", error.message);
      return await this.evaluateInternal(model, context);
    }
  }
  /**
   * Build evaluation prompt
   */
  buildEvaluationPrompt(context) {
    const now = /* @__PURE__ */ new Date();
    const currentDate = now.toISOString().split("T")[0];
    const filesPreviews = this.buildFilesPreviews(context.savedFiles || []);
    return `You are an expert evaluator of browser automation task executions.

**FOCUS**: Judge the RESULTS and REUSABILITY, not the process.

**🌐 CLOUD SHARING THRESHOLD**: Only skills scoring **80+** will be shared with other users in the cloud skill library. This is a high bar - be rigorous but fair.

**Current Date:** ${currentDate} (for reference when validating extracted dates)

**Task Goal:**
${context.task}

**Claimed Results:**
${context.doneMessage}

**Actual Output (Verify Claims):**
${filesPreviews || "(None - No files saved)"}

**Execution Context:**
- Hostname: ${context.hostname}
- Total Steps: ${context.cells.length}

---

**Evaluate the execution on these TWO dimensions (0-100 scale):**

1. **Results Achievement (80% weight)**: Did the task get done with usable output?
   - **Verify file content**: Does actual output match what was claimed?
   - **Data completeness**: Claimed 50 items → verify actual count in file
   - **Structure correctness**: Is the format usable (valid JSON/CSV/etc)?
   - **Practical value**: Can a human use this output for their purpose?

   Scoring:
   - 90-100: Complete results, verified correct, all goals met
   - 80-89: Task done, output usable, **cloud-worthy quality**
   - 70-79: Task done but not ready for cloud sharing (minor issues)
   - 50-69: Partial results or some usability issues
   - Below 50: Failed task or unusable output

2. **Reusability (20% weight)**: Can this pattern work on similar tasks for OTHER USERS?
   - Uses generic selectors (not hardcoded IDs like #product-12345)
   - No user-specific values (names, emails, specific dates)
   - Adaptable approach (works if page structure slightly changes)
   - **Other users can apply this pattern to similar tasks**

   Scoring:
   - 90-100: Fully generic, works across similar pages, **ready for cloud sharing**
   - 80-89: Mostly generic, **cloud-worthy reusability**
   - 70-79: Some reusability but not ready for cloud (needs more generalization)
   - 50-69: Limited reusability, needs significant adaptation
   - Below 50: Hardcoded to specific instance

**DO NOT evaluate**:
- Process efficiency (error count, step count) - irrelevant if result is achieved
- Code elegance or optimization - only final output matters
- Data quality issues from website (missing ratings, language, etc) - not code's fault

---

**CRITICAL: Output Format (strict JSON, no markdown, no code blocks):**

{
  "overallScore": 82,
  "reasoning": "Task completed successfully. Verified 10 items in output file matching claimed count. Generic selectors make pattern reusable.",
  "dimensions": {
    "resultsAchievement": 85,
    "reusability": 80
  }
}

**Scoring Guidelines:**
- overallScore = (resultsAchievement * 0.8) + (reusability * 0.2)
- Example: If dimensions are [85, 80], then overallScore = 85*0.8 + 80*0.2 = 84
- reasoning must be 1-2 sentences focusing on RESULTS and REUSABILITY
- **CRITICAL**: 80+ is the cloud sharing threshold - only truly reusable, high-quality skills should reach this level
- Be rigorous: task done with usable output should score 75-79 unless it's genuinely cloud-worthy (80+)

**Example scoring scenarios**:
- **Cloud-worthy** (80+): Complete results + verified output + highly generic code + ready for other users → 82-88 range
- **Excellent cloud skill** (88+): Perfect results + highly reusable pattern + exemplary quality → 88-95 range
- **Good but not cloud-ready** (70-79): Task done + verified output + some hardcoded parts → 72-79 range
- **Acceptable execution** (65-75): Partial results but completed task → 65-75 range
- **Poor execution** (<65): Empty/wrong output or completely hardcoded → Below 65

**Evaluation Philosophy - Be Rigorous for Cloud Sharing:**

1. **Judge extraction success AND cloud-worthiness**:
   - If agent extracted all VISIBLE fields from DOM → Base score 75-79
   - To reach 80+, must also demonstrate: generic approach + reusable pattern + clean code
   - Missing fields are often due to website limitations, not code failure (don't penalize)
   - Focus: Did the code work? **Is it truly reusable for other users?**

2. **Scoring baseline**:
   - Task completed + file saved + reasonable structure → Start at 75 (not 50)
   - **To reach 80+ (cloud-worthy)**: Must show exceptional reusability + verified quality
   - Deduct only for actual CODE problems (errors, hardcoded values, wrong approach)
   - DO NOT deduct for website data quality issues (missing fields, language, API limits)

3. **80+ Requirements (Cloud Sharing Bar)**:
   - ✅ Complete, verified results (all claimed data present)
   - ✅ Generic selectors (data-testid, class patterns, NOT specific IDs)
   - ✅ No user-specific hardcoded values
   - ✅ Clean, reusable approach that other users can apply
   - ✅ Proper error handling and edge cases

4. **Common acceptable patterns** (don't penalize):
   - Null/0/N/A values when data not available in DOM
   - Non-English text (reflects actual website content)
   - Dates matching current date (real-time data, not errors)
   - Partial data fields (extraction worked for available elements)

**Bad reasons to give low scores**:
- "Data should be in English" (website content varies)
- "All ratings are N/A" (website may not show them)
- "Some prices missing" (out of stock is normal)
- "Dates seem too recent" (real-time extraction is expected)

**Good reasons to prevent 80+ score** (keep 70-79):
- Hardcoded specific IDs or values (not generic enough)
- User-specific data in code (email, username)
- Brittle selectors that won't work for others
- Missing verification or error handling

**Good reasons for low scores** (<70):
- Empty/corrupted output file
- Severe hardcoding throughout
- Code errors causing data loss
- Wrong data structure (not matching task requirements)

---

**CRITICAL OUTPUT RULES** (MANDATORY):
1. Your response MUST be a single JSON object starting with {
2. DO NOT wrap JSON in markdown code blocks (\`\`\`json ... \`\`\`)
3. DO NOT add explanations before or after the JSON
4. DO NOT use markdown formatting for the JSON output
5. First character of your response must be {

**CORRECT FORMAT:**
{
  "overallScore": 82,
  "reasoning": "...",
  "dimensions": {"resultsAchievement": 85, "reusability": 80}
}

**WRONG FORMATS** (DO NOT USE):
\`\`\`json
{"overallScore": 82, ...}
\`\`\`

Here's my evaluation:
{"overallScore": 82, ...}

Your response must START with { on the first line.`;
  }
  /**
   * Parse quality score from LLM response
   */
  parseQualityScore(responseText, context) {
    try {
      console.log("[QualityEvaluator] 🔍 Attempting to parse JSON...");
      const parsed = JSON.parse(responseText);
      console.log("[QualityEvaluator] ✅ JSON parse successful");
      if (typeof parsed.overallScore !== "number" || typeof parsed.reasoning !== "string" || !parsed.dimensions) {
        throw new Error("Invalid quality score format");
      }
      const score = {
        overallScore: Math.max(0, Math.min(100, parsed.overallScore)),
        reasoning: parsed.reasoning || "No reasoning provided",
        dimensions: {
          resultsAchievement: parsed.dimensions.resultsAchievement || parsed.dimensions.goalAlignment || 0,
          reusability: parsed.dimensions.reusability || parsed.dimensions.generalizability || 0
        }
      };
      console.log(`[QualityEvaluator] ✅ Parsed score: ${score.overallScore}/100`);
      console.log(`[QualityEvaluator] 📝 Reasoning: ${score.reasoning.substring(0, 80)}...`);
      return score;
    } catch (parseError) {
      console.error("[QualityEvaluator] 🔴 JSON_PARSE_FAILED");
      console.error("[QualityEvaluator] Parse error:", parseError);
      console.error("[QualityEvaluator] Response length:", responseText.length);
      console.error("[QualityEvaluator] Response (first 500):", responseText.substring(0, 500));
      console.error("[QualityEvaluator] Response (last 500):", responseText.substring(Math.max(0, responseText.length - 500)));
      console.error("[QualityEvaluator] Full response:", responseText);
      return this.getFallbackScore(context);
    }
  }
  /**
   * Build file previews for evaluation
   * Reads file content (limited to 5KB per file) to verify actual output
   */
  buildFilesPreviews(savedFiles) {
    if (savedFiles.length === 0) {
      return "(None)";
    }
    const previews = [];
    for (const file of savedFiles) {
      try {
        const fs = require("fs");
        const textTypes = ["text/", "application/json", "application/csv", "application/xml"];
        const isTextFile = textTypes.some((t) => file.type.includes(t)) || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".json") || file.name.endsWith(".csv");
        if (!isTextFile) {
          previews.push(`- ${file.name} (${file.size} bytes, ${file.type}) [Binary file, not previewed]`);
          continue;
        }
        const MAX_PREVIEW_SIZE = 5120;
        const content = fs.readFileSync(file.path, "utf-8");
        let preview = "";
        if (file.type.includes("json") || file.name.endsWith(".json")) {
          try {
            const data = JSON.parse(content);
            if (Array.isArray(data)) {
              const previewCount = Math.min(5, data.length);
              const previewData = data.slice(0, previewCount);
              preview = `Type: JSON Array (${data.length} items)
Preview (first ${previewCount}):
${JSON.stringify(previewData, null, 2)}`;
              if (data.length > previewCount) {
                preview += `
... (${data.length - previewCount} more items)`;
              }
            } else {
              preview = `Type: JSON Object
${JSON.stringify(data, null, 2).substring(0, MAX_PREVIEW_SIZE)}`;
            }
          } catch {
            preview = content.substring(0, MAX_PREVIEW_SIZE);
          }
        } else if (file.type.includes("csv") || file.name.endsWith(".csv")) {
          const lines = content.split("\n");
          const previewLines = lines.slice(0, 15);
          preview = `Type: CSV (${lines.length} rows)
${previewLines.join("\n")}`;
          if (lines.length > 15) {
            preview += `
... (${lines.length - 15} more rows)`;
          }
        } else {
          preview = content.substring(0, MAX_PREVIEW_SIZE);
          if (content.length > MAX_PREVIEW_SIZE) {
            preview += "\n... (truncated)";
          }
        }
        previews.push(`- **${file.name}** (${file.size} bytes)
${preview}`);
      } catch (error) {
        previews.push(`- ${file.name} (${file.size} bytes) [Error reading: ${error.message}]`);
      }
    }
    return previews.join("\n\n");
  }
  /**
   * Generate fallback score when LLM fails
   */
  getFallbackScore(context) {
    const hasFiles = (context.savedFiles?.length || 0) > 0;
    const resultsScore = hasFiles ? 78 : 65;
    const reusabilityScore = 75;
    const overallScore = Math.round(resultsScore * 0.8 + reusabilityScore * 0.2);
    return {
      overallScore,
      reasoning: `Fallback evaluation: Task completed after ${context.cells.length} steps. ${hasFiles ? "Files saved." : "No files saved."} Assuming reasonable execution.`,
      dimensions: {
        resultsAchievement: resultsScore,
        reusability: reusabilityScore
      }
    };
  }
}
exports.QualityEvaluator = QualityEvaluator;
