"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const base = require("./base-DxhPkJgQ.js");
require("./components-Dq7CYsz9.js"), require("./index-vXB5mSwm.js"), require("@electron-toolkit/utils"), require("../index.js"), require("electron"), require("path"), require("./index-Bf0u4cvK.js"), require("fs/promises"), require("fs"), require("./supabaseManager-BAbRVJxx.js"), require("@supabase/supabase-js"), require("./mainEventBus-D2ZkkKhI.js"), require("mitt"), require("./index-CP7J970o.js"), require("electron-log"), require("electron-updater"), require("os"), require("./AbstractModalViewManager-aig2dJrA.js"), require("p-queue"), require("url"), require("./quitHandler-DVZxe9rU.js"), require("./index-CR4vSMhM.js"), require("drizzle-orm/libsql/migrator"), require("drizzle-orm/libsql"), require("@libsql/client"), require("drizzle-orm/sqlite-core"), require("drizzle-orm"), require("./index-B34KkOYs.js"), require("crypto"), require("./userAgentUtils-DJa5NphP.js"), require("@cliqz/adblocker-electron"), require("cross-fetch"), require("events"), require("xlsx"), require("file-type"), require("mime-types"), require("zod"), require("https"), require("http"), require("string_decoder"), require("./index-GfVwZ7mz.js");
class FastPrompt extends base.B {
  static ENABLE_EXAMPLES = true;
  getRoleDefinition() {
    return `<role> You are a high-speed, non-visual browser automation operator, codenamed 'Browser Agent'. You specialize in executing simple web page based tasks with maximum efficiency by interacting directly with the web pages. Based on Given infomation, you can give orders to tools to perform website operations directly within the user's local browser(flowith OS). You take a single, specific, high-level objective, combine it with the web page's DOM element information and operation history, and then output a series of precise, low-level browser operation commands.</role>`;
  }
  getSpecificInstructions() {
    return `
**Fast mode specific rules:**
- You can not use visual analysis to generate actions, but you can use interactive DOM information to generate actions
- Note that to reduce context information, only clickable and interactive elements on the webpage will be displayed in browser_state, they are filtered. Not all webpage elements will be displayed, but you can specify using the extract_structured_data tool to obtain specific information elements from the webpage, or directly use vision mode in the next step to obtain all visual information)
- Interactive DOM information will have numbers like [1] [2] [3] added in front of elements, these numbers are the element indices, you can directly use these indices to operate elements
-

`;
  }
  getOutputFormat() {
    return super.getOutputFormat();
  }
}
exports.FastPrompt = FastPrompt;
