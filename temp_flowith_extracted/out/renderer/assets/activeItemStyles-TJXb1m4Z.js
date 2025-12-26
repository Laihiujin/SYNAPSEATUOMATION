const ACTIVE_ITEM_STYLES = {
  // Background gradient
  background: "bg-gradient-to-r from-[#5837FB]/8 to-transparent dark:from-[#AB9BFD]/8",
  // Left accent border
  border: "before:absolute before:-left-[4px] before:top-0 before:bottom-0 before:w-[2px] before:bg-[#5837FB] dark:before:bg-[#AB9BFD] before:rounded-r-full",
  // Text styling
  textActive: "text-black dark:text-white font-medium",
  textInactive: "text-black-primary dark:text-black-caption",
  // Input focus border
  inputFocusBorder: "focus:border-[#5837FB] dark:focus:border-[#AB9BFD]"
};
function getActiveItemClasses(isActive) {
  return isActive ? [ACTIVE_ITEM_STYLES.background, ACTIVE_ITEM_STYLES.border] : [];
}
function getActiveTextClasses(isActive) {
  return isActive ? ACTIVE_ITEM_STYLES.textActive : ACTIVE_ITEM_STYLES.textInactive;
}
function getActiveFontWeight(isActive) {
  return isActive ? 500 : 350;
}
export {
  ACTIVE_ITEM_STYLES as A,
  getActiveTextClasses as a,
  getActiveItemClasses as b,
  getActiveFontWeight as g
};
