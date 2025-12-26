"use strict";
const PASS_GOOGLE_OAUTH_FAKE_UA_TOKEN = "old-airport-include/1.0.0";
const isWebContentsView = (target) => {
  return typeof target.webContents !== "undefined";
};
const resolveWebContents = (target) => {
  return isWebContentsView(target) ? target.webContents : target;
};
const GOOGLE_LOGIN_HOSTS = [
  "accounts.google.com",
  "myaccount.google.com",
  "clients6.google.com",
  "ogs.google.com",
  "people.googleapis.com",
  "oauth2.googleapis.com",
  "www.googleapis.com"
];
const GOOGLE_LOGIN_PATH_PATTERNS = [
  /\/signin/i,
  /\/logout/i,
  /\/accounts/i,
  /\/ServiceLogin/i,
  /\/AccountChooser/i,
  /\/oauth2/i,
  /\/o\/oauth2/i,
  /\/token/i,
  /\/userinfo/i,
  /\/v1\/people/i
];
function isGoogleLoginUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (GOOGLE_LOGIN_HOSTS.some((pattern) => host === pattern)) {
      return true;
    }
    if (host.endsWith(".google.com")) {
      const pathname = parsed.pathname;
      return GOOGLE_LOGIN_PATH_PATTERNS.some((regex) => regex.test(pathname));
    }
    if (host.endsWith(".googleapis.com") || host.endsWith(".googleusercontent.com")) {
      const pathname = parsed.pathname;
      return GOOGLE_LOGIN_PATH_PATTERNS.some((regex) => regex.test(pathname));
    }
    return false;
  } catch {
    return url.includes("accounts.google.com") || url.includes("google.com/accounts");
  }
}
function ensurePassGoogleOAuthTokenInUserAgent(userAgent) {
  if (userAgent.includes(PASS_GOOGLE_OAUTH_FAKE_UA_TOKEN)) {
    return userAgent;
  }
  const transformers = [
    (s) => s.replace(/like Gecko\)/, `$& ${PASS_GOOGLE_OAUTH_FAKE_UA_TOKEN}`),
    (s) => s.replace(/\s+Chrome\//, ` ${PASS_GOOGLE_OAUTH_FAKE_UA_TOKEN} Chrome/`),
    (s) => `${s} ${PASS_GOOGLE_OAUTH_FAKE_UA_TOKEN}`
  ];
  for (const transform of transformers) {
    const next = transform(userAgent);
    if (next !== userAgent) {
      return next;
    }
  }
  return userAgent;
}
function removePassGoogleOAuthTokenFromUserAgent(userAgent) {
  if (!userAgent.includes(PASS_GOOGLE_OAUTH_FAKE_UA_TOKEN)) {
    return userAgent;
  }
  return userAgent.replace(new RegExp(`\\s*${PASS_GOOGLE_OAUTH_FAKE_UA_TOKEN}\\s*`), " ").replace(/\s{2,}/g, " ").trim();
}
function injectPassGoogleOAuthTokenIntoUA(target) {
  const contents = resolveWebContents(target);
  const ua = contents.getUserAgent();
  const next = ensurePassGoogleOAuthTokenInUserAgent(ua);
  if (next !== ua) {
    contents.setUserAgent(next);
  }
}
function removePassGoogleOAuthTokenFromUA(target) {
  const contents = resolveWebContents(target);
  const ua = contents.getUserAgent();
  const next = removePassGoogleOAuthTokenFromUserAgent(ua);
  if (next !== ua) {
    contents.setUserAgent(next);
  }
}
exports.a = injectPassGoogleOAuthTokenIntoUA;
exports.b = removePassGoogleOAuthTokenFromUA;
exports.e = ensurePassGoogleOAuthTokenInUserAgent;
exports.i = isGoogleLoginUrl;
exports.r = removePassGoogleOAuthTokenFromUserAgent;
