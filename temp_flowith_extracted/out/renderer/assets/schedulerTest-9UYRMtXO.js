import { r as reactExports, j as jsxRuntimeExports, d as ReactDOM, R as React } from "./client-DljuHW-m.js";
function App() {
  const [jobs, setJobs] = reactExports.useState([]);
  const [logs, setLogs] = reactExports.useState([]);
  const [jobType, setJobType] = reactExports.useState("test-job");
  const [scheduleType, setScheduleType] = reactExports.useState("once");
  const [dateStr, setDateStr] = reactExports.useState("");
  const [cronExpression, setCronExpression] = reactExports.useState("*/10 * * * * *");
  const [payloadStr, setPayloadStr] = reactExports.useState('{"msg": "hello"}');
  const refreshJobs = async () => {
    try {
      const list = await window.schedulerTest.getJobs();
      setJobs(list);
    } catch (err) {
      console.error("Failed to get jobs", err);
    }
  };
  reactExports.useEffect(() => {
    refreshJobs();
    const unsubscribe = window.schedulerTest.onLog((log) => {
      setLogs((prev) => [log, ...prev].slice(0, 100));
      refreshJobs();
    });
    return unsubscribe;
  }, []);
  const handleAdd = async () => {
    try {
      let schedule;
      if (scheduleType === "once") {
        const delay = parseInt(dateStr);
        if (!isNaN(delay) && /^\d+$/.test(dateStr)) {
          schedule = { type: "once", at: new Date(Date.now() + delay * 1e3) };
        } else {
          schedule = { type: "once", at: new Date(dateStr) };
        }
      } else {
        schedule = { type: "cron", expression: cronExpression };
      }
      const payload = JSON.parse(payloadStr);
      await window.schedulerTest.addJob({
        type: jobType,
        schedule,
        payload,
        metadata: { source: "debugger" }
      });
      setLogs((prev) => [`Added job: ${jobType}`, ...prev]);
      refreshJobs();
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    }
  };
  const handleRemove = async (id) => {
    try {
      await window.schedulerTest.removeJob(id);
      setLogs((prev) => [`Removed job: ${id}`, ...prev]);
      refreshJobs();
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl p-4 font-sans", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-4 text-2xl font-bold", children: "Scheduler Debugger" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border bg-white p-4 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-semibold", children: [
            "Scheduled Jobs (",
            jobs.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: refreshJobs, className: "rounded bg-gray-100 px-2 py-1 text-sm", children: "Refresh" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[60vh] overflow-auto", children: [
          jobs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "No jobs scheduled." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: jobs.map((job) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "group relative rounded border p-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-blue-600", children: [
              job.type,
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
                "#",
                job.id.slice(0, 8)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-700", children: job.schedule.type === "cron" ? `Cron: ${job.schedule.expression}` : `Once: ${new Date(job.schedule.at).toLocaleString()}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-gray-500", children: [
              "Next: ",
              job.nextRunAt ? new Date(job.nextRunAt).toLocaleString() : "N/A"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-gray-400", children: [
              "Payload: ",
              JSON.stringify(job.payload)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleRemove(job.id),
                className: "absolute right-2 top-2 text-red-500 opacity-0 transition-opacity hover:text-red-700 group-hover:opacity-100",
                children: "Remove"
              }
            )
          ] }, job.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border bg-white p-4 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-xl font-semibold", children: "Add Job" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-gray-600", children: "Job Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  className: "w-full rounded border p-1",
                  value: jobType,
                  onChange: (e) => setJobType(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-gray-600", children: "Schedule Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "radio",
                      checked: scheduleType === "once",
                      onChange: () => setScheduleType("once"),
                      className: "mr-1"
                    }
                  ),
                  "Once"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "radio",
                      checked: scheduleType === "cron",
                      onChange: () => setScheduleType("cron"),
                      className: "mr-1"
                    }
                  ),
                  "Cron"
                ] })
              ] })
            ] }),
            scheduleType === "once" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-gray-600", children: "Time (Seconds from now)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  className: "w-full rounded border p-1",
                  placeholder: "e.g. 5",
                  value: dateStr,
                  onChange: (e) => setDateStr(e.target.value)
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-gray-600", children: "Cron Expression" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  className: "w-full rounded border p-1",
                  value: cronExpression,
                  onChange: (e) => setCronExpression(e.target.value)
                }
              )
            ] }),
            scheduleType === "cron" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 rounded bg-gray-50 p-2 text-xs text-gray-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 font-bold", children: "Cron Syntax (Second-level precision):" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "overflow-x-auto whitespace-pre-wrap", children: `* * * * * *
| | | | | |
| | | | | day of week (0-7, 0/7 is Sun)
| | | | month (1-12)
| | | day of month (1-31)
| | hour (0-23)
| minute (0-59)
second (0-59)` }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1", children: [
                "Examples: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "bg-gray-200 px-1", children: "*/5 * * * * *" }),
                " (Every 5s),",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "bg-gray-200 px-1", children: "0 * * * * *" }),
                " (Every minute)"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-gray-600", children: "Payload (JSON)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  className: "h-16 w-full rounded border p-1 font-mono",
                  value: payloadStr,
                  onChange: (e) => setPayloadStr(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: handleAdd,
                className: "w-full rounded bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700",
                children: "Schedule Job"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-64 overflow-auto rounded border bg-gray-900 p-4 font-mono text-xs text-green-400 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "sticky top-0 mb-2 bg-gray-900 text-gray-500", children: "Execution Logs" }),
          logs.map((log, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 border-b border-gray-800 pb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-500", children: [
              "[",
              (/* @__PURE__ */ new Date()).toLocaleTimeString(),
              "]"
            ] }),
            " ",
            log
          ] }, i))
        ] })
      ] })
    ] })
  ] });
}
ReactDOM.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
