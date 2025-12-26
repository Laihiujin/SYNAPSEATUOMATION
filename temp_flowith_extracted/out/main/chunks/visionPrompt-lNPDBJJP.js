"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const base = require("./base-Boz4k_1e.js");
require("./components-Dq7CYsz9.js"), require("./index-vXB5mSwm.js"), require("@electron-toolkit/utils"), require("../index.js"), require("electron"), require("path"), require("./index-Bf0u4cvK.js"), require("fs/promises"), require("fs"), require("./supabaseManager-BAbRVJxx.js"), require("@supabase/supabase-js"), require("./mainEventBus-D2ZkkKhI.js"), require("mitt"), require("./index-CP7J970o.js"), require("electron-log"), require("electron-updater"), require("os"), require("./AbstractModalViewManager-aig2dJrA.js"), require("p-queue"), require("url"), require("./quitHandler-DVZxe9rU.js"), require("./index-CR4vSMhM.js"), require("drizzle-orm/libsql/migrator"), require("drizzle-orm/libsql"), require("@libsql/client"), require("drizzle-orm/sqlite-core"), require("drizzle-orm"), require("./index-B34KkOYs.js"), require("crypto"), require("./userAgentUtils-DJa5NphP.js"), require("@cliqz/adblocker-electron"), require("cross-fetch"), require("events"), require("xlsx"), require("file-type"), require("mime-types"), require("zod"), require("https"), require("http"), require("string_decoder"), require("./index-GfVwZ7mz.js");
class VisionPrompt extends base.B {
  static ENABLE_EXAMPLES = true;
  static ENABLE_SCREENSHOTS = true;
  getRoleDefinition() {
    return `<role>You are 'Browser Agent Neo', an AGI-level intelligent browser automation ReAct agent.
<objective>Execute complex web operations requiring visual analysis and reasoning.</objective>
    <core_capabilities>
- **Visual Intelligence:** Analyze real-time screenshots to understand layout, identify elements, and verify state.
- **Reasoning:** Analyze complex scenarios and make intelligent decisions based on visual cues.
- **Input/Output:** Consume DOM + Screenshot; Produce JSON Actions.
    </core_capabilities>
</role>`;
  }
  getSpecificInstructions() {
    return `
<vision_guidelines>
1. **Visual First:** ALWAYS analyze the screenshot first. Understand layout, buttons, links, and forms as a human would.
2. **Indices:** Interactive elements in screenshots have numeric labels with white backgrounds. These correspond strictly to <interactive_elements> indices [N].
3. **Decision:** Use visual cues to select the best element. If DOM is unclear, trust the visual layout.
</vision_guidelines>`;
  }
  getOutputFormat() {
    return super.getOutputFormat();
  }
  getThinkingFramework() {
    return `<internal_reasoning_process>
In internal use of your advanced reasoning capabilities (do not output thinking process):
1. **Identify:** Scan the screenshot for key elements related to <current_subgoal>.
2. **Map:** Link the visual target to a DOM index [x].
3. **Act:** Generate the precise JSON action.
</internal_reasoning_process>`;
  }
  buildUserMessage(params) {
    const { userImages = [], ...restParams } = params;
    const multimodalContent = this.components.buildMultimodalContent(restParams);
    const hasTabScreenshots = VisionPrompt.ENABLE_SCREENSHOTS && multimodalContent.segments.some((segment) => segment.screenshot);
    const hasUserImages = userImages.length > 0;
    const hasAnyImages = hasTabScreenshots || hasUserImages;
    if (hasAnyImages) {
      const contentParts = [];
      const overviewText = this.buildEnhancedImageOverview();
      if (overviewText) {
        contentParts.push({ type: "text", text: overviewText });
      }
      for (const segment of multimodalContent.segments) {
        contentParts.push({ type: "text", text: segment.text });
        if (segment.screenshot && VisionPrompt.ENABLE_SCREENSHOTS) {
          const screenshotAttr = segment.screenshotType ? ` type="${segment.screenshotType}"` : "";
          contentParts.push({ type: "text", text: `            <screenshot${screenshotAttr}>` });
          contentParts.push({ type: "image", image: segment.screenshot });
          contentParts.push({ type: "text", text: "</screenshot>\n" });
        }
      }
      if (userImages.length > 0) {
        contentParts.push({ type: "text", text: "\n    <user_images>\n" });
        for (const userImage of userImages) {
          if (userImage.image_data) {
            let xmlAttrs = "";
            if (userImage.fileId) xmlAttrs += ` id="${userImage.fileId}"`;
            if (userImage.filename) xmlAttrs += ` name="${userImage.filename}"`;
            if (userImage.summary) xmlAttrs += ` summary="${userImage.summary}"`;
            if (userImage.description) xmlAttrs += ` description="${userImage.description}"`;
            contentParts.push({ type: "text", text: `        <user_image${xmlAttrs}>` });
            contentParts.push({ type: "image", image: userImage.image_data });
            contentParts.push({ type: "text", text: "</user_image>\n" });
          }
        }
        contentParts.push({ type: "text", text: "    </user_images>\n" });
      }
      return { content: contentParts };
    } else {
      const combinedText = multimodalContent.segments.map((s) => s.text).join("");
      return { content: combinedText };
    }
  }
  buildEnhancedImageOverview() {
    return "";
  }
}
exports.VisionPrompt = VisionPrompt;
