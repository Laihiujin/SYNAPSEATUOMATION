"use strict";
const index = require("./index-vXB5mSwm.js");
class PromptComponents {
  /**
   * 简化标签页 URL 显示，用于 <open_tabs>
   */
  static simplifyUrlForTabs(url, maxLength = 40) {
    if (!url) return "";
    if (url.startsWith("data:")) return "data:...";
    if (url.startsWith("about:")) {
      return url.length > maxLength ? url.substring(0, maxLength - 3) + "..." : url;
    }
    if (url.startsWith("file://")) return "file://...";
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace("www.", "");
      if (!urlObj.pathname || urlObj.pathname === "/") {
        if (!urlObj.search) return domain;
      }
      let result = domain;
      if (urlObj.pathname && urlObj.pathname !== "/") {
        const path = urlObj.pathname.replace(/^\/+|\/+$/g, "");
        if (path.length > 15) {
          result += "/" + path.substring(0, 12) + "...";
        } else {
          result += "/" + path;
        }
      }
      if (urlObj.search) {
        result += "?...";
      }
      if (result.length > maxLength) {
        return result.substring(0, maxLength - 3) + "...";
      }
      return result;
    } catch {
      return url.length > maxLength ? url.substring(0, maxLength - 3) + "..." : url;
    }
  }
  /**
   * 将文本转义为可安全嵌入到 XML/HTML 中的形式
   */
  static escapeForXml(input) {
    if (!input) return "";
    return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
  }
  /**
   * 格式化标签页变化历史记录
   */
  formatTabChanges(changes) {
    if (!changes || changes.length === 0) {
      return "        <!-- No tab changes recorded -->\n";
    }
    return changes.map((change) => {
      const prompt = change.toPrompt();
      return prompt ? `        - ${prompt}` : "";
    }).filter(Boolean).join("\n") + "\n";
  }
  // 已迁移：getActionList / getBaseInstructions / getOutputFormatBasic 均已内联至 base.ts
  /**
   * 动态构建用户消息内容 - 支持多标签页格式
   */
  buildDynamicUserContent(params) {
    const commonSections = this.buildCommonContentSections(params);
    const browserState = this.buildBrowserStateSection(params);
    const contentParts = [commonSections.taskOverview, commonSections.planState];
    if (commonSections.fileSystemState) {
      contentParts.push(commonSections.fileSystemState);
    }
    contentParts.push(commonSections.staticContent);
    contentParts.push(browserState);
    return contentParts.join("");
  }
  /**
   * 构建多模态内容 - 支持截图嵌入到对应tab结构中
   */
  buildMultimodalContent(params) {
    const commonSections = this.buildCommonContentSections(params);
    const browserStateSegments = this.buildBrowserStateSegments(params);
    const segments = [];
    segments.push({ text: commonSections.taskOverview });
    segments.push({ text: commonSections.planState });
    if (commonSections.fileSystemState) {
      segments.push({ text: commonSections.fileSystemState });
    }
    segments.push({ text: commonSections.staticContent });
    segments.push(...browserStateSegments);
    return { segments };
  }
  // ===== 私有辅助方法 - 重构公共逻辑 =====
  /**
   * 构建公共的内容部分
   */
  buildCommonContentSections(params) {
    const buildReadFileAction = (action, lodLevel, indentation) => {
      return `${indentation}<action name="read_file" success="${action.success}"  relative_path="${action.relativePath}" result="${action.toPrompt(lodLevel)}" />`;
    };
    const buildOneStepHistory = (step, lodLevel, indentation) => {
      const lines = [];
      const stepTag = `step_${step.stepNumber}`;
      lines.push(`${indentation}<${stepTag}>`);
      const innerIndentation = indentation + "    ";
      lines.push(`${innerIndentation}<subgoal>${step.subgoal}</subgoal>`);
      for (const action of step.results) {
        if (index.a2(action)) {
          lines.push(buildReadFileAction(action, lodLevel, innerIndentation));
        } else {
          lines.push(
            `${innerIndentation}<action name="${action.actionName}" success="${action.success}" result="${action.toPrompt(lodLevel)}" />`
          );
        }
      }
      lines.push(`${indentation}</${stepTag}>`);
      return lines.join("\n");
    };
    const buildSkillsSection = (skills, indentation) => {
      console.log(`🎯 [Prompt] buildSkillsSection called: ${skills.length} skills/memories`);
      if (skills.length === 0) {
        console.warn("⚠️ [Prompt] NO SKILLS/MEMORIES - skillsDetailed is empty!");
        return "";
      }
      console.log(
        `✅ [Prompt] Including ${skills.length} skills/memories:`,
        skills.map((s) => s.item.name)
      );
      const lines = [];
      lines.push(`${indentation}<references information (skills and memories) >`);
      const ii = indentation + "    ";
      for (const skill of skills) {
        lines.push(`${ii}<reference name="${skill.item.name}" type="${skill.item.type}" >`);
        lines.push(`${ii}    <content>`);
        lines.push(`<![CDATA[`);
        lines.push(skill.content);
        lines.push(`]]>`);
        lines.push(`${ii}    </content>`);
        lines.push(`${ii}</reference>`);
      }
      lines.push(`${indentation}</references>
`);
      return lines.join("\n");
    };
    const {
      userRequest,
      currentSubgoal,
      stepInfo,
      currentTime,
      executionHistory,
      executionTrace,
      fileSystemState
    } = params;
    const missingParams = [];
    if (!userRequest) missingParams.push("userRequest");
    if (missingParams.length > 0) {
      console.warn("🚨 Prompt参数缺失:", missingParams);
    }
    let taskOverview = "<task_overview>\n";
    taskOverview += `    <user_request>${userRequest}</user_request>
`;
    taskOverview += `    <current_subgoal>${currentSubgoal}</current_subgoal>
`;
    taskOverview += `    <task_id>${params.taskId}</task_id>
`;
    if (executionTrace) {
      const safeTrace = PromptComponents.escapeForXml(executionTrace);
      taskOverview += `    <execution_trace>${safeTrace}</execution_trace>
`;
    }
    const followUpHistory = params.executionHistory.filter((step) => step.followUpMessage).map((step) => {
      return {
        stepNumber: step.stepNumber,
        message: step.followUpMessage
      };
    });
    if (followUpHistory && followUpHistory.length > 0) {
      taskOverview += "    <follow_up_history>\n";
      const recentFollowUps = followUpHistory.slice(-10);
      recentFollowUps.forEach((record) => {
        const escapedMessage = PromptComponents.escapeForXml(record.message);
        taskOverview += `        <follow_up step="${record.stepNumber}">${escapedMessage}</follow_up>
`;
      });
      taskOverview += "    </follow_up_history>\n";
    }
    const detailed = params.skillsDetailed;
    taskOverview += buildSkillsSection(detailed, "    ");
    taskOverview += `    <progress>step_${stepInfo.stepNumber}</progress>
`;
    taskOverview += `    <timestamp>${currentTime}</timestamp>
`;
    if (params.currentMode && (params.userAgentMode === "fast" || params.userAgentMode === "vision")) {
      if (params.currentMode === "fast") {
        taskOverview += "    <mode_instruction>The user has set Forced Fast mode. Please keep using Fast mode as the NextStepMode.</mode_instruction>\n";
      } else if (params.currentMode === "vision") {
        taskOverview += "    <mode_instruction>The user has set Forced Vision mode. Please keep using Vision mode as the NextStepMode.</mode_instruction>\n";
      }
    }
    taskOverview += "</task_overview>\n\n";
    const planStateLines = [];
    planStateLines.push(
      "## Below is the history of your previous actions and the results, notice: the <subgoal> inside <step_n> is the subgoal of the step, which can not guarantee to be done correctly."
    );
    planStateLines.push("<action_history>");
    for (const historyStep of executionHistory) {
      const lodLevel = stepInfo.stepNumber - historyStep.stepNumber;
      planStateLines.push(buildOneStepHistory(historyStep, lodLevel, "    "));
    }
    planStateLines.push("</action_history>");
    planStateLines.push("\n");
    planStateLines.push("<attention>");
    planStateLines.push(
      "    If there are repeated operations（more than 3 steps in above action_history） have been executed without helping you to solve the problem or making progress, YOU SHOULD CHANGE a approach to solve the problem, not use the same tool to solve the problem again. You can use the vision mode to solve the problem."
    );
    planStateLines.push("</attention>");
    planStateLines.push("\n");
    const planState = planStateLines.join("\n");
    let fileSystemStateContent;
    if (fileSystemState && typeof fileSystemState === "string") {
      console.info(`🔍 add fileSystemState to Prompt: ${fileSystemState.length} characters`);
      console.info(
        `🔍 fileSystemState contains 'user upload': ${fileSystemState.includes("user upload")}`
      );
      fileSystemStateContent = "## File System State:\n" + fileSystemState + "\n\n";
    } else {
      console.warn("🔍 ⚠️ fileSystemState is empty or type is incorrect, skip file system state");
    }
    const staticContent = `
## Current Tabs Information:
Note that only interactive elements on the webpage will be displayed below. Not all webpage elements provided.
`;
    return {
      taskOverview,
      planState,
      fileSystemState: fileSystemStateContent,
      staticContent
    };
  }
  /**
   * 构建浏览器状态部分（文本版本）
   */
  buildBrowserStateSection(params) {
    const { tabsContext = [], allTabs = [] } = params;
    let browserState = "<browser_state>\n";
    browserState += '    <!-- required_for_step="true" indicates the tab that AI decided to read or operate in this round, containing complete interactive elements, it is the marked tab -->\n';
    browserState += '    <!-- user_viewing="true" indicates the tab that the user is currently viewing - Use this tab for task-related operations to avoid disrupting user context; create new tabs for unrelated tasks -->\n';
    browserState += '    <!-- Please prioritize tabs with required_for_step="true", as they contain the elements you need to operate -->\n';
    if (params.tabChanges && params.tabChanges.length > 0) {
      browserState += "    <!-- Tab changes after the previous operation -->\n";
      browserState += "    <!-- These changes may be caused by AI operations or human operations -->\n";
      browserState += "    <tab_changes>\n";
      browserState += this.formatTabChanges(params.tabChanges);
      browserState += "    </tab_changes>\n\n";
    }
    browserState += "    <tabs>\n";
    const affectedTabIds = new Set(tabsContext.map((t) => t.tabId));
    for (const tab of tabsContext) {
      const userViewingAttr = tab.userViewing ? ' user_viewing="true"' : "";
      const simplifiedUrl = PromptComponents.simplifyUrlForTabs(tab.url);
      const safeUrl = PromptComponents.escapeForXml(simplifiedUrl);
      const safeTitle = PromptComponents.escapeForXml(tab.title);
      const safeInteractive = tab.interactiveElements;
      browserState += `        <tab id="${tab.tabId}" required_for_step="true"${userViewingAttr}>
`;
      browserState += `            <url>${safeUrl}</url>
`;
      browserState += `            <title>${safeTitle}</title>
`;
      browserState += "            <interactive_elements>\n";
      browserState += "            <![CDATA[\n";
      browserState += safeInteractive + "\n";
      browserState += "            ]]>\n";
      browserState += "            </interactive_elements>\n";
      browserState += "        </tab>\n";
    }
    for (const tab of allTabs) {
      if (!affectedTabIds.has(tab.id)) {
        const userViewingAttr = tab.userViewing ? ' user_viewing="true"' : "";
        const simplifiedUrl = PromptComponents.simplifyUrlForTabs(tab.url);
        const safeUrl = PromptComponents.escapeForXml(simplifiedUrl);
        const safeTitle = PromptComponents.escapeForXml(tab.title);
        browserState += `        <tab id="${tab.id}"${userViewingAttr}>
`;
        browserState += `            <url>${safeUrl}</url>
`;
        browserState += `            <title>${safeTitle}</title>
`;
        browserState += "        </tab>\n";
      }
    }
    if (tabsContext.length === 0 && allTabs.length === 0) {
      browserState += "        No tabs are currently open. Please use the go_to_url action to create a new tab.\n";
      browserState += '        Example: {"go_to_url": {"url": "https://google.com/search?udm=50&q={{keywords}}"}}\n';
    }
    browserState += "    </tabs>\n";
    browserState += "</browser_state>";
    return browserState;
  }
  /**
   * 构建浏览器状态部分（多模态版本）
   */
  buildBrowserStateSegments(params) {
    const { tabsContext = [], allTabs = [] } = params;
    const segments = [];
    let browserStateStart = "<browser_state>\n";
    browserStateStart += '  <!-- required_for_step="true" indicates the tab that AI decided to read or operate in this round, containing complete interactive elements -->\n';
    browserStateStart += '   <!-- user_viewing="true" indicates the tab that the user is currently viewing - Use this tab for task-related operations to avoid disrupting user context; create new tabs for unrelated tasks -->\n';
    browserStateStart += '    <!-- Please prioritize tabs with required_for_step="true", as they contain the elements you need to operate -->\n';
    browserStateStart += '    <!-- Screenshot types: type="with_highlight" shows numbered labels on interactive elements for element identification, type="without_highlight" shows clean page view for visual analysis -->\n';
    if (params.tabChanges && params.tabChanges.length > 0) {
      browserStateStart += "    <!-- Tab changes after the previous operation -->\n";
      browserStateStart += "    <!-- These changes may be caused by AI operations or human operations -->\n";
      browserStateStart += "    <tab_changes>\n";
      browserStateStart += this.formatTabChanges(params.tabChanges);
      browserStateStart += "    </tab_changes>\n\n";
    }
    browserStateStart += "    <tabs>\n";
    segments.push({ text: browserStateStart });
    const affectedTabIds = new Set(tabsContext.map((t) => t.tabId));
    for (const tab of tabsContext) {
      const userViewingAttr = tab.userViewing ? ' user_viewing="true"' : "";
      const simplifiedUrl = PromptComponents.simplifyUrlForTabs(tab.url);
      const safeUrl = PromptComponents.escapeForXml(simplifiedUrl);
      const safeTitle = PromptComponents.escapeForXml(tab.title);
      const safeInteractive = tab.interactiveElements;
      const hasHighlight = !!tab.screenshotWithHighlight;
      const hasNoHighlight = !!tab.screenshotWithoutHighlight;
      let tabContent = `        <tab id="${tab.tabId}" required_for_step="true"${userViewingAttr}>
`;
      tabContent += `            <url>${safeUrl}</url>
`;
      tabContent += `            <title>${safeTitle}</title>
`;
      tabContent += "            <interactive_elements>\n";
      tabContent += "            <![CDATA[\n";
      tabContent += safeInteractive + "\n";
      tabContent += "            ]]>\n";
      tabContent += "            </interactive_elements>\n";
      if (hasHighlight || hasNoHighlight) {
        segments.push({ text: tabContent });
        if (hasHighlight) {
          segments.push({
            text: "",
            screenshot: tab.screenshotWithHighlight,
            screenshotType: "with_highlight"
            // 标记为带高亮的截图
          });
        }
      } else {
        segments.push({ text: tabContent });
      }
      segments.push({ text: "        </tab>\n" });
    }
    for (const tab of allTabs) {
      if (!affectedTabIds.has(tab.id)) {
        const userViewingAttr = tab.userViewing ? ' user_viewing="true"' : "";
        const simplifiedUrl = PromptComponents.simplifyUrlForTabs(tab.url);
        const safeUrl = PromptComponents.escapeForXml(simplifiedUrl);
        const safeTitle = PromptComponents.escapeForXml(tab.title);
        let tabContent = `        <tab id="${tab.id}"${userViewingAttr}>
`;
        tabContent += `            <url>${safeUrl}</url>
`;
        tabContent += `            <title>${safeTitle}</title>
`;
        tabContent += "        </tab>\n";
        segments.push({ text: tabContent });
      }
    }
    if (tabsContext.length === 0 && allTabs.length === 0) {
      const emptyTabsGuidance = "        No open tabs. Please use the go_to_url action to create a new tab.\n";
      const exampleUsage = '        For example: {"go_to_url": {"url": "https://google.com/search?udm=50&q={{keywords}}"}}\n';
      segments.push({ text: emptyTabsGuidance + exampleUsage });
    }
    let browserStateEnd = "    </tabs>\n";
    browserStateEnd += "</browser_state>";
    segments.push({ text: browserStateEnd });
    return segments;
  }
}
exports.P = PromptComponents;
