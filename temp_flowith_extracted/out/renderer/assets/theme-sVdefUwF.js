function resolveSystemTheme() {
  const hour = (/* @__PURE__ */ new Date()).getHours();
  return hour >= 6 && hour < 18 ? "light" : "dark";
}
export {
  resolveSystemTheme as r
};
