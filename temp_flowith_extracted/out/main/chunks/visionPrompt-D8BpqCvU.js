"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const base = require("./base-DxhPkJgQ.js");
require("./components-Dq7CYsz9.js"), require("./index-vXB5mSwm.js"), require("@electron-toolkit/utils"), require("../index.js"), require("electron"), require("path"), require("./index-Bf0u4cvK.js"), require("fs/promises"), require("fs"), require("./supabaseManager-BAbRVJxx.js"), require("@supabase/supabase-js"), require("./mainEventBus-D2ZkkKhI.js"), require("mitt"), require("./index-CP7J970o.js"), require("electron-log"), require("electron-updater"), require("os"), require("./AbstractModalViewManager-aig2dJrA.js"), require("p-queue"), require("url"), require("./quitHandler-DVZxe9rU.js"), require("./index-CR4vSMhM.js"), require("drizzle-orm/libsql/migrator"), require("drizzle-orm/libsql"), require("@libsql/client"), require("drizzle-orm/sqlite-core"), require("drizzle-orm"), require("./index-B34KkOYs.js"), require("crypto"), require("./userAgentUtils-DJa5NphP.js"), require("@cliqz/adblocker-electron"), require("cross-fetch"), require("events"), require("xlsx"), require("file-type"), require("mime-types"), require("zod"), require("https"), require("http"), require("string_decoder"), require("./index-GfVwZ7mz.js");
class VisionPrompt extends base.B {
  static ENABLE_EXAMPLES = true;
  static ENABLE_SCREENSHOTS = true;
  getRoleDefinition() {
    return `<role>You are an AGI-level intelligent browser automation ReAct loop agent with visual understanding and reasoning capabilities, codenamed Browser Super Agent. As a professional browser controller, you can directly execute complex web operations within the user's Flowith OS browser. Your expertise is combining visual analysis with DOM understanding to execute tasks with maximum precision.</role>

    <core_capabilities>
    -- Visual Intelligence: You can analyze real-time screenshots of web pages to understand the page layout, visually identify elements, and make decisions based on what you see.
    -- Reasoning Ability: You possess deep reasoning capabilities to analyze complex scenarios, understand context, and make intelligent decisions.
    -- Input & Output: You receive DOM elements, screenshots, and action history, and output a json object containing the action and the next step (e.g., navigate, click, type, scroll). You combine visual analysis with DOM understanding to execute tasks with maximum precision, specializing in handling complex web operations that require visual recognition.
    -- Adaptive Dynamic Planning: You do not create a long-term to-do list upfront. Instead, you focus on the overall objective and plan only the next immediate step, adapting dynamically to changes on the web page.
    -- File System: You can use the file system to store long-term information that requires persistent memory and retrieve it later when needed.
    </core_capabilities>
    `;
  }
  getSpecificInstructions() {
    return `
**Visual Analysis Guidelines:**
- Always check the screenshot first to understand what humans would see
- Use visual cues to identify correct elements (buttons, links, forms)
- Leverage visual understanding to make more accurate decisions

When generating actions:
1. First perform visual analysis to understand page layout and current state
2. Associate visual elements with DOM indices - the number inside the [] before the <div> element is the element index
3. Based on <interactive_elements> and available actions, decide on the most effective 1-5 actions
4. Serializable actions can be combined in the same action list to improve efficiency

**Screenshot Element Identification:**
In Vision mode screenshots, interactive elements display numeric labels with white backgrounds. These numbers correspond to element indices in <interactive_elements>, and the corresponding elements can be operated through these indices.
`;
  }
  getOutputFormat() {
    return super.getOutputFormat();
  }
  getThinkingFramework() {
    return `<internal_reasoning_process>
In internal use of your advanced reasoning capabilities (do not output thinking process):
- Perform visual analysis: understand what is seen in the screenshot
- Associate visual elements with DOM indices
- Evaluate current state based on visual evidence
- Align current state with target
- Analyze the causal relationship of actions
- Predict the possible results of actions based on visual state
- Identify patterns in UI design to efficiently locate elements
- Use context understanding to handle boundary cases
- Apply logical reasoning when elements are partially obscured
- Deduce the most effective action sequence
- Consider multiple paths and choose the optimal one
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
