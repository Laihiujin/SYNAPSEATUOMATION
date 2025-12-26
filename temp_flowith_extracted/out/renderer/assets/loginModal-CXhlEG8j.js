import { r as reactExports, j as jsxRuntimeExports, c as clientExports, R as React } from "./client-DljuHW-m.js";
/* empty css              */
import { p } from "./IconBase.es-_t4ebd3Z.js";
import { s, a as s$1, n as n$1 } from "./XLogo.es-3i5ZYoPD.js";
import { B as BaseDialog } from "./BaseDialog-DZnFUs_f.js";
import { D as DialogHeader, a as DialogTitle, b as DialogDescription, c as DialogContent, d as DialogButton, e as DialogDivider } from "./DialogComponents-CXVCvPqf.js";
import { u as useTranslation } from "./useTranslation-BBDPFRa4.js";
import { m as motion } from "./proxy-BWWQsHt4.js";
import { s as setupRendererThemeBridge, u as useThemeStore } from "./themeBridge-XpPGWB57.js";
import { I as I18nextProvider, i as instance, u as useLocaleStore } from "./i18n-BoThyQPF.js";
import "./index-viF2D8av.js";
import "./context-CbCu0iMB.js";
import "./theme-sVdefUwF.js";
const a = /* @__PURE__ */ new Map([
  [
    "bold",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M224,44H32A12,12,0,0,0,20,56V192a20,20,0,0,0,20,20H216a20,20,0,0,0,20-20V56A12,12,0,0,0,224,44ZM193.15,68,128,127.72,62.85,68ZM44,188V83.28l75.89,69.57a12,12,0,0,0,16.22,0L212,83.28V188Z" }))
  ],
  [
    "duotone",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M224,56l-96,88L32,56Z", opacity: "0.2" }), /* @__PURE__ */ reactExports.createElement("path", { d: "M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z" }))
  ],
  [
    "fill",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-8,144H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z" }))
  ],
  [
    "light",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M224,50H32a6,6,0,0,0-6,6V192a14,14,0,0,0,14,14H216a14,14,0,0,0,14-14V56A6,6,0,0,0,224,50ZM208.58,62,128,135.86,47.42,62ZM216,194H40a2,2,0,0,1-2-2V69.64l86,78.78a6,6,0,0,0,8.1,0L218,69.64V192A2,2,0,0,1,216,194Z" }))
  ],
  [
    "regular",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z" }))
  ],
  [
    "thin",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M224,52H32a4,4,0,0,0-4,4V192a12,12,0,0,0,12,12H216a12,12,0,0,0,12-12V56A4,4,0,0,0,224,52Zm-10.28,8L128,138.57,42.28,60ZM216,196H40a4,4,0,0,1-4-4V65.09L125.3,147a4,4,0,0,0,5.4,0L220,65.09V192A4,4,0,0,1,216,196Z" }))
  ]
]);
const e = /* @__PURE__ */ new Map([
  [
    "bold",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M208,76H180V56A52,52,0,0,0,76,56V76H48A20,20,0,0,0,28,96V208a20,20,0,0,0,20,20H208a20,20,0,0,0,20-20V96A20,20,0,0,0,208,76ZM100,56a28,28,0,0,1,56,0V76H100ZM204,204H52V100H204Zm-60-52a16,16,0,1,1-16-16A16,16,0,0,1,144,152Z" }))
  ],
  [
    "duotone",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement(
      "path",
      {
        d: "M216,96V208a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H208A8,8,0,0,1,216,96Z",
        opacity: "0.2"
      }
    ), /* @__PURE__ */ reactExports.createElement("path", { d: "M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z" }))
  ],
  [
    "fill",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm-80,84a12,12,0,1,1,12-12A12,12,0,0,1,128,164Zm32-84H96V56a32,32,0,0,1,64,0Z" }))
  ],
  [
    "light",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M208,82H174V56a46,46,0,0,0-92,0V82H48A14,14,0,0,0,34,96V208a14,14,0,0,0,14,14H208a14,14,0,0,0,14-14V96A14,14,0,0,0,208,82ZM94,56a34,34,0,0,1,68,0V82H94ZM210,208a2,2,0,0,1-2,2H48a2,2,0,0,1-2-2V96a2,2,0,0,1,2-2H208a2,2,0,0,1,2,2Zm-72-56a10,10,0,1,1-10-10A10,10,0,0,1,138,152Z" }))
  ],
  [
    "regular",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z" }))
  ],
  [
    "thin",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M208,84H172V56a44,44,0,0,0-88,0V84H48A12,12,0,0,0,36,96V208a12,12,0,0,0,12,12H208a12,12,0,0,0,12-12V96A12,12,0,0,0,208,84ZM92,56a36,36,0,0,1,72,0V84H92ZM212,208a4,4,0,0,1-4,4H48a4,4,0,0,1-4-4V96a4,4,0,0,1,4-4H208a4,4,0,0,1,4,4Zm-76-56a8,8,0,1,1-8-8A8,8,0,0,1,136,152Z" }))
  ]
]);
const o = reactExports.forwardRef((m, p$1) => /* @__PURE__ */ reactExports.createElement(p, { ref: p$1, ...m, weights: a }));
o.displayName = "EnvelopeSimpleIcon";
const i = o;
const c = reactExports.forwardRef((e$1, r) => /* @__PURE__ */ reactExports.createElement(p, { ref: r, ...e$1, weights: e }));
c.displayName = "LockIcon";
const n = c;
const LoadingSpinner = ({
  size = 16,
  className = ""
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      className: `animate-spin ${className}`,
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "circle",
          {
            className: "opacity-25",
            cx: "12",
            cy: "12",
            r: "10",
            stroke: "currentColor",
            strokeWidth: "4"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            className: "opacity-75",
            fill: "currentColor",
            d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          }
        )
      ]
    }
  );
};
const OAuthButton = ({
  provider,
  icon,
  onClick,
  disabled = false,
  loading = false,
  compact = false
}) => {
  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      onClick,
      disabled,
      title: compact ? `Continue with ${providerName}` : void 0,
      className: `
        ${compact ? "flex-1 h-11" : "w-full h-9"}
        px-4 rounded-[8px] text-[13px] font-medium
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2
        bg-[#F5F6F7] dark:bg-[#2A2D30]
        text-[#0F1419] dark:text-[#FFFFFF]
        hover:bg-[#EAECEE] dark:hover:bg-[#34383C]
        focus:ring-[#D1D5DB] dark:focus:ring-[#3E4348]
        focus:ring-offset-white dark:focus:ring-offset-[#1C1E20]
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
      `,
      children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { size: compact ? 18 : 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: compact ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[18px]", children: icon }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        icon,
        `Continue with ${providerName}`
      ] }) })
    }
  );
};
const InputField = ({
  type,
  placeholder,
  value,
  onChange,
  icon,
  disabled = false,
  autoComplete
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-3 top-[11px] w-4 h-4 text-[#8B8F95]", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        placeholder,
        value,
        onChange: (e2) => onChange(e2.target.value),
        disabled,
        autoComplete,
        className: "w-full h-9 pl-9 pr-3 rounded-[8px] text-[13px] bg-[#F5F6F7] dark:bg-[#2A2D30] border border-transparent text-[#0F1419] dark:text-[#FFFFFF] placeholder-[#8B8F95] focus:outline-none focus:ring-2 focus:ring-[#D1D5DB] dark:focus:ring-[#3E4348] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      }
    )
  ] });
};
const Overlay = () => {
  const { t } = useTranslation();
  const [visible] = reactExports.useState(true);
  const [isLogin, setIsLogin] = reactExports.useState(true);
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [loadingProvider, setLoadingProvider] = reactExports.useState(null);
  const [showVerificationInput, setShowVerificationInput] = reactExports.useState(false);
  const [verificationCode, setVerificationCode] = reactExports.useState("");
  const [showInvitationCodeInput, setShowInvitationCodeInput] = reactExports.useState(false);
  const [invitationCode, setInvitationCode] = reactExports.useState("");
  const [isInvitationSuccess, setIsInvitationSuccess] = reactExports.useState(false);
  const [showPasswordReset, setShowPasswordReset] = reactExports.useState(false);
  const [resetEmail, setResetEmail] = reactExports.useState("");
  const [resetOtpCode, setResetOtpCode] = reactExports.useState("");
  const [newPassword, setNewPassword] = reactExports.useState("");
  const [confirmPassword, setConfirmPassword] = reactExports.useState("");
  const [resetStep, setResetStep] = reactExports.useState("email");
  const isEmailLoading = reactExports.useMemo(
    () => loading && loadingProvider === "email",
    [loading, loadingProvider]
  );
  reactExports.useEffect(() => {
    if (typeof window.lifecycleAPI?.sendReady === "function") {
      window.lifecycleAPI.sendReady();
      console.log("[LoginModal] ✅ React 组件已挂载，通知主进程");
    }
  }, []);
  const resetState = () => {
    setLoading(false);
    setLoadingProvider(null);
    setError("");
    setEmail("");
    setPassword("");
    setShowVerificationInput(false);
    setVerificationCode("");
    setShowInvitationCodeInput(false);
    setInvitationCode("");
    setIsInvitationSuccess(false);
    setShowPasswordReset(false);
    setResetEmail("");
    setResetOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    setResetStep("email");
  };
  reactExports.useEffect(() => {
    const cleanup = window.loginModalAPI.onReset(() => {
      resetState();
    });
    return cleanup;
  }, []);
  reactExports.useEffect(() => {
    const cleanup = window.loginModalAPI.onShowInvitationCode(() => {
      setLoading(false);
      setLoadingProvider(null);
      setShowInvitationCodeInput(true);
      setError("");
    });
    return cleanup;
  }, []);
  const handleClose = () => {
    if (loading) return;
    resetState();
    window.loginModalAPI.close();
  };
  const checkAccessAndHandleInvitationCode = async () => {
    try {
      const accessResult = await window.loginModalAPI.checkAccess();
      if (accessResult.verified) {
        setLoading(false);
        setLoadingProvider(null);
        resetState();
      } else {
        setLoading(false);
        setLoadingProvider(null);
        setShowInvitationCodeInput(true);
        setError("");
      }
    } catch (err) {
      console.error("Failed to check access:", err);
      setLoading(false);
      setLoadingProvider(null);
      setShowInvitationCodeInput(true);
      setError("");
    }
  };
  const handleInvitationCodeSubmit = async (e2) => {
    e2.preventDefault();
    setError("");
    if (!invitationCode.trim()) {
      setError(t("gate.invitation.invalidCode"));
      return;
    }
    setLoading(true);
    setLoadingProvider("invitation");
    try {
      const result = await window.loginModalAPI.verifyCode(invitationCode);
      if (result.verified) {
        setIsInvitationSuccess(true);
        setError("");
        setTimeout(() => {
          window.loginModalAPI.close();
        }, 1500);
      } else {
        setLoading(false);
        setLoadingProvider(null);
        setError(result.error || t("gate.invitation.invalidCode"));
      }
    } catch (err) {
      setLoading(false);
      setLoadingProvider(null);
      setError(t("gate.invitation.verificationFailed"));
      console.error("Invitation code verification error:", err);
    }
  };
  const handleEmailAuth = async (e2) => {
    e2.preventDefault();
    setError("");
    if (!email || !password) {
      setError(t("gate.auth.errors.enterEmail"));
      return;
    }
    setLoading(true);
    setLoadingProvider("email");
    try {
      const result = await window.loginModalAPI.login({
        email,
        password,
        type: isLogin ? "login" : "register"
      });
      if (!result.success) {
        setLoading(false);
        setLoadingProvider(null);
        if (result.userAlreadyExists || result.error?.includes("已注册")) {
          setError(t("gate.auth.errors.userAlreadyExists"));
          setIsLogin(true);
        } else {
          setError(result.error || t("gate.auth.errors.authFailed"));
        }
      } else if (result.needsVerification) {
        setLoading(false);
        setLoadingProvider(null);
        setShowVerificationInput(true);
        setError("");
      } else {
        await checkAccessAndHandleInvitationCode();
      }
    } catch (err) {
      setLoading(false);
      setLoadingProvider(null);
      setError(t("gate.auth.errors.authFailed"));
    }
  };
  const handleVerifyCode = async (e2) => {
    e2.preventDefault();
    setError("");
    if (!verificationCode || verificationCode.length !== 6) {
      setError(t("gate.auth.errors.invalidVerificationCode"));
      return;
    }
    setLoading(true);
    setLoadingProvider("email");
    try {
      const result = await window.loginModalAPI.login({
        email,
        password,
        token: verificationCode,
        type: "verify-otp"
      });
      if (!result.success) {
        setLoading(false);
        setLoadingProvider(null);
        setError(result.error || t("gate.auth.errors.verificationFailed"));
      } else {
        await checkAccessAndHandleInvitationCode();
      }
    } catch (err) {
      setLoading(false);
      setLoadingProvider(null);
      setError(t("gate.auth.errors.verificationFailed"));
    }
  };
  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    setLoadingProvider(provider);
    setError("");
    try {
      const result = await window.loginModalAPI.login({ provider });
      if (!result.success) {
        setLoading(false);
        setLoadingProvider(null);
        setError(result.error || t("gate.auth.errors.oauthFailed"));
      }
      if (result.success) {
        resetState();
      }
    } catch (err) {
      setLoading(false);
      setLoadingProvider(null);
      setError(t("gate.auth.errors.oauthFailed"));
    }
  };
  const handleToggleMode = () => {
    if (loading) return;
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setError("");
    setShowVerificationInput(false);
    setVerificationCode("");
  };
  const handleSendResetCode = async (e2) => {
    e2.preventDefault();
    setError("");
    if (!resetEmail) {
      setError("Please enter your email address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setLoadingProvider("email");
    try {
      console.log("[Overlay] 发送密码重置验证码到:", resetEmail);
      const result = await window.loginModalAPI.login({
        type: "request-reset",
        email: resetEmail,
        source: "modal"
      });
      console.log("[Overlay] 发送结果:", result);
      if (!result.success) {
        setError(result.error || "Failed to send verification code");
      } else {
        console.log("[Overlay] 验证码已发送，切换到验证步骤");
        setResetStep("verify");
        setError("");
      }
    } catch (err) {
      console.error("[Overlay] 发送验证码异常:", err);
      setError("Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  };
  const handleResetPassword = async (e2) => {
    e2.preventDefault();
    setError("");
    if (!resetOtpCode || resetOtpCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }
    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setLoadingProvider("email");
    try {
      const result = await window.loginModalAPI.login({
        type: "reset-password",
        email: resetEmail,
        token: resetOtpCode,
        newPassword
      });
      if (!result.success) {
        const errorMessage = result.error?.toLowerCase() || "";
        if (errorMessage.includes("invalid")) {
          setError("Invalid verification code. Please check and try again.");
        } else if (errorMessage.includes("expired")) {
          setError("Verification code has expired. Please request a new one.");
        } else {
          setError(result.error || "Failed to reset password");
        }
      } else {
        setLoading(false);
        setLoadingProvider(null);
        setShowPasswordReset(false);
        setResetStep("email");
        setResetEmail("");
        setResetOtpCode("");
        setNewPassword("");
        setConfirmPassword("");
        setIsLogin(true);
        setEmail(resetEmail);
        setPassword("");
        setError("");
        return;
      }
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(BaseDialog, { visible, onClose: handleClose, width: 420, closeOnClickOutside: !loading, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: showPasswordReset ? resetStep === "email" ? "Reset Password" : "Reset Password" : showInvitationCodeInput ? isInvitationSuccess ? "Access Granted" : "Invitation Code Required" : showVerificationInput ? "Verify Your Email" : isLogin ? "Welcome to the future" : "Create Account" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: showPasswordReset ? resetStep === "email" ? "Enter your email address and we'll send you a verification code" : `Enter the 6-digit code sent to ${resetEmail}` : showInvitationCodeInput ? isInvitationSuccess ? "Welcome to FlowithOS" : "Please enter your invitation code to access FlowithOS" : showVerificationInput ? `We've sent a 6-digit verification code to ${email}` : isLogin ? "Sign in to your flowith account to continue" : "Create a new flowith account to get started" }),
    showPasswordReset ? (
      // 密码重置表单
      resetStep === "email" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSendResetCode, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "space-y-2 pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          InputField,
          {
            type: "email",
            placeholder: "Email address",
            value: resetEmail,
            onChange: setResetEmail,
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(i, { weight: "regular" }),
            disabled: loading,
            autoComplete: "email"
          }
        ) }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, height: 0 },
            animate: { opacity: 1, height: "auto" },
            exit: { opacity: 0, height: 0 },
            transition: { duration: 0.2, ease: "easeOut" },
            className: "text-center",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] font-normal text-red-500 dark:text-red-400", children: error })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "pb-4 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogButton,
          {
            type: "submit",
            variant: "primary",
            disabled: loading,
            className: "flex items-center justify-center gap-2 px-8 w-full",
            children: [
              isEmailLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { size: 14 }),
              isEmailLoading ? "Sending..." : "Send Verification Code"
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "pb-5 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setShowPasswordReset(false);
              setResetStep("email");
              setResetEmail("");
              setError("");
            },
            disabled: loading,
            className: "text-[13px] font-medium text-[#5B6570] transition-colors hover:text-[#0F1419] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#8B8F95] dark:hover:text-[#FFFFFF]",
            children: "← Back to login"
          }
        ) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleResetPassword, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "space-y-2 pb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            InputField,
            {
              type: "text",
              placeholder: "Enter 6-digit code",
              value: resetOtpCode,
              onChange: (value) => setResetOtpCode(value.replace(/\D/g, "").slice(0, 6)),
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(n, { weight: "regular" }),
              disabled: loading,
              autoComplete: "off"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            InputField,
            {
              type: "password",
              placeholder: "New Password (min 8 characters)",
              value: newPassword,
              onChange: setNewPassword,
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(n, { weight: "regular" }),
              disabled: loading,
              autoComplete: "new-password"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            InputField,
            {
              type: "password",
              placeholder: "Confirm New Password",
              value: confirmPassword,
              onChange: setConfirmPassword,
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(n, { weight: "regular" }),
              disabled: loading,
              autoComplete: "new-password"
            }
          )
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, height: 0 },
            animate: { opacity: 1, height: "auto" },
            exit: { opacity: 0, height: 0 },
            transition: { duration: 0.2, ease: "easeOut" },
            className: "text-center",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] font-normal text-red-500 dark:text-red-400", children: error })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "pb-4 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogButton,
          {
            type: "submit",
            variant: "primary",
            disabled: loading,
            className: "flex items-center justify-center gap-2 px-8 w-full",
            children: [
              isEmailLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { size: 14 }),
              isEmailLoading ? "Resetting..." : "Reset Password"
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "pb-5 text-center flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setResetStep("email");
                setResetOtpCode("");
                setNewPassword("");
                setConfirmPassword("");
                setError("");
              },
              disabled: loading,
              className: "text-[13px] font-medium text-[#5B6570] transition-colors hover:text-[#0F1419] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#8B8F95] dark:hover:text-[#FFFFFF]",
              children: "← Back"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: handleSendResetCode,
              disabled: loading,
              className: "text-[13px] font-medium text-blue-600 transition-colors hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-200",
              children: "Resend Code"
            }
          )
        ] })
      ] })
    ) : showInvitationCodeInput ? (
      // 邀请码输入表单
      /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleInvitationCodeSubmit, children: !isInvitationSuccess ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "space-y-2 pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          InputField,
          {
            type: "text",
            placeholder: t("gate.invitation.placeholder"),
            value: invitationCode,
            onChange: setInvitationCode,
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(n, { weight: "regular" }),
            disabled: loading,
            autoComplete: "off"
          }
        ) }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, height: 0 },
            animate: { opacity: 1, height: "auto" },
            exit: { opacity: 0, height: 0 },
            transition: { duration: 0.2, ease: "easeOut" },
            className: "text-center",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] font-normal text-red-500 dark:text-red-400 whitespace-pre-line", children: error })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "pb-5 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogButton,
          {
            type: "submit",
            variant: "primary",
            disabled: loading,
            className: "flex items-center justify-center gap-2 px-8 w-full",
            children: [
              loading && loadingProvider === "invitation" && /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { size: 14 }),
              loading && loadingProvider === "invitation" ? t("gate.auth.verifying") : t("gate.auth.verifyCode")
            ]
          }
        ) })
      ] }) : (
        // 成功状态
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "pb-5 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { scale: 0.8, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            className: "text-center py-4",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-8 h-8 text-green-600 dark:text-green-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[14px] font-medium text-[#0F1419] dark:text-white", children: t("gate.invitation.initializing") })
            ]
          }
        ) })
      ) })
    ) : showVerificationInput ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleVerifyCode, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "space-y-2 pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        InputField,
        {
          type: "text",
          placeholder: t("gate.auth.enterSixDigitCode"),
          value: verificationCode,
          onChange: setVerificationCode,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(n, { weight: "regular" }),
          disabled: loading,
          autoComplete: "off"
        }
      ) }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, height: 0 },
          animate: { opacity: 1, height: "auto" },
          exit: { opacity: 0, height: 0 },
          transition: { duration: 0.2, ease: "easeOut" },
          className: "text-center",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] font-normal text-red-500 dark:text-red-400", children: error })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "pb-4 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DialogButton,
        {
          type: "submit",
          variant: "primary",
          disabled: loading,
          className: "flex items-center justify-center gap-2 px-8 w-full",
          children: [
            isEmailLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { size: 14 }),
            isEmailLoading ? t("gate.auth.verifying") : t("gate.auth.verifyCode")
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "pb-5 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setShowVerificationInput(false);
            setVerificationCode("");
            setError("");
          },
          disabled: loading,
          className: "text-[13px] font-medium text-[#5B6570] transition-colors hover:text-[#0F1419] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#8B8F95] dark:hover:text-[#FFFFFF]",
          children: t("gate.auth.backToSignUp")
        }
      ) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleEmailAuth, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "space-y-2 pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          InputField,
          {
            type: "email",
            placeholder: t("gate.auth.email"),
            value: email,
            onChange: setEmail,
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(i, { weight: "regular" }),
            disabled: loading,
            autoComplete: "email"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          InputField,
          {
            type: "password",
            placeholder: t("gate.auth.password"),
            value: password,
            onChange: setPassword,
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(n, { weight: "regular" }),
            disabled: loading,
            autoComplete: isLogin ? "current-password" : "new-password"
          }
        )
      ] }),
      isLogin && /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "pb-1 text-right -mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setShowPasswordReset(true);
            setResetStep("email");
            setError("");
          },
          disabled: loading,
          className: "text-[11px] font-normal text-[#5B6570] transition-colors hover:text-[#0F1419] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#8B8F95] dark:hover:text-[#FFFFFF]",
          children: "Forgot Password?"
        }
      ) }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, height: 0 },
          animate: { opacity: 1, height: "auto" },
          exit: { opacity: 0, height: 0 },
          transition: { duration: 0.2, ease: "easeOut" },
          className: "text-center",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] font-normal text-red-500 dark:text-red-400", children: error === t("gate.auth.errors.userAlreadyExists") ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            t("gate.auth.errors.userAlreadyExists"),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setIsLogin(true);
                  setError("");
                },
                className: "text-blue-500 hover:underline dark:text-blue-400",
                children: t("gate.auth.goToLogin")
              }
            )
          ] }) : error })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "pb-4 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DialogButton,
        {
          type: "submit",
          variant: "primary",
          disabled: loading,
          className: "flex items-center justify-center gap-2 px-8 w-full",
          children: [
            isEmailLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { size: 14 }),
            isEmailLoading ? t("gate.auth.processing") : isLogin ? t("gate.auth.signIn") : t("gate.auth.signUp")
          ]
        }
      ) })
    ] }),
    !showVerificationInput && !showPasswordReset && !showInvitationCodeInput && /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDivider, {}),
    !showVerificationInput && !showPasswordReset && !showInvitationCodeInput && /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        OAuthButton,
        {
          provider: "google",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(s, { className: "h-4 w-4", weight: "regular" }),
          onClick: () => handleOAuthLogin("google"),
          disabled: loading,
          loading: loading && loadingProvider === "google",
          compact: true
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        OAuthButton,
        {
          provider: "github",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(s$1, { className: "h-4 w-4", weight: "regular" }),
          onClick: () => handleOAuthLogin("github"),
          disabled: loading,
          loading: loading && loadingProvider === "github",
          compact: true
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        OAuthButton,
        {
          provider: "twitter",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(n$1, { className: "h-4 w-4", weight: "regular" }),
          onClick: () => handleOAuthLogin("twitter"),
          disabled: loading,
          loading: loading && loadingProvider === "twitter",
          compact: true
        }
      )
    ] }) }),
    !showVerificationInput && !showPasswordReset && !showInvitationCodeInput && /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "pb-5 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: handleToggleMode,
        disabled: loading,
        className: "text-[13px] font-medium text-[#5B6570] transition-colors hover:text-[#0F1419] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#8B8F95] dark:hover:text-[#FFFFFF]",
        children: isLogin ? t("gate.auth.createNewAccount") : t("gate.auth.alreadyHaveAccount")
      }
    ) })
  ] });
};
function App() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Overlay, {});
}
function ThemeSync() {
  const resolvedMode = useThemeStore((s2) => s2.resolvedMode);
  reactExports.useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedMode === "dark");
  }, [resolvedMode]);
  return null;
}
function LocaleSync() {
  const locale = useLocaleStore((s2) => s2.locale);
  reactExports.useEffect(() => {
    instance.changeLanguage(locale).catch(() => {
    });
  }, [locale]);
  reactExports.useEffect(() => {
    if (!window.localeAPI) return;
    const unsubscribe = window.localeAPI.onLocaleChange((state) => {
      useLocaleStore.setState({ locale: state.locale });
    });
    window.localeAPI.requestSync?.();
    return unsubscribe;
  }, []);
  return null;
}
async function bootstrap() {
  let unsubscribe;
  try {
    unsubscribe = await setupRendererThemeBridge();
  } catch (error) {
    console.warn("[LoginModal] Failed to synchronize theme before render:", error);
    const fallbackMode = useThemeStore.getState().resolvedMode;
    document.documentElement.classList.toggle("dark", fallbackMode === "dark");
  }
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Login modal root container not found");
  }
  const root = clientExports.createRoot(container);
  root.render(
    /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(I18nextProvider, { i18n: instance, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeSync, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LocaleSync, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(App, {})
    ] }) })
  );
  if (typeof window !== "undefined" && typeof unsubscribe === "function") {
    window.addEventListener("beforeunload", () => {
      try {
        unsubscribe?.();
      } catch {
      }
    });
  }
}
void bootstrap();
