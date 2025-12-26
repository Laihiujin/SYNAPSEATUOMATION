import { r as reactExports } from "./client-DljuHW-m.js";
import { s as setDefaults, a as setI18n, I as I18nContext } from "./context-CbCu0iMB.js";
import { c as create } from "./themeBridge-XpPGWB57.js";
const isString = (obj) => typeof obj === "string";
const defer = () => {
  let res;
  let rej;
  const promise = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  promise.resolve = res;
  promise.reject = rej;
  return promise;
};
const makeString = (object) => {
  if (object == null) return "";
  return "" + object;
};
const copy = (a, s, t) => {
  a.forEach((m) => {
    if (s[m]) t[m] = s[m];
  });
};
const lastOfPathSeparatorRegExp = /###/g;
const cleanKey = (key) => key && key.indexOf("###") > -1 ? key.replace(lastOfPathSeparatorRegExp, ".") : key;
const canNotTraverseDeeper = (object) => !object || isString(object);
const getLastOfPath = (object, path, Empty) => {
  const stack = !isString(path) ? path : path.split(".");
  let stackIndex = 0;
  while (stackIndex < stack.length - 1) {
    if (canNotTraverseDeeper(object)) return {};
    const key = cleanKey(stack[stackIndex]);
    if (!object[key] && Empty) object[key] = new Empty();
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      object = object[key];
    } else {
      object = {};
    }
    ++stackIndex;
  }
  if (canNotTraverseDeeper(object)) return {};
  return {
    obj: object,
    k: cleanKey(stack[stackIndex])
  };
};
const setPath = (object, path, newValue) => {
  const {
    obj,
    k
  } = getLastOfPath(object, path, Object);
  if (obj !== void 0 || path.length === 1) {
    obj[k] = newValue;
    return;
  }
  let e = path[path.length - 1];
  let p = path.slice(0, path.length - 1);
  let last = getLastOfPath(object, p, Object);
  while (last.obj === void 0 && p.length) {
    e = `${p[p.length - 1]}.${e}`;
    p = p.slice(0, p.length - 1);
    last = getLastOfPath(object, p, Object);
    if (last?.obj && typeof last.obj[`${last.k}.${e}`] !== "undefined") {
      last.obj = void 0;
    }
  }
  last.obj[`${last.k}.${e}`] = newValue;
};
const pushPath = (object, path, newValue, concat) => {
  const {
    obj,
    k
  } = getLastOfPath(object, path, Object);
  obj[k] = obj[k] || [];
  obj[k].push(newValue);
};
const getPath = (object, path) => {
  const {
    obj,
    k
  } = getLastOfPath(object, path);
  if (!obj) return void 0;
  if (!Object.prototype.hasOwnProperty.call(obj, k)) return void 0;
  return obj[k];
};
const getPathWithDefaults = (data, defaultData, key) => {
  const value = getPath(data, key);
  if (value !== void 0) {
    return value;
  }
  return getPath(defaultData, key);
};
const deepExtend = (target, source, overwrite) => {
  for (const prop in source) {
    if (prop !== "__proto__" && prop !== "constructor") {
      if (prop in target) {
        if (isString(target[prop]) || target[prop] instanceof String || isString(source[prop]) || source[prop] instanceof String) {
          if (overwrite) target[prop] = source[prop];
        } else {
          deepExtend(target[prop], source[prop], overwrite);
        }
      } else {
        target[prop] = source[prop];
      }
    }
  }
  return target;
};
const regexEscape = (str) => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
var _entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;"
};
const escape = (data) => {
  if (isString(data)) {
    return data.replace(/[&<>"'\/]/g, (s) => _entityMap[s]);
  }
  return data;
};
class RegExpCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.regExpMap = /* @__PURE__ */ new Map();
    this.regExpQueue = [];
  }
  getRegExp(pattern) {
    const regExpFromCache = this.regExpMap.get(pattern);
    if (regExpFromCache !== void 0) {
      return regExpFromCache;
    }
    const regExpNew = new RegExp(pattern);
    if (this.regExpQueue.length === this.capacity) {
      this.regExpMap.delete(this.regExpQueue.shift());
    }
    this.regExpMap.set(pattern, regExpNew);
    this.regExpQueue.push(pattern);
    return regExpNew;
  }
}
const chars = [" ", ",", "?", "!", ";"];
const looksLikeObjectPathRegExpCache = new RegExpCache(20);
const looksLikeObjectPath = (key, nsSeparator, keySeparator) => {
  nsSeparator = nsSeparator || "";
  keySeparator = keySeparator || "";
  const possibleChars = chars.filter((c) => nsSeparator.indexOf(c) < 0 && keySeparator.indexOf(c) < 0);
  if (possibleChars.length === 0) return true;
  const r = looksLikeObjectPathRegExpCache.getRegExp(`(${possibleChars.map((c) => c === "?" ? "\\?" : c).join("|")})`);
  let matched = !r.test(key);
  if (!matched) {
    const ki = key.indexOf(keySeparator);
    if (ki > 0 && !r.test(key.substring(0, ki))) {
      matched = true;
    }
  }
  return matched;
};
const deepFind = (obj, path, keySeparator = ".") => {
  if (!obj) return void 0;
  if (obj[path]) {
    if (!Object.prototype.hasOwnProperty.call(obj, path)) return void 0;
    return obj[path];
  }
  const tokens = path.split(keySeparator);
  let current = obj;
  for (let i = 0; i < tokens.length; ) {
    if (!current || typeof current !== "object") {
      return void 0;
    }
    let next;
    let nextPath = "";
    for (let j = i; j < tokens.length; ++j) {
      if (j !== i) {
        nextPath += keySeparator;
      }
      nextPath += tokens[j];
      next = current[nextPath];
      if (next !== void 0) {
        if (["string", "number", "boolean"].indexOf(typeof next) > -1 && j < tokens.length - 1) {
          continue;
        }
        i += j - i + 1;
        break;
      }
    }
    current = next;
  }
  return current;
};
const getCleanedCode = (code) => code?.replace("_", "-");
const consoleLogger = {
  type: "logger",
  log(args) {
    this.output("log", args);
  },
  warn(args) {
    this.output("warn", args);
  },
  error(args) {
    this.output("error", args);
  },
  output(type, args) {
    console?.[type]?.apply?.(console, args);
  }
};
class Logger {
  constructor(concreteLogger, options = {}) {
    this.init(concreteLogger, options);
  }
  init(concreteLogger, options = {}) {
    this.prefix = options.prefix || "i18next:";
    this.logger = concreteLogger || consoleLogger;
    this.options = options;
    this.debug = options.debug;
  }
  log(...args) {
    return this.forward(args, "log", "", true);
  }
  warn(...args) {
    return this.forward(args, "warn", "", true);
  }
  error(...args) {
    return this.forward(args, "error", "");
  }
  deprecate(...args) {
    return this.forward(args, "warn", "WARNING DEPRECATED: ", true);
  }
  forward(args, lvl, prefix, debugOnly) {
    if (debugOnly && !this.debug) return null;
    if (isString(args[0])) args[0] = `${prefix}${this.prefix} ${args[0]}`;
    return this.logger[lvl](args);
  }
  create(moduleName) {
    return new Logger(this.logger, {
      ...{
        prefix: `${this.prefix}:${moduleName}:`
      },
      ...this.options
    });
  }
  clone(options) {
    options = options || this.options;
    options.prefix = options.prefix || this.prefix;
    return new Logger(this.logger, options);
  }
}
var baseLogger = new Logger();
class EventEmitter {
  constructor() {
    this.observers = {};
  }
  on(events, listener) {
    events.split(" ").forEach((event) => {
      if (!this.observers[event]) this.observers[event] = /* @__PURE__ */ new Map();
      const numListeners = this.observers[event].get(listener) || 0;
      this.observers[event].set(listener, numListeners + 1);
    });
    return this;
  }
  off(event, listener) {
    if (!this.observers[event]) return;
    if (!listener) {
      delete this.observers[event];
      return;
    }
    this.observers[event].delete(listener);
  }
  emit(event, ...args) {
    if (this.observers[event]) {
      const cloned = Array.from(this.observers[event].entries());
      cloned.forEach(([observer, numTimesAdded]) => {
        for (let i = 0; i < numTimesAdded; i++) {
          observer(...args);
        }
      });
    }
    if (this.observers["*"]) {
      const cloned = Array.from(this.observers["*"].entries());
      cloned.forEach(([observer, numTimesAdded]) => {
        for (let i = 0; i < numTimesAdded; i++) {
          observer.apply(observer, [event, ...args]);
        }
      });
    }
  }
}
class ResourceStore extends EventEmitter {
  constructor(data, options = {
    ns: ["translation"],
    defaultNS: "translation"
  }) {
    super();
    this.data = data || {};
    this.options = options;
    if (this.options.keySeparator === void 0) {
      this.options.keySeparator = ".";
    }
    if (this.options.ignoreJSONStructure === void 0) {
      this.options.ignoreJSONStructure = true;
    }
  }
  addNamespaces(ns) {
    if (this.options.ns.indexOf(ns) < 0) {
      this.options.ns.push(ns);
    }
  }
  removeNamespaces(ns) {
    const index = this.options.ns.indexOf(ns);
    if (index > -1) {
      this.options.ns.splice(index, 1);
    }
  }
  getResource(lng, ns, key, options = {}) {
    const keySeparator = options.keySeparator !== void 0 ? options.keySeparator : this.options.keySeparator;
    const ignoreJSONStructure = options.ignoreJSONStructure !== void 0 ? options.ignoreJSONStructure : this.options.ignoreJSONStructure;
    let path;
    if (lng.indexOf(".") > -1) {
      path = lng.split(".");
    } else {
      path = [lng, ns];
      if (key) {
        if (Array.isArray(key)) {
          path.push(...key);
        } else if (isString(key) && keySeparator) {
          path.push(...key.split(keySeparator));
        } else {
          path.push(key);
        }
      }
    }
    const result = getPath(this.data, path);
    if (!result && !ns && !key && lng.indexOf(".") > -1) {
      lng = path[0];
      ns = path[1];
      key = path.slice(2).join(".");
    }
    if (result || !ignoreJSONStructure || !isString(key)) return result;
    return deepFind(this.data?.[lng]?.[ns], key, keySeparator);
  }
  addResource(lng, ns, key, value, options = {
    silent: false
  }) {
    const keySeparator = options.keySeparator !== void 0 ? options.keySeparator : this.options.keySeparator;
    let path = [lng, ns];
    if (key) path = path.concat(keySeparator ? key.split(keySeparator) : key);
    if (lng.indexOf(".") > -1) {
      path = lng.split(".");
      value = ns;
      ns = path[1];
    }
    this.addNamespaces(ns);
    setPath(this.data, path, value);
    if (!options.silent) this.emit("added", lng, ns, key, value);
  }
  addResources(lng, ns, resources2, options = {
    silent: false
  }) {
    for (const m in resources2) {
      if (isString(resources2[m]) || Array.isArray(resources2[m])) this.addResource(lng, ns, m, resources2[m], {
        silent: true
      });
    }
    if (!options.silent) this.emit("added", lng, ns, resources2);
  }
  addResourceBundle(lng, ns, resources2, deep, overwrite, options = {
    silent: false,
    skipCopy: false
  }) {
    let path = [lng, ns];
    if (lng.indexOf(".") > -1) {
      path = lng.split(".");
      deep = resources2;
      resources2 = ns;
      ns = path[1];
    }
    this.addNamespaces(ns);
    let pack = getPath(this.data, path) || {};
    if (!options.skipCopy) resources2 = JSON.parse(JSON.stringify(resources2));
    if (deep) {
      deepExtend(pack, resources2, overwrite);
    } else {
      pack = {
        ...pack,
        ...resources2
      };
    }
    setPath(this.data, path, pack);
    if (!options.silent) this.emit("added", lng, ns, resources2);
  }
  removeResourceBundle(lng, ns) {
    if (this.hasResourceBundle(lng, ns)) {
      delete this.data[lng][ns];
    }
    this.removeNamespaces(ns);
    this.emit("removed", lng, ns);
  }
  hasResourceBundle(lng, ns) {
    return this.getResource(lng, ns) !== void 0;
  }
  getResourceBundle(lng, ns) {
    if (!ns) ns = this.options.defaultNS;
    return this.getResource(lng, ns);
  }
  getDataByLanguage(lng) {
    return this.data[lng];
  }
  hasLanguageSomeTranslations(lng) {
    const data = this.getDataByLanguage(lng);
    const n = data && Object.keys(data) || [];
    return !!n.find((v) => data[v] && Object.keys(data[v]).length > 0);
  }
  toJSON() {
    return this.data;
  }
}
var postProcessor = {
  processors: {},
  addPostProcessor(module) {
    this.processors[module.name] = module;
  },
  handle(processors, value, key, options, translator) {
    processors.forEach((processor) => {
      value = this.processors[processor]?.process(value, key, options, translator) ?? value;
    });
    return value;
  }
};
const PATH_KEY = Symbol("i18next/PATH_KEY");
function createProxy() {
  const state = [];
  const handler = /* @__PURE__ */ Object.create(null);
  let proxy;
  handler.get = (target, key) => {
    proxy?.revoke?.();
    if (key === PATH_KEY) return state;
    state.push(key);
    proxy = Proxy.revocable(target, handler);
    return proxy.proxy;
  };
  return Proxy.revocable(/* @__PURE__ */ Object.create(null), handler).proxy;
}
function keysFromSelector(selector, opts) {
  const {
    [PATH_KEY]: path
  } = selector(createProxy());
  return path.join(opts?.keySeparator ?? ".");
}
const checkedLoadedFor = {};
const shouldHandleAsObject = (res) => !isString(res) && typeof res !== "boolean" && typeof res !== "number";
class Translator extends EventEmitter {
  constructor(services, options = {}) {
    super();
    copy(["resourceStore", "languageUtils", "pluralResolver", "interpolator", "backendConnector", "i18nFormat", "utils"], services, this);
    this.options = options;
    if (this.options.keySeparator === void 0) {
      this.options.keySeparator = ".";
    }
    this.logger = baseLogger.create("translator");
  }
  changeLanguage(lng) {
    if (lng) this.language = lng;
  }
  exists(key, o = {
    interpolation: {}
  }) {
    const opt = {
      ...o
    };
    if (key == null) return false;
    const resolved = this.resolve(key, opt);
    if (resolved?.res === void 0) return false;
    const isObject = shouldHandleAsObject(resolved.res);
    if (opt.returnObjects === false && isObject) {
      return false;
    }
    return true;
  }
  extractFromKey(key, opt) {
    let nsSeparator = opt.nsSeparator !== void 0 ? opt.nsSeparator : this.options.nsSeparator;
    if (nsSeparator === void 0) nsSeparator = ":";
    const keySeparator = opt.keySeparator !== void 0 ? opt.keySeparator : this.options.keySeparator;
    let namespaces = opt.ns || this.options.defaultNS || [];
    const wouldCheckForNsInKey = nsSeparator && key.indexOf(nsSeparator) > -1;
    const seemsNaturalLanguage = !this.options.userDefinedKeySeparator && !opt.keySeparator && !this.options.userDefinedNsSeparator && !opt.nsSeparator && !looksLikeObjectPath(key, nsSeparator, keySeparator);
    if (wouldCheckForNsInKey && !seemsNaturalLanguage) {
      const m = key.match(this.interpolator.nestingRegexp);
      if (m && m.length > 0) {
        return {
          key,
          namespaces: isString(namespaces) ? [namespaces] : namespaces
        };
      }
      const parts = key.split(nsSeparator);
      if (nsSeparator !== keySeparator || nsSeparator === keySeparator && this.options.ns.indexOf(parts[0]) > -1) namespaces = parts.shift();
      key = parts.join(keySeparator);
    }
    return {
      key,
      namespaces: isString(namespaces) ? [namespaces] : namespaces
    };
  }
  translate(keys, o, lastKey) {
    let opt = typeof o === "object" ? {
      ...o
    } : o;
    if (typeof opt !== "object" && this.options.overloadTranslationOptionHandler) {
      opt = this.options.overloadTranslationOptionHandler(arguments);
    }
    if (typeof opt === "object") opt = {
      ...opt
    };
    if (!opt) opt = {};
    if (keys == null) return "";
    if (typeof keys === "function") keys = keysFromSelector(keys, {
      ...this.options,
      ...opt
    });
    if (!Array.isArray(keys)) keys = [String(keys)];
    const returnDetails = opt.returnDetails !== void 0 ? opt.returnDetails : this.options.returnDetails;
    const keySeparator = opt.keySeparator !== void 0 ? opt.keySeparator : this.options.keySeparator;
    const {
      key,
      namespaces
    } = this.extractFromKey(keys[keys.length - 1], opt);
    const namespace = namespaces[namespaces.length - 1];
    let nsSeparator = opt.nsSeparator !== void 0 ? opt.nsSeparator : this.options.nsSeparator;
    if (nsSeparator === void 0) nsSeparator = ":";
    const lng = opt.lng || this.language;
    const appendNamespaceToCIMode = opt.appendNamespaceToCIMode || this.options.appendNamespaceToCIMode;
    if (lng?.toLowerCase() === "cimode") {
      if (appendNamespaceToCIMode) {
        if (returnDetails) {
          return {
            res: `${namespace}${nsSeparator}${key}`,
            usedKey: key,
            exactUsedKey: key,
            usedLng: lng,
            usedNS: namespace,
            usedParams: this.getUsedParamsDetails(opt)
          };
        }
        return `${namespace}${nsSeparator}${key}`;
      }
      if (returnDetails) {
        return {
          res: key,
          usedKey: key,
          exactUsedKey: key,
          usedLng: lng,
          usedNS: namespace,
          usedParams: this.getUsedParamsDetails(opt)
        };
      }
      return key;
    }
    const resolved = this.resolve(keys, opt);
    let res = resolved?.res;
    const resUsedKey = resolved?.usedKey || key;
    const resExactUsedKey = resolved?.exactUsedKey || key;
    const noObject = ["[object Number]", "[object Function]", "[object RegExp]"];
    const joinArrays = opt.joinArrays !== void 0 ? opt.joinArrays : this.options.joinArrays;
    const handleAsObjectInI18nFormat = !this.i18nFormat || this.i18nFormat.handleAsObject;
    const needsPluralHandling = opt.count !== void 0 && !isString(opt.count);
    const hasDefaultValue = Translator.hasDefaultValue(opt);
    const defaultValueSuffix = needsPluralHandling ? this.pluralResolver.getSuffix(lng, opt.count, opt) : "";
    const defaultValueSuffixOrdinalFallback = opt.ordinal && needsPluralHandling ? this.pluralResolver.getSuffix(lng, opt.count, {
      ordinal: false
    }) : "";
    const needsZeroSuffixLookup = needsPluralHandling && !opt.ordinal && opt.count === 0;
    const defaultValue = needsZeroSuffixLookup && opt[`defaultValue${this.options.pluralSeparator}zero`] || opt[`defaultValue${defaultValueSuffix}`] || opt[`defaultValue${defaultValueSuffixOrdinalFallback}`] || opt.defaultValue;
    let resForObjHndl = res;
    if (handleAsObjectInI18nFormat && !res && hasDefaultValue) {
      resForObjHndl = defaultValue;
    }
    const handleAsObject = shouldHandleAsObject(resForObjHndl);
    const resType = Object.prototype.toString.apply(resForObjHndl);
    if (handleAsObjectInI18nFormat && resForObjHndl && handleAsObject && noObject.indexOf(resType) < 0 && !(isString(joinArrays) && Array.isArray(resForObjHndl))) {
      if (!opt.returnObjects && !this.options.returnObjects) {
        if (!this.options.returnedObjectHandler) {
          this.logger.warn("accessing an object - but returnObjects options is not enabled!");
        }
        const r = this.options.returnedObjectHandler ? this.options.returnedObjectHandler(resUsedKey, resForObjHndl, {
          ...opt,
          ns: namespaces
        }) : `key '${key} (${this.language})' returned an object instead of string.`;
        if (returnDetails) {
          resolved.res = r;
          resolved.usedParams = this.getUsedParamsDetails(opt);
          return resolved;
        }
        return r;
      }
      if (keySeparator) {
        const resTypeIsArray = Array.isArray(resForObjHndl);
        const copy2 = resTypeIsArray ? [] : {};
        const newKeyToUse = resTypeIsArray ? resExactUsedKey : resUsedKey;
        for (const m in resForObjHndl) {
          if (Object.prototype.hasOwnProperty.call(resForObjHndl, m)) {
            const deepKey = `${newKeyToUse}${keySeparator}${m}`;
            if (hasDefaultValue && !res) {
              copy2[m] = this.translate(deepKey, {
                ...opt,
                defaultValue: shouldHandleAsObject(defaultValue) ? defaultValue[m] : void 0,
                ...{
                  joinArrays: false,
                  ns: namespaces
                }
              });
            } else {
              copy2[m] = this.translate(deepKey, {
                ...opt,
                ...{
                  joinArrays: false,
                  ns: namespaces
                }
              });
            }
            if (copy2[m] === deepKey) copy2[m] = resForObjHndl[m];
          }
        }
        res = copy2;
      }
    } else if (handleAsObjectInI18nFormat && isString(joinArrays) && Array.isArray(res)) {
      res = res.join(joinArrays);
      if (res) res = this.extendTranslation(res, keys, opt, lastKey);
    } else {
      let usedDefault = false;
      let usedKey = false;
      if (!this.isValidLookup(res) && hasDefaultValue) {
        usedDefault = true;
        res = defaultValue;
      }
      if (!this.isValidLookup(res)) {
        usedKey = true;
        res = key;
      }
      const missingKeyNoValueFallbackToKey = opt.missingKeyNoValueFallbackToKey || this.options.missingKeyNoValueFallbackToKey;
      const resForMissing = missingKeyNoValueFallbackToKey && usedKey ? void 0 : res;
      const updateMissing = hasDefaultValue && defaultValue !== res && this.options.updateMissing;
      if (usedKey || usedDefault || updateMissing) {
        this.logger.log(updateMissing ? "updateKey" : "missingKey", lng, namespace, key, updateMissing ? defaultValue : res);
        if (keySeparator) {
          const fk = this.resolve(key, {
            ...opt,
            keySeparator: false
          });
          if (fk && fk.res) this.logger.warn("Seems the loaded translations were in flat JSON format instead of nested. Either set keySeparator: false on init or make sure your translations are published in nested format.");
        }
        let lngs = [];
        const fallbackLngs = this.languageUtils.getFallbackCodes(this.options.fallbackLng, opt.lng || this.language);
        if (this.options.saveMissingTo === "fallback" && fallbackLngs && fallbackLngs[0]) {
          for (let i = 0; i < fallbackLngs.length; i++) {
            lngs.push(fallbackLngs[i]);
          }
        } else if (this.options.saveMissingTo === "all") {
          lngs = this.languageUtils.toResolveHierarchy(opt.lng || this.language);
        } else {
          lngs.push(opt.lng || this.language);
        }
        const send = (l, k, specificDefaultValue) => {
          const defaultForMissing = hasDefaultValue && specificDefaultValue !== res ? specificDefaultValue : resForMissing;
          if (this.options.missingKeyHandler) {
            this.options.missingKeyHandler(l, namespace, k, defaultForMissing, updateMissing, opt);
          } else if (this.backendConnector?.saveMissing) {
            this.backendConnector.saveMissing(l, namespace, k, defaultForMissing, updateMissing, opt);
          }
          this.emit("missingKey", l, namespace, k, res);
        };
        if (this.options.saveMissing) {
          if (this.options.saveMissingPlurals && needsPluralHandling) {
            lngs.forEach((language) => {
              const suffixes = this.pluralResolver.getSuffixes(language, opt);
              if (needsZeroSuffixLookup && opt[`defaultValue${this.options.pluralSeparator}zero`] && suffixes.indexOf(`${this.options.pluralSeparator}zero`) < 0) {
                suffixes.push(`${this.options.pluralSeparator}zero`);
              }
              suffixes.forEach((suffix) => {
                send([language], key + suffix, opt[`defaultValue${suffix}`] || defaultValue);
              });
            });
          } else {
            send(lngs, key, defaultValue);
          }
        }
      }
      res = this.extendTranslation(res, keys, opt, resolved, lastKey);
      if (usedKey && res === key && this.options.appendNamespaceToMissingKey) {
        res = `${namespace}${nsSeparator}${key}`;
      }
      if ((usedKey || usedDefault) && this.options.parseMissingKeyHandler) {
        res = this.options.parseMissingKeyHandler(this.options.appendNamespaceToMissingKey ? `${namespace}${nsSeparator}${key}` : key, usedDefault ? res : void 0, opt);
      }
    }
    if (returnDetails) {
      resolved.res = res;
      resolved.usedParams = this.getUsedParamsDetails(opt);
      return resolved;
    }
    return res;
  }
  extendTranslation(res, key, opt, resolved, lastKey) {
    if (this.i18nFormat?.parse) {
      res = this.i18nFormat.parse(res, {
        ...this.options.interpolation.defaultVariables,
        ...opt
      }, opt.lng || this.language || resolved.usedLng, resolved.usedNS, resolved.usedKey, {
        resolved
      });
    } else if (!opt.skipInterpolation) {
      if (opt.interpolation) this.interpolator.init({
        ...opt,
        ...{
          interpolation: {
            ...this.options.interpolation,
            ...opt.interpolation
          }
        }
      });
      const skipOnVariables = isString(res) && (opt?.interpolation?.skipOnVariables !== void 0 ? opt.interpolation.skipOnVariables : this.options.interpolation.skipOnVariables);
      let nestBef;
      if (skipOnVariables) {
        const nb = res.match(this.interpolator.nestingRegexp);
        nestBef = nb && nb.length;
      }
      let data = opt.replace && !isString(opt.replace) ? opt.replace : opt;
      if (this.options.interpolation.defaultVariables) data = {
        ...this.options.interpolation.defaultVariables,
        ...data
      };
      res = this.interpolator.interpolate(res, data, opt.lng || this.language || resolved.usedLng, opt);
      if (skipOnVariables) {
        const na = res.match(this.interpolator.nestingRegexp);
        const nestAft = na && na.length;
        if (nestBef < nestAft) opt.nest = false;
      }
      if (!opt.lng && resolved && resolved.res) opt.lng = this.language || resolved.usedLng;
      if (opt.nest !== false) res = this.interpolator.nest(res, (...args) => {
        if (lastKey?.[0] === args[0] && !opt.context) {
          this.logger.warn(`It seems you are nesting recursively key: ${args[0]} in key: ${key[0]}`);
          return null;
        }
        return this.translate(...args, key);
      }, opt);
      if (opt.interpolation) this.interpolator.reset();
    }
    const postProcess = opt.postProcess || this.options.postProcess;
    const postProcessorNames = isString(postProcess) ? [postProcess] : postProcess;
    if (res != null && postProcessorNames?.length && opt.applyPostProcessor !== false) {
      res = postProcessor.handle(postProcessorNames, res, key, this.options && this.options.postProcessPassResolved ? {
        i18nResolved: {
          ...resolved,
          usedParams: this.getUsedParamsDetails(opt)
        },
        ...opt
      } : opt, this);
    }
    return res;
  }
  resolve(keys, opt = {}) {
    let found;
    let usedKey;
    let exactUsedKey;
    let usedLng;
    let usedNS;
    if (isString(keys)) keys = [keys];
    keys.forEach((k) => {
      if (this.isValidLookup(found)) return;
      const extracted = this.extractFromKey(k, opt);
      const key = extracted.key;
      usedKey = key;
      let namespaces = extracted.namespaces;
      if (this.options.fallbackNS) namespaces = namespaces.concat(this.options.fallbackNS);
      const needsPluralHandling = opt.count !== void 0 && !isString(opt.count);
      const needsZeroSuffixLookup = needsPluralHandling && !opt.ordinal && opt.count === 0;
      const needsContextHandling = opt.context !== void 0 && (isString(opt.context) || typeof opt.context === "number") && opt.context !== "";
      const codes = opt.lngs ? opt.lngs : this.languageUtils.toResolveHierarchy(opt.lng || this.language, opt.fallbackLng);
      namespaces.forEach((ns) => {
        if (this.isValidLookup(found)) return;
        usedNS = ns;
        if (!checkedLoadedFor[`${codes[0]}-${ns}`] && this.utils?.hasLoadedNamespace && !this.utils?.hasLoadedNamespace(usedNS)) {
          checkedLoadedFor[`${codes[0]}-${ns}`] = true;
          this.logger.warn(`key "${usedKey}" for languages "${codes.join(", ")}" won't get resolved as namespace "${usedNS}" was not yet loaded`, "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!");
        }
        codes.forEach((code) => {
          if (this.isValidLookup(found)) return;
          usedLng = code;
          const finalKeys = [key];
          if (this.i18nFormat?.addLookupKeys) {
            this.i18nFormat.addLookupKeys(finalKeys, key, code, ns, opt);
          } else {
            let pluralSuffix;
            if (needsPluralHandling) pluralSuffix = this.pluralResolver.getSuffix(code, opt.count, opt);
            const zeroSuffix = `${this.options.pluralSeparator}zero`;
            const ordinalPrefix = `${this.options.pluralSeparator}ordinal${this.options.pluralSeparator}`;
            if (needsPluralHandling) {
              if (opt.ordinal && pluralSuffix.indexOf(ordinalPrefix) === 0) {
                finalKeys.push(key + pluralSuffix.replace(ordinalPrefix, this.options.pluralSeparator));
              }
              finalKeys.push(key + pluralSuffix);
              if (needsZeroSuffixLookup) {
                finalKeys.push(key + zeroSuffix);
              }
            }
            if (needsContextHandling) {
              const contextKey = `${key}${this.options.contextSeparator || "_"}${opt.context}`;
              finalKeys.push(contextKey);
              if (needsPluralHandling) {
                if (opt.ordinal && pluralSuffix.indexOf(ordinalPrefix) === 0) {
                  finalKeys.push(contextKey + pluralSuffix.replace(ordinalPrefix, this.options.pluralSeparator));
                }
                finalKeys.push(contextKey + pluralSuffix);
                if (needsZeroSuffixLookup) {
                  finalKeys.push(contextKey + zeroSuffix);
                }
              }
            }
          }
          let possibleKey;
          while (possibleKey = finalKeys.pop()) {
            if (!this.isValidLookup(found)) {
              exactUsedKey = possibleKey;
              found = this.getResource(code, ns, possibleKey, opt);
            }
          }
        });
      });
    });
    return {
      res: found,
      usedKey,
      exactUsedKey,
      usedLng,
      usedNS
    };
  }
  isValidLookup(res) {
    return res !== void 0 && !(!this.options.returnNull && res === null) && !(!this.options.returnEmptyString && res === "");
  }
  getResource(code, ns, key, options = {}) {
    if (this.i18nFormat?.getResource) return this.i18nFormat.getResource(code, ns, key, options);
    return this.resourceStore.getResource(code, ns, key, options);
  }
  getUsedParamsDetails(options = {}) {
    const optionsKeys = ["defaultValue", "ordinal", "context", "replace", "lng", "lngs", "fallbackLng", "ns", "keySeparator", "nsSeparator", "returnObjects", "returnDetails", "joinArrays", "postProcess", "interpolation"];
    const useOptionsReplaceForData = options.replace && !isString(options.replace);
    let data = useOptionsReplaceForData ? options.replace : options;
    if (useOptionsReplaceForData && typeof options.count !== "undefined") {
      data.count = options.count;
    }
    if (this.options.interpolation.defaultVariables) {
      data = {
        ...this.options.interpolation.defaultVariables,
        ...data
      };
    }
    if (!useOptionsReplaceForData) {
      data = {
        ...data
      };
      for (const key of optionsKeys) {
        delete data[key];
      }
    }
    return data;
  }
  static hasDefaultValue(options) {
    const prefix = "defaultValue";
    for (const option in options) {
      if (Object.prototype.hasOwnProperty.call(options, option) && prefix === option.substring(0, prefix.length) && void 0 !== options[option]) {
        return true;
      }
    }
    return false;
  }
}
class LanguageUtil {
  constructor(options) {
    this.options = options;
    this.supportedLngs = this.options.supportedLngs || false;
    this.logger = baseLogger.create("languageUtils");
  }
  getScriptPartFromCode(code) {
    code = getCleanedCode(code);
    if (!code || code.indexOf("-") < 0) return null;
    const p = code.split("-");
    if (p.length === 2) return null;
    p.pop();
    if (p[p.length - 1].toLowerCase() === "x") return null;
    return this.formatLanguageCode(p.join("-"));
  }
  getLanguagePartFromCode(code) {
    code = getCleanedCode(code);
    if (!code || code.indexOf("-") < 0) return code;
    const p = code.split("-");
    return this.formatLanguageCode(p[0]);
  }
  formatLanguageCode(code) {
    if (isString(code) && code.indexOf("-") > -1) {
      let formattedCode;
      try {
        formattedCode = Intl.getCanonicalLocales(code)[0];
      } catch (e) {
      }
      if (formattedCode && this.options.lowerCaseLng) {
        formattedCode = formattedCode.toLowerCase();
      }
      if (formattedCode) return formattedCode;
      if (this.options.lowerCaseLng) {
        return code.toLowerCase();
      }
      return code;
    }
    return this.options.cleanCode || this.options.lowerCaseLng ? code.toLowerCase() : code;
  }
  isSupportedCode(code) {
    if (this.options.load === "languageOnly" || this.options.nonExplicitSupportedLngs) {
      code = this.getLanguagePartFromCode(code);
    }
    return !this.supportedLngs || !this.supportedLngs.length || this.supportedLngs.indexOf(code) > -1;
  }
  getBestMatchFromCodes(codes) {
    if (!codes) return null;
    let found;
    codes.forEach((code) => {
      if (found) return;
      const cleanedLng = this.formatLanguageCode(code);
      if (!this.options.supportedLngs || this.isSupportedCode(cleanedLng)) found = cleanedLng;
    });
    if (!found && this.options.supportedLngs) {
      codes.forEach((code) => {
        if (found) return;
        const lngScOnly = this.getScriptPartFromCode(code);
        if (this.isSupportedCode(lngScOnly)) return found = lngScOnly;
        const lngOnly = this.getLanguagePartFromCode(code);
        if (this.isSupportedCode(lngOnly)) return found = lngOnly;
        found = this.options.supportedLngs.find((supportedLng) => {
          if (supportedLng === lngOnly) return supportedLng;
          if (supportedLng.indexOf("-") < 0 && lngOnly.indexOf("-") < 0) return;
          if (supportedLng.indexOf("-") > 0 && lngOnly.indexOf("-") < 0 && supportedLng.substring(0, supportedLng.indexOf("-")) === lngOnly) return supportedLng;
          if (supportedLng.indexOf(lngOnly) === 0 && lngOnly.length > 1) return supportedLng;
        });
      });
    }
    if (!found) found = this.getFallbackCodes(this.options.fallbackLng)[0];
    return found;
  }
  getFallbackCodes(fallbacks, code) {
    if (!fallbacks) return [];
    if (typeof fallbacks === "function") fallbacks = fallbacks(code);
    if (isString(fallbacks)) fallbacks = [fallbacks];
    if (Array.isArray(fallbacks)) return fallbacks;
    if (!code) return fallbacks.default || [];
    let found = fallbacks[code];
    if (!found) found = fallbacks[this.getScriptPartFromCode(code)];
    if (!found) found = fallbacks[this.formatLanguageCode(code)];
    if (!found) found = fallbacks[this.getLanguagePartFromCode(code)];
    if (!found) found = fallbacks.default;
    return found || [];
  }
  toResolveHierarchy(code, fallbackCode) {
    const fallbackCodes = this.getFallbackCodes((fallbackCode === false ? [] : fallbackCode) || this.options.fallbackLng || [], code);
    const codes = [];
    const addCode = (c) => {
      if (!c) return;
      if (this.isSupportedCode(c)) {
        codes.push(c);
      } else {
        this.logger.warn(`rejecting language code not found in supportedLngs: ${c}`);
      }
    };
    if (isString(code) && (code.indexOf("-") > -1 || code.indexOf("_") > -1)) {
      if (this.options.load !== "languageOnly") addCode(this.formatLanguageCode(code));
      if (this.options.load !== "languageOnly" && this.options.load !== "currentOnly") addCode(this.getScriptPartFromCode(code));
      if (this.options.load !== "currentOnly") addCode(this.getLanguagePartFromCode(code));
    } else if (isString(code)) {
      addCode(this.formatLanguageCode(code));
    }
    fallbackCodes.forEach((fc) => {
      if (codes.indexOf(fc) < 0) addCode(this.formatLanguageCode(fc));
    });
    return codes;
  }
}
const suffixesOrder = {
  zero: 0,
  one: 1,
  two: 2,
  few: 3,
  many: 4,
  other: 5
};
const dummyRule = {
  select: (count) => count === 1 ? "one" : "other",
  resolvedOptions: () => ({
    pluralCategories: ["one", "other"]
  })
};
class PluralResolver {
  constructor(languageUtils, options = {}) {
    this.languageUtils = languageUtils;
    this.options = options;
    this.logger = baseLogger.create("pluralResolver");
    this.pluralRulesCache = {};
  }
  addRule(lng, obj) {
    this.rules[lng] = obj;
  }
  clearCache() {
    this.pluralRulesCache = {};
  }
  getRule(code, options = {}) {
    const cleanedCode = getCleanedCode(code === "dev" ? "en" : code);
    const type = options.ordinal ? "ordinal" : "cardinal";
    const cacheKey = JSON.stringify({
      cleanedCode,
      type
    });
    if (cacheKey in this.pluralRulesCache) {
      return this.pluralRulesCache[cacheKey];
    }
    let rule;
    try {
      rule = new Intl.PluralRules(cleanedCode, {
        type
      });
    } catch (err) {
      if (!Intl) {
        this.logger.error("No Intl support, please use an Intl polyfill!");
        return dummyRule;
      }
      if (!code.match(/-|_/)) return dummyRule;
      const lngPart = this.languageUtils.getLanguagePartFromCode(code);
      rule = this.getRule(lngPart, options);
    }
    this.pluralRulesCache[cacheKey] = rule;
    return rule;
  }
  needsPlural(code, options = {}) {
    let rule = this.getRule(code, options);
    if (!rule) rule = this.getRule("dev", options);
    return rule?.resolvedOptions().pluralCategories.length > 1;
  }
  getPluralFormsOfKey(code, key, options = {}) {
    return this.getSuffixes(code, options).map((suffix) => `${key}${suffix}`);
  }
  getSuffixes(code, options = {}) {
    let rule = this.getRule(code, options);
    if (!rule) rule = this.getRule("dev", options);
    if (!rule) return [];
    return rule.resolvedOptions().pluralCategories.sort((pluralCategory1, pluralCategory2) => suffixesOrder[pluralCategory1] - suffixesOrder[pluralCategory2]).map((pluralCategory) => `${this.options.prepend}${options.ordinal ? `ordinal${this.options.prepend}` : ""}${pluralCategory}`);
  }
  getSuffix(code, count, options = {}) {
    const rule = this.getRule(code, options);
    if (rule) {
      return `${this.options.prepend}${options.ordinal ? `ordinal${this.options.prepend}` : ""}${rule.select(count)}`;
    }
    this.logger.warn(`no plural rule found for: ${code}`);
    return this.getSuffix("dev", count, options);
  }
}
const deepFindWithDefaults = (data, defaultData, key, keySeparator = ".", ignoreJSONStructure = true) => {
  let path = getPathWithDefaults(data, defaultData, key);
  if (!path && ignoreJSONStructure && isString(key)) {
    path = deepFind(data, key, keySeparator);
    if (path === void 0) path = deepFind(defaultData, key, keySeparator);
  }
  return path;
};
const regexSafe = (val) => val.replace(/\$/g, "$$$$");
class Interpolator {
  constructor(options = {}) {
    this.logger = baseLogger.create("interpolator");
    this.options = options;
    this.format = options?.interpolation?.format || ((value) => value);
    this.init(options);
  }
  init(options = {}) {
    if (!options.interpolation) options.interpolation = {
      escapeValue: true
    };
    const {
      escape: escape$1,
      escapeValue,
      useRawValueToEscape,
      prefix,
      prefixEscaped,
      suffix,
      suffixEscaped,
      formatSeparator,
      unescapeSuffix,
      unescapePrefix,
      nestingPrefix,
      nestingPrefixEscaped,
      nestingSuffix,
      nestingSuffixEscaped,
      nestingOptionsSeparator,
      maxReplaces,
      alwaysFormat
    } = options.interpolation;
    this.escape = escape$1 !== void 0 ? escape$1 : escape;
    this.escapeValue = escapeValue !== void 0 ? escapeValue : true;
    this.useRawValueToEscape = useRawValueToEscape !== void 0 ? useRawValueToEscape : false;
    this.prefix = prefix ? regexEscape(prefix) : prefixEscaped || "{{";
    this.suffix = suffix ? regexEscape(suffix) : suffixEscaped || "}}";
    this.formatSeparator = formatSeparator || ",";
    this.unescapePrefix = unescapeSuffix ? "" : unescapePrefix || "-";
    this.unescapeSuffix = this.unescapePrefix ? "" : unescapeSuffix || "";
    this.nestingPrefix = nestingPrefix ? regexEscape(nestingPrefix) : nestingPrefixEscaped || regexEscape("$t(");
    this.nestingSuffix = nestingSuffix ? regexEscape(nestingSuffix) : nestingSuffixEscaped || regexEscape(")");
    this.nestingOptionsSeparator = nestingOptionsSeparator || ",";
    this.maxReplaces = maxReplaces || 1e3;
    this.alwaysFormat = alwaysFormat !== void 0 ? alwaysFormat : false;
    this.resetRegExp();
  }
  reset() {
    if (this.options) this.init(this.options);
  }
  resetRegExp() {
    const getOrResetRegExp = (existingRegExp, pattern) => {
      if (existingRegExp?.source === pattern) {
        existingRegExp.lastIndex = 0;
        return existingRegExp;
      }
      return new RegExp(pattern, "g");
    };
    this.regexp = getOrResetRegExp(this.regexp, `${this.prefix}(.+?)${this.suffix}`);
    this.regexpUnescape = getOrResetRegExp(this.regexpUnescape, `${this.prefix}${this.unescapePrefix}(.+?)${this.unescapeSuffix}${this.suffix}`);
    this.nestingRegexp = getOrResetRegExp(this.nestingRegexp, `${this.nestingPrefix}((?:[^()"']+|"[^"]*"|'[^']*'|\\((?:[^()]|"[^"]*"|'[^']*')*\\))*?)${this.nestingSuffix}`);
  }
  interpolate(str, data, lng, options) {
    let match;
    let value;
    let replaces;
    const defaultData = this.options && this.options.interpolation && this.options.interpolation.defaultVariables || {};
    const handleFormat = (key) => {
      if (key.indexOf(this.formatSeparator) < 0) {
        const path = deepFindWithDefaults(data, defaultData, key, this.options.keySeparator, this.options.ignoreJSONStructure);
        return this.alwaysFormat ? this.format(path, void 0, lng, {
          ...options,
          ...data,
          interpolationkey: key
        }) : path;
      }
      const p = key.split(this.formatSeparator);
      const k = p.shift().trim();
      const f = p.join(this.formatSeparator).trim();
      return this.format(deepFindWithDefaults(data, defaultData, k, this.options.keySeparator, this.options.ignoreJSONStructure), f, lng, {
        ...options,
        ...data,
        interpolationkey: k
      });
    };
    this.resetRegExp();
    const missingInterpolationHandler = options?.missingInterpolationHandler || this.options.missingInterpolationHandler;
    const skipOnVariables = options?.interpolation?.skipOnVariables !== void 0 ? options.interpolation.skipOnVariables : this.options.interpolation.skipOnVariables;
    const todos = [{
      regex: this.regexpUnescape,
      safeValue: (val) => regexSafe(val)
    }, {
      regex: this.regexp,
      safeValue: (val) => this.escapeValue ? regexSafe(this.escape(val)) : regexSafe(val)
    }];
    todos.forEach((todo) => {
      replaces = 0;
      while (match = todo.regex.exec(str)) {
        const matchedVar = match[1].trim();
        value = handleFormat(matchedVar);
        if (value === void 0) {
          if (typeof missingInterpolationHandler === "function") {
            const temp = missingInterpolationHandler(str, match, options);
            value = isString(temp) ? temp : "";
          } else if (options && Object.prototype.hasOwnProperty.call(options, matchedVar)) {
            value = "";
          } else if (skipOnVariables) {
            value = match[0];
            continue;
          } else {
            this.logger.warn(`missed to pass in variable ${matchedVar} for interpolating ${str}`);
            value = "";
          }
        } else if (!isString(value) && !this.useRawValueToEscape) {
          value = makeString(value);
        }
        const safeValue = todo.safeValue(value);
        str = str.replace(match[0], safeValue);
        if (skipOnVariables) {
          todo.regex.lastIndex += value.length;
          todo.regex.lastIndex -= match[0].length;
        } else {
          todo.regex.lastIndex = 0;
        }
        replaces++;
        if (replaces >= this.maxReplaces) {
          break;
        }
      }
    });
    return str;
  }
  nest(str, fc, options = {}) {
    let match;
    let value;
    let clonedOptions;
    const handleHasOptions = (key, inheritedOptions) => {
      const sep = this.nestingOptionsSeparator;
      if (key.indexOf(sep) < 0) return key;
      const c = key.split(new RegExp(`${sep}[ ]*{`));
      let optionsString = `{${c[1]}`;
      key = c[0];
      optionsString = this.interpolate(optionsString, clonedOptions);
      const matchedSingleQuotes = optionsString.match(/'/g);
      const matchedDoubleQuotes = optionsString.match(/"/g);
      if ((matchedSingleQuotes?.length ?? 0) % 2 === 0 && !matchedDoubleQuotes || matchedDoubleQuotes.length % 2 !== 0) {
        optionsString = optionsString.replace(/'/g, '"');
      }
      try {
        clonedOptions = JSON.parse(optionsString);
        if (inheritedOptions) clonedOptions = {
          ...inheritedOptions,
          ...clonedOptions
        };
      } catch (e) {
        this.logger.warn(`failed parsing options string in nesting for key ${key}`, e);
        return `${key}${sep}${optionsString}`;
      }
      if (clonedOptions.defaultValue && clonedOptions.defaultValue.indexOf(this.prefix) > -1) delete clonedOptions.defaultValue;
      return key;
    };
    while (match = this.nestingRegexp.exec(str)) {
      let formatters = [];
      clonedOptions = {
        ...options
      };
      clonedOptions = clonedOptions.replace && !isString(clonedOptions.replace) ? clonedOptions.replace : clonedOptions;
      clonedOptions.applyPostProcessor = false;
      delete clonedOptions.defaultValue;
      const keyEndIndex = /{.*}/.test(match[1]) ? match[1].lastIndexOf("}") + 1 : match[1].indexOf(this.formatSeparator);
      if (keyEndIndex !== -1) {
        formatters = match[1].slice(keyEndIndex).split(this.formatSeparator).map((elem) => elem.trim()).filter(Boolean);
        match[1] = match[1].slice(0, keyEndIndex);
      }
      value = fc(handleHasOptions.call(this, match[1].trim(), clonedOptions), clonedOptions);
      if (value && match[0] === str && !isString(value)) return value;
      if (!isString(value)) value = makeString(value);
      if (!value) {
        this.logger.warn(`missed to resolve ${match[1]} for nesting ${str}`);
        value = "";
      }
      if (formatters.length) {
        value = formatters.reduce((v, f) => this.format(v, f, options.lng, {
          ...options,
          interpolationkey: match[1].trim()
        }), value.trim());
      }
      str = str.replace(match[0], value);
      this.regexp.lastIndex = 0;
    }
    return str;
  }
}
const parseFormatStr = (formatStr) => {
  let formatName = formatStr.toLowerCase().trim();
  const formatOptions = {};
  if (formatStr.indexOf("(") > -1) {
    const p = formatStr.split("(");
    formatName = p[0].toLowerCase().trim();
    const optStr = p[1].substring(0, p[1].length - 1);
    if (formatName === "currency" && optStr.indexOf(":") < 0) {
      if (!formatOptions.currency) formatOptions.currency = optStr.trim();
    } else if (formatName === "relativetime" && optStr.indexOf(":") < 0) {
      if (!formatOptions.range) formatOptions.range = optStr.trim();
    } else {
      const opts = optStr.split(";");
      opts.forEach((opt) => {
        if (opt) {
          const [key, ...rest] = opt.split(":");
          const val = rest.join(":").trim().replace(/^'+|'+$/g, "");
          const trimmedKey = key.trim();
          if (!formatOptions[trimmedKey]) formatOptions[trimmedKey] = val;
          if (val === "false") formatOptions[trimmedKey] = false;
          if (val === "true") formatOptions[trimmedKey] = true;
          if (!isNaN(val)) formatOptions[trimmedKey] = parseInt(val, 10);
        }
      });
    }
  }
  return {
    formatName,
    formatOptions
  };
};
const createCachedFormatter = (fn) => {
  const cache = {};
  return (v, l, o) => {
    let optForCache = o;
    if (o && o.interpolationkey && o.formatParams && o.formatParams[o.interpolationkey] && o[o.interpolationkey]) {
      optForCache = {
        ...optForCache,
        [o.interpolationkey]: void 0
      };
    }
    const key = l + JSON.stringify(optForCache);
    let frm = cache[key];
    if (!frm) {
      frm = fn(getCleanedCode(l), o);
      cache[key] = frm;
    }
    return frm(v);
  };
};
const createNonCachedFormatter = (fn) => (v, l, o) => fn(getCleanedCode(l), o)(v);
class Formatter {
  constructor(options = {}) {
    this.logger = baseLogger.create("formatter");
    this.options = options;
    this.init(options);
  }
  init(services, options = {
    interpolation: {}
  }) {
    this.formatSeparator = options.interpolation.formatSeparator || ",";
    const cf = options.cacheInBuiltFormats ? createCachedFormatter : createNonCachedFormatter;
    this.formats = {
      number: cf((lng, opt) => {
        const formatter = new Intl.NumberFormat(lng, {
          ...opt
        });
        return (val) => formatter.format(val);
      }),
      currency: cf((lng, opt) => {
        const formatter = new Intl.NumberFormat(lng, {
          ...opt,
          style: "currency"
        });
        return (val) => formatter.format(val);
      }),
      datetime: cf((lng, opt) => {
        const formatter = new Intl.DateTimeFormat(lng, {
          ...opt
        });
        return (val) => formatter.format(val);
      }),
      relativetime: cf((lng, opt) => {
        const formatter = new Intl.RelativeTimeFormat(lng, {
          ...opt
        });
        return (val) => formatter.format(val, opt.range || "day");
      }),
      list: cf((lng, opt) => {
        const formatter = new Intl.ListFormat(lng, {
          ...opt
        });
        return (val) => formatter.format(val);
      })
    };
  }
  add(name, fc) {
    this.formats[name.toLowerCase().trim()] = fc;
  }
  addCached(name, fc) {
    this.formats[name.toLowerCase().trim()] = createCachedFormatter(fc);
  }
  format(value, format, lng, options = {}) {
    const formats = format.split(this.formatSeparator);
    if (formats.length > 1 && formats[0].indexOf("(") > 1 && formats[0].indexOf(")") < 0 && formats.find((f) => f.indexOf(")") > -1)) {
      const lastIndex = formats.findIndex((f) => f.indexOf(")") > -1);
      formats[0] = [formats[0], ...formats.splice(1, lastIndex)].join(this.formatSeparator);
    }
    const result = formats.reduce((mem, f) => {
      const {
        formatName,
        formatOptions
      } = parseFormatStr(f);
      if (this.formats[formatName]) {
        let formatted = mem;
        try {
          const valOptions = options?.formatParams?.[options.interpolationkey] || {};
          const l = valOptions.locale || valOptions.lng || options.locale || options.lng || lng;
          formatted = this.formats[formatName](mem, l, {
            ...formatOptions,
            ...options,
            ...valOptions
          });
        } catch (error) {
          this.logger.warn(error);
        }
        return formatted;
      } else {
        this.logger.warn(`there was no format function for ${formatName}`);
      }
      return mem;
    }, value);
    return result;
  }
}
const removePending = (q, name) => {
  if (q.pending[name] !== void 0) {
    delete q.pending[name];
    q.pendingCount--;
  }
};
class Connector extends EventEmitter {
  constructor(backend, store, services, options = {}) {
    super();
    this.backend = backend;
    this.store = store;
    this.services = services;
    this.languageUtils = services.languageUtils;
    this.options = options;
    this.logger = baseLogger.create("backendConnector");
    this.waitingReads = [];
    this.maxParallelReads = options.maxParallelReads || 10;
    this.readingCalls = 0;
    this.maxRetries = options.maxRetries >= 0 ? options.maxRetries : 5;
    this.retryTimeout = options.retryTimeout >= 1 ? options.retryTimeout : 350;
    this.state = {};
    this.queue = [];
    this.backend?.init?.(services, options.backend, options);
  }
  queueLoad(languages, namespaces, options, callback) {
    const toLoad = {};
    const pending = {};
    const toLoadLanguages = {};
    const toLoadNamespaces = {};
    languages.forEach((lng) => {
      let hasAllNamespaces = true;
      namespaces.forEach((ns) => {
        const name = `${lng}|${ns}`;
        if (!options.reload && this.store.hasResourceBundle(lng, ns)) {
          this.state[name] = 2;
        } else if (this.state[name] < 0) ;
        else if (this.state[name] === 1) {
          if (pending[name] === void 0) pending[name] = true;
        } else {
          this.state[name] = 1;
          hasAllNamespaces = false;
          if (pending[name] === void 0) pending[name] = true;
          if (toLoad[name] === void 0) toLoad[name] = true;
          if (toLoadNamespaces[ns] === void 0) toLoadNamespaces[ns] = true;
        }
      });
      if (!hasAllNamespaces) toLoadLanguages[lng] = true;
    });
    if (Object.keys(toLoad).length || Object.keys(pending).length) {
      this.queue.push({
        pending,
        pendingCount: Object.keys(pending).length,
        loaded: {},
        errors: [],
        callback
      });
    }
    return {
      toLoad: Object.keys(toLoad),
      pending: Object.keys(pending),
      toLoadLanguages: Object.keys(toLoadLanguages),
      toLoadNamespaces: Object.keys(toLoadNamespaces)
    };
  }
  loaded(name, err, data) {
    const s = name.split("|");
    const lng = s[0];
    const ns = s[1];
    if (err) this.emit("failedLoading", lng, ns, err);
    if (!err && data) {
      this.store.addResourceBundle(lng, ns, data, void 0, void 0, {
        skipCopy: true
      });
    }
    this.state[name] = err ? -1 : 2;
    if (err && data) this.state[name] = 0;
    const loaded = {};
    this.queue.forEach((q) => {
      pushPath(q.loaded, [lng], ns);
      removePending(q, name);
      if (err) q.errors.push(err);
      if (q.pendingCount === 0 && !q.done) {
        Object.keys(q.loaded).forEach((l) => {
          if (!loaded[l]) loaded[l] = {};
          const loadedKeys = q.loaded[l];
          if (loadedKeys.length) {
            loadedKeys.forEach((n) => {
              if (loaded[l][n] === void 0) loaded[l][n] = true;
            });
          }
        });
        q.done = true;
        if (q.errors.length) {
          q.callback(q.errors);
        } else {
          q.callback();
        }
      }
    });
    this.emit("loaded", loaded);
    this.queue = this.queue.filter((q) => !q.done);
  }
  read(lng, ns, fcName, tried = 0, wait = this.retryTimeout, callback) {
    if (!lng.length) return callback(null, {});
    if (this.readingCalls >= this.maxParallelReads) {
      this.waitingReads.push({
        lng,
        ns,
        fcName,
        tried,
        wait,
        callback
      });
      return;
    }
    this.readingCalls++;
    const resolver = (err, data) => {
      this.readingCalls--;
      if (this.waitingReads.length > 0) {
        const next = this.waitingReads.shift();
        this.read(next.lng, next.ns, next.fcName, next.tried, next.wait, next.callback);
      }
      if (err && data && tried < this.maxRetries) {
        setTimeout(() => {
          this.read.call(this, lng, ns, fcName, tried + 1, wait * 2, callback);
        }, wait);
        return;
      }
      callback(err, data);
    };
    const fc = this.backend[fcName].bind(this.backend);
    if (fc.length === 2) {
      try {
        const r = fc(lng, ns);
        if (r && typeof r.then === "function") {
          r.then((data) => resolver(null, data)).catch(resolver);
        } else {
          resolver(null, r);
        }
      } catch (err) {
        resolver(err);
      }
      return;
    }
    return fc(lng, ns, resolver);
  }
  prepareLoading(languages, namespaces, options = {}, callback) {
    if (!this.backend) {
      this.logger.warn("No backend was added via i18next.use. Will not load resources.");
      return callback && callback();
    }
    if (isString(languages)) languages = this.languageUtils.toResolveHierarchy(languages);
    if (isString(namespaces)) namespaces = [namespaces];
    const toLoad = this.queueLoad(languages, namespaces, options, callback);
    if (!toLoad.toLoad.length) {
      if (!toLoad.pending.length) callback();
      return null;
    }
    toLoad.toLoad.forEach((name) => {
      this.loadOne(name);
    });
  }
  load(languages, namespaces, callback) {
    this.prepareLoading(languages, namespaces, {}, callback);
  }
  reload(languages, namespaces, callback) {
    this.prepareLoading(languages, namespaces, {
      reload: true
    }, callback);
  }
  loadOne(name, prefix = "") {
    const s = name.split("|");
    const lng = s[0];
    const ns = s[1];
    this.read(lng, ns, "read", void 0, void 0, (err, data) => {
      if (err) this.logger.warn(`${prefix}loading namespace ${ns} for language ${lng} failed`, err);
      if (!err && data) this.logger.log(`${prefix}loaded namespace ${ns} for language ${lng}`, data);
      this.loaded(name, err, data);
    });
  }
  saveMissing(languages, namespace, key, fallbackValue, isUpdate, options = {}, clb = () => {
  }) {
    if (this.services?.utils?.hasLoadedNamespace && !this.services?.utils?.hasLoadedNamespace(namespace)) {
      this.logger.warn(`did not save key "${key}" as the namespace "${namespace}" was not yet loaded`, "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!");
      return;
    }
    if (key === void 0 || key === null || key === "") return;
    if (this.backend?.create) {
      const opts = {
        ...options,
        isUpdate
      };
      const fc = this.backend.create.bind(this.backend);
      if (fc.length < 6) {
        try {
          let r;
          if (fc.length === 5) {
            r = fc(languages, namespace, key, fallbackValue, opts);
          } else {
            r = fc(languages, namespace, key, fallbackValue);
          }
          if (r && typeof r.then === "function") {
            r.then((data) => clb(null, data)).catch(clb);
          } else {
            clb(null, r);
          }
        } catch (err) {
          clb(err);
        }
      } else {
        fc(languages, namespace, key, fallbackValue, clb, opts);
      }
    }
    if (!languages || !languages[0]) return;
    this.store.addResource(languages[0], namespace, key, fallbackValue);
  }
}
const get = () => ({
  debug: false,
  initAsync: true,
  ns: ["translation"],
  defaultNS: ["translation"],
  fallbackLng: ["dev"],
  fallbackNS: false,
  supportedLngs: false,
  nonExplicitSupportedLngs: false,
  load: "all",
  preload: false,
  simplifyPluralSuffix: true,
  keySeparator: ".",
  nsSeparator: ":",
  pluralSeparator: "_",
  contextSeparator: "_",
  partialBundledLanguages: false,
  saveMissing: false,
  updateMissing: false,
  saveMissingTo: "fallback",
  saveMissingPlurals: true,
  missingKeyHandler: false,
  missingInterpolationHandler: false,
  postProcess: false,
  postProcessPassResolved: false,
  returnNull: false,
  returnEmptyString: true,
  returnObjects: false,
  joinArrays: false,
  returnedObjectHandler: false,
  parseMissingKeyHandler: false,
  appendNamespaceToMissingKey: false,
  appendNamespaceToCIMode: false,
  overloadTranslationOptionHandler: (args) => {
    let ret = {};
    if (typeof args[1] === "object") ret = args[1];
    if (isString(args[1])) ret.defaultValue = args[1];
    if (isString(args[2])) ret.tDescription = args[2];
    if (typeof args[2] === "object" || typeof args[3] === "object") {
      const options = args[3] || args[2];
      Object.keys(options).forEach((key) => {
        ret[key] = options[key];
      });
    }
    return ret;
  },
  interpolation: {
    escapeValue: true,
    format: (value) => value,
    prefix: "{{",
    suffix: "}}",
    formatSeparator: ",",
    unescapePrefix: "-",
    nestingPrefix: "$t(",
    nestingSuffix: ")",
    nestingOptionsSeparator: ",",
    maxReplaces: 1e3,
    skipOnVariables: true
  },
  cacheInBuiltFormats: true
});
const transformOptions = (options) => {
  if (isString(options.ns)) options.ns = [options.ns];
  if (isString(options.fallbackLng)) options.fallbackLng = [options.fallbackLng];
  if (isString(options.fallbackNS)) options.fallbackNS = [options.fallbackNS];
  if (options.supportedLngs?.indexOf?.("cimode") < 0) {
    options.supportedLngs = options.supportedLngs.concat(["cimode"]);
  }
  if (typeof options.initImmediate === "boolean") options.initAsync = options.initImmediate;
  return options;
};
const noop = () => {
};
const bindMemberFunctions = (inst) => {
  const mems = Object.getOwnPropertyNames(Object.getPrototypeOf(inst));
  mems.forEach((mem) => {
    if (typeof inst[mem] === "function") {
      inst[mem] = inst[mem].bind(inst);
    }
  });
};
class I18n extends EventEmitter {
  constructor(options = {}, callback) {
    super();
    this.options = transformOptions(options);
    this.services = {};
    this.logger = baseLogger;
    this.modules = {
      external: []
    };
    bindMemberFunctions(this);
    if (callback && !this.isInitialized && !options.isClone) {
      if (!this.options.initAsync) {
        this.init(options, callback);
        return this;
      }
      setTimeout(() => {
        this.init(options, callback);
      }, 0);
    }
  }
  init(options = {}, callback) {
    this.isInitializing = true;
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    if (options.defaultNS == null && options.ns) {
      if (isString(options.ns)) {
        options.defaultNS = options.ns;
      } else if (options.ns.indexOf("translation") < 0) {
        options.defaultNS = options.ns[0];
      }
    }
    const defOpts = get();
    this.options = {
      ...defOpts,
      ...this.options,
      ...transformOptions(options)
    };
    this.options.interpolation = {
      ...defOpts.interpolation,
      ...this.options.interpolation
    };
    if (options.keySeparator !== void 0) {
      this.options.userDefinedKeySeparator = options.keySeparator;
    }
    if (options.nsSeparator !== void 0) {
      this.options.userDefinedNsSeparator = options.nsSeparator;
    }
    const createClassOnDemand = (ClassOrObject) => {
      if (!ClassOrObject) return null;
      if (typeof ClassOrObject === "function") return new ClassOrObject();
      return ClassOrObject;
    };
    if (!this.options.isClone) {
      if (this.modules.logger) {
        baseLogger.init(createClassOnDemand(this.modules.logger), this.options);
      } else {
        baseLogger.init(null, this.options);
      }
      let formatter;
      if (this.modules.formatter) {
        formatter = this.modules.formatter;
      } else {
        formatter = Formatter;
      }
      const lu = new LanguageUtil(this.options);
      this.store = new ResourceStore(this.options.resources, this.options);
      const s = this.services;
      s.logger = baseLogger;
      s.resourceStore = this.store;
      s.languageUtils = lu;
      s.pluralResolver = new PluralResolver(lu, {
        prepend: this.options.pluralSeparator,
        simplifyPluralSuffix: this.options.simplifyPluralSuffix
      });
      const usingLegacyFormatFunction = this.options.interpolation.format && this.options.interpolation.format !== defOpts.interpolation.format;
      if (usingLegacyFormatFunction) {
        this.logger.deprecate(`init: you are still using the legacy format function, please use the new approach: https://www.i18next.com/translation-function/formatting`);
      }
      if (formatter && (!this.options.interpolation.format || this.options.interpolation.format === defOpts.interpolation.format)) {
        s.formatter = createClassOnDemand(formatter);
        if (s.formatter.init) s.formatter.init(s, this.options);
        this.options.interpolation.format = s.formatter.format.bind(s.formatter);
      }
      s.interpolator = new Interpolator(this.options);
      s.utils = {
        hasLoadedNamespace: this.hasLoadedNamespace.bind(this)
      };
      s.backendConnector = new Connector(createClassOnDemand(this.modules.backend), s.resourceStore, s, this.options);
      s.backendConnector.on("*", (event, ...args) => {
        this.emit(event, ...args);
      });
      if (this.modules.languageDetector) {
        s.languageDetector = createClassOnDemand(this.modules.languageDetector);
        if (s.languageDetector.init) s.languageDetector.init(s, this.options.detection, this.options);
      }
      if (this.modules.i18nFormat) {
        s.i18nFormat = createClassOnDemand(this.modules.i18nFormat);
        if (s.i18nFormat.init) s.i18nFormat.init(this);
      }
      this.translator = new Translator(this.services, this.options);
      this.translator.on("*", (event, ...args) => {
        this.emit(event, ...args);
      });
      this.modules.external.forEach((m) => {
        if (m.init) m.init(this);
      });
    }
    this.format = this.options.interpolation.format;
    if (!callback) callback = noop;
    if (this.options.fallbackLng && !this.services.languageDetector && !this.options.lng) {
      const codes = this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);
      if (codes.length > 0 && codes[0] !== "dev") this.options.lng = codes[0];
    }
    if (!this.services.languageDetector && !this.options.lng) {
      this.logger.warn("init: no languageDetector is used and no lng is defined");
    }
    const storeApi = ["getResource", "hasResourceBundle", "getResourceBundle", "getDataByLanguage"];
    storeApi.forEach((fcName) => {
      this[fcName] = (...args) => this.store[fcName](...args);
    });
    const storeApiChained = ["addResource", "addResources", "addResourceBundle", "removeResourceBundle"];
    storeApiChained.forEach((fcName) => {
      this[fcName] = (...args) => {
        this.store[fcName](...args);
        return this;
      };
    });
    const deferred = defer();
    const load = () => {
      const finish = (err, t) => {
        this.isInitializing = false;
        if (this.isInitialized && !this.initializedStoreOnce) this.logger.warn("init: i18next is already initialized. You should call init just once!");
        this.isInitialized = true;
        if (!this.options.isClone) this.logger.log("initialized", this.options);
        this.emit("initialized", this.options);
        deferred.resolve(t);
        callback(err, t);
      };
      if (this.languages && !this.isInitialized) return finish(null, this.t.bind(this));
      this.changeLanguage(this.options.lng, finish);
    };
    if (this.options.resources || !this.options.initAsync) {
      load();
    } else {
      setTimeout(load, 0);
    }
    return deferred;
  }
  loadResources(language, callback = noop) {
    let usedCallback = callback;
    const usedLng = isString(language) ? language : this.language;
    if (typeof language === "function") usedCallback = language;
    if (!this.options.resources || this.options.partialBundledLanguages) {
      if (usedLng?.toLowerCase() === "cimode" && (!this.options.preload || this.options.preload.length === 0)) return usedCallback();
      const toLoad = [];
      const append = (lng) => {
        if (!lng) return;
        if (lng === "cimode") return;
        const lngs = this.services.languageUtils.toResolveHierarchy(lng);
        lngs.forEach((l) => {
          if (l === "cimode") return;
          if (toLoad.indexOf(l) < 0) toLoad.push(l);
        });
      };
      if (!usedLng) {
        const fallbacks = this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);
        fallbacks.forEach((l) => append(l));
      } else {
        append(usedLng);
      }
      this.options.preload?.forEach?.((l) => append(l));
      this.services.backendConnector.load(toLoad, this.options.ns, (e) => {
        if (!e && !this.resolvedLanguage && this.language) this.setResolvedLanguage(this.language);
        usedCallback(e);
      });
    } else {
      usedCallback(null);
    }
  }
  reloadResources(lngs, ns, callback) {
    const deferred = defer();
    if (typeof lngs === "function") {
      callback = lngs;
      lngs = void 0;
    }
    if (typeof ns === "function") {
      callback = ns;
      ns = void 0;
    }
    if (!lngs) lngs = this.languages;
    if (!ns) ns = this.options.ns;
    if (!callback) callback = noop;
    this.services.backendConnector.reload(lngs, ns, (err) => {
      deferred.resolve();
      callback(err);
    });
    return deferred;
  }
  use(module) {
    if (!module) throw new Error("You are passing an undefined module! Please check the object you are passing to i18next.use()");
    if (!module.type) throw new Error("You are passing a wrong module! Please check the object you are passing to i18next.use()");
    if (module.type === "backend") {
      this.modules.backend = module;
    }
    if (module.type === "logger" || module.log && module.warn && module.error) {
      this.modules.logger = module;
    }
    if (module.type === "languageDetector") {
      this.modules.languageDetector = module;
    }
    if (module.type === "i18nFormat") {
      this.modules.i18nFormat = module;
    }
    if (module.type === "postProcessor") {
      postProcessor.addPostProcessor(module);
    }
    if (module.type === "formatter") {
      this.modules.formatter = module;
    }
    if (module.type === "3rdParty") {
      this.modules.external.push(module);
    }
    return this;
  }
  setResolvedLanguage(l) {
    if (!l || !this.languages) return;
    if (["cimode", "dev"].indexOf(l) > -1) return;
    for (let li = 0; li < this.languages.length; li++) {
      const lngInLngs = this.languages[li];
      if (["cimode", "dev"].indexOf(lngInLngs) > -1) continue;
      if (this.store.hasLanguageSomeTranslations(lngInLngs)) {
        this.resolvedLanguage = lngInLngs;
        break;
      }
    }
    if (!this.resolvedLanguage && this.languages.indexOf(l) < 0 && this.store.hasLanguageSomeTranslations(l)) {
      this.resolvedLanguage = l;
      this.languages.unshift(l);
    }
  }
  changeLanguage(lng, callback) {
    this.isLanguageChangingTo = lng;
    const deferred = defer();
    this.emit("languageChanging", lng);
    const setLngProps = (l) => {
      this.language = l;
      this.languages = this.services.languageUtils.toResolveHierarchy(l);
      this.resolvedLanguage = void 0;
      this.setResolvedLanguage(l);
    };
    const done = (err, l) => {
      if (l) {
        if (this.isLanguageChangingTo === lng) {
          setLngProps(l);
          this.translator.changeLanguage(l);
          this.isLanguageChangingTo = void 0;
          this.emit("languageChanged", l);
          this.logger.log("languageChanged", l);
        }
      } else {
        this.isLanguageChangingTo = void 0;
      }
      deferred.resolve((...args) => this.t(...args));
      if (callback) callback(err, (...args) => this.t(...args));
    };
    const setLng = (lngs) => {
      if (!lng && !lngs && this.services.languageDetector) lngs = [];
      const fl = isString(lngs) ? lngs : lngs && lngs[0];
      const l = this.store.hasLanguageSomeTranslations(fl) ? fl : this.services.languageUtils.getBestMatchFromCodes(isString(lngs) ? [lngs] : lngs);
      if (l) {
        if (!this.language) {
          setLngProps(l);
        }
        if (!this.translator.language) this.translator.changeLanguage(l);
        this.services.languageDetector?.cacheUserLanguage?.(l);
      }
      this.loadResources(l, (err) => {
        done(err, l);
      });
    };
    if (!lng && this.services.languageDetector && !this.services.languageDetector.async) {
      setLng(this.services.languageDetector.detect());
    } else if (!lng && this.services.languageDetector && this.services.languageDetector.async) {
      if (this.services.languageDetector.detect.length === 0) {
        this.services.languageDetector.detect().then(setLng);
      } else {
        this.services.languageDetector.detect(setLng);
      }
    } else {
      setLng(lng);
    }
    return deferred;
  }
  getFixedT(lng, ns, keyPrefix) {
    const fixedT = (key, opts, ...rest) => {
      let o;
      if (typeof opts !== "object") {
        o = this.options.overloadTranslationOptionHandler([key, opts].concat(rest));
      } else {
        o = {
          ...opts
        };
      }
      o.lng = o.lng || fixedT.lng;
      o.lngs = o.lngs || fixedT.lngs;
      o.ns = o.ns || fixedT.ns;
      if (o.keyPrefix !== "") o.keyPrefix = o.keyPrefix || keyPrefix || fixedT.keyPrefix;
      const keySeparator = this.options.keySeparator || ".";
      let resultKey;
      if (o.keyPrefix && Array.isArray(key)) {
        resultKey = key.map((k) => {
          if (typeof k === "function") k = keysFromSelector(k, {
            ...this.options,
            ...opts
          });
          return `${o.keyPrefix}${keySeparator}${k}`;
        });
      } else {
        if (typeof key === "function") key = keysFromSelector(key, {
          ...this.options,
          ...opts
        });
        resultKey = o.keyPrefix ? `${o.keyPrefix}${keySeparator}${key}` : key;
      }
      return this.t(resultKey, o);
    };
    if (isString(lng)) {
      fixedT.lng = lng;
    } else {
      fixedT.lngs = lng;
    }
    fixedT.ns = ns;
    fixedT.keyPrefix = keyPrefix;
    return fixedT;
  }
  t(...args) {
    return this.translator?.translate(...args);
  }
  exists(...args) {
    return this.translator?.exists(...args);
  }
  setDefaultNamespace(ns) {
    this.options.defaultNS = ns;
  }
  hasLoadedNamespace(ns, options = {}) {
    if (!this.isInitialized) {
      this.logger.warn("hasLoadedNamespace: i18next was not initialized", this.languages);
      return false;
    }
    if (!this.languages || !this.languages.length) {
      this.logger.warn("hasLoadedNamespace: i18n.languages were undefined or empty", this.languages);
      return false;
    }
    const lng = options.lng || this.resolvedLanguage || this.languages[0];
    const fallbackLng = this.options ? this.options.fallbackLng : false;
    const lastLng = this.languages[this.languages.length - 1];
    if (lng.toLowerCase() === "cimode") return true;
    const loadNotPending = (l, n) => {
      const loadState = this.services.backendConnector.state[`${l}|${n}`];
      return loadState === -1 || loadState === 0 || loadState === 2;
    };
    if (options.precheck) {
      const preResult = options.precheck(this, loadNotPending);
      if (preResult !== void 0) return preResult;
    }
    if (this.hasResourceBundle(lng, ns)) return true;
    if (!this.services.backendConnector.backend || this.options.resources && !this.options.partialBundledLanguages) return true;
    if (loadNotPending(lng, ns) && (!fallbackLng || loadNotPending(lastLng, ns))) return true;
    return false;
  }
  loadNamespaces(ns, callback) {
    const deferred = defer();
    if (!this.options.ns) {
      if (callback) callback();
      return Promise.resolve();
    }
    if (isString(ns)) ns = [ns];
    ns.forEach((n) => {
      if (this.options.ns.indexOf(n) < 0) this.options.ns.push(n);
    });
    this.loadResources((err) => {
      deferred.resolve();
      if (callback) callback(err);
    });
    return deferred;
  }
  loadLanguages(lngs, callback) {
    const deferred = defer();
    if (isString(lngs)) lngs = [lngs];
    const preloaded = this.options.preload || [];
    const newLngs = lngs.filter((lng) => preloaded.indexOf(lng) < 0 && this.services.languageUtils.isSupportedCode(lng));
    if (!newLngs.length) {
      if (callback) callback();
      return Promise.resolve();
    }
    this.options.preload = preloaded.concat(newLngs);
    this.loadResources((err) => {
      deferred.resolve();
      if (callback) callback(err);
    });
    return deferred;
  }
  dir(lng) {
    if (!lng) lng = this.resolvedLanguage || (this.languages?.length > 0 ? this.languages[0] : this.language);
    if (!lng) return "rtl";
    try {
      const l = new Intl.Locale(lng);
      if (l && l.getTextInfo) {
        const ti = l.getTextInfo();
        if (ti && ti.direction) return ti.direction;
      }
    } catch (e) {
    }
    const rtlLngs = ["ar", "shu", "sqr", "ssh", "xaa", "yhd", "yud", "aao", "abh", "abv", "acm", "acq", "acw", "acx", "acy", "adf", "ads", "aeb", "aec", "afb", "ajp", "apc", "apd", "arb", "arq", "ars", "ary", "arz", "auz", "avl", "ayh", "ayl", "ayn", "ayp", "bbz", "pga", "he", "iw", "ps", "pbt", "pbu", "pst", "prp", "prd", "ug", "ur", "ydd", "yds", "yih", "ji", "yi", "hbo", "men", "xmn", "fa", "jpr", "peo", "pes", "prs", "dv", "sam", "ckb"];
    const languageUtils = this.services?.languageUtils || new LanguageUtil(get());
    if (lng.toLowerCase().indexOf("-latn") > 1) return "ltr";
    return rtlLngs.indexOf(languageUtils.getLanguagePartFromCode(lng)) > -1 || lng.toLowerCase().indexOf("-arab") > 1 ? "rtl" : "ltr";
  }
  static createInstance(options = {}, callback) {
    const instance2 = new I18n(options, callback);
    instance2.createInstance = I18n.createInstance;
    return instance2;
  }
  cloneInstance(options = {}, callback = noop) {
    const forkResourceStore = options.forkResourceStore;
    if (forkResourceStore) delete options.forkResourceStore;
    const mergedOptions = {
      ...this.options,
      ...options,
      ...{
        isClone: true
      }
    };
    const clone = new I18n(mergedOptions);
    if (options.debug !== void 0 || options.prefix !== void 0) {
      clone.logger = clone.logger.clone(options);
    }
    const membersToCopy = ["store", "services", "language"];
    membersToCopy.forEach((m) => {
      clone[m] = this[m];
    });
    clone.services = {
      ...this.services
    };
    clone.services.utils = {
      hasLoadedNamespace: clone.hasLoadedNamespace.bind(clone)
    };
    if (forkResourceStore) {
      const clonedData = Object.keys(this.store.data).reduce((prev, l) => {
        prev[l] = {
          ...this.store.data[l]
        };
        prev[l] = Object.keys(prev[l]).reduce((acc, n) => {
          acc[n] = {
            ...prev[l][n]
          };
          return acc;
        }, prev[l]);
        return prev;
      }, {});
      clone.store = new ResourceStore(clonedData, mergedOptions);
      clone.services.resourceStore = clone.store;
    }
    clone.translator = new Translator(clone.services, mergedOptions);
    clone.translator.on("*", (event, ...args) => {
      clone.emit(event, ...args);
    });
    clone.init(mergedOptions, callback);
    clone.translator.options = mergedOptions;
    clone.translator.backendConnector.services.utils = {
      hasLoadedNamespace: clone.hasLoadedNamespace.bind(clone)
    };
    return clone;
  }
  toJSON() {
    return {
      options: this.options,
      store: this.store,
      language: this.language,
      languages: this.languages,
      resolvedLanguage: this.resolvedLanguage
    };
  }
}
const instance = I18n.createInstance();
instance.createInstance;
instance.dir;
instance.init;
instance.loadResources;
instance.reloadResources;
instance.use;
instance.changeLanguage;
instance.getFixedT;
instance.t;
instance.exists;
instance.setDefaultNamespace;
instance.hasLoadedNamespace;
instance.loadNamespaces;
instance.loadLanguages;
const initReactI18next = {
  type: "3rdParty",
  init(instance2) {
    setDefaults(instance2.options.react);
    setI18n(instance2);
  }
};
function I18nextProvider({
  i18n,
  defaultNS,
  children
}) {
  const value = reactExports.useMemo(() => ({
    i18n,
    defaultNS
  }), [i18n, defaultNS]);
  return reactExports.createElement(I18nContext.Provider, {
    value
  }, children);
}
const LOCALE_CONFIG = {
  de: {
    nativeName: "Deutsch",
    detect: ["de"]
  },
  en: {
    nativeName: "English",
    detect: ["en"]
  },
  es: {
    nativeName: "Español",
    detect: ["es"]
  },
  fr: {
    nativeName: "Français",
    detect: ["fr"]
  },
  id: {
    nativeName: "Bahasa Indonesia",
    detect: ["id"]
  },
  jp: {
    nativeName: "日本語",
    detect: ["ja"]
    // Browser uses 'ja', we use 'jp'
  },
  ko: {
    nativeName: "한국어",
    detect: ["ko"]
  },
  pt: {
    nativeName: "Português",
    detect: ["pt"]
  },
  ru: {
    nativeName: "Русский",
    detect: ["ru"]
  },
  th: {
    nativeName: "ภาษาไทย",
    detect: ["th"]
  },
  tr: {
    nativeName: "Türkçe",
    detect: ["tr"]
  },
  vi: {
    nativeName: "Tiếng Việt",
    detect: ["vi"]
  },
  "zh-CN": {
    nativeName: "简体中文",
    detect: ["zh-cn", "zh-hans"]
  },
  "zh-TW": {
    nativeName: "繁體中文",
    detect: ["zh-tw", "zh-hant"]
  }
};
const LOCALES = Object.keys(LOCALE_CONFIG);
function detectBrowserLocale() {
  if (typeof navigator === "undefined") return "en";
  try {
    const navLang = navigator.language.toLowerCase();
    for (const [locale, config] of Object.entries(LOCALE_CONFIG)) {
      if (config.detect.some((prefix) => navLang.startsWith(prefix))) {
        return locale;
      }
    }
  } catch {
  }
  return "en";
}
function isValidLocale(value) {
  return typeof value === "string" && LOCALES.includes(value);
}
const STORAGE_KEY = "flowith-locale";
const sendToMain = (locale) => {
  try {
    window.localeAPI?.setLocale(locale);
  } catch {
  }
};
const persist = (locale) => {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
  }
};
const getInitial = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isValidLocale(saved)) {
      return saved;
    }
  } catch {
  }
  return detectBrowserLocale();
};
const useLocaleStore = create((set) => ({
  locale: getInitial(),
  setLocale: (locale) => {
    set({ locale });
    persist(locale);
    sendToMain(locale);
  }
}));
const common$d = { "ok": "OK", "cancel": "Abbrechen", "start": "Starten", "delete": "Löschen", "close": "Schließen", "save": "Speichern", "search": "Suchen", "loading": "Wird geladen", "pressEscToClose": "ESC zum Schließen drücken", "copyUrl": "URL kopieren", "copied": "Kopiert", "copy": "Kopieren", "expand": "Erweitern", "collapse": "Einklappen", "openFlowithWebsite": "Flowith-Website öffnen", "openAgentGuide": "Agent-Leitfaden öffnen", "reward": "Belohnung", "closeWindow": "Fenster schließen", "minimizeWindow": "Fenster minimieren", "toggleFullscreen": "Vollbild umschalten", "saveEnter": "Speichern (Eingabe)", "cancelEsc": "Abbrechen (Esc)" };
const nav$d = { "tasks": "Aufgaben", "flows": "Flows", "bookmarks": "Lesezeichen", "intelligence": "Intelligenz", "guide": "Anleitung" };
const tray$d = { "newTask": "Neue Aufgabe", "recentTasks": "Letzte Aufgaben", "viewMore": "Mehr anzeigen", "showMainWindow": "Hauptfenster anzeigen", "hideMainWindow": "Hauptfenster ausblenden", "quit": "Beenden" };
const actions$d = { "resume": "Fortsetzen", "pause": "Pausieren", "cancel": "Abbrechen", "delete": "Löschen", "archive": "Archivieren", "showInFolder": "Im Ordner anzeigen", "viewDetails": "Details anzeigen", "openFile": "Datei öffnen" };
const status$d = { "inProgress": "In Bearbeitung", "completed": "Abgeschlossen", "archive": "Archiv", "paused": "Pausiert", "failed": "Fehlgeschlagen", "cancelled": "Abgebrochen", "running": "Wird ausgeführt", "wrappingUp": "Wird abgeschlossen..." };
const time$d = { "today": "Heute", "yesterday": "Gestern", "earlier": "Früher", "justNow": "gerade eben", "minutesAgo": "vor {{count}} Minute", "minutesAgo_other": "vor {{count}} Minuten", "hoursAgo": "vor {{count}} Stunde", "hoursAgo_other": "vor {{count}} Stunden", "daysAgo": "vor {{count}} Tag", "daysAgo_other": "vor {{count}} Tagen" };
const downloads$d = { "title": "Downloads", "all": "Alle", "inProgress": "In Bearbeitung", "completed": "Abgeschlossen", "noDownloads": "Keine Downloads", "failedToLoad": "Downloads konnten nicht geladen werden", "deleteConfirmMessage": "Möchten Sie die ausgewählten Downloads wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.", "loadingDownloads": "Downloads werden geladen...", "searchPlaceholder": "Downloads durchsuchen...", "selectAll": "Alle auswählen", "deselectAll": "Auswahl aufheben", "deleteSelected": "Auswahl löschen ({{count}})", "clearAll": "Alle löschen", "noMatchingDownloads": "Keine übereinstimmenden Downloads gefunden", "noDownloadsYet": "Noch keine Downloads", "confirmDelete": "Löschen bestätigen", "cancel": "Abbrechen", "delete": "Löschen" };
const history$d = { "title": "Verlauf", "allTime": "Gesamter Zeitraum", "clearHistory": "Verlauf löschen", "removeItem": "Element entfernen", "failedToLoad": "Verlauf konnte nicht geladen werden", "failedToClear": "Verlauf konnte nicht gelöscht werden", "searchPlaceholder": "Verlauf durchsuchen...", "selectAll": "Alle auswählen", "deselectAll": "Auswahl aufheben", "deleteSelected": "Auswahl löschen ({{count}})", "clearAll": "Alle löschen", "noMatchingHistory": "Kein übereinstimmender Verlauf gefunden", "noHistoryYet": "Noch kein Verlauf vorhanden", "confirmDelete": "Löschen bestätigen", "deleteConfirmMessage": "Möchten Sie den ausgewählten Verlauf wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.", "cancel": "Abbrechen", "delete": "Löschen", "today": "Heute", "yesterday": "Gestern", "earlier": "Früher", "untitled": "Ohne Titel", "visitedTimes": "{{count}} Mal besucht", "openInNewTab": "In neuem Tab öffnen", "loading": "Verlauf wird geladen...", "timePeriod": "Zeitraum", "timeRangeAll": "Alle", "timeRangeAllDesc": "Gesamter Browserverlauf", "timeRangeToday": "Heute", "timeRangeTodayDesc": "Gesamter Verlauf von heute", "timeRangeYesterday": "Gestern", "timeRangeYesterdayDesc": "Verlauf von gestern", "timeRangeLast7Days": "Letzte 7 Tage", "timeRangeLast7DaysDesc": "Verlauf der letzten Woche", "timeRangeThisMonth": "Dieser Monat", "timeRangeThisMonthDesc": "Verlauf dieses Monats", "timeRangeLastMonth": "Letzter Monat", "timeRangeLastMonthDesc": "Verlauf des letzten Monats", "deleteTimeRange": "{{range}} löschen", "last7days": "Letzte 7 Tage", "thisMonth": "Dieser Monat", "lastMonth": "Letzter Monat" };
const invitationCodes$d = { "title": "Meine Einladungscodes", "availableToShare": "{{unused}} von {{total}} verfügbar", "loading": "Ihre Codes werden geladen...", "noCodesYet": "Noch keine Einladungscodes vorhanden.", "noCodesFound": "Keine Einladungscodes gefunden", "failedToLoad": "Einladungscodes konnten nicht geladen werden", "useCodeHint": "Verwenden Sie einen Einladungscode, um Ihre eigenen Codes zu erhalten!", "shareHint": "Teilen Sie diese Codes mit Freunden, um sie zu FlowithOS einzuladen", "used": "Verwendet" };
const tasks$d = { "title": "Aufgabe", "description": "Hier speichern Sie alle Ihre Aufgaben", "transformToPreset": "In Voreinstellung umwandeln", "noTasks": "Keine Aufgaben", "archiveEmpty": "Archiv ist leer" };
const flows$d = { "title": "Flow", "description": "Zeigt alle Ihre Canvas", "newFlow": "Neuer Flow", "rename": "Umbenennen", "leave": "Verlassen", "noFlows": "Keine Flows", "signInToViewFlows": "Melden Sie sich an, um Ihre Flows zu sehen", "pin": "Anheften", "unpin": "Loslösen" };
const bookmarks$d = { "title": "Lesezeichen", "description": "Speichern Sie alle Tabs, die Ihnen gefallen", "bookmark": "Lesezeichen", "addNewCollection": "Neue Sammlung hinzufügen", "loadingBookmarks": "Lesezeichen werden geladen...", "noMatchingBookmarks": "Keine übereinstimmenden Lesezeichen", "noBookmarksYet": "Noch keine Lesezeichen vorhanden", "importFromBrowsers": "Aus Browsern importieren", "detectingBrowsers": "Browser werden erkannt...", "bookmarksCount": "Lesezeichen", "deleteCollection": "Sammlung löschen", "deleteCollectionConfirm": "Möchten Sie diese Sammlung wirklich löschen?", "newCollection": "Neue Sammlung", "enterCollectionName": "Geben Sie einen Namen für die neue Sammlung ein", "create": "Erstellen", "collectionName": "Sammlungsname", "saveEnter": "Speichern (Eingabe)", "cancelEsc": "Abbrechen (Esc)", "renameFolder": "Ordner umbenennen", "renameBookmark": "Lesezeichen umbenennen", "deleteFolder": "Ordner löschen", "deleteBookmark": "Lesezeichen löschen" };
const conversations$d = { "title": "Unterhaltungen", "noConversations": "Noch keine Unterhaltungen vorhanden" };
const intelligence$d = { "title": "Intelligenz", "description": "Erweitern Sie Ihren Agent mit Fähigkeiten und Gedächtnis", "knowledgeBase": "Wissensdatenbank", "memory": "Gedächtnis", "skill": "Fähigkeit", "createNewSkill": "Neue Fähigkeit erstellen", "createNewMemory": "Neues Gedächtnis erstellen", "loading": "Wird geladen...", "noSkills": "Keine Fähigkeiten", "noMemories": "Keine Gedächtnisse", "readOnly": "Schreibgeschützt", "readOnlyMessage": "Diese Systemfähigkeit verbessert die Leistung Ihres Agents. Sie kann nicht direkt bearbeitet werden, aber Sie können sie duplizieren und eine eigene Version erstellen. Achtung: Änderungen werden nicht gespeichert.", "readOnlyToast": "Diese Systemfähigkeit kann nicht direkt bearbeitet werden. Duplizieren Sie sie, um eine bearbeitbare Version zu erstellen.", "open": "Öffnen", "kbComingSoon": "Die Unterstützung für die Flowith-Wissensdatenbank wird bald verfügbar sein.", "system": "System", "learnFromUser": "Benutzer", "systemPresetReadOnly": "Systemvoreinstellung (schreibgeschützt)", "actions": "Aktionen", "rename": "Umbenennen", "duplicate": "Duplizieren…", "info": "Info", "saving": "Wird gespeichert...", "fileInfo": "Dateiinformationen", "fileName": "Name", "fileSize": "Größe", "fileCreated": "Erstellt", "fileModified": "Geändert", "fileType": "Typ", "fileLocation": "Speicherort", "copyPath": "Pfad kopieren", "empowerOS": "Lehrmodus", "teachMakesBetter": "Lehren macht das OS besser", "teachMode": "Lehrmodus", "teachModeDescription": "Im Lehrmodus zeichnen Sie Ihre Web-Workflows auf, während der OS Agent beobachtet, lernt und Ihre Aktionen in wiederverwendbare Fähigkeiten und Know-how umwandelt.", "teachModeGoalLabel": "Aufgabenziel (optional)", "teachModeGoalPlaceholder": "Geben Sie mehr Kontext zum Lernen des OS an – dies kann ein konkretes Aufgabenziel oder andere relevante Informationen sein.", "teachModeTaskDisabled": "Während des Lehrmodus können keine neuen Aufgaben erstellt werden.", "empowering": "Lehren", "empoweringDescription": "Der OS Agent beobachtet und lernt, während Sie vorführen", "yourGoal": "Aufgabenziel", "preset": "Voreinstellung", "generatedSkills": "Generierte Fähigkeiten", "showLess": "Ausblenden", "showMore": "Mehr anzeigen", "osHasLearned": "Das OS hat gelernt", "complete": "Abschließen", "interactionsPlaceholder": "Ihre Interaktionen erscheinen hier während der Demonstration.", "done": "Fertig", "generatingGuidance": "Anleitung wird generiert...", "summarizingInteraction": "Wir fassen jede Interaktion zusammen und bereiten eine wiederverwendbare Fähigkeit vor.", "skillSaved": "Fähigkeit gespeichert", "goal": "Ziel", "steps": "Schritte", "events": "Ereignisse", "guidanceSavedSuccessfully": "Anleitung erfolgreich gespeichert.", "openGuidanceInComposer": "Anleitung in Composer öffnen", "recordAnotherWorkflow": "Weiteren Workflow aufzeichnen", "dismissSummary": "Zusammenfassung schließen", "saveAndTest": "Speichern und testen", "learning": "Lernt...", "teachModeError": "Der Lehrmodus ist auf ein Problem gestoßen", "errorDetails": "Fehlerdetails", "checkNetworkConnection": "Überprüfen Sie Ihre Netzwerkverbindung und versuchen Sie erneut, den Lehrmodus zu starten.", "tryAgain": "Erneut versuchen", "resetState": "Zustand zurücksetzen", "completeConfirmTitle": "OS-Training abgeschlossen", "completeConfirmMessage": "Sie können in der untenstehenden Checkliste das gewünschte Ergebnis auswählen.", "capturedEvents": "Erfasste Ereignisse", "confirmAndGenerate": "Generieren", "generating": "Wird generiert", "promptSummary": "Prompt-Zusammenfassung", "saveToPreset": "In Voreinstellung speichern", "skillHostname": "Fähigkeit: {{hostname}}", "saveToSkill": "In Fähigkeit speichern", "selectAll": "Alle auswählen", "discard": "Verwerfen", "confirmDiscard": "Ja, verwerfen", "tutorial": { "title": "Willkommen im Lehrmodus", "next": "Weiter", "gotIt": "Verstanden", "guideLabel": "Lehrmodus-Leitfaden", "page1": { "title": "Was sind Fähigkeiten und Lehrmodus?", "description": "Fähigkeiten sammeln wiederverwendbares Know-how, das jeder Agent nutzen kann. Jede Fähigkeit ist ein praktischer Leitfaden (ggf. mit Code-Snippets) zu einer Webanwendung, einem Workflow oder Interaktionsmuster. Sie verbessern die Leistung des OS auf bestimmten Websites oder bei bestimmten Aufgaben.\n\nDer Lehrmodus ermöglicht es Ihnen, das OS zu trainieren, indem Sie ihm Ihre Routinen zeigen. Diese werden als <strong>Fähigkeiten und Voreinstellungen</strong> gespeichert und können beliebig wiederverwendet werden." }, "page2": { "title": "Wie startet man den Lehrmodus?", "description": "Klicken Sie auf '<strong>Lehrmodus</strong>' im '<strong>Intelligenz-Panel</strong>' links. Definieren Sie zuerst ein <strong>Ziel</strong>, das dem OS Orientierung gibt und Ihre Demonstration strukturiert." }, "page3": { "title": "Wie lernt das OS Ihre Bewegungen?", "description": "Das OS beobachtet Ihre Aktionen und verfolgt Ihren Cursor in Echtzeit. Jeder Schritt erscheint im linken Panel. Sie können jederzeit pausieren und dann auf '<strong>Stopp</strong>' (rotes Symbol) klicken, wenn Sie fertig sind." }, "page4": { "title": "Was sind die Lernergebnisse des OS?", "description": "Am Ende wählen Sie die Art des zu generierenden Ergebnisses. Üblicherweise werden eine Voreinstellung und Fähigkeiten für Routineaufgaben erstellt. Sie können diese in <strong>Composer</strong> prüfen und bearbeiten oder jederzeit in '<strong>Vom Benutzer lernen</strong>' (Intelligenz-Panel) abrufen." } }, "skillTooltip": "Sie können die Fähigkeit unten überarbeiten oder bearbeiten", "skillSectionTooltip": "Jede Fähigkeit wird nach der verwendeten Website benannt. Neue Fähigkeiten erscheinen als Abschnitte in der entsprechenden Markdown-Datei." };
const sidebar$d = { "goBack": "Zurück", "goForward": "Vorwärts", "lockSidebar": "Seitenleiste sperren", "unlockSidebar": "Seitenleiste entsperren", "searchOrEnterAddress": "Suchen oder Adresse eingeben", "reload": "Neu laden" };
const tabs$d = { "openNewBlankPage": "Neue leere Seite öffnen", "newTab": "Neuer Tab", "terminal": "Terminal", "pauseAgent": "Agent pausieren", "resumeAgent": "Agent fortsetzen" };
const userMenu$d = { "upgrade": "Upgrade", "creditsLeft": "übrig", "clickToManageSubscription": "Klicken Sie, um das Abonnement zu verwalten", "theme": "Design", "lightMode": "Heller Modus", "darkMode": "Dunkler Modus", "systemMode": "Systemmodus", "language": "Sprache", "settings": "Einstellungen", "invitationCode": "Einladungscode", "checkUpdates": "Nach Updates suchen", "contactUs": "Kontaktieren Sie uns", "signOut": "Abmelden", "openUserMenu": "Benutzermenü öffnen", "signIn": "Anmelden" };
const settings$d = { "title": "Einstellungen", "history": "Verlauf", "downloads": "Downloads", "adblock": "Werbeblocker", "language": "Sprache", "languageDescription": "Wählen Sie Ihre bevorzugte Sprache für die Benutzeroberfläche. Änderungen werden sofort wirksam.", "softwareUpdate": "Software-Updates" };
const updateSettings$d = { "description": "Flowith OS hält Sie mit sicheren, zuverlässigen Updates auf dem neuesten Stand. Wählen Sie Ihren Kanal: Stable für Zuverlässigkeit, Beta für frühe Funktionen oder Alpha für neueste Builds. Sie können nur zu Kanälen wechseln, auf die Ihr Konto Zugriff hat.", "currentVersion": "Aktuelle Version: {{version}}", "loadError": "Laden fehlgeschlagen", "warning": "Warnung: Beta/Alpha-Builds können instabil sein und Ihre Arbeit beeinträchtigen. Verwenden Sie Stable für die Produktion.", "channel": { "label": "Update-Kanal", "hint": "Nur Kanäle, auf die Sie Zugriff haben, können ausgewählt werden.", "disabledHint": "Kanalwechsel während eines Updates nicht möglich", "options": { "stable": "Stable", "beta": "Beta", "alpha": "Alpha" } }, "actions": { "title": "Manuelle Prüfung", "hint": "Jetzt nach verfügbaren Updates suchen.", "check": "Nach Updates suchen" }, "status": { "noUpdate": "Sie sind auf dem neuesten Stand.", "hasUpdate": "Neue Version verfügbar.", "error": "Update-Prüfung fehlgeschlagen." }, "tips": { "title": "Tipps", "default": "Standardmäßig erhalten Sie Benachrichtigungen für Stable-Updates. In Early Access können Pre-Release-Builds für Produktionsarbeiten instabil sein.", "warningTitle": "Eine Warnung: Nightly-Updates werden automatisch angewendet", "warningBody": "Nightly-Builds laden und installieren Updates automatisch im Hintergrund, wenn Cursor geschlossen wird." } };
const adblock$d = { "title": "Werbeblocker", "description": "Blockieren Sie aufdringliche Werbung und Tracker, filtern Sie Seitenrauschen und ermöglichen Sie Neo OS Agent, Informationen präziser zu verstehen und zu extrahieren, während Sie Ihre Privatsphäre schützen.", "enable": "Werbeblocker aktivieren", "enableDescription": "Werbung auf allen Websites automatisch blockieren", "statusActive": "Aktiv - Werbung wird blockiert", "statusInactive": "Inaktiv - Werbung wird nicht blockiert", "adsBlocked": "Werbeanzeigen blockiert", "networkBlocked": "Netzwerkanfragen", "cosmeticBlocked": "Elemente Verborgen", "filterRules": "Filterregeln", "activeRules": "aktive Regeln" };
const blank$d = { "openNewPage": "Neue leere Seite öffnen", "selectBackground": "Hintergrund auswählen", "isAwake": "ist wach", "osIsAwake": "Das OS ist wach", "osGuideline": "OS-Leitfaden", "osGuidelineDescription": "Schnellstart zu unserem OS Agent - Architektur, Modi und alles, was er kann.", "intelligence": "Lehrmodus", "intelligenceDescription": "Trainieren Sie den OS Agent mit Ihren Workflows zur automatischen Wiederverwendung", "inviteAndEarn": "Einladen und verdienen", "tagline": "Mit einem aktiven Gedächtnis, das sich mit jeder Aktion weiterentwickelt und Sie wirklich versteht.", "taskPreset": "Aufgabenvoreinstellung", "credits": "+{{amount}} Credits", "addPreset": "Neue Voreinstellung hinzufügen", "editPreset": "Voreinstellung bearbeiten", "deletePreset": "Voreinstellung löschen", "removeFromHistory": "Aus Verlauf entfernen", "previousPreset": "Vorherige Voreinstellung", "nextPreset": "Nächste Voreinstellung", "previousPresets": "Vorherige Voreinstellungen", "nextPresets": "Nächste Voreinstellungen", "createPreset": "Voreinstellung erstellen", "presetName": "Voreinstellungsname", "instruction": "Anweisung", "presetNamePlaceholderCreate": "z.B. Wochenbericht, Code-Review, Datenanalyse...", "presetNamePlaceholderEdit": "Voreinstellungsname eingeben...", "instructionPlaceholderCreate": 'Beschreiben Sie, was das OS tun soll...\nz.B. "Analysiere die Verkaufsdaten dieser Woche und erstelle einen Zusammenfassungsbericht"', "instructionPlaceholderEdit": "Aufgabenanweisung aktualisieren...", "colorBlue": "Blau", "colorGreen": "Grün", "colorYellow": "Gelb", "colorRed": "Rot", "selectColor": "Farbe {{color}} auswählen", "creating": "Wird erstellt...", "updating": "Wird aktualisiert...", "create": "Erstellen", "update": "Aktualisieren", "smartInputPlaceholder": "Navigieren, suchen oder Neo überlassen...", "processing": "Wird verarbeitet…", "navigate": "Navigieren", "navigateDescription": "Diese Adresse im aktuellen Tab öffnen", "searchGoogle": "Google-Suche", "searchGoogleDescription": "Mit Google suchen", "runTask": "Aufgabe ausführen", "runTaskDescription": "Mit Neo Agent ausführen", "createCanvas": "Im Canvas fragen", "createCanvasDescription": "Flo Canvas mit diesem Prompt öffnen" };
const agentGuide$d = { "title": "Agent-Leitfaden", "subtitle": "Visueller Schnellstart für den OS Agent: Architektur, Modi und alle Funktionen.", "capabilities": { "heading": "Fähigkeiten", "navigate": { "title": "Navigieren", "desc": "Seiten öffnen, vor/zurück gehen" }, "click": { "title": "Klicken", "desc": "Mit Buttons und Links interagieren" }, "type": { "title": "Eingeben", "desc": "Eingabefelder und Formulare ausfüllen" }, "keys": { "title": "Tasten", "desc": "Enter, Escape, Tastenkombinationen" }, "scroll": { "title": "Scrollen", "desc": "Durch lange Seiten bewegen" }, "tabs": { "title": "Tabs", "desc": "Markieren, wechseln, schließen" }, "files": { "title": "Dateien", "desc": "Schreiben, lesen, herunterladen" }, "skills": { "title": "Fähigkeiten", "desc": "Gemeinsames Know-how" }, "memories": { "title": "Gedächtnisse", "desc": "Langzeitpräferenzen" }, "upload": { "title": "Hochladen", "desc": "Dateien an Seiten senden" }, "ask": { "title": "Fragen", "desc": "Schnelle Benutzerbestätigungen" }, "onlineSearch": { "title": "Online-Suche", "desc": "Schnelle Web-Abfrage" }, "extract": { "title": "Extrahieren", "desc": "Strukturierte Infos abrufen" }, "deepThink": { "title": "Tiefes Denken", "desc": "Strukturierte Analyse" }, "vision": { "title": "Vision", "desc": "Präzise Nicht-DOM-Operationen" }, "shell": { "title": "Shell", "desc": "Befehle ausführen (wenn verfügbar)" }, "report": { "title": "Bericht", "desc": "Abschließen und zusammenfassen" } }, "benchmark": { "title": "Online‑Mind2Web-Benchmark", "subtitle": "Flowith Neo AgentOS dominiert das Feld mit ", "subtitleHighlight": "nahezu perfekter", "subtitleEnd": " Leistung.", "openai": "OpenAI Operator", "gemini": "Gemini 2.5 Computer Use", "flowith": "Flowith Neo OS", "average": "Durchschnitt", "easy": "Einfach", "medium": "Mittel", "hard": "Schwer" }, "skillsMemories": { "heading": "Fähigkeiten & Gedächtnisse", "description": "Wiederverwendbare Playbooks und langfristiger Kontext, auf die Neo im Pro-Modus automatisch verweist.", "markdownTag": "Markdown .md", "autoIndexedTag": "Auto-indiziert", "citationsTag": "Zitate in Logs", "howNeoUses": "Wie Neo sie nutzt: Vor jedem Schritt im Pro-Modus prüft Neo auf relevante Fähigkeiten und Gedächtnisse, fügt sie in den Reasoning-Kontext ein und wendet Anweisungen oder Präferenzen automatisch an.", "skillsTitle": "Fähigkeiten", "skillsTag": "Geteilt", "skillsDesc": "Speichern Sie wiederverwendbares Know-how, das jeder Agent anwenden kann. Jede Fähigkeit ist ein kurzer Leitfaden zu einem Tool, Workflow oder Muster.", "skillsProcedures": "Ideal für: Abläufe", "skillsFormat": "Format: Markdown", "skillsScenario": "Alltägliches Szenario", "skillsScenarioTitle": "Medien konvertieren und teilen", "skillsStep1": 'Sie sagen: "Wandle diese 20 Bilder in ein kompaktes PDF um."', "skillsStep2": "Neo folgt der Fähigkeit zum Hochladen, Konvertieren, Warten auf Fertigstellung und Speichern der Datei.", "skillsOutcome": "Ergebnis: ein teilbares PDF mit Download-Link in den Logs.", "memoriesTitle": "Gedächtnisse", "memoriesTag": "Persönlich", "memoriesDesc": "Erfassen Sie Ihre Präferenzen, Ihr Profil und Domänenfakten. Neo verweist bei Entscheidungen auf relevante Elemente und zitiert sie in den Logs.", "memoriesStyle": "Ideal für: Stil, Regeln", "memoriesPrivate": "Standardmäßig privat", "memoriesScenario": "Alltägliches Szenario", "memoriesScenarioTitle": "Schreibstimme & Ton", "memoriesStep1": "Sie mögen prägnante, freundliche Texte mit optimistischem Ton.", "memoriesStep2": "Neo wendet dies automatisch in E-Mails, Berichten und Social Posts an.", "memoriesOutcome": "Ergebnis: konsistente Markenstimme ohne wiederholte Anweisungen.", "taskFilesTitle": "Aufgabendateien", "taskFilesTag": "Pro Aufgabe", "taskFilesDesc": "Temporäre Dateien, die während der aktuellen Aufgabe erstellt werden. Sie erleichtern Tool-I/O und Zwischenergebnisse und werden nicht automatisch mit anderen Aufgaben geteilt.", "taskFilesEphemeral": "Ephemer", "taskFilesReadable": "Von Tools lesbar", "taskFilesScenario": "Alltägliches Szenario", "taskFilesScenarioTitle": "Reisepreis-Tracker", "taskFilesStep1": "Neo extrahiert Flugtabellen und speichert sie als CSV für diese Aufgabe.", "taskFilesStep2": "Vergleicht heutige Tarife mit gestrigen und hebt Änderungen hervor.", "taskFilesOutcome": "Ergebnis: eine übersichtliche Zusammenfassung und ein herunterladbares CSV." }, "system": { "title": "Neo OS - der intelligenteste Browser-Agent für Sie", "tagline": "Selbstentwickelnd × Gedächtnis & Fähigkeit × Geschwindigkeit & Intelligenz", "selfEvolving": "Selbstentwickelnd", "intelligence": "Intelligenz", "contextImprovement": "Kontext-Verbesserung", "contextDesc": "Reflektierender Agent verfeinert Kontext in Echtzeit durch das Fähigkeitensystem", "onlineRL": "Online-RL", "onlineRLDesc": "Periodische Updates im Einklang mit Agent-Verhalten", "intelligentMemory": "Intelligentes Gedächtnis", "architecture": "Architektur", "dualLayer": "Zweischicht-System", "dualLayerDesc": "Kurzzeit-Puffer + langfristiges episodisches Gedächtnis", "knowledgeTransfer": "Wissenstransfer", "knowledgeTransferDesc": "Lernen über Aufgaben hinweg beibehalten, wiederverwenden und übertragen", "highPerformance": "Hohe Leistung", "infrastructure": "Infrastruktur", "executionKernel": "Ausführungskernel", "executionKernelDesc": "Parallele Orchestrierung & dynamische Planung", "speedCaching": "Geschwindigkeits-Caching", "speedCachingDesc": "Millisekundenantwort mit Echtzeit-Ausführung", "speedIndicator": "~1ms", "summary": "Entwickelnd · Persistent · Schnell" }, "arch": { "heading": "Architektur", "subtitle": "Agent-zentriertes OS: CPU (Planer) + Speicher/Dateisystem + Fähigkeiten + E/A", "agentCentricNote": "FlowithOS ist für Agents konzipiert.", "osShell": "OS Shell", "agentCore": "Agent-Kern", "plannerExecutor": "Planer · Executor", "browserTabs": "Browser-Tabs", "domCanvas": "DOM · Canvas", "filesMemoriesSkills": "Dateien · Gedächtnisse · Fähigkeiten", "domPageTabs": "DOM · Seite · Tabs", "clickTypeScroll": "Klicken · Eingeben · Scrollen", "visionNonDOM": "Vision · Nicht-DOM-Ops", "captchaDrag": "CAPTCHA · Ziehen", "onlineSearchThinking": "Online-Suche · Tiefes Denken", "googleAnalysis": "Google · Analyse", "askUserReport": "Benutzer fragen · Bericht", "choicesDoneReport": "choices · done_and_report", "skillsApps": "Fähigkeiten (Apps)", "skillsKinds": "System · Benutzer · Geteilt", "memory": "Gedächtnis", "memoryKinds": "Kurzzeit · Langzeit", "filesystem": "Dateisystem", "filesystemKinds": "Aufgabendateien · Assets · Logs", "cpuTitle": "CPU — Planungs-Agent", "cpuSub": "Planer · Executor · Reflektor", "planRow": "Planen → Zerlegen → Routen", "execRow": "Ausführen → Beobachten → Reflektieren", "ioTitle": "E/A-Fähigkeiten", "browserUse": "Browser-Nutzung", "browserUseDesc": "DOM · Tabs · Vision · CAPTCHA", "terminalUse": "Terminal-Nutzung", "terminalUseDesc": "Shell · Tools · Skripte", "scriptUse": "Skript-Nutzung", "scriptUseDesc": "Python · JS · Workers", "osVsHumanTitle": "Agent OS vs. menschenzentriertes OS", "osVsHuman1": "Apps werden zu Fähigkeiten: für Agents lesbar konzipiert, nicht UIs", "osVsHuman2": "CPU plant/führt aus via E/A; Benutzer überwacht auf Aufgabenebene", "osVsHuman3": "Gedächtnis bleibt über Aufgaben bestehen; Dateisystem unterstützt Tool-E/A" }, "tips": { "heading": "Tipps", "beta": "FlowithOS befindet sich derzeit in der Beta-Phase; sowohl das Produkt als auch Agent Neo werden kontinuierlich aktualisiert. Bleiben Sie auf dem Laufenden für die neuesten Updates.", "improving": "Die Fähigkeiten von Agent Neo OS verbessern sich täglich, Sie können versuchen, die neuen Fähigkeiten zur Erledigung Ihrer Aufgaben zu nutzen." } };
const reward$d = { "helloWorld": "Hello World", "helloWorldDesc": 'Dies ist Ihr "Hello World"-Moment in der neuen Ära.<br />Seien Sie einer der Ersten, die das Agent-Internet in der Menschheitsgeschichte prägen.', "get2000Credits": "Fordern Sie Ihre 2.000 Bonus-Credits an", "equivalent7Days": "Und automatisieren Sie Ihre Social-Media-Aktivitäten für 7 Tage.", "shareInstructions": `Nach der Aktivierung stellen Sie Ihren persönlichen Agenten der Welt vor.<br />NeoOS wird automatisch eine "Hello World"-Nachricht auf X für Sie erstellen und veröffentlichen<br />genau wie alles, was es später für Sie tun kann.<br /><span style='display: block; height: 8px;'></span>Lehnen Sie sich zurück und sehen Sie zu.`, "osComing": "Das OS kommt", "awakeOS": "OS aktivieren", "page2Title": "Einladen und verdienen", "page2Description1": "Eine großartige Reise wird mit Begleitern besser.", "page2Description2": "Für jeden Freund, der beitritt, erhalten Sie", "page2Description3": "Credits, um Ihre eigenen Gedanken zu fördern.", "retry": "Erneut versuchen", "noCodesYet": "Noch keine Einladungscodes", "activated": "Aktiviert", "neoStarting": "Neo startet die automatische Freigabe-Aufgabe...", "failed": "Fehlgeschlagen", "unknownError": "Unbekannter Fehler", "errorRetry": "Fehler aufgetreten, bitte erneut versuchen", "unexpectedResponse": "Unerwartete Antwort vom Server", "failedToLoadCodes": "Einladungscodes konnten nicht geladen werden", "congratsCredits": "Herzlichen Glückwunsch! +{{amount}} Credits", "rewardUnlocked": "Belohnung fürs Teilen freigeschaltet" };
const agentWidget$d = { "modes": { "fast": { "label": "Schneller Modus", "description": "Aufgaben so schnell wie möglich erledigen, verwendet keine Fähigkeiten und Gedächtnisse.", "short": "Schnell", "modeDescription": "Schnellere Aktionen, weniger Details" }, "pro": { "label": "Pro-Modus", "description": "Höchste Qualität: Schritt-für-Schritt-Visualanalyse mit tiefem Reasoning. Verweist bei Bedarf auf Fähigkeiten und Gedächtnisse.", "short": "Pro", "modeDescription": "Ausgewogen, Neo entscheiden lassen" } }, "minimize": "Minimieren", "placeholder": "Bitten Sie den Neo OS Agent...", "changeModeTooltip": "Ändern Sie den Modus, um das Verhalten des Agents anzupassen", "preset": "Voreinstellung", "selectPresetTooltip": "Wählen Sie eine Voreinstellung aus", "addNewPreset": "Neue Voreinstellung hinzufügen", "agentHistoryTooltip": "Aktionsverlauf des Agents", "createPreset": "Voreinstellung erstellen", "presetName": "Voreinstellungsname", "instruction": "Anweisung", "upload": "Hochladen", "newTask": "Neue Aufgabe", "draft": "Entwurf", "copyPrompt": "Prompt kopieren", "showMore": "Mehr anzeigen", "showLess": "Weniger anzeigen", "agentIsWorking": "Agent arbeitet", "agentIsWrappingUp": "Agent schließt ab", "completed": "Abgeschlossen", "paused": "Pausiert", "created": "Erstellt", "selectTask": "Aufgabe auswählen", "unpin": "Lösen", "pinToRight": "Rechts anheften", "stepsCount": "Schritte ({{count}})", "files": "Dateien", "filesCount": "Dateien ({{count}})", "noFilesYet": "Noch keine Dateien generiert", "status": { "wrappingUp": "Agent schließt ab...", "thinking": "Agent denkt nach...", "wrappingUpAction": "Aktuelle Aktion wird abgeschlossen..." }, "actions": { "markedTab": "Markierter Tab", "openRelatedTab": "Zugehörigen Tab öffnen (in Arbeit)", "open": "Öffnen", "openTab": "Tab öffnen", "showInFolder": "Im Ordner anzeigen", "preview": "Vorschau", "followUpPrefix": "Sie", "actionsHeader": "Aktionen" }, "controls": { "rerun": "Erneut ausführen (in Arbeit)", "pause": "Pause", "pauseAndArchive": "Pausieren und archivieren", "resume": "Fortsetzen", "wrappingUpDisabled": "Wird abgeschlossen..." }, "input": { "sending": "Wird gesendet...", "adjustTaskPlaceholder": "Senden Sie eine Nachricht, um die Aufgabe für Agent Neo anzupassen..." }, "legacy": { "readOnlyNotice": "Dies ist eine veraltete Aufgabe aus einer früheren Version. Nur-Ansicht-Modus." }, "refunded": { "noFollowUp": "Diese Aufgabe wurde erstattet. Folgenachrichten sind nicht verfügbar." }, "skills": { "matchingSkills": "suche relevante Fähigkeiten…", "scanningSkills": "Neuraler Scan der verfügbaren Fähigkeiten!!!", "scanningMap": "Durchsuche neuronale Fähigkeiten-Karte…" }, "billing": { "creditsDepletedTitle": "Fügen Sie Credits hinzu, um fortzufahren", "creditsDepletedMessage": "Der Agent wurde pausiert, weil Ihre Credits aufgebraucht sind. Fügen Sie Credits hinzu oder aktualisieren Sie die Abrechnung und führen Sie die Aufgabe erneut aus, wenn Sie bereit sind." }, "presetActions": { "editPreset": "Voreinstellung bearbeiten", "deletePreset": "Voreinstellung löschen" }, "feedback": { "success": { "short": "Großartige Arbeit!", "long": "Bisher läuft alles gut, großartige Arbeit!" }, "refund": { "short": "Hoppla, Rückerstattung!", "long": "Hoppla, ich möchte meine Credits zurück!" }, "refundSuccess": { "long": "Super! Ihre Credits wurden zurückerstattet!" }, "modal": { "title": "Credits-Rückerstattung anfordern", "credits": "{{count}} Credits", "description": "Wenn Sie mit dieser Aufgabe nicht zufrieden sind, fordern Sie eine Rückerstattung an und wir erstatten Ihnen sofort alle für diese Aufgabe verwendeten Credits.", "whatGoesWrong": "Was ist schiefgelaufen", "errorMessage": "Entschuldigung, bitte geben Sie mehr Details an", "placeholder": "Beschreiben Sie, was schiefgelaufen ist...", "shareTask": "Diese Aufgabe mit uns teilen", "shareDescription": "Wir werden alle persönlichen Daten aus Ihrer Aufgabe anonymisieren. Durch das Teilen Ihrer Aufgabe mit uns verbessern wir die Leistung unseres Agenten bei ähnlichen Aufgaben in Zukunft.", "upload": "Hochladen", "attachFile": "Datei anhängen", "submit": "Senden", "submitting": "Wird gesendet...", "alreadyRefunded": { "title": "Bereits erstattet", "message": "Diese Aufgabe wurde bereits erstattet. Sie können keine erneute Rückerstattung anfordern." } }, "errors": { "systemError": "Systemfehler. Bitte kontaktieren Sie unser Support-Team.", "networkError": "Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.", "noUsageData": "Nutzungsdaten nicht gefunden. Rückerstattung nicht möglich.", "alreadyRefunded": "Diese Aufgabe wurde bereits erstattet.", "notAuthenticated": "Bitte melden Sie sich an, um eine Rückerstattung anzufordern.", "unknownError": "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.", "validationFailed": "Ihr Grund kann derzeit nicht validiert werden. Bitte versuchen Sie es später erneut.", "invalidReason": "Grund abgelehnt. Bitte beschreiben Sie, was tatsächlich schiefgelaufen ist." }, "confirmation": { "creditsRefunded": "{{count}} Credits erstattet", "title": "Erfolg", "message": "Vielen Dank! Unser Team wird Ihre Aufgabe diagnostizieren und die FlowithOS-Erfahrung verbessern.", "messageNoShare": "Vielen Dank! Unser Team wird weiterhin daran arbeiten, die FlowithOS-Erfahrung zu verbessern." } } };
const gate$d = { "welcome": { "title": "Willkommen bei FlowithOS", "subtitle": "Vom Web zur Welt – FlowithOS verwandelt Ihren Browser in konkrete Werte. Das intelligenteste agentische Betriebssystem.", "features": { "execute": { "title": "Führen Sie jede Aufgabe automatisch aus", "description": "FlowithOS agiert mit menschlicher Intuition und Maschinengeschwindigkeit und führt wiederholt mehrere Aufgaben im Web aus." }, "transform": { "title": "Verwandeln Sie Ideen in Ergebnisse", "description": "Von der Inspiration zu echten Werten – FlowithOS verwandelt große Ideen in konkrete Aktionen, die messbare Ergebnisse liefern." }, "organize": { "title": "Organisieren Sie Assets systematisch", "description": "Von verstreuten Lesezeichen zu strukturierten Playbooks – FlowithOS bietet Ihnen ein robustes System zur Verwaltung, Kuratierung und Skalierung Ihrer digitalen Assets." }, "evolve": { "title": "Entwickeln Sie sich dynamisch weiter", "description": "Mit einem Gedächtnis, das aus jeder Interaktion wächst, entwickelt FlowithOS individuelle Skills – von der Navigation auf komplexen Websites bis zum Verständnis Ihres persönlichen Stils." } }, "letsGo": "Los geht's!" }, "auth": { "createAccount": "Konto erstellen", "signInToFlowith": "Bei Ihrem Flowith-Konto anmelden", "oneAccount": "Ein Konto für alle Flowith-Produkte", "fromAnotherAccount": "Anmelden mit:", "useOwnEmail": "Oder eigene E-Mail verwenden", "email": "E-Mail", "password": "Passwort", "confirmPassword": "Passwort bestätigen", "acceptTerms": "Ich akzeptiere die Nutzungsbedingungen und Datenschutzrichtlinie von FlowithOS", "privacyNote": "Alle Ihre Daten bleiben zu 100 % sicher auf Ihrem Gerät", "alreadyHaveAccount": "Haben Sie bereits ein Flowith-Konto?", "createNewAccount": "Kein Konto? Registrieren", "signUp": "Registrieren", "signIn": "Anmelden", "processing": "Wird verarbeitet...", "verifyEmail": "Verifizieren Sie Ihre E-Mail", "verificationCodeSent": "Wir haben einen 6-stelligen Bestätigungscode an {{email}} gesendet", "enterVerificationCode": "Bestätigungscode eingeben", "verificationCode": "Bestätigungscode", "enterSixDigitCode": "6-stelligen Code eingeben", "backToSignUp": "Zurück zur Registrierung", "verifying": "Wird verifiziert...", "verifyCode": "Code verifizieren", "errors": { "enterEmail": "Bitte geben Sie Ihre E-Mail ein", "enterPassword": "Bitte geben Sie Ihr Passwort ein", "confirmPassword": "Bitte bestätigen Sie Ihr Passwort", "passwordsDoNotMatch": "Passwörter stimmen nicht überein", "acceptTerms": "Bitte akzeptieren Sie die Nutzungsbedingungen und Datenschutzrichtlinie", "authFailed": "Authentifizierung fehlgeschlagen. Bitte versuchen Sie es erneut.", "invalidVerificationCode": "Bitte geben Sie einen gültigen 6-stelligen Bestätigungscode ein", "verificationFailed": "Verifizierung fehlgeschlagen. Bitte versuchen Sie es erneut.", "oauthFailed": "OAuth-Authentifizierung fehlgeschlagen. Bitte versuchen Sie es erneut.", "userAlreadyExists": "Diese E-Mail ist bereits registriert. Bitte " }, "goToLogin": "melden Sie sich an", "signInPrompt": "melden Sie sich an" }, "invitation": { "title": "Die Aktivierung erfordert einen Schlüssel", "subtitle": "Bitte geben Sie Ihren Einladungscode ein, um FlowithOS freizuschalten", "lookingForInvite": "Suchen Sie nach einer Einladung?", "followOnX": "Folgen Sie @flowith auf X", "toGetAccess": "um Zugang zu erhalten.", "placeholder": "Mein Einladungscode", "invalidCode": "Ungültiger Einladungscode", "verificationFailed": "Verifizierung fehlgeschlagen - bitte versuchen Sie es erneut", "accessGranted": "Zugang gewährt", "initializing": "Willkommen bei FlowithOS. Wird initialisiert..." }, "browserImport": { "title": "Dort weitermachen, wo Sie aufgehört haben", "subtitle": "Importieren Sie nahtlos Ihre Lesezeichen und gespeicherten Sitzungen aus Ihren aktuellen Browsern.", "detecting": "Installierte Browser werden erkannt...", "noBrowsers": "Keine installierten Browser erkannt", "imported": "Importiert", "importing": "Wird importiert...", "bookmarks": "Lesezeichen", "importNote": "Der Import dauert etwa 5 Sekunden. Sie sehen ein oder zwei Systemaufforderungen.", "skipForNow": "Vorerst überspringen", "nextStep": "Nächster Schritt" }, "settings": { "title": "Bereit loszulegen?", "subtitle": "Ein paar schnelle Anpassungen, um Ihr Flowith OS-Erlebnis zu perfektionieren.", "defaultBrowser": { "title": "Als Standardbrowser festlegen", "description": "Lassen Sie das Web zu Ihnen kommen. Links werden direkt in FlowithOS geöffnet und integrieren Online-Inhalte nahtlos in Ihren Arbeitsbereich." }, "addToDock": { "title": "Zum Dock / zur Taskleiste hinzufügen", "description": "Halten Sie Ihren kreativen Hub einen Klick entfernt für sofortigen Zugriff, wann immer die Inspiration zuschlägt." }, "launchAtStartup": { "title": "Beim Start starten", "description": "Beginnen Sie Ihren Tag bereit zum Kreativsein. Flowith OS wartet auf Sie, sobald Sie sich anmelden." }, "helpImprove": { "title": "Helfen Sie uns, besser zu werden", "description": "Teilen Sie anonyme Nutzungsdaten, um uns zu helfen, ein besseres Produkt für alle zu entwickeln.", "privacyNote": "Ihre Privatsphäre ist vollständig geschützt." }, "canChangeSettingsLater": "Sie können diese Einstellungen später ändern", "nextStep": "Nächster Schritt", "privacy": { "title": "100 % lokale Speicherung und Datenschutz", "description": "Ihr Ausführungsverlauf, Browserverlauf, Gedächtnisse, Fähigkeiten, Kontodaten und alle persönlichen Informationen werden zu 100 % lokal auf Ihrem Gerät gespeichert. Keine Cloud-Synchronisation. Nutzen Sie FlowithOS mit vollständiger Sicherheit." } }, "examples": { "title1": "Das OS ist wach.", "title2": "Sehen Sie es in Aktion.", "subtitle": "Beginnen Sie mit einem Beispiel, um zu sehen, wie es funktioniert.", "enterFlowithOS": "FlowithOS betreten", "clickToReplay": "Klicken Sie, um diesen Fall abzuspielen", "videoNotSupported": "Ihr Browser unterstützt keine Videowiedergabe.", "cases": { "shopping": { "title": "Feiertags-Einkäufe 10× schneller erledigen", "description": "Füllt Ihren Warenkorb mit dem perfekten Welpengeschenkset – spart Ihnen über 2 Stunden manuelles Suchen." }, "contentEngine": { "title": "Rund-um-die-Uhr X-Content-Engine", "description": "Findet Top-Stories von Hacker News, schreibt in Ihrem einzigartigen Stil und postet automatisch auf X. Generiert 3× mehr Profilbesuche und organisches Community-Wachstum." }, "tiktok": { "title1": "TikTok-Hype-Generator: 500+ Engagements,", "title2": "0 Aufwand", "description": "Flowith OS füllt populäre Livestreams mit treffenden Kommentaren und verwandelt digitale Präsenz in messbares Wachstum." }, "youtube": { "title": "95 % autonomes YouTube-Kanalwachstum", "description": "Flowith OS optimiert den gesamten Workflow für gesichtslose YouTube-Kanäle – von der Content-Erstellung bis zur Community, und verdichtet wochenlange Arbeit auf weniger als eine Stunde." } } }, "oauth": { "connecting": "Verbindung zu {{provider}}", "completeInBrowser": "Bitte schließen Sie die Authentifizierung im Browser-Tab ab, der gerade geöffnet wurde.", "cancel": "Abbrechen" }, "terms": { "title": "Nutzungsbedingungen & Datenschutzrichtlinie", "subtitle": "Bitte überprüfen Sie die untenstehenden Bedingungen.", "close": "Schließen" }, "invitationCodes": { "title": "Meine Einladungscodes", "availableToShare": "{{unused}} von {{total}} verfügbar", "loading": "Ihre Codes werden geladen...", "noCodesYet": "Noch keine Einladungscodes vorhanden.", "noCodesFound": "Keine Einladungscodes gefunden", "failedToLoad": "Einladungscodes konnten nicht geladen werden", "useCodeHint": "Verwenden Sie einen Einladungscode, um Ihre eigenen Codes zu erhalten!", "shareHint": "Teilen Sie diese Codes mit Freunden, um sie zu FlowithOS einzuladen", "used": "Verwendet" }, "history": { "title": "Verlauf", "searchPlaceholder": "Verlauf durchsuchen...", "selectAll": "Alle auswählen", "deselectAll": "Auswahl aufheben", "deleteSelected": "Auswahl löschen ({{count}})", "clearAll": "Alle löschen", "loading": "Verlauf wird geladen...", "noMatchingHistory": "Kein übereinstimmender Verlauf gefunden", "noHistoryYet": "Noch kein Verlauf vorhanden", "confirmDelete": "Löschen bestätigen", "deleteConfirmMessage": "Möchten Sie den ausgewählten Verlauf wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.", "cancel": "Abbrechen", "delete": "Löschen", "today": "Heute", "yesterday": "Gestern", "earlier": "Früher", "untitled": "Ohne Titel", "visitedTimes": "{{count}} Mal besucht", "openInNewTab": "In neuem Tab öffnen", "timePeriod": "Zeitraum", "timeRangeAll": "Alle", "timeRangeAllDesc": "Gesamter Browserverlauf", "timeRangeToday": "Heute", "timeRangeTodayDesc": "Gesamter Verlauf von heute", "timeRangeYesterday": "Gestern", "timeRangeYesterdayDesc": "Verlauf von gestern", "timeRangeLast7Days": "Letzte 7 Tage", "timeRangeLast7DaysDesc": "Verlauf der letzten Woche", "timeRangeThisMonth": "Dieser Monat", "timeRangeThisMonthDesc": "Verlauf dieses Monats", "timeRangeLastMonth": "Letzter Monat", "timeRangeLastMonthDesc": "Verlauf des letzten Monats", "deleteTimeRange": "{{range}} löschen" } };
const update$d = { "checking": { "title": "Nach Updates suchen", "description": "Verbindung zum Update-Server..." }, "noUpdate": { "title": "Sie sind auf dem neuesten Stand", "currentVersion": "Aktuelle Version v{{version}}", "description": "Sie verwenden bereits die neueste Version", "close": "Schließen" }, "available": { "title": "Neue Version verfügbar", "version": "v{{version}} ist verfügbar", "currentVersion": "(Aktuell: v{{current}})", "released": "Veröffentlicht {{time}}", "betaNote": "Wir befinden uns in der öffentlichen Beta-Phase und liefern täglich Verbesserungen. Aktualisieren Sie jetzt, um auf dem neuesten Stand zu bleiben.", "defaultReleaseNotes": "Diese Beta-Version enthält Leistungsverbesserungen, Fehlerbehebungen und neue Funktionen. Wir liefern täglich Updates. Bitte aktualisieren Sie jetzt für das beste Erlebnis.", "downloadNow": "Jetzt herunterladen", "remindLater": "Später erinnern", "preparing": "Wird vorbereitet..." }, "downloading": { "title": "Update wird heruntergeladen", "version": "v{{version}} wird heruntergeladen", "progress": "Download-Fortschritt", "hint": "Öffnen Sie das heruntergeladene Installationsprogramm mit dem Button unten" }, "readyToInstall": { "title": "Bereit zur Installation", "downloaded": "v{{version}} wurde heruntergeladen", "hint": "Starten Sie neu, um die Installation des Updates abzuschließen", "restartNow": "Jetzt neu starten", "restartLater": "Später neu starten", "restarting": "Wird neu gestartet..." }, "error": { "title": "Update-Prüfung fehlgeschlagen", "default": "Update fehlgeschlagen. Bitte versuchen Sie es später erneut.", "downloadFailed": "Download fehlgeschlagen. Bitte versuchen Sie es später erneut.", "installFailed": "Installation fehlgeschlagen. Bitte versuchen Sie es später erneut.", "close": "Schließen", "noChannelPermission": "Ihr Konto hat keinen Zugriff auf den {{channel}}-Update-Kanal. Bitte wechseln Sie zu Stable und versuchen Sie es erneut.", "switchToStable": "Zu Stable wechseln und erneut versuchen" }, "time": { "justNow": "gerade eben", "minutesAgo": "vor {{count}} Minuten", "hoursAgo": "vor {{count}} Stunden" }, "notifications": { "newVersionAvailable": "Neue Version {{version}} verfügbar", "downloadingInBackground": "Wird im Hintergrund heruntergeladen", "updateDownloaded": "Update heruntergeladen", "readyToInstall": "Version {{version}} ist bereit zur Installation" } };
const updateToast$d = { "checking": "Suche nach Updates...", "pleaseWait": "Bitte warten", "preparingDownload": "Download wird vorbereitet {{version}}", "updateFound": "Update {{version}} gefunden", "downloading": "Update {{version}} wird heruntergeladen", "updateCheckFailed": "Update-Prüfung fehlgeschlagen", "unknownError": "Unbekannter Fehler", "updatedTo": "Aktualisiert auf v{{version}}", "newVersionReady": "Neue Version bereit", "version": "Version {{version}}", "close": "Schließen", "gotIt": "Verstanden", "installNow": "Jetzt neu starten", "restarting": "Wird neu gestartet…", "later": "Später", "collapseUpdateContent": "Update-Inhalt einklappen", "viewUpdateContent": "Update-Inhalt anzeigen", "collapseLog": "Einklappen ^", "viewLog": "Protokoll anzeigen >", "channelChangeFailed": "Kanalwechsel fehlgeschlagen: {{error}}", "channelInfo": "Kanal: {{channel}}, Manifest: {{manifest}}", "manualDownloadHint": "Kann nicht aktualisieren? Manuelle Installation versuchen →", "channelDowngraded": { "title": "Kanal gewechselt", "message": "Ihr Konto hat keinen Zugriff auf {{previousChannel}}. Automatisch zu {{newChannel}} gewechselt." }, "continueInBackground": "Download wird im Hintergrund fortgesetzt", "time": { "justNow": "gerade eben", "minutesAgo": "vor {{count}} Minuten", "hoursAgo": "vor {{count}} Stunden", "daysAgo": "vor {{count}} Tagen", "weeksAgo": "vor {{count}} Wochen", "monthsAgo": "vor {{count}} Monaten", "yearsAgo": "vor {{count}} Jahren" } };
const errors$d = { "auth": { "notLoggedIn": "Bitte melden Sie sich zuerst an", "loginRequired": "Bitte melden Sie sich an, bevor Sie diese Funktion nutzen", "shareRequiresLogin": "Bitte melden Sie sich an, bevor Sie die Teilen-Funktion nutzen" }, "network": { "networkError": "Netzwerkfehler - bitte überprüfen Sie Ihre Verbindung", "requestTimeout": "Anfrage-Timeout - bitte versuchen Sie es erneut", "failedToVerify": "Zugriff konnte nicht verifiziert werden", "failedToFetch": "Codes konnten nicht abgerufen werden" }, "invitation": { "invalidCode": "Ungültiger Einladungscode", "verificationFailed": "Verifizierung fehlgeschlagen - bitte versuchen Sie es erneut", "failedToConsume": "Einladungscode konnte nicht verwendet werden" }, "download": { "downloadFailed": "Download fehlgeschlagen", "downloadInterrupted": "Download unterbrochen" }, "security": { "secureConnection": "Sichere Verbindung", "notSecure": "Nicht sicher", "localFile": "Lokale Datei", "unknownProtocol": "Unbekanntes Protokoll" } };
const menus$d = { "application": { "about": "Über {{appName}}", "checkForUpdates": "Nach Updates suchen...", "settings": "Einstellungen...", "services": "Dienste", "hide": "{{appName}} ausblenden", "hideOthers": "Andere ausblenden", "showAll": "Alle anzeigen", "quit": "Beenden", "updateChannel": "Update-Kanal" }, "edit": { "label": "Bearbeiten", "undo": "Rückgängig", "redo": "Wiederholen", "cut": "Ausschneiden", "paste": "Einfügen", "selectAll": "Alle auswählen" }, "view": { "label": "Ansicht", "findInPage": "Auf Seite suchen", "newTab": "Neuer Tab", "reopenClosedTab": "Geschlossenen Tab wieder öffnen", "newTerminalTab": "Neuer Terminal-Tab", "openLocalFile": "Lokale Datei öffnen...", "goBack": "Zurück", "goForward": "Vorwärts", "viewHistory": "Verlauf anzeigen", "viewDownloads": "Downloads anzeigen", "archive": "Archiv", "reload": "Neu laden", "forceReload": "Erzwungenes Neuladen", "actualSize": "Tatsächliche Größe", "zoomIn": "Vergrößern", "zoomOut": "Verkleinern", "toggleFullScreen": "Vollbild umschalten" }, "window": { "label": "Fenster", "minimize": "Minimieren", "close": "Schließen", "bringAllToFront": "Alle in den Vordergrund" }, "help": { "label": "Hilfe", "about": "Über", "version": "Version", "aboutDescription1": "Das KI-Agent-Betriebssystem der nächsten Generation", "aboutDescription2": "entwickelt für Selbstverbesserung, Gedächtnis und Geschwindigkeit.", "copyright": "© 2025 Flowith, Inc. Alle Rechte vorbehalten." }, "contextMenu": { "back": "Zurück", "forward": "Vorwärts", "reload": "Neu laden", "hardReload": "Erzwungenes Neuladen (Cache ignorieren)", "openLinkInNewTab": "Link in neuem Tab öffnen", "openLinkInExternal": "Link in externem Browser öffnen", "copyLinkAddress": "Link-Adresse kopieren", "downloadLink": "Link herunterladen", "openImageInNewTab": "Bild in neuem Tab öffnen", "copyImageAddress": "Bildadresse kopieren", "copyImage": "Bild kopieren", "downloadImage": "Bild herunterladen", "downloadVideo": "Video herunterladen", "downloadAudio": "Audio herunterladen", "openMediaInNewTab": "Medien in neuem Tab öffnen", "copyMediaAddress": "Medienadresse kopieren", "openFrameInNewTab": "Frame in neuem Tab öffnen", "openInExternal": "In externem Browser öffnen", "copyPageURL": "Seiten-URL kopieren", "viewPageSource": "Seitenquelltext anzeigen (neuer Tab)", "savePageAs": "Seite speichern unter…", "print": "Drucken…", "cut": "Ausschneiden", "paste": "Einfügen", "searchWebFor": 'Im Web nach "{{text}}" suchen', "selectAll": "Alle auswählen", "inspectElement": "Element untersuchen", "openDevTools": "DevTools öffnen", "closeDevTools": "DevTools schließen" }, "fileDialog": { "openLocalFile": "Lokale Datei öffnen", "unsupportedFileType": "Nicht unterstützter Dateityp", "savePageAs": "Seite speichern unter", "allSupportedFiles": "Alle unterstützten Dateien", "htmlFiles": "HTML-Dateien", "textFiles": "Textdateien", "images": "Bilder", "videos": "Videos", "audio": "Audio", "pdf": "PDF", "webpageComplete": "Webseite, vollständig", "singleFile": "Einzeldatei (MHTML)" } };
const dialogs$d = { "crash": { "title": "Anwendungsfehler", "message": "Ein unerwarteter Fehler ist aufgetreten", "detail": "{{error}}\n\nDer Fehler wurde zu Debugging-Zwecken protokolliert.", "restart": "Neu starten", "close": "Schließen" }, "customBackground": { "title": "Benutzerdefinierter Hintergrund", "subtitle": "Erstellen Sie Ihren eigenen einzigartigen Stil", "preview": "Vorschau", "angle": "Winkel", "stops": "Stops", "selectImage": "Bild auswählen", "uploading": "Wird hochgeladen...", "dropImageHere": "Bild hier ablegen", "dragAndDrop": "Per Drag & Drop oder Klick", "fileTypes": "PNG, JPG, JPEG, WEBP, SVG, GIF", "fit": "Anpassen", "cover": "Abdecken", "contain": "Enthalten", "fill": "Füllen", "remove": "Entfernen", "cancel": "Abbrechen", "apply": "Anwenden", "gradient": "Verlauf", "solid": "Einfarbig", "image": "Bild", "dropImageError": "Bitte legen Sie eine Bilddatei ab (PNG, JPG, JPEG, WEBP, SVG oder GIF)" } };
const humanInput$d = { "declinedToAnswer": "Benutzer hat die Antwort abgelehnt, Frage übersprungen", "needOneInput": "1 Eingabe erforderlich zum Fortfahren", "needTwoInputs": "Ihre Hilfe bei 2 Dingen erforderlich", "needThreeInputs": "3 Entscheidungen von Ihnen erforderlich", "waitingOnInputs": "Warte auf {{count}} Eingaben von Ihnen", "declineToAnswer": "Antwort ablehnen", "dropFilesHere": "Dateien hier ablegen", "typeYourAnswer": "Ihre Antwort eingeben...", "orTypeCustom": "Oder benutzerdefiniert eingeben...", "uploadFiles": "Dateien hochladen", "previousQuestion": "Vorherige Frage", "goToQuestion": "Zu Frage {{number}} gehen", "nextQuestion": "Nächste Frage" };
const de = {
  common: common$d,
  nav: nav$d,
  tray: tray$d,
  actions: actions$d,
  status: status$d,
  time: time$d,
  downloads: downloads$d,
  history: history$d,
  invitationCodes: invitationCodes$d,
  tasks: tasks$d,
  flows: flows$d,
  bookmarks: bookmarks$d,
  conversations: conversations$d,
  intelligence: intelligence$d,
  sidebar: sidebar$d,
  tabs: tabs$d,
  userMenu: userMenu$d,
  settings: settings$d,
  updateSettings: updateSettings$d,
  adblock: adblock$d,
  blank: blank$d,
  agentGuide: agentGuide$d,
  reward: reward$d,
  agentWidget: agentWidget$d,
  gate: gate$d,
  update: update$d,
  updateToast: updateToast$d,
  errors: errors$d,
  menus: menus$d,
  dialogs: dialogs$d,
  humanInput: humanInput$d
};
const common$c = { "ok": "OK", "cancel": "Cancel", "start": "Start", "delete": "Delete", "close": "Close", "save": "Save", "search": "Search", "loading": "Loading", "pressEscToClose": "Press ESC to close", "copyUrl": "Copy URL", "copied": "Copied", "copy": "Copy", "expand": "Expand", "collapse": "Collapse", "openFlowithWebsite": "Open Flowith website", "openAgentGuide": "Open Agent Guide", "reward": "Reward", "closeWindow": "Close window", "minimizeWindow": "Minimize window", "toggleFullscreen": "Toggle fullscreen", "saveEnter": "Save (Enter)", "cancelEsc": "Cancel (Esc)", "time": { "justNow": "just now", "minutesAgo": "{{count}} minute ago", "minutesAgo_other": "{{count}} minutes ago", "hoursAgo": "{{count}} hour ago", "hoursAgo_other": "{{count}} hours ago", "daysAgo": "{{count}} day ago", "daysAgo_other": "{{count}} days ago" } };
const nav$c = { "tasks": "Tasks", "flows": "Flows", "bookmarks": "Bookmarks", "intelligence": "Intelligence", "guide": "Guide" };
const tray$c = { "newTask": "New Task", "recentTasks": "Recent Tasks", "viewMore": "View More", "showMainWindow": "Show Main Window", "hideMainWindow": "Hide Main Window", "quit": "Quit" };
const actions$c = { "resume": "Resume", "pause": "Pause", "cancel": "Cancel", "delete": "Delete", "archive": "Archive", "showInFolder": "Show in Folder", "viewDetails": "View Details", "openFile": "Open File" };
const status$c = { "inProgress": "In progress", "completed": "Completed", "archive": "Archive", "paused": "Paused", "failed": "Failed", "cancelled": "Cancelled", "running": "Running", "wrappingUp": "Wrapping up..." };
const time$c = { "today": "Today", "yesterday": "Yesterday", "earlier": "Earlier" };
const downloads$c = { "title": "Downloads", "all": "All", "inProgress": "In Progress", "completed": "Completed", "noDownloads": "No downloads", "failedToLoad": "Failed to load downloads", "deleteConfirmMessage": "Are you sure you want to delete the selected downloads? This action cannot be undone.", "loadingDownloads": "Loading downloads...", "searchPlaceholder": "Search downloads...", "selectAll": "Select All", "deselectAll": "Deselect All", "deleteSelected": "Delete Selected ({{count}})", "clearAll": "Clear All", "noMatchingDownloads": "No matching downloads found", "noDownloadsYet": "No downloads yet", "confirmDelete": "Confirm Delete", "cancel": "Cancel", "delete": "Delete" };
const history$c = { "title": "History", "allTime": "All Time", "clearHistory": "Clear History", "removeItem": "Remove Item", "failedToLoad": "Failed to load history", "failedToClear": "Failed to clear history", "searchPlaceholder": "Search history...", "selectAll": "Select All", "deselectAll": "Deselect All", "deleteSelected": "Delete Selected ({{count}})", "clearAll": "Clear All", "noMatchingHistory": "No matching history found", "noHistoryYet": "No history yet", "confirmDelete": "Confirm Delete", "deleteConfirmMessage": "Are you sure you want to delete the selected history? This action cannot be undone.", "cancel": "Cancel", "delete": "Delete", "today": "Today", "yesterday": "Yesterday", "earlier": "Earlier", "untitled": "Untitled", "visitedTimes": "Visited {{count}} times", "openInNewTab": "Open in new tab", "loading": "Loading history...", "timePeriod": "Time Period", "timeRangeAll": "All", "timeRangeAllDesc": "All browsing history", "timeRangeToday": "Today", "timeRangeTodayDesc": "All history from today", "timeRangeYesterday": "Yesterday", "timeRangeYesterdayDesc": "History from yesterday", "timeRangeLast7Days": "Last 7 days", "timeRangeLast7DaysDesc": "History from the past week", "timeRangeThisMonth": "This month", "timeRangeThisMonthDesc": "History from this month", "timeRangeLastMonth": "Last month", "timeRangeLastMonthDesc": "History from last month", "deleteTimeRange": "Delete {{range}}", "last7days": "Last 7 Days", "thisMonth": "This Month", "lastMonth": "Last Month" };
const invitationCodes$c = { "title": "My Invitation Codes", "availableToShare": "{{unused}} of {{total}} available to share", "loading": "Loading your codes...", "noCodesYet": "No invitation codes yet.", "noCodesFound": "No invitation codes found", "failedToLoad": "Failed to load invitation codes", "useCodeHint": "Use an invitation code to get your own codes!", "shareHint": "Share these codes with friends to invite them to FlowithOS", "used": "Used" };
const tasks$c = { "title": "Task", "description": "Task is where you store all tasks", "transformToPreset": "Transform to Preset", "noTasks": "No tasks", "archiveEmpty": "Archive is empty" };
const flows$c = { "title": "Flow", "description": "Flow shows all your canvas", "newFlow": "New Flow", "rename": "Rename", "leave": "Leave", "noFlows": "No flows", "signInToViewFlows": "Sign in to view your flows", "pin": "Pin", "unpin": "Unpin" };
const bookmarks$c = { "title": "Bookmark", "description": "You can store every tabs you like", "bookmark": "Bookmark", "addNewCollection": "Add new collection", "loadingBookmarks": "Loading bookmarks...", "noMatchingBookmarks": "No matching bookmarks", "noBookmarksYet": "No bookmarks yet", "importFromBrowsers": "Import from browsers", "detectingBrowsers": "Detecting browsers...", "bookmarksCount": "bookmarks", "deleteCollection": "Delete Collection", "deleteCollectionConfirm": "Are you sure you want to delete this collection?", "newCollection": "New Collection", "enterCollectionName": "Enter a name for the new collection", "create": "Create", "collectionName": "Collection name", "saveEnter": "Save (Enter)", "cancelEsc": "Cancel (Esc)", "renameFolder": "Rename folder", "renameBookmark": "Rename bookmark", "deleteFolder": "Delete folder", "deleteBookmark": "Delete bookmark" };
const conversations$c = { "title": "Conversations", "noConversations": "No conversations yet" };
const intelligence$c = { "title": "Intelligence", "description": "Evolve your Agent with skills and memories", "knowledgeBase": "Knowledge Base", "memory": "Memory", "skill": "Skill", "createNewSkill": "Create new skill", "createNewMemory": "Create new memory", "loading": "Loading...", "noSkills": "No skills", "noMemories": "No memories", "readOnly": "Read-only", "readOnlyMessage": "This is a built-in system Skill to help your agent perform better. It can't be edited directly, but you can duplicate it and modify your own copy. Edits after opening won't be saved. Please note.", "readOnlyToast": "This is a built-in system Skill to help your agent perform better. It can't be edited directly, but you can duplicate it and modify your own copy.", "open": "Open", "kbComingSoon": "Flowith Knowledge Base support is coming soon.", "system": "System", "learnFromUser": "User", "systemPresetReadOnly": "System preset (read-only)", "actions": "Actions", "rename": "Rename", "duplicate": "Duplicate…", "info": "Info", "saving": "Saving...", "fileInfo": "File Info", "fileName": "Name", "fileSize": "Size", "fileCreated": "Created", "fileModified": "Modified", "fileType": "Type", "fileLocation": "Location", "copyPath": "Copy Path", "empowerOS": "Teach Mode", "teachMakesBetter": "Teaching makes OS better", "teachMode": "Teach Mode", "teachModeDescription": "In Teach Mode, you can record your web workflows and steps while OS Agent quietly observes, learns, and distills them into reusable skills and know-how.", "teachModeGoalLabel": "Task Goal (Optional)", "teachModeGoalPlaceholder": "Provide more context for OS to learn — it can be a specific task goal or any related information.", "teachModeTaskDisabled": "New task is disabled while you are in teach mode.", "empowering": "Teaching", "empoweringDescription": "OS Agent will watch and learn as you demonstrate", "yourGoal": "Task Goal", "preset": "Preset", "generatedSkills": "Generated Skills", "showLess": "Hide", "showMore": "Show more", "osHasLearned": "OS has learned", "complete": "Complete", "interactionsPlaceholder": "Interactions will appear here as you demonstrate the workflow.", "done": "Done", "generatingGuidance": "Generating guidance...", "summarizingInteraction": "We are summarizing each interaction and preparing a reusable skill.", "skillSaved": "Skill saved", "goal": "Goal", "steps": "Steps", "events": "Events", "guidanceSavedSuccessfully": "Guidance saved successfully.", "openGuidanceInComposer": "Open guidance in Composer", "recordAnotherWorkflow": "Record another workflow", "dismissSummary": "Dismiss summary", "saveAndTest": "Save and Test", "learning": "Learning...", "teachModeError": "Teach mode encountered an issue", "errorDetails": "Error Details", "checkNetworkConnection": "Check your network connection and try starting teach mode again.", "tryAgain": "Try again", "resetState": "Reset state", "completeConfirmTitle": "OS empowering completed", "completeConfirmMessage": "You can choose which outcome you want in the checklist below.", "capturedEvents": "Captured Events", "confirmAndGenerate": "Generate", "generating": "Generating", "promptSummary": "Prompt Summary", "saveToPreset": "Save to Preset", "skillHostname": "Skill: {{hostname}}", "saveToSkill": "Save to skill", "skillTooltip": "You can revise or edit skill below", "skillSectionTooltip": "Each skill is named after the website used in the teaching session. New skills appear as new sections in the corresponding markdown file.", "selectAll": "Select all", "discard": "Discard", "confirmDiscard": "Yes, discard", "tutorial": { "title": "Welcome to Teach Mode", "next": "Next", "gotIt": "Got it", "guideLabel": "Teach Mode Guide", "page1": { "title": "What is skill and teach mode?", "description": "Skill is where OS stores reusable know-how that any agent can apply. Each skill is a prompt-based guide (potentially containing code snippets) about a web application, workflow, or interaction pattern. It helps OS to gain better performance on certain websites or for specific tasks.\n\nTeach mode is how to you can train OS to copy your routine or learn how to work on specific website, which will be stored as <strong>skills and presets</strong> for you to reuse in the future." }, "page2": { "title": "How to start teach mode?", "description": "To begin, click the '<strong>Teach Mode</strong>' button in the '<strong>Intelligence panel</strong>' on the left. Before you start, set a <strong>Teaching Goal</strong> which gives the OS an initial instruction and provides you with a clear task to follow." }, "page3": { "title": "How does OS learn your move?", "description": "As you teach, the OS observes your actions and tracks your cursor in real time. You'll see every step recorded on the left panel — pause anytime, and click the red '<strong>Stop</strong>' icon when you're done." }, "page4": { "title": "What is OS learning results?", "description": "Once you finish your teaching, select the type of outcome you wish to generate. Typically, a preset and related skills are generated for routine tasks. After generation, you can review and edit them in <strong>Composer</strong> or access them anytime in the '<strong>Learn from User</strong>' folder within the '<strong>Intelligence</strong>' panel." } } };
const sidebar$c = { "goBack": "Go back", "goForward": "Go forward", "lockSidebar": "Lock sidebar", "unlockSidebar": "Unlock sidebar", "searchOrEnterAddress": "Search or enter address", "reload": "Reload" };
const tabs$c = { "openNewBlankPage": "Open new blank page", "newTab": "New Tab", "terminal": "Terminal", "pauseAgent": "Pause Agent", "resumeAgent": "Resume Agent" };
const userMenu$c = { "upgrade": "Upgrade", "creditsLeft": "left", "clickToManageSubscription": "Click to manage subscription", "theme": "Theme", "lightMode": "Light Mode", "darkMode": "Dark Mode", "systemMode": "System Mode", "language": "Language", "settings": "Settings", "invitationCode": "Invitation Code", "checkUpdates": "Check for Updates", "contactUs": "Contact Us", "signOut": "Sign Out", "openUserMenu": "Open user menu", "signIn": "Sign in" };
const settings$c = { "title": "Settings", "history": "History", "downloads": "Downloads", "adblock": "Ad Blocker", "language": "Language", "languageDescription": "Choose your preferred language for the interface. Changes take effect immediately.", "softwareUpdate": "Software Update" };
const updateSettings$c = { "description": "Flowith OS keeps you current with safe, reliable updates. Choose your channel: Stable for reliability, Beta for early features, or Alpha for cutting‑edge builds. You can only switch to channels your account can access.", "currentVersion": "Current version: {{version}}", "loadError": "Failed to load", "warning": "Warning: Beta/Alpha builds may be unstable and can impact your work. Use Stable for production.", "channel": { "label": "Update Channel", "hint": "Only channels you have access to can be selected.", "disabledHint": "Cannot switch channels while an update is in progress", "options": { "stable": "Stable", "beta": "Beta", "alpha": "Alpha" } }, "actions": { "title": "Manual Check", "hint": "Check for available updates now.", "check": "Check for updates" }, "status": { "noUpdate": "You're up to date.", "hasUpdate": "New version available.", "error": "Failed to check updates." }, "tips": { "title": "Tips", "default": "By default, get notifications for stable updates. In Early Access, pre-release builds may be unstable for production work.", "warningTitle": "A Warning: Nightly Updates Apply Automatically", "warningBody": "Nightly builds will silently download and install updates without prompting whenever Cursor is closed." } };
const adblock$c = { "title": "Ad Blocker", "description": "Block intrusive ads and trackers, filter page noise, enabling Neo OS Agent to understand and extract information more precisely while protecting your privacy.", "enable": "Enable Ad Blocker", "enableDescription": "Automatically block ads on all websites", "statusActive": "Active - Ads are being blocked", "statusInactive": "Inactive - Ads are not being blocked", "adsBlocked": "ads blocked", "networkBlocked": "Network Requests", "cosmeticBlocked": "Elements Hidden", "filterRules": "Filter Rules", "activeRules": "active rules" };
const blank$c = { "openNewPage": "Open new blank page", "selectBackground": "Select background", "isAwake": "is awake", "osIsAwake": "OS is awake", "osGuideline": "OS Guideline", "osGuidelineDescription": "Quickstart to our OS Agent - architecture, modes, and everything it can do.", "intelligence": "Teach Mode", "intelligenceDescription": "Teach OS Agent to perform tasks and reuse them later.", "inviteAndEarn": "Invite And Earn", "tagline": "With an active memory, evolving with every action to truly understand you.", "taskPreset": "Task Preset", "credits": "+{{amount}} Credits", "addPreset": "Add new preset", "editPreset": "Edit preset", "deletePreset": "Delete preset", "removeFromHistory": "Remove from history", "previousPreset": "Previous preset", "nextPreset": "Next preset", "previousPresets": "Previous presets", "nextPresets": "Next presets", "createPreset": "Create preset", "presetName": "Preset name", "instruction": "Instruction", "presetNamePlaceholderCreate": "e.g., Weekly Report, Code Review, Data Analysis...", "presetNamePlaceholderEdit": "Enter preset name...", "instructionPlaceholderCreate": `Describe what you want OS to do...
e.g., "Analyze this week's sales data and create a summary report"`, "instructionPlaceholderEdit": "Update your task instruction...", "colorBlue": "Blue", "colorGreen": "Green", "colorYellow": "Yellow", "colorRed": "Red", "selectColor": "Select {{color}} color", "creating": "Creating...", "updating": "Updating...", "create": "Create", "update": "Update", "smartInputPlaceholder": "Navigate, search, or let Neo take over...", "processing": "Processing…", "navigate": "Navigate", "navigateDescription": "Open this address in the current tab", "searchGoogle": "Search Google", "searchGoogleDescription": "Search with Google", "runTask": "Run Task", "runTaskDescription": "Execute with Neo agent", "createCanvas": "Ask in Canvas", "createCanvasDescription": "Open Flo canvas with this prompt" };
const agentGuide$c = { "title": "Agent Guide", "subtitle": "A visual quickstart to the OS Agent: architecture, modes, and everything it can do.", "capabilities": { "heading": "Capabilities", "navigate": { "title": "Navigate", "desc": "Open pages, go back/forward" }, "click": { "title": "Click", "desc": "Interact with buttons & links" }, "type": { "title": "Type", "desc": "Fill inputs and forms" }, "keys": { "title": "Keys", "desc": "Enter, Escape, shortcuts" }, "scroll": { "title": "Scroll", "desc": "Move through long pages" }, "tabs": { "title": "Tabs", "desc": "Mark, switch, close" }, "files": { "title": "Files", "desc": "Write, read, download" }, "skills": { "title": "Skills", "desc": "Shared know‑how" }, "memories": { "title": "Memories", "desc": "Long‑term prefs" }, "upload": { "title": "Upload", "desc": "Send files to pages" }, "ask": { "title": "Ask", "desc": "Quick user confirmations" }, "onlineSearch": { "title": "Online Search", "desc": "Fast web lookup" }, "extract": { "title": "Extract", "desc": "Get structured info" }, "deepThink": { "title": "Deep Think", "desc": "Structured analysis" }, "vision": { "title": "Vision", "desc": "Non‑DOM precise ops" }, "shell": { "title": "Shell", "desc": "Run commands (when available)" }, "report": { "title": "Report", "desc": "Finish and summarize" } }, "benchmark": { "title": "Online‑Mind2Web Benchmark", "subtitle": "Flowith Neo AgentOS Sweeps the Board: Dominating with ", "subtitleHighlight": "Near‑Perfect", "subtitleEnd": " Performance.", "openai": "OpenAI Operator", "gemini": "Gemini 2.5 Computer Use", "flowith": "Flowith Neo OS", "average": "Average", "easy": "Easy", "medium": "Medium", "hard": "Hard" }, "skillsMemories": { "heading": "Skills & Memories", "description": "Reusable playbooks and long‑term context that Neo references automatically in Pro Mode.", "markdownTag": "Markdown .md", "autoIndexedTag": "Auto‑indexed", "citationsTag": "Citations in logs", "howNeoUses": "How Neo uses them: before each step in Pro Mode, Neo checks for relevant Skills and Memories, merges them into the reasoning context, and applies the instructions or preferences automatically.", "skillsTitle": "Skills", "skillsTag": "Shared", "skillsDesc": "Store reusable know‑how that any agent can apply. Each Skill is a short guide about a tool, workflow, or pattern.", "skillsProcedures": "Best for: procedures", "skillsFormat": "Format: Markdown", "skillsScenario": "Everyday scenario", "skillsScenarioTitle": "Convert & share media", "skillsStep1": 'You say: "Turn these 20 images into a compact PDF."', "skillsStep2": "Neo follows the skill to upload, convert, wait for completion, and save the file.", "skillsOutcome": "Outcome: a ready‑to‑share PDF with a download link in logs.", "memoriesTitle": "Memories", "memoriesTag": "Personal", "memoriesDesc": "Capture your preferences, profile and domain facts. Neo references relevant items when making decisions and cites them in logs.", "memoriesStyle": "Best for: style, rules", "memoriesPrivate": "Private by default", "memoriesScenario": "Everyday scenario", "memoriesScenarioTitle": "Writing voice & tone", "memoriesStep1": "You like concise, friendly copy with an optimistic tone.", "memoriesStep2": "Neo applies it across emails, reports and social posts automatically.", "memoriesOutcome": "Outcome: consistent brand voice without repeating instructions.", "taskFilesTitle": "Task Files", "taskFilesTag": "Per‑task", "taskFilesDesc": "Temporary files created during the current task. They facilitate tool I/O and intermediate results and are not automatically shared with other tasks.", "taskFilesEphemeral": "Ephemeral", "taskFilesReadable": "Readable by tools", "taskFilesScenario": "Everyday scenario", "taskFilesScenarioTitle": "Trip price tracker", "taskFilesStep1": "Neo scrapes flight tables and stores them as a CSV for this task.", "taskFilesStep2": "Compares today's fares to yesterday's and highlights changes.", "taskFilesOutcome": "Outcome: a neat summary and a downloadable CSV." }, "system": { "title": "Neo OS - the smartest browser agent for you", "tagline": "Self‑Evolving × Memory & Skill × Speed & Intelligence", "selfEvolving": "Self-Evolving", "intelligence": "Intelligence", "contextImprovement": "Context Improvement", "contextDesc": "Reflective agent refines context in real-time via skills system", "onlineRL": "Online RL", "onlineRLDesc": "Periodic updates align with agent behaviors", "intelligentMemory": "Intelligent Memory", "architecture": "Architecture", "dualLayer": "Dual-Layer System", "dualLayerDesc": "Short-term buffers + long-term episodic memory", "knowledgeTransfer": "Knowledge Transfer", "knowledgeTransferDesc": "Retain, reuse, and transfer learning across tasks", "highPerformance": "High Performance", "infrastructure": "Infrastructure", "executionKernel": "Execution Kernel", "executionKernelDesc": "Parallel orchestration & dynamic scheduling", "speedCaching": "Speed Caching", "speedCachingDesc": "Millisecond response with real-time execution", "speedIndicator": "~1ms", "summary": "Evolving · Persistent · Fast" }, "arch": { "heading": "Architecture", "subtitle": "Agent‑centric OS: CPU (Planner) + Memory/Filesystem + Skills + I/O", "agentCentricNote": "flowithOS is designed for agents.", "osShell": "OS Shell", "agentCore": "Agent Core", "plannerExecutor": "Planner · Executor", "browserTabs": "Browser Tabs", "domCanvas": "DOM · Canvas", "filesMemoriesSkills": "Files · Memories · Skills", "domPageTabs": "DOM · Page · Tabs", "clickTypeScroll": "Click · Type · Scroll", "visionNonDOM": "Vision · Non-DOM Ops", "captchaDrag": "CAPTCHA · Drag", "onlineSearchThinking": "Online Search · Deep Thinking", "googleAnalysis": "google · analysis", "askUserReport": "Ask User · Report", "choicesDoneReport": "choices · done_and_report", "skillsApps": "Skills (Apps)", "skillsKinds": "System · User · Shared", "memory": "Memory", "memoryKinds": "Short‑term · Long‑term", "filesystem": "Filesystem", "filesystemKinds": "Task Files · Assets · Logs", "cpuTitle": "CPU — Planning Agent", "cpuSub": "Planner · Executor · Reflector", "planRow": "Plan → Decompose → Route", "execRow": "Execute → Observe → Reflect", "ioTitle": "I/O Capabilities", "browserUse": "Browser Use", "browserUseDesc": "DOM · Tabs · Vision · CAPTCHA", "terminalUse": "Terminal Use", "terminalUseDesc": "Shell · Tools · Scripts", "scriptUse": "Script Use", "scriptUseDesc": "Python · JS · Workers", "osVsHumanTitle": "Agent OS vs Human‑centric OS", "osVsHuman1": "Apps become Skills: designed to be read by Agents, not UIs", "osVsHuman2": "CPU plans/executes via I/O; user supervises at task level", "osVsHuman3": "Memory persists across tasks; Filesystem supports tool I/O" }, "tips": { "heading": "Tips", "beta": "FlowithOS is currently in Beta; both the product and Agent Neo are continually being updated. Please stay tuned for the latest updates.", "improving": "The abilities of Agent Neo OS are improving day by day, you can try to use the new abilities to complete your tasks." } };
const reward$c = { "helloWorld": "Hello World", "helloWorldDesc": 'This Is Your "Hello World" Moment In The New Era.<br />Be Among The First To Dent The Agent Internet In Human History.', "get2000Credits": "Claim Your 2,000 Bonus Credits", "equivalent7Days": "And Automate Your Social Media Operation For 7 Days.", "shareInstructions": `Once awakened, introduce your personal Agent to the world.<br />NeoOS will automatically craft and publish a "Hello World" message post on X for you<br />just like anything it can do for you later.<br /><span style='display: block; height: 8px;'></span>Sit back and watch it happen.`, "osComing": "OS Is Coming", "awakeOS": "Awake OS", "page2Title": "Invite And Earn", "page2Description1": "A great journey is better with companions.", "page2Description2": "For each friend who joins, you'll be gifted", "page2Description3": "credits to fuel your own thoughts.", "retry": "Retry", "noCodesYet": "No invitation codes yet", "activated": "Activated", "neoStarting": "Neo is starting the auto-share task...", "failed": "Failed", "unknownError": "Unknown error", "errorRetry": "Error occurred, please retry", "unexpectedResponse": "Unexpected response from server", "failedToLoadCodes": "Failed to load invitation codes", "congratsCredits": "Congrats! +{{amount}} Credits", "rewardUnlocked": "Reward unlocked for sharing" };
const agentWidget$c = { "modes": { "fast": { "label": "Fast mode", "description": "Finish tasks as fast as possible, will not use Skills and Memories.", "short": "Fast", "modeDescription": "Quicker actions, less detail" }, "pro": { "label": "Pro mode", "description": "Highest quality: step-by-step visual analysis with deep reasoning. Referring Skills and Memories as needed.", "short": "Pro", "modeDescription": "Balanced, let Neo decide" } }, "minimize": "Minimize", "placeholder": "Ask Neo OS Agent to do...", "changeModeTooltip": "Change the mode to adjust the behavior of the agent", "preset": "Preset", "selectPresetTooltip": "Select a preset to use", "addNewPreset": "Add a new preset", "agentHistoryTooltip": "Agent's action history", "createPreset": "Create preset", "presetName": "Preset name", "instruction": "Instruction", "upload": "Upload", "newTask": "New Task", "draft": "Draft", "copyPrompt": "Copy prompt", "showMore": "Show more", "showLess": "Show less", "agentIsWorking": "Agent is working", "agentIsWrappingUp": "Agent is wrapping up", "completed": "Completed", "paused": "Paused", "created": "Created", "selectTask": "Select a task", "unpin": "Unpin", "pinToRight": "Pin to right", "stepsCount": "Steps ({{count}})", "files": "Files", "filesCount": "Files ({{count}})", "noFilesYet": "No files generated yet", "status": { "wrappingUp": "Agent is wrapping up...", "thinking": "Agent thinking...", "wrappingUpAction": "Wrapping up current action..." }, "actions": { "markedTab": "Marked Tab", "openRelatedTab": "Open Related Tab (Work in progress)", "open": "Open", "openTab": "Open Tab", "showInFolder": "Show in folder", "preview": "Preview", "followUpPrefix": "You", "actionsHeader": "Actions" }, "controls": { "rerun": "Rerun (Work in progress)", "pause": "Pause", "pauseAndArchive": "Pause & Archive", "resume": "Resume", "wrappingUpDisabled": "Wrapping up..." }, "input": { "sending": "Sending...", "adjustTaskPlaceholder": "Send a new message to adjust the task for Agent Neo..." }, "legacy": { "readOnlyNotice": "This is a legacy task from an earlier version. View-only mode." }, "refunded": { "noFollowUp": "This task has been refunded. Follow-up messages are not available." }, "skills": { "matchingSkills": "matching relevant skills…", "scanningSkills": "Neural jitter scanning available skills!!!", "scanningMap": "Scanning neural skill map…" }, "billing": { "creditsDepletedTitle": "Add more credits to continue", "creditsDepletedMessage": "Agent paused because your credits are depleted. Add credits or update billing, then rerun the task when you're ready." }, "presetActions": { "editPreset": "Edit preset", "deletePreset": "Delete preset" }, "feedback": { "success": { "short": "Great job!", "long": "So far so good, great job!" }, "refund": { "short": "Oops, refund!", "long": "Oops, I want my credits back!" }, "refundSuccess": { "long": "Bingo! Your credits have been refunded!" }, "modal": { "title": "Request Credits Refund", "credits": "{{count}} credits", "description": "If you are not satisfied about this task, request a refund and we will instantly refund all credits this task has been used.", "whatGoesWrong": "What goes wrong", "errorMessage": "Sorry, please provide more details", "placeholder": "Describe what went wrong...", "shareTask": "Share this task with us", "shareDescription": "We will desensitize all personal detailed from your task. By sharing your task with us, we will improve our agent performance on similar tasks in the future.", "upload": "Upload", "attachFile": "attach file", "submit": "Submit", "submitting": "Submitting...", "alreadyRefunded": { "title": "Already Refunded", "message": "This task has already been refunded. You cannot request a refund again." } }, "errors": { "systemError": "System error. Please contact our team for support.", "networkError": "Network error. Please check your connection and try again.", "noUsageData": "Usage data not found. Cannot refund.", "alreadyRefunded": "This task has already been refunded.", "notAuthenticated": "Please log in to request a refund.", "unknownError": "An unexpected error occurred. Please try again later.", "validationFailed": "Unable to validate your reason now. Please try again later.", "invalidReason": "Reason rejected. Please describe what actually went wrong." }, "confirmation": { "creditsRefunded": "{{count}} Credits Refunded", "title": "Success", "message": "Thank you! Our team will diagnose your task and improve FlowithOS experience.", "messageNoShare": "Thank you! Our team will keep punching and improve FlowithOS experience." } } };
const gate$c = { "welcome": { "title": "Welcome to FlowithOS", "subtitle": "From Web to World, FlowithOS is the Smartest AgenticOS that turns your browser into real-world values.", "features": { "execute": { "title": "Execute Any Task, Automatically", "description": "Acting with human intuition at machine speed, FlowithOS navigates and executes multiple tasks across the web repeatedly." }, "transform": { "title": "Turn Ideas Into Impact, Intelligently", "description": "From inspiration to value creation, FlowithOS transforms big ideas into actions to deliver real results." }, "organize": { "title": "Organize Your Assets, Systematically", "description": "From stray bookmarks to structured playbooks, FlowithOS equips you with a robust system to manage, curate, and scale your digital assets." }, "evolve": { "title": "Evolve With You, Dynamically", "description": "With a Memory that grows from every interaction, FlowithOS develops custom Skills—from navigating complex sites to understanding your personal style." } }, "letsGo": "Let's Go!" }, "auth": { "createAccount": "Create an account", "signInToFlowith": "Sign in to your flowith account", "oneAccount": "One account for all flowith products", "fromAnotherAccount": "Sign in with:", "useOwnEmail": "Or use your own email", "email": "Email", "password": "Password", "confirmPassword": "Confirm password", "acceptTerms": "I accept FlowithOS's Term of Use and Privacy Policy", "privacyNote": "All your data stays 100% secure on your device", "alreadyHaveAccount": "Already have a Flowith Account?", "createNewAccount": "No account? Sign up", "signUp": "Sign up", "signIn": "Sign in", "processing": "Processing...", "verifyEmail": "Verify Your Email", "verificationCodeSent": "We've sent a 6-digit verification code to {{email}}", "enterVerificationCode": "Enter verification code", "verificationCode": "Verification Code", "enterSixDigitCode": "Enter 6-digit code", "backToSignUp": "Back to sign up", "verifying": "Verifying...", "verifyCode": "Verify Code", "errors": { "enterEmail": "Please enter your email", "enterPassword": "Please enter your password", "confirmPassword": "Please confirm your password", "passwordsDoNotMatch": "Passwords do not match", "acceptTerms": "Please accept the Terms of Use and Privacy Policy", "authFailed": "Authentication failed. Please try again.", "invalidVerificationCode": "Please enter a valid 6-digit verification code", "verificationFailed": "Verification failed. Please try again.", "oauthFailed": "OAuth authentication failed. Please try again.", "userAlreadyExists": "This email is already registered. Please " }, "goToLogin": "go to login", "signInPrompt": "sign in" }, "invitation": { "title": "The awakening requires a key", "subtitle": "Please enter your invitation code to unlock FlowithOS", "lookingForInvite": "Looking for an invite?", "followOnX": "Follow @flowith on X", "toGetAccess": "to get access.", "placeholder": "My invitation code", "invalidCode": "Invalid invitation code", "verificationFailed": "Verification failed - please try again", "accessGranted": "Access Granted", "initializing": "Welcome to FlowithOS. Initializing..." }, "browserImport": { "title": "Pick up where you left off", "subtitle": "Seamlessly import your bookmarks and saved sessions from your current browsers.", "detecting": "Detecting installed browsers...", "noBrowsers": "No installed browsers detected", "imported": "Imported", "importing": "Importing...", "bookmarks": "bookmarks", "importNote": "Importing takes about 5 seconds. You'll see one or two system prompts.", "skipForNow": "Skip for now", "nextStep": "Next step" }, "settings": { "title": "Ready to Flow?", "subtitle": "A few quick adjustments to perfect your Flowith OS experience.", "defaultBrowser": { "title": "Set as Default Browser", "description": "Let the web flow to you. Links will open directly in FlowithOS, seamlessly weaving online content into your workspace." }, "addToDock": { "title": "Add to Dock / Taskbar", "description": "Keep your creative hub one click away for instant access whenever inspiration strikes." }, "launchAtStartup": { "title": "Launch at Startup", "description": "Start your day ready to create. Flowith OS will be waiting for you the moment you log in." }, "helpImprove": { "title": "Help Us Improve", "description": "Share anonymous usage data to help us build a better product for everyone.", "privacyNote": "Your privacy is fully protected." }, "canChangeSettingsLater": "You can change these settings later", "nextStep": "Next Step", "privacy": { "title": "100% Local Storage and Privacy Protection", "description": "Your Agent execution history, browsing history, Memories and Skills, account credentials, and all privacy data are stored 100% locally on your device. Nothing is synced to cloud servers. You can use FlowithOS with complete peace of mind." } }, "examples": { "title1": "OS is Awake.", "title2": "See it in Action.", "subtitle": "Start with an example to see how it works.", "enterFlowithOS": "Enter FlowithOS", "clickToReplay": "click to replay this case", "videoNotSupported": "Your browser does not support video playback.", "cases": { "shopping": { "title": "Complete Holiday Haul 10X Faster", "description": "Fills your cart with the perfect puppy gift set—saving you 2+ hours of manual browsing." }, "contentEngine": { "title": "24/7 X Content Engine", "description": "Discovers top Hacker News stories, writes in your unique voice, and auto-posts to X. Driving 3X more profile visits and genuine community growth." }, "tiktok": { "title1": "TikTok Hype Generator: 500+ Engagements,", "title2": "0 Effort", "description": "Flowith OS floods high-traffic livestreams with culturally sharp commentary, transforming digital presence into measurable momentum." }, "youtube": { "title": "95% Autonomous Youtube Channel Growth", "description": "Flowith OS streamlines the entire faceless YouTube workflow, from creation to community, condensing weeks of work into less than an hour." } } }, "oauth": { "connecting": "Connecting to {{provider}}", "completeInBrowser": "Please complete the authentication in the browser tab that just opened.", "cancel": "Cancel" }, "terms": { "title": "Terms of Use & Privacy Policy", "subtitle": "Please review the terms below.", "close": "Close" }, "invitationCodes": { "title": "My Invitation Codes", "availableToShare": "{{unused}} of {{total}} available to share", "loading": "Loading your codes...", "noCodesYet": "No invitation codes yet.", "noCodesFound": "No invitation codes found", "failedToLoad": "Failed to load invitation codes", "useCodeHint": "Use an invitation code to get your own codes!", "shareHint": "Share these codes with friends to invite them to FlowithOS", "used": "Used" }, "history": { "title": "History", "searchPlaceholder": "Search history...", "selectAll": "Select All", "deselectAll": "Deselect All", "deleteSelected": "Delete Selected ({{count}})", "clearAll": "Clear All", "loading": "Loading history...", "noMatchingHistory": "No matching history found", "noHistoryYet": "No history yet", "confirmDelete": "Confirm Delete", "deleteConfirmMessage": "Are you sure you want to delete the selected history? This action cannot be undone.", "cancel": "Cancel", "delete": "Delete", "today": "Today", "yesterday": "Yesterday", "earlier": "Earlier", "untitled": "Untitled", "visitedTimes": "Visited {{count}} times", "openInNewTab": "Open in new tab", "timePeriod": "Time Period", "timeRangeAll": "All", "timeRangeAllDesc": "All browsing history", "timeRangeToday": "Today", "timeRangeTodayDesc": "All history from today", "timeRangeYesterday": "Yesterday", "timeRangeYesterdayDesc": "History from yesterday", "timeRangeLast7Days": "Last 7 days", "timeRangeLast7DaysDesc": "History from the past week", "timeRangeThisMonth": "This month", "timeRangeThisMonthDesc": "History from this month", "timeRangeLastMonth": "Last month", "timeRangeLastMonthDesc": "History from last month", "deleteTimeRange": "Delete {{range}}" } };
const update$c = { "checking": { "title": "Checking for updates", "description": "Connecting to update server..." }, "noUpdate": { "title": "You're up to date", "currentVersion": "Current version v{{version}}", "description": "You're already using the latest version", "close": "Close" }, "available": { "title": "New version available", "version": "v{{version}} is available", "currentVersion": "(Current: v{{current}})", "released": "Released {{time}}", "betaNote": "We're in public beta and ship improvements daily. Update now to stay current.", "defaultReleaseNotes": "This beta release includes performance improvements, bug fixes, and new features. We ship updates daily. Please update now for the best experience.", "downloadNow": "Download now", "remindLater": "Remind me later", "preparing": "Preparing..." }, "downloading": { "title": "Downloading update", "version": "Downloading v{{version}}", "progress": "Download progress", "hint": "You can open the downloaded installer by clicking the button below" }, "readyToInstall": { "title": "Ready to install", "downloaded": "v{{version}} has finished downloading", "hint": "Restart to finish installing the update", "restartNow": "Restart now", "restartLater": "Restart later", "restarting": "Restarting..." }, "error": { "title": "Update check failed", "default": "Update failed. Please try again later.", "downloadFailed": "Download failed. Please try again later.", "installFailed": "Install failed. Please try again later.", "close": "Close", "noChannelPermission": "Your account does not have access to the {{channel}} update channel. Please switch to Stable and try again.", "switchToStable": "Switch to Stable and retry" }, "time": { "justNow": "just now", "minutesAgo": "{{count}} minutes ago", "hoursAgo": "{{count}} hours ago" }, "notifications": { "newVersionAvailable": "New version {{version}} available", "downloadingInBackground": "Downloading in background", "updateDownloaded": "Update downloaded", "readyToInstall": "Version {{version}} is ready to install" } };
const updateToast$c = { "checking": "Checking for updates...", "pleaseWait": "Please wait", "preparingDownload": "Preparing to download {{version}}", "downloading": "Downloading update {{version}}", "updateCheckFailed": "Update check failed", "unknownError": "Unknown error", "updatedTo": "Updated to v{{version}}", "newVersionReady": "New version ready", "version": "Version {{version}}", "close": "Close", "gotIt": "Got it", "installNow": "Restart Now", "restarting": "Restarting…", "later": "Later", "collapseUpdateContent": "Collapse update content", "viewUpdateContent": "View update content", "collapseLog": "Collapse ^", "viewLog": "View log >", "channelChangeFailed": "Failed to switch channel: {{error}}", "channelInfo": "Channel: {{channel}}, Manifest: {{manifest}}", "manualDownloadHint": "Automatic install failed? Please manually install →", "channelDowngraded": { "title": "Channel Switched", "message": "Your account doesn't have access to {{previousChannel}}. Automatically switched to {{newChannel}}." }, "time": { "justNow": "just now", "minutesAgo": "{{count}} minutes ago", "hoursAgo": "{{count}} hours ago", "daysAgo": "{{count}} days ago", "weeksAgo": "{{count}} weeks ago", "monthsAgo": "{{count}} months ago", "yearsAgo": "{{count}} years ago" } };
const errors$c = { "auth": { "notLoggedIn": "Please log in first", "loginRequired": "Please log in before using this feature", "shareRequiresLogin": "Please log in before using the share feature" }, "network": { "networkError": "Network error - please check your connection", "requestTimeout": "Request timeout - please try again", "failedToVerify": "Failed to verify access", "failedToFetch": "Failed to fetch codes" }, "invitation": { "invalidCode": "Invalid invitation code", "verificationFailed": "Verification failed - please try again", "failedToConsume": "Failed to consume invitation code" }, "download": { "downloadFailed": "Download failed", "downloadInterrupted": "Download interrupted" }, "security": { "secureConnection": "Secure Connection", "notSecure": "Not Secure", "localFile": "Local File", "unknownProtocol": "Unknown Protocol" } };
const menus$c = { "application": { "about": "About {{appName}}", "checkForUpdates": "Check for Updates...", "settings": "Settings...", "services": "Services", "hide": "Hide {{appName}}", "hideOthers": "Hide Others", "showAll": "Show All", "quit": "Quit", "updateChannel": "Update Channel" }, "edit": { "label": "Edit", "undo": "Undo", "redo": "Redo", "cut": "Cut", "paste": "Paste", "selectAll": "Select All" }, "view": { "label": "View", "findInPage": "Find in Page", "newTab": "New Tab", "reopenClosedTab": "Reopen Closed Tab", "newTerminalTab": "New Terminal Tab", "openLocalFile": "Open Local File...", "goBack": "Go Back", "goForward": "Go Forward", "viewHistory": "View History", "viewDownloads": "View Downloads", "archive": "Archive", "reload": "Reload", "forceReload": "Force Reload", "actualSize": "Actual Size", "zoomIn": "Zoom In", "zoomOut": "Zoom Out", "toggleFullScreen": "Toggle Full Screen" }, "window": { "label": "Window", "minimize": "Minimize", "close": "Close", "bringAllToFront": "Bring All to Front" }, "help": { "label": "Help", "about": "About", "version": "Version", "aboutDescription1": "The next-generation AI Agent Operating System", "aboutDescription2": "built for self-improvement, memory, and speed.", "copyright": "© 2025 Flowith, Inc. All rights reserved." }, "contextMenu": { "back": "Back", "forward": "Forward", "reload": "Reload", "hardReload": "Hard Reload (Ignore Cache)", "openLinkInNewTab": "Open Link in New Tab", "openLinkInExternal": "Open Link in External Browser", "copyLinkAddress": "Copy Link Address", "downloadLink": "Download Link", "openImageInNewTab": "Open Image in New Tab", "copyImageAddress": "Copy Image Address", "copyImage": "Copy Image", "downloadImage": "Download Image", "downloadVideo": "Download Video", "downloadAudio": "Download Audio", "openMediaInNewTab": "Open Media in New Tab", "copyMediaAddress": "Copy Media Address", "openFrameInNewTab": "Open Frame in New Tab", "openInExternal": "Open in External Browser", "copyPageURL": "Copy Page URL", "viewPageSource": "View Page Source (New Tab)", "savePageAs": "Save Page As…", "print": "Print…", "cut": "Cut", "paste": "Paste", "searchWebFor": 'Search the Web for "{{text}}"', "selectAll": "Select All", "inspectElement": "Inspect Element", "openDevTools": "Open DevTools", "closeDevTools": "Close DevTools" }, "fileDialog": { "openLocalFile": "Open Local File", "unsupportedFileType": "Unsupported File Type", "savePageAs": "Save Page As", "allSupportedFiles": "All Supported Files", "htmlFiles": "HTML Files", "textFiles": "Text Files", "images": "Images", "videos": "Videos", "audio": "Audio", "pdf": "PDF", "webpageComplete": "Webpage, Complete", "singleFile": "Single File (MHTML)" } };
const dialogs$c = { "crash": { "title": "Application Error", "message": "An unexpected error occurred", "detail": "{{error}}\n\nThe error has been logged for debugging purposes.", "restart": "Restart", "close": "Close" }, "customBackground": { "title": "Custom Background", "subtitle": "Create your own unique style", "preview": "Preview", "angle": "Angle", "stops": "Stops", "selectImage": "Select Image", "uploading": "Uploading...", "dropImageHere": "Drop image here", "dragAndDrop": "Drag & drop or click", "fileTypes": "PNG, JPG, JPEG, WEBP, SVG, GIF", "fit": "Fit", "cover": "Cover", "contain": "Contain", "fill": "Fill", "remove": "Remove", "cancel": "Cancel", "apply": "Apply", "gradient": "Gradient", "solid": "Solid", "image": "Image", "dropImageError": "Please drop an image file (PNG, JPG, JPEG, WEBP, SVG or GIF)" } };
const humanInput$c = { "declinedToAnswer": "User declined to answer, skipped this question", "needOneInput": "Need 1 input to continue", "needTwoInputs": "Need your help on 2 things", "needThreeInputs": "3 decisions needed from you", "waitingOnInputs": "Waiting on {{count}} inputs from you", "declineToAnswer": "Decline to answer", "dropFilesHere": "Drop files here", "typeYourAnswer": "Type your answer...", "orTypeCustom": "Or type custom...", "uploadFiles": "Upload files", "previousQuestion": "Previous question", "goToQuestion": "Go to question {{number}}", "nextQuestion": "Next question" };
const en = {
  common: common$c,
  nav: nav$c,
  tray: tray$c,
  actions: actions$c,
  status: status$c,
  time: time$c,
  downloads: downloads$c,
  history: history$c,
  invitationCodes: invitationCodes$c,
  tasks: tasks$c,
  flows: flows$c,
  bookmarks: bookmarks$c,
  conversations: conversations$c,
  intelligence: intelligence$c,
  sidebar: sidebar$c,
  tabs: tabs$c,
  userMenu: userMenu$c,
  settings: settings$c,
  updateSettings: updateSettings$c,
  adblock: adblock$c,
  blank: blank$c,
  agentGuide: agentGuide$c,
  reward: reward$c,
  agentWidget: agentWidget$c,
  gate: gate$c,
  update: update$c,
  updateToast: updateToast$c,
  errors: errors$c,
  menus: menus$c,
  dialogs: dialogs$c,
  humanInput: humanInput$c
};
const common$b = { "ok": "OK", "cancel": "Cancelar", "start": "Iniciar", "delete": "Eliminar", "close": "Cerrar", "save": "Guardar", "search": "Buscar", "loading": "Cargando", "pressEscToClose": "Presione ESC para cerrar", "copyUrl": "Copiar URL", "copied": "Copiado", "copy": "Copiar", "expand": "Expandir", "collapse": "Colapsar", "openFlowithWebsite": "Abrir sitio web de Flowith", "openAgentGuide": "Abrir Guía del Agente", "reward": "Recompensa", "closeWindow": "Cerrar ventana", "minimizeWindow": "Minimizar ventana", "toggleFullscreen": "Alternar pantalla completa", "saveEnter": "Guardar (Enter)", "cancelEsc": "Cancelar (Esc)", "time": { "justNow": "justo ahora", "minutesAgo": "hace {{count}} minuto", "minutesAgo_other": "hace {{count}} minutos", "hoursAgo": "hace {{count}} hora", "hoursAgo_other": "hace {{count}} horas", "daysAgo": "hace {{count}} día", "daysAgo_other": "hace {{count}} días" } };
const nav$b = { "tasks": "Tareas", "flows": "Flujos", "bookmarks": "Marcadores", "intelligence": "Inteligencia", "guide": "Guía" };
const tray$b = { "newTask": "Nueva Tarea", "recentTasks": "Tareas Recientes", "viewMore": "Ver Más", "showMainWindow": "Mostrar Ventana Principal", "hideMainWindow": "Ocultar Ventana Principal", "quit": "Salir" };
const actions$b = { "resume": "Reanudar", "pause": "Pausar", "cancel": "Cancelar", "delete": "Eliminar", "archive": "Archivar", "showInFolder": "Mostrar en Carpeta", "viewDetails": "Ver Detalles", "openFile": "Abrir Archivo" };
const status$b = { "inProgress": "En progreso", "completed": "Completado", "archive": "Archivo", "paused": "Pausado", "failed": "Fallido", "cancelled": "Cancelado", "running": "En ejecución", "wrappingUp": "Finalizando..." };
const time$b = { "today": "Hoy", "yesterday": "Ayer", "earlier": "Anterior" };
const downloads$b = { "title": "Descargas", "all": "Todos", "inProgress": "En progreso", "completed": "Completado", "noDownloads": "Sin descargas", "failedToLoad": "Error al cargar descargas", "deleteConfirmMessage": "¿Está seguro de que desea eliminar las descargas seleccionadas? Esta acción no se puede deshacer.", "loadingDownloads": "Cargando descargas...", "searchPlaceholder": "Buscar descargas...", "selectAll": "Seleccionar Todo", "deselectAll": "Deseleccionar Todo", "deleteSelected": "Eliminar Seleccionados ({{count}})", "clearAll": "Limpiar Todo", "noMatchingDownloads": "No se encontraron descargas", "noDownloadsYet": "Sin descargas aún", "confirmDelete": "Confirmar Eliminación", "cancel": "Cancelar", "delete": "Eliminar" };
const history$b = { "title": "Historial", "allTime": "Todo el Tiempo", "clearHistory": "Borrar Historial", "removeItem": "Eliminar Elemento", "failedToLoad": "Error al cargar historial", "failedToClear": "Error al borrar historial", "searchPlaceholder": "Buscar en el historial...", "selectAll": "Seleccionar todo", "deselectAll": "Deseleccionar todo", "deleteSelected": "Eliminar seleccionados ({{count}})", "clearAll": "Borrar todo", "noMatchingHistory": "No se encontró historial coincidente", "noHistoryYet": "Aún sin historial", "confirmDelete": "Confirmar eliminación", "deleteConfirmMessage": "¿Estás seguro de que quieres eliminar el historial seleccionado? Esta acción no se puede deshacer.", "cancel": "Cancelar", "delete": "Eliminar", "today": "Hoy", "yesterday": "Ayer", "earlier": "Anterior", "untitled": "Sin título", "visitedTimes": "Visitado {{count}} veces", "openInNewTab": "Abrir en nueva pestaña", "loading": "Cargando historial...", "timePeriod": "Período", "timeRangeAll": "Todo", "timeRangeAllDesc": "Todo el historial de navegación", "timeRangeToday": "Hoy", "timeRangeTodayDesc": "Todo el historial de hoy", "timeRangeYesterday": "Ayer", "timeRangeYesterdayDesc": "Historial de ayer", "timeRangeLast7Days": "Últimos 7 días", "timeRangeLast7DaysDesc": "Historial de la semana pasada", "timeRangeThisMonth": "Este mes", "timeRangeThisMonthDesc": "Historial de este mes", "timeRangeLastMonth": "Mes pasado", "timeRangeLastMonthDesc": "Historial del mes pasado", "deleteTimeRange": "Eliminar {{range}}", "last7days": "Últimos 7 Días", "thisMonth": "Este Mes", "lastMonth": "Mes Pasado" };
const invitationCodes$b = { "title": "Mis Códigos de Invitación", "availableToShare": "{{unused}} de {{total}} disponibles para compartir", "loading": "Cargando tus códigos...", "noCodesYet": "Aún sin códigos de invitación.", "noCodesFound": "No se encontraron códigos de invitación", "failedToLoad": "No se pudieron cargar los códigos", "useCodeHint": "¡Usa un código de invitación para obtener tus propios códigos!", "shareHint": "Comparte estos códigos con amigos para invitarlos a FlowithOS", "used": "Usado" };
const tasks$b = { "title": "Tarea", "description": "Organiza y da seguimiento a tus tareas", "transformToPreset": "Transformar en Preajuste", "noTasks": "Sin tareas", "archiveEmpty": "Archivo vacío" };
const flows$b = { "title": "Flujo", "description": "Tu espacio de trabajo creativo", "newFlow": "Nuevo Flujo", "rename": "Renombrar", "leave": "Salir", "noFlows": "Sin flujos", "signInToViewFlows": "Inicia sesión para ver tus flujos", "pin": "Fijar", "unpin": "Desfijar" };
const bookmarks$b = { "title": "Marcadores", "description": "Acceso rápido a tus páginas preferidas", "bookmark": "Marcador", "addNewCollection": "Añadir nueva colección", "loadingBookmarks": "Cargando marcadores...", "noMatchingBookmarks": "Sin marcadores coincidentes", "noBookmarksYet": "Aún sin marcadores", "importFromBrowsers": "Importar desde navegadores", "detectingBrowsers": "Detectando navegadores...", "bookmarksCount": "marcadores", "deleteCollection": "Eliminar Colección", "deleteCollectionConfirm": "¿Estás seguro de que quieres eliminar esta colección?", "newCollection": "Nueva Colección", "enterCollectionName": "Ingresa un nombre para la nueva colección", "create": "Crear", "collectionName": "Nombre de colección", "saveEnter": "Guardar (Enter)", "cancelEsc": "Cancelar (Esc)", "renameFolder": "Renombrar carpeta", "renameBookmark": "Renombrar marcador", "deleteFolder": "Eliminar carpeta", "deleteBookmark": "Eliminar marcador" };
const conversations$b = { "title": "Conversaciones", "noConversations": "Aún sin conversaciones" };
const intelligence$b = { "title": "Inteligencia", "description": "Haz tu agente más inteligente", "knowledgeBase": "Base de Conocimiento", "memory": "Memoria", "skill": "Habilidad", "createNewSkill": "Crear nueva habilidad", "createNewMemory": "Crear nueva memoria", "loading": "Cargando...", "noSkills": "Sin habilidades", "noMemories": "Sin memorias", "readOnly": "Solo lectura", "readOnlyMessage": "Esta es una Habilidad del sistema integrada para ayudar a tu agente a tener un mejor rendimiento. No se puede editar directamente, pero puedes duplicarla y modificar tu propia copia. Las ediciones después de abrir no se guardarán. Por favor, ten en cuenta.", "readOnlyToast": "Esta es una Habilidad del sistema integrada para ayudar a tu agente a tener un mejor rendimiento. No se puede editar directamente, pero puedes duplicarla y modificar tu propia copia.", "open": "Abrir", "kbComingSoon": "El soporte de Base de Conocimiento de Flowith estará disponible pronto.", "system": "Sistema", "learnFromUser": "Usuario", "systemPresetReadOnly": "Predefinición del sistema (solo lectura)", "actions": "Acciones", "rename": "Renombrar", "duplicate": "Duplicar…", "info": "Info", "saving": "Guardando...", "fileInfo": "Información del archivo", "fileName": "Nombre", "fileSize": "Tamaño", "fileCreated": "Creado", "fileModified": "Modificado", "fileType": "Tipo", "fileLocation": "Ubicación", "copyPath": "Copiar ruta", "empowerOS": "Modo de Enseñanza", "teachMakesBetter": "Enseñar mejora el OS", "teachMode": "Modo de Enseñanza", "teachModeDescription": "En el Modo de Enseñanza, puedes grabar tus flujos y pasos web mientras OS Agent observa y aprende en silencio, y los destila en habilidades y conocimientos reutilizables.", "teachModeGoalLabel": "Objetivo de la tarea (opcional)", "teachModeGoalPlaceholder": "Proporciona más contexto para que el OS aprenda — puede ser un objetivo específico de la tarea o cualquier información relacionada.", "teachModeTaskDisabled": "No se pueden crear nuevas tareas mientras el Modo de Enseñanza está en ejecución.", "empowering": "Enseñando", "empoweringDescription": "OS Agent observará y aprenderá mientras haces la demostración", "yourGoal": "Objetivo de la tarea", "preset": "Ajuste preestablecido", "generatedSkills": "Habilidades Generadas", "showLess": "Ocultar", "showMore": "Mostrar más", "osHasLearned": "El SO ha aprendido", "complete": "Completar", "interactionsPlaceholder": "Las interacciones aparecerán aquí mientras demuestras el flujo de trabajo", "done": "Listo", "generatingGuidance": "Generando orientación...", "summarizingInteraction": "Estamos resumiendo cada interacción y preparando una habilidad reutilizable", "skillSaved": "Habilidad guardada", "goal": "Objetivo", "steps": "Pasos", "events": "Eventos", "guidanceSavedSuccessfully": "Orientación guardada exitosamente", "openGuidanceInComposer": "Abrir orientación en Composer", "recordAnotherWorkflow": "Grabar otro flujo de trabajo", "dismissSummary": "Descartar resumen", "saveAndTest": "Guardar y Probar", "learning": "Aprendiendo...", "teachModeError": "El modo de enseñanza encontró un problema", "errorDetails": "Detalles del Error", "checkNetworkConnection": "Verifica tu conexión de red e intenta iniciar el modo de enseñanza nuevamente", "tryAgain": "Intentar de nuevo", "resetState": "Restablecer estado", "completeConfirmTitle": "Potenciación del OS completada", "completeConfirmMessage": "Puedes elegir el resultado que deseas en la lista de verificación a continuación.", "capturedEvents": "Eventos Capturados", "confirmAndGenerate": "Generar", "generating": "Generando", "promptSummary": "Resumen del Prompt", "saveToPreset": "Guardar en Ajuste Preestablecido", "skillHostname": "Habilidad: {{hostname}}", "saveToSkill": "Guardar en habilidad", "selectAll": "Seleccionar todo", "discard": "Descartar", "confirmDiscard": "Sí, descartar", "tutorial": { "title": "Bienvenido al Modo de Enseñanza", "next": "Siguiente", "gotIt": "Entendido", "guideLabel": "Guía del Modo de Enseñanza", "page1": { "title": "¿Qué son las habilidades y el modo de enseñanza?", "description": "Las habilidades son donde el OS almacena conocimientos reutilizables que cualquier agente puede aplicar. Cada habilidad es una guía basada en indicaciones (que potencialmente contiene fragmentos de código) sobre una aplicación web, flujo de trabajo o patrón de interacción. Ayuda al OS a obtener un mejor rendimiento en ciertos sitios web o tareas específicas.\n\nEl modo de enseñanza es cómo puede entrenar al OS para copiar su rutina o aprender a trabajar en un sitio web específico, que se almacenará como <strong>habilidades y preajustes</strong> para que los reutilice en el futuro." }, "page2": { "title": "¿Cómo iniciar el modo de enseñanza?", "description": "Para comenzar, haga clic en el botón '<strong>Modo de Enseñanza</strong>' en el '<strong>panel de Inteligencia</strong>' de la izquierda. Antes de comenzar, establezca un <strong>Objetivo de Enseñanza</strong> que le dé al OS una instrucción inicial y le proporcione una tarea clara a seguir." }, "page3": { "title": "¿Cómo aprende el OS sus movimientos?", "description": "Mientras enseña, el OS observa sus acciones y rastrea su cursor en tiempo real. Verá cada paso registrado en el panel izquierdo: pause en cualquier momento y haga clic en el ícono rojo '<strong>Detener</strong>' cuando haya terminado." }, "page4": { "title": "¿Cuáles son los resultados del aprendizaje del OS?", "description": "Una vez que termine su enseñanza, seleccione el tipo de resultado que desea generar. Normalmente, se generan un preajuste y habilidades relacionadas para tareas rutinarias. Después de la generación, puede revisarlos y editarlos en <strong>Composer</strong> o acceder a ellos en cualquier momento en la carpeta '<strong>Aprender del usuario</strong>' dentro del panel '<strong>Inteligencia</strong>'." } }, "skillTooltip": "Puedes revisar o editar la habilidad a continuación", "skillSectionTooltip": "Cada habilidad se nombra según el dominio del sitio web utilizado durante la sesión de enseñanza. Las habilidades recién aprendidas aparecen como nuevas secciones en el archivo markdown correspondiente." };
const sidebar$b = { "goBack": "Atrás", "goForward": "Adelante", "lockSidebar": "Bloquear barra lateral", "unlockSidebar": "Desbloquear barra lateral", "searchOrEnterAddress": "Buscar o ingresar dirección", "reload": "Recargar" };
const tabs$b = { "newTab": "Nueva pestaña", "terminal": "Terminal", "pauseAgent": "Pausar agente", "resumeAgent": "Reanudar agente" };
const userMenu$b = { "upgrade": "Actualizar", "creditsLeft": "restantes", "clickToManageSubscription": "Haz clic para administrar tu suscripción", "theme": "Tema", "lightMode": "Modo Claro", "darkMode": "Modo Oscuro", "systemMode": "Modo Sistema", "language": "Idioma", "settings": "Configuración", "invitationCode": "Código de Invitación", "checkUpdates": "Buscar Actualizaciones", "contactUs": "Contáctanos", "signOut": "Cerrar Sesión", "openUserMenu": "Abrir menú de usuario", "signIn": "Iniciar sesión" };
const settings$b = { "title": "Configuración", "history": "Historial", "downloads": "Descargas", "adblock": "Bloqueador de Anuncios", "language": "Idioma", "languageDescription": "Elige tu idioma preferido para la interfaz. Los cambios se aplican inmediatamente.", "softwareUpdate": "Actualización de Software" };
const updateSettings$b = { "description": "Flowith OS te mantiene actualizado con actualizaciones seguras y confiables. Elige tu canal: Stable para confiabilidad, Beta para funciones tempranas o Alpha para compilaciones de vanguardia. Solo puedes cambiar a canales a los que tu cuenta tenga acceso.", "currentVersion": "Versión actual: {{version}}", "loadError": "Error al cargar", "warning": "Advertencia: Las compilaciones Beta/Alpha pueden ser inestables y afectar tu trabajo. Usa Stable para producción.", "channel": { "label": "Canal de Actualización", "hint": "Solo se pueden seleccionar canales a los que tengas acceso.", "disabledHint": "No se puede cambiar de canal mientras una actualización está en progreso", "options": { "stable": "Stable", "beta": "Beta", "alpha": "Alpha" } }, "actions": { "title": "Verificación Manual", "hint": "Buscar actualizaciones disponibles ahora.", "check": "Buscar actualizaciones" }, "status": { "noUpdate": "Estás actualizado.", "hasUpdate": "Nueva versión disponible.", "error": "Error al buscar actualizaciones." }, "tips": { "title": "Consejos", "default": "Por defecto, recibes notificaciones para actualizaciones estables. En Early Access, las compilaciones pre-lanzamiento pueden ser inestables para trabajo de producción.", "warningTitle": "Una Advertencia: Las Actualizaciones Nightly se Aplican Automáticamente", "warningBody": "Las compilaciones Nightly descargarán e instalarán actualizaciones silenciosamente sin avisar cuando Cursor se cierre." } };
const adblock$b = { "title": "Bloqueador de Anuncios", "description": "Bloquea anuncios intrusivos y rastreadores, filtra el ruido de la página, permitiendo que Neo OS Agent comprenda y extraiga información con mayor precisión mientras protege tu privacidad.", "enable": "Activar Bloqueador de Anuncios", "enableDescription": "Bloquear anuncios automáticamente en todos los sitios", "statusActive": "Activo - Los anuncios están siendo bloqueados", "statusInactive": "Inactivo - Los anuncios no están siendo bloqueados", "adsBlocked": "anuncios bloqueados", "networkBlocked": "Solicitudes de Red", "cosmeticBlocked": "Elementos Ocultos", "filterRules": "Reglas de Filtro", "activeRules": "reglas activas" };
const blank$b = { "openNewPage": "Abrir nueva página en blanco", "selectBackground": "Elegir fondo", "isAwake": "Despierto", "osIsAwake": "OS está despierto", "osGuideline": "Guía del OS", "osGuidelineDescription": "Inicio rápido del OS Agent - arquitectura, modos y todo lo que puede hacer.", "intelligence": "Modo de Enseñanza", "intelligenceDescription": "Enseña al OS Agent a realizar tareas y reutilizarlas más adelante", "inviteAndEarn": "Invita y Gana", "tagline": "Con memoria activa que evoluciona en cada acción para entenderte realmente.", "taskPreset": "Preajuste de Tarea", "credits": "+{{amount}} Créditos", "addPreset": "Añadir nuevo preajuste", "editPreset": "Editar preajuste", "deletePreset": "Eliminar preajuste", "removeFromHistory": "Eliminar del historial", "previousPreset": "Preajuste anterior", "nextPreset": "Siguiente preajuste", "previousPresets": "Preajustes anteriores", "nextPresets": "Siguientes preajustes", "createPreset": "Crear preajuste", "presetName": "Nombre del preajuste", "instruction": "Instrucción", "presetNamePlaceholderCreate": "ej: Informe Semanal, Revisión de Código, Análisis de Datos...", "presetNamePlaceholderEdit": "Ingresa el nombre del preajuste...", "instructionPlaceholderCreate": 'Describe qué quieres que haga el OS...\nej: "Analiza los datos de ventas de esta semana y crea un informe resumen"', "instructionPlaceholderEdit": "Actualiza la instrucción de la tarea...", "colorBlue": "Azul", "colorGreen": "Verde", "colorYellow": "Amarillo", "colorRed": "Rojo", "selectColor": "Seleccionar color {{color}}", "creating": "Creando...", "updating": "Actualizando...", "create": "Crear", "update": "Actualizar", "smartInputPlaceholder": "Navega, busca o deja que Neo se encargue...", "processing": "Procesando…", "navigate": "Navegar", "navigateDescription": "Abrir esta dirección en la pestaña actual", "searchGoogle": "Buscar en Google", "searchGoogleDescription": "Buscar con Google", "runTask": "Ejecutar Tarea", "runTaskDescription": "Ejecutar con agente Neo", "createCanvas": "Preguntar en Canvas", "createCanvasDescription": "Abre Flo Canvas con este prompt" };
const agentGuide$b = { "title": "Guía del Agente", "subtitle": "Una guía visual rápida del OS Agent: arquitectura, modos y todo lo que puede hacer.", "capabilities": { "heading": "Capacidades", "navigate": { "title": "Navegar", "desc": "Abrir páginas, ir atrás/adelante" }, "click": { "title": "Clic", "desc": "Interactuar con botones y enlaces" }, "type": { "title": "Escribir", "desc": "Completar campos y formularios" }, "keys": { "title": "Teclas", "desc": "Enter, Escape, atajos" }, "scroll": { "title": "Desplazar", "desc": "Moverse por páginas largas" }, "tabs": { "title": "Pestañas", "desc": "Marcar, cambiar, cerrar" }, "files": { "title": "Archivos", "desc": "Escribir, leer, descargar" }, "skills": { "title": "Habilidades", "desc": "Conocimiento compartido" }, "memories": { "title": "Memorias", "desc": "Preferencias a largo plazo" }, "upload": { "title": "Subir", "desc": "Enviar archivos a páginas" }, "ask": { "title": "Preguntar", "desc": "Confirmaciones rápidas del usuario" }, "onlineSearch": { "title": "Búsqueda Online", "desc": "Consulta web rápida" }, "extract": { "title": "Extraer", "desc": "Obtener información estructurada" }, "deepThink": { "title": "Análisis Profundo", "desc": "Análisis estructurado" }, "vision": { "title": "Visión", "desc": "Operaciones precisas no DOM" }, "shell": { "title": "Shell", "desc": "Ejecutar comandos (cuando esté disponible)" }, "report": { "title": "Informe", "desc": "Finalizar y resumir" } }, "benchmark": { "title": "Benchmark Online‑Mind2Web", "subtitle": "Flowith Neo AgentOS Domina Completamente: Con ", "subtitleHighlight": "Rendimiento Casi Perfecto", "subtitleEnd": ".", "openai": "OpenAI Operator", "gemini": "Gemini 2.5 Computer Use", "flowith": "Flowith Neo OS", "average": "Promedio", "easy": "Fácil", "medium": "Medio", "hard": "Difícil" }, "skillsMemories": { "heading": "Habilidades y Memorias", "description": "Manuales reutilizables y contexto a largo plazo que Neo referencia automáticamente en Modo Pro.", "markdownTag": "Markdown .md", "autoIndexedTag": "Auto-indexado", "citationsTag": "Citas en registros", "howNeoUses": "Cómo Neo las usa: antes de cada paso en Modo Pro, Neo verifica Habilidades y Memorias relevantes, las fusiona en el contexto de razonamiento y aplica las instrucciones o preferencias automáticamente.", "skillsTitle": "Habilidades", "skillsTag": "Compartido", "skillsDesc": "Almacena know-how reutilizable que cualquier agente puede aplicar. Cada Habilidad es una guía corta sobre una herramienta, flujo de trabajo o patrón.", "skillsProcedures": "Mejor para: procedimientos", "skillsFormat": "Formato: Markdown", "skillsScenario": "Escenario cotidiano", "skillsScenarioTitle": "Convertir y compartir medios", "skillsStep1": 'Dices: "Convierte estas 20 imágenes en un PDF compacto."', "skillsStep2": "Neo sigue la habilidad para subir, convertir, esperar la finalización y guardar el archivo.", "skillsOutcome": "Resultado: un PDF listo para compartir con enlace de descarga en los registros.", "memoriesTitle": "Memorias", "memoriesTag": "Personal", "memoriesDesc": "Captura tus preferencias, perfil y hechos de dominio. Neo referencia elementos relevantes al tomar decisiones y los cita en los registros.", "memoriesStyle": "Mejor para: estilo, reglas", "memoriesPrivate": "Privado por defecto", "memoriesScenario": "Escenario cotidiano", "memoriesScenarioTitle": "Tono y voz de escritura", "memoriesStep1": "Te gusta el texto conciso, amigable y con tono optimista.", "memoriesStep2": "Neo lo aplica automáticamente en correos, informes y publicaciones sociales.", "memoriesOutcome": "Resultado: voz de marca consistente sin repetir instrucciones.", "taskFilesTitle": "Archivos de Tarea", "taskFilesTag": "Por tarea", "taskFilesDesc": "Archivos temporales creados durante la tarea actual. Facilitan I/O de herramientas y resultados intermedios y no se comparten automáticamente con otras tareas.", "taskFilesEphemeral": "Efímero", "taskFilesReadable": "Legible por herramientas", "taskFilesScenario": "Escenario cotidiano", "taskFilesScenarioTitle": "Rastreador de precios de viaje", "taskFilesStep1": "Neo extrae tablas de vuelos y las almacena como CSV para esta tarea.", "taskFilesStep2": "Compara tarifas de hoy con las de ayer y resalta cambios.", "taskFilesOutcome": "Resultado: un resumen ordenado y un CSV descargable." }, "system": { "title": "Neo OS - el agente de navegador más inteligente para ti", "tagline": "Auto-Evolutivo × Memoria y Habilidad × Velocidad e Inteligencia", "selfEvolving": "Auto-Evolutivo", "intelligence": "Inteligencia", "contextImprovement": "Mejora de Contexto", "contextDesc": "Agente reflexivo refina el contexto en tiempo real mediante el sistema de habilidades", "onlineRL": "RL Online", "onlineRLDesc": "Actualizaciones periódicas alineadas con comportamientos del agente", "intelligentMemory": "Memoria Inteligente", "architecture": "Arquitectura", "dualLayer": "Sistema de Doble Capa", "dualLayerDesc": "Búferes de corto plazo + memoria episódica de largo plazo", "knowledgeTransfer": "Transferencia de Conocimiento", "knowledgeTransferDesc": "Retener, reutilizar y transferir aprendizaje entre tareas", "highPerformance": "Alto Rendimiento", "infrastructure": "Infraestructura", "executionKernel": "Núcleo de Ejecución", "executionKernelDesc": "Orquestación paralela y programación dinámica", "speedCaching": "Caché de Velocidad", "speedCachingDesc": "Respuesta en milisegundos con ejecución en tiempo real", "speedIndicator": "~1ms", "summary": "Evolutivo · Persistente · Rápido" }, "arch": { "heading": "Arquitectura", "osShell": "OS Shell", "agentCore": "Núcleo del Agente", "plannerExecutor": "Planificador · Ejecutor", "browserTabs": "Pestañas del Navegador", "domCanvas": "DOM · Canvas", "filesMemoriesSkills": "Archivos · Memorias · Habilidades", "domPageTabs": "DOM · Página · Pestañas", "clickTypeScroll": "Clic · Escribir · Desplazar", "visionNonDOM": "Visión · Operaciones No DOM", "captchaDrag": "CAPTCHA · Arrastrar", "onlineSearchThinking": "Búsqueda Online · Análisis Profundo", "googleAnalysis": "google · análisis", "askUserReport": "Preguntar al Usuario · Informe", "choicesDoneReport": "choices · done_and_report" }, "tips": { "heading": "Consejos", "beta": "FlowithOS está actualmente en Beta; tanto el producto como Agent Neo se actualizan continuamente. Mantente atento a las últimas actualizaciones.", "improving": "Las capacidades de Agent Neo OS mejoran día a día, puedes intentar usar las nuevas capacidades para completar tus tareas." } };
const reward$b = { "helloWorld": "Hello World", "helloWorldDesc": "Este es el momento 'Hello World' de la era de los Agentes<br />Conviértete en una de las primeras personas en dejar huella en la Internet de próxima generación", "get2000Credits": "Consigue tus 2000 créditos", "equivalent7Days": "Equivalente a automatizar tus redes sociales durante 7 días consecutivos", "shareInstructions": "Tras despertar, presenta tu FlowithOS al mundo<br />Creará y publicará automáticamente un mensaje 'Hello World' en la plataforma elegida.<br />Igual que todo lo que puede hacer por ti después.<br /><span style='display: block; height: 8px;'></span>Siéntate y observa cómo sucede.", "osComing": "OS llegando", "awakeOS": "Awake OS", "page2Title": "Invita amigos y gana créditos", "page2Description1": "Todo gran viaje es mejor con amigos.", "page2Description2": "Cada amigo que se una te dará", "page2Description3": "créditos de regalo.", "retry": "Intentar de nuevo", "noCodesYet": "Aún sin códigos", "activated": "Activado", "neoStarting": "Neo está iniciando la tarea de compartir automático...", "failed": "Falló", "unknownError": "Error desconocido", "errorRetry": "Hubo un error, intenta de nuevo", "unexpectedResponse": "Respuesta inesperada del servidor", "failedToLoadCodes": "No se pudieron cargar los códigos", "congratsCredits": "¡Felicidades! +{{amount}} créditos", "rewardUnlocked": "Recompensa de compartir recibida" };
const agentWidget$b = { "modes": { "fast": { "label": "Modo rápido", "description": "Completar tareas lo más rápido posible, no usará Habilidades y Memorias.", "short": "Rápido", "modeDescription": "Más rápido, menos detalles" }, "pro": { "label": "Modo Pro", "description": "Máxima calidad: análisis visual paso a paso con razonamiento profundo. Referenciando Habilidades y Memorias según sea necesario.", "short": "Pro", "modeDescription": "Modo equilibrado, déjalo en manos de Neo" } }, "minimize": "Minimizar", "placeholder": "Pide a Neo OS Agent que haga...", "changeModeTooltip": "Cambie el modo para ajustar el comportamiento del agente", "preset": "Preajuste", "selectPresetTooltip": "Seleccione un preajuste para usar", "addNewPreset": "Agregar nuevo preajuste", "agentHistoryTooltip": "Historial de acciones del agente", "createPreset": "Crear preajuste", "presetName": "Nombre del preajuste", "instruction": "Instrucción", "upload": "Subir", "newTask": "Nueva Tarea", "draft": "Borrador", "copyPrompt": "Copiar prompt", "showMore": "Mostrar más", "showLess": "Mostrar menos", "agentIsWorking": "Agente trabajando", "agentIsWrappingUp": "Agente finalizando", "completed": "Completado", "paused": "Pausado", "created": "Creado", "selectTask": "Seleccionar tarea", "unpin": "Desanclar", "pinToRight": "Anclar a la derecha", "stepsCount": "Pasos ({{count}})", "files": "Archivos", "filesCount": "Archivos ({{count}})", "noFilesYet": "Aún no se han generado archivos", "status": { "wrappingUp": "El agente está finalizando...", "thinking": "El agente está pensando...", "wrappingUpAction": "Completando acción actual..." }, "actions": { "markedTab": "Pestaña marcada", "openRelatedTab": "Abrir pestaña relacionada (en desarrollo)", "open": "Abrir", "openTab": "Abrir pestaña", "showInFolder": "Mostrar en carpeta", "preview": "Vista previa", "followUpPrefix": "Tú", "actionsHeader": "Acciones" }, "controls": { "rerun": "Ejecutar de nuevo (en desarrollo)", "pause": "Pausar", "pauseAndArchive": "Pausar y archivar", "resume": "Reanudar", "wrappingUpDisabled": "Finalizando..." }, "input": { "sending": "Enviando...", "adjustTaskPlaceholder": "Envía un nuevo mensaje para ajustar la tarea del Agent Neo..." }, "legacy": { "readOnlyNotice": "Tarea heredada, solo lectura" }, "refunded": { "noFollowUp": "Esta tarea ha sido reembolsada. Los mensajes de seguimiento no están disponibles." }, "skills": { "matchingSkills": "Emparejando habilidades relevantes…", "scanningSkills": "Buscando habilidades disponibles…", "scanningMap": "Escaneando mapa de habilidades neurales…" }, "billing": { "creditsDepletedTitle": "Añade créditos para continuar", "creditsDepletedMessage": "El agente se ha pausado porque te has quedado sin créditos. Añade créditos o actualiza tu información de facturación y ejecuta la tarea de nuevo cuando estés listo." }, "presetActions": { "editPreset": "Editar ajuste preestablecido", "deletePreset": "Eliminar ajuste preestablecido" }, "feedback": { "success": { "short": "¡Excelente trabajo!", "long": "¡Hasta ahora todo bien, excelente trabajo!" }, "refund": { "short": "¡Ups, reembolso!", "long": "¡Ups, quiero recuperar mis créditos!" }, "refundSuccess": { "long": "¡Genial! ¡Tus créditos han sido reembolsados!" }, "modal": { "title": "Solicitar reembolso de créditos", "credits": "{{count}} créditos", "description": "Si no está satisfecho con esta tarea, solicite un reembolso y le devolveremos instantáneamente todos los créditos utilizados en esta tarea.", "whatGoesWrong": "¿Qué salió mal?", "errorMessage": "Lo sentimos, proporcione más detalles", "placeholder": "Describe qué salió mal...", "shareTask": "Compartir esta tarea con nosotros", "shareDescription": "Anonimizaremos todos los detalles personales de su tarea. Al compartir su tarea con nosotros, mejoraremos el rendimiento de nuestro agente en tareas similares en el futuro.", "upload": "Subir", "attachFile": "adjuntar archivo", "submit": "Enviar", "submitting": "Enviando...", "alreadyRefunded": { "title": "Ya reembolsado", "message": "Esta tarea ya ha sido reembolsada. No puede solicitar un reembolso nuevamente." } }, "errors": { "systemError": "Error del sistema. Contacte a nuestro equipo de soporte.", "networkError": "Error de red. Verifica tu conexión e inténtalo de nuevo.", "noUsageData": "Datos de uso no encontrados. No se puede reembolsar.", "alreadyRefunded": "Esta tarea ya ha sido reembolsada.", "notAuthenticated": "Inicia sesión para solicitar un reembolso.", "unknownError": "Ocurrió un error inesperado. Inténtalo de nuevo más tarde.", "validationFailed": "No se puede validar tu razón ahora. Inténtalo de nuevo más tarde.", "invalidReason": "Razón rechazada. Por favor describe qué salió mal realmente." }, "confirmation": { "creditsRefunded": "{{count}} créditos reembolsados", "title": "Éxito", "message": "¡Gracias! Nuestro equipo diagnosticará su tarea y mejorará la experiencia de FlowithOS.", "messageNoShare": "¡Gracias! Nuestro equipo seguirá trabajando para mejorar la experiencia de FlowithOS." } } };
const gate$b = { "welcome": { "title": "Bienvenido a FlowithOS", "subtitle": "De la Web al Mundo, FlowithOS es el AgenticOS más inteligente que convierte tu navegador en valores del mundo real.", "features": { "execute": { "title": "Ejecuta Cualquier Tarea, Automáticamente", "description": "Actuando con intuición humana a velocidad de máquina, FlowithOS navega y ejecuta múltiples tareas en la web repetidamente." }, "transform": { "title": "Convierte Ideas en Impacto, Inteligentemente", "description": "De la inspiración a la creación de valor, FlowithOS transforma grandes ideas en acciones para entregar resultados reales." }, "organize": { "title": "Organiza Tus Activos, Sistemáticamente", "description": "De marcadores dispersos a manuales estructurados, FlowithOS te equipa con un sistema robusto para administrar, curar y escalar tus activos digitales." }, "evolve": { "title": "Evoluciona Contigo, Dinámicamente", "description": "Con una Memoria que crece de cada interacción, FlowithOS desarrolla Habilidades personalizadas—desde navegar sitios complejos hasta entender tu estilo personal." } }, "letsGo": "¡Vamos!" }, "auth": { "createAccount": "Crear una cuenta", "signInToFlowith": "Inicia sesión en tu cuenta Flowith", "oneAccount": "Una cuenta para todos los productos Flowith", "fromAnotherAccount": "Usar cuenta social", "useOwnEmail": "Usar mi correo", "email": "Correo electrónico", "password": "Contraseña", "confirmPassword": "Confirmar contraseña", "acceptTerms": "Acepto los Términos de Uso y Política de Privacidad de FlowithOS", "privacyNote": "Todos tus datos permanecen 100% seguros en tu dispositivo", "alreadyHaveAccount": "¿Ya tienes cuenta?", "createNewAccount": "¿No tienes cuenta?", "signUp": "Registrarse", "signIn": "Iniciar sesión", "processing": "Procesando...", "verifyEmail": "Verifica tu correo", "verificationCodeSent": "Hemos enviado un código de 6 dígitos a {{email}}", "enterVerificationCode": "Ingresa el código de verificación", "verificationCode": "Código de verificación", "enterSixDigitCode": "Ingresa el código de 6 dígitos", "backToSignUp": "Volver al registro", "verifying": "Verificando...", "verifyCode": "Verificar", "errors": { "enterEmail": "Ingresa tu correo electrónico", "enterPassword": "Ingresa tu contraseña", "confirmPassword": "Confirma tu contraseña", "passwordsDoNotMatch": "Las contraseñas no coinciden", "acceptTerms": "Debes aceptar los Términos de Uso y Política de Privacidad", "authFailed": "Error al iniciar sesión. Inténtalo de nuevo.", "invalidVerificationCode": "Ingresa un código de 6 dígitos válido", "verificationFailed": "Error de verificación. Inténtalo de nuevo.", "oauthFailed": "Error con el inicio de sesión social. Inténtalo de nuevo.", "userAlreadyExists": "Este correo ya está registrado, por favor " }, "goToLogin": "inicia sesión", "signInPrompt": "inicia sesión" }, "invitation": { "title": "El despertar requiere una llave", "subtitle": "Ingresa tu código de invitación para desbloquear FlowithOS", "lookingForInvite": "¿Buscas una invitación?", "followOnX": "Sigue a @flowith en X", "toGetAccess": "para obtener acceso.", "placeholder": "Ingresa el código de invitación", "invalidCode": "Código de invitación inválido", "verificationFailed": "Error de verificación - inténtalo de nuevo", "accessGranted": "Acceso concedido", "initializing": "Bienvenido a FlowithOS. Inicializando..." }, "browserImport": { "title": "Continúa donde lo dejaste", "subtitle": "Importa tus marcadores y sesiones guardadas de tus navegadores.", "detecting": "Detectando navegadores instalados...", "noBrowsers": "No se detectaron navegadores instalados", "imported": "Importado", "importing": "Importando...", "bookmarks": "marcadores", "importNote": "Tarda unos 5 segundos. Verás uno o dos avisos del sistema.", "skipForNow": "Omitir", "nextStep": "Siguiente" }, "settings": { "title": "¿Listo para empezar?", "subtitle": "Algunos ajustes rápidos para perfeccionar tu experiencia en Flowith OS.", "defaultBrowser": { "title": "Establecer como navegador predeterminado", "description": "Todos los enlaces se abrirán automáticamente en FlowithOS, integrando el contenido web en tu espacio de trabajo." }, "addToDock": { "title": "Agregar al Dock / Barra de tareas", "description": "Mantén acceso rápido cuando surja la inspiración." }, "launchAtStartup": { "title": "Iniciar automáticamente", "description": "Flowith OS se iniciará automáticamente al encender tu computadora." }, "helpImprove": { "title": "Ayúdanos a mejorar", "description": "Comparte datos de uso anónimos para ayudarnos a construir un mejor producto para todos.", "privacyNote": "Tu privacidad está completamente protegida." }, "canChangeSettingsLater": "Puedes cambiar esto después", "nextStep": "Siguiente", "privacy": { "title": "100% Almacenamiento Local y Protección de Privacidad", "description": "El historial de ejecución del Agente, historial de navegación, Memories y Skills, credenciales de cuentas y todos tus datos privados se almacenan 100% de forma local en tu dispositivo. Nada se sincroniza con servidores en la nube. Puedes usar FlowithOS con total tranquilidad." } }, "examples": { "title1": "El OS está despierto.", "title2": "Míralo en acción.", "subtitle": "Comienza con un ejemplo para ver cómo funciona.", "enterFlowithOS": "Comenzar a usar FlowithOS", "clickToReplay": "haz clic para ver este caso", "videoNotSupported": "Tu navegador no soporta reproducción de video.", "cases": { "shopping": { "title": "Compras de vacaciones 10x más rápidas", "description": "Llena tu carrito con regalos perfectos para mascotas automáticamente—ahorrándote más de 2 horas." }, "contentEngine": { "title": "Generador de contenido X 24/7", "description": "Descubre historias de Hacker News, escribe con tu estilo y publica automáticamente en X. Triplica las visitas al perfil y el crecimiento de la comunidad." }, "tiktok": { "title1": "Generador de engagement TikTok: 500+ interacciones,", "title2": "0 esfuerzo", "description": "Flowith OS comenta automáticamente en transmisiones populares con mensajes relevantes, transformando presencia digital en crecimiento real." }, "youtube": { "title": "Crecimiento automático de canal YouTube", "description": "Flowith OS automatiza todo el flujo de trabajo de YouTube sin mostrar el rostro, desde creación hasta engagement, reduciendo semanas de trabajo a menos de una hora." } } }, "oauth": { "connecting": "Conectando con {{provider}}", "completeInBrowser": "Completa el inicio de sesión en la ventana del navegador que acaba de abrirse.", "cancel": "Cancelar" }, "terms": { "title": "Términos de Uso y Política de Privacidad", "subtitle": "Por favor, revisa los términos a continuación.", "close": "Cerrar" }, "invitationCodes": { "title": "Mis Códigos de Invitación", "availableToShare": "{{unused}} de {{total}} disponibles para compartir", "loading": "Cargando tus códigos...", "noCodesYet": "Aún sin códigos de invitación.", "noCodesFound": "No se encontraron códigos de invitación", "failedToLoad": "No se pudieron cargar los códigos", "useCodeHint": "¡Usa un código de invitación para obtener tus propios códigos!", "shareHint": "Comparte estos códigos con amigos para invitarlos a FlowithOS", "used": "Usado" }, "history": { "title": "Historial", "searchPlaceholder": "Buscar en el historial...", "selectAll": "Seleccionar todo", "deselectAll": "Deseleccionar todo", "deleteSelected": "Eliminar seleccionados ({{count}})", "clearAll": "Borrar todo", "loading": "Cargando historial...", "noMatchingHistory": "No se encontró historial coincidente", "noHistoryYet": "Aún sin historial", "confirmDelete": "Confirmar eliminación", "deleteConfirmMessage": "¿Estás seguro de que quieres eliminar el historial seleccionado? Esta acción no se puede deshacer.", "cancel": "Cancelar", "delete": "Eliminar", "today": "Hoy", "yesterday": "Ayer", "earlier": "Anterior", "untitled": "Sin título", "visitedTimes": "Visitado {{count}} veces", "openInNewTab": "Abrir en nueva pestaña", "timePeriod": "Período", "timeRangeAll": "Todo", "timeRangeAllDesc": "Todo el historial de navegación", "timeRangeToday": "Hoy", "timeRangeTodayDesc": "Todo el historial de hoy", "timeRangeYesterday": "Ayer", "timeRangeYesterdayDesc": "Historial de ayer", "timeRangeLast7Days": "Últimos 7 días", "timeRangeLast7DaysDesc": "Historial de la semana pasada", "timeRangeThisMonth": "Este mes", "timeRangeThisMonthDesc": "Historial de este mes", "timeRangeLastMonth": "Mes pasado", "timeRangeLastMonthDesc": "Historial del mes pasado", "deleteTimeRange": "Eliminar {{range}}" } };
const update$b = { "checking": { "title": "Buscando actualizaciones", "description": "Conectando al servidor de actualizaciones..." }, "noUpdate": { "title": "Estás actualizado", "currentVersion": "Versión actual v{{version}}", "description": "Ya estás usando la versión más reciente", "close": "Cerrar" }, "available": { "title": "Nueva versión disponible", "version": "v{{version}} está disponible", "currentVersion": "(Actual: v{{current}})", "released": "Publicado {{time}}", "betaNote": "Estamos en beta pública y lanzamos mejoras a diario. Actualiza ahora para experimentar las últimas funciones.", "defaultReleaseNotes": "Esta versión beta incluye mejoras de rendimiento, corrección de errores y nuevas funciones. Lanzamos actualizaciones a diario. Actualiza ahora para la mejor experiencia.", "downloadNow": "Descargar ahora", "remindLater": "Recordar más tarde", "preparing": "Preparando..." }, "downloading": { "title": "Descargando actualización", "version": "Descargando v{{version}}", "progress": "Progreso de descarga", "hint": "Se te pedirá que instales cuando la descarga esté completa" }, "readyToInstall": { "title": "Listo para instalar", "downloaded": "v{{version}} se ha descargado completamente", "hint": "Reinicia para finalizar la instalación de la actualización", "restartNow": "Reiniciar ahora", "restartLater": "Reiniciar después", "restarting": "Reiniciando..." }, "error": { "title": "Error al buscar actualización", "default": "Actualización fallida. Inténtalo de nuevo más tarde.", "downloadFailed": "Descarga fallida. Inténtalo de nuevo más tarde.", "installFailed": "Instalación fallida. Inténtalo de nuevo más tarde.", "close": "Cerrar" }, "time": { "justNow": "justo ahora", "minutesAgo": "hace {{count}} minutos", "hoursAgo": "hace {{count}} horas" }, "notifications": { "newVersionAvailable": "Nueva versión {{version}} disponible", "downloadingInBackground": "Descargando en segundo plano", "updateDownloaded": "Actualización descargada", "readyToInstall": "Versión {{version}} lista para instalar" } };
const updateToast$b = { "checking": "Buscando actualizaciones...", "pleaseWait": "Por favor espera", "preparingDownload": "Preparando descarga {{version}}", "downloading": "Descargando actualización {{version}}", "updateCheckFailed": "Error al buscar actualizaciones", "unknownError": "Error desconocido", "updatedTo": "Actualizado a v{{version}}", "newVersionReady": "Nueva versión lista", "version": "Versión {{version}}", "close": "Cerrar", "gotIt": "Entendido", "installNow": "Reiniciar ahora", "restarting": "Reiniciando…", "later": "Más tarde", "collapseUpdateContent": "Contraer contenido de actualización", "viewUpdateContent": "Ver contenido de actualización", "collapseLog": "Contraer ^", "viewLog": "Ver registro >", "channelChangeFailed": "Error al cambiar de canal: {{error}}", "channelInfo": "Canal: {{channel}}, Manifest: {{manifest}}", "manualDownloadHint": "¿No se puede actualizar? Intente la instalación manual →", "channelDowngraded": { "title": "Canal Cambiado", "message": "Tu cuenta no tiene acceso a {{previousChannel}}. Cambiado automáticamente a {{newChannel}}." }, "time": { "justNow": "justo ahora", "minutesAgo": "hace {{count}} minutos", "hoursAgo": "hace {{count}} horas", "daysAgo": "hace {{count}} días", "weeksAgo": "hace {{count}} semanas", "monthsAgo": "hace {{count}} meses", "yearsAgo": "hace {{count}} años" } };
const errors$b = { "auth": { "notLoggedIn": "Por favor, inicia sesión primero", "loginRequired": "Por favor, inicia sesión antes de usar esta función", "shareRequiresLogin": "Por favor, inicia sesión antes de usar la función de compartir" }, "network": { "networkError": "Error de red - verifica tu conexión", "requestTimeout": "Tiempo de espera agotado - inténtalo de nuevo", "failedToVerify": "Fallo al verificar", "failedToFetch": "Fallo al obtener" }, "invitation": { "invalidCode": "Código de invitación inválido", "verificationFailed": "Verificación fallida - inténtalo de nuevo", "failedToConsume": "Fallo al consumir código de invitación" }, "download": { "downloadFailed": "Descarga fallida", "downloadInterrupted": "Descarga interrumpida" }, "security": { "secureConnection": "Conexión segura", "notSecure": "No seguro", "localFile": "Archivo local", "unknownProtocol": "Protocolo desconocido" } };
const menus$b = { "application": { "about": "Acerca de {{appName}}", "checkForUpdates": "Buscar actualizaciones...", "settings": "Configuración...", "services": "Servicios", "hide": "Ocultar {{appName}}", "hideOthers": "Ocultar otros", "showAll": "Mostrar todo", "quit": "Salir", "updateChannel": "Canal de actualizaciones" }, "edit": { "label": "Editar", "undo": "Deshacer", "redo": "Rehacer", "cut": "Cortar", "paste": "Pegar", "selectAll": "Seleccionar todo" }, "view": { "label": "Ver", "findInPage": "Buscar en la página", "newTab": "Nueva pestaña", "reopenClosedTab": "Reabrir pestaña cerrada", "newTerminalTab": "Nueva pestaña de terminal", "openLocalFile": "Abrir archivo local...", "goBack": "Atrás", "goForward": "Adelante", "viewHistory": "Ver historial", "viewDownloads": "Ver descargas", "archive": "Archivar", "reload": "Recargar", "forceReload": "Forzar recarga", "actualSize": "Tamaño real", "zoomIn": "Ampliar", "zoomOut": "Reducir", "toggleFullScreen": "Alternar pantalla completa" }, "window": { "label": "Ventana", "minimize": "Minimizar", "close": "Cerrar", "bringAllToFront": "Traer todo al frente" }, "help": { "label": "Ayuda", "about": "Acerca de", "version": "Versión", "aboutDescription1": "El Sistema Operativo de Agente de IA de próxima generación", "aboutDescription2": "construido para la auto-mejora, la memoria y la velocidad.", "copyright": "© 2025 Flowith, Inc. Todos los derechos reservados." }, "contextMenu": { "back": "Atrás", "forward": "Adelante", "reload": "Recargar", "hardReload": "Forzar recarga (ignorar caché)", "openLinkInNewTab": "Abrir enlace en nueva pestaña", "openLinkInExternal": "Abrir enlace en navegador externo", "copyLinkAddress": "Copiar dirección del enlace", "downloadLink": "Descargar enlace", "openImageInNewTab": "Abrir imagen en nueva pestaña", "copyImageAddress": "Copiar dirección de la imagen", "copyImage": "Copiar imagen", "downloadImage": "Descargar imagen", "downloadVideo": "Descargar video", "downloadAudio": "Descargar audio", "openMediaInNewTab": "Abrir medio en nueva pestaña", "copyMediaAddress": "Copiar dirección del medio", "openFrameInNewTab": "Abrir marco en nueva pestaña", "openInExternal": "Abrir en navegador externo", "copyPageURL": "Copiar URL de la página", "viewPageSource": "Ver código fuente de la página (nueva pestaña)", "savePageAs": "Guardar página como...", "print": "Imprimir...", "cut": "Cortar", "paste": "Pegar", "searchWebFor": 'Buscar en la web "{{text}}"', "selectAll": "Seleccionar todo", "inspectElement": "Inspeccionar elemento", "openDevTools": "Abrir herramientas de desarrollo", "closeDevTools": "Cerrar herramientas de desarrollo" }, "fileDialog": { "openLocalFile": "Abrir archivo local", "unsupportedFileType": "Tipo de archivo no compatible", "savePageAs": "Guardar página como", "allSupportedFiles": "Todos los archivos compatibles", "htmlFiles": "Archivos HTML", "textFiles": "Archivos de texto", "images": "Imágenes", "videos": "Videos", "audio": "Audio", "pdf": "PDF", "webpageComplete": "Página web, completa", "singleFile": "Archivo único (MHTML)" } };
const dialogs$b = { "crash": { "title": "Error de aplicación", "message": "Ha ocurrido un error inesperado", "detail": "{{error}}\n\nEl error se ha registrado para depuración.", "restart": "Reiniciar", "close": "Cerrar" }, "customBackground": { "title": "Fondo personalizado", "subtitle": "Crea tu propio estilo", "preview": "Vista previa", "angle": "Ángulo", "stops": "Gradiente", "selectImage": "Seleccionar imagen", "uploading": "Subiendo...", "dropImageHere": "Suelta la imagen aquí", "dragAndDrop": "Arrastra y suelta o haz clic", "fileTypes": "PNG, JPG, JPEG, WEBP, SVG, GIF", "fit": "Ajustar", "cover": "Cubrir", "contain": "Contener", "fill": "Rellenar", "remove": "Eliminar", "cancel": "Cancelar", "apply": "Aplicar", "gradient": "Gradiente", "solid": "Sólido", "image": "Imagen", "dropImageError": "Por favor, suelta un archivo de imagen (PNG, JPG, JPEG, WEBP, SVG, GIF)" } };
const humanInput$b = { "declinedToAnswer": "El usuario rechazó responder, pregunta omitida", "needOneInput": "Se necesita 1 entrada para continuar", "needTwoInputs": "Necesitamos tu ayuda con 2 cosas", "needThreeInputs": "Se necesitan 3 decisiones tuyas", "waitingOnInputs": "Esperando {{count}} entradas tuyas", "declineToAnswer": "Rechazar responder", "dropFilesHere": "Suelta archivos aquí", "typeYourAnswer": "Escribe tu respuesta...", "orTypeCustom": "O escribe personalizado...", "uploadFiles": "Subir archivos", "previousQuestion": "Pregunta anterior", "goToQuestion": "Ir a la pregunta {{number}}", "nextQuestion": "Siguiente pregunta" };
const es = {
  common: common$b,
  nav: nav$b,
  tray: tray$b,
  actions: actions$b,
  status: status$b,
  time: time$b,
  downloads: downloads$b,
  history: history$b,
  invitationCodes: invitationCodes$b,
  tasks: tasks$b,
  flows: flows$b,
  bookmarks: bookmarks$b,
  conversations: conversations$b,
  intelligence: intelligence$b,
  sidebar: sidebar$b,
  tabs: tabs$b,
  userMenu: userMenu$b,
  settings: settings$b,
  updateSettings: updateSettings$b,
  adblock: adblock$b,
  blank: blank$b,
  agentGuide: agentGuide$b,
  reward: reward$b,
  agentWidget: agentWidget$b,
  gate: gate$b,
  update: update$b,
  updateToast: updateToast$b,
  errors: errors$b,
  menus: menus$b,
  dialogs: dialogs$b,
  humanInput: humanInput$b
};
const common$a = { "ok": "OK", "cancel": "Annuler", "start": "Démarrer", "delete": "Supprimer", "close": "Fermer", "save": "Enregistrer", "search": "Rechercher", "loading": "Chargement", "pressEscToClose": "Appuyez sur ÉCHAP pour fermer", "copyUrl": "Copier l'URL", "copied": "Copié", "copy": "Copier", "expand": "Développer", "collapse": "Réduire", "openFlowithWebsite": "Ouvrir le site Flowith", "openAgentGuide": "Ouvrir le Guide Agent", "reward": "Récompense", "closeWindow": "Fermer la fenêtre", "minimizeWindow": "Réduire la fenêtre", "toggleFullscreen": "Basculer en plein écran", "saveEnter": "Enregistrer (Entrée)", "cancelEsc": "Annuler (Échap)", "time": { "justNow": "à l'instant", "minutesAgo": "il y a {{count}} minute", "minutesAgo_other": "il y a {{count}} minutes", "hoursAgo": "il y a {{count}} heure", "hoursAgo_other": "il y a {{count}} heures", "daysAgo": "il y a {{count}} jour", "daysAgo_other": "il y a {{count}} jours" } };
const nav$a = { "tasks": "Tâches", "flows": "Flux", "bookmarks": "Favoris", "intelligence": "Intelligence", "guide": "Guide" };
const tray$a = { "newTask": "Nouvelle Tâche", "recentTasks": "Tâches Récentes", "viewMore": "Voir Plus", "showMainWindow": "Afficher la Fenêtre Principale", "hideMainWindow": "Masquer la Fenêtre Principale", "quit": "Quitter" };
const actions$a = { "resume": "Reprendre", "pause": "Mettre en pause", "cancel": "Annuler", "delete": "Supprimer", "archive": "Archiver", "showInFolder": "Afficher dans le dossier", "viewDetails": "Voir les détails", "openFile": "Ouvrir le fichier" };
const status$a = { "inProgress": "En cours", "completed": "Terminé", "archive": "Archive", "paused": "En pause", "failed": "Échec", "cancelled": "Annulé", "running": "En cours d'exécution", "wrappingUp": "Finalisation..." };
const time$a = { "today": "Aujourd'hui", "yesterday": "Hier", "earlier": "Plus ancien" };
const downloads$a = { "title": "Téléchargements", "all": "Tous", "inProgress": "En cours", "completed": "Terminés", "noDownloads": "Aucun téléchargement", "failedToLoad": "Échec du chargement des téléchargements", "deleteConfirmMessage": "Êtes-vous sûr de vouloir supprimer les téléchargements sélectionnés ? Cette action est irréversible.", "loadingDownloads": "Chargement des téléchargements...", "searchPlaceholder": "Rechercher des téléchargements...", "selectAll": "Tout sélectionner", "deselectAll": "Tout désélectionner", "deleteSelected": "Supprimer la sélection ({{count}})", "clearAll": "Tout effacer", "noMatchingDownloads": "Aucun téléchargement correspondant", "noDownloadsYet": "Aucun téléchargement pour le moment", "confirmDelete": "Confirmer la suppression", "cancel": "Annuler", "delete": "Supprimer" };
const history$a = { "title": "Historique", "allTime": "Tout l'historique", "clearHistory": "Effacer l'historique", "removeItem": "Supprimer l'élément", "failedToLoad": "Échec du chargement de l'historique", "failedToClear": "Échec de la suppression de l'historique", "searchPlaceholder": "Rechercher dans l'historique...", "selectAll": "Tout sélectionner", "deselectAll": "Tout désélectionner", "deleteSelected": "Supprimer la sélection ({{count}})", "clearAll": "Tout effacer", "noMatchingHistory": "Aucun historique correspondant", "noHistoryYet": "Aucun historique pour le moment", "confirmDelete": "Confirmer la suppression", "deleteConfirmMessage": "Êtes-vous sûr de vouloir supprimer l'historique sélectionné ? Cette action est irréversible.", "cancel": "Annuler", "delete": "Supprimer", "today": "Aujourd'hui", "yesterday": "Hier", "earlier": "Plus ancien", "untitled": "Sans titre", "visitedTimes": "Visité {{count}} fois", "openInNewTab": "Ouvrir dans un nouvel onglet", "loading": "Chargement de l'historique...", "timePeriod": "Période", "timeRangeAll": "Tout", "timeRangeAllDesc": "Tout l'historique de navigation", "timeRangeToday": "Aujourd'hui", "timeRangeTodayDesc": "Tout l'historique d'aujourd'hui", "timeRangeYesterday": "Hier", "timeRangeYesterdayDesc": "Historique d'hier", "timeRangeLast7Days": "7 derniers jours", "timeRangeLast7DaysDesc": "Historique de la semaine passée", "timeRangeThisMonth": "Ce mois-ci", "timeRangeThisMonthDesc": "Historique de ce mois", "timeRangeLastMonth": "Le mois dernier", "timeRangeLastMonthDesc": "Historique du mois dernier", "deleteTimeRange": "Supprimer {{range}}", "last7days": "7 derniers jours", "thisMonth": "Ce mois-ci", "lastMonth": "Le mois dernier" };
const invitationCodes$a = { "title": "Mes codes d'invitation", "availableToShare": "{{unused}} sur {{total}} disponibles", "loading": "Chargement de vos codes...", "noCodesYet": "Aucun code d'invitation pour le moment.", "noCodesFound": "Aucun code d'invitation trouvé", "failedToLoad": "Échec du chargement des codes d'invitation", "useCodeHint": "Utilisez un code d'invitation pour obtenir vos propres codes !", "shareHint": "Partagez ces codes avec vos amis pour les inviter sur FlowithOS", "used": "Utilisé" };
const tasks$a = { "title": "Tâche", "description": "Vous pouvez stocker toutes vos tâches ici", "transformToPreset": "Transformer en préréglage", "noTasks": "Aucune tâche", "archiveEmpty": "L'archive est vide" };
const flows$a = { "title": "Flux", "description": "Tous vos canevas sont affichés ici", "newFlow": "Nouveau flux", "rename": "Renommer", "leave": "Quitter", "noFlows": "Aucun flux", "signInToViewFlows": "Connectez-vous pour voir vos flux", "pin": "Épingler", "unpin": "Détacher" };
const bookmarks$a = { "title": "Favoris", "description": "Vous pouvez sauvegarder tous les onglets que vous aimez", "bookmark": "Favori", "addNewCollection": "Ajouter une nouvelle collection", "loadingBookmarks": "Chargement des favoris...", "noMatchingBookmarks": "Aucun favori correspondant", "noBookmarksYet": "Aucun favori pour le moment", "importFromBrowsers": "Importer depuis les navigateurs", "detectingBrowsers": "Détection des navigateurs...", "bookmarksCount": "favoris", "deleteCollection": "Supprimer la collection", "deleteCollectionConfirm": "Êtes-vous sûr de vouloir supprimer cette collection ?", "newCollection": "Nouvelle collection", "enterCollectionName": "Entrez un nom pour la nouvelle collection", "create": "Créer", "collectionName": "Nom de la collection", "saveEnter": "Enregistrer (Entrée)", "cancelEsc": "Annuler (Échap)", "renameFolder": "Renommer le dossier", "renameBookmark": "Renommer le favori", "deleteFolder": "Supprimer le dossier", "deleteBookmark": "Supprimer le favori" };
const conversations$a = { "title": "Conversations", "noConversations": "Aucune conversation pour le moment" };
const intelligence$a = { "title": "Intelligence", "description": "Faites évoluer votre Agent avec des compétences et des mémoires", "knowledgeBase": "Base de connaissances", "memory": "Mémoire", "skill": "Compétence", "createNewSkill": "Créer une nouvelle compétence", "createNewMemory": "Créer une nouvelle mémoire", "loading": "Chargement...", "noSkills": "Aucune compétence", "noMemories": "Aucune mémoire", "readOnly": "Lecture seule", "readOnlyMessage": "Cette compétence système améliore les performances de votre Agent. Elle ne peut pas être modifiée directement, mais vous pouvez la dupliquer pour créer votre propre version. Attention : les modifications ne seront pas enregistrées.", "readOnlyToast": "Cette compétence système ne peut pas être modifiée directement. Dupliquez-la pour créer votre propre version modifiable.", "open": "Ouvrir", "kbComingSoon": "Le support de la base de connaissances Flowith arrive bientôt.", "system": "Système", "learnFromUser": "Utilisateur", "systemPresetReadOnly": "Préréglage système (lecture seule)", "actions": "Actions", "rename": "Renommer", "duplicate": "Dupliquer…", "info": "Info", "saving": "Enregistrement...", "fileInfo": "Informations du fichier", "fileName": "Nom", "fileSize": "Taille", "fileCreated": "Créé", "fileModified": "Modifié", "fileType": "Type", "fileLocation": "Emplacement", "copyPath": "Copier le chemin", "empowerOS": "Mode d'Enseignement", "teachMakesBetter": "L'enseignement améliore l'OS", "teachMode": "Mode Enseignement", "teachModeDescription": "En mode Enseignement, enregistrez vos workflows web pendant que l'OS Agent observe et apprend, puis transforme vos actions en compétences et savoir‑faire réutilisables.", "teachModeGoalLabel": "Objectif de la tâche (facultatif)", "teachModeGoalPlaceholder": "Fournissez davantage de contexte pour l’apprentissage de l’OS — un objectif concret ou toute information pertinente.", "teachModeTaskDisabled": "La création de nouvelles tâches est désactivée pendant le mode Enseignement.", "empowering": "Enseignement", "empoweringDescription": "L’OS Agent observera et apprendra pendant votre démonstration", "yourGoal": "Objectif de la tâche", "preset": "Préréglage", "generatedSkills": "Compétences générées", "showLess": "Masquer", "showMore": "Afficher plus", "osHasLearned": "L'OS a appris", "complete": "Terminer", "interactionsPlaceholder": "Vos interactions s'afficheront ici au fur et à mesure de votre démonstration.", "done": "Terminé", "generatingGuidance": "Génération des conseils...", "summarizingInteraction": "Nous résumons chaque interaction et préparons une compétence réutilisable.", "skillSaved": "Compétence enregistrée", "goal": "Objectif", "steps": "Étapes", "events": "Événements", "guidanceSavedSuccessfully": "Conseils enregistrés avec succès.", "openGuidanceInComposer": "Ouvrir les conseils dans Composer", "recordAnotherWorkflow": "Enregistrer un autre flux de travail", "dismissSummary": "Fermer le résumé", "saveAndTest": "Enregistrer et tester", "learning": "Apprentissage...", "teachModeError": "Le mode enseignement a rencontré un problème", "errorDetails": "Détails de l'erreur", "checkNetworkConnection": "Vérifiez votre connexion réseau et réessayez de démarrer le mode enseignement.", "tryAgain": "Réessayer", "resetState": "Réinitialiser l'état", "completeConfirmTitle": "Formation de l'OS terminée", "completeConfirmMessage": "Vous pouvez choisir le résultat souhaité dans la liste ci-dessous.", "capturedEvents": "Événements capturés", "confirmAndGenerate": "Générer", "generating": "Génération", "promptSummary": "Résumé du prompt", "saveToPreset": "Enregistrer dans le préréglage", "skillHostname": "Compétence : {{hostname}}", "saveToSkill": "Enregistrer dans la compétence", "selectAll": "Tout sélectionner", "discard": "Abandonner", "confirmDiscard": "Oui, abandonner", "tutorial": { "title": "Bienvenue dans le Mode d'Enseignement", "next": "Suivant", "gotIt": "Compris", "guideLabel": "Guide du Mode d'Enseignement", "page1": { "title": "Qu'est-ce que les compétences et le mode d'enseignement ?", "description": "Les compétences regroupent le savoir-faire réutilisable que tout agent peut appliquer. Chaque compétence est un guide pratique (avec d'éventuels extraits de code) sur une application web, un workflow ou un type d'interaction. Elles améliorent les performances de l'OS sur certains sites ou tâches spécifiques.\n\nLe mode d'enseignement vous permet d'entraîner l'OS en lui montrant vos routines. Celles-ci seront sauvegardées sous forme de <strong>compétences et préréglages</strong> réutilisables à volonté." }, "page2": { "title": "Comment démarrer le mode d'enseignement ?", "description": "Cliquez sur '<strong>Mode d'Enseignement</strong>' dans le '<strong>panneau Intelligence</strong>' à gauche. Définissez d'abord un <strong>Objectif</strong> qui guide l'OS et structure votre démonstration." }, "page3": { "title": "Comment l'OS apprend-il vos mouvements ?", "description": "L'OS observe vos actions et suit votre curseur en temps réel. Chaque étape apparaît dans le panneau de gauche. Vous pouvez mettre en pause à tout moment, puis cliquer sur '<strong>Arrêter</strong>' (icône rouge) quand c'est fini." }, "page4": { "title": "Quels sont les résultats de l'apprentissage de l'OS ?", "description": "À la fin, choisissez le type de résultat à générer. En général, un préréglage et des compétences sont créés pour les tâches courantes. Vous pourrez les consulter et modifier dans <strong>Composer</strong>, ou les retrouver dans '<strong>Apprendre de l'utilisateur</strong>' (panneau <strong>Intelligence</strong>)." } }, "skillTooltip": "Vous pouvez réviser ou modifier la compétence ci-dessous", "skillSectionTooltip": "Chaque compétence prend le nom du site utilisé pendant la session. Les nouvelles compétences apparaissent sous forme de sections dans le fichier markdown correspondant." };
const sidebar$a = { "goBack": "Retour", "goForward": "Suivant", "lockSidebar": "Verrouiller la barre latérale", "unlockSidebar": "Déverrouiller la barre latérale", "searchOrEnterAddress": "Rechercher ou entrer une adresse", "reload": "Actualiser" };
const tabs$a = { "openNewBlankPage": "Ouvrir une nouvelle page vierge", "newTab": "Nouvel onglet", "terminal": "Terminal", "pauseAgent": "Mettre l'Agent en pause", "resumeAgent": "Reprendre l'Agent" };
const userMenu$a = { "upgrade": "Mettre à niveau", "creditsLeft": "restants", "clickToManageSubscription": "Cliquez pour gérer l'abonnement", "theme": "Thème", "lightMode": "Mode clair", "darkMode": "Mode sombre", "systemMode": "Mode système", "language": "Langue", "settings": "Paramètres", "invitationCode": "Code d'invitation", "checkUpdates": "Vérifier les mises à jour", "contactUs": "Nous contacter", "signOut": "Se déconnecter", "openUserMenu": "Ouvrir le menu utilisateur", "signIn": "Se connecter" };
const settings$a = { "title": "Paramètres", "history": "Historique", "downloads": "Téléchargements", "adblock": "Bloqueur de Pub", "language": "Langue", "languageDescription": "Choisissez votre langue préférée pour l'interface. Les modifications prennent effet immédiatement.", "softwareUpdate": "Mise à Jour du Logiciel" };
const updateSettings$a = { "description": "Flowith OS vous maintient à jour avec des mises à jour sûres et fiables. Choisissez votre canal : Stable pour la fiabilité, Beta pour les fonctionnalités précoces ou Alpha pour les builds de pointe. Vous ne pouvez passer qu'aux canaux auxquels votre compte a accès.", "currentVersion": "Version actuelle : {{version}}", "loadError": "Échec du chargement", "warning": "Avertissement : Les builds Beta/Alpha peuvent être instables et affecter votre travail. Utilisez Stable pour la production.", "channel": { "label": "Canal de Mise à Jour", "hint": "Seuls les canaux auxquels vous avez accès peuvent être sélectionnés.", "disabledHint": "Impossible de changer de canal pendant qu'une mise à jour est en cours", "options": { "stable": "Stable", "beta": "Beta", "alpha": "Alpha" } }, "actions": { "title": "Vérification Manuelle", "hint": "Vérifier les mises à jour disponibles maintenant.", "check": "Vérifier les mises à jour" }, "status": { "noUpdate": "Vous êtes à jour.", "hasUpdate": "Nouvelle version disponible.", "error": "Échec de la vérification des mises à jour." }, "tips": { "title": "Conseils", "default": "Par défaut, recevez des notifications pour les mises à jour stables. Dans Early Access, les builds pré-lancement peuvent être instables pour le travail de production.", "warningTitle": "Un Avertissement : Les Mises à Jour Nightly s'Appliquent Automatiquement", "warningBody": "Les builds Nightly téléchargeront et installeront silencieusement les mises à jour sans demander lorsque Cursor est fermé." } };
const adblock$a = { "title": "Bloqueur de Publicités", "description": "Bloquez les publicités intrusives et les trackers, filtrez le bruit des pages, permettant à Neo OS Agent de comprendre et d'extraire les informations plus précisément tout en protégeant votre vie privée.", "enable": "Activer le Bloqueur de Publicités", "enableDescription": "Bloquer automatiquement les publicités sur tous les sites", "statusActive": "Actif - Les publicités sont bloquées", "statusInactive": "Inactif - Les publicités ne sont pas bloquées", "adsBlocked": "publicités bloquées", "networkBlocked": "Requêtes Réseau", "cosmeticBlocked": "Éléments Cachés", "filterRules": "Règles de Filtre", "activeRules": "règles actives" };
const blank$a = { "openNewPage": "Ouvrir une nouvelle page vierge", "selectBackground": "Sélectionner l'arrière-plan", "isAwake": "est éveillé", "osIsAwake": "L'OS est éveillé", "osGuideline": "Guide de l'OS", "osGuidelineDescription": "Démarrage rapide avec notre OS Agent - architecture, modes et tout ce qu'il peut faire.", "intelligence": "Mode d'Enseignement", "intelligenceDescription": "Enseignez à l'OS Agent vos workflows pour les réutiliser automatiquement", "inviteAndEarn": "Inviter et gagner", "tagline": "Avec une mémoire active qui évolue à chaque action pour vraiment vous comprendre.", "taskPreset": "Préréglage de tâche", "credits": "+{{amount}} crédits", "addPreset": "Ajouter un nouveau préréglage", "editPreset": "Modifier le préréglage", "deletePreset": "Supprimer le préréglage", "removeFromHistory": "Retirer de l'historique", "previousPreset": "Préréglage précédent", "nextPreset": "Préréglage suivant", "previousPresets": "Préréglages précédents", "nextPresets": "Préréglages suivants", "createPreset": "Créer un préréglage", "presetName": "Nom du préréglage", "instruction": "Instruction", "presetNamePlaceholderCreate": "ex. : Rapport hebdomadaire, Revue de code, Analyse de données...", "presetNamePlaceholderEdit": "Entrez le nom du préréglage...", "instructionPlaceholderCreate": "Décrivez ce que vous voulez que l'OS fasse...\nex. : «Analyser les données de vente de cette semaine et créer un rapport récapitulatif»", "instructionPlaceholderEdit": "Mettez à jour les instructions de votre tâche...", "colorBlue": "Bleu", "colorGreen": "Vert", "colorYellow": "Jaune", "colorRed": "Rouge", "selectColor": "Sélectionner la couleur {{color}}", "creating": "Création...", "updating": "Mise à jour...", "create": "Créer", "update": "Mettre à jour", "smartInputPlaceholder": "Naviguez, recherchez ou laissez Neo prendre le relais...", "processing": "Traitement…", "navigate": "Naviguer", "navigateDescription": "Ouvrir cette adresse dans l'onglet actuel", "searchGoogle": "Rechercher sur Google", "searchGoogleDescription": "Rechercher avec Google", "runTask": "Exécuter la tâche", "runTaskDescription": "Exécuter avec l'Agent Neo", "createCanvas": "Demander dans Canvas", "createCanvasDescription": "Ouvrir le canvas Flo avec ce prompt" };
const agentGuide$a = { "title": "Guide de l'Agent", "subtitle": "Démarrage visuel rapide pour l'OS Agent : architecture, modes et capacités complètes.", "capabilities": { "heading": "Capacités", "navigate": { "title": "Naviguer", "desc": "Ouvrir des pages, aller en arrière/avant" }, "click": { "title": "Cliquer", "desc": "Interagir avec boutons et liens" }, "type": { "title": "Saisir", "desc": "Remplir les champs et formulaires" }, "keys": { "title": "Touches", "desc": "Entrée, Échap, raccourcis" }, "scroll": { "title": "Défiler", "desc": "Parcourir les longues pages" }, "tabs": { "title": "Onglets", "desc": "Marquer, basculer, fermer" }, "files": { "title": "Fichiers", "desc": "Écrire, lire, télécharger" }, "skills": { "title": "Compétences", "desc": "Savoir-faire partagé" }, "memories": { "title": "Mémoires", "desc": "Préférences long terme" }, "upload": { "title": "Téléverser", "desc": "Envoyer des fichiers aux pages" }, "ask": { "title": "Demander", "desc": "Confirmations utilisateur rapides" }, "onlineSearch": { "title": "Recherche en ligne", "desc": "Consultation web rapide" }, "extract": { "title": "Extraire", "desc": "Obtenir des infos structurées" }, "deepThink": { "title": "Réflexion profonde", "desc": "Analyse structurée" }, "vision": { "title": "Vision", "desc": "Opérations précises hors DOM" }, "shell": { "title": "Shell", "desc": "Exécuter des commandes (si disponible)" }, "report": { "title": "Rapport", "desc": "Terminer et résumer" } }, "benchmark": { "title": "Benchmark Online‑Mind2Web", "subtitle": "Flowith Neo AgentOS domine la compétition avec des performances ", "subtitleHighlight": "quasi parfaites", "subtitleEnd": ".", "openai": "OpenAI Operator", "gemini": "Gemini 2.5 Computer Use", "flowith": "Flowith Neo OS", "average": "Moyenne", "easy": "Facile", "medium": "Moyen", "hard": "Difficile" }, "skillsMemories": { "heading": "Compétences et mémoires", "description": "Guides réutilisables et contexte long terme que Neo référence automatiquement en mode Pro.", "markdownTag": "Markdown .md", "autoIndexedTag": "Auto-indexé", "citationsTag": "Citations dans les logs", "howNeoUses": "Comment Neo les utilise : avant chaque étape en mode Pro, Neo vérifie les compétences et mémoires pertinentes, les fusionne dans le contexte de raisonnement et applique automatiquement les instructions ou préférences.", "skillsTitle": "Compétences", "skillsTag": "Partagé", "skillsDesc": "Stockez du savoir-faire réutilisable que tout Agent peut appliquer. Chaque compétence est un guide court sur un outil, flux de travail ou modèle.", "skillsProcedures": "Idéal pour : procédures", "skillsFormat": "Format : Markdown", "skillsScenario": "Scénario quotidien", "skillsScenarioTitle": "Convertir et partager des médias", "skillsStep1": "Vous dites : «Transforme ces 20 images en PDF compact.»", "skillsStep2": "Neo suit la compétence pour téléverser, convertir, attendre la fin et enregistrer le fichier.", "skillsOutcome": "Résultat : un PDF prêt à partager avec un lien de téléchargement dans les logs.", "memoriesTitle": "Mémoires", "memoriesTag": "Personnel", "memoriesDesc": "Capturez vos préférences, profil et faits métier. Neo référence les éléments pertinents lors des décisions et les cite dans les logs.", "memoriesStyle": "Idéal pour : style, règles", "memoriesPrivate": "Privé par défaut", "memoriesScenario": "Scénario quotidien", "memoriesScenarioTitle": "Voix et ton d'écriture", "memoriesStep1": "Vous aimez un texte concis, amical avec un ton optimiste.", "memoriesStep2": "Neo l'applique automatiquement dans les e-mails, rapports et publications sociales.", "memoriesOutcome": "Résultat : une voix de marque cohérente sans répéter les instructions.", "taskFilesTitle": "Fichiers de tâche", "taskFilesTag": "Par tâche", "taskFilesDesc": "Fichiers temporaires créés pendant la tâche actuelle. Ils facilitent l'I/O des outils et les résultats intermédiaires et ne sont pas automatiquement partagés avec d'autres tâches.", "taskFilesEphemeral": "Éphémère", "taskFilesReadable": "Lisible par les outils", "taskFilesScenario": "Scénario quotidien", "taskFilesScenarioTitle": "Suivi des prix de voyage", "taskFilesStep1": "Neo extrait les tableaux de vols et les stocke en CSV pour cette tâche.", "taskFilesStep2": "Compare les tarifs d'aujourd'hui à ceux d'hier et met en évidence les changements.", "taskFilesOutcome": "Résultat : un résumé clair et un CSV téléchargeable." }, "system": { "title": "Neo OS - l'Agent navigateur le plus intelligent pour vous", "tagline": "Auto-évolutif × Mémoire et compétence × Vitesse et intelligence", "selfEvolving": "Auto-évolutif", "intelligence": "Intelligence", "contextImprovement": "Amélioration du contexte", "contextDesc": "L'Agent réflexif affine le contexte en temps réel grâce au système de compétences", "onlineRL": "RL en ligne", "onlineRLDesc": "Mises à jour périodiques alignées avec les comportements de l'Agent", "intelligentMemory": "Mémoire intelligente", "architecture": "Architecture", "dualLayer": "Système double couche", "dualLayerDesc": "Tampons court terme + mémoire épisodique long terme", "knowledgeTransfer": "Transfert de connaissances", "knowledgeTransferDesc": "Conserver, réutiliser et transférer l'apprentissage entre les tâches", "highPerformance": "Haute performance", "infrastructure": "Infrastructure", "executionKernel": "Noyau d'exécution", "executionKernelDesc": "Orchestration parallèle et planification dynamique", "speedCaching": "Mise en cache rapide", "speedCachingDesc": "Réponse en millisecondes avec exécution en temps réel", "speedIndicator": "~1ms", "summary": "Évolutif · Persistant · Rapide" }, "arch": { "heading": "Architecture", "subtitle": "OS centré Agent : CPU (Planificateur) + Mémoire/Système de fichiers + Compétences + E/S", "agentCentricNote": "FlowithOS est conçu pour les Agents.", "osShell": "OS Shell", "agentCore": "Cœur de l'Agent", "plannerExecutor": "Planificateur · Exécuteur", "browserTabs": "Onglets du navigateur", "domCanvas": "DOM · Canvas", "filesMemoriesSkills": "Fichiers · Mémoires · Compétences", "domPageTabs": "DOM · Page · Onglets", "clickTypeScroll": "Cliquer · Saisir · Défiler", "visionNonDOM": "Vision · Opérations hors DOM", "captchaDrag": "CAPTCHA · Glisser", "onlineSearchThinking": "Recherche en ligne · Réflexion profonde", "googleAnalysis": "google · analyse", "askUserReport": "Demander à l'utilisateur · Rapport", "choicesDoneReport": "choices · done_and_report", "skillsApps": "Compétences (Apps)", "skillsKinds": "Système · Utilisateur · Partagé", "memory": "Mémoire", "memoryKinds": "Court terme · Long terme", "filesystem": "Système de fichiers", "filesystemKinds": "Fichiers de tâche · Ressources · Logs", "cpuTitle": "CPU — Agent de planification", "cpuSub": "Planificateur · Exécuteur · Réflecteur", "planRow": "Planifier → Décomposer → Router", "execRow": "Exécuter → Observer → Réfléchir", "ioTitle": "Capacités E/S", "browserUse": "Utilisation navigateur", "browserUseDesc": "DOM · Onglets · Vision · CAPTCHA", "terminalUse": "Utilisation terminal", "terminalUseDesc": "Shell · Outils · Scripts", "scriptUse": "Utilisation scripts", "scriptUseDesc": "Python · JS · Workers", "osVsHumanTitle": "OS Agent vs OS centré humain", "osVsHuman1": "Les apps deviennent des compétences : conçues pour être lues par les Agents, pas des IU", "osVsHuman2": "Le CPU planifie/exécute via E/S ; l'utilisateur supervise au niveau tâche", "osVsHuman3": "La mémoire persiste entre les tâches ; le système de fichiers supporte l'E/S des outils" }, "tips": { "heading": "Conseils", "beta": "FlowithOS est actuellement en version bêta ; le produit et l'Agent Neo sont continuellement mis à jour. Restez à l'écoute des dernières nouveautés.", "improving": "Les capacités de l'Agent Neo OS s'améliorent jour après jour, vous pouvez essayer d'utiliser les nouvelles capacités pour accomplir vos tâches." } };
const reward$a = { "helloWorld": "Hello World", "helloWorldDesc": "C'est votre moment «Hello World» dans la nouvelle ère.<br />Soyez parmi les premiers à façonner l'Internet des Agents dans l'histoire humaine.", "get2000Credits": "Réclamez vos 2 000 crédits bonus", "equivalent7Days": "Et automatisez votre gestion des réseaux sociaux pendant 7 jours.", "shareInstructions": "Une fois éveillé, présentez votre Agent personnel au monde.<br />NeoOS créera et publiera automatiquement un message «Hello World» sur X pour vous<br />tout comme tout ce qu'il pourra faire pour vous plus tard.<br /><span style='display: block; height: 8px;'></span>Asseyez-vous et regardez-le faire.", "osComing": "L'OS arrive", "awakeOS": "Éveiller l'OS", "page2Title": "Inviter et gagner", "page2Description1": "Un grand voyage est meilleur avec des compagnons.", "page2Description2": "Pour chaque ami qui rejoint, vous recevrez", "page2Description3": "des crédits pour alimenter vos propres réflexions.", "retry": "Réessayer", "noCodesYet": "Aucun code d'invitation pour le moment", "activated": "Activé", "neoStarting": "Neo démarre la tâche de partage automatique...", "failed": "Échec", "unknownError": "Erreur inconnue", "errorRetry": "Une erreur s'est produite, veuillez réessayer", "unexpectedResponse": "Réponse inattendue du serveur", "failedToLoadCodes": "Échec du chargement des codes d'invitation", "congratsCredits": "Félicitations ! +{{amount}} crédits", "rewardUnlocked": "Récompense débloquée pour le partage" };
const agentWidget$a = { "modes": { "fast": { "label": "Mode rapide", "description": "Terminer les tâches le plus rapidement possible, n'utilisera pas les compétences et mémoires.", "short": "Rapide", "modeDescription": "Actions plus rapides, moins de détails" }, "pro": { "label": "Mode Pro", "description": "Qualité maximale : analyse visuelle étape par étape avec raisonnement profond. Référence les compétences et mémoires selon les besoins.", "short": "Pro", "modeDescription": "Équilibré, laissez Neo décider" } }, "minimize": "Réduire", "placeholder": "Demandez à l'Agent Neo OS...", "changeModeTooltip": "Changez le mode pour ajuster le comportement de l'Agent", "preset": "Préréglage", "selectPresetTooltip": "Sélectionnez un préréglage à utiliser", "addNewPreset": "Ajouter un nouveau préréglage", "agentHistoryTooltip": "Historique des actions de l'Agent", "createPreset": "Créer un préréglage", "presetName": "Nom du préréglage", "instruction": "Instruction", "upload": "Téléverser", "newTask": "Nouvelle tâche", "draft": "Brouillon", "copyPrompt": "Copier le prompt", "showMore": "Afficher plus", "showLess": "Afficher moins", "agentIsWorking": "L'Agent travaille", "agentIsWrappingUp": "L'Agent finalise", "completed": "Terminé", "paused": "En pause", "created": "Créé", "selectTask": "Sélectionner une tâche", "unpin": "Détacher", "pinToRight": "Épingler à droite", "stepsCount": "Étapes ({{count}})", "files": "Fichiers", "filesCount": "Fichiers ({{count}})", "noFilesYet": "Aucun fichier généré pour le moment", "status": { "wrappingUp": "L'Agent finalise...", "thinking": "L'Agent réfléchit...", "wrappingUpAction": "Finalisation de l'action en cours..." }, "actions": { "markedTab": "Onglet marqué", "openRelatedTab": "Ouvrir l'onglet associé (en cours de développement)", "open": "Ouvrir", "openTab": "Ouvrir l'onglet", "showInFolder": "Afficher dans le dossier", "preview": "Aperçu", "followUpPrefix": "Vous", "actionsHeader": "Actions" }, "controls": { "rerun": "Réexécuter (en cours de développement)", "pause": "Pause", "pauseAndArchive": "Mettre en pause et archiver", "resume": "Reprendre", "wrappingUpDisabled": "Finalisation..." }, "input": { "sending": "Envoi...", "adjustTaskPlaceholder": "Envoyez un message pour ajuster la tâche de l'Agent Neo..." }, "legacy": { "readOnlyNotice": "Ceci est une tâche héritée d'une version antérieure. Mode lecture seule." }, "refunded": { "noFollowUp": "Cette tâche a été remboursée. Les messages de suivi ne sont pas disponibles." }, "skills": { "matchingSkills": "recherche de compétences pertinentes…", "scanningSkills": "Scan neuronal des compétences disponibles !!!", "scanningMap": "Cartographie neuronale des compétences en cours…" }, "billing": { "creditsDepletedTitle": "Ajoutez des crédits pour continuer", "creditsDepletedMessage": "L'Agent est en pause car vos crédits sont épuisés. Ajoutez des crédits ou mettez à jour la facturation, puis réexécutez la tâche quand vous êtes prêt." }, "presetActions": { "editPreset": "Modifier le préréglage", "deletePreset": "Supprimer le préréglage" }, "feedback": { "success": { "short": "Excellent travail !", "long": "Jusqu'à présent tout va bien, excellent travail !" }, "refund": { "short": "Oups, remboursement !", "long": "Oups, je veux récupérer mes crédits !" }, "refundSuccess": { "long": "Bravo ! Vos crédits ont été remboursés !" }, "modal": { "title": "Demander un remboursement de crédits", "credits": "{{count}} crédits", "description": "Si vous n'êtes pas satisfait de cette tâche, demandez un remboursement et nous vous rembourserons instantanément tous les crédits utilisés pour cette tâche.", "whatGoesWrong": "Qu'est-ce qui ne va pas", "errorMessage": "Désolé, veuillez fournir plus de détails", "placeholder": "Décrivez ce qui ne va pas...", "shareTask": "Partager cette tâche avec nous", "shareDescription": "Nous anonymiserons tous les détails personnels de votre tâche. En partageant votre tâche avec nous, nous améliorerons les performances de notre agent sur des tâches similaires à l'avenir.", "upload": "Télécharger", "attachFile": "joindre un fichier", "submit": "Soumettre", "submitting": "Envoi en cours...", "alreadyRefunded": { "title": "Déjà remboursé", "message": "Cette tâche a déjà été remboursée. Vous ne pouvez pas demander un remboursement à nouveau." } }, "errors": { "systemError": "Erreur système. Veuillez contacter notre équipe d'assistance.", "networkError": "Erreur réseau. Veuillez vérifier votre connexion et réessayer.", "noUsageData": "Données d'utilisation introuvables. Remboursement impossible.", "alreadyRefunded": "Cette tâche a déjà été remboursée.", "notAuthenticated": "Veuillez vous connecter pour demander un remboursement.", "unknownError": "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.", "validationFailed": "Impossible de valider votre raison pour le moment. Veuillez réessayer plus tard.", "invalidReason": "Raison rejetée. Veuillez décrire ce qui s'est réellement mal passé." }, "confirmation": { "creditsRefunded": "{{count}} crédits remboursés", "title": "Succès", "message": "Merci ! Notre équipe diagnostiquera votre tâche et améliorera l'expérience FlowithOS.", "messageNoShare": "Merci ! Notre équipe continuera à travailler pour améliorer l'expérience FlowithOS." } } };
const gate$a = { "welcome": { "title": "Bienvenue sur FlowithOS", "subtitle": "Du Web au monde réel — FlowithOS transforme votre navigateur en générateur de valeur concrète. Le système d'exploitation agentique le plus intelligent.", "features": { "execute": { "title": "Exécutez n'importe quelle tâche automatiquement", "description": "FlowithOS agit avec l'intuition humaine à la vitesse des machines, naviguant et exécutant plusieurs tâches sur le web encore et encore." }, "transform": { "title": "Transformez vos idées en impact", "description": "De l'inspiration à la création de valeur concrète — FlowithOS transforme les grandes idées en actions qui produisent des résultats mesurables." }, "organize": { "title": "Organisez vos actifs de façon systématique", "description": "Des favoris éparpillés aux guides structurés — FlowithOS vous offre un système robuste pour gérer, organiser et faire évoluer vos ressources numériques." }, "evolve": { "title": "Évoluez ensemble, dynamiquement", "description": "Avec une mémoire qui grandit à chaque interaction, FlowithOS crée des compétences personnalisées — de la navigation sur sites complexes à la compréhension de votre style unique." } }, "letsGo": "C'est parti !" }, "auth": { "createAccount": "Créer un compte", "signInToFlowith": "Connectez-vous à votre compte Flowith", "oneAccount": "Un compte pour tous les produits Flowith", "fromAnotherAccount": "Se connecter avec :", "useOwnEmail": "Ou utiliser votre propre e-mail", "email": "E-mail", "password": "Mot de passe", "confirmPassword": "Confirmer le mot de passe", "acceptTerms": "J'accepte les conditions d'utilisation et la politique de confidentialité de FlowithOS", "privacyNote": "Toutes vos données restent 100 % sécurisées sur votre appareil", "alreadyHaveAccount": "Vous avez déjà un compte Flowith ?", "createNewAccount": "Pas de compte ? Inscrivez-vous", "signUp": "S'inscrire", "signIn": "Se connecter", "processing": "Traitement...", "verifyEmail": "Vérifiez votre e-mail", "verificationCodeSent": "Nous avons envoyé un code de vérification à 6 chiffres à {{email}}", "enterVerificationCode": "Entrez le code de vérification", "verificationCode": "Code de vérification", "enterSixDigitCode": "Entrez le code à 6 chiffres", "backToSignUp": "Retour à l'inscription", "verifying": "Vérification...", "verifyCode": "Vérifier le code", "errors": { "enterEmail": "Veuillez entrer votre e-mail", "enterPassword": "Veuillez entrer votre mot de passe", "confirmPassword": "Veuillez confirmer votre mot de passe", "passwordsDoNotMatch": "Les mots de passe ne correspondent pas", "acceptTerms": "Veuillez accepter les conditions d'utilisation et la politique de confidentialité", "authFailed": "L'authentification a échoué. Veuillez réessayer.", "invalidVerificationCode": "Veuillez entrer un code de vérification à 6 chiffres valide", "verificationFailed": "La vérification a échoué. Veuillez réessayer.", "oauthFailed": "L'authentification OAuth a échoué. Veuillez réessayer.", "userAlreadyExists": "Cet e-mail est déjà enregistré. Veuillez " }, "goToLogin": "vous connecter", "signInPrompt": "vous connecter" }, "invitation": { "title": "L'éveil nécessite une clé", "subtitle": "Veuillez entrer votre code d'invitation pour débloquer FlowithOS", "lookingForInvite": "Vous cherchez une invitation ?", "followOnX": "Suivez @flowith sur X", "toGetAccess": "pour obtenir l'accès.", "placeholder": "Mon code d'invitation", "invalidCode": "Code d'invitation invalide", "verificationFailed": "Échec de la vérification - veuillez réessayer", "accessGranted": "Accès accordé", "initializing": "Bienvenue sur FlowithOS. Initialisation..." }, "browserImport": { "title": "Reprenez où vous vous êtes arrêté", "subtitle": "Importez facilement vos favoris et sessions enregistrées depuis vos navigateurs actuels.", "detecting": "Détection des navigateurs installés...", "noBrowsers": "Aucun navigateur installé détecté", "imported": "Importé", "importing": "Importation...", "bookmarks": "favoris", "importNote": "L'importation prend environ 5 secondes. Vous verrez une ou deux invites système.", "skipForNow": "Passer pour l'instant", "nextStep": "Étape suivante" }, "settings": { "title": "Prêt à commencer ?", "subtitle": "Quelques ajustements rapides pour perfectionner votre expérience Flowith OS.", "defaultBrowser": { "title": "Définir comme navigateur par défaut", "description": "Laissez le web venir à vous. Les liens s'ouvriront directement dans FlowithOS, intégrant de manière transparente le contenu en ligne dans votre espace de travail." }, "addToDock": { "title": "Ajouter au Dock / Barre des tâches", "description": "Gardez votre hub créatif à un clic pour un accès instantané dès que l'inspiration frappe." }, "launchAtStartup": { "title": "Lancer au démarrage", "description": "Commencez votre journée prêt à créer. Flowith OS vous attendra dès votre connexion." }, "helpImprove": { "title": "Aidez-nous à nous améliorer", "description": "Partagez des données d'utilisation anonymes pour nous aider à créer un meilleur produit pour tous.", "privacyNote": "Votre confidentialité est entièrement protégée." }, "canChangeSettingsLater": "Vous pouvez modifier ces paramètres plus tard", "nextStep": "Étape suivante", "privacy": { "title": "100 % de stockage local et protection de la confidentialité", "description": "Votre historique d'exécution, navigation, mémoires, compétences, identifiants et données personnelles sont stockés à 100 % localement sur votre appareil. Aucune synchronisation cloud. Utilisez FlowithOS en toute tranquillité." } }, "examples": { "title1": "L'OS est éveillé.", "title2": "Voyez-le en action.", "subtitle": "Commencez par un exemple pour voir comment ça marche.", "enterFlowithOS": "Entrer dans FlowithOS", "clickToReplay": "cliquez pour rejouer ce cas", "videoNotSupported": "Votre navigateur ne prend pas en charge la lecture vidéo.", "cases": { "shopping": { "title": "Terminez vos achats de fêtes 10× plus vite", "description": "Remplit votre panier avec l'ensemble cadeau parfait pour chiot — économisant plus de 2 heures de recherche manuelle." }, "contentEngine": { "title": "Moteur de contenu X en continu", "description": "Découvre les meilleures histoires de Hacker News, écrit dans votre style unique et publie automatiquement sur X. Multiplie par 3 les visites de profil et génère une croissance organique de la communauté." }, "tiktok": { "title1": "Générateur de buzz TikTok : 500+ engagements,", "title2": "0 effort", "description": "Flowith OS inonde les lives populaires de commentaires percutants, transformant votre présence numérique en croissance mesurable." }, "youtube": { "title": "Croissance de chaîne YouTube autonome à 95 %", "description": "Flowith OS optimise tout le processus de création YouTube faceless — du contenu à la communauté, condensant des semaines de travail en moins d'une heure." } } }, "oauth": { "connecting": "Connexion à {{provider}}", "completeInBrowser": "Veuillez compléter l'authentification dans l'onglet du navigateur qui vient de s'ouvrir.", "cancel": "Annuler" }, "terms": { "title": "Conditions d'utilisation et politique de confidentialité", "subtitle": "Veuillez consulter les conditions ci-dessous.", "close": "Fermer" }, "invitationCodes": { "title": "Mes codes d'invitation", "availableToShare": "{{unused}} sur {{total}} disponibles", "loading": "Chargement de vos codes...", "noCodesYet": "Aucun code d'invitation pour le moment.", "noCodesFound": "Aucun code d'invitation trouvé", "failedToLoad": "Échec du chargement des codes d'invitation", "useCodeHint": "Utilisez un code d'invitation pour obtenir vos propres codes !", "shareHint": "Partagez ces codes avec vos amis pour les inviter sur FlowithOS", "used": "Utilisé" }, "history": { "title": "Historique", "searchPlaceholder": "Rechercher dans l'historique...", "selectAll": "Tout sélectionner", "deselectAll": "Tout désélectionner", "deleteSelected": "Supprimer la sélection ({{count}})", "clearAll": "Tout effacer", "loading": "Chargement de l'historique...", "noMatchingHistory": "Aucun historique correspondant", "noHistoryYet": "Aucun historique pour le moment", "confirmDelete": "Confirmer la suppression", "deleteConfirmMessage": "Êtes-vous sûr de vouloir supprimer l'historique sélectionné ? Cette action est irréversible.", "cancel": "Annuler", "delete": "Supprimer", "today": "Aujourd'hui", "yesterday": "Hier", "earlier": "Plus ancien", "untitled": "Sans titre", "visitedTimes": "Visité {{count}} fois", "openInNewTab": "Ouvrir dans un nouvel onglet", "timePeriod": "Période", "timeRangeAll": "Tout", "timeRangeAllDesc": "Tout l'historique de navigation", "timeRangeToday": "Aujourd'hui", "timeRangeTodayDesc": "Tout l'historique d'aujourd'hui", "timeRangeYesterday": "Hier", "timeRangeYesterdayDesc": "Historique d'hier", "timeRangeLast7Days": "7 derniers jours", "timeRangeLast7DaysDesc": "Historique de la semaine passée", "timeRangeThisMonth": "Ce mois-ci", "timeRangeThisMonthDesc": "Historique de ce mois", "timeRangeLastMonth": "Le mois dernier", "timeRangeLastMonthDesc": "Historique du mois dernier", "deleteTimeRange": "Supprimer {{range}}" } };
const update$a = { "checking": { "title": "Vérification des mises à jour", "description": "Connexion au serveur de mise à jour..." }, "noUpdate": { "title": "Vous êtes à jour", "currentVersion": "Version actuelle v{{version}}", "description": "Vous utilisez déjà la dernière version", "close": "Fermer" }, "available": { "title": "Nouvelle version disponible", "version": "v{{version}} est disponible", "currentVersion": "(Actuelle : v{{current}})", "released": "Publiée {{time}}", "betaNote": "Nous sommes en bêta publique et livrons des améliorations quotidiennement. Mettez à jour maintenant pour rester à jour.", "defaultReleaseNotes": "Cette version bêta inclut des améliorations de performances, des corrections de bugs et de nouvelles fonctionnalités. Nous livrons des mises à jour quotidiennement. Veuillez mettre à jour maintenant pour la meilleure expérience.", "downloadNow": "Télécharger maintenant", "remindLater": "Me le rappeler plus tard", "preparing": "Préparation..." }, "downloading": { "title": "Téléchargement de la mise à jour", "version": "Téléchargement de v{{version}}", "progress": "Progression du téléchargement", "hint": "Ouvrez l'installateur téléchargé en cliquant sur le bouton ci-dessous" }, "readyToInstall": { "title": "Prêt à installer", "downloaded": "v{{version}} a fini de se télécharger", "hint": "Redémarrez pour terminer l'installation de la mise à jour", "restartNow": "Redémarrer maintenant", "restartLater": "Redémarrer plus tard", "restarting": "Redémarrage..." }, "error": { "title": "Échec de la vérification de mise à jour", "default": "La mise à jour a échoué. Veuillez réessayer plus tard.", "downloadFailed": "Le téléchargement a échoué. Veuillez réessayer plus tard.", "installFailed": "L'installation a échoué. Veuillez réessayer plus tard.", "close": "Fermer", "noChannelPermission": "Votre compte n'a pas accès au canal de mise à jour {{channel}}. Veuillez basculer vers Stable et réessayer.", "switchToStable": "Basculer vers Stable et réessayer" }, "time": { "justNow": "à l'instant", "minutesAgo": "il y a {{count}} minutes", "hoursAgo": "il y a {{count}} heures" }, "notifications": { "newVersionAvailable": "Nouvelle version {{version}} disponible", "downloadingInBackground": "Téléchargement en arrière-plan", "updateDownloaded": "Mise à jour téléchargée", "readyToInstall": "Version {{version}} prête à installer" } };
const updateToast$a = { "checking": "Recherche de mises à jour...", "pleaseWait": "Veuillez patienter", "preparingDownload": "Préparation du téléchargement {{version}}", "updateFound": "Mise à jour {{version}} trouvée", "downloading": "Téléchargement de la mise à jour {{version}}", "updateCheckFailed": "Échec de la vérification de mise à jour", "unknownError": "Erreur inconnue", "updatedTo": "Mis à jour vers v{{version}}", "newVersionReady": "Nouvelle version prête", "version": "Version {{version}}", "close": "Fermer", "gotIt": "Compris", "installNow": "Redémarrer maintenant", "restarting": "Redémarrage…", "later": "Plus tard", "collapseUpdateContent": "Réduire le contenu de la mise à jour", "viewUpdateContent": "Voir le contenu de la mise à jour", "collapseLog": "Réduire ^", "viewLog": "Voir le journal >", "channelChangeFailed": "Échec du changement de canal: {{error}}", "channelInfo": "Canal: {{channel}}, Manifest: {{manifest}}", "manualDownloadHint": "Impossible de mettre à jour ? Essayez l'installation manuelle →", "channelDowngraded": { "title": "Canal Changé", "message": "Votre compte n'a pas accès à {{previousChannel}}. Changé automatiquement vers {{newChannel}}." }, "continueInBackground": "Le téléchargement continuera en arrière-plan", "time": { "justNow": "à l'instant", "minutesAgo": "il y a {{count}} minutes", "hoursAgo": "il y a {{count}} heures", "daysAgo": "il y a {{count}} jours", "weeksAgo": "il y a {{count}} semaines", "monthsAgo": "il y a {{count}} mois", "yearsAgo": "il y a {{count}} ans" } };
const errors$a = { "auth": { "notLoggedIn": "Veuillez vous connecter d'abord", "loginRequired": "Veuillez vous connecter avant d'utiliser cette fonctionnalité", "shareRequiresLogin": "Veuillez vous connecter avant d'utiliser la fonction de partage" }, "network": { "networkError": "Erreur réseau - veuillez vérifier votre connexion", "requestTimeout": "Délai de requête dépassé - veuillez réessayer", "failedToVerify": "Échec de la vérification de l'accès", "failedToFetch": "Échec de la récupération des codes" }, "invitation": { "invalidCode": "Code d'invitation invalide", "verificationFailed": "Échec de la vérification - veuillez réessayer", "failedToConsume": "Échec de la consommation du code d'invitation" }, "download": { "downloadFailed": "Échec du téléchargement", "downloadInterrupted": "Téléchargement interrompu" }, "security": { "secureConnection": "Connexion sécurisée", "notSecure": "Non sécurisé", "localFile": "Fichier local", "unknownProtocol": "Protocole inconnu" } };
const menus$a = { "application": { "about": "À propos de {{appName}}", "checkForUpdates": "Vérifier les mises à jour...", "settings": "Paramètres...", "services": "Services", "hide": "Masquer {{appName}}", "hideOthers": "Masquer les autres", "showAll": "Tout afficher", "quit": "Quitter", "updateChannel": "Canal de mise à jour" }, "edit": { "label": "Édition", "undo": "Annuler", "redo": "Rétablir", "cut": "Couper", "paste": "Coller", "selectAll": "Tout sélectionner" }, "view": { "label": "Affichage", "findInPage": "Rechercher dans la page", "newTab": "Nouvel onglet", "reopenClosedTab": "Rouvrir l'onglet fermé", "newTerminalTab": "Nouvel onglet terminal", "openLocalFile": "Ouvrir un fichier local...", "goBack": "Retour", "goForward": "Suivant", "viewHistory": "Voir l'historique", "viewDownloads": "Voir les téléchargements", "archive": "Archive", "reload": "Actualiser", "forceReload": "Actualisation forcée", "actualSize": "Taille réelle", "zoomIn": "Zoom avant", "zoomOut": "Zoom arrière", "toggleFullScreen": "Basculer en plein écran" }, "window": { "label": "Fenêtre", "minimize": "Réduire", "close": "Fermer", "bringAllToFront": "Tout mettre au premier plan" }, "help": { "label": "Aide", "about": "À propos", "version": "Version", "aboutDescription1": "Le système d'exploitation AI Agent de nouvelle génération", "aboutDescription2": "conçu pour l'auto-amélioration, la mémoire et la vitesse.", "copyright": "© 2025 Flowith, Inc. Tous droits réservés." }, "contextMenu": { "back": "Retour", "forward": "Suivant", "reload": "Actualiser", "hardReload": "Actualisation forcée (ignorer le cache)", "openLinkInNewTab": "Ouvrir le lien dans un nouvel onglet", "openLinkInExternal": "Ouvrir le lien dans un navigateur externe", "copyLinkAddress": "Copier l'adresse du lien", "downloadLink": "Télécharger le lien", "openImageInNewTab": "Ouvrir l'image dans un nouvel onglet", "copyImageAddress": "Copier l'adresse de l'image", "copyImage": "Copier l'image", "downloadImage": "Télécharger l'image", "downloadVideo": "Télécharger la vidéo", "downloadAudio": "Télécharger l'audio", "openMediaInNewTab": "Ouvrir le média dans un nouvel onglet", "copyMediaAddress": "Copier l'adresse du média", "openFrameInNewTab": "Ouvrir le cadre dans un nouvel onglet", "openInExternal": "Ouvrir dans un navigateur externe", "copyPageURL": "Copier l'URL de la page", "viewPageSource": "Afficher le code source de la page (nouvel onglet)", "savePageAs": "Enregistrer la page sous…", "print": "Imprimer…", "cut": "Couper", "paste": "Coller", "searchWebFor": "Rechercher sur le Web «{{text}}»", "selectAll": "Tout sélectionner", "inspectElement": "Inspecter l'élément", "openDevTools": "Ouvrir les outils de développement", "closeDevTools": "Fermer les outils de développement" }, "fileDialog": { "openLocalFile": "Ouvrir un fichier local", "unsupportedFileType": "Type de fichier non pris en charge", "savePageAs": "Enregistrer la page sous", "allSupportedFiles": "Tous les fichiers pris en charge", "htmlFiles": "Fichiers HTML", "textFiles": "Fichiers texte", "images": "Images", "videos": "Vidéos", "audio": "Audio", "pdf": "PDF", "webpageComplete": "Page web, complète", "singleFile": "Fichier unique (MHTML)" } };
const dialogs$a = { "crash": { "title": "Erreur de l'application", "message": "Une erreur inattendue s'est produite", "detail": "{{error}}\n\nL'erreur a été enregistrée à des fins de débogage.", "restart": "Redémarrer", "close": "Fermer" }, "customBackground": { "title": "Arrière-plan personnalisé", "subtitle": "Créez votre propre style unique", "preview": "Aperçu", "angle": "Angle", "stops": "Stops", "selectImage": "Sélectionner une image", "uploading": "Téléversement...", "dropImageHere": "Déposer l'image ici", "dragAndDrop": "Glisser-déposer ou cliquer", "fileTypes": "PNG, JPG, JPEG, WEBP, SVG, GIF", "fit": "Ajuster", "cover": "Couvrir", "contain": "Contenir", "fill": "Remplir", "remove": "Supprimer", "cancel": "Annuler", "apply": "Appliquer", "gradient": "Dégradé", "solid": "Uni", "image": "Image", "dropImageError": "Veuillez déposer un fichier image (PNG, JPG, JPEG, WEBP, SVG ou GIF)" } };
const humanInput$a = { "declinedToAnswer": "L'utilisateur a refusé de répondre, question ignorée", "needOneInput": "1 entrée nécessaire pour continuer", "needTwoInputs": "Nous avons besoin de votre aide sur 2 points", "needThreeInputs": "3 décisions nécessaires de votre part", "waitingOnInputs": "En attente de {{count}} entrées de votre part", "declineToAnswer": "Refuser de répondre", "dropFilesHere": "Déposer les fichiers ici", "typeYourAnswer": "Tapez votre réponse...", "orTypeCustom": "Ou saisir personnalisé...", "uploadFiles": "Téléverser des fichiers", "previousQuestion": "Question précédente", "goToQuestion": "Aller à la question {{number}}", "nextQuestion": "Question suivante" };
const fr = {
  common: common$a,
  nav: nav$a,
  tray: tray$a,
  actions: actions$a,
  status: status$a,
  time: time$a,
  downloads: downloads$a,
  history: history$a,
  invitationCodes: invitationCodes$a,
  tasks: tasks$a,
  flows: flows$a,
  bookmarks: bookmarks$a,
  conversations: conversations$a,
  intelligence: intelligence$a,
  sidebar: sidebar$a,
  tabs: tabs$a,
  userMenu: userMenu$a,
  settings: settings$a,
  updateSettings: updateSettings$a,
  adblock: adblock$a,
  blank: blank$a,
  agentGuide: agentGuide$a,
  reward: reward$a,
  agentWidget: agentWidget$a,
  gate: gate$a,
  update: update$a,
  updateToast: updateToast$a,
  errors: errors$a,
  menus: menus$a,
  dialogs: dialogs$a,
  humanInput: humanInput$a
};
const common$9 = { "ok": "OK", "cancel": "Batal", "start": "Mulai", "delete": "Hapus", "close": "Tutup", "save": "Simpan", "search": "Cari", "loading": "Memuat", "pressEscToClose": "Tekan ESC untuk menutup", "copyUrl": "Salin URL", "copied": "Tersalin", "copy": "Salin", "expand": "Perluas", "collapse": "Ciutkan", "openFlowithWebsite": "Buka situs Flowith", "openAgentGuide": "Buka Panduan Agen", "reward": "Hadiah", "closeWindow": "Tutup jendela", "minimizeWindow": "Minimalkan jendela", "toggleFullscreen": "Alihkan layar penuh", "saveEnter": "Simpan (Enter)", "cancelEsc": "Batal (Esc)", "time": { "justNow": "baru saja", "minutesAgo": "{{count}} menit yang lalu", "hoursAgo": "{{count}} jam yang lalu", "daysAgo": "{{count}} hari yang lalu" } };
const nav$9 = { "tasks": "Tugas", "flows": "Alur", "bookmarks": "Penanda", "intelligence": "Intelijen", "guide": "Panduan" };
const tray$9 = { "newTask": "Tugas Baru", "recentTasks": "Tugas Terbaru", "viewMore": "Lihat Lebih Banyak", "showMainWindow": "Tampilkan Jendela Utama", "hideMainWindow": "Sembunyikan Jendela Utama", "quit": "Keluar" };
const actions$9 = { "resume": "Lanjutkan", "pause": "Jeda", "cancel": "Batal", "delete": "Hapus", "archive": "Arsipkan", "showInFolder": "Tampilkan di Folder", "viewDetails": "Lihat Detail", "openFile": "Buka File" };
const status$9 = { "inProgress": "Sedang berlangsung", "completed": "Selesai", "archive": "Arsip", "paused": "Dijeda", "failed": "Gagal", "cancelled": "Dibatalkan", "running": "Berjalan", "wrappingUp": "Menyelesaikan..." };
const time$9 = { "today": "Hari ini", "yesterday": "Kemarin", "earlier": "Sebelumnya" };
const downloads$9 = { "title": "Unduhan", "all": "Semua", "inProgress": "Sedang Berlangsung", "completed": "Selesai", "noDownloads": "Tidak ada unduhan", "failedToLoad": "Gagal memuat unduhan", "deleteConfirmMessage": "Apakah Anda yakin ingin menghapus unduhan yang dipilih? Tindakan ini tidak dapat dibatalkan.", "loadingDownloads": "Memuat unduhan...", "searchPlaceholder": "Cari unduhan...", "selectAll": "Pilih Semua", "deselectAll": "Batalkan Pilihan Semua", "deleteSelected": "Hapus yang Dipilih ({{count}})", "clearAll": "Hapus Semua", "noMatchingDownloads": "Tidak ada unduhan yang cocok", "noDownloadsYet": "Belum ada unduhan", "confirmDelete": "Konfirmasi Hapus", "cancel": "Batal", "delete": "Hapus" };
const history$9 = { "title": "Riwayat", "allTime": "Semua Waktu", "clearHistory": "Hapus Riwayat", "removeItem": "Hapus Item", "failedToLoad": "Gagal memuat riwayat", "failedToClear": "Gagal menghapus riwayat", "searchPlaceholder": "Cari riwayat...", "selectAll": "Pilih Semua", "deselectAll": "Batalkan Pilihan Semua", "deleteSelected": "Hapus yang Dipilih ({{count}})", "clearAll": "Hapus Semua", "noMatchingHistory": "Tidak ada riwayat yang cocok", "noHistoryYet": "Belum ada riwayat", "confirmDelete": "Konfirmasi Hapus", "deleteConfirmMessage": "Apakah Anda yakin ingin menghapus riwayat yang dipilih? Tindakan ini tidak dapat dibatalkan.", "cancel": "Batal", "delete": "Hapus", "today": "Hari ini", "yesterday": "Kemarin", "earlier": "Sebelumnya", "untitled": "Tanpa Judul", "visitedTimes": "Dikunjungi {{count}} kali", "openInNewTab": "Buka di tab baru", "loading": "Memuat riwayat...", "timePeriod": "Periode Waktu", "timeRangeAll": "Semua", "timeRangeAllDesc": "Semua riwayat penjelajahan", "timeRangeToday": "Hari ini", "timeRangeTodayDesc": "Semua riwayat dari hari ini", "timeRangeYesterday": "Kemarin", "timeRangeYesterdayDesc": "Riwayat dari kemarin", "timeRangeLast7Days": "7 hari terakhir", "timeRangeLast7DaysDesc": "Riwayat dari minggu lalu", "timeRangeThisMonth": "Bulan ini", "timeRangeThisMonthDesc": "Riwayat dari bulan ini", "timeRangeLastMonth": "Bulan lalu", "timeRangeLastMonthDesc": "Riwayat dari bulan lalu", "deleteTimeRange": "Hapus {{range}}", "last7days": "7 Hari Terakhir", "thisMonth": "Bulan Ini", "lastMonth": "Bulan Lalu" };
const invitationCodes$9 = { "title": "Kode Undangan Saya", "availableToShare": "{{unused}} dari {{total}} tersedia untuk dibagikan", "loading": "Memuat kode Anda...", "noCodesYet": "Belum ada kode undangan.", "noCodesFound": "Tidak ada kode undangan ditemukan", "failedToLoad": "Gagal memuat kode undangan", "useCodeHint": "Gunakan kode undangan untuk mendapatkan kode Anda sendiri!", "shareHint": "Bagikan kode ini dengan teman untuk mengundang mereka ke FlowithOS", "used": "Digunakan" };
const tasks$9 = { "title": "Tugas", "description": "Tugas adalah tempat Anda menyimpan semua tugas", "transformToPreset": "Ubah ke Preset", "noTasks": "Tidak ada tugas", "archiveEmpty": "Arsip kosong" };
const flows$9 = { "title": "Alur", "description": "Alur menampilkan semua kanvas Anda", "newFlow": "Alur Baru", "rename": "Ubah Nama", "leave": "Tinggalkan", "noFlows": "Tidak ada alur", "signInToViewFlows": "Masuk untuk melihat alur Anda", "pin": "Sematkan", "unpin": "Lepas Sematan" };
const bookmarks$9 = { "title": "Penanda", "description": "Anda dapat menyimpan setiap tab yang Anda suka", "bookmark": "Penanda", "addNewCollection": "Tambah koleksi baru", "loadingBookmarks": "Memuat penanda...", "noMatchingBookmarks": "Tidak ada penanda yang cocok", "noBookmarksYet": "Belum ada penanda", "importFromBrowsers": "Impor dari browser", "detectingBrowsers": "Mendeteksi browser...", "bookmarksCount": "penanda", "deleteCollection": "Hapus Koleksi", "deleteCollectionConfirm": "Apakah Anda yakin ingin menghapus koleksi ini?", "newCollection": "Koleksi Baru", "enterCollectionName": "Masukkan nama untuk koleksi baru", "create": "Buat", "collectionName": "Nama koleksi", "saveEnter": "Simpan (Enter)", "cancelEsc": "Batal (Esc)", "renameFolder": "Ubah nama folder", "renameBookmark": "Ubah nama penanda", "deleteFolder": "Hapus folder", "deleteBookmark": "Hapus penanda" };
const conversations$9 = { "title": "Percakapan", "noConversations": "Belum ada percakapan" };
const intelligence$9 = { "title": "Intelijen", "description": "Kembangkan Agen Anda dengan keterampilan dan memori", "knowledgeBase": "Basis Pengetahuan", "memory": "Memori", "skill": "Keterampilan", "createNewSkill": "Buat keterampilan baru", "createNewMemory": "Buat memori baru", "loading": "Memuat...", "noSkills": "Tidak ada keterampilan", "noMemories": "Tidak ada memori", "readOnly": "Hanya-baca", "readOnlyMessage": "Ini adalah Keterampilan sistem bawaan untuk membantu agen Anda bekerja lebih baik. Tidak dapat diedit langsung, tetapi Anda dapat menduplikasinya dan memodifikasi salinan Anda sendiri. Edit setelah dibuka tidak akan disimpan. Harap dicatat.", "readOnlyToast": "Ini adalah Keterampilan sistem bawaan untuk membantu agen Anda bekerja lebih baik. Tidak dapat diedit langsung, tetapi Anda dapat menduplikasinya dan memodifikasi salinan Anda sendiri.", "open": "Buka", "kbComingSoon": "Dukungan Basis Pengetahuan Flowith akan segera hadir.", "system": "Sistem", "learnFromUser": "Pengguna", "systemPresetReadOnly": "Preset sistem (hanya-baca)", "actions": "Aksi", "rename": "Ubah Nama", "duplicate": "Duplikat…", "info": "Info", "saving": "Menyimpan...", "fileInfo": "Info File", "fileName": "Nama", "fileSize": "Ukuran", "fileCreated": "Dibuat", "fileModified": "Dimodifikasi", "fileType": "Tipe", "fileLocation": "Lokasi", "copyPath": "Salin Path", "empowerOS": "Mode Ajar", "teachMakesBetter": "Mengajar membuat OS lebih baik", "teachMode": "Mode Ajar", "teachModeDescription": "Dalam Mode Ajar, Anda dapat merekam alur kerja dan langkah-langkah web Anda sementara Agen OS diam-diam mengamati, belajar, dan menyulingnya menjadi keterampilan dan pengetahuan yang dapat digunakan kembali.", "teachModeGoalLabel": "Tujuan Tugas (Opsional)", "teachModeGoalPlaceholder": "Berikan lebih banyak konteks bagi OS untuk belajar — bisa berupa tujuan tugas spesifik atau informasi terkait lainnya.", "teachModeTaskDisabled": "Tugas baru dinonaktifkan saat Anda dalam mode ajar.", "empowering": "Mengajar", "empoweringDescription": "Agen OS akan mengamati dan belajar saat Anda mendemonstrasikan", "yourGoal": "Tujuan Tugas", "preset": "Preset", "generatedSkills": "Keterampilan yang Dihasilkan", "showLess": "Sembunyikan", "showMore": "Tampilkan lebih banyak", "osHasLearned": "OS telah belajar", "complete": "Selesaikan", "interactionsPlaceholder": "Interaksi akan muncul di sini saat Anda mendemonstrasikan alur kerja.", "done": "Selesai", "generatingGuidance": "Menghasilkan panduan...", "summarizingInteraction": "Kami merangkum setiap interaksi dan menyiapkan keterampilan yang dapat digunakan kembali.", "skillSaved": "Keterampilan disimpan", "goal": "Tujuan", "steps": "Langkah", "events": "Kejadian", "guidanceSavedSuccessfully": "Panduan berhasil disimpan.", "openGuidanceInComposer": "Buka panduan di Composer", "recordAnotherWorkflow": "Rekam alur kerja lain", "dismissSummary": "Tutup ringkasan", "saveAndTest": "Simpan dan Uji", "learning": "Belajar...", "teachModeError": "Mode ajar mengalami masalah", "errorDetails": "Detail Error", "checkNetworkConnection": "Periksa koneksi jaringan Anda dan coba mulai mode ajar lagi.", "tryAgain": "Coba lagi", "resetState": "Reset status", "completeConfirmTitle": "Pemberdayaan OS selesai", "completeConfirmMessage": "Anda dapat memilih hasil mana yang Anda inginkan di daftar periksa di bawah ini.", "capturedEvents": "Kejadian yang Ditangkap", "confirmAndGenerate": "Hasilkan", "generating": "Menghasilkan", "promptSummary": "Ringkasan Prompt", "saveToPreset": "Simpan ke Preset", "skillHostname": "Keterampilan: {{hostname}}", "saveToSkill": "Simpan ke keterampilan", "skillTooltip": "Anda dapat merevisi atau mengedit keterampilan di bawah", "skillSectionTooltip": "Setiap keterampilan diberi nama sesuai situs web yang digunakan dalam sesi pengajaran. Keterampilan baru muncul sebagai bagian baru dalam file markdown yang sesuai.", "selectAll": "Pilih semua", "discard": "Buang", "confirmDiscard": "Ya, buang", "tutorial": { "title": "Selamat Datang di Mode Ajar", "next": "Berikutnya", "gotIt": "Mengerti", "guideLabel": "Panduan Mode Ajar", "page1": { "title": "Apa itu keterampilan dan mode ajar?", "description": "Keterampilan adalah tempat OS menyimpan pengetahuan yang dapat digunakan kembali yang dapat diterapkan oleh agen mana pun. Setiap keterampilan adalah panduan berbasis prompt (yang berpotensi berisi cuplikan kode) tentang aplikasi web, alur kerja, atau pola interaksi. Ini membantu OS mendapatkan performa lebih baik pada situs web tertentu atau untuk tugas spesifik.\n\nMode ajar adalah cara Anda melatih OS untuk menyalin rutinitas Anda atau mempelajari cara bekerja di situs web tertentu, yang akan disimpan sebagai <strong>keterampilan dan preset</strong> untuk Anda gunakan kembali di masa depan." }, "page2": { "title": "Bagaimana memulai mode ajar?", "description": "Untuk memulai, klik tombol '<strong>Mode Ajar</strong>' di '<strong>panel Intelijen</strong>' di sebelah kiri. Sebelum Anda mulai, tetapkan <strong>Tujuan Pengajaran</strong> yang memberi OS instruksi awal dan memberi Anda tugas yang jelas untuk diikuti." }, "page3": { "title": "Bagaimana OS mempelajari gerakan Anda?", "description": "Saat Anda mengajar, OS mengamati tindakan Anda dan melacak kursor Anda secara real-time. Anda akan melihat setiap langkah dicatat di panel kiri — jeda kapan saja, dan klik ikon '<strong>Stop</strong>' merah saat Anda selesai." }, "page4": { "title": "Apa hasil pembelajaran OS?", "description": "Setelah Anda menyelesaikan pengajaran, pilih jenis hasil yang ingin Anda hasilkan. Biasanya, preset dan keterampilan terkait dihasilkan untuk tugas rutin. Setelah dihasilkan, Anda dapat meninjau dan mengeditnya di <strong>Composer</strong> atau mengaksesnya kapan saja di folder '<strong>Belajar dari Pengguna</strong>' dalam panel '<strong>Intelijen</strong>'." } } };
const sidebar$9 = { "goBack": "Kembali", "goForward": "Maju", "lockSidebar": "Kunci sidebar", "unlockSidebar": "Buka kunci sidebar", "searchOrEnterAddress": "Cari atau masukkan alamat", "reload": "Muat ulang" };
const tabs$9 = { "openNewBlankPage": "Buka halaman kosong baru", "newTab": "Tab Baru", "terminal": "Terminal", "pauseAgent": "Jeda Agen", "resumeAgent": "Lanjutkan Agen" };
const userMenu$9 = { "upgrade": "Tingkatkan", "creditsLeft": "tersisa", "clickToManageSubscription": "Klik untuk mengelola langganan", "theme": "Tema", "lightMode": "Mode Terang", "darkMode": "Mode Gelap", "systemMode": "Mode Sistem", "language": "Bahasa", "settings": "Pengaturan", "invitationCode": "Kode Undangan", "checkUpdates": "Periksa Pembaruan", "contactUs": "Hubungi Kami", "signOut": "Keluar", "openUserMenu": "Buka menu pengguna", "signIn": "Masuk" };
const settings$9 = { "title": "Pengaturan", "history": "Riwayat", "downloads": "Unduhan", "adblock": "Pemblokir Iklan", "language": "Bahasa", "languageDescription": "Pilih bahasa pilihan Anda untuk antarmuka. Perubahan diterapkan segera.", "softwareUpdate": "Pembaruan Perangkat Lunak" };
const updateSettings$9 = { "description": "Flowith OS membuat Anda tetap up-to-date dengan pembaruan yang aman dan andal. Pilih saluran Anda: Stable untuk keandalan, Beta untuk fitur awal, atau Alpha untuk build terdepan. Anda hanya dapat beralih ke saluran yang dapat diakses akun Anda.", "currentVersion": "Versi saat ini: {{version}}", "loadError": "Gagal memuat", "warning": "Peringatan: Build Beta/Alpha mungkin tidak stabil dan dapat mempengaruhi pekerjaan Anda. Gunakan Stable untuk produksi.", "channel": { "label": "Saluran Pembaruan", "hint": "Hanya saluran yang Anda miliki aksesnya yang dapat dipilih.", "disabledHint": "Tidak dapat beralih saluran saat pembaruan sedang berlangsung", "options": { "stable": "Stable", "beta": "Beta", "alpha": "Alpha" } }, "actions": { "title": "Pemeriksaan Manual", "hint": "Periksa pembaruan yang tersedia sekarang.", "check": "Periksa pembaruan" }, "status": { "noUpdate": "Anda sudah up-to-date.", "hasUpdate": "Versi baru tersedia.", "error": "Gagal memeriksa pembaruan." }, "tips": { "title": "Tips", "default": "Secara default, terima notifikasi untuk pembaruan stabil. Di Early Access, build pra-rilis mungkin tidak stabil untuk pekerjaan produksi.", "warningTitle": "Peringatan: Pembaruan Nightly Diterapkan Secara Otomatis", "warningBody": "Build Nightly akan secara diam-diam mengunduh dan menginstal pembaruan tanpa meminta saat Cursor ditutup." } };
const adblock$9 = { "title": "Pemblokir Iklan", "description": "Blokir iklan dan pelacak yang mengganggu, filter kebisingan halaman, memungkinkan Agen Neo OS memahami dan mengekstrak informasi lebih tepat sambil melindungi privasi Anda.", "enable": "Aktifkan Pemblokir Iklan", "enableDescription": "Blokir iklan secara otomatis di semua situs web", "statusActive": "Aktif - Iklan sedang diblokir", "statusInactive": "Tidak aktif - Iklan tidak diblokir", "adsBlocked": "iklan diblokir", "networkBlocked": "Permintaan Jaringan", "cosmeticBlocked": "Elemen Disembunyikan", "filterRules": "Aturan Filter", "activeRules": "aturan aktif" };
const blank$9 = { "openNewPage": "Buka halaman kosong baru", "selectBackground": "Pilih latar belakang", "isAwake": "sudah bangun", "osIsAwake": "OS sudah bangun", "osGuideline": "Panduan OS", "osGuidelineDescription": "Memulai cepat dengan Agen OS kami - arsitektur, mode, dan semua yang bisa dilakukan.", "intelligence": "Mode Ajar", "intelligenceDescription": "Ajarkan Agen OS untuk melakukan tugas dan menggunakannya kembali nanti.", "inviteAndEarn": "Undang dan Dapatkan", "tagline": "Dengan memori aktif, berkembang dengan setiap tindakan untuk benar-benar memahami Anda.", "taskPreset": "Preset Tugas", "credits": "+{{amount}} Kredit", "addPreset": "Tambah preset baru", "editPreset": "Edit preset", "deletePreset": "Hapus preset", "removeFromHistory": "Hapus dari riwayat", "previousPreset": "Preset sebelumnya", "nextPreset": "Preset berikutnya", "previousPresets": "Preset sebelumnya", "nextPresets": "Preset berikutnya", "createPreset": "Buat preset", "presetName": "Nama preset", "instruction": "Instruksi", "presetNamePlaceholderCreate": "mis., Laporan Mingguan, Tinjauan Kode, Analisis Data...", "presetNamePlaceholderEdit": "Masukkan nama preset...", "instructionPlaceholderCreate": 'Jelaskan apa yang ingin Anda lakukan OS...\nmis., "Analisis data penjualan minggu ini dan buat laporan ringkasan"', "instructionPlaceholderEdit": "Perbarui instruksi tugas Anda...", "colorBlue": "Biru", "colorGreen": "Hijau", "colorYellow": "Kuning", "colorRed": "Merah", "selectColor": "Pilih warna {{color}}", "creating": "Membuat...", "updating": "Memperbarui...", "create": "Buat", "update": "Perbarui", "smartInputPlaceholder": "Navigasi, cari, atau biarkan Neo mengambil alih...", "processing": "Memproses…", "navigate": "Navigasi", "navigateDescription": "Buka alamat ini di tab saat ini", "searchGoogle": "Cari di Google", "searchGoogleDescription": "Cari dengan Google", "runTask": "Jalankan Tugas", "runTaskDescription": "Jalankan dengan agen Neo", "createCanvas": "Tanya di Canvas", "createCanvasDescription": "Buka canvas Flo dengan prompt ini" };
const agentGuide$9 = { "title": "Panduan Agen", "subtitle": "Memulai cepat visual untuk Agen OS: arsitektur, mode, dan semua yang bisa dilakukan.", "capabilities": { "heading": "Kemampuan", "navigate": { "title": "Navigasi", "desc": "Buka halaman, kembali/maju" }, "click": { "title": "Klik", "desc": "Berinteraksi dengan tombol & tautan" }, "type": { "title": "Ketik", "desc": "Isi input dan formulir" }, "keys": { "title": "Tombol", "desc": "Enter, Escape, pintasan" }, "scroll": { "title": "Gulir", "desc": "Bergerak melalui halaman panjang" }, "tabs": { "title": "Tab", "desc": "Tandai, alihkan, tutup" }, "files": { "title": "File", "desc": "Tulis, baca, unduh" }, "skills": { "title": "Keterampilan", "desc": "Pengetahuan bersama" }, "memories": { "title": "Memori", "desc": "Preferensi jangka panjang" }, "upload": { "title": "Unggah", "desc": "Kirim file ke halaman" }, "ask": { "title": "Tanya", "desc": "Konfirmasi pengguna cepat" }, "onlineSearch": { "title": "Pencarian Online", "desc": "Pencarian web cepat" }, "extract": { "title": "Ekstrak", "desc": "Dapatkan info terstruktur" }, "deepThink": { "title": "Berpikir Mendalam", "desc": "Analisis terstruktur" }, "vision": { "title": "Visi", "desc": "Operasi presisi non-DOM" }, "shell": { "title": "Shell", "desc": "Jalankan perintah (jika tersedia)" }, "report": { "title": "Laporan", "desc": "Selesaikan dan ringkas" } }, "benchmark": { "title": "Benchmark Online‑Mind2Web", "subtitle": "Flowith Neo AgentOS Menyapu Papan: Mendominasi dengan ", "subtitleHighlight": "Hampir Sempurna", "subtitleEnd": " Performa.", "openai": "OpenAI Operator", "gemini": "Gemini 2.5 Computer Use", "flowith": "Flowith Neo OS", "average": "Rata-rata", "easy": "Mudah", "medium": "Sedang", "hard": "Sulit" }, "skillsMemories": { "heading": "Keterampilan & Memori", "description": "Panduan yang dapat digunakan kembali dan konteks jangka panjang yang Neo referensikan secara otomatis di Mode Pro.", "markdownTag": "Markdown .md", "autoIndexedTag": "Diindeks otomatis", "citationsTag": "Kutipan di log", "howNeoUses": "Bagaimana Neo menggunakannya: sebelum setiap langkah di Mode Pro, Neo memeriksa Keterampilan dan Memori yang relevan, menggabungkannya ke dalam konteks penalaran, dan menerapkan instruksi atau preferensi secara otomatis.", "skillsTitle": "Keterampilan", "skillsTag": "Dibagikan", "skillsDesc": "Simpan pengetahuan yang dapat digunakan kembali yang dapat diterapkan agen mana pun. Setiap Keterampilan adalah panduan singkat tentang alat, alur kerja, atau pola.", "skillsProcedures": "Terbaik untuk: prosedur", "skillsFormat": "Format: Markdown", "skillsScenario": "Skenario sehari-hari", "skillsScenarioTitle": "Konversi & bagikan media", "skillsStep1": 'Anda berkata: "Ubah 20 gambar ini menjadi PDF kompak."', "skillsStep2": "Neo mengikuti keterampilan untuk mengunggah, mengonversi, menunggu penyelesaian, dan menyimpan file.", "skillsOutcome": "Hasil: PDF siap bagikan dengan tautan unduh di log.", "memoriesTitle": "Memori", "memoriesTag": "Pribadi", "memoriesDesc": "Tangkap preferensi, profil, dan fakta domain Anda. Neo mereferensikan item yang relevan saat membuat keputusan dan mengutipnya di log.", "memoriesStyle": "Terbaik untuk: gaya, aturan", "memoriesPrivate": "Pribadi secara default", "memoriesScenario": "Skenario sehari-hari", "memoriesScenarioTitle": "Suara & nada penulisan", "memoriesStep1": "Anda menyukai tulisan ringkas dan ramah dengan nada optimis.", "memoriesStep2": "Neo menerapkannya di email, laporan, dan pos media sosial secara otomatis.", "memoriesOutcome": "Hasil: suara merek yang konsisten tanpa mengulangi instruksi.", "taskFilesTitle": "File Tugas", "taskFilesTag": "Per tugas", "taskFilesDesc": "File sementara yang dibuat selama tugas saat ini. Mereka memfasilitasi I/O alat dan hasil antara dan tidak otomatis dibagikan dengan tugas lain.", "taskFilesEphemeral": "Sementara", "taskFilesReadable": "Dapat dibaca oleh alat", "taskFilesScenario": "Skenario sehari-hari", "taskFilesScenarioTitle": "Pelacak harga perjalanan", "taskFilesStep1": "Neo mengambil tabel penerbangan dan menyimpannya sebagai CSV untuk tugas ini.", "taskFilesStep2": "Membandingkan tarif hari ini dengan kemarin dan menyoroti perubahan.", "taskFilesOutcome": "Hasil: ringkasan rapi dan CSV yang dapat diunduh." }, "system": { "title": "Neo OS - agen browser terpintar untuk Anda", "tagline": "Berkembang Sendiri × Memori & Keterampilan × Kecepatan & Kecerdasan", "selfEvolving": "Berkembang Sendiri", "intelligence": "Kecerdasan", "contextImprovement": "Peningkatan Konteks", "contextDesc": "Agen reflektif menyempurnakan konteks secara real-time melalui sistem keterampilan", "onlineRL": "RL Online", "onlineRLDesc": "Pembaruan berkala selaras dengan perilaku agen", "intelligentMemory": "Memori Cerdas", "architecture": "Arsitektur", "dualLayer": "Sistem Dua Lapis", "dualLayerDesc": "Buffer jangka pendek + memori episodik jangka panjang", "knowledgeTransfer": "Transfer Pengetahuan", "knowledgeTransferDesc": "Pertahankan, gunakan kembali, dan transfer pembelajaran lintas tugas", "highPerformance": "Performa Tinggi", "infrastructure": "Infrastruktur", "executionKernel": "Kernel Eksekusi", "executionKernelDesc": "Orkestrasi paralel & penjadwalan dinamis", "speedCaching": "Cache Kecepatan", "speedCachingDesc": "Respons milidetik dengan eksekusi real-time", "speedIndicator": "~1ms", "summary": "Berkembang · Persisten · Cepat" }, "arch": { "heading": "Arsitektur", "subtitle": "OS berpusat agen: CPU (Perencana) + Memori/Filesystem + Keterampilan + I/O", "agentCentricNote": "flowithOS dirancang untuk agen.", "osShell": "OS Shell", "agentCore": "Inti Agen", "plannerExecutor": "Perencana · Eksekutor", "browserTabs": "Tab Browser", "domCanvas": "DOM · Canvas", "filesMemoriesSkills": "File · Memori · Keterampilan", "domPageTabs": "DOM · Halaman · Tab", "clickTypeScroll": "Klik · Ketik · Gulir", "visionNonDOM": "Visi · Operasi Non-DOM", "captchaDrag": "CAPTCHA · Seret", "onlineSearchThinking": "Pencarian Online · Berpikir Mendalam", "googleAnalysis": "google · analisis", "askUserReport": "Tanya Pengguna · Laporan", "choicesDoneReport": "pilihan · selesai_dan_laporan", "skillsApps": "Keterampilan (Aplikasi)", "skillsKinds": "Sistem · Pengguna · Dibagikan", "memory": "Memori", "memoryKinds": "Jangka pendek · Jangka panjang", "filesystem": "Filesystem", "filesystemKinds": "File Tugas · Aset · Log", "cpuTitle": "CPU — Agen Perencanaan", "cpuSub": "Perencana · Eksekutor · Reflektor", "planRow": "Rencanakan → Uraikan → Rute", "execRow": "Eksekusi → Amati → Refleksikan", "ioTitle": "Kemampuan I/O", "browserUse": "Penggunaan Browser", "browserUseDesc": "DOM · Tab · Visi · CAPTCHA", "terminalUse": "Penggunaan Terminal", "terminalUseDesc": "Shell · Alat · Skrip", "scriptUse": "Penggunaan Skrip", "scriptUseDesc": "Python · JS · Worker", "osVsHumanTitle": "OS Agen vs OS Berpusat Manusia", "osVsHuman1": "Aplikasi menjadi Keterampilan: dirancang untuk dibaca oleh Agen, bukan UI", "osVsHuman2": "CPU merencanakan/mengeksekusi melalui I/O; pengguna mengawasi di tingkat tugas", "osVsHuman3": "Memori bertahan lintas tugas; Filesystem mendukung I/O alat" }, "tips": { "heading": "Tips", "beta": "FlowithOS saat ini dalam versi Beta; baik produk maupun Agen Neo terus diperbarui. Harap tetap ikuti pembaruan terbaru.", "improving": "Kemampuan Agen Neo OS semakin meningkat setiap hari, Anda dapat mencoba menggunakan kemampuan baru untuk menyelesaikan tugas Anda." } };
const reward$9 = { "helloWorld": "Hello World", "helloWorldDesc": 'Ini Adalah Momen "Hello World" Anda Di Era Baru.<br />Jadilah Salah Satu Yang Pertama Membuat Jejak Di Internet Agen Dalam Sejarah Manusia.', "get2000Credits": "Klaim 2.000 Kredit Bonus Anda", "equivalent7Days": "Dan Otomatiskan Operasi Media Sosial Anda Selama 7 Hari.", "shareInstructions": `Setelah terbangun, perkenalkan Agen pribadi Anda ke dunia.<br />NeoOS akan secara otomatis membuat dan menerbitkan pesan pos "Hello World" di X untuk Anda<br />seperti hal lain yang bisa dilakukannya untuk Anda nanti.<br /><span style='display: block; height: 8px;'></span>Duduk santai dan saksikan itu terjadi.`, "osComing": "OS Datang", "awakeOS": "Bangunkan OS", "page2Title": "Undang dan Dapatkan", "page2Description1": "Perjalanan hebat lebih baik dengan teman.", "page2Description2": "Untuk setiap teman yang bergabung, Anda akan mendapat hadiah", "page2Description3": "kredit untuk memicu pemikiran Anda sendiri.", "retry": "Coba Lagi", "noCodesYet": "Belum ada kode undangan", "activated": "Diaktifkan", "neoStarting": "Neo memulai tugas berbagi otomatis...", "failed": "Gagal", "unknownError": "Error tidak diketahui", "errorRetry": "Terjadi kesalahan, silakan coba lagi", "unexpectedResponse": "Respons tidak terduga dari server", "failedToLoadCodes": "Gagal memuat kode undangan", "congratsCredits": "Selamat! +{{amount}} Kredit", "rewardUnlocked": "Hadiah dibuka untuk berbagi" };
const agentWidget$9 = { "modes": { "fast": { "label": "Mode cepat", "description": "Selesaikan tugas secepat mungkin, tidak akan menggunakan Keterampilan dan Memori.", "short": "Cepat", "modeDescription": "Aksi lebih cepat, detail lebih sedikit" }, "pro": { "label": "Mode pro", "description": "Kualitas tertinggi: analisis visual langkah demi langkah dengan penalaran mendalam. Mereferensikan Keterampilan dan Memori sesuai kebutuhan.", "short": "Pro", "modeDescription": "Seimbang, biarkan Neo memutuskan" } }, "minimize": "Minimalkan", "placeholder": "Minta Agen Neo OS untuk melakukan...", "changeModeTooltip": "Ubah mode untuk menyesuaikan perilaku agen", "preset": "Preset", "selectPresetTooltip": "Pilih preset untuk digunakan", "addNewPreset": "Tambah preset baru", "agentHistoryTooltip": "Riwayat aksi agen", "createPreset": "Buat preset", "presetName": "Nama preset", "instruction": "Instruksi", "upload": "Unggah", "newTask": "Tugas Baru", "draft": "Draf", "copyPrompt": "Salin prompt", "showMore": "Tampilkan lebih banyak", "showLess": "Tampilkan lebih sedikit", "agentIsWorking": "Agen sedang bekerja", "agentIsWrappingUp": "Agen sedang menyelesaikan", "completed": "Selesai", "paused": "Dijeda", "created": "Dibuat", "selectTask": "Pilih tugas", "unpin": "Lepas sematan", "pinToRight": "Sematkan ke kanan", "stepsCount": "Langkah ({{count}})", "files": "File", "filesCount": "File ({{count}})", "noFilesYet": "Belum ada file yang dibuat", "status": { "wrappingUp": "Agen sedang menyelesaikan...", "thinking": "Agen berpikir...", "wrappingUpAction": "Menyelesaikan aksi saat ini..." }, "actions": { "markedTab": "Tab Bertanda", "openRelatedTab": "Buka Tab Terkait (Dalam pengerjaan)", "open": "Buka", "openTab": "Buka Tab", "showInFolder": "Tampilkan di folder", "preview": "Pratinjau", "followUpPrefix": "Anda", "actionsHeader": "Aksi" }, "controls": { "rerun": "Jalankan ulang (Dalam pengerjaan)", "pause": "Jeda", "pauseAndArchive": "Jeda dan arsipkan", "resume": "Lanjutkan", "wrappingUpDisabled": "Sedang menyelesaikan..." }, "input": { "sending": "Mengirim...", "adjustTaskPlaceholder": "Kirim pesan baru untuk menyesuaikan tugas untuk Agen Neo..." }, "legacy": { "readOnlyNotice": "Ini adalah tugas lama dari versi sebelumnya. Mode hanya-tampil." }, "refunded": { "noFollowUp": "Tugas ini telah dikembalikan dananya. Pesan tindak lanjut tidak tersedia." }, "skills": { "matchingSkills": "mencocokkan keterampilan yang relevan…", "scanningSkills": "Pemindaian neural jitter keterampilan yang tersedia!!!", "scanningMap": "Memindai peta keterampilan neural…" }, "billing": { "creditsDepletedTitle": "Tambah lebih banyak kredit untuk melanjutkan", "creditsDepletedMessage": "Agen dijeda karena kredit Anda habis. Tambah kredit atau perbarui penagihan, lalu jalankan ulang tugas saat Anda siap." }, "presetActions": { "editPreset": "Edit preset", "deletePreset": "Hapus preset" }, "feedback": { "success": { "short": "Kerja bagus!", "long": "Sejauh ini bagus, kerja bagus!" }, "refund": { "short": "Ups, pengembalian dana!", "long": "Ups, saya ingin kredit saya kembali!" }, "refundSuccess": { "long": "Bagus! Kredit Anda telah dikembalikan!" }, "modal": { "title": "Minta Pengembalian Dana Kredit", "credits": "{{count}} kredit", "description": "Jika Anda tidak puas dengan tugas ini, minta pengembalian dana dan kami akan segera mengembalikan semua kredit yang digunakan untuk tugas ini.", "whatGoesWrong": "Apa yang salah", "errorMessage": "Maaf, harap berikan lebih banyak detail", "placeholder": "Jelaskan apa yang salah...", "shareTask": "Bagikan tugas ini dengan kami", "shareDescription": "Kami akan menganonimkan semua detail pribadi dari tugas Anda. Dengan membagikan tugas Anda dengan kami, kami akan meningkatkan kinerja agen kami pada tugas serupa di masa depan.", "upload": "Unggah", "attachFile": "lampirkan file", "submit": "Kirim", "submitting": "Mengirim...", "alreadyRefunded": { "title": "Sudah Dikembalikan Dananya", "message": "Tugas ini sudah dikembalikan dananya. Anda tidak dapat meminta pengembalian dana lagi." } }, "errors": { "systemError": "Kesalahan sistem. Silakan hubungi tim dukungan kami.", "networkError": "Kesalahan jaringan. Periksa koneksi Anda dan coba lagi.", "noUsageData": "Data penggunaan tidak ditemukan. Tidak dapat mengembalikan dana.", "alreadyRefunded": "Tugas ini sudah dikembalikan dananya.", "notAuthenticated": "Silakan login untuk meminta pengembalian dana.", "unknownError": "Terjadi kesalahan yang tidak terduga. Silakan coba lagi nanti.", "validationFailed": "Tidak dapat memvalidasi alasan Anda saat ini. Silakan coba lagi nanti.", "invalidReason": "Alasan ditolak. Harap jelaskan apa yang sebenarnya salah." }, "confirmation": { "creditsRefunded": "{{count}} Kredit Dikembalikan", "title": "Berhasil", "message": "Terima kasih! Tim kami akan mendiagnosis tugas Anda dan meningkatkan pengalaman FlowithOS.", "messageNoShare": "Terima kasih! Tim kami akan terus bekerja untuk meningkatkan pengalaman FlowithOS." } } };
const gate$9 = { "welcome": { "title": "Selamat Datang di FlowithOS", "subtitle": "Dari Web ke Dunia, FlowithOS adalah AgenticOS Terpintar yang mengubah browser Anda menjadi nilai dunia nyata.", "features": { "execute": { "title": "Eksekusi Tugas Apa Pun, Secara Otomatis", "description": "Bertindak dengan intuisi manusia pada kecepatan mesin, FlowithOS menavigasi dan mengeksekusi beberapa tugas di seluruh web berulang kali." }, "transform": { "title": "Ubah Ide Menjadi Dampak, Secara Cerdas", "description": "Dari inspirasi hingga penciptaan nilai, FlowithOS mengubah ide besar menjadi tindakan untuk memberikan hasil nyata." }, "organize": { "title": "Atur Aset Anda, Secara Sistematis", "description": "Dari penanda tersesat hingga panduan terstruktur, FlowithOS melengkapi Anda dengan sistem kuat untuk mengelola, mengurasi, dan menskalakan aset digital Anda." }, "evolve": { "title": "Berkembang Bersama Anda, Secara Dinamis", "description": "Dengan Memori yang tumbuh dari setiap interaksi, FlowithOS mengembangkan Keterampilan khusus—dari menavigasi situs kompleks hingga memahami gaya pribadi Anda." } }, "letsGo": "Ayo Mulai!" }, "auth": { "createAccount": "Buat akun", "signInToFlowith": "Masuk ke akun flowith Anda", "oneAccount": "Satu akun untuk semua produk flowith", "fromAnotherAccount": "Masuk dengan:", "useOwnEmail": "Atau gunakan email Anda sendiri", "email": "Email", "password": "Kata Sandi", "confirmPassword": "Konfirmasi kata sandi", "acceptTerms": "Saya menerima Ketentuan Penggunaan dan Kebijakan Privasi FlowithOS", "privacyNote": "Semua data Anda tetap 100% aman di perangkat Anda", "alreadyHaveAccount": "Sudah punya Akun Flowith?", "createNewAccount": "Tidak punya akun? Daftar", "signUp": "Daftar", "signIn": "Masuk", "processing": "Memproses...", "verifyEmail": "Verifikasi Email Anda", "verificationCodeSent": "Kami telah mengirim kode verifikasi 6 digit ke {{email}}", "enterVerificationCode": "Masukkan kode verifikasi", "verificationCode": "Kode Verifikasi", "enterSixDigitCode": "Masukkan kode 6 digit", "backToSignUp": "Kembali ke pendaftaran", "verifying": "Memverifikasi...", "verifyCode": "Verifikasi Kode", "errors": { "enterEmail": "Silakan masukkan email Anda", "enterPassword": "Silakan masukkan kata sandi Anda", "confirmPassword": "Silakan konfirmasi kata sandi Anda", "passwordsDoNotMatch": "Kata sandi tidak cocok", "acceptTerms": "Silakan terima Ketentuan Penggunaan dan Kebijakan Privasi", "authFailed": "Autentikasi gagal. Silakan coba lagi.", "invalidVerificationCode": "Silakan masukkan kode verifikasi 6 digit yang valid", "verificationFailed": "Verifikasi gagal. Silakan coba lagi.", "oauthFailed": "Autentikasi OAuth gagal. Silakan coba lagi.", "userAlreadyExists": "Email ini sudah terdaftar. Silakan " }, "goToLogin": "ke login", "signInPrompt": "masuk" }, "invitation": { "title": "Kebangkitan memerlukan kunci", "subtitle": "Silakan masukkan kode undangan Anda untuk membuka FlowithOS", "lookingForInvite": "Mencari undangan?", "followOnX": "Ikuti @flowith di X", "toGetAccess": "untuk mendapatkan akses.", "placeholder": "Kode undangan saya", "invalidCode": "Kode undangan tidak valid", "verificationFailed": "Verifikasi gagal - silakan coba lagi", "accessGranted": "Akses Diberikan", "initializing": "Selamat datang di FlowithOS. Menginisialisasi..." }, "browserImport": { "title": "Lanjutkan dari tempat Anda berhenti", "subtitle": "Impor penanda dan sesi tersimpan Anda dari browser saat ini dengan mulus.", "detecting": "Mendeteksi browser yang terinstal...", "noBrowsers": "Tidak ada browser yang terinstal terdeteksi", "imported": "Diimpor", "importing": "Mengimpor...", "bookmarks": "penanda", "importNote": "Mengimpor membutuhkan sekitar 5 detik. Anda akan melihat satu atau dua prompt sistem.", "skipForNow": "Lewati untuk sekarang", "nextStep": "Langkah berikutnya" }, "settings": { "title": "Siap untuk Mengalir?", "subtitle": "Beberapa penyesuaian cepat untuk menyempurnakan pengalaman Flowith OS Anda.", "defaultBrowser": { "title": "Atur sebagai Browser Default", "description": "Biarkan web mengalir kepada Anda. Tautan akan terbuka langsung di FlowithOS, menganyam konten online dengan mulus ke ruang kerja Anda." }, "addToDock": { "title": "Tambahkan ke Dock / Taskbar", "description": "Jaga hub kreatif Anda hanya satu klik untuk akses instan kapan pun inspirasi datang." }, "launchAtStartup": { "title": "Luncurkan saat Startup", "description": "Mulai hari Anda siap untuk berkreasi. Flowith OS akan menunggu Anda saat Anda login." }, "helpImprove": { "title": "Bantu Kami Meningkatkan", "description": "Bagikan data penggunaan anonim untuk membantu kami membangun produk yang lebih baik untuk semua orang.", "privacyNote": "Privasi Anda dilindungi sepenuhnya." }, "canChangeSettingsLater": "Anda dapat mengubah pengaturan ini nanti", "nextStep": "Langkah Berikutnya", "privacy": { "title": "Penyimpanan Lokal dan Perlindungan Privasi 100%", "description": "Riwayat eksekusi Agen, riwayat penjelajahan, Memori dan Keterampilan, kredensial akun, dan semua data privasi Anda disimpan 100% secara lokal di perangkat Anda. Tidak ada yang disinkronkan ke server cloud. Anda dapat menggunakan FlowithOS dengan tenang sepenuhnya." } }, "examples": { "title1": "OS Telah Bangun.", "title2": "Lihat dalam Aksi.", "subtitle": "Mulai dengan contoh untuk melihat cara kerjanya.", "enterFlowithOS": "Masuk ke FlowithOS", "clickToReplay": "klik untuk memutar ulang kasus ini", "videoNotSupported": "Browser Anda tidak mendukung pemutaran video.", "cases": { "shopping": { "title": "Selesaikan Belanja Liburan 10X Lebih Cepat", "description": "Isi keranjang Anda dengan set hadiah anak anjing sempurna—menghemat 2+ jam penjelajahan manual." }, "contentEngine": { "title": "Mesin Konten X 24/7", "description": "Menemukan cerita Hacker News teratas, menulis dengan suara unik Anda, dan auto-posting ke X. Mendorong 3X lebih banyak kunjungan profil dan pertumbuhan komunitas asli." }, "tiktok": { "title1": "Generator Hype TikTok: 500+ Keterlibatan,", "title2": "0 Usaha", "description": "Flowith OS membanjiri livestream lalu lintas tinggi dengan komentar tajam budaya, mengubah kehadiran digital menjadi momentum terukur." }, "youtube": { "title": "Pertumbuhan Saluran Youtube 95% Otonom", "description": "Flowith OS menyederhanakan seluruh alur kerja YouTube tanpa wajah, dari pembuatan hingga komunitas, memadatkan pekerjaan minggu menjadi kurang dari satu jam." } } }, "oauth": { "connecting": "Menghubungkan ke {{provider}}", "completeInBrowser": "Silakan selesaikan autentikasi di tab browser yang baru terbuka.", "cancel": "Batal" }, "terms": { "title": "Ketentuan Penggunaan & Kebijakan Privasi", "subtitle": "Silakan tinjau ketentuan di bawah ini.", "close": "Tutup" }, "invitationCodes": { "title": "Kode Undangan Saya", "availableToShare": "{{unused}} dari {{total}} tersedia untuk dibagikan", "loading": "Memuat kode Anda...", "noCodesYet": "Belum ada kode undangan.", "noCodesFound": "Tidak ada kode undangan ditemukan", "failedToLoad": "Gagal memuat kode undangan", "useCodeHint": "Gunakan kode undangan untuk mendapatkan kode Anda sendiri!", "shareHint": "Bagikan kode ini dengan teman untuk mengundang mereka ke FlowithOS", "used": "Digunakan" }, "history": { "title": "Riwayat", "searchPlaceholder": "Cari riwayat...", "selectAll": "Pilih Semua", "deselectAll": "Batalkan Pilihan Semua", "deleteSelected": "Hapus yang Dipilih ({{count}})", "clearAll": "Hapus Semua", "loading": "Memuat riwayat...", "noMatchingHistory": "Tidak ada riwayat yang cocok", "noHistoryYet": "Belum ada riwayat", "confirmDelete": "Konfirmasi Hapus", "deleteConfirmMessage": "Apakah Anda yakin ingin menghapus riwayat yang dipilih? Tindakan ini tidak dapat dibatalkan.", "cancel": "Batal", "delete": "Hapus", "today": "Hari ini", "yesterday": "Kemarin", "earlier": "Sebelumnya", "untitled": "Tanpa Judul", "visitedTimes": "Dikunjungi {{count}} kali", "openInNewTab": "Buka di tab baru", "timePeriod": "Periode Waktu", "timeRangeAll": "Semua", "timeRangeAllDesc": "Semua riwayat penjelajahan", "timeRangeToday": "Hari ini", "timeRangeTodayDesc": "Semua riwayat dari hari ini", "timeRangeYesterday": "Kemarin", "timeRangeYesterdayDesc": "Riwayat dari kemarin", "timeRangeLast7Days": "7 hari terakhir", "timeRangeLast7DaysDesc": "Riwayat dari minggu lalu", "timeRangeThisMonth": "Bulan ini", "timeRangeThisMonthDesc": "Riwayat dari bulan ini", "timeRangeLastMonth": "Bulan lalu", "timeRangeLastMonthDesc": "Riwayat dari bulan lalu", "deleteTimeRange": "Hapus {{range}}" } };
const update$9 = { "checking": { "title": "Memeriksa pembaruan", "description": "Menghubungkan ke server pembaruan..." }, "noUpdate": { "title": "Anda sudah terbaru", "currentVersion": "Versi saat ini v{{version}}", "description": "Anda sudah menggunakan versi terbaru", "close": "Tutup" }, "available": { "title": "Versi baru tersedia", "version": "v{{version}} tersedia", "currentVersion": "(Saat ini: v{{current}})", "released": "Dirilis {{time}}", "betaNote": "Kami dalam beta publik dan mengirimkan peningkatan setiap hari. Perbarui sekarang untuk tetap terkini.", "defaultReleaseNotes": "Rilis beta ini mencakup peningkatan performa, perbaikan bug, dan fitur baru. Kami mengirimkan pembaruan setiap hari. Silakan perbarui sekarang untuk pengalaman terbaik.", "downloadNow": "Unduh sekarang", "remindLater": "Ingatkan saya nanti", "preparing": "Mempersiapkan..." }, "downloading": { "title": "Mengunduh pembaruan", "version": "Mengunduh v{{version}}", "progress": "Progres unduhan", "hint": "Anda dapat membuka installer yang diunduh dengan mengklik tombol di bawah" }, "readyToInstall": { "title": "Siap untuk diinstal", "downloaded": "v{{version}} telah selesai diunduh", "hint": "Restart untuk menyelesaikan instalasi pembaruan", "restartNow": "Restart sekarang", "restartLater": "Restart nanti", "restarting": "Merestart..." }, "error": { "title": "Pemeriksaan pembaruan gagal", "default": "Pembaruan gagal. Silakan coba lagi nanti.", "downloadFailed": "Unduhan gagal. Silakan coba lagi nanti.", "installFailed": "Instalasi gagal. Silakan coba lagi nanti.", "close": "Tutup", "noChannelPermission": "Akun Anda tidak memiliki akses ke saluran pembaruan {{channel}}. Silakan beralih ke Stable dan coba lagi.", "switchToStable": "Beralih ke Stable dan coba lagi" }, "time": { "justNow": "baru saja", "minutesAgo": "{{count}} menit yang lalu", "hoursAgo": "{{count}} jam yang lalu" }, "notifications": { "newVersionAvailable": "Versi baru {{version}} tersedia", "downloadingInBackground": "Mengunduh di latar belakang", "updateDownloaded": "Pembaruan diunduh", "readyToInstall": "Versi {{version}} siap untuk diinstal" } };
const updateToast$9 = { "checking": "Memeriksa pembaruan...", "pleaseWait": "Harap tunggu", "preparingDownload": "Mempersiapkan untuk mengunduh {{version}}", "downloading": "Mengunduh pembaruan {{version}}", "updateCheckFailed": "Pemeriksaan pembaruan gagal", "unknownError": "Error tidak diketahui", "updatedTo": "Diperbarui ke v{{version}}", "newVersionReady": "Versi baru siap", "version": "Versi {{version}}", "close": "Tutup", "gotIt": "Mengerti", "installNow": "Restart Sekarang", "restarting": "Merestart…", "later": "Nanti", "collapseUpdateContent": "Ciutkan konten pembaruan", "viewUpdateContent": "Lihat konten pembaruan", "collapseLog": "Ciutkan ^", "viewLog": "Lihat log >", "channelChangeFailed": "Gagal beralih saluran: {{error}}", "channelInfo": "Saluran: {{channel}}, Manifest: {{manifest}}", "manualDownloadHint": "Instalasi otomatis gagal? Silakan instal manual →", "channelDowngraded": { "title": "Saluran Diubah", "message": "Akun Anda tidak memiliki akses ke {{previousChannel}}. Otomatis beralih ke {{newChannel}}." }, "time": { "justNow": "baru saja", "minutesAgo": "{{count}} menit yang lalu", "hoursAgo": "{{count}} jam yang lalu", "daysAgo": "{{count}} hari yang lalu", "weeksAgo": "{{count}} minggu yang lalu", "monthsAgo": "{{count}} bulan yang lalu", "yearsAgo": "{{count}} tahun yang lalu" } };
const errors$9 = { "auth": { "notLoggedIn": "Silakan login terlebih dahulu", "loginRequired": "Silakan login sebelum menggunakan fitur ini", "shareRequiresLogin": "Silakan login sebelum menggunakan fitur berbagi" }, "network": { "networkError": "Error jaringan - silakan periksa koneksi Anda", "requestTimeout": "Timeout permintaan - silakan coba lagi", "failedToVerify": "Gagal memverifikasi akses", "failedToFetch": "Gagal mengambil kode" }, "invitation": { "invalidCode": "Kode undangan tidak valid", "verificationFailed": "Verifikasi gagal - silakan coba lagi", "failedToConsume": "Gagal menggunakan kode undangan" }, "download": { "downloadFailed": "Unduhan gagal", "downloadInterrupted": "Unduhan terganggu" }, "security": { "secureConnection": "Koneksi Aman", "notSecure": "Tidak Aman", "localFile": "File Lokal", "unknownProtocol": "Protokol Tidak Dikenal" } };
const menus$9 = { "application": { "about": "Tentang {{appName}}", "checkForUpdates": "Periksa Pembaruan...", "settings": "Pengaturan...", "services": "Layanan", "hide": "Sembunyikan {{appName}}", "hideOthers": "Sembunyikan Lainnya", "showAll": "Tampilkan Semua", "quit": "Keluar", "updateChannel": "Saluran Pembaruan" }, "edit": { "label": "Edit", "undo": "Urungkan", "redo": "Ulangi", "cut": "Potong", "paste": "Tempel", "selectAll": "Pilih Semua" }, "view": { "label": "Tampilan", "findInPage": "Cari di Halaman", "newTab": "Tab Baru", "reopenClosedTab": "Buka Kembali Tab yang Ditutup", "newTerminalTab": "Tab Terminal Baru", "openLocalFile": "Buka File Lokal...", "goBack": "Kembali", "goForward": "Maju", "viewHistory": "Lihat Riwayat", "viewDownloads": "Lihat Unduhan", "archive": "Arsip", "reload": "Muat Ulang", "forceReload": "Paksa Muat Ulang", "actualSize": "Ukuran Sebenarnya", "zoomIn": "Perbesar", "zoomOut": "Perkecil", "toggleFullScreen": "Alihkan Layar Penuh" }, "window": { "label": "Jendela", "minimize": "Minimalkan", "close": "Tutup", "bringAllToFront": "Bawa Semua ke Depan" }, "help": { "label": "Bantuan", "about": "Tentang", "version": "Versi", "aboutDescription1": "Sistem Operasi Agen AI Generasi Berikutnya", "aboutDescription2": "dibangun untuk peningkatan diri, memori, dan kecepatan.", "copyright": "© 2025 Flowith, Inc. Hak cipta dilindungi." }, "contextMenu": { "back": "Kembali", "forward": "Maju", "reload": "Muat Ulang", "hardReload": "Muat Ulang Paksa (Abaikan Cache)", "openLinkInNewTab": "Buka Tautan di Tab Baru", "openLinkInExternal": "Buka Tautan di Browser Eksternal", "copyLinkAddress": "Salin Alamat Tautan", "downloadLink": "Unduh Tautan", "openImageInNewTab": "Buka Gambar di Tab Baru", "copyImageAddress": "Salin Alamat Gambar", "copyImage": "Salin Gambar", "downloadImage": "Unduh Gambar", "downloadVideo": "Unduh Video", "downloadAudio": "Unduh Audio", "openMediaInNewTab": "Buka Media di Tab Baru", "copyMediaAddress": "Salin Alamat Media", "openFrameInNewTab": "Buka Frame di Tab Baru", "openInExternal": "Buka di Browser Eksternal", "copyPageURL": "Salin URL Halaman", "viewPageSource": "Lihat Sumber Halaman (Tab Baru)", "savePageAs": "Simpan Halaman Sebagai…", "print": "Cetak…", "cut": "Potong", "paste": "Tempel", "searchWebFor": 'Cari di Web untuk "{{text}}"', "selectAll": "Pilih Semua", "inspectElement": "Inspeksi Elemen", "openDevTools": "Buka DevTools", "closeDevTools": "Tutup DevTools" }, "fileDialog": { "openLocalFile": "Buka File Lokal", "unsupportedFileType": "Tipe File Tidak Didukung", "savePageAs": "Simpan Halaman Sebagai", "allSupportedFiles": "Semua File yang Didukung", "htmlFiles": "File HTML", "textFiles": "File Teks", "images": "Gambar", "videos": "Video", "audio": "Audio", "pdf": "PDF", "webpageComplete": "Halaman Web, Lengkap", "singleFile": "File Tunggal (MHTML)" } };
const dialogs$9 = { "crash": { "title": "Error Aplikasi", "message": "Terjadi kesalahan tak terduga", "detail": "{{error}}\n\nKesalahan telah dicatat untuk tujuan debugging.", "restart": "Restart", "close": "Tutup" }, "customBackground": { "title": "Latar Belakang Kustom", "subtitle": "Buat gaya unik Anda sendiri", "preview": "Pratinjau", "angle": "Sudut", "stops": "Perhentian", "selectImage": "Pilih Gambar", "uploading": "Mengunggah...", "dropImageHere": "Letakkan gambar di sini", "dragAndDrop": "Seret & lepas atau klik", "fileTypes": "PNG, JPG, JPEG, WEBP, SVG, GIF", "fit": "Pas", "cover": "Tutup", "contain": "Tampung", "fill": "Isi", "remove": "Hapus", "cancel": "Batal", "apply": "Terapkan", "gradient": "Gradien", "solid": "Solid", "image": "Gambar", "dropImageError": "Silakan letakkan file gambar (PNG, JPG, JPEG, WEBP, SVG atau GIF)" } };
const humanInput$9 = { "declinedToAnswer": "Pengguna menolak menjawab, lewati pertanyaan ini", "needOneInput": "Perlu 1 input untuk melanjutkan", "needTwoInputs": "Perlu bantuan Anda untuk 2 hal", "needThreeInputs": "3 keputusan diperlukan dari Anda", "waitingOnInputs": "Menunggu {{count}} input dari Anda", "declineToAnswer": "Tolak untuk menjawab", "dropFilesHere": "Letakkan file di sini", "typeYourAnswer": "Ketik jawaban Anda...", "orTypeCustom": "Atau ketik kustom...", "uploadFiles": "Unggah file", "previousQuestion": "Pertanyaan sebelumnya", "goToQuestion": "Ke pertanyaan {{number}}", "nextQuestion": "Pertanyaan berikutnya" };
const id = {
  common: common$9,
  nav: nav$9,
  tray: tray$9,
  actions: actions$9,
  status: status$9,
  time: time$9,
  downloads: downloads$9,
  history: history$9,
  invitationCodes: invitationCodes$9,
  tasks: tasks$9,
  flows: flows$9,
  bookmarks: bookmarks$9,
  conversations: conversations$9,
  intelligence: intelligence$9,
  sidebar: sidebar$9,
  tabs: tabs$9,
  userMenu: userMenu$9,
  settings: settings$9,
  updateSettings: updateSettings$9,
  adblock: adblock$9,
  blank: blank$9,
  agentGuide: agentGuide$9,
  reward: reward$9,
  agentWidget: agentWidget$9,
  gate: gate$9,
  update: update$9,
  updateToast: updateToast$9,
  errors: errors$9,
  menus: menus$9,
  dialogs: dialogs$9,
  humanInput: humanInput$9
};
const common$8 = { "ok": "OK", "cancel": "キャンセル", "start": "スタート", "delete": "削除", "close": "閉じる", "save": "保存", "search": "検索", "loading": "読み込み中", "pressEscToClose": "ESCキーで閉じる", "copyUrl": "URLをコピー", "copied": "コピーしました", "copy": "コピー", "expand": "展開", "collapse": "折りたたむ", "openFlowithWebsite": "Flowithウェブサイトを開く", "openAgentGuide": "エージェントガイドを開く", "reward": "報酬", "closeWindow": "ウィンドウを閉じる", "minimizeWindow": "ウィンドウを最小化", "toggleFullscreen": "フルスクリーン切り替え", "saveEnter": "保存 (Enter)", "cancelEsc": "キャンセル (Esc)", "time": { "justNow": "たった今", "minutesAgo": "{{count}}分前", "hoursAgo": "{{count}}時間前", "daysAgo": "{{count}}日前" } };
const nav$8 = { "tasks": "タスク", "flows": "フロー", "bookmarks": "ブックマーク", "intelligence": "インテリジェンス", "guide": "ガイド" };
const tray$8 = { "newTask": "新しいタスク", "recentTasks": "最近のタスク", "viewMore": "もっと見る", "showMainWindow": "メインウィンドウを表示", "hideMainWindow": "メインウィンドウを非表示", "quit": "終了" };
const actions$8 = { "resume": "再開", "pause": "一時停止", "cancel": "キャンセル", "delete": "削除", "archive": "アーカイブ", "showInFolder": "フォルダで表示", "viewDetails": "詳細を表示", "openFile": "ファイルを開く" };
const status$8 = { "inProgress": "実行中", "completed": "完了", "archive": "アーカイブ", "paused": "一時停止中", "failed": "失敗", "cancelled": "キャンセル済み", "running": "実行中", "wrappingUp": "完了処理中..." };
const time$8 = { "today": "今日", "yesterday": "昨日", "earlier": "それ以前" };
const downloads$8 = { "title": "ダウンロード", "all": "すべて", "inProgress": "ダウンロード中", "completed": "完了", "noDownloads": "ダウンロードはありません", "failedToLoad": "ダウンロードの読み込みに失敗しました", "deleteConfirmMessage": "選択したダウンロードを削除してもよろしいですか？この操作は取り消せません。", "loadingDownloads": "読み込み中...", "searchPlaceholder": "ダウンロードを検索...", "selectAll": "すべて選択", "deselectAll": "選択を解除", "deleteSelected": "選択項目を削除 ({{count}})", "clearAll": "すべてクリア", "noMatchingDownloads": "一致するダウンロードが見つかりません", "noDownloadsYet": "まだダウンロードはありません", "confirmDelete": "削除の確認", "cancel": "キャンセル", "delete": "削除" };
const history$8 = { "title": "履歴", "allTime": "すべての期間", "clearHistory": "履歴をクリア", "removeItem": "項目を削除", "failedToLoad": "履歴の読み込みに失敗しました", "failedToClear": "履歴のクリアに失敗しました", "searchPlaceholder": "履歴を検索...", "selectAll": "すべて選択", "deselectAll": "選択を解除", "deleteSelected": "選択項目を削除 ({{count}})", "clearAll": "すべてクリア", "noMatchingHistory": "一致する履歴が見つかりません", "noHistoryYet": "まだ履歴はありません", "confirmDelete": "削除の確認", "deleteConfirmMessage": "選択した履歴を削除してもよろしいですか？この操作は取り消せません。", "cancel": "キャンセル", "delete": "削除", "today": "今日", "yesterday": "昨日", "earlier": "それ以前", "untitled": "無題", "visitedTimes": "{{count}}回訪問", "openInNewTab": "新しいタブで開く", "loading": "読み込み中...", "timePeriod": "期間", "timeRangeAll": "すべて", "timeRangeAllDesc": "すべての閲覧履歴", "timeRangeToday": "今日", "timeRangeTodayDesc": "今日の履歴", "timeRangeYesterday": "昨日", "timeRangeYesterdayDesc": "昨日の履歴", "timeRangeLast7Days": "過去7日間", "timeRangeLast7DaysDesc": "過去1週間の履歴", "timeRangeThisMonth": "今月", "timeRangeThisMonthDesc": "今月の履歴", "timeRangeLastMonth": "先月", "timeRangeLastMonthDesc": "先月の履歴", "deleteTimeRange": "{{range}}を削除", "last7days": "過去7日間", "thisMonth": "今月", "lastMonth": "先月" };
const invitationCodes$8 = { "title": "招待コード", "availableToShare": "{{total}}個中{{unused}}個が利用可能", "loading": "コードを読み込み中...", "noCodesYet": "まだ招待コードがありません", "noCodesFound": "招待コードが見つかりません", "failedToLoad": "招待コードの読み込みに失敗しました", "useCodeHint": "招待コードを使用してあなた自身のコードを取得しましょう！", "shareHint": "これらのコードを友達と共有してFlowithOSに招待しましょう", "used": "使用済み" };
const tasks$8 = { "title": "タスク", "description": "すべてのタスクをまとめて管理", "transformToPreset": "プリセットに変換", "noTasks": "タスクがありません", "archiveEmpty": "アーカイブは空です" };
const flows$8 = { "title": "フロー", "description": "作業用キャンバスを確認", "newFlow": "新規フロー", "rename": "名前を変更", "leave": "退出", "noFlows": "フローがありません", "signInToViewFlows": "サインインしてフローを表示", "pin": "ピン留め", "unpin": "ピン解除" };
const bookmarks$8 = { "title": "ブックマーク", "description": "お気に入りのページを素早くアクセス", "bookmark": "ブックマーク", "addNewCollection": "新しいコレクションを追加", "loadingBookmarks": "ブックマークを読み込み中...", "noMatchingBookmarks": "一致するブックマークがありません", "noBookmarksYet": "まだブックマークはありません", "importFromBrowsers": "ブラウザからインポート", "detectingBrowsers": "ブラウザを検出中...", "bookmarksCount": "個のブックマーク", "deleteCollection": "コレクションを削除", "deleteCollectionConfirm": "このコレクションを削除してもよろしいですか？", "newCollection": "新しいコレクション", "enterCollectionName": "新しいコレクションの名前を入力してください", "create": "作成", "collectionName": "コレクション名", "saveEnter": "保存 (Enter)", "cancelEsc": "キャンセル (Esc)", "renameFolder": "フォルダ名を変更", "renameBookmark": "ブックマーク名を変更", "deleteFolder": "フォルダを削除", "deleteBookmark": "ブックマークを削除" };
const conversations$8 = { "title": "会話", "noConversations": "まだ会話はありません" };
const intelligence$8 = { "title": "インテリジェンス", "description": "エージェントをより賢く育成", "knowledgeBase": "ナレッジベース", "memory": "メモリ", "skill": "スキル", "createNewSkill": "新しいスキルを作成", "createNewMemory": "新しいメモリを作成", "loading": "読み込み中...", "noSkills": "スキルがありません", "noMemories": "メモリがありません", "readOnly": "読み取り専用", "readOnlyMessage": "これはエージェントの性能を向上させる組み込みシステムスキルです。直接編集はできませんが、複製してご自身のコピーを編集できます。開いた後の編集内容は保存されませんのでご注意ください。", "readOnlyToast": "これはエージェントの性能を向上させる組み込みシステムスキルです。直接編集はできませんが、複製してご自身のコピーを編集できます。", "open": "開く", "kbComingSoon": "Flowithナレッジベースのサポートは近日公開予定です。", "system": "システム", "learnFromUser": "ユーザー", "systemPresetReadOnly": "システムプリセット（読み取り専用）", "actions": "アクション", "rename": "名前を変更", "duplicate": "複製...", "info": "情報", "saving": "保存中...", "fileInfo": "ファイル情報", "fileName": "名前", "fileSize": "サイズ", "fileCreated": "作成日時", "fileModified": "更新日時", "fileType": "種類", "fileLocation": "場所", "copyPath": "パスをコピー", "empowerOS": "ティーチモード", "teachMode": "ティーチモード", "teachModeDescription": "ティーチモードでは、Web のワークフローや手順を記録できます。OS Agent は静かに観察して学習し、再利用可能なスキルとナレッジへと落とし込みます。", "teachModeGoalLabel": "タスク目標（任意）", "teachModeGoalPlaceholder": "OS が学習できるよう、より多くの文脈を提供してください—具体的なタスク目標でも、関連情報でも構いません。", "teachModeTaskDisabled": "ティーチモードの実行中は新しいタスクを作成できません。", "empowering": "ティーチング", "empoweringDescription": "デモンストレーション中、OS Agent が観察して学習します", "yourGoal": "タスク目標", "preset": "プリセット", "generatedSkills": "生成されたスキル", "showLess": "非表示", "showMore": "もっと見る", "osHasLearned": "OSが学習しました", "complete": "完了", "interactionsPlaceholder": "ワークフローのデモンストレーション中に、インタラクションがここに表示されます", "done": "完了", "generatingGuidance": "ガイダンスを生成中...", "summarizingInteraction": "各インタラクションを要約し、再利用可能なスキルを準備しています", "skillSaved": "スキルを保存しました", "goal": "目標", "steps": "ステップ", "events": "イベント", "guidanceSavedSuccessfully": "ガイダンスの保存に成功しました", "openGuidanceInComposer": "Composerでガイダンスを開く", "recordAnotherWorkflow": "別のワークフローを記録", "dismissSummary": "サマリーを閉じる", "saveAndTest": "保存してテスト", "learning": "学習中...", "teachModeError": "ティーチモードで問題が発生しました", "errorDetails": "エラー詳細", "checkNetworkConnection": "ネットワーク接続を確認して、ティーチモードを再開してください", "tryAgain": "再試行", "resetState": "状態をリセット", "completeConfirmTitle": "OSエンパワーメント完了", "completeConfirmMessage": "以下のチェックリストから希望する結果を選択できます。", "capturedEvents": "キャプチャされたイベント", "confirmAndGenerate": "生成", "generating": "生成中", "promptSummary": "プロンプト要約", "saveToPreset": "プリセットに保存", "skillHostname": "スキル：{{hostname}}", "saveToSkill": "スキルに保存", "selectAll": "すべて選択", "discard": "破棄", "confirmDiscard": "はい、破棄", "tutorial": { "title": "ティーチモードへようこそ", "next": "次へ", "gotIt": "了解", "guideLabel": "ティーチモードガイド", "page1": { "title": "スキルとティーチモードとは？", "description": "スキルは、OSが再利用可能な専門知識を保存する場所であり、どのエージェントでも適用できます。各スキルは、Webアプリケーション、ワークフロー、またはインタラクションパターンに関するプロンプトベースのガイド（コードスニペットを含む場合があります）です。特定のWebサイトやタスクでOSのパフォーマンスを向上させるのに役立ちます。\n\nティーチモードは、OSに日常のルーチンをコピーさせたり、特定のWebサイトでの作業方法を学習させたりする方法です。これらは、将来再利用するための<strong>スキルとプリセット</strong>として保存されます。" }, "page2": { "title": "ティーチモードの開始方法は？", "description": "まず、左側の「<strong>インテリジェンスパネル</strong>」にある「<strong>ティーチモード</strong>」ボタンをクリックします。開始する前に、OSに初期指示を与え、明確なタスクを提供する<strong>教育目標</strong>を設定してください。" }, "page3": { "title": "OSはあなたの操作をどのように学習しますか？", "description": "教育中、OSはあなたの操作をリアルタイムで観察し、カーソルを追跡します。左側のパネルに記録されたすべてのステップが表示されます — いつでも一時停止でき、完了したら赤い「<strong>停止</strong>」アイコンをクリックしてください。" }, "page4": { "title": "OSの学習結果とは？", "description": "教育が完了したら、生成したい結果のタイプを選択してください。通常、日常的なタスクのためのプリセットと関連スキルが生成されます。生成後、<strong>Composer</strong>で確認と編集ができるほか、「<strong>インテリジェンス</strong>」パネルの「<strong>ユーザーから学習</strong>」フォルダーでいつでもアクセスできます。" } }, "skillTooltip": "以下でスキルを修正または編集できます", "skillSectionTooltip": "各スキルは、ティーチングセッション中に使用されたWebサイトのドメイン名に基づいて命名されます。新しく学習したスキルは、対応するMarkdownファイルの新しいセクションとして表示されます。" };
const sidebar$8 = { "goBack": "戻る", "goForward": "進む", "lockSidebar": "サイドバーを固定", "unlockSidebar": "サイドバーの固定を解除", "searchOrEnterAddress": "検索またはアドレスを入力", "reload": "再読み込み" };
const tabs$8 = { "newTab": "新しいタブ", "terminal": "ターミナル", "pauseAgent": "エージェントを一時停止", "resumeAgent": "エージェントを再開" };
const userMenu$8 = { "upgrade": "アップグレード", "creditsLeft": "残り", "clickToManageSubscription": "クリックしてサブスクリプションを管理", "theme": "テーマ", "lightMode": "ライトモード", "darkMode": "ダークモード", "systemMode": "システムモード", "language": "言語", "settings": "設定", "invitationCode": "招待コード", "checkUpdates": "アップデートを確認", "contactUs": "お問い合わせ", "signOut": "サインアウト", "openUserMenu": "ユーザーメニューを開く", "signIn": "サインイン" };
const settings$8 = { "title": "設定", "history": "履歴", "downloads": "ダウンロード", "adblock": "広告ブロック", "language": "言語", "languageDescription": "インターフェースの優先言語を選択してください。変更はすぐに反映されます。", "softwareUpdate": "ソフトウェア更新" };
const updateSettings$8 = { "description": "Flowith OSは、安全で信頼性の高いアップデートで最新の状態を保ちます。チャンネルを選択してください：安定性のStable、早期機能のBeta、または最先端ビルドのAlpha。アカウントがアクセスできるチャンネルにのみ切り替えできます。", "currentVersion": "現在のバージョン：{{version}}", "loadError": "読み込みに失敗しました", "warning": "警告：Beta/Alphaビルドは不安定で、作業に影響を与える可能性があります。本番環境ではStableを使用してください。", "channel": { "label": "アップデートチャンネル", "hint": "アクセス権があるチャンネルのみ選択できます。", "disabledHint": "アップデート進行中はチャンネルを切り替えできません", "options": { "stable": "Stable", "beta": "Beta", "alpha": "Alpha" } }, "actions": { "title": "手動確認", "hint": "利用可能なアップデートを今すぐ確認します。", "check": "アップデートを確認" }, "status": { "noUpdate": "最新の状態です。", "hasUpdate": "新しいバージョンが利用可能です。", "error": "アップデート確認に失敗しました。" }, "tips": { "title": "ヒント", "default": "デフォルトでは、安定版アップデートの通知を受け取ります。Early Accessでは、プレリリースビルドは本番作業に不安定な場合があります。", "warningTitle": "警告：Nightlyアップデートは自動適用されます", "warningBody": "Nightlyビルドは、Cursorが閉じられたときにプロンプトなしで自動的にアップデートをダウンロードしてインストールします。" } };
const adblock$8 = { "title": "広告ブロック", "description": "侵入的な広告とトラッカーをブロックし、ページのノイズをフィルタリングすることで、Neo OS Agent がより正確に情報を理解・抽出できるようにし、プライバシーを保護します。", "enable": "広告ブロックを有効にする", "enableDescription": "すべてのウェブサイトで広告を自動的にブロック", "statusActive": "有効 - 広告をブロックしています", "statusInactive": "無効 - 広告をブロックしていません", "adsBlocked": "件の広告をブロック", "networkBlocked": "ネットワークリクエスト", "cosmeticBlocked": "要素を非表示", "filterRules": "フィルタールール", "activeRules": "有効なルール" };
const blank$8 = { "openNewPage": "新しい空白ページを開く", "selectBackground": "背景を選択", "isAwake": "起動中", "osIsAwake": "OS起動中", "osGuideline": "OSガイドライン", "osGuidelineDescription": "OS Agentのクイックスタート - アーキテクチャ、モード、すべての機能。", "intelligence": "ティーチモード", "intelligenceDescription": "OS Agentにタスクの実行方法を教え、後で再利用できます", "inviteAndEarn": "招待して獲得", "tagline": "すべての行動から学び成長する能動的な記憶で、真にあなたを理解します。", "taskPreset": "タスクプリセット", "credits": "+{{amount}}クレジット", "addPreset": "新しいプリセットを追加", "editPreset": "プリセットを編集", "deletePreset": "プリセットを削除", "removeFromHistory": "履歴から削除", "previousPreset": "前のプリセット", "nextPreset": "次のプリセット", "previousPresets": "前のプリセット", "nextPresets": "次のプリセット", "createPreset": "プリセットを作成", "presetName": "プリセット名", "instruction": "指示", "presetNamePlaceholderCreate": "例：週次レポート、コードレビュー、データ分析...", "presetNamePlaceholderEdit": "プリセット名を入力...", "instructionPlaceholderCreate": "OSに何をしてほしいか記述してください...\n例：「今週の売上データを分析してサマリーレポートを作成」", "instructionPlaceholderEdit": "タスクの指示を更新...", "colorBlue": "青", "colorGreen": "緑", "colorYellow": "黄", "colorRed": "赤", "selectColor": "{{color}}色を選択", "creating": "作成中...", "updating": "更新中...", "create": "作成", "update": "更新", "smartInputPlaceholder": "ナビゲート、検索、またはNeoに任せる...", "processing": "処理中…", "navigate": "ナビゲート", "navigateDescription": "現在のタブでこのアドレスを開く", "searchGoogle": "Googleで検索", "searchGoogleDescription": "Googleで検索", "runTask": "タスク実行", "runTaskDescription": "Neoエージェントで実行", "createCanvas": "キャンバスで質問", "createCanvasDescription": "このプロンプトで Flo キャンバスを開く" };
const agentGuide$8 = { "title": "エージェントガイド", "subtitle": "OSエージェントのビジュアルクイックスタート：アーキテクチャ、モード、そしてできることすべて。", "capabilities": { "heading": "機能", "navigate": { "title": "ナビゲート", "desc": "ページを開く、戻る/進む" }, "click": { "title": "クリック", "desc": "ボタンやリンクを操作" }, "type": { "title": "入力", "desc": "入力欄やフォームに記入" }, "keys": { "title": "キー操作", "desc": "Enter、Escape、ショートカット" }, "scroll": { "title": "スクロール", "desc": "長いページを移動" }, "tabs": { "title": "タブ", "desc": "マーク、切替、閉じる" }, "files": { "title": "ファイル", "desc": "書込、読込、ダウンロード" }, "skills": { "title": "スキル", "desc": "共有ノウハウ" }, "memories": { "title": "メモリ", "desc": "長期記憶の設定" }, "upload": { "title": "アップロード", "desc": "ページにファイル送信" }, "ask": { "title": "確認", "desc": "ユーザーへの迅速な確認" }, "onlineSearch": { "title": "オンライン検索", "desc": "高速ウェブ検索" }, "extract": { "title": "抽出", "desc": "構造化情報の取得" }, "deepThink": { "title": "深い思考", "desc": "構造化された分析" }, "vision": { "title": "ビジョン", "desc": "非DOM精密操作" }, "shell": { "title": "シェル", "desc": "コマンド実行（利用可能時）" }, "report": { "title": "レポート", "desc": "完了と要約" } }, "benchmark": { "title": "Online-Mind2Webベンチマーク", "subtitle": "Flowith Neo AgentOSが完全制覇：", "subtitleHighlight": "ほぼ完璧", "subtitleEnd": "なパフォーマンスで圧倒的優位。", "openai": "OpenAI Operator", "gemini": "Gemini 2.5 Computer Use", "flowith": "Flowith Neo OS", "average": "平均", "easy": "簡単", "medium": "普通", "hard": "難しい" }, "skillsMemories": { "heading": "スキルとメモリ", "description": "再利用可能な手順書と長期的な文脈。Neoがプロモードで自動的に参照します。", "markdownTag": "Markdown .md", "autoIndexedTag": "自動インデックス", "citationsTag": "ログでの引用", "howNeoUses": "Neoの使い方：プロモードでは各ステップの前に、Neoが関連するスキルとメモリを確認し、推論の文脈に統合して、指示や設定を自動的に適用します。", "skillsTitle": "スキル", "skillsTag": "共有", "skillsDesc": "どのエージェントでも利用できる再利用可能な知識を保存します。各スキルは、ツール、作業手順、またはパターンに関する簡潔なガイドです。", "skillsProcedures": "最適用途：手順", "skillsFormat": "形式：Markdown", "skillsScenario": "日常シナリオ", "skillsScenarioTitle": "メディアの変換と共有", "skillsStep1": "あなた：「これら20枚の画像をコンパクトなPDFに変換して」", "skillsStep2": "Neoがスキルに従ってアップロード、変換、完了待機、ファイル保存を実行。", "skillsOutcome": "結果：ログにダウンロードリンク付きの共有可能なPDF。", "memoriesTitle": "メモリ", "memoriesTag": "個人用", "memoriesDesc": "あなたの設定、プロフィール、専門知識を記録します。Neoは意思決定の際に関連項目を参照し、ログに記載します。", "memoriesStyle": "最適用途：スタイル、ルール", "memoriesPrivate": "デフォルトで非公開", "memoriesScenario": "日常シナリオ", "memoriesScenarioTitle": "ライティングの声とトーン", "memoriesStep1": "あなたは簡潔でフレンドリー、楽観的なトーンのコピーが好きです。", "memoriesStep2": "Neoはメール、レポート、ソーシャル投稿全体で自動的に適用。", "memoriesOutcome": "結果：指示を繰り返すことなく一貫したブランドボイス。", "taskFilesTitle": "タスクファイル", "taskFilesTag": "タスクごと", "taskFilesDesc": "現在のタスク中に作成される一時ファイルです。ツールの入出力と中間結果に使用され、他のタスクとは自動的に共有されません。", "taskFilesEphemeral": "一時的", "taskFilesReadable": "ツールで読取可能", "taskFilesScenario": "日常シナリオ", "taskFilesScenarioTitle": "旅行価格トラッカー", "taskFilesStep1": "Neoがフライトテーブルをスクレイピングし、このタスク用にCSVとして保存。", "taskFilesStep2": "今日の運賃を昨日と比較し、変更を強調表示。", "taskFilesOutcome": "結果：きれいな要約とダウンロード可能なCSV。" }, "system": { "title": "Neo OS - あなたのための最も賢いブラウザエージェント", "tagline": "自己進化 × 記憶と技能 × 速度と知能", "selfEvolving": "自己進化", "intelligence": "インテリジェンス", "contextImprovement": "コンテキスト改善", "contextDesc": "振り返り機能を持つエージェントが、スキルシステムを通じてリアルタイムで文脈を改善します", "onlineRL": "オンラインRL", "onlineRLDesc": "定期的な更新によりエージェントの動作と連携", "intelligentMemory": "インテリジェントメモリ", "architecture": "アーキテクチャ", "dualLayer": "デュアルレイヤーシステム", "dualLayerDesc": "短期バッファ + 長期的なエピソード記憶", "knowledgeTransfer": "知識転送", "knowledgeTransferDesc": "タスク間での学習の保持、再利用、そして転送", "highPerformance": "高性能", "infrastructure": "インフラストラクチャ", "executionKernel": "実行カーネル", "executionKernelDesc": "並列オーケストレーションと動的スケジューリング", "speedCaching": "スピードキャッシング", "speedCachingDesc": "リアルタイム実行でミリ秒単位の応答", "speedIndicator": "〜1ms", "summary": "進化する・永続的・高速" }, "arch": { "heading": "アーキテクチャ", "osShell": "OSシェル", "agentCore": "エージェントコア", "plannerExecutor": "プランナー・エグゼキューター", "browserTabs": "ブラウザタブ", "domCanvas": "DOM・キャンバス", "filesMemoriesSkills": "ファイル・メモリ・スキル", "domPageTabs": "DOM・ページ・タブ", "clickTypeScroll": "クリック・入力・スクロール", "visionNonDOM": "ビジョン・非DOM操作", "captchaDrag": "CAPTCHA・ドラッグ", "onlineSearchThinking": "オンライン検索・深い思考", "googleAnalysis": "Google・分析", "askUserReport": "ユーザー確認・レポート", "choicesDoneReport": "選択肢・完了とレポート" }, "tips": { "heading": "ヒント", "beta": "FlowithOSは現在ベータ版です。製品とエージェントNeoの両方が継続的にアップデートされています。最新情報をお待ちください。", "improving": "エージェントNeo OSの能力は日々向上しています。新しい能力を使ってタスクを完了してみましょう。" } };
const reward$8 = { "helloWorld": "Hello World", "helloWorldDesc": "これはAgent時代の「Hello World」の瞬間です<br />次世代エージェントインターネットに足跡を残す最初の人々の一人になりましょう", "get2000Credits": "2000クレジットを獲得", "equivalent7Days": "7日間連続でソーシャルメディアを自動運用するのと同等", "shareInstructions": "覚醒後、あなたのFlowithOSを世界に紹介しましょう<br />選択したプラットフォームで「Hello World」メッセージを自動的に作成して公開します。<br />これは、今後できることのほんの一例です。<br /><span style='display: block; height: 8px;'></span>座って見守ってください。", "osComing": "OSが来た", "awakeOS": "Awake OS", "page2Title": "招待して獲得", "page2Description1": "素晴らしい旅は仲間と一緒に。", "page2Description2": "友達が参加するたびに、", "page2Description3": "クレジットをプレゼントします。", "retry": "再試行", "noCodesYet": "まだ招待コードがありません", "activated": "アクティベート済み", "neoStarting": "Neoが自動共有タスクを開始しています...", "failed": "失敗", "unknownError": "不明なエラー", "errorRetry": "エラーが発生しました。再試行してください", "unexpectedResponse": "サーバーから予期しない応答がありました", "failedToLoadCodes": "招待コードの読み込みに失敗しました", "congratsCredits": "おめでとうございます！+{{amount}}クレジット", "rewardUnlocked": "シェアによる報酬を獲得しました" };
const agentWidget$8 = { "modes": { "fast": { "label": "ファストモード", "description": "タスクを可能な限り高速で完了します。スキルとメモリは使用しません。", "short": "ファスト", "modeDescription": "より速く、詳細は少なく" }, "pro": { "label": "プロモード", "description": "最高品質：段階的なビジュアル分析と深い推論。必要に応じてスキルとメモリを参照します。", "short": "プロ", "modeDescription": "バランス型、Neoに任せる" } }, "minimize": "最小化", "placeholder": "Neo OSエージェントに依頼...", "changeModeTooltip": "エージェントの動作を調整するためにモードを変更", "preset": "プリセット", "selectPresetTooltip": "使用するプリセットを選択", "addNewPreset": "新しいプリセットを追加", "agentHistoryTooltip": "エージェントのアクション履歴", "createPreset": "プリセットを作成", "presetName": "プリセット名", "instruction": "指示", "upload": "アップロード", "newTask": "新しいタスク", "draft": "下書き", "copyPrompt": "プロンプトをコピー", "showMore": "さらに表示", "showLess": "表示を減らす", "agentIsWorking": "エージェントが作業中", "agentIsWrappingUp": "エージェントが完了処理中", "completed": "完了", "paused": "一時停止中", "created": "作成済み", "selectTask": "タスクを選択", "unpin": "固定解除", "pinToRight": "右に固定", "stepsCount": "ステップ ({{count}})", "files": "ファイル", "filesCount": "ファイル ({{count}})", "noFilesYet": "まだファイルが生成されていません", "status": { "wrappingUp": "エージェントが仕上げ中...", "thinking": "エージェント思考中...", "wrappingUpAction": "現在の操作を完了中..." }, "actions": { "markedTab": "マーク済みタブ", "openRelatedTab": "関連タブを開く(開発中)", "open": "開く", "openTab": "タブを開く", "showInFolder": "フォルダで表示", "preview": "プレビュー", "followUpPrefix": "あなた", "actionsHeader": "アクション" }, "controls": { "rerun": "再実行(開発中)", "pause": "一時停止", "pauseAndArchive": "一時停止してアーカイブ", "resume": "再開", "wrappingUpDisabled": "終了中..." }, "input": { "sending": "送信中...", "adjustTaskPlaceholder": "Agent Neoのタスクを調整するための新しいメッセージを送信..." }, "legacy": { "readOnlyNotice": "旧バージョンのタスク、閲覧のみ" }, "refunded": { "noFollowUp": "このタスクは返金されました。フォローアップメッセージは利用できません。" }, "skills": { "matchingSkills": "関連スキルを照合中…", "scanningSkills": "利用可能なスキルをスキャン中…", "scanningMap": "スキルマップを検索中…" }, "billing": { "creditsDepletedTitle": "クレジットを追加して続行", "creditsDepletedMessage": "クレジットが不足しているため、エージェントが一時停止されました。クレジットを追加するか、請求情報を更新してから、準備ができたらタスクを再実行してください。" }, "presetActions": { "editPreset": "プリセットを編集", "deletePreset": "プリセットを削除" }, "feedback": { "success": { "short": "素晴らしい！", "long": "ここまで順調です、素晴らしいです！" }, "refund": { "short": "おっと、返金！", "long": "おっと、クレジットを返してください！" }, "refundSuccess": { "long": "やった！クレジットが返金されました！" }, "modal": { "title": "クレジット返金のリクエスト", "credits": "{{count}} クレジット", "description": "このタスクにご満足いただけない場合は、返金をリクエストしてください。このタスクで使用されたすべてのクレジットを即座に返金いたします。", "whatGoesWrong": "何が問題でしたか", "errorMessage": "申し訳ございません。詳細を入力してください", "placeholder": "問題の詳細を記述してください...", "shareTask": "このタスクを共有する", "shareDescription": "お客様のタスクから個人情報をすべて削除いたします。タスクを共有していただくことで、今後同様のタスクでのエージェントのパフォーマンスを改善できます。", "upload": "アップロード", "attachFile": "ファイルを添付", "submit": "送信", "submitting": "送信中...", "alreadyRefunded": { "title": "返金済み", "message": "このタスクは既に返金されています。再度返金をリクエストすることはできません。" } }, "errors": { "systemError": "システムエラー。サポートチームにお問い合わせください。", "networkError": "ネットワークエラー。接続を確認してもう一度お試しください。", "noUsageData": "使用データが見つかりません。返金できません。", "alreadyRefunded": "このタスクは既に返金されています。", "notAuthenticated": "返金を依頼するにはログインしてください。", "unknownError": "予期しないエラーが発生しました。後でもう一度お試しください。", "validationFailed": "現在理由を検証できません。後でもう一度お試しください。", "invalidReason": "理由が却下されました。実際に何が問題だったのか説明してください。" }, "confirmation": { "creditsRefunded": "{{count}} クレジットが返金されました", "title": "成功", "message": "ありがとうございます！チームがお客様のタスクを診断し、FlowithOSの体験を改善いたします。", "messageNoShare": "ありがとうございます！チームは引き続きFlowithOSの体験改善に努めます。" } } };
const gate$8 = { "welcome": { "title": "FlowithOSへようこそ", "subtitle": "ウェブから世界へ。FlowithOSは、ブラウザを実世界の価値に変える最も賢いエージェントOSです。", "features": { "execute": { "title": "あらゆるタスクを自動実行", "description": "人間の直感を機械の速度で実現し、FlowithOSはウェブ全体で複数のタスクを繰り返し実行します。" }, "transform": { "title": "アイデアを影響力へ、知的に変換", "description": "インスピレーションから価値創造まで、FlowithOSは大きなアイデアを実際の成果につながる行動に変えます。" }, "organize": { "title": "資産を体系的に整理", "description": "散らばったブックマークから構造化された手順書まで、FlowithOSはデジタル資産を管理、整理、拡張するための強固なシステムを提供します。" }, "evolve": { "title": "あなたと共に動的に進化", "description": "すべてのやり取りから成長する記憶により、FlowithOSはカスタムスキルを開発します。複雑なサイトの操作からあなたの個人的なスタイルの理解まで。" } }, "letsGo": "始めましょう！" }, "auth": { "createAccount": "アカウントを作成", "signInToFlowith": "Flowithアカウントにサインイン", "oneAccount": "すべてのFlowith製品で使える一つのアカウント", "fromAnotherAccount": "他のアカウントから", "useOwnEmail": "自分のメールアドレスを使用", "email": "メールアドレス", "password": "パスワード", "confirmPassword": "パスワードを確認", "acceptTerms": "FlowithOSの利用規約とプライバシーポリシーに同意します", "privacyNote": "すべてのデータは100%安全にお使いのデバイスに保存されます", "alreadyHaveAccount": "すでにFlowithアカウントをお持ちの方", "createNewAccount": "新しいアカウントを作成", "signUp": "サインアップ", "signIn": "サインイン", "processing": "処理中...", "verifyEmail": "メールアドレスを確認", "verificationCodeSent": "{{email}}に6桁の確認コードを送信しました", "enterVerificationCode": "確認コードを入力", "verificationCode": "確認コード", "enterSixDigitCode": "6桁のコードを入力", "backToSignUp": "サインアップに戻る", "verifying": "確認中...", "verifyCode": "コードを確認", "errors": { "enterEmail": "メールアドレスを入力してください", "enterPassword": "パスワードを入力してください", "confirmPassword": "パスワードを確認してください", "passwordsDoNotMatch": "パスワードが一致しません", "acceptTerms": "利用規約とプライバシーポリシーに同意してください", "authFailed": "認証に失敗しました。もう一度お試しください。", "invalidVerificationCode": "有効な6桁の確認コードを入力してください", "verificationFailed": "確認に失敗しました。もう一度お試しください。", "oauthFailed": "OAuth認証に失敗しました。もう一度お試しください。", "userAlreadyExists": "このメールアドレスは既に登録されています。" }, "goToLogin": "ログインへ", "signInPrompt": "ログインする" }, "invitation": { "title": "目覚めには鍵が必要です", "subtitle": "招待コードを入力してFlowithOSのロックを解除してください", "lookingForInvite": "招待を探していますか？", "followOnX": "X（旧Twitter）で@flowithをフォロー", "toGetAccess": "してアクセスを取得しましょう。", "placeholder": "招待コード", "invalidCode": "無効な招待コードです", "verificationFailed": "確認に失敗しました - もう一度お試しください", "accessGranted": "アクセスが許可されました", "initializing": "FlowithOSへようこそ。初期化中..." }, "browserImport": { "title": "中断したところから再開", "subtitle": "現在のブラウザからブックマークと保存されたセッションをシームレスにインポートします。", "detecting": "インストールされているブラウザを検出中...", "noBrowsers": "インストールされているブラウザが検出されませんでした", "imported": "インポート済み", "importing": "インポート中...", "bookmarks": "個のブックマーク", "importNote": "インポートには約5秒かかります。1～2個のシステムプロンプトが表示されます。", "skipForNow": "今はスキップ", "nextStep": "次のステップ" }, "settings": { "title": "準備はできましたか？", "subtitle": "Flowith OSの体験を完璧にするための簡単な調整をいくつか行います。", "defaultBrowser": { "title": "デフォルトブラウザに設定", "description": "すべてのリンクがFlowithOSで直接開き、オンラインコンテンツがワークスペースにシームレスに統合されます。" }, "addToDock": { "title": "Dock/タスクバーに追加", "description": "ワンクリックで常にアクセス可能に。インスピレーションが湧いたときにすぐに使えます。" }, "launchAtStartup": { "title": "起動時に開始", "description": "ログインと同時にFlowith OSが起動し、すぐに作業を開始できます。" }, "helpImprove": { "title": "改善にご協力ください", "description": "匿名の使用データを共有して、すべてのユーザーのためのより良い製品作りにご協力ください。", "privacyNote": "プライバシーは完全に保護されます。" }, "canChangeSettingsLater": "これらの設定は後で変更できます", "nextStep": "次のステップ", "privacy": { "title": "100%ローカル保存とプライバシー保護", "description": "エージェントの実行履歴、閲覧履歴、メモリとスキル、アカウント認証情報など、すべてのプライバシーデータは100%お使いのデバイスにのみ保存されます。クラウドサーバーに同期されることはありません。安心してFlowithOSをご利用ください。" } }, "examples": { "title1": "OS起動完了。", "title2": "実際に見てみましょう。", "subtitle": "例から始めて、どのように機能するかを確認しましょう。", "enterFlowithOS": "FlowithOSに入る", "clickToReplay": "このケースを再生するにはクリック", "videoNotSupported": "お使いのブラウザはビデオ再生をサポートしていません。", "cases": { "shopping": { "title": "ホリデーショッピングを10倍速で完了", "description": "完璧な子犬用ギフトセットでカートを満たします — 2時間以上の手動ブラウジングを節約します。" }, "contentEngine": { "title": "24時間365日のXコンテンツエンジン", "description": "トップのHacker Newsストーリーを発見し、あなた独自の声で書き、Xに自動投稿。3倍のプロフィール訪問と本物のコミュニティ成長を促進します。" }, "tiktok": { "title1": "TikTokハイプジェネレーター：500以上のエンゲージメント、", "title2": "努力ゼロ", "description": "Flowith OSは高トラフィックのライブストリームに文化的に鋭いコメントで溢れさせ、デジタルプレゼンスを測定可能な勢いに変えます。" }, "youtube": { "title": "95%自動のYouTubeチャンネル成長", "description": "Flowith OSは、作成からコミュニティまで、顔出しなしYouTubeワークフロー全体を効率化し、数週間の作業を1時間未満に凝縮します。" } } }, "oauth": { "connecting": "{{provider}}に接続中", "completeInBrowser": "開いたブラウザタブで認証を完了してください。", "cancel": "キャンセル" }, "terms": { "title": "利用規約とプライバシーポリシー", "subtitle": "以下の規約をご確認ください。", "close": "閉じる" }, "invitationCodes": { "title": "招待コード", "availableToShare": "{{total}}個中{{unused}}個が利用可能", "loading": "コードを読み込み中...", "noCodesYet": "まだ招待コードがありません", "noCodesFound": "招待コードが見つかりません", "failedToLoad": "招待コードの読み込みに失敗しました", "useCodeHint": "招待コードを使用してあなた自身のコードを取得しましょう！", "shareHint": "これらのコードを友達と共有してFlowithOSに招待しましょう", "used": "使用済み" }, "history": { "title": "履歴", "searchPlaceholder": "履歴を検索...", "selectAll": "すべて選択", "deselectAll": "選択を解除", "deleteSelected": "選択項目を削除 ({{count}})", "clearAll": "すべてクリア", "loading": "履歴を読み込み中...", "noMatchingHistory": "一致する履歴が見つかりません", "noHistoryYet": "まだ履歴はありません", "confirmDelete": "削除の確認", "deleteConfirmMessage": "選択した履歴を削除してもよろしいですか？この操作は取り消せません。", "cancel": "キャンセル", "delete": "削除", "today": "今日", "yesterday": "昨日", "earlier": "それ以前", "untitled": "無題", "visitedTimes": "{{count}}回訪問", "openInNewTab": "新しいタブで開く", "timePeriod": "期間", "timeRangeAll": "すべて", "timeRangeAllDesc": "すべての閲覧履歴", "timeRangeToday": "今日", "timeRangeTodayDesc": "今日の履歴", "timeRangeYesterday": "昨日", "timeRangeYesterdayDesc": "昨日の履歴", "timeRangeLast7Days": "過去7日間", "timeRangeLast7DaysDesc": "過去1週間の履歴", "timeRangeThisMonth": "今月", "timeRangeThisMonthDesc": "今月の履歴", "timeRangeLastMonth": "先月", "timeRangeLastMonthDesc": "先月の履歴", "deleteTimeRange": "{{range}}を削除" } };
const update$8 = { "checking": { "title": "アップデート確認中", "description": "アップデートサーバーに接続中..." }, "noUpdate": { "title": "最新版です", "currentVersion": "現在のバージョン v{{version}}", "description": "すでに最新版をお使いです", "close": "閉じる" }, "available": { "title": "新しいバージョンが利用可能", "version": "v{{version}} が利用可能", "currentVersion": "（現在：v{{current}}）", "released": "リリース日時 {{time}}", "betaNote": "現在パブリックベータ版として、毎日改善を提供しています。今すぐアップデートして最新機能をご利用ください。", "defaultReleaseNotes": "このベータ版には、パフォーマンスの改善、バグ修正、新機能が含まれています。毎日アップデートを提供していますので、今すぐアップデートして最高のエクスペリエンスをお楽しみください。", "downloadNow": "今すぐダウンロード", "remindLater": "後で通知", "preparing": "準備中..." }, "downloading": { "title": "アップデートをダウンロード中", "version": "v{{version}} をダウンロード中", "progress": "ダウンロード進行状況", "hint": "ダウンロード完了後、インストールの案内が表示されます" }, "readyToInstall": { "title": "インストール準備完了", "downloaded": "v{{version}} のダウンロードが完了しました", "hint": "アップデートのインストールを完了するには再起動してください", "restartNow": "今すぐ再起動", "restartLater": "後で再起動", "restarting": "再起動中..." }, "error": { "title": "アップデート確認に失敗", "default": "アップデートに失敗しました。後でもう一度お試しください。", "downloadFailed": "ダウンロードに失敗しました。後でもう一度お試しください。", "installFailed": "インストールに失敗しました。後でもう一度お試しください。", "close": "閉じる" }, "time": { "justNow": "たった今", "minutesAgo": "{{count}}分前", "hoursAgo": "{{count}}時間前" }, "notifications": { "newVersionAvailable": "新バージョン {{version}} が利用可能です", "downloadingInBackground": "バックグラウンドでダウンロード中", "updateDownloaded": "更新をダウンロードしました", "readyToInstall": "バージョン {{version}} のインストール準備ができました" } };
const updateToast$8 = { "checking": "アップデートを確認中...", "pleaseWait": "お待ちください", "preparingDownload": "ダウンロード準備中 {{version}}", "updateFound": "アップデート {{version}} を発見", "downloading": "アップデート {{version}} をダウンロード中", "updateCheckFailed": "アップデート確認に失敗しました", "unknownError": "不明なエラー", "updatedTo": "v{{version}} に更新されました", "newVersionReady": "新しいバージョンの準備ができました", "version": "バージョン {{version}}", "close": "閉じる", "gotIt": "了解しました", "installNow": "今すぐ再起動", "restarting": "再起動中…", "later": "後で", "collapseUpdateContent": "更新内容を折りたたむ", "viewUpdateContent": "更新内容を表示", "collapseLog": "折りたたむ ^", "viewLog": "ログを表示 >", "channelChangeFailed": "チャンネル切り替えに失敗しました: {{error}}", "channelInfo": "Channel: {{channel}}, Manifest: {{manifest}}", "manualDownloadHint": "更新できませんか？手動インストールを試す →", "channelDowngraded": { "title": "チャンネルが切り替えられました", "message": "アカウントに{{previousChannel}}へのアクセス権がありません。自動的に{{newChannel}}に切り替えられました。" }, "continueInBackground": "ダウンロードはバックグラウンドで続行されます", "time": { "justNow": "たった今", "minutesAgo": "{{count}}分前", "hoursAgo": "{{count}}時間前", "daysAgo": "{{count}}日前", "weeksAgo": "{{count}}週間前", "monthsAgo": "{{count}}ヶ月前", "yearsAgo": "{{count}}年前" } };
const errors$8 = { "auth": { "notLoggedIn": "最初にログインしてください", "loginRequired": "この機能を使用する前にログインしてください", "shareRequiresLogin": "共有機能を使用する前にログインしてください" }, "network": { "networkError": "ネットワークエラー - 接続を確認してください", "requestTimeout": "リクエストがタイムアウトしました - 再試行してください", "failedToVerify": "確認に失敗しました", "failedToFetch": "取得に失敗しました" }, "invitation": { "invalidCode": "無効な招待コード", "verificationFailed": "確認に失敗しました - 再試行してください", "failedToConsume": "招待コードの使用に失敗しました" }, "download": { "downloadFailed": "ダウンロードに失敗しました", "downloadInterrupted": "ダウンロードが中断されました" }, "security": { "secureConnection": "安全な接続", "notSecure": "安全ではありません", "localFile": "ローカルファイル", "unknownProtocol": "不明なプロトコル" } };
const menus$8 = { "application": { "about": "{{appName}}について", "checkForUpdates": "アップデートを確認...", "settings": "設定...", "services": "サービス", "hide": "{{appName}}を隠す", "hideOthers": "他を隠す", "showAll": "すべて表示", "quit": "終了", "updateChannel": "アップデートチャンネル" }, "edit": { "label": "編集", "undo": "取り消す", "redo": "やり直す", "cut": "カット", "paste": "ペースト", "selectAll": "すべて選択" }, "view": { "label": "表示", "findInPage": "ページ内検索", "newTab": "新しいタブ", "reopenClosedTab": "閉じたタブを開き直す", "newTerminalTab": "新しいターミナルタブ", "openLocalFile": "ローカルファイルを開く...", "goBack": "戻る", "goForward": "進む", "viewHistory": "履歴を表示", "viewDownloads": "ダウンロードを表示", "archive": "アーカイブ", "reload": "再読み込み", "forceReload": "強制再読み込み", "actualSize": "実際のサイズ", "zoomIn": "拡大", "zoomOut": "縮小", "toggleFullScreen": "全画面表示を切り替え" }, "window": { "label": "ウィンドウ", "minimize": "最小化", "close": "閉じる", "bringAllToFront": "すべてを手前に移動" }, "help": { "label": "ヘルプ", "about": "について", "version": "バージョン", "aboutDescription1": "次世代AIエージェントオペレーティングシステム", "aboutDescription2": "自己改善、メモリー、スピードのために構築されています。", "copyright": "© 2025 Flowith, Inc. All rights reserved." }, "contextMenu": { "back": "戻る", "forward": "進む", "reload": "再読み込み", "hardReload": "強制再読み込み(キャッシュを無視)", "openLinkInNewTab": "リンクを新しいタブで開く", "openLinkInExternal": "外部ブラウザでリンクを開く", "copyLinkAddress": "リンクのアドレスをコピー", "downloadLink": "リンクをダウンロード", "openImageInNewTab": "画像を新しいタブで開く", "copyImageAddress": "画像のアドレスをコピー", "copyImage": "画像をコピー", "downloadImage": "画像をダウンロード", "downloadVideo": "動画をダウンロード", "downloadAudio": "音声をダウンロード", "openMediaInNewTab": "メディアを新しいタブで開く", "copyMediaAddress": "メディアのアドレスをコピー", "openFrameInNewTab": "フレームを新しいタブで開く", "openInExternal": "外部ブラウザで開く", "copyPageURL": "ページのURLをコピー", "viewPageSource": "ページのソースを表示(新しいタブ)", "savePageAs": "ページを別名で保存...", "print": "印刷...", "cut": "カット", "paste": "ペースト", "searchWebFor": '"{{text}}"をウェブ検索', "selectAll": "すべて選択", "inspectElement": "要素を検証", "openDevTools": "開発者ツールを開く", "closeDevTools": "開発者ツールを閉じる" }, "fileDialog": { "openLocalFile": "ローカルファイルを開く", "unsupportedFileType": "サポートされていないファイルタイプ", "savePageAs": "ページを別名で保存", "allSupportedFiles": "すべてのサポートされているファイル", "htmlFiles": "HTMLファイル", "textFiles": "テキストファイル", "images": "画像", "videos": "動画", "audio": "音声", "pdf": "PDF", "webpageComplete": "ウェブページ、完全", "singleFile": "単一ファイル(MHTML)" } };
const dialogs$8 = { "crash": { "title": "アプリケーションエラー", "message": "予期しないエラーが発生しました", "detail": "{{error}}\n\nエラーはデバッグ目的で記録されました。", "restart": "再起動", "close": "閉じる" }, "customBackground": { "title": "カスタム背景", "subtitle": "独自のスタイルを作成", "preview": "プレビュー", "angle": "角度", "stops": "グラデーション", "selectImage": "画像を選択", "uploading": "アップロード中...", "dropImageHere": "ここに画像をドロップ", "dragAndDrop": "ドラッグ＆ドロップまたはクリック", "fileTypes": "PNG、JPG、JPEG、WEBP、SVG、GIF", "fit": "フィット", "cover": "カバー", "contain": "含む", "fill": "塗りつぶし", "remove": "削除", "cancel": "キャンセル", "apply": "適用", "gradient": "グラデーション", "solid": "単色", "image": "画像", "dropImageError": "画像ファイルをドロップしてください(PNG、JPG、JPEG、WEBP、SVG、GIF)" } };
const humanInput$8 = { "declinedToAnswer": "ユーザーが回答を拒否しました。この質問はスキップされました", "needOneInput": "続行するには1つの入力が必要です", "needTwoInputs": "2つの項目についてご協力が必要です", "needThreeInputs": "3つの決定が必要です", "waitingOnInputs": "{{count}}個の入力をお待ちしています", "declineToAnswer": "回答を拒否", "dropFilesHere": "ここにファイルをドロップ", "typeYourAnswer": "回答を入力してください...", "orTypeCustom": "またはカスタム入力...", "uploadFiles": "ファイルをアップロード", "previousQuestion": "前の質問", "goToQuestion": "質問{{number}}に移動", "nextQuestion": "次の質問" };
const jp = {
  common: common$8,
  nav: nav$8,
  tray: tray$8,
  actions: actions$8,
  status: status$8,
  time: time$8,
  downloads: downloads$8,
  history: history$8,
  invitationCodes: invitationCodes$8,
  tasks: tasks$8,
  flows: flows$8,
  bookmarks: bookmarks$8,
  conversations: conversations$8,
  intelligence: intelligence$8,
  sidebar: sidebar$8,
  tabs: tabs$8,
  userMenu: userMenu$8,
  settings: settings$8,
  updateSettings: updateSettings$8,
  adblock: adblock$8,
  blank: blank$8,
  agentGuide: agentGuide$8,
  reward: reward$8,
  agentWidget: agentWidget$8,
  gate: gate$8,
  update: update$8,
  updateToast: updateToast$8,
  errors: errors$8,
  menus: menus$8,
  dialogs: dialogs$8,
  humanInput: humanInput$8
};
const common$7 = { "ok": "확인", "cancel": "취소", "start": "시작", "delete": "삭제", "close": "닫기", "save": "저장", "search": "검색", "loading": "로딩 중", "pressEscToClose": "ESC를 눌러 닫기", "copyUrl": "URL 복사", "copied": "복사됨", "copy": "복사", "expand": "펼치기", "collapse": "접기", "openFlowithWebsite": "Flowith 웹사이트 열기", "openAgentGuide": "에이전트 가이드 열기", "reward": "보상", "closeWindow": "창 닫기", "minimizeWindow": "창 최소화", "toggleFullscreen": "전체 화면 전환", "saveEnter": "저장 (Enter)", "cancelEsc": "취소 (Esc)", "time": { "justNow": "방금 전", "minutesAgo": "{{count}}분 전", "hoursAgo": "{{count}}시간 전", "daysAgo": "{{count}}일 전" } };
const nav$7 = { "tasks": "작업", "flows": "플로우", "bookmarks": "북마크", "intelligence": "인텔리전스", "guide": "가이드" };
const tray$7 = { "newTask": "새 작업", "recentTasks": "최근 작업", "viewMore": "더 보기", "showMainWindow": "메인 창 표시", "hideMainWindow": "메인 창 숨기기", "quit": "종료" };
const actions$7 = { "resume": "재개", "pause": "일시정지", "cancel": "취소", "delete": "삭제", "archive": "보관", "showInFolder": "폴더에서 보기", "viewDetails": "세부정보 보기", "openFile": "파일 열기" };
const status$7 = { "inProgress": "진행 중", "completed": "완료됨", "archive": "보관", "paused": "일시정지됨", "failed": "실패", "cancelled": "취소됨", "running": "실행 중", "wrappingUp": "마무리 중..." };
const time$7 = { "today": "오늘", "yesterday": "어제", "earlier": "이전" };
const downloads$7 = { "title": "다운로드", "all": "전체", "inProgress": "진행 중", "completed": "완료됨", "noDownloads": "다운로드 없음", "failedToLoad": "다운로드를 불러오지 못했습니다", "deleteConfirmMessage": "선택한 다운로드를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.", "loadingDownloads": "불러오는 중...", "searchPlaceholder": "다운로드 검색...", "selectAll": "전체 선택", "deselectAll": "전체 선택 해제", "deleteSelected": "선택 항목 삭제 ({{count}})", "clearAll": "전체 삭제", "noMatchingDownloads": "일치하는 다운로드가 없습니다", "noDownloadsYet": "다운로드가 없습니다", "confirmDelete": "삭제 확인", "cancel": "취소", "delete": "삭제" };
const history$7 = { "title": "방문 기록", "allTime": "전체 기간", "clearHistory": "기록 지우기", "removeItem": "항목 제거", "failedToLoad": "기록을 불러오지 못했습니다", "failedToClear": "기록을 지우지 못했습니다", "searchPlaceholder": "기록 검색...", "selectAll": "전체 선택", "deselectAll": "선택 해제", "deleteSelected": "선택 항목 삭제 ({{count}})", "clearAll": "전체 삭제", "noMatchingHistory": "일치하는 기록이 없습니다", "noHistoryYet": "아직 방문 기록이 없습니다", "confirmDelete": "삭제 확인", "deleteConfirmMessage": "선택한 방문 기록을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.", "cancel": "취소", "delete": "삭제", "today": "오늘", "yesterday": "어제", "earlier": "이전", "untitled": "제목 없음", "visitedTimes": "{{count}}번 방문함", "openInNewTab": "새 탭에서 열기", "loading": "로딩 중...", "timePeriod": "기간", "timeRangeAll": "전체", "timeRangeAllDesc": "전체 방문 기록", "timeRangeToday": "오늘", "timeRangeTodayDesc": "오늘의 모든 기록", "timeRangeYesterday": "어제", "timeRangeYesterdayDesc": "어제의 방문 기록", "timeRangeLast7Days": "최근 7일", "timeRangeLast7DaysDesc": "지난 주의 기록", "timeRangeThisMonth": "이번 달", "timeRangeThisMonthDesc": "이번 달의 방문 기록", "timeRangeLastMonth": "지난 달", "timeRangeLastMonthDesc": "지난 달의 방문 기록", "deleteTimeRange": "{{range}} 삭제", "last7days": "최근 7일", "thisMonth": "이번 달", "lastMonth": "지난 달" };
const invitationCodes$7 = { "title": "내 초대 코드", "availableToShare": "{{unused}}/{{total}} 공유 가능", "loading": "로딩 중...", "noCodesYet": "아직 초대 코드가 없습니다", "noCodesFound": "초대 코드를 찾을 수 없습니다", "failedToLoad": "초대 코드를 불러올 수 없습니다", "useCodeHint": "초대 코드를 사용하면 나만의 코드를 받을 수 있어요!", "shareHint": "친구들에게 코드를 공유하여 FlowithOS에 초대하세요", "used": "사용됨" };
const tasks$7 = { "title": "작업", "description": "작업을 체계적으로 정리하고 추적", "transformToPreset": "프리셋으로 변환", "noTasks": "작업 없음", "archiveEmpty": "보관함이 비어있습니다" };
const flows$7 = { "title": "플로우", "description": "나만의 창의적인 작업 공간", "newFlow": "새 플로우", "rename": "이름 변경", "leave": "나가기", "noFlows": "플로우 없음", "signInToViewFlows": "플로우를 보려면 로그인하세요", "pin": "고정", "unpin": "고정 해제" };
const bookmarks$7 = { "title": "북마크", "description": "즐겨찾는 웹페이지 모음", "bookmark": "북마크", "addNewCollection": "새 컬렉션 추가", "loadingBookmarks": "북마크 로딩 중...", "noMatchingBookmarks": "일치하는 북마크 없음", "noBookmarksYet": "아직 북마크가 없습니다", "importFromBrowsers": "브라우저에서 가져오기", "detectingBrowsers": "브라우저 감지 중...", "bookmarksCount": "개 북마크", "deleteCollection": "컬렉션 삭제", "deleteCollectionConfirm": "이 컬렉션을 삭제하시겠습니까?", "newCollection": "새 컬렉션", "enterCollectionName": "컬렉션 이름 입력", "create": "만들기", "collectionName": "컬렉션 이름", "saveEnter": "저장 (Enter)", "cancelEsc": "취소 (Esc)", "renameFolder": "폴더 이름 변경", "renameBookmark": "북마크 이름 변경", "deleteFolder": "폴더 삭제", "deleteBookmark": "북마크 삭제" };
const conversations$7 = { "title": "대화", "noConversations": "아직 대화가 없습니다" };
const intelligence$7 = { "title": "인텔리전스", "description": "더 똑똑한 AI 어시스턴트 만들기", "knowledgeBase": "지식 베이스", "memory": "메모리", "skill": "스킬", "createNewSkill": "새 스킬 만들기", "createNewMemory": "새 메모리 만들기", "loading": "로딩 중...", "noSkills": "스킬 없음", "noMemories": "메모리 없음", "readOnly": "읽기 전용", "readOnlyMessage": "이것은 에이전트의 성능을 향상시키는 내장 시스템 스킬입니다. 직접 편집할 수 없지만 복제하여 자신만의 사본을 수정할 수 있습니다. 열기 후의 편집은 저장되지 않습니다. 참고하세요.", "readOnlyToast": "이것은 에이전트의 성능을 향상시키는 내장 시스템 스킬입니다. 직접 편집할 수 없지만 복제하여 자신만의 사본을 수정할 수 있습니다.", "open": "열기", "kbComingSoon": "Flowith 지식 베이스 지원이 곧 제공됩니다.", "system": "시스템", "learnFromUser": "사용자", "systemPresetReadOnly": "시스템 프리셋 (읽기 전용)", "actions": "작업", "rename": "이름 변경", "duplicate": "복제…", "info": "정보", "saving": "저장 중...", "fileInfo": "파일 정보", "fileName": "이름", "fileSize": "크기", "fileCreated": "생성일", "fileModified": "수정일", "fileType": "유형", "fileLocation": "위치", "copyPath": "경로 복사", "empowerOS": "학습 모드", "teachMakesBetter": "학습으로 더 나은 OS 만들기", "teachMode": "학습 모드", "teachModeDescription": "학습 모드에서는 웹 워크플로와 단계를 기록할 수 있습니다. OS Agent는 조용히 관찰하고 학습하며, 이를 재사용 가능한 스킬과 노하우로 정제합니다.", "teachModeGoalLabel": "작업 목표(선택)", "teachModeGoalPlaceholder": "OS가 학습할 수 있도록 더 많은 문맥을 제공하세요 — 구체적인 작업 목표 또는 관련 정보여도 좋습니다.", "teachModeTaskDisabled": "학습 모드 실행 중에는 새 작업을 만들 수 없습니다.", "empowering": "가르치는 중", "empoweringDescription": "시연하는 동안 OS Agent가 관찰하고 학습합니다", "yourGoal": "작업 목표", "preset": "프리셋", "generatedSkills": "생성된 스킬", "showLess": "숨기기", "showMore": "더 보기", "osHasLearned": "OS가 학습했습니다", "complete": "완료", "interactionsPlaceholder": "워크플로우를 시연하면 상호작용이 여기에 표시됩니다", "done": "완료", "generatingGuidance": "가이드 생성 중...", "summarizingInteraction": "각 상호작용을 요약하고 재사용 가능한 스킬을 준비하고 있습니다", "skillSaved": "스킬 저장됨", "goal": "목표", "steps": "단계", "events": "이벤트", "guidanceSavedSuccessfully": "가이드가 성공적으로 저장되었습니다", "openGuidanceInComposer": "Composer에서 가이드 열기", "recordAnotherWorkflow": "다른 워크플로우 기록", "dismissSummary": "요약 닫기", "saveAndTest": "저장 및 테스트", "learning": "학습 중...", "teachModeError": "티치 모드에서 문제가 발생했습니다", "errorDetails": "오류 세부정보", "checkNetworkConnection": "네트워크 연결을 확인하고 티치 모드를 다시 시작하세요", "tryAgain": "다시 시도", "resetState": "상태 초기화", "completeConfirmTitle": "OS 강화 완료", "completeConfirmMessage": "아래 체크리스트에서 원하는 결과를 선택할 수 있습니다.", "capturedEvents": "캡처된 이벤트", "confirmAndGenerate": "생성", "generating": "생성 중", "promptSummary": "프롬프트 요약", "saveToPreset": "프리셋으로 저장", "skillHostname": "스킬: {{hostname}}", "saveToSkill": "스킬로 저장", "selectAll": "모두 선택", "discard": "삭제", "confirmDiscard": "네, 삭제", "tutorial": { "title": "티치 모드에 오신 것을 환영합니다", "next": "다음", "gotIt": "확인", "guideLabel": "티치 모드 가이드", "page1": { "title": "스킬과 티치 모드란 무엇인가요?", "description": "스킬은 모든 에이전트가 적용할 수 있는 재사용 가능한 노하우를 OS가 저장하는 곳입니다. 각 스킬은 웹 애플리케이션, 워크플로 또는 상호 작용 패턴에 대한 프롬프트 기반 가이드(코드 스니펫 포함 가능)입니다. 특정 웹사이트나 작업에서 OS의 성능을 향상시키는 데 도움이 됩니다.\n\n티치 모드는 OS가 일상적인 루틴을 복사하거나 특정 웹사이트에서 작업하는 방법을 학습하도록 훈련시키는 방법입니다. 이는 향후 재사용을 위해 <strong>스킬과 프리셋</strong>으로 저장됩니다." }, "page2": { "title": "티치 모드를 시작하는 방법은?", "description": "먼저 왼쪽의 '<strong>인텔리전스 패널</strong>'에서 '<strong>티치 모드</strong>' 버튼을 클릭하세요. 시작하기 전에 OS에 초기 지침을 제공하고 명확한 작업을 제공하는 <strong>교육 목표</strong>를 설정하세요." }, "page3": { "title": "OS는 어떻게 당신의 동작을 학습하나요?", "description": "가르치는 동안 OS는 실시간으로 작업을 관찰하고 커서를 추적합니다. 왼쪽 패널에 기록된 모든 단계를 볼 수 있습니다 — 언제든지 일시 중지할 수 있으며 완료되면 빨간색 '<strong>중지</strong>' 아이콘을 클릭하세요." }, "page4": { "title": "OS 학습 결과는 무엇인가요?", "description": "교육을 마친 후 생성하려는 결과 유형을 선택하세요. 일반적으로 일상적인 작업에 대한 프리셋과 관련 스킬이 생성됩니다. 생성 후 <strong>Composer</strong>에서 검토 및 편집하거나 '<strong>인텔리전스</strong>' 패널의 '<strong>사용자로부터 학습</strong>' 폴더에서 언제든지 액세스할 수 있습니다." } }, "skillTooltip": "아래에서 스킬을 수정하거나 편집할 수 있습니다", "skillSectionTooltip": "각 스킬은 학습 세션 중 사용된 웹사이트 도메인 이름을 따라 명명됩니다. 새로 학습한 스킬은 해당 마크다운 파일의 새 섹션으로 표시됩니다." };
const sidebar$7 = { "goBack": "뒤로", "goForward": "앞으로", "lockSidebar": "사이드바 잠금", "unlockSidebar": "사이드바 잠금 해제", "searchOrEnterAddress": "검색하거나 주소 입력", "reload": "새로고침" };
const tabs$7 = { "newTab": "새 탭", "terminal": "터미널", "pauseAgent": "에이전트 일시정지", "resumeAgent": "에이전트 재개" };
const userMenu$7 = { "upgrade": "업그레이드", "creditsLeft": "남음", "clickToManageSubscription": "클릭하여 구독 관리", "theme": "테마", "lightMode": "라이트 모드", "darkMode": "다크 모드", "systemMode": "시스템 모드", "language": "언어", "settings": "설정", "invitationCode": "초대 코드", "checkUpdates": "업데이트 확인", "contactUs": "문의하기", "signOut": "로그아웃", "openUserMenu": "사용자 메뉴 열기", "signIn": "로그인" };
const settings$7 = { "title": "설정", "history": "기록", "downloads": "다운로드", "adblock": "광고 차단", "language": "언어", "languageDescription": "인터페이스의 선호 언어를 선택하세요. 변경 사항은 즉시 적용됩니다.", "softwareUpdate": "소프트웨어 업데이트" };
const updateSettings$7 = { "description": "Flowith OS는 안전하고 신뢰할 수 있는 업데이트로 최신 상태를 유지합니다. 채널을 선택하세요: 안정성을 위한 Stable, 초기 기능을 위한 Beta, 또는 최첨단 빌드를 위한 Alpha. 계정이 액세스할 수 있는 채널로만 전환할 수 있습니다.", "currentVersion": "현재 버전: {{version}}", "loadError": "로드 실패", "warning": "경고: Beta/Alpha 빌드는 불안정할 수 있으며 작업에 영향을 줄 수 있습니다. 프로덕션에는 Stable을 사용하세요.", "channel": { "label": "업데이트 채널", "hint": "액세스 권한이 있는 채널만 선택할 수 있습니다.", "disabledHint": "업데이트 진행 중에는 채널을 전환할 수 없습니다", "options": { "stable": "Stable", "beta": "Beta", "alpha": "Alpha" } }, "actions": { "title": "수동 확인", "hint": "지금 사용 가능한 업데이트를 확인합니다.", "check": "업데이트 확인" }, "status": { "noUpdate": "최신 상태입니다.", "hasUpdate": "새 버전을 사용할 수 있습니다.", "error": "업데이트 확인에 실패했습니다." }, "tips": { "title": "팁", "default": "기본적으로 안정적인 업데이트에 대한 알림을 받습니다. Early Access에서는 사전 릴리스 빌드가 프로덕션 작업에 불안정할 수 있습니다.", "warningTitle": "경고: Nightly 업데이트가 자동으로 적용됩니다", "warningBody": "Nightly 빌드는 Cursor가 닫힐 때 프롬프트 없이 자동으로 업데이트를 다운로드하고 설치합니다." } };
const adblock$7 = { "title": "광고 차단", "description": "침입적인 광고와 트래커를 차단하고 페이지 노이즈를 필터링하여 Neo OS Agent가 정보를 더 정확하게 이해하고 추출할 수 있도록 하며 개인정보를 보호합니다.", "enable": "광고 차단 활성화", "enableDescription": "모든 웹사이트에서 광고 자동 차단", "statusActive": "활성화됨 - 광고가 차단되고 있습니다", "statusInactive": "비활성화됨 - 광고가 차단되지 않습니다", "adsBlocked": "개 광고 차단됨", "networkBlocked": "네트워크 요청", "cosmeticBlocked": "요소 숨김", "filterRules": "필터 규칙", "activeRules": "활성 규칙" };
const blank$7 = { "openNewPage": "새 빈 페이지 열기", "selectBackground": "배경 선택", "isAwake": "깨어남", "osIsAwake": "OS가 깨어났습니다", "osGuideline": "OS 가이드라인", "osGuidelineDescription": "OS Agent 빠른 시작 - 아키텍처, 모드 및 모든 기능.", "intelligence": "학습 모드", "intelligenceDescription": "OS Agent에게 작업 수행을 가르치고 나중에 재사용하세요", "inviteAndEarn": "초대 혜택", "tagline": "능동적인 기억으로, 모든 행동과 함께 진화하며 당신을 진정으로 이해합니다.", "taskPreset": "작업 프리셋", "credits": "+{{amount}} 크레딧", "addPreset": "새 프리셋 추가", "editPreset": "프리셋 편집", "deletePreset": "프리셋 삭제", "removeFromHistory": "기록에서 제거", "previousPreset": "이전 프리셋", "nextPreset": "다음 프리셋", "previousPresets": "이전 프리셋", "nextPresets": "다음 프리셋", "createPreset": "프리셋 만들기", "presetName": "프리셋 이름", "instruction": "지시사항", "presetNamePlaceholderCreate": "예: 주간 보고서, 코드 리뷰, 데이터 분석...", "presetNamePlaceholderEdit": "프리셋 이름 입력...", "instructionPlaceholderCreate": 'OS가 수행할 작업을 설명하세요...\n예: "이번 주 판매 데이터를 분석하고 요약 보고서 작성"', "instructionPlaceholderEdit": "작업 지시사항 업데이트...", "colorBlue": "파란색", "colorGreen": "초록색", "colorYellow": "노란색", "colorRed": "빨간색", "selectColor": "{{color}} 선택", "creating": "만드는 중...", "updating": "업데이트 중...", "create": "만들기", "update": "업데이트", "smartInputPlaceholder": "탐색, 검색 또는 Neo에게 맡기세요...", "processing": "처리 중…", "navigate": "탐색", "navigateDescription": "현재 탭에서 이 주소 열기", "searchGoogle": "Google 검색", "searchGoogleDescription": "Google로 검색", "runTask": "작업 실행", "runTaskDescription": "Neo 에이전트로 실행", "createCanvas": "캔버스에서 질문", "createCanvasDescription": "이 프롬프트로 Flo 캔버스를 열기" };
const agentGuide$7 = { "title": "에이전트 가이드", "subtitle": "OS 에이전트에 대한 시각적 빠른 시작: 아키텍처, 모드 및 모든 기능.", "capabilities": { "heading": "기능", "navigate": { "title": "탐색", "desc": "페이지 열기, 앞뒤로 이동" }, "click": { "title": "클릭", "desc": "버튼 및 링크와 상호작용" }, "type": { "title": "입력", "desc": "입력 필드와 양식 채우기" }, "keys": { "title": "키", "desc": "Enter, Escape, 단축키" }, "scroll": { "title": "스크롤", "desc": "긴 페이지 이동" }, "tabs": { "title": "탭", "desc": "표시, 전환, 닫기" }, "files": { "title": "파일", "desc": "쓰기, 읽기, 다운로드" }, "skills": { "title": "스킬", "desc": "공유 지식" }, "memories": { "title": "메모리", "desc": "장기 선호도" }, "upload": { "title": "업로드", "desc": "페이지에 파일 전송" }, "ask": { "title": "질문", "desc": "빠른 사용자 확인" }, "onlineSearch": { "title": "온라인 검색", "desc": "빠른 웹 조회" }, "extract": { "title": "추출", "desc": "구조화된 정보 가져오기" }, "deepThink": { "title": "심층 분석", "desc": "구조화된 분석" }, "vision": { "title": "비전", "desc": "비 DOM 정밀 작업" }, "shell": { "title": "셸", "desc": "명령 실행 (사용 가능 시)" }, "report": { "title": "보고", "desc": "완료 및 요약" } }, "benchmark": { "title": "Online‑Mind2Web 벤치마크", "subtitle": "Flowith Neo AgentOS가 압도적인 우위를 점하다: ", "subtitleHighlight": "거의 완벽한", "subtitleEnd": " 성능으로 주도.", "openai": "OpenAI Operator", "gemini": "Gemini 2.5 Computer Use", "flowith": "Flowith Neo OS", "average": "평균", "easy": "쉬움", "medium": "중간", "hard": "어려움" }, "skillsMemories": { "heading": "스킬 & 메모리", "description": "Neo가 프로 모드에서 자동으로 참조하는 재사용 가능한 플레이북과 장기 컨텍스트.", "markdownTag": "Markdown .md", "autoIndexedTag": "자동 색인", "citationsTag": "로그 인용", "howNeoUses": "Neo의 사용 방법: 프로 모드의 각 단계 전에 Neo는 관련 스킬과 메모리를 확인하고 추론 컨텍스트에 병합하며 지침이나 선호도를 자동으로 적용합니다.", "skillsTitle": "스킬", "skillsTag": "공유됨", "skillsDesc": "모든 에이전트가 적용할 수 있는 재사용 가능한 노하우를 저장합니다. 각 스킬은 도구, 워크플로 또는 패턴에 대한 짧은 가이드입니다.", "skillsProcedures": "최적: 절차", "skillsFormat": "형식: Markdown", "skillsScenario": "일상 시나리오", "skillsScenarioTitle": "미디어 변환 및 공유", "skillsStep1": '당신이 말합니다: "이 20개 이미지를 컴팩트한 PDF로 변환해."', "skillsStep2": "Neo는 스킬에 따라 업로드, 변환, 완료 대기 및 파일 저장을 수행합니다.", "skillsOutcome": "결과: 로그에 다운로드 링크가 있는 공유 가능한 PDF.", "memoriesTitle": "메모리", "memoriesTag": "개인", "memoriesDesc": "선호도, 프로필 및 도메인 사실을 캡처합니다. Neo는 결정을 내릴 때 관련 항목을 참조하고 로그에 인용합니다.", "memoriesStyle": "최적: 스타일, 규칙", "memoriesPrivate": "기본적으로 비공개", "memoriesScenario": "일상 시나리오", "memoriesScenarioTitle": "작성 톤 & 스타일", "memoriesStep1": "당신은 간결하고 친근하며 낙관적인 문구를 좋아합니다.", "memoriesStep2": "Neo는 이메일, 보고서 및 소셜 게시물에 자동으로 적용합니다.", "memoriesOutcome": "결과: 지침 반복 없이 일관된 브랜드 음성.", "taskFilesTitle": "작업 파일", "taskFilesTag": "작업당", "taskFilesDesc": "현재 작업 중 생성된 임시 파일. 도구 I/O 및 중간 결과를 용이하게 하며 다른 작업과 자동으로 공유되지 않습니다.", "taskFilesEphemeral": "임시", "taskFilesReadable": "도구가 읽을 수 있음", "taskFilesScenario": "일상 시나리오", "taskFilesScenarioTitle": "여행 가격 추적기", "taskFilesStep1": "Neo가 항공편 표를 스크랩하고 이 작업의 CSV로 저장합니다.", "taskFilesStep2": "오늘과 어제의 요금을 비교하고 변경 사항을 강조 표시합니다.", "taskFilesOutcome": "결과: 깔끔한 요약과 다운로드 가능한 CSV." }, "system": { "title": "Neo OS - 당신을 위한 가장 스마트한 브라우저 에이전트", "tagline": "자체 진화 × 메모리 & 스킬 × 속도 & 지능", "selfEvolving": "자체 진화", "intelligence": "지능", "contextImprovement": "컨텍스트 개선", "contextDesc": "반성적 에이전트가 스킬 시스템을 통해 실시간으로 컨텍스트를 개선", "onlineRL": "온라인 RL", "onlineRLDesc": "에이전트 동작과 정기적으로 정렬되는 업데이트", "intelligentMemory": "지능형 메모리", "architecture": "아키텍처", "dualLayer": "이중 계층 시스템", "dualLayerDesc": "단기 버퍼 + 장기 일화 메모리", "knowledgeTransfer": "지식 전달", "knowledgeTransferDesc": "작업 간 학습 유지, 재사용 및 전송", "highPerformance": "고성능", "infrastructure": "인프라", "executionKernel": "실행 커널", "executionKernelDesc": "병렬 오케스트레이션 및 동적 스케줄링", "speedCaching": "속도 캐싱", "speedCachingDesc": "밀리초 응답 및 실시간 실행", "speedIndicator": "~1ms", "summary": "진화 · 지속 · 빠름" }, "arch": { "heading": "아키텍처", "osShell": "OS Shell", "agentCore": "에이전트 코어", "plannerExecutor": "플래너 · 실행기", "browserTabs": "브라우저 탭", "domCanvas": "DOM · Canvas", "filesMemoriesSkills": "파일 · 메모리 · 스킬", "domPageTabs": "DOM · 페이지 · 탭", "clickTypeScroll": "클릭 · 입력 · 스크롤", "visionNonDOM": "비전 · 비 DOM 작업", "captchaDrag": "CAPTCHA · 드래그", "onlineSearchThinking": "온라인 검색 · 심층 분석", "googleAnalysis": "google · 분석", "askUserReport": "사용자에게 묻기 · 보고", "choicesDoneReport": "choices · done_and_report" }, "tips": { "heading": "팁", "beta": "FlowithOS는 현재 베타 단계입니다. 제품과 Agent Neo 모두 지속적으로 업데이트되고 있습니다. 최신 업데이트를 확인하세요.", "improving": "Agent Neo OS의 능력은 날마다 향상되고 있으며, 새로운 능력을 사용하여 작업을 완료할 수 있습니다." } };
const reward$7 = { "helloWorld": "Hello World", "helloWorldDesc": "이것은 에이전트 시대의 'Hello World' 순간입니다<br />차세대 에이전트 인터넷에 흔적을 남기는 최초의 사람이 되세요", "get2000Credits": "2000 크레딧 받기", "equivalent7Days": "7일 연속 소셜 미디어 자동 운영과 동일", "shareInstructions": "각성 후, FlowithOS를 세상에 소개하세요<br />선택한 플랫폼에서 자동으로 'Hello World' 메시지를 작성하고 게시합니다.<br />이것은 앞으로 할 수 있는 모든 것의 시작입니다.<br /><span style='display: block; height: 8px;'></span>편안히 앉아 지켜보세요.", "osComing": "OS 온다", "awakeOS": "Awake OS", "page2Title": "친구 초대하고 크레딧 받기", "page2Description1": "좋은 여정에는 좋은 동료가 필요합니다.", "page2Description2": "친구가 가입할 때마다", "page2Description3": "크레딧을 받습니다.", "retry": "다시 시도", "noCodesYet": "아직 초대 코드가 없습니다", "activated": "활성화됨", "neoStarting": "Neo가 자동 공유 작업을 시작하고 있습니다...", "failed": "실패", "unknownError": "알 수 없는 오류", "errorRetry": "오류가 발생했습니다. 다시 시도해주세요", "unexpectedResponse": "서버 응답 오류", "failedToLoadCodes": "초대 코드를 불러올 수 없습니다", "congratsCredits": "축하합니다! +{{amount}} 크레딧", "rewardUnlocked": "공유 보상 획득" };
const agentWidget$7 = { "modes": { "fast": { "label": "빠른 모드", "description": "최대한 빠르게 작업을 완료하며, 스킬과 메모리를 사용하지 않습니다.", "short": "빠른", "modeDescription": "빠르게 행동, 간략하게" }, "pro": { "label": "프로 모드", "description": "최고 품질: 단계별 시각적 분석과 심층 추론. 필요에 따라 스킬과 메모리를 참조합니다.", "short": "프로", "modeDescription": "균형 잡힌 모드, Neo에게 맡기기" } }, "minimize": "최소화", "placeholder": "Neo OS Agent에게 작업을 요청하세요...", "changeModeTooltip": "에이전트의 동작을 조정하려면 모드를 변경하세요", "preset": "프리셋", "selectPresetTooltip": "사용할 프리셋을 선택하세요", "addNewPreset": "새 프리셋 추가", "agentHistoryTooltip": "에이전트의 작업 기록", "createPreset": "프리셋 만들기", "presetName": "프리셋 이름", "instruction": "지시", "upload": "업로드", "newTask": "새 작업", "draft": "임시저장", "copyPrompt": "프롬프트 복사", "showMore": "더 보기", "showLess": "접기", "agentIsWorking": "에이전트 작업 중", "agentIsWrappingUp": "에이전트 마무리 중", "completed": "완료됨", "paused": "일시정지됨", "created": "생성됨", "selectTask": "작업 선택", "unpin": "고정 해제", "pinToRight": "오른쪽에 고정", "stepsCount": "단계 ({{count}})", "files": "파일", "filesCount": "파일 ({{count}})", "noFilesYet": "아직 생성된 파일이 없습니다", "status": { "wrappingUp": "에이전트가 마무리 중...", "thinking": "에이전트가 생각 중...", "wrappingUpAction": "현재 작업을 완료하는 중..." }, "actions": { "markedTab": "표시된 탭", "openRelatedTab": "관련 탭 열기 (개발 중)", "open": "열기", "openTab": "탭 열기", "showInFolder": "폴더에서 보기", "preview": "미리보기", "followUpPrefix": "당신", "actionsHeader": "작업" }, "controls": { "rerun": "다시 실행 (개발 중)", "pause": "일시정지", "pauseAndArchive": "일시 중지하고 보관", "resume": "재개", "wrappingUpDisabled": "마무리 중..." }, "input": { "sending": "전송 중...", "adjustTaskPlaceholder": "Agent Neo의 작업을 조정하기 위한 새 메시지 전송..." }, "legacy": { "readOnlyNotice": "레거시 작업, 보기 전용" }, "refunded": { "noFollowUp": "이 작업은 환불되었습니다. 후속 메시지를 사용할 수 없습니다." }, "skills": { "matchingSkills": "관련 스킬을 찾는 중…", "scanningSkills": "사용 가능한 스킬 스캔 중…", "scanningMap": "스킬 맵을 검색하는 중…" }, "billing": { "creditsDepletedTitle": "크레딧을 추가하여 계속하기", "creditsDepletedMessage": "크레딧이 부족하여 에이전트가 일시정지되었습니다. 크레딧을 추가하거나 결제 정보를 업데이트한 후, 준비가 되면 작업을 다시 실행하세요." }, "presetActions": { "editPreset": "프리셋 편집", "deletePreset": "프리셋 삭제" }, "feedback": { "success": { "short": "잘했어요!", "long": "지금까지 아주 좋아요, 잘했어요!" }, "refund": { "short": "이런, 환불!", "long": "이런, 크레딧을 돌려받고 싶어요!" }, "refundSuccess": { "long": "좋아요! 크레딧이 환불되었습니다!" }, "modal": { "title": "크레딧 환불 요청", "credits": "{{count}} 크레딧", "description": "이 작업에 만족하지 못하신 경우, 환불을 요청하시면 이 작업에서 사용된 모든 크레딧을 즉시 환불해 드립니다.", "whatGoesWrong": "무엇이 잘못되었나요", "errorMessage": "죄송합니다. 더 자세한 내용을 입력해주세요", "placeholder": "무엇이 잘못되었는지 설명해주세요...", "shareTask": "이 작업을 공유하기", "shareDescription": "작업에서 모든 개인 정보를 제거하겠습니다. 작업을 공유해주시면 향후 유사한 작업에서 에이전트 성능을 개선할 수 있습니다.", "upload": "업로드", "attachFile": "파일 첨부", "submit": "제출", "submitting": "제출 중...", "alreadyRefunded": { "title": "이미 환불됨", "message": "이 작업은 이미 환불되었습니다. 다시 환불을 요청할 수 없습니다." } }, "errors": { "systemError": "시스템 오류. 지원팀에 문의하세요.", "networkError": "네트워크 오류입니다. 연결을 확인하고 다시 시도해주세요.", "noUsageData": "사용 데이터를 찾을 수 없습니다. 환불할 수 없습니다.", "alreadyRefunded": "이 작업은 이미 환불되었습니다.", "notAuthenticated": "환불을 요청하려면 로그인하세요.", "unknownError": "예기치 않은 오류가 발생했습니다. 나중에 다시 시도해주세요.", "validationFailed": "현재 사유를 검증할 수 없습니다. 나중에 다시 시도해주세요.", "invalidReason": "사유가 거부되었습니다. 실제로 무엇이 잘못되었는지 설명해주세요." }, "confirmation": { "creditsRefunded": "{{count}} 크레딧이 환불되었습니다", "title": "성공", "message": "감사합니다! 팀이 작업을 진단하고 FlowithOS 경험을 개선하겠습니다.", "messageNoShare": "감사합니다! 팀은 계속해서 FlowithOS 경험 개선을 위해 노력하겠습니다." } } };
const gate$7 = { "welcome": { "title": "FlowithOS에 오신 것을 환영합니다", "subtitle": "웹에서 세상으로, FlowithOS는 브라우저를 실제 가치로 전환하는 가장 스마트한 AgenticOS입니다.", "features": { "execute": { "title": "모든 작업을 자동으로 실행", "description": "인간의 직관을 기계의 속도로 발휘하여, FlowithOS는 웹에서 여러 작업을 반복적으로 탐색하고 실행합니다." }, "transform": { "title": "아이디어를 영향력으로 지능적으로 전환", "description": "영감에서 가치 창출까지, FlowithOS는 위대한 아이디어를 행동으로 전환하여 실제 결과를 제공합니다." }, "organize": { "title": "자산을 체계적으로 정리", "description": "흩어진 북마크에서 구조화된 플레이북까지, FlowithOS는 디지털 자산을 관리, 선별 및 확장할 수 있는 강력한 시스템을 제공합니다." }, "evolve": { "title": "역동적으로 함께 진화", "description": "모든 상호작용에서 성장하는 메모리를 통해 FlowithOS는 복잡한 사이트 탐색부터 개인 스타일 이해까지 맞춤형 스킬을 개발합니다." } }, "letsGo": "시작하기!" }, "auth": { "createAccount": "계정 만들기", "signInToFlowith": "Flowith 계정으로 로그인", "oneAccount": "하나의 계정으로 모든 Flowith 제품 이용", "fromAnotherAccount": "소셜 계정으로 로그인", "useOwnEmail": "이메일로 로그인", "email": "이메일", "password": "비밀번호", "confirmPassword": "비밀번호 확인", "acceptTerms": "FlowithOS 이용약관 및 개인정보 처리방침에 동의합니다", "privacyNote": "모든 데이터는 기기에 100% 안전하게 저장됩니다", "alreadyHaveAccount": "이미 계정이 있으신가요?", "createNewAccount": "계정이 없으신가요?", "signUp": "가입하기", "signIn": "로그인", "processing": "처리 중...", "verifyEmail": "이메일 인증", "verificationCodeSent": "{{email}}로 6자리 인증번호를 전송했습니다", "enterVerificationCode": "인증번호 입력", "verificationCode": "인증번호", "enterSixDigitCode": "6자리 인증번호를 입력하세요", "backToSignUp": "가입하기로 돌아가기", "verifying": "인증 중...", "verifyCode": "확인", "errors": { "enterEmail": "이메일을 입력해주세요", "enterPassword": "비밀번호를 입력해주세요", "confirmPassword": "비밀번호를 한 번 더 입력해주세요", "passwordsDoNotMatch": "비밀번호가 일치하지 않습니다", "acceptTerms": "이용약관 및 개인정보 처리방침에 동의해주세요", "authFailed": "로그인에 실패했습니다. 다시 시도해주세요.", "invalidVerificationCode": "올바른 6자리 인증번호를 입력해주세요", "verificationFailed": "인증에 실패했습니다. 다시 시도해주세요.", "oauthFailed": "소셜 로그인에 실패했습니다. 다시 시도해주세요.", "userAlreadyExists": "이미 가입된 이메일입니다. " }, "goToLogin": "로그인하기", "signInPrompt": "로그인하기" }, "invitation": { "title": "깨어남에는 열쇠가 필요합니다", "subtitle": "FlowithOS 사용을 시작하려면 초대 코드를 입력하세요", "lookingForInvite": "초대 코드가 필요하신가요?", "followOnX": "X에서 @flowith를 팔로우하고", "toGetAccess": "초대 코드를 받으세요.", "placeholder": "초대 코드 입력", "invalidCode": "올바르지 않은 초대 코드입니다", "verificationFailed": "인증 실패 - 다시 시도해주세요", "accessGranted": "인증 완료", "initializing": "FlowithOS에 오신 것을 환영합니다. 초기화 중..." }, "browserImport": { "title": "이전 작업 이어하기", "subtitle": "기존 브라우저의 북마크와 세션을 간편하게 가져오세요.", "detecting": "브라우저 검색 중...", "noBrowsers": "사용 가능한 브라우저를 찾을 수 없습니다", "imported": "가져오기 완료", "importing": "가져오는 중...", "bookmarks": "개의 북마크", "importNote": "약 5초가 소요되며, 시스템 권한 확인 창이 나타날 수 있습니다.", "skipForNow": "건너뛰기", "nextStep": "다음" }, "settings": { "title": "준비되셨나요?", "subtitle": "몇 가지 설정만 하면 Flowith OS를 바로 사용하실 수 있습니다.", "defaultBrowser": { "title": "기본 브라우저로 설정", "description": "모든 링크가 FlowithOS에서 자동으로 열리며, 웹 콘텐츠가 작업 공간에 자연스럽게 통합됩니다." }, "addToDock": { "title": "Dock / 작업 표시줄에 추가", "description": "클릭 한 번으로 언제든지 접근할 수 있도록 설정하세요." }, "launchAtStartup": { "title": "시작 프로그램에 등록", "description": "컴퓨터를 켤 때마다 Flowith OS가 자동으로 실행됩니다." }, "helpImprove": { "title": "더 나은 서비스를 위해 도와주세요", "description": "익명 사용 데이터를 공유하여 모두를 위한 더 나은 제품을 만드는 데 참여해주세요.", "privacyNote": "개인정보는 철저히 보호됩니다." }, "canChangeSettingsLater": "이 설정은 언제든지 변경할 수 있습니다", "nextStep": "다음", "privacy": { "title": "100% 로컬 저장 및 프라이버시 보호", "description": "에이전트 실행 기록, 브라우징 기록, Memories와 Skills, 계정 및 비밀번호 정보 등 모든 개인 데이터는 100% 기기에만 저장되며, 클라우드로 동기화되지 않습니다. 안심하고 사용하세요." } }, "examples": { "title1": "OS가 깨어났습니다.", "title2": "직접 확인해보세요.", "subtitle": "예시를 통해 작동 방식을 확인하세요.", "enterFlowithOS": "FlowithOS 시작하기", "clickToReplay": "사례 보기", "videoNotSupported": "브라우저에서 동영상 재생을 지원하지 않습니다.", "cases": { "shopping": { "title": "명절 쇼핑 시간 10배 단축", "description": "완벽한 반려동물 선물 세트를 자동으로 장바구니에 담습니다. 2시간 이상 절약하세요." }, "contentEngine": { "title": "24시간 자동 X 콘텐츠 생성", "description": "Hacker News 인기 콘텐츠를 자동으로 발견하고, 당신만의 스타일로 작성하여 X에 게시합니다. 프로필 방문 3배 증가와 진정한 커뮤니티 성장을 경험하세요." }, "tiktok": { "title1": "TikTok 자동 성장: 500개 이상 반응,", "title2": "노력 제로", "description": "Flowith OS가 인기 라이브 방송에 센스 있는 댓글을 자동으로 남겨 실질적인 영향력 증대를 도와드립니다." }, "youtube": { "title": "95% 자동화 YouTube 채널 운영", "description": "Flowith OS로 얼굴 없이도 YouTube를 운영하세요. 콘텐츠 제작부터 커뮤니티 관리까지, 몇 주간의 작업을 1시간 안에 완료할 수 있습니다." } } }, "oauth": { "connecting": "{{provider}} 연결 중", "completeInBrowser": "새로 열린 브라우저 창에서 로그인을 완료해주세요.", "cancel": "취소" }, "terms": { "title": "이용약관 및 개인정보 보호정책", "subtitle": "아래 약관을 검토하세요.", "close": "닫기" }, "invitationCodes": { "title": "내 초대 코드", "availableToShare": "{{unused}}/{{total}} 공유 가능", "loading": "로딩 중...", "noCodesYet": "아직 초대 코드가 없습니다", "noCodesFound": "초대 코드를 찾을 수 없습니다", "failedToLoad": "초대 코드를 불러올 수 없습니다", "useCodeHint": "초대 코드를 사용하면 나만의 코드를 받을 수 있어요!", "shareHint": "친구들에게 코드를 공유하여 FlowithOS에 초대하세요", "used": "사용됨" }, "history": { "title": "방문 기록", "searchPlaceholder": "기록 검색...", "selectAll": "전체 선택", "deselectAll": "선택 해제", "deleteSelected": "선택 항목 삭제 ({{count}})", "clearAll": "전체 삭제", "loading": "로딩 중...", "noMatchingHistory": "일치하는 기록이 없습니다", "noHistoryYet": "아직 방문 기록이 없습니다", "confirmDelete": "삭제 확인", "deleteConfirmMessage": "선택한 방문 기록을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.", "cancel": "취소", "delete": "삭제", "today": "오늘", "yesterday": "어제", "earlier": "이전", "untitled": "제목 없음", "visitedTimes": "{{count}}번 방문함", "openInNewTab": "새 탭에서 열기", "timePeriod": "기간", "timeRangeAll": "전체", "timeRangeAllDesc": "전체 방문 기록", "timeRangeToday": "오늘", "timeRangeTodayDesc": "오늘의 모든 기록", "timeRangeYesterday": "어제", "timeRangeYesterdayDesc": "어제의 방문 기록", "timeRangeLast7Days": "최근 7일", "timeRangeLast7DaysDesc": "지난 주의 기록", "timeRangeThisMonth": "이번 달", "timeRangeThisMonthDesc": "이번 달의 방문 기록", "timeRangeLastMonth": "지난 달", "timeRangeLastMonthDesc": "지난 달의 방문 기록", "deleteTimeRange": "{{range}} 삭제" } };
const update$7 = { "checking": { "title": "업데이트 확인 중", "description": "업데이트 서버에 연결 중..." }, "noUpdate": { "title": "최신 버전입니다", "currentVersion": "현재 버전 v{{version}}", "description": "이미 최신 버전을 사용 중입니다", "close": "닫기" }, "available": { "title": "새 버전 발견", "version": "v{{version}} 사용 가능", "currentVersion": "(현재 버전: v{{current}})", "released": "출시일 {{time}}", "betaNote": "공개 베타 기간 중이며 매일 개선 사항을 배포하고 있습니다. 지금 업데이트하여 최신 기능을 경험하세요.", "defaultReleaseNotes": "이 베타 버전에는 성능 개선, 버그 수정 및 새로운 기능이 포함되어 있습니다. 매일 업데이트를 배포하고 있으니 지금 업데이트하여 최상의 경험을 누리세요.", "downloadNow": "지금 다운로드", "remindLater": "나중에 알림", "preparing": "준비 중..." }, "downloading": { "title": "업데이트 다운로드 중", "version": "v{{version}} 다운로드 중", "progress": "다운로드 진행률", "hint": "다운로드가 완료되면 설치 안내가 표시됩니다" }, "readyToInstall": { "title": "설치 준비 완료", "downloaded": "v{{version}} 다운로드 완료", "hint": "업데이트 설치를 완료하려면 재시작하세요", "restartNow": "지금 재시작", "restartLater": "나중에 재시작", "restarting": "재시작 중..." }, "error": { "title": "업데이트 확인 실패", "default": "업데이트에 실패했습니다. 나중에 다시 시도해주세요.", "downloadFailed": "다운로드에 실패했습니다. 나중에 다시 시도해주세요.", "installFailed": "설치에 실패했습니다. 나중에 다시 시도해주세요.", "close": "닫기" }, "time": { "justNow": "방금 전", "minutesAgo": "{{count}}분 전", "hoursAgo": "{{count}}시간 전" }, "notifications": { "newVersionAvailable": "새 버전 {{version}} 사용 가능", "downloadingInBackground": "백그라운드에서 다운로드 중", "updateDownloaded": "업데이트 다운로드 완료", "readyToInstall": "버전 {{version}} 설치 준비 완료" } };
const updateToast$7 = { "checking": "업데이트 확인 중...", "pleaseWait": "잠시만 기다려주세요", "preparingDownload": "다운로드 준비 중 {{version}}", "updateFound": "업데이트 {{version}} 발견", "downloading": "업데이트 {{version}} 다운로드 중", "updateCheckFailed": "업데이트 확인 실패", "unknownError": "알 수 없는 오류", "updatedTo": "v{{version}}로 업데이트됨", "newVersionReady": "새 버전 준비 완료", "version": "버전 {{version}}", "close": "닫기", "gotIt": "알겠습니다", "installNow": "지금 재시작", "restarting": "재시작 중…", "later": "나중에", "collapseUpdateContent": "업데이트 내용 접기", "viewUpdateContent": "업데이트 내용 보기", "collapseLog": "접기 ^", "viewLog": "로그 보기 >", "channelChangeFailed": "채널 전환 실패: {{error}}", "channelInfo": "Channel: {{channel}}, Manifest: {{manifest}}", "manualDownloadHint": "업데이트할 수 없나요? 수동 설치 시도 →", "channelDowngraded": { "title": "채널 전환됨", "message": "계정에 {{previousChannel}} 채널 액세스 권한이 없습니다. 자동으로 {{newChannel}}로 전환되었습니다." }, "continueInBackground": "다운로드는 백그라운드에서 계속됩니다", "time": { "justNow": "방금 전", "minutesAgo": "{{count}}분 전", "hoursAgo": "{{count}}시간 전", "daysAgo": "{{count}}일 전", "weeksAgo": "{{count}}주 전", "monthsAgo": "{{count}}개월 전", "yearsAgo": "{{count}}년 전" } };
const errors$7 = { "auth": { "notLoggedIn": "먼저 로그인해주세요", "loginRequired": "이 기능을 사용하기 전에 로그인해주세요", "shareRequiresLogin": "공유 기능을 사용하기 전에 로그인해주세요" }, "network": { "networkError": "네트워크 오류 - 연결을 확인하세요", "requestTimeout": "요청 시간 초과 - 다시 시도하세요", "failedToVerify": "인증 실패", "failedToFetch": "가져오기 실패" }, "invitation": { "invalidCode": "유효하지 않은 초대 코드", "verificationFailed": "인증 실패 - 다시 시도하세요", "failedToConsume": "초대 코드 사용 실패" }, "download": { "downloadFailed": "다운로드 실패", "downloadInterrupted": "다운로드가 중단됨" }, "security": { "secureConnection": "보안 연결", "notSecure": "안전하지 않음", "localFile": "로컬 파일", "unknownProtocol": "알 수 없는 프로토콜" } };
const menus$7 = { "application": { "about": "{{appName}} 정보", "checkForUpdates": "업데이트 확인...", "settings": "설정...", "services": "서비스", "hide": "{{appName}} 숨기기", "hideOthers": "다른 항목 숨기기", "showAll": "모두 표시", "quit": "종료", "updateChannel": "업데이트 채널" }, "edit": { "label": "편집", "undo": "실행 취소", "redo": "다시 실행", "cut": "잘라내기", "paste": "붙여넣기", "selectAll": "전체 선택" }, "view": { "label": "보기", "findInPage": "페이지 내 검색", "newTab": "새 탭", "reopenClosedTab": "닫은 탭 다시 열기", "newTerminalTab": "새 터미널 탭", "openLocalFile": "로컬 파일 열기...", "goBack": "뒤로", "goForward": "앞으로", "viewHistory": "방문 기록 보기", "viewDownloads": "다운로드 보기", "archive": "보관", "reload": "새로고침", "forceReload": "강제 새로고침", "actualSize": "실제 크기", "zoomIn": "확대", "zoomOut": "축소", "toggleFullScreen": "전체 화면 전환" }, "window": { "label": "창", "minimize": "최소화", "close": "닫기", "bringAllToFront": "모두 앞으로 가져오기" }, "help": { "label": "도움말", "about": "정보", "version": "버전", "aboutDescription1": "차세대 AI 에이전트 운영 체제", "aboutDescription2": "자기 개선, 메모리, 속도를 위해 구축되었습니다.", "copyright": "© 2025 Flowith, Inc. All rights reserved." }, "contextMenu": { "back": "뒤로", "forward": "앞으로", "reload": "새로고침", "hardReload": "강제 새로고침 (캐시 무시)", "openLinkInNewTab": "새 탭에서 링크 열기", "openLinkInExternal": "외부 브라우저에서 링크 열기", "copyLinkAddress": "링크 주소 복사", "downloadLink": "링크 다운로드", "openImageInNewTab": "새 탭에서 이미지 열기", "copyImageAddress": "이미지 주소 복사", "copyImage": "이미지 복사", "downloadImage": "이미지 다운로드", "downloadVideo": "동영상 다운로드", "downloadAudio": "오디오 다운로드", "openMediaInNewTab": "새 탭에서 미디어 열기", "copyMediaAddress": "미디어 주소 복사", "openFrameInNewTab": "새 탭에서 프레임 열기", "openInExternal": "외부 브라우저에서 열기", "copyPageURL": "페이지 URL 복사", "viewPageSource": "페이지 소스 보기 (새 탭)", "savePageAs": "페이지를 다른 이름으로 저장...", "print": "인쇄...", "cut": "잘라내기", "paste": "붙여넣기", "searchWebFor": '"{{text}}" 웹 검색', "selectAll": "전체 선택", "inspectElement": "요소 검사", "openDevTools": "개발자 도구 열기", "closeDevTools": "개발자 도구 닫기" }, "fileDialog": { "openLocalFile": "로컬 파일 열기", "unsupportedFileType": "지원하지 않는 파일 형식", "savePageAs": "페이지를 다른 이름으로 저장", "allSupportedFiles": "지원되는 모든 파일", "htmlFiles": "HTML 파일", "textFiles": "텍스트 파일", "images": "이미지", "videos": "동영상", "audio": "오디오", "pdf": "PDF", "webpageComplete": "웹페이지, 전체", "singleFile": "단일 파일 (MHTML)" } };
const dialogs$7 = { "crash": { "title": "애플리케이션 오류", "message": "예기치 않은 오류가 발생했습니다", "detail": "{{error}}\n\n오류가 디버깅 목적으로 기록되었습니다.", "restart": "재시작", "close": "닫기" }, "customBackground": { "title": "사용자 지정 배경", "subtitle": "나만의 스타일 만들기", "preview": "미리보기", "angle": "각도", "stops": "그라디언트", "selectImage": "이미지 선택", "uploading": "업로드 중...", "dropImageHere": "이미지를 여기에 드롭", "dragAndDrop": "드래그 앤 드롭 또는 클릭", "fileTypes": "PNG, JPG, JPEG, WEBP, SVG, GIF", "fit": "맞춤", "cover": "덮기", "contain": "포함", "fill": "채우기", "remove": "제거", "cancel": "취소", "apply": "적용", "gradient": "그라디언트", "solid": "단색", "image": "이미지", "dropImageError": "이미지 파일을 드롭하세요 (PNG, JPG, JPEG, WEBP, SVG, GIF)" } };
const humanInput$7 = { "declinedToAnswer": "사용자가 답변을 거부했습니다. 질문을 건너뜁니다", "needOneInput": "계속하려면 1개의 입력이 필요합니다", "needTwoInputs": "2가지에 대한 도움이 필요합니다", "needThreeInputs": "3개의 결정이 필요합니다", "waitingOnInputs": "{{count}}개의 입력을 기다리는 중입니다", "declineToAnswer": "답변 거부", "dropFilesHere": "여기에 파일 드롭", "typeYourAnswer": "답변을 입력하세요...", "orTypeCustom": "또는 직접 입력...", "uploadFiles": "파일 업로드", "previousQuestion": "이전 질문", "goToQuestion": "질문 {{number}}(으)로 이동", "nextQuestion": "다음 질문" };
const ko = {
  common: common$7,
  nav: nav$7,
  tray: tray$7,
  actions: actions$7,
  status: status$7,
  time: time$7,
  downloads: downloads$7,
  history: history$7,
  invitationCodes: invitationCodes$7,
  tasks: tasks$7,
  flows: flows$7,
  bookmarks: bookmarks$7,
  conversations: conversations$7,
  intelligence: intelligence$7,
  sidebar: sidebar$7,
  tabs: tabs$7,
  userMenu: userMenu$7,
  settings: settings$7,
  updateSettings: updateSettings$7,
  adblock: adblock$7,
  blank: blank$7,
  agentGuide: agentGuide$7,
  reward: reward$7,
  agentWidget: agentWidget$7,
  gate: gate$7,
  update: update$7,
  updateToast: updateToast$7,
  errors: errors$7,
  menus: menus$7,
  dialogs: dialogs$7,
  humanInput: humanInput$7
};
const common$6 = { "ok": "OK", "cancel": "Cancelar", "start": "Iniciar", "delete": "Excluir", "close": "Fechar", "save": "Salvar", "search": "Pesquisar", "loading": "Carregando", "pressEscToClose": "Pressione ESC para fechar", "copyUrl": "Copiar URL", "copied": "Copiado", "copy": "Copiar", "expand": "Expandir", "collapse": "Recolher", "openFlowithWebsite": "Abrir site da Flowith", "openAgentGuide": "Abrir Guia do Agente", "reward": "Recompensa", "closeWindow": "Fechar janela", "minimizeWindow": "Minimizar janela", "toggleFullscreen": "Alternar tela cheia", "saveEnter": "Salvar (Enter)", "cancelEsc": "Cancelar (Esc)", "time": { "justNow": "agora mesmo", "minutesAgo": "há {{count}} minuto", "minutesAgo_other": "há {{count}} minutos", "hoursAgo": "há {{count}} hora", "hoursAgo_other": "há {{count}} horas", "daysAgo": "há {{count}} dia", "daysAgo_other": "há {{count}} dias" } };
const nav$6 = { "tasks": "Tarefas", "flows": "Fluxos", "bookmarks": "Favoritos", "intelligence": "Inteligência", "guide": "Guia" };
const tray$6 = { "newTask": "Nova Tarefa", "recentTasks": "Tarefas Recentes", "viewMore": "Ver Mais", "showMainWindow": "Mostrar Janela Principal", "hideMainWindow": "Ocultar Janela Principal", "quit": "Sair" };
const actions$6 = { "resume": "Retomar", "pause": "Pausar", "cancel": "Cancelar", "delete": "Excluir", "archive": "Arquivar", "showInFolder": "Mostrar na Pasta", "viewDetails": "Ver Detalhes", "openFile": "Abrir Arquivo" };
const status$6 = { "inProgress": "Em andamento", "completed": "Concluído", "archive": "Arquivo", "paused": "Pausado", "failed": "Falhou", "cancelled": "Cancelado", "running": "Em execução", "wrappingUp": "Finalizando..." };
const time$6 = { "today": "Hoje", "yesterday": "Ontem", "earlier": "Anterior" };
const downloads$6 = { "title": "Downloads", "all": "Todos", "inProgress": "Em andamento", "completed": "Concluído", "noDownloads": "Sem downloads", "failedToLoad": "Falha ao carregar downloads", "deleteConfirmMessage": "Tem certeza de que deseja excluir os downloads selecionados? Esta ação não pode ser desfeita.", "loadingDownloads": "Carregando downloads...", "searchPlaceholder": "Pesquisar downloads...", "selectAll": "Selecionar Tudo", "deselectAll": "Desmarcar Tudo", "deleteSelected": "Excluir Selecionados ({{count}})", "clearAll": "Limpar Tudo", "noMatchingDownloads": "Nenhum download encontrado", "noDownloadsYet": "Sem downloads ainda", "confirmDelete": "Confirmar Exclusão", "cancel": "Cancelar", "delete": "Excluir" };
const history$6 = { "title": "Histórico", "allTime": "Todo o Período", "clearHistory": "Limpar Histórico", "removeItem": "Remover Item", "failedToLoad": "Falha ao carregar histórico", "failedToClear": "Falha ao limpar histórico", "searchPlaceholder": "Pesquisar no histórico...", "selectAll": "Selecionar tudo", "deselectAll": "Desmarcar tudo", "deleteSelected": "Excluir selecionados ({{count}})", "clearAll": "Limpar tudo", "noMatchingHistory": "Nenhum histórico correspondente encontrado", "noHistoryYet": "Ainda sem histórico", "confirmDelete": "Confirmar exclusão", "deleteConfirmMessage": "Tem certeza de que deseja excluir o histórico selecionado? Esta ação não pode ser desfeita.", "cancel": "Cancelar", "delete": "Excluir", "today": "Hoje", "yesterday": "Ontem", "earlier": "Anterior", "untitled": "Sem título", "visitedTimes": "Visitado {{count}} vezes", "openInNewTab": "Abrir em nova aba", "loading": "Carregando histórico...", "timePeriod": "Período", "timeRangeAll": "Tudo", "timeRangeAllDesc": "Todo o histórico de navegação", "timeRangeToday": "Hoje", "timeRangeTodayDesc": "Todo o histórico de hoje", "timeRangeYesterday": "Ontem", "timeRangeYesterdayDesc": "Histórico de ontem", "timeRangeLast7Days": "Últimos 7 dias", "timeRangeLast7DaysDesc": "Histórico da semana passada", "timeRangeThisMonth": "Este mês", "timeRangeThisMonthDesc": "Histórico deste mês", "timeRangeLastMonth": "Mês passado", "timeRangeLastMonthDesc": "Histórico do mês passado", "deleteTimeRange": "Excluir {{range}}", "last7days": "Últimos 7 Dias", "thisMonth": "Este Mês", "lastMonth": "Mês Passado" };
const invitationCodes$6 = { "title": "Meus Códigos de Convite", "availableToShare": "{{unused}} de {{total}} disponíveis para compartilhar", "loading": "Carregando seus códigos...", "noCodesYet": "Ainda sem códigos de convite.", "noCodesFound": "Nenhum código de convite encontrado", "failedToLoad": "Não foi possível carregar os códigos", "useCodeHint": "Use um código de convite para obter seus próprios códigos!", "shareHint": "Compartilhe esses códigos com amigos para convidá-los ao FlowithOS", "used": "Usado" };
const tasks$6 = { "title": "Tarefa", "description": "Organize e acompanhe suas tarefas", "transformToPreset": "Transformar em Predefinição", "noTasks": "Sem tarefas", "archiveEmpty": "Arquivo vazio" };
const flows$6 = { "title": "Fluxo", "description": "Seus canvas de trabalho criativo", "newFlow": "Novo Fluxo", "rename": "Renomear", "leave": "Sair", "noFlows": "Sem fluxos", "signInToViewFlows": "Faça login para ver seus fluxos", "pin": "Fixar", "unpin": "Desafixar" };
const bookmarks$6 = { "title": "Favoritos", "description": "Acesso rápido às suas páginas preferidas", "bookmark": "Favorito", "addNewCollection": "Adicionar nova coleção", "loadingBookmarks": "Carregando favoritos...", "noMatchingBookmarks": "Nenhum favorito correspondente", "noBookmarksYet": "Ainda sem favoritos", "importFromBrowsers": "Importar dos navegadores", "detectingBrowsers": "Detectando navegadores...", "bookmarksCount": "favoritos", "deleteCollection": "Excluir Coleção", "deleteCollectionConfirm": "Tem certeza de que deseja excluir esta coleção?", "newCollection": "Nova Coleção", "enterCollectionName": "Digite um nome para a nova coleção", "create": "Criar", "collectionName": "Nome da coleção", "saveEnter": "Salvar (Enter)", "cancelEsc": "Cancelar (Esc)", "renameFolder": "Renomear pasta", "renameBookmark": "Renomear favorito", "deleteFolder": "Excluir pasta", "deleteBookmark": "Excluir favorito" };
const conversations$6 = { "title": "Conversas", "noConversations": "Ainda sem conversas" };
const intelligence$6 = { "title": "Inteligência", "description": "Torne seu agente mais inteligente", "knowledgeBase": "Base de Conhecimento", "memory": "Memória", "skill": "Habilidade", "createNewSkill": "Criar nova habilidade", "createNewMemory": "Criar nova memória", "loading": "Carregando...", "noSkills": "Sem habilidades", "noMemories": "Sem memórias", "readOnly": "Somente leitura", "readOnlyMessage": "Esta é uma Habilidade de sistema integrada para ajudar seu agente a ter um desempenho melhor. Ela não pode ser editada diretamente, mas você pode duplicá-la e modificar sua própria cópia. As edições após abrir não serão salvas. Por favor, observe.", "readOnlyToast": "Esta é uma Habilidade de sistema integrada para ajudar seu agente a ter um desempenho melhor. Ela não pode ser editada diretamente, mas você pode duplicá-la e modificar sua própria cópia.", "open": "Abrir", "kbComingSoon": "O suporte à Base de Conhecimento Flowith está chegando em breve.", "system": "Sistema", "learnFromUser": "Usuário", "systemPresetReadOnly": "Predefinição do sistema (somente leitura)", "actions": "Ações", "rename": "Renomear", "duplicate": "Duplicar…", "info": "Info", "saving": "Salvando...", "fileInfo": "Informações do arquivo", "fileName": "Nome", "fileSize": "Tamanho", "fileCreated": "Criado", "fileModified": "Modificado", "fileType": "Tipo", "fileLocation": "Localização", "copyPath": "Copiar caminho", "empowerOS": "Modo de Ensino", "teachMakesBetter": "Ensinar torna o OS melhor", "teachMode": "Modo de Ensino", "teachModeDescription": "No Modo de Ensino, você pode gravar seus fluxos e etapas na web enquanto o OS Agent observa e aprende discretamente, destilando tudo em habilidades e know-how reutilizáveis.", "teachModeGoalLabel": "Objetivo da tarefa (opcional)", "teachModeGoalPlaceholder": "Forneça mais contexto para o OS aprender — pode ser um objetivo específico da tarefa ou qualquer informação relacionada.", "teachModeTaskDisabled": "A criação de novas tarefas fica desativada enquanto o Modo de Ensino está em execução.", "empowering": "Ensinando", "empoweringDescription": "O OS Agent observará e aprenderá enquanto você demonstra", "yourGoal": "Objetivo da tarefa", "preset": "Predefinição", "generatedSkills": "Habilidades Geradas", "showLess": "Ocultar", "showMore": "Mostrar mais", "osHasLearned": "O OS aprendeu", "complete": "Concluir", "interactionsPlaceholder": "As interações aparecerão aqui conforme você demonstra o fluxo de trabalho", "done": "Pronto", "generatingGuidance": "Gerando orientação...", "summarizingInteraction": "Estamos resumindo cada interação e preparando uma habilidade reutilizável", "skillSaved": "Habilidade salva", "goal": "Objetivo", "steps": "Etapas", "events": "Eventos", "guidanceSavedSuccessfully": "Orientação salva com sucesso", "openGuidanceInComposer": "Abrir orientação no Composer", "recordAnotherWorkflow": "Gravar outro fluxo de trabalho", "dismissSummary": "Dispensar resumo", "saveAndTest": "Salvar e Testar", "learning": "Aprendendo...", "teachModeError": "O modo de ensino encontrou um problema", "errorDetails": "Detalhes do Erro", "checkNetworkConnection": "Verifique sua conexão de rede e tente iniciar o modo de ensino novamente", "tryAgain": "Tentar novamente", "resetState": "Redefinir estado", "completeConfirmTitle": "Capacitação do OS concluída", "completeConfirmMessage": "Você pode escolher o resultado desejado na lista de verificação abaixo.", "capturedEvents": "Eventos Capturados", "confirmAndGenerate": "Gerar", "generating": "Gerando", "promptSummary": "Resumo do Prompt", "saveToPreset": "Salvar na Predefinição", "skillHostname": "Habilidade: {{hostname}}", "saveToSkill": "Salvar na habilidade", "selectAll": "Selecionar tudo", "discard": "Descartar", "confirmDiscard": "Sim, descartar", "tutorial": { "title": "Bem-vindo ao Modo de Ensino", "next": "Próximo", "gotIt": "Entendi", "guideLabel": "Guia do Modo de Ensino", "page1": { "title": "O que são habilidades e modo de ensino?", "description": "Habilidades são onde o OS armazena conhecimento reutilizável que qualquer agente pode aplicar. Cada habilidade é um guia baseado em prompts (potencialmente contendo trechos de código) sobre uma aplicação web, fluxo de trabalho ou padrão de interação. Ela ajuda o OS a obter melhor desempenho em determinados sites ou tarefas específicas.\n\nO modo de ensino é como você pode treinar o OS para copiar sua rotina ou aprender a trabalhar em um site específico, que será armazenado como <strong>habilidades e predefinições</strong> para você reutilizar no futuro." }, "page2": { "title": "Como iniciar o modo de ensino?", "description": "Para começar, clique no botão '<strong>Modo de Ensino</strong>' no '<strong>painel de Inteligência</strong>' à esquerda. Antes de começar, defina um <strong>Objetivo de Ensino</strong> que forneça ao OS uma instrução inicial e lhe dê uma tarefa clara a seguir." }, "page3": { "title": "Como o OS aprende seus movimentos?", "description": "Enquanto você ensina, o OS observa suas ações e rastreia seu cursor em tempo real. Você verá cada etapa registrada no painel esquerdo — pause a qualquer momento e clique no ícone vermelho '<strong>Parar</strong>' quando terminar." }, "page4": { "title": "Quais são os resultados de aprendizagem do OS?", "description": "Depois de terminar seu ensino, selecione o tipo de resultado que deseja gerar. Normalmente, uma predefinição e habilidades relacionadas são geradas para tarefas rotineiras. Após a geração, você pode revisá-las e editá-las no <strong>Composer</strong> ou acessá-las a qualquer momento na pasta '<strong>Aprender do Usuário</strong>' dentro do painel '<strong>Inteligência</strong>'." } }, "skillTooltip": "Você pode revisar ou editar a habilidade abaixo", "skillSectionTooltip": "Cada habilidade é nomeada de acordo com o domínio do site usado durante a sessão de ensino. As habilidades recém-aprendidas aparecem como novas seções no arquivo markdown correspondente." };
const sidebar$6 = { "goBack": "Voltar", "goForward": "Avançar", "lockSidebar": "Bloquear barra lateral", "unlockSidebar": "Desbloquear barra lateral", "searchOrEnterAddress": "Pesquisar ou digitar endereço", "reload": "Recarregar" };
const tabs$6 = { "newTab": "Nova aba", "terminal": "Terminal", "pauseAgent": "Pausar agente", "resumeAgent": "Retomar agente" };
const userMenu$6 = { "upgrade": "Atualizar", "creditsLeft": "restantes", "clickToManageSubscription": "Clique para gerenciar assinatura", "theme": "Tema", "lightMode": "Modo Claro", "darkMode": "Modo Escuro", "systemMode": "Modo Sistema", "language": "Idioma", "settings": "Configurações", "invitationCode": "Código de Convite", "checkUpdates": "Verificar Atualizações", "contactUs": "Fale Conosco", "signOut": "Sair", "openUserMenu": "Abrir menu do usuário", "signIn": "Entrar" };
const settings$6 = { "title": "Configurações", "history": "Histórico", "downloads": "Downloads", "adblock": "Bloqueador de Anúncios", "language": "Idioma", "languageDescription": "Escolha seu idioma preferido para a interface. As alterações entram em vigor imediatamente.", "softwareUpdate": "Atualização de Software" };
const updateSettings$6 = { "description": "Flowith OS mantém você atualizado com atualizações seguras e confiáveis. Escolha seu canal: Stable para confiabilidade, Beta para recursos antecipados ou Alpha para builds de ponta. Você só pode alternar para canais aos quais sua conta tem acesso.", "currentVersion": "Versão atual: {{version}}", "loadError": "Falha ao carregar", "warning": "Aviso: Builds Beta/Alpha podem ser instáveis e afetar seu trabalho. Use Stable para produção.", "channel": { "label": "Canal de Atualização", "hint": "Apenas canais aos quais você tem acesso podem ser selecionados.", "disabledHint": "Não é possível alternar canais enquanto uma atualização está em andamento", "options": { "stable": "Stable", "beta": "Beta", "alpha": "Alpha" } }, "actions": { "title": "Verificação Manual", "hint": "Verificar atualizações disponíveis agora.", "check": "Verificar atualizações" }, "status": { "noUpdate": "Você está atualizado.", "hasUpdate": "Nova versão disponível.", "error": "Falha ao verificar atualizações." }, "tips": { "title": "Dicas", "default": "Por padrão, receba notificações para atualizações estáveis. No Early Access, builds pré-lançamento podem ser instáveis para trabalho de produção.", "warningTitle": "Um Aviso: Atualizações Nightly são Aplicadas Automaticamente", "warningBody": "Builds Nightly baixarão e instalarão atualizações silenciosamente sem avisar quando o Cursor for fechado." } };
const adblock$6 = { "title": "Bloqueador de Anúncios", "description": "Bloqueie anúncios intrusivos e rastreadores, filtre o ruído da página, permitindo que o Neo OS Agent compreenda e extraia informações com mais precisão, protegendo sua privacidade.", "enable": "Ativar Bloqueador de Anúncios", "enableDescription": "Bloquear anúncios automaticamente em todos os sites", "statusActive": "Ativo - Anúncios estão sendo bloqueados", "statusInactive": "Inativo - Anúncios não estão sendo bloqueados", "adsBlocked": "anúncios bloqueados", "networkBlocked": "Requisições de Rede", "cosmeticBlocked": "Elementos Ocultados", "filterRules": "Regras de Filtro", "activeRules": "regras ativas" };
const blank$6 = { "openNewPage": "Abrir nova página em branco", "selectBackground": "Selecionar fundo", "isAwake": "Desperto", "osIsAwake": "OS está desperto", "osGuideline": "Guia do OS", "osGuidelineDescription": "Início rápido do OS Agent - arquitetura, modos e tudo que ele pode fazer.", "intelligence": "Modo de Ensino", "intelligenceDescription": "Ensine o OS Agent a executar tarefas e reutilizá-las depois", "inviteAndEarn": "Convide e Ganhe", "tagline": "Com memória ativa que evolui a cada ação para entender você de verdade.", "taskPreset": "Predefinição de Tarefa", "credits": "+{{amount}} Créditos", "addPreset": "Adicionar nova predefinição", "editPreset": "Editar predefinição", "deletePreset": "Excluir predefinição", "removeFromHistory": "Remover do histórico", "previousPreset": "Predefinição anterior", "nextPreset": "Próxima predefinição", "previousPresets": "Predefinições anteriores", "nextPresets": "Próximas predefinições", "createPreset": "Criar predefinição", "presetName": "Nome da predefinição", "instruction": "Instrução", "presetNamePlaceholderCreate": "ex: Relatório Semanal, Revisão de Código, Análise de Dados...", "presetNamePlaceholderEdit": "Digite o nome da predefinição...", "instructionPlaceholderCreate": 'Descreva o que você quer que o OS faça...\nex: "Analise os dados de vendas desta semana e crie um relatório resumido"', "instructionPlaceholderEdit": "Atualize a instrução da tarefa...", "colorBlue": "Azul", "colorGreen": "Verde", "colorYellow": "Amarelo", "colorRed": "Vermelho", "selectColor": "Selecionar cor {{color}}", "creating": "Criando...", "updating": "Atualizando...", "create": "Criar", "update": "Atualizar", "smartInputPlaceholder": "Navegue, pesquise ou deixe Neo assumir...", "processing": "Processando…", "navigate": "Navegar", "navigateDescription": "Abrir este endereço na aba atual", "searchGoogle": "Pesquisar no Google", "searchGoogleDescription": "Pesquisar com Google", "runTask": "Executar Tarefa", "runTaskDescription": "Executar com agente Neo", "createCanvas": "Perguntar no Canvas", "createCanvasDescription": "Abrir o Flo Canvas com este prompt" };
const agentGuide$6 = { "title": "Guia do Agente", "subtitle": "Um guia visual rápido para o OS Agent: arquitetura, modos e tudo o que ele pode fazer.", "capabilities": { "heading": "Capacidades", "navigate": { "title": "Navegar", "desc": "Abrir páginas, voltar/avançar" }, "click": { "title": "Clicar", "desc": "Interagir com botões e links" }, "type": { "title": "Digitar", "desc": "Preencher campos e formulários" }, "keys": { "title": "Teclas", "desc": "Enter, Escape, atalhos" }, "scroll": { "title": "Rolar", "desc": "Navegar por páginas longas" }, "tabs": { "title": "Abas", "desc": "Marcar, alternar, fechar" }, "files": { "title": "Arquivos", "desc": "Escrever, ler, baixar" }, "skills": { "title": "Habilidades", "desc": "Conhecimento compartilhado" }, "memories": { "title": "Memórias", "desc": "Preferências de longo prazo" }, "upload": { "title": "Upload", "desc": "Enviar arquivos para páginas" }, "ask": { "title": "Perguntar", "desc": "Confirmações rápidas do usuário" }, "onlineSearch": { "title": "Pesquisa Online", "desc": "Consulta rápida na web" }, "extract": { "title": "Extrair", "desc": "Obter informações estruturadas" }, "deepThink": { "title": "Análise Profunda", "desc": "Análise estruturada" }, "vision": { "title": "Visão", "desc": "Operações precisas não DOM" }, "shell": { "title": "Shell", "desc": "Executar comandos (quando disponível)" }, "report": { "title": "Relatório", "desc": "Concluir e resumir" } }, "benchmark": { "title": "Benchmark Online‑Mind2Web", "subtitle": "Flowith Neo AgentOS Domina Completamente: Com ", "subtitleHighlight": "Desempenho Quase Perfeito", "subtitleEnd": ".", "openai": "OpenAI Operator", "gemini": "Gemini 2.5 Computer Use", "flowith": "Flowith Neo OS", "average": "Média", "easy": "Fácil", "medium": "Médio", "hard": "Difícil" }, "skillsMemories": { "heading": "Habilidades & Memórias", "description": "Playbooks reutilizáveis e contexto de longo prazo que o Neo referencia automaticamente no Modo Pro.", "markdownTag": "Markdown .md", "autoIndexedTag": "Auto-indexado", "citationsTag": "Citações nos logs", "howNeoUses": "Como o Neo usa: antes de cada etapa no Modo Pro, o Neo verifica Habilidades e Memórias relevantes, mescla-as no contexto de raciocínio e aplica as instruções ou preferências automaticamente.", "skillsTitle": "Habilidades", "skillsTag": "Compartilhado", "skillsDesc": "Armazene know-how reutilizável que qualquer agente pode aplicar. Cada Habilidade é um guia curto sobre uma ferramenta, fluxo de trabalho ou padrão.", "skillsProcedures": "Melhor para: procedimentos", "skillsFormat": "Formato: Markdown", "skillsScenario": "Cenário cotidiano", "skillsScenarioTitle": "Converter e compartilhar mídia", "skillsStep1": 'Você diz: "Transforme essas 20 imagens em um PDF compacto."', "skillsStep2": "O Neo segue a habilidade para fazer upload, converter, aguardar conclusão e salvar o arquivo.", "skillsOutcome": "Resultado: um PDF pronto para compartilhar com link de download nos logs.", "memoriesTitle": "Memórias", "memoriesTag": "Pessoal", "memoriesDesc": "Capture suas preferências, perfil e fatos de domínio. O Neo referencia itens relevantes ao tomar decisões e os cita nos logs.", "memoriesStyle": "Melhor para: estilo, regras", "memoriesPrivate": "Privado por padrão", "memoriesScenario": "Cenário cotidiano", "memoriesScenarioTitle": "Tom e voz de escrita", "memoriesStep1": "Você gosta de textos concisos, amigáveis e com tom otimista.", "memoriesStep2": "O Neo aplica isso automaticamente em emails, relatórios e posts sociais.", "memoriesOutcome": "Resultado: voz de marca consistente sem repetir instruções.", "taskFilesTitle": "Arquivos de Tarefa", "taskFilesTag": "Por tarefa", "taskFilesDesc": "Arquivos temporários criados durante a tarefa atual. Eles facilitam I/O de ferramentas e resultados intermediários e não são compartilhados automaticamente com outras tarefas.", "taskFilesEphemeral": "Efêmero", "taskFilesReadable": "Legível por ferramentas", "taskFilesScenario": "Cenário cotidiano", "taskFilesScenarioTitle": "Rastreador de preços de viagem", "taskFilesStep1": "O Neo raspa tabelas de voos e as armazena como CSV para esta tarefa.", "taskFilesStep2": "Compara tarifas de hoje com as de ontem e destaca mudanças.", "taskFilesOutcome": "Resultado: um resumo organizado e um CSV para download." }, "system": { "title": "Neo OS - o agente de navegador mais inteligente para você", "tagline": "Auto-Evolutivo × Memória & Habilidade × Velocidade & Inteligência", "selfEvolving": "Auto-Evolutivo", "intelligence": "Inteligência", "contextImprovement": "Melhoria de Contexto", "contextDesc": "Agente reflexivo refina o contexto em tempo real via sistema de habilidades", "onlineRL": "RL Online", "onlineRLDesc": "Atualizações periódicas alinhadas com comportamentos do agente", "intelligentMemory": "Memória Inteligente", "architecture": "Arquitetura", "dualLayer": "Sistema de Dupla Camada", "dualLayerDesc": "Buffers de curto prazo + memória episódica de longo prazo", "knowledgeTransfer": "Transferência de Conhecimento", "knowledgeTransferDesc": "Reter, reutilizar e transferir aprendizado entre tarefas", "highPerformance": "Alto Desempenho", "infrastructure": "Infraestrutura", "executionKernel": "Kernel de Execução", "executionKernelDesc": "Orquestração paralela e agendamento dinâmico", "speedCaching": "Cache de Velocidade", "speedCachingDesc": "Resposta em milissegundos com execução em tempo real", "speedIndicator": "~1ms", "summary": "Evolutivo · Persistente · Rápido" }, "arch": { "heading": "Arquitetura", "osShell": "OS Shell", "agentCore": "Núcleo do Agente", "plannerExecutor": "Planejador · Executor", "browserTabs": "Abas do Navegador", "domCanvas": "DOM · Canvas", "filesMemoriesSkills": "Arquivos · Memórias · Habilidades", "domPageTabs": "DOM · Página · Abas", "clickTypeScroll": "Clicar · Digitar · Rolar", "visionNonDOM": "Visão · Operações Não DOM", "captchaDrag": "CAPTCHA · Arrastar", "onlineSearchThinking": "Pesquisa Online · Análise Profunda", "googleAnalysis": "google · análise", "askUserReport": "Perguntar ao Usuário · Relatório", "choicesDoneReport": "choices · done_and_report" }, "tips": { "heading": "Dicas", "beta": "O FlowithOS está atualmente em Beta; tanto o produto quanto o Agent Neo estão sendo continuamente atualizados. Fique atento às últimas atualizações.", "improving": "As habilidades do Agent Neo OS estão melhorando dia a dia, você pode tentar usar as novas habilidades para completar suas tarefas." } };
const reward$6 = { "helloWorld": "Hello World", "helloWorldDesc": "Este é o momento 'Hello World' da era dos Agentes<br />Seja uma das primeiras pessoas a deixar sua marca na Internet de próxima geração", "get2000Credits": "Ganhe seus 2000 créditos", "equivalent7Days": "Equivalente a automatizar suas redes sociais por 7 dias consecutivos", "shareInstructions": "Após despertar, apresente seu FlowithOS ao mundo<br />Ele criará e publicará automaticamente uma mensagem 'Hello World' na plataforma escolhida.<br />Assim como tudo que ele pode fazer por você depois.<br /><span style='display: block; height: 8px;'></span>Sente-se e observe acontecer.", "osComing": "OS chegando", "awakeOS": "Awake OS", "page2Title": "Convide amigos e ganhe créditos", "page2Description1": "Toda grande jornada fica melhor com amigos.", "page2Description2": "Cada amigo que entrar te dá", "page2Description3": "créditos de presente.", "retry": "Tentar de novo", "noCodesYet": "Ainda sem códigos", "activated": "Ativado", "neoStarting": "Neo está iniciando a tarefa de compartilhamento automático...", "failed": "Falhou", "unknownError": "Erro desconhecido", "errorRetry": "Deu erro, tente de novo", "unexpectedResponse": "Resposta inesperada do servidor", "failedToLoadCodes": "Não foi possível carregar os códigos", "congratsCredits": "Parabéns! +{{amount}} créditos", "rewardUnlocked": "Recompensa de compartilhamento recebida" };
const agentWidget$6 = { "modes": { "fast": { "label": "Modo rápido", "description": "Concluir tarefas o mais rápido possível, não usará Habilidades e Memórias.", "short": "Rápido", "modeDescription": "Mais rápido, menos detalhes" }, "pro": { "label": "Modo Pro", "description": "Máxima qualidade: análise visual passo a passo com raciocínio profundo. Referindo Habilidades e Memórias conforme necessário.", "short": "Pro", "modeDescription": "Modo equilibrado, deixe com Neo" } }, "minimize": "Minimizar", "placeholder": "Peça ao Neo OS Agent para fazer...", "changeModeTooltip": "Altere o modo para ajustar o comportamento do agente", "preset": "Predefinição", "selectPresetTooltip": "Selecione uma predefinição para usar", "addNewPreset": "Adicionar nova predefinição", "agentHistoryTooltip": "Histórico de ações do agente", "createPreset": "Criar predefinição", "presetName": "Nome da predefinição", "instruction": "Instrução", "upload": "Carregar", "newTask": "Nova Tarefa", "draft": "Rascunho", "copyPrompt": "Copiar prompt", "showMore": "Mostrar mais", "showLess": "Mostrar menos", "agentIsWorking": "Agente trabalhando", "agentIsWrappingUp": "Agente finalizando", "completed": "Concluído", "paused": "Pausado", "created": "Criado", "selectTask": "Selecionar tarefa", "unpin": "Desafixar", "pinToRight": "Fixar à direita", "stepsCount": "Passos ({{count}})", "files": "Arquivos", "filesCount": "Arquivos ({{count}})", "noFilesYet": "Nenhum arquivo gerado ainda", "status": { "wrappingUp": "Agente finalizando...", "thinking": "Agente pensando...", "wrappingUpAction": "Concluindo ação atual..." }, "actions": { "markedTab": "Aba marcada", "openRelatedTab": "Abrir aba relacionada (em desenvolvimento)", "open": "Abrir", "openTab": "Abrir aba", "showInFolder": "Mostrar na pasta", "preview": "Visualizar", "followUpPrefix": "Você", "actionsHeader": "Ações" }, "controls": { "rerun": "Executar novamente (em desenvolvimento)", "pause": "Pausar", "pauseAndArchive": "Pausar e arquivar", "resume": "Retomar", "wrappingUpDisabled": "Finalizando..." }, "input": { "sending": "Enviando...", "adjustTaskPlaceholder": "Envie uma nova mensagem para ajustar a tarefa do Agent Neo..." }, "legacy": { "readOnlyNotice": "Tarefa legada, somente leitura" }, "refunded": { "noFollowUp": "Esta tarefa foi reembolsada. Mensagens de acompanhamento não estão disponíveis." }, "skills": { "matchingSkills": "Correspondendo habilidades relevantes…", "scanningSkills": "Escaneando habilidades disponíveis…", "scanningMap": "Varrendo mapa de habilidades neurais…" }, "billing": { "creditsDepletedTitle": "Adicione créditos para continuar", "creditsDepletedMessage": "O agente foi pausado porque você está sem créditos. Adicione créditos ou atualize suas informações de cobrança e execute novamente a tarefa quando estiver pronto." }, "presetActions": { "editPreset": "Editar predefinição", "deletePreset": "Excluir predefinição" }, "feedback": { "success": { "short": "Ótimo trabalho!", "long": "Até agora tudo bem, ótimo trabalho!" }, "refund": { "short": "Ops, reembolso!", "long": "Ops, quero meus créditos de volta!" }, "refundSuccess": { "long": "Ótimo! Seus créditos foram reembolsados!" }, "modal": { "title": "Solicitar reembolso de créditos", "credits": "{{count}} créditos", "description": "Se não estiver satisfeito com esta tarefa, solicite um reembolso e reembolsaremos instantaneamente todos os créditos usados nesta tarefa.", "whatGoesWrong": "O que deu errado", "errorMessage": "Desculpe, forneça mais detalhes", "placeholder": "Descreva o que deu errado...", "shareTask": "Compartilhar esta tarefa conosco", "shareDescription": "Vamos anonimizar todos os detalhes pessoais da sua tarefa. Ao compartilhar sua tarefa conosco, melhoraremos o desempenho do nosso agente em tarefas semelhantes no futuro.", "upload": "Enviar", "attachFile": "anexar arquivo", "submit": "Enviar", "submitting": "Enviando...", "alreadyRefunded": { "title": "Já reembolsado", "message": "Esta tarefa já foi reembolsada. Você não pode solicitar um reembolso novamente." } }, "errors": { "systemError": "Erro do sistema. Entre em contato com nossa equipe de suporte.", "networkError": "Erro de rede. Verifique sua conexão e tente novamente.", "noUsageData": "Dados de uso não encontrados. Não é possível reembolsar.", "alreadyRefunded": "Esta tarefa já foi reembolsada.", "notAuthenticated": "Faça login para solicitar um reembolso.", "unknownError": "Ocorreu um erro inesperado. Tente novamente mais tarde.", "validationFailed": "Não é possível validar sua razão no momento. Tente novamente mais tarde.", "invalidReason": "Razão rejeitada. Por favor, descreva o que realmente deu errado." }, "confirmation": { "creditsRefunded": "{{count}} créditos reembolsados", "title": "Sucesso", "message": "Obrigado! Nossa equipe diagnosticará sua tarefa e melhorará a experiência do FlowithOS.", "messageNoShare": "Obrigado! Nossa equipe continuará trabalhando para melhorar a experiência do FlowithOS." } } };
const gate$6 = { "welcome": { "title": "Bem-vindo ao FlowithOS", "subtitle": "Da Web ao Mundo, FlowithOS é o AgenticOS mais inteligente que transforma seu navegador em valores do mundo real.", "features": { "execute": { "title": "Execute Qualquer Tarefa, Automaticamente", "description": "Agindo com intuição humana em velocidade de máquina, FlowithOS navega e executa múltiplas tarefas pela web repetidamente." }, "transform": { "title": "Transforme Ideias em Impacto, Inteligentemente", "description": "Da inspiração à criação de valor, FlowithOS transforma grandes ideias em ações para entregar resultados reais." }, "organize": { "title": "Organize Seus Ativos, Sistematicamente", "description": "De marcadores dispersos a playbooks estruturados, FlowithOS equipa você com um sistema robusto para gerenciar, curar e escalar seus ativos digitais." }, "evolve": { "title": "Evolua Com Você, Dinamicamente", "description": "Com uma Memória que cresce de cada interação, FlowithOS desenvolve Habilidades personalizadas—desde navegar em sites complexos até entender seu estilo pessoal." } }, "letsGo": "Vamos Lá!" }, "auth": { "createAccount": "Criar uma conta", "signInToFlowith": "Entre na sua conta Flowith", "oneAccount": "Uma conta para todos os produtos Flowith", "fromAnotherAccount": "Usar conta social", "useOwnEmail": "Usar meu e-mail", "email": "E-mail", "password": "Senha", "confirmPassword": "Confirmar senha", "acceptTerms": "Aceito os Termos de Uso e Política de Privacidade do FlowithOS", "privacyNote": "Todos os seus dados ficam 100% seguros no seu dispositivo", "alreadyHaveAccount": "Já tem uma conta?", "createNewAccount": "Não tem conta?", "signUp": "Cadastrar", "signIn": "Entrar", "processing": "Processando...", "verifyEmail": "Verifique seu e-mail", "verificationCodeSent": "Enviamos um código de 6 dígitos para {{email}}", "enterVerificationCode": "Digite o código de verificação", "verificationCode": "Código de verificação", "enterSixDigitCode": "Digite o código de 6 dígitos", "backToSignUp": "Voltar ao cadastro", "verifying": "Verificando...", "verifyCode": "Verificar", "errors": { "enterEmail": "Digite seu e-mail", "enterPassword": "Digite sua senha", "confirmPassword": "Confirme sua senha", "passwordsDoNotMatch": "As senhas não coincidem", "acceptTerms": "Você precisa aceitar os Termos de Uso e Política de Privacidade", "authFailed": "Falha ao fazer login. Tente novamente.", "invalidVerificationCode": "Digite um código de 6 dígitos válido", "verificationFailed": "Falha na verificação. Tente novamente.", "oauthFailed": "Falha no login social. Tente novamente.", "userAlreadyExists": "Este e-mail já está registrado. Por favor " }, "goToLogin": "faça login", "signInPrompt": "faça login" }, "invitation": { "title": "O despertar requer uma chave", "subtitle": "Digite seu código de convite para desbloquear o FlowithOS", "lookingForInvite": "Procurando um convite?", "followOnX": "Siga @flowith no X", "toGetAccess": "para obter acesso.", "placeholder": "Digite o código de convite", "invalidCode": "Código de convite inválido", "verificationFailed": "Falha na verificação - tente novamente", "accessGranted": "Acesso liberado", "initializing": "Bem-vindo ao FlowithOS. Inicializando..." }, "browserImport": { "title": "Continue de onde parou", "subtitle": "Importe seus favoritos e sessões salvas dos seus navegadores.", "detecting": "Detectando navegadores instalados...", "noBrowsers": "Nenhum navegador instalado foi detectado", "imported": "Importado", "importing": "Importando...", "bookmarks": "favoritos", "importNote": "Leva cerca de 5 segundos. Você verá uma ou duas janelas do sistema.", "skipForNow": "Pular", "nextStep": "Próximo" }, "settings": { "title": "Pronto para começar?", "subtitle": "Alguns ajustes rápidos para aperfeiçoar sua experiência no Flowith OS.", "defaultBrowser": { "title": "Definir como navegador padrão", "description": "Todos os links abrirão automaticamente no FlowithOS, integrando o conteúdo online ao seu espaço de trabalho." }, "addToDock": { "title": "Adicionar ao Dock / Barra de tarefas", "description": "Mantenha acesso rápido sempre que a inspiração surgir." }, "launchAtStartup": { "title": "Iniciar automaticamente", "description": "O Flowith OS será iniciado automaticamente quando você ligar o computador." }, "helpImprove": { "title": "Ajude-nos a melhorar", "description": "Compartilhe dados de uso anônimos para nos ajudar a construir um produto melhor para todos.", "privacyNote": "Sua privacidade é totalmente protegida." }, "canChangeSettingsLater": "Você pode mudar isso depois", "nextStep": "Próximo", "privacy": { "title": "100% Armazenamento Local e Proteção de Privacidade", "description": "O histórico de execução do Agente, histórico de navegação, Memories e Skills, credenciais de contas e todos os dados pessoais ficam 100% armazenados somente no seu dispositivo. Nada é sincronizado com servidores na nuvem. Use o FlowithOS com tranquilidade." } }, "examples": { "title1": "O OS está desperto.", "title2": "Veja em ação.", "subtitle": "Comece com um exemplo para ver como funciona.", "enterFlowithOS": "Começar a usar FlowithOS", "clickToReplay": "clique para ver este caso", "videoNotSupported": "Seu navegador não suporta reprodução de vídeo.", "cases": { "shopping": { "title": "Compras de feriado 10x mais rápidas", "description": "Preenche seu carrinho com presentes perfeitos para pets automaticamente—economizando mais de 2 horas." }, "contentEngine": { "title": "Gerador de conteúdo X 24/7", "description": "Descobre histórias do Hacker News, escreve no seu estilo e publica automaticamente no X. Triplica as visitas ao perfil e o crescimento da comunidade." }, "tiktok": { "title1": "Gerador de engajamento TikTok: 500+ interações,", "title2": "0 esforço", "description": "Flowith OS comenta automaticamente em lives populares com mensagens relevantes, transformando presença digital em crescimento real." }, "youtube": { "title": "Crescimento automático de canal no YouTube", "description": "Flowith OS automatiza todo o fluxo de trabalho do YouTube sem mostrar o rosto, da criação ao engajamento, reduzindo semanas de trabalho para menos de uma hora." } } }, "oauth": { "connecting": "Conectando com {{provider}}", "completeInBrowser": "Complete o login na janela do navegador que acabou de abrir.", "cancel": "Cancelar" }, "terms": { "title": "Termos de Uso e Política de Privacidade", "subtitle": "Por favor, revise os termos abaixo.", "close": "Fechar" }, "invitationCodes": { "title": "Meus Códigos de Convite", "availableToShare": "{{unused}} de {{total}} disponíveis para compartilhar", "loading": "Carregando seus códigos...", "noCodesYet": "Ainda sem códigos de convite.", "noCodesFound": "Nenhum código de convite encontrado", "failedToLoad": "Não foi possível carregar os códigos", "useCodeHint": "Use um código de convite para obter seus próprios códigos!", "shareHint": "Compartilhe esses códigos com amigos para convidá-los ao FlowithOS", "used": "Usado" }, "history": { "title": "Histórico", "searchPlaceholder": "Pesquisar no histórico...", "selectAll": "Selecionar tudo", "deselectAll": "Desmarcar tudo", "deleteSelected": "Excluir selecionados ({{count}})", "clearAll": "Limpar tudo", "loading": "Carregando histórico...", "noMatchingHistory": "Nenhum histórico correspondente encontrado", "noHistoryYet": "Ainda sem histórico", "confirmDelete": "Confirmar exclusão", "deleteConfirmMessage": "Tem certeza de que deseja excluir o histórico selecionado? Esta ação não pode ser desfeita.", "cancel": "Cancelar", "delete": "Excluir", "today": "Hoje", "yesterday": "Ontem", "earlier": "Anterior", "untitled": "Sem título", "visitedTimes": "Visitado {{count}} vezes", "openInNewTab": "Abrir em nova aba", "timePeriod": "Período", "timeRangeAll": "Tudo", "timeRangeAllDesc": "Todo o histórico de navegação", "timeRangeToday": "Hoje", "timeRangeTodayDesc": "Todo o histórico de hoje", "timeRangeYesterday": "Ontem", "timeRangeYesterdayDesc": "Histórico de ontem", "timeRangeLast7Days": "Últimos 7 dias", "timeRangeLast7DaysDesc": "Histórico da semana passada", "timeRangeThisMonth": "Este mês", "timeRangeThisMonthDesc": "Histórico deste mês", "timeRangeLastMonth": "Mês passado", "timeRangeLastMonthDesc": "Histórico do mês passado", "deleteTimeRange": "Excluir {{range}}" } };
const update$6 = { "checking": { "title": "Verificando atualizações", "description": "Conectando ao servidor de atualizações..." }, "noUpdate": { "title": "Você está atualizado", "currentVersion": "Versão atual v{{version}}", "description": "Você já está usando a versão mais recente", "close": "Fechar" }, "available": { "title": "Nova versão disponível", "version": "v{{version}} está disponível", "currentVersion": "(Atual: v{{current}})", "released": "Lançado {{time}}", "betaNote": "Estamos em beta público e lançamos melhorias diariamente. Atualize agora para experimentar os recursos mais recentes.", "defaultReleaseNotes": "Esta versão beta inclui melhorias de desempenho, correções de bugs e novos recursos. Lançamos atualizações diariamente. Atualize agora para a melhor experiência.", "downloadNow": "Baixar agora", "remindLater": "Lembrar mais tarde", "preparing": "Preparando..." }, "downloading": { "title": "Baixando atualização", "version": "Baixando v{{version}}", "progress": "Progresso do download", "hint": "Você será solicitado a instalar quando o download for concluído" }, "readyToInstall": { "title": "Pronto para instalar", "downloaded": "v{{version}} foi baixado com sucesso", "hint": "Reinicie para concluir a instalação da atualização", "restartNow": "Reiniciar agora", "restartLater": "Reiniciar depois", "restarting": "Reiniciando..." }, "error": { "title": "Falha na verificação de atualização", "default": "Atualização falhou. Tente novamente mais tarde.", "downloadFailed": "Download falhou. Tente novamente mais tarde.", "installFailed": "Instalação falhou. Tente novamente mais tarde.", "close": "Fechar" }, "time": { "justNow": "agora mesmo", "minutesAgo": "{{count}} minutos atrás", "hoursAgo": "{{count}} horas atrás" }, "notifications": { "newVersionAvailable": "Nova versão {{version}} disponível", "downloadingInBackground": "Baixando em segundo plano", "updateDownloaded": "Atualização baixada", "readyToInstall": "Versão {{version}} pronta para instalar" } };
const updateToast$6 = { "checking": "Verificando atualizações...", "pleaseWait": "Por favor aguarde", "preparingDownload": "Preparando download {{version}}", "updateFound": "Atualização {{version}} encontrada", "downloading": "Baixando atualização {{version}}", "updateCheckFailed": "Falha na verificação de atualização", "unknownError": "Erro desconhecido", "updatedTo": "Atualizado para v{{version}}", "newVersionReady": "Nova versão pronta", "version": "Versão {{version}}", "close": "Fechar", "gotIt": "Entendi", "installNow": "Reiniciar agora", "restarting": "Reiniciando…", "later": "Mais tarde", "collapseUpdateContent": "Recolher conteúdo da atualização", "viewUpdateContent": "Ver conteúdo da atualização", "collapseLog": "Recolher ^", "viewLog": "Ver registro >", "channelChangeFailed": "Falha ao trocar de canal: {{error}}", "channelInfo": "Canal: {{channel}}, Manifest: {{manifest}}", "manualDownloadHint": "Não consegue atualizar? Tente a instalação manual →", "channelDowngraded": { "title": "Canal Alterado", "message": "Sua conta não tem acesso a {{previousChannel}}. Alterado automaticamente para {{newChannel}}." }, "continueInBackground": "O download continuará em segundo plano", "time": { "justNow": "agora mesmo", "minutesAgo": "{{count}} minutos atrás", "hoursAgo": "{{count}} horas atrás", "daysAgo": "{{count}} dias atrás", "weeksAgo": "{{count}} semanas atrás", "monthsAgo": "{{count}} meses atrás", "yearsAgo": "{{count}} anos atrás" } };
const errors$6 = { "auth": { "notLoggedIn": "Por favor, faça login primeiro", "loginRequired": "Por favor, faça login antes de usar este recurso", "shareRequiresLogin": "Por favor, faça login antes de usar o recurso de compartilhamento" }, "network": { "networkError": "Erro de rede - verifique sua conexão", "requestTimeout": "Tempo limite da solicitação esgotado - tente novamente", "failedToVerify": "Falha na verificação", "failedToFetch": "Falha ao buscar" }, "invitation": { "invalidCode": "Código de convite inválido", "verificationFailed": "Verificação falhou - tente novamente", "failedToConsume": "Falha ao consumir código de convite" }, "download": { "downloadFailed": "Download falhou", "downloadInterrupted": "Download interrompido" }, "security": { "secureConnection": "Conexão segura", "notSecure": "Não seguro", "localFile": "Arquivo local", "unknownProtocol": "Protocolo desconhecido" } };
const menus$6 = { "application": { "about": "Sobre {{appName}}", "checkForUpdates": "Verificar atualizações...", "settings": "Configurações...", "services": "Serviços", "hide": "Ocultar {{appName}}", "hideOthers": "Ocultar outros", "showAll": "Mostrar tudo", "quit": "Sair", "updateChannel": "Canal de atualização" }, "edit": { "label": "Editar", "undo": "Desfazer", "redo": "Refazer", "cut": "Recortar", "paste": "Colar", "selectAll": "Selecionar tudo" }, "view": { "label": "Visualizar", "findInPage": "Localizar na página", "newTab": "Nova aba", "reopenClosedTab": "Reabrir aba fechada", "newTerminalTab": "Nova aba de terminal", "openLocalFile": "Abrir arquivo local...", "goBack": "Voltar", "goForward": "Avançar", "viewHistory": "Ver histórico", "viewDownloads": "Ver downloads", "archive": "Arquivo", "reload": "Recarregar", "forceReload": "Forçar recarga", "actualSize": "Tamanho real", "zoomIn": "Ampliar", "zoomOut": "Reduzir", "toggleFullScreen": "Alternar tela cheia" }, "window": { "label": "Janela", "minimize": "Minimizar", "close": "Fechar", "bringAllToFront": "Trazer tudo para frente" }, "help": { "label": "Ajuda", "about": "Sobre", "version": "Versão", "aboutDescription1": "O Sistema Operacional de Agente de IA de próxima geração", "aboutDescription2": "construído para auto-aperfeiçoamento, memória e velocidade.", "copyright": "© 2025 Flowith, Inc. Todos os direitos reservados." }, "contextMenu": { "back": "Voltar", "forward": "Avançar", "reload": "Recarregar", "hardReload": "Forçar recarga (ignorar cache)", "openLinkInNewTab": "Abrir link em nova aba", "openLinkInExternal": "Abrir link no navegador externo", "copyLinkAddress": "Copiar endereço do link", "downloadLink": "Baixar link", "openImageInNewTab": "Abrir imagem em nova aba", "copyImageAddress": "Copiar endereço da imagem", "copyImage": "Copiar imagem", "downloadImage": "Baixar imagem", "downloadVideo": "Baixar vídeo", "downloadAudio": "Baixar áudio", "openMediaInNewTab": "Abrir mídia em nova aba", "copyMediaAddress": "Copiar endereço da mídia", "openFrameInNewTab": "Abrir quadro em nova aba", "openInExternal": "Abrir no navegador externo", "copyPageURL": "Copiar URL da página", "viewPageSource": "Ver código-fonte da página (nova aba)", "savePageAs": "Salvar página como...", "print": "Imprimir...", "cut": "Recortar", "paste": "Colar", "searchWebFor": 'Pesquisar na web por "{{text}}"', "selectAll": "Selecionar tudo", "inspectElement": "Inspecionar elemento", "openDevTools": "Abrir ferramentas de desenvolvimento", "closeDevTools": "Fechar ferramentas de desenvolvimento" }, "fileDialog": { "openLocalFile": "Abrir arquivo local", "unsupportedFileType": "Tipo de arquivo não suportado", "savePageAs": "Salvar página como", "allSupportedFiles": "Todos os arquivos suportados", "htmlFiles": "Arquivos HTML", "textFiles": "Arquivos de texto", "images": "Imagens", "videos": "Vídeos", "audio": "Áudio", "pdf": "PDF", "webpageComplete": "Página web, completa", "singleFile": "Arquivo único (MHTML)" } };
const dialogs$6 = { "crash": { "title": "Erro no aplicativo", "message": "Ocorreu um erro inesperado", "detail": "{{error}}\n\nO erro foi registrado para fins de depuração.", "restart": "Reiniciar", "close": "Fechar" }, "customBackground": { "title": "Fundo personalizado", "subtitle": "Crie seu próprio estilo", "preview": "Visualizar", "angle": "Ângulo", "stops": "Gradiente", "selectImage": "Selecionar imagem", "uploading": "Enviando...", "dropImageHere": "Solte a imagem aqui", "dragAndDrop": "Arrastar e soltar ou clicar", "fileTypes": "PNG, JPG, JPEG, WEBP, SVG, GIF", "fit": "Ajustar", "cover": "Cobrir", "contain": "Conter", "fill": "Preencher", "remove": "Remover", "cancel": "Cancelar", "apply": "Aplicar", "gradient": "Gradiente", "solid": "Sólido", "image": "Imagem", "dropImageError": "Por favor, solte um arquivo de imagem (PNG, JPG, JPEG, WEBP, SVG, GIF)" } };
const humanInput$6 = { "declinedToAnswer": "Usuário recusou responder, pergunta ignorada", "needOneInput": "Preciso de 1 entrada para continuar", "needTwoInputs": "Precisamos de sua ajuda com 2 coisas", "needThreeInputs": "3 decisões necessárias de você", "waitingOnInputs": "Aguardando {{count}} entradas suas", "declineToAnswer": "Recusar responder", "dropFilesHere": "Solte arquivos aqui", "typeYourAnswer": "Digite sua resposta...", "orTypeCustom": "Ou digite personalizado...", "uploadFiles": "Enviar arquivos", "previousQuestion": "Pergunta anterior", "goToQuestion": "Ir para a pergunta {{number}}", "nextQuestion": "Próxima pergunta" };
const pt = {
  common: common$6,
  nav: nav$6,
  tray: tray$6,
  actions: actions$6,
  status: status$6,
  time: time$6,
  downloads: downloads$6,
  history: history$6,
  invitationCodes: invitationCodes$6,
  tasks: tasks$6,
  flows: flows$6,
  bookmarks: bookmarks$6,
  conversations: conversations$6,
  intelligence: intelligence$6,
  sidebar: sidebar$6,
  tabs: tabs$6,
  userMenu: userMenu$6,
  settings: settings$6,
  updateSettings: updateSettings$6,
  adblock: adblock$6,
  blank: blank$6,
  agentGuide: agentGuide$6,
  reward: reward$6,
  agentWidget: agentWidget$6,
  gate: gate$6,
  update: update$6,
  updateToast: updateToast$6,
  errors: errors$6,
  menus: menus$6,
  dialogs: dialogs$6,
  humanInput: humanInput$6
};
const common$5 = { "ok": "ОК", "cancel": "Отмена", "start": "Начать", "delete": "Удалить", "close": "Закрыть", "save": "Сохранить", "search": "Поиск", "loading": "Загрузка", "pressEscToClose": "Нажмите ESC для закрытия", "copyUrl": "Копировать URL", "copied": "Скопировано", "copy": "Копировать", "expand": "Развернуть", "collapse": "Свернуть", "openFlowithWebsite": "Открыть сайт Flowith", "openAgentGuide": "Открыть руководство агента", "reward": "Награда", "closeWindow": "Закрыть окно", "minimizeWindow": "Свернуть окно", "toggleFullscreen": "Переключить полноэкранный режим", "saveEnter": "Сохранить (Enter)", "cancelEsc": "Отмена (Esc)", "time": { "justNow": "только что", "minutesAgo": "{{count}} минуту назад", "minutesAgo_other": "{{count}} минут назад", "hoursAgo": "{{count}} час назад", "hoursAgo_other": "{{count}} часов назад", "daysAgo": "{{count}} день назад", "daysAgo_other": "{{count}} дней назад" } };
const nav$5 = { "tasks": "Задачи", "flows": "Потоки", "bookmarks": "Закладки", "intelligence": "Интеллект", "guide": "Руководство" };
const tray$5 = { "newTask": "Новая задача", "recentTasks": "Недавние задачи", "viewMore": "Показать больше", "showMainWindow": "Показать главное окно", "hideMainWindow": "Скрыть главное окно", "quit": "Выход" };
const actions$5 = { "resume": "Продолжить", "pause": "Пауза", "cancel": "Отмена", "delete": "Удалить", "archive": "Архив", "showInFolder": "Показать в папке", "viewDetails": "Просмотр подробностей", "openFile": "Открыть файл" };
const status$5 = { "inProgress": "Выполняется", "completed": "Завершено", "archive": "Архив", "paused": "Приостановлено", "failed": "Не удалось", "cancelled": "Отменено", "running": "Запущено", "wrappingUp": "Завершение..." };
const time$5 = { "today": "Сегодня", "yesterday": "Вчера", "earlier": "Ранее" };
const downloads$5 = { "title": "Загрузки", "all": "Все", "inProgress": "Выполняется", "completed": "Завершено", "noDownloads": "Нет загрузок", "failedToLoad": "Не удалось загрузить список", "deleteConfirmMessage": "Вы уверены, что хотите удалить выбранные загрузки? Это действие нельзя отменить.", "loadingDownloads": "Загрузка списка...", "searchPlaceholder": "Поиск в загрузках...", "selectAll": "Выбрать все", "deselectAll": "Отменить выбор", "deleteSelected": "Удалить выбранные ({{count}})", "clearAll": "Очистить все", "noMatchingDownloads": "Совпадений не найдено", "noDownloadsYet": "Загрузок пока нет", "confirmDelete": "Подтвердить удаление", "cancel": "Отмена", "delete": "Удалить" };
const history$5 = { "title": "История", "allTime": "За всё время", "clearHistory": "Очистить историю", "removeItem": "Удалить элемент", "failedToLoad": "Не удалось загрузить историю", "failedToClear": "Не удалось очистить историю", "searchPlaceholder": "Поиск в истории...", "selectAll": "Выбрать все", "deselectAll": "Отменить выбор", "deleteSelected": "Удалить выбранные ({{count}})", "clearAll": "Очистить все", "noMatchingHistory": "Совпадений не найдено", "noHistoryYet": "Истории пока нет", "confirmDelete": "Подтвердить удаление", "deleteConfirmMessage": "Вы уверены, что хотите удалить выбранную историю? Это действие нельзя отменить.", "cancel": "Отмена", "delete": "Удалить", "today": "Сегодня", "yesterday": "Вчера", "earlier": "Ранее", "untitled": "Без названия", "visitedTimes": "Посещено {{count}} раз", "openInNewTab": "Открыть в новой вкладке", "loading": "Загрузка истории...", "timePeriod": "Период времени", "timeRangeAll": "Все", "timeRangeAllDesc": "Вся история просмотров", "timeRangeToday": "Сегодня", "timeRangeTodayDesc": "Вся история за сегодня", "timeRangeYesterday": "Вчера", "timeRangeYesterdayDesc": "История за вчера", "timeRangeLast7Days": "Последние 7 дней", "timeRangeLast7DaysDesc": "История за прошлую неделю", "timeRangeThisMonth": "Этот месяц", "timeRangeThisMonthDesc": "История за этот месяц", "timeRangeLastMonth": "Прошлый месяц", "timeRangeLastMonthDesc": "История за прошлый месяц", "deleteTimeRange": "Удалить {{range}}", "last7days": "Последние 7 дней", "thisMonth": "Этот месяц", "lastMonth": "Прошлый месяц" };
const invitationCodes$5 = { "title": "Мои пригласительные коды", "availableToShare": "{{unused}} из {{total}} доступно для передачи", "loading": "Загрузка ваших кодов...", "noCodesYet": "Пригласительных кодов пока нет.", "noCodesFound": "Пригласительные коды не найдены", "failedToLoad": "Не удалось загрузить пригласительные коды", "useCodeHint": "Используйте пригласительный код, чтобы получить свои собственные!", "shareHint": "Поделитесь этими кодами с друзьями, чтобы пригласить их в FlowithOS", "used": "Использован" };
const tasks$5 = { "title": "Задачи", "description": "Здесь хранятся все ваши задачи", "transformToPreset": "Преобразовать в пресет", "noTasks": "Нет задач", "archiveEmpty": "Архив пуст" };
const flows$5 = { "title": "Потоки", "description": "Все ваши холсты отображаются здесь", "newFlow": "Новый поток", "rename": "Переименовать", "leave": "Покинуть", "noFlows": "Нет потоков", "signInToViewFlows": "Войдите, чтобы просмотреть свои потоки", "pin": "Закрепить", "unpin": "Открепить" };
const bookmarks$5 = { "title": "Закладки", "description": "Здесь можно сохранить все понравившиеся вкладки", "bookmark": "Закладка", "addNewCollection": "Добавить новую коллекцию", "loadingBookmarks": "Загрузка закладок...", "noMatchingBookmarks": "Совпадающих закладок не найдено", "noBookmarksYet": "Закладок пока нет", "importFromBrowsers": "Импортировать из браузеров", "detectingBrowsers": "Поиск браузеров...", "bookmarksCount": "закладок", "deleteCollection": "Удалить коллекцию", "deleteCollectionConfirm": "Вы уверены, что хотите удалить эту коллекцию?", "newCollection": "Новая коллекция", "enterCollectionName": "Введите название новой коллекции", "create": "Создать", "collectionName": "Название коллекции", "saveEnter": "Сохранить (Enter)", "cancelEsc": "Отмена (Esc)", "renameFolder": "Переименовать папку", "renameBookmark": "Переименовать закладку", "deleteFolder": "Удалить папку", "deleteBookmark": "Удалить закладку" };
const conversations$5 = { "title": "Диалоги", "noConversations": "Диалогов пока нет" };
const intelligence$5 = { "title": "Интеллект", "description": "Развивайте своего агента с помощью навыков и памяти", "knowledgeBase": "База знаний", "memory": "Память", "skill": "Навык", "createNewSkill": "Создать новый навык", "createNewMemory": "Создать новую память", "loading": "Загрузка...", "noSkills": "Нет навыков", "noMemories": "Нет памяти", "readOnly": "Только для чтения", "readOnlyMessage": "Это встроенный системный навык, помогающий вашему агенту работать лучше. Его нельзя редактировать напрямую, но вы можете дублировать и изменить свою копию. Изменения после открытия не сохранятся. Обратите внимание.", "readOnlyToast": "Это встроенный системный навык, помогающий вашему агенту работать лучше. Его нельзя редактировать напрямую, но вы можете дублировать и изменить свою копию.", "open": "Открыть", "kbComingSoon": "Поддержка базы знаний Flowith скоро появится.", "system": "Система", "learnFromUser": "Пользователь", "systemPresetReadOnly": "Системный пресет (только для чтения)", "actions": "Действия", "rename": "Переименовать", "duplicate": "Дублировать…", "info": "Информация", "saving": "Сохранение...", "fileInfo": "Информация о файле", "fileName": "Имя", "fileSize": "Размер", "fileCreated": "Создан", "fileModified": "Изменён", "fileType": "Тип", "fileLocation": "Расположение", "copyPath": "Копировать путь", "empowerOS": "Режим обучения", "teachMakesBetter": "Обучение улучшает ОС", "teachMode": "Режим обучения", "teachModeDescription": "В режиме обучения вы можете записывать свои веб-рабочие процессы и действия, пока агент ОС тихо наблюдает, учится и преобразует их в многоразовые навыки и знания.", "teachModeGoalLabel": "Цель задачи (необязательно)", "teachModeGoalPlaceholder": "Предоставьте больше контекста для обучения ОС — это может быть конкретная цель задачи или любая связанная информация.", "teachModeTaskDisabled": "Создание новой задачи отключено, пока вы в режиме обучения.", "empowering": "Обучение", "empoweringDescription": "Агент ОС будет наблюдать и учиться, пока вы демонстрируете", "yourGoal": "Цель задачи", "preset": "Пресет", "generatedSkills": "Созданные навыки", "showLess": "Скрыть", "showMore": "Показать больше", "osHasLearned": "ОС обучилась", "complete": "Завершено", "interactionsPlaceholder": "Взаимодействия появятся здесь по мере демонстрации рабочего процесса.", "done": "Готово", "generatingGuidance": "Создание руководства...", "summarizingInteraction": "Мы обобщаем каждое взаимодействие и подготавливаем многоразовый навык.", "skillSaved": "Навык сохранён", "goal": "Цель", "steps": "Шаги", "events": "События", "guidanceSavedSuccessfully": "Руководство успешно сохранено.", "openGuidanceInComposer": "Открыть руководство в композиторе", "recordAnotherWorkflow": "Записать другой рабочий процесс", "dismissSummary": "Закрыть сводку", "saveAndTest": "Сохранить и протестировать", "learning": "Обучение...", "teachModeError": "В режиме обучения возникла проблема", "errorDetails": "Детали ошибки", "checkNetworkConnection": "Проверьте подключение к сети и попробуйте запустить режим обучения снова.", "tryAgain": "Попробовать снова", "resetState": "Сбросить состояние", "completeConfirmTitle": "Обучение ОС завершено", "completeConfirmMessage": "Вы можете выбрать желаемый результат в чек-листе ниже.", "capturedEvents": "Захваченные события", "confirmAndGenerate": "Создать", "generating": "Создание", "promptSummary": "Сводка промпта", "saveToPreset": "Сохранить в пресет", "skillHostname": "Навык: {{hostname}}", "saveToSkill": "Сохранить в навык", "skillTooltip": "Вы можете исправить или отредактировать навык ниже", "skillSectionTooltip": "Каждый навык назван в честь веб-сайта, используемого в сеансе обучения. Новые навыки появляются как новые разделы в соответствующем файле markdown.", "selectAll": "Выбрать все", "discard": "Отменить", "confirmDiscard": "Да, отменить", "tutorial": { "title": "Добро пожаловать в режим обучения", "next": "Далее", "gotIt": "Понятно", "guideLabel": "Руководство по режиму обучения", "page1": { "title": "Что такое навык и режим обучения?", "description": "Навык — это то, где ОС хранит многоразовые знания, которые может применять любой агент. Каждый навык представляет собой руководство на основе промптов (потенциально содержащее фрагменты кода) о веб-приложении, рабочем процессе или шаблоне взаимодействия. Это помогает ОС получить лучшую производительность на определённых веб-сайтах или для конкретных задач.\n\nРежим обучения — это то, как вы можете обучить ОС копировать вашу рутину или учиться работать на конкретном веб-сайте, которые будут сохранены как <strong>навыки и пресеты</strong> для повторного использования в будущем." }, "page2": { "title": "Как запустить режим обучения?", "description": "Для начала нажмите кнопку '<strong>Режим обучения</strong>' на панели '<strong>Интеллект</strong>' слева. Перед началом установите <strong>Цель обучения</strong>, которая даст ОС начальную инструкцию и предоставит вам чёткую задачу для выполнения." }, "page3": { "title": "Как ОС изучает ваши действия?", "description": "Пока вы обучаете, ОС наблюдает за вашими действиями и отслеживает курсор в реальном времени. Вы увидите каждый шаг, записанный на левой панели — приостановите в любое время и нажмите красный значок '<strong>Стоп</strong>', когда закончите." }, "page4": { "title": "Каковы результаты обучения ОС?", "description": "После завершения обучения выберите тип результата, который хотите создать. Обычно для рутинных задач создаются пресет и связанные навыки. После создания вы можете просмотреть и отредактировать их в <strong>Композиторе</strong> или получить к ним доступ в любое время в папке '<strong>Обучение от пользователя</strong>' на панели '<strong>Интеллект</strong>'." } } };
const sidebar$5 = { "goBack": "Назад", "goForward": "Вперёд", "lockSidebar": "Закрепить боковую панель", "unlockSidebar": "Открепить боковую панель", "searchOrEnterAddress": "Поиск или ввод адреса", "reload": "Перезагрузить" };
const tabs$5 = { "openNewBlankPage": "Открыть новую пустую страницу", "newTab": "Новая вкладка", "terminal": "Терминал", "pauseAgent": "Приостановить агента", "resumeAgent": "Продолжить агента" };
const userMenu$5 = { "upgrade": "Обновить", "creditsLeft": "осталось", "clickToManageSubscription": "Нажмите для управления подпиской", "theme": "Тема", "lightMode": "Светлый режим", "darkMode": "Тёмный режим", "systemMode": "Системный режим", "language": "Язык", "settings": "Настройки", "invitationCode": "Пригласительный код", "checkUpdates": "Проверить обновления", "contactUs": "Связаться с нами", "signOut": "Выйти", "openUserMenu": "Открыть меню пользователя", "signIn": "Войти" };
const settings$5 = { "title": "Настройки", "history": "История", "downloads": "Загрузки", "adblock": "Блокировщик рекламы", "language": "Язык", "languageDescription": "Выберите предпочитаемый язык интерфейса. Изменения вступают в силу немедленно.", "softwareUpdate": "Обновление ПО" };
const updateSettings$5 = { "description": "Flowith OS поддерживает вас в курсе с безопасными и надёжными обновлениями. Выберите канал: Stable для надёжности, Beta для ранних функций или Alpha для передовых сборок. Вы можете переключаться только на каналы, к которым имеете доступ.", "currentVersion": "Текущая версия: {{version}}", "loadError": "Не удалось загрузить", "warning": "Внимание: сборки Beta/Alpha могут быть нестабильными и влиять на вашу работу. Используйте Stable для продакшена.", "channel": { "label": "Канал обновлений", "hint": "Можно выбрать только каналы, к которым у вас есть доступ.", "disabledHint": "Нельзя переключать каналы во время выполнения обновления", "options": { "stable": "Стабильный", "beta": "Бета", "alpha": "Альфа" } }, "actions": { "title": "Ручная проверка", "hint": "Проверить наличие доступных обновлений.", "check": "Проверить обновления" }, "status": { "noUpdate": "У вас актуальная версия.", "hasUpdate": "Доступна новая версия.", "error": "Не удалось проверить обновления." }, "tips": { "title": "Советы", "default": "По умолчанию вы получаете уведомления о стабильных обновлениях. В раннем доступе предварительные сборки могут быть нестабильными для продакшена.", "warningTitle": "Внимание: ночные обновления применяются автоматически", "warningBody": "Ночные сборки будут автоматически загружаться и устанавливать обновления без запроса при закрытии Cursor." } };
const adblock$5 = { "title": "Блокировщик рекламы", "description": "Блокируйте навязчивую рекламу и трекеры, фильтруйте шум на странице, позволяя агенту Neo OS понимать и извлекать информацию точнее, защищая вашу конфиденциальность.", "enable": "Включить блокировщик рекламы", "enableDescription": "Автоматически блокировать рекламу на всех сайтах", "statusActive": "Активен - реклама блокируется", "statusInactive": "Неактивен - реклама не блокируется", "adsBlocked": "реклама заблокирована", "networkBlocked": "Сетевые запросы", "cosmeticBlocked": "Элементы скрыты", "filterRules": "Правила фильтрации", "activeRules": "активных правил" };
const blank$5 = { "openNewPage": "Открыть новую пустую страницу", "selectBackground": "Выбрать фон", "isAwake": "проснулась", "osIsAwake": "ОС проснулась", "osGuideline": "Руководство ОС", "osGuidelineDescription": "Быстрый старт с нашим агентом ОС - архитектура, режимы и всё, что он может делать.", "intelligence": "Режим обучения", "intelligenceDescription": "Обучите агента ОС выполнять задачи и повторно использовать их позже.", "inviteAndEarn": "Приглашай и зарабатывай", "tagline": "С активной памятью, которая развивается с каждым действием и по-настоящему понимает вас.", "taskPreset": "Пресет задачи", "credits": "+{{amount}} кредитов", "addPreset": "Добавить новый пресет", "editPreset": "Редактировать пресет", "deletePreset": "Удалить пресет", "removeFromHistory": "Удалить из истории", "previousPreset": "Предыдущий пресет", "nextPreset": "Следующий пресет", "previousPresets": "Предыдущие пресеты", "nextPresets": "Следующие пресеты", "createPreset": "Создать пресет", "presetName": "Название пресета", "instruction": "Инструкция", "presetNamePlaceholderCreate": "Например: Еженедельный отчёт, Проверка кода, Анализ данных...", "presetNamePlaceholderEdit": "Введите название пресета...", "instructionPlaceholderCreate": 'Опишите, что вы хотите, чтобы ОС делала...\nНапример: "Проанализируй данные о продажах за эту неделю и создай сводный отчёт"', "instructionPlaceholderEdit": "Обновите инструкцию для задачи...", "colorBlue": "Синий", "colorGreen": "Зелёный", "colorYellow": "Жёлтый", "colorRed": "Красный", "selectColor": "Выбрать {{color}} цвет", "creating": "Создание...", "updating": "Обновление...", "create": "Создать", "update": "Обновить", "smartInputPlaceholder": "Навигация, поиск или позвольте Neo взять управление...", "processing": "Обработка…", "navigate": "Перейти", "navigateDescription": "Открыть этот адрес в текущей вкладке", "searchGoogle": "Поиск в Google", "searchGoogleDescription": "Искать с помощью Google", "runTask": "Запустить задачу", "runTaskDescription": "Выполнить с помощью агента Neo", "createCanvas": "Спросить на холсте", "createCanvasDescription": "Открыть холст Flo с этим промптом" };
const agentGuide$5 = { "title": "Руководство агента", "subtitle": "Визуальное руководство по агенту ОС: архитектура, режимы и всё, что он может делать.", "capabilities": { "heading": "Возможности", "navigate": { "title": "Навигация", "desc": "Открывать страницы, назад/вперёд" }, "click": { "title": "Клик", "desc": "Взаимодействие с кнопками и ссылками" }, "type": { "title": "Ввод", "desc": "Заполнение полей и форм" }, "keys": { "title": "Клавиши", "desc": "Enter, Escape, сочетания" }, "scroll": { "title": "Прокрутка", "desc": "Перемещение по длинным страницам" }, "tabs": { "title": "Вкладки", "desc": "Отметка, переключение, закрытие" }, "files": { "title": "Файлы", "desc": "Запись, чтение, загрузка" }, "skills": { "title": "Навыки", "desc": "Общие знания" }, "memories": { "title": "Память", "desc": "Долгосрочные предпочтения" }, "upload": { "title": "Загрузка", "desc": "Отправка файлов на страницы" }, "ask": { "title": "Вопрос", "desc": "Быстрые подтверждения от пользователя" }, "onlineSearch": { "title": "Поиск онлайн", "desc": "Быстрый веб-поиск" }, "extract": { "title": "Извлечение", "desc": "Получение структурированной информации" }, "deepThink": { "title": "Глубокое мышление", "desc": "Структурированный анализ" }, "vision": { "title": "Видение", "desc": "Точные операции вне DOM" }, "shell": { "title": "Оболочка", "desc": "Выполнение команд (когда доступно)" }, "report": { "title": "Отчёт", "desc": "Завершение и подведение итогов" } }, "benchmark": { "title": "Тест Online-Mind2Web", "subtitle": "Flowith Neo AgentOS доминирует на всех позициях: ", "subtitleHighlight": "Практически идеальная", "subtitleEnd": " производительность.", "openai": "OpenAI Operator", "gemini": "Gemini 2.5 Computer Use", "flowith": "Flowith Neo OS", "average": "Средний", "easy": "Лёгкий", "medium": "Средний", "hard": "Сложный" }, "skillsMemories": { "heading": "Навыки и память", "description": "Многоразовые руководства и долгосрочный контекст, на которые Neo автоматически ссылается в режиме Pro.", "markdownTag": "Markdown .md", "autoIndexedTag": "Автоиндексация", "citationsTag": "Ссылки в логах", "howNeoUses": "Как Neo их использует: перед каждым шагом в режиме Pro Neo проверяет соответствующие навыки и память, объединяет их в контекст рассуждений и автоматически применяет инструкции или предпочтения.", "skillsTitle": "Навыки", "skillsTag": "Общие", "skillsDesc": "Храните многоразовые знания, которые может применять любой агент. Каждый навык - это краткое руководство об инструменте, рабочем процессе или шаблоне.", "skillsProcedures": "Лучше всего для: процедур", "skillsFormat": "Формат: Markdown", "skillsScenario": "Повседневный сценарий", "skillsScenarioTitle": "Конвертация и обмен медиа", "skillsStep1": 'Вы говорите: "Преобразуй эти 20 изображений в компактный PDF."', "skillsStep2": "Neo следует навыку для загрузки, конвертации, ожидания завершения и сохранения файла.", "skillsOutcome": "Результат: готовый PDF со ссылкой для скачивания в логах.", "memoriesTitle": "Память", "memoriesTag": "Личная", "memoriesDesc": "Фиксируйте свои предпочтения, профиль и факты домена. Neo ссылается на соответствующие элементы при принятии решений и цитирует их в логах.", "memoriesStyle": "Лучше всего для: стиля, правил", "memoriesPrivate": "По умолчанию приватная", "memoriesScenario": "Повседневный сценарий", "memoriesScenarioTitle": "Голос и тон письма", "memoriesStep1": "Вам нравится лаконичный, дружелюбный текст с оптимистичным тоном.", "memoriesStep2": "Neo применяет это во всех письмах, отчётах и постах в соцсетях автоматически.", "memoriesOutcome": "Результат: последовательный голос бренда без повторения инструкций.", "taskFilesTitle": "Файлы задачи", "taskFilesTag": "Для задачи", "taskFilesDesc": "Временные файлы, созданные во время текущей задачи. Они облегчают ввод/вывод инструментов и промежуточные результаты и не передаются автоматически другим задачам.", "taskFilesEphemeral": "Временные", "taskFilesReadable": "Читаемые инструментами", "taskFilesScenario": "Повседневный сценарий", "taskFilesScenarioTitle": "Трекер цен на поездки", "taskFilesStep1": "Neo парсит таблицы рейсов и сохраняет их как CSV для этой задачи.", "taskFilesStep2": "Сравнивает сегодняшние тарифы со вчерашними и выделяет изменения.", "taskFilesOutcome": "Результат: аккуратная сводка и загружаемый CSV." }, "system": { "title": "Neo OS - самый умный браузерный агент для вас", "tagline": "Саморазвитие × Память и навыки × Скорость и интеллект", "selfEvolving": "Саморазвитие", "intelligence": "Интеллект", "contextImprovement": "Улучшение контекста", "contextDesc": "Рефлексивный агент уточняет контекст в реальном времени через систему навыков", "onlineRL": "Онлайн-обучение", "onlineRLDesc": "Периодические обновления соответствуют поведению агента", "intelligentMemory": "Интеллектуальная память", "architecture": "Архитектура", "dualLayer": "Двухуровневая система", "dualLayerDesc": "Краткосрочные буферы + долгосрочная эпизодическая память", "knowledgeTransfer": "Передача знаний", "knowledgeTransferDesc": "Сохранение, повторное использование и передача обучения между задачами", "highPerformance": "Высокая производительность", "infrastructure": "Инфраструктура", "executionKernel": "Ядро выполнения", "executionKernelDesc": "Параллельная оркестрация и динамическое планирование", "speedCaching": "Кэширование скорости", "speedCachingDesc": "Миллисекундный ответ с выполнением в реальном времени", "speedIndicator": "~1мс", "summary": "Развивающийся · Устойчивый · Быстрый" }, "arch": { "heading": "Архитектура", "subtitle": "ОС, ориентированная на агентов: CPU (планировщик) + Память/Файловая система + Навыки + Ввод/Вывод", "agentCentricNote": "flowithOS разработана для агентов.", "osShell": "Оболочка ОС", "agentCore": "Ядро агента", "plannerExecutor": "Планировщик · Исполнитель", "browserTabs": "Вкладки браузера", "domCanvas": "DOM · Холст", "filesMemoriesSkills": "Файлы · Память · Навыки", "domPageTabs": "DOM · Страница · Вкладки", "clickTypeScroll": "Клик · Ввод · Прокрутка", "visionNonDOM": "Видение · Операции вне DOM", "captchaDrag": "CAPTCHA · Перетаскивание", "onlineSearchThinking": "Онлайн-поиск · Глубокое мышление", "googleAnalysis": "google · анализ", "askUserReport": "Запрос пользователю · Отчёт", "choicesDoneReport": "выборы · готово_и_отчёт", "skillsApps": "Навыки (приложения)", "skillsKinds": "Система · Пользователь · Общие", "memory": "Память", "memoryKinds": "Краткосрочная · Долгосрочная", "filesystem": "Файловая система", "filesystemKinds": "Файлы задач · Ресурсы · Логи", "cpuTitle": "CPU — Агент планирования", "cpuSub": "Планировщик · Исполнитель · Рефлектор", "planRow": "План → Декомпозиция → Маршрутизация", "execRow": "Выполнение → Наблюдение → Рефлексия", "ioTitle": "Возможности ввода/вывода", "browserUse": "Использование браузера", "browserUseDesc": "DOM · Вкладки · Видение · CAPTCHA", "terminalUse": "Использование терминала", "terminalUseDesc": "Оболочка · Инструменты · Скрипты", "scriptUse": "Использование скриптов", "scriptUseDesc": "Python · JS · Workers", "osVsHumanTitle": "ОС для агентов против ОС для людей", "osVsHuman1": "Приложения становятся навыками: разработаны для чтения агентами, а не UI", "osVsHuman2": "CPU планирует/выполняет через ввод/вывод; пользователь контролирует на уровне задач", "osVsHuman3": "Память сохраняется между задачами; файловая система поддерживает ввод/вывод инструментов" }, "tips": { "heading": "Советы", "beta": "FlowithOS сейчас в бета-версии; продукт и агент Neo постоянно обновляются. Следите за последними обновлениями.", "improving": "Возможности агента Neo OS улучшаются день ото дня, вы можете попробовать использовать новые возможности для выполнения своих задач." } };
const reward$5 = { "helloWorld": "Привет, мир", "helloWorldDesc": 'Это ваш момент "Hello World" в новой эре.<br />Станьте одним из первых, кто оставит след в интернете агентов в истории человечества.', "get2000Credits": "Получите 2 000 бонусных кредитов", "equivalent7Days": "И автоматизируйте работу в соцсетях на 7 дней.", "shareInstructions": `После активации представьте своего личного агента миру.<br />NeoOS автоматически создаст и опубликует пост "Hello World" в X за вас<br />точно так же, как он сможет делать для вас что угодно позже.<br /><span style='display: block; height: 8px;'></span>Просто откиньтесь и наблюдайте.`, "osComing": "ОС приближается", "awakeOS": "Активировать ОС", "page2Title": "Приглашай и зарабатывай", "page2Description1": "Великое путешествие лучше совершать с компанией.", "page2Description2": "За каждого присоединившегося друга вы получите", "page2Description3": "кредитов для реализации своих идей.", "retry": "Повторить", "noCodesYet": "Пригласительных кодов пока нет", "activated": "Активировано", "neoStarting": "Neo запускает задачу автопубликации...", "failed": "Не удалось", "unknownError": "Неизвестная ошибка", "errorRetry": "Произошла ошибка, попробуйте снова", "unexpectedResponse": "Неожиданный ответ от сервера", "failedToLoadCodes": "Не удалось загрузить пригласительные коды", "congratsCredits": "Поздравляем! +{{amount}} кредитов", "rewardUnlocked": "Награда за публикацию разблокирована" };
const agentWidget$5 = { "modes": { "fast": { "label": "Быстрый режим", "description": "Выполнять задачи максимально быстро, не будет использовать навыки и память.", "short": "Быстрый", "modeDescription": "Быстрые действия, меньше деталей" }, "pro": { "label": "Режим Pro", "description": "Максимальное качество: пошаговый визуальный анализ с глубоким рассуждением. Использует навыки и память по необходимости.", "short": "Pro", "modeDescription": "Сбалансированный, пусть Neo решает" } }, "minimize": "Свернуть", "placeholder": "Попросите агента Neo OS...", "changeModeTooltip": "Измените режим, чтобы настроить поведение агента", "preset": "Пресет", "selectPresetTooltip": "Выберите пресет для использования", "addNewPreset": "Добавить новый пресет", "agentHistoryTooltip": "История действий агента", "createPreset": "Создать пресет", "presetName": "Название пресета", "instruction": "Инструкция", "upload": "Загрузить", "newTask": "Новая задача", "draft": "Черновик", "copyPrompt": "Копировать промпт", "showMore": "Показать больше", "showLess": "Показать меньше", "agentIsWorking": "Агент работает", "agentIsWrappingUp": "Агент завершает работу", "completed": "Завершено", "paused": "Приостановлено", "created": "Создано", "selectTask": "Выберите задачу", "unpin": "Открепить", "pinToRight": "Закрепить справа", "stepsCount": "Шаги ({{count}})", "files": "Файлы", "filesCount": "Файлы ({{count}})", "noFilesYet": "Файлы ещё не созданы", "status": { "wrappingUp": "Агент завершает работу...", "thinking": "Агент размышляет...", "wrappingUpAction": "Завершение текущего действия..." }, "actions": { "markedTab": "Отмеченная вкладка", "openRelatedTab": "Открыть связанную вкладку (в разработке)", "open": "Открыть", "openTab": "Открыть вкладку", "showInFolder": "Показать в папке", "preview": "Предпросмотр", "followUpPrefix": "Вы", "actionsHeader": "Действия" }, "controls": { "rerun": "Перезапустить (в разработке)", "pause": "Пауза", "pauseAndArchive": "Пауза и архив", "resume": "Продолжить", "wrappingUpDisabled": "Завершение..." }, "input": { "sending": "Отправка...", "adjustTaskPlaceholder": "Отправьте сообщение, чтобы скорректировать задачу для агента Neo..." }, "legacy": { "readOnlyNotice": "Это устаревшая задача из более ранней версии. Режим только для чтения." }, "refunded": { "noFollowUp": "Эта задача была возвращена. Дополнительные сообщения недоступны." }, "skills": { "matchingSkills": "поиск подходящих навыков…", "scanningSkills": "Нейронное сканирование доступных навыков!!!", "scanningMap": "Сканирование карты навыков…" }, "billing": { "creditsDepletedTitle": "Добавьте кредиты для продолжения", "creditsDepletedMessage": "Агент приостановлен, потому что ваши кредиты исчерпаны. Добавьте кредиты или обновите платёжные данные, затем перезапустите задачу, когда будете готовы." }, "presetActions": { "editPreset": "Редактировать пресет", "deletePreset": "Удалить пресет" }, "feedback": { "success": { "short": "Отличная работа!", "long": "Пока всё хорошо, отличная работа!" }, "refund": { "short": "Упс, возврат!", "long": "Упс, я хочу вернуть свои кредиты!" }, "refundSuccess": { "long": "Отлично! Ваши кредиты возвращены!" }, "modal": { "title": "Запрос возврата кредитов", "credits": "{{count}} кредитов", "description": "Если вас не устраивает эта задача, запросите возврат, и мы мгновенно вернём все кредиты, использованные этой задачей.", "whatGoesWrong": "Что пошло не так", "errorMessage": "Извините, предоставьте больше подробностей", "placeholder": "Опишите, что пошло не так...", "shareTask": "Поделиться этой задачей с нами", "shareDescription": "Мы обезличим все личные данные из вашей задачи. Поделившись задачей с нами, вы поможете нам улучшить производительность агента для подобных задач в будущем.", "upload": "Загрузить", "attachFile": "прикрепить файл", "submit": "Отправить", "submitting": "Отправка...", "alreadyRefunded": { "title": "Уже возвращено", "message": "Эта задача уже была возвращена. Вы не можете запросить возврат снова." } }, "errors": { "systemError": "Системная ошибка. Пожалуйста, свяжитесь с нашей командой для поддержки.", "networkError": "Ошибка сети. Проверьте подключение и попробуйте снова.", "noUsageData": "Данные использования не найдены. Невозможно вернуть.", "alreadyRefunded": "Эта задача уже была возвращена.", "notAuthenticated": "Пожалуйста, войдите, чтобы запросить возврат.", "unknownError": "Произошла непредвиденная ошибка. Попробуйте позже.", "validationFailed": "Невозможно проверить вашу причину сейчас. Попробуйте позже.", "invalidReason": "Причина отклонена. Опишите, что действительно пошло не так." }, "confirmation": { "creditsRefunded": "{{count}} кредитов возвращено", "title": "Успешно", "message": "Спасибо! Наша команда проанализирует вашу задачу и улучшит опыт FlowithOS.", "messageNoShare": "Спасибо! Наша команда продолжит работу и улучшит опыт FlowithOS." } } };
const gate$5 = { "welcome": { "title": "Добро пожаловать в FlowithOS", "subtitle": "От веба к миру — FlowithOS превращает ваш браузер в источник реальных ценностей. Самая умная агентная операционная система.", "features": { "execute": { "title": "Выполняйте любые задачи автоматически", "description": "FlowithOS действует с человеческой интуицией и машинной скоростью, выполняя множество задач в интернете снова и снова." }, "transform": { "title": "Превращайте идеи в результат", "description": "От вдохновения до реальной ценности — FlowithOS превращает большие идеи в конкретные действия, приносящие измеримые результаты." }, "organize": { "title": "Организуйте активы системно", "description": "От разрозненных закладок до структурированных руководств — FlowithOS даёт вам надёжную систему для управления, курирования и масштабирования цифровых активов." }, "evolve": { "title": "Развивайтесь вместе динамично", "description": "С памятью, растущей с каждым взаимодействием, FlowithOS создаёт персональные навыки — от навигации по сложным сайтам до понимания вашего индивидуального стиля." } }, "letsGo": "Поехали!" }, "auth": { "createAccount": "Создать аккаунт", "signInToFlowith": "Войти в аккаунт flowith", "oneAccount": "Один аккаунт для всех продуктов flowith", "fromAnotherAccount": "Войти через:", "useOwnEmail": "Или используйте свою почту", "email": "Email", "password": "Пароль", "confirmPassword": "Подтвердите пароль", "acceptTerms": "Я принимаю Условия использования и Политику конфиденциальности FlowithOS", "privacyNote": "Все ваши данные на 100% защищены на вашем устройстве", "alreadyHaveAccount": "Уже есть аккаунт Flowith?", "createNewAccount": "Нет аккаунта? Зарегистрироваться", "signUp": "Зарегистрироваться", "signIn": "Войти", "processing": "Обработка...", "verifyEmail": "Подтвердите ваш email", "verificationCodeSent": "Мы отправили 6-значный код подтверждения на {{email}}", "enterVerificationCode": "Введите код подтверждения", "verificationCode": "Код подтверждения", "enterSixDigitCode": "Введите 6-значный код", "backToSignUp": "Вернуться к регистрации", "verifying": "Проверка...", "verifyCode": "Подтвердить код", "errors": { "enterEmail": "Пожалуйста, введите ваш email", "enterPassword": "Пожалуйста, введите ваш пароль", "confirmPassword": "Пожалуйста, подтвердите ваш пароль", "passwordsDoNotMatch": "Пароли не совпадают", "acceptTerms": "Пожалуйста, примите Условия использования и Политику конфиденциальности", "authFailed": "Аутентификация не удалась. Попробуйте снова.", "invalidVerificationCode": "Пожалуйста, введите действительный 6-значный код подтверждения", "verificationFailed": "Проверка не удалась. Попробуйте снова.", "oauthFailed": "OAuth-аутентификация не удалась. Попробуйте снова.", "userAlreadyExists": "Этот email уже зарегистрирован. Пожалуйста, " }, "goToLogin": "войдите", "signInPrompt": "войти" }, "invitation": { "title": "Для пробуждения нужен ключ", "subtitle": "Пожалуйста, введите пригласительный код, чтобы разблокировать FlowithOS", "lookingForInvite": "Ищете приглашение?", "followOnX": "Подпишитесь на @flowith в X", "toGetAccess": "чтобы получить доступ.", "placeholder": "Мой пригласительный код", "invalidCode": "Недействительный пригласительный код", "verificationFailed": "Проверка не удалась — попробуйте снова", "accessGranted": "Доступ предоставлен", "initializing": "Добро пожаловать в FlowithOS. Инициализация..." }, "browserImport": { "title": "Продолжи с того места, где остановился", "subtitle": "Легко импортируй закладки и сохранённые сессии из своих текущих браузеров.", "detecting": "Обнаружение установленных браузеров...", "noBrowsers": "Установленные браузеры не обнаружены", "imported": "Импортировано", "importing": "Импорт...", "bookmarks": "закладок", "importNote": "Импорт занимает около 5 секунд. Вы увидите одно или два системных уведомления.", "skipForNow": "Пропустить пока", "nextStep": "Следующий шаг" }, "settings": { "title": "Готов к потоку?", "subtitle": "Несколько быстрых настроек для идеального опыта Flowith OS.", "defaultBrowser": { "title": "Установить браузером по умолчанию", "description": "Пусть веб течёт к вам. Ссылки будут открываться напрямую в FlowithOS, плавно вплетая онлайн-контент в ваше рабочее пространство." }, "addToDock": { "title": "Добавить в Dock / Панель задач", "description": "Держите ваш творческий центр в одном клике для мгновенного доступа, когда придёт вдохновение." }, "launchAtStartup": { "title": "Запускать при старте", "description": "Начинайте день готовым к творчеству. Flowith OS будет ждать вас в момент входа в систему." }, "helpImprove": { "title": "Помогите нам улучшиться", "description": "Делитесь анонимными данными об использовании, чтобы помочь нам создать лучший продукт для всех.", "privacyNote": "Ваша конфиденциальность полностью защищена." }, "canChangeSettingsLater": "Вы можете изменить эти настройки позже", "nextStep": "Следующий шаг", "privacy": { "title": "100% локальное хранилище и защита конфиденциальности", "description": "История выполнения агента, история просмотров, память и навыки, учётные данные и все данные конфиденциальности хранятся на 100% локально на вашем устройстве. Ничего не синхронизируется с облачными серверами. Вы можете использовать FlowithOS с полным спокойствием." } }, "examples": { "title1": "ОС проснулась.", "title2": "Увидьте её в действии.", "subtitle": "Начните с примера, чтобы увидеть, как это работает.", "enterFlowithOS": "Войти в FlowithOS", "clickToReplay": "нажмите, чтобы повторить этот кейс", "videoNotSupported": "Ваш браузер не поддерживает воспроизведение видео.", "cases": { "shopping": { "title": "Завершите праздничные покупки в 10 раз быстрее", "description": "Заполняет корзину идеальным набором подарков для щенка — экономя более 2 часов ручного поиска." }, "contentEngine": { "title": "Круглосуточный контент-движок для X", "description": "Находит топовые истории Hacker News, пишет вашим уникальным стилем и автоматически публикует в X. Увеличивает просмотры профиля в 3 раза и способствует органичному росту сообщества." }, "tiktok": { "title1": "TikTok Hype Generator: 500+ вовлечений,", "title2": "0 усилий", "description": "Flowith OS заполняет популярные прямые эфиры яркими комментариями, превращая цифровое присутствие в измеримый рост." }, "youtube": { "title": "95% автономный рост YouTube-канала", "description": "Flowith OS оптимизирует весь процесс создания безличного YouTube-канала — от контента до аудитории, сжимая недели работы в менее чем час." } } }, "oauth": { "connecting": "Подключение к {{provider}}", "completeInBrowser": "Пожалуйста, завершите аутентификацию во вкладке браузера, которая только что открылась.", "cancel": "Отмена" }, "terms": { "title": "Условия использования и Политика конфиденциальности", "subtitle": "Пожалуйста, ознакомьтесь с условиями ниже.", "close": "Закрыть" }, "invitationCodes": { "title": "Мои пригласительные коды", "availableToShare": "{{unused}} из {{total}} доступно для передачи", "loading": "Загрузка ваших кодов...", "noCodesYet": "Пригласительных кодов пока нет.", "noCodesFound": "Пригласительные коды не найдены", "failedToLoad": "Не удалось загрузить пригласительные коды", "useCodeHint": "Используйте пригласительный код, чтобы получить свои собственные!", "shareHint": "Поделитесь этими кодами с друзьями, чтобы пригласить их в FlowithOS", "used": "Использован" }, "history": { "title": "История", "searchPlaceholder": "Поиск в истории...", "selectAll": "Выбрать все", "deselectAll": "Отменить выбор", "deleteSelected": "Удалить выбранные ({{count}})", "clearAll": "Очистить все", "loading": "Загрузка истории...", "noMatchingHistory": "Совпадений не найдено", "noHistoryYet": "Истории пока нет", "confirmDelete": "Подтвердить удаление", "deleteConfirmMessage": "Вы уверены, что хотите удалить выбранную историю? Это действие нельзя отменить.", "cancel": "Отмена", "delete": "Удалить", "today": "Сегодня", "yesterday": "Вчера", "earlier": "Ранее", "untitled": "Без названия", "visitedTimes": "Посещено {{count}} раз", "openInNewTab": "Открыть в новой вкладке", "timePeriod": "Период времени", "timeRangeAll": "Все", "timeRangeAllDesc": "Вся история просмотров", "timeRangeToday": "Сегодня", "timeRangeTodayDesc": "Вся история за сегодня", "timeRangeYesterday": "Вчера", "timeRangeYesterdayDesc": "История за вчера", "timeRangeLast7Days": "Последние 7 дней", "timeRangeLast7DaysDesc": "История за прошлую неделю", "timeRangeThisMonth": "Этот месяц", "timeRangeThisMonthDesc": "История за этот месяц", "timeRangeLastMonth": "Прошлый месяц", "timeRangeLastMonthDesc": "История за прошлый месяц", "deleteTimeRange": "Удалить {{range}}" } };
const update$5 = { "checking": { "title": "Проверка обновлений", "description": "Подключение к серверу обновлений..." }, "noUpdate": { "title": "У вас актуальная версия", "currentVersion": "Текущая версия v{{version}}", "description": "Вы уже используете последнюю версию", "close": "Закрыть" }, "available": { "title": "Доступна новая версия", "version": "v{{version}} доступна", "currentVersion": "(Текущая: v{{current}})", "released": "Выпущено {{time}}", "betaNote": "Мы в публичной бета-версии и выпускаем улучшения ежедневно. Обновитесь сейчас, чтобы оставаться в курсе.", "defaultReleaseNotes": "Этот бета-релиз включает улучшения производительности, исправления ошибок и новые функции. Мы выпускаем обновления ежедневно. Обновитесь сейчас для лучшего опыта.", "downloadNow": "Загрузить сейчас", "remindLater": "Напомнить позже", "preparing": "Подготовка..." }, "downloading": { "title": "Загрузка обновления", "version": "Загрузка v{{version}}", "progress": "Прогресс загрузки", "hint": "Вы можете открыть загруженный установщик, нажав кнопку ниже" }, "readyToInstall": { "title": "Готово к установке", "downloaded": "v{{version}} загружена", "hint": "Перезапустите, чтобы завершить установку обновления", "restartNow": "Перезапустить сейчас", "restartLater": "Перезапустить позже", "restarting": "Перезапуск..." }, "error": { "title": "Проверка обновлений не удалась", "default": "Обновление не удалось. Попробуйте позже.", "downloadFailed": "Загрузка не удалась. Попробуйте позже.", "installFailed": "Установка не удалась. Попробуйте позже.", "close": "Закрыть", "noChannelPermission": "У вашего аккаунта нет доступа к каналу обновлений {{channel}}. Переключитесь на Стабильный и попробуйте снова.", "switchToStable": "Переключиться на Стабильный и повторить" }, "time": { "justNow": "только что", "minutesAgo": "{{count}} минут назад", "hoursAgo": "{{count}} часов назад" }, "notifications": { "newVersionAvailable": "Доступна новая версия {{version}}", "downloadingInBackground": "Загрузка в фоновом режиме", "updateDownloaded": "Обновление загружено", "readyToInstall": "Версия {{version}} готова к установке" } };
const updateToast$5 = { "checking": "Проверка обновлений...", "pleaseWait": "Пожалуйста, подождите", "preparingDownload": "Подготовка к загрузке {{version}}", "downloading": "Загрузка обновления {{version}}", "updateCheckFailed": "Проверка обновлений не удалась", "unknownError": "Неизвестная ошибка", "updatedTo": "Обновлено до v{{version}}", "newVersionReady": "Новая версия готова", "version": "Версия {{version}}", "close": "Закрыть", "gotIt": "Понятно", "installNow": "Перезапустить сейчас", "restarting": "Перезапуск…", "later": "Позже", "collapseUpdateContent": "Свернуть содержимое обновления", "viewUpdateContent": "Просмотреть содержимое обновления", "collapseLog": "Свернуть ^", "viewLog": "Просмотреть лог >", "channelChangeFailed": "Не удалось переключить канал: {{error}}", "channelInfo": "Канал: {{channel}}, Манифест: {{manifest}}", "manualDownloadHint": "Автоматическая установка не удалась? Установите вручную →", "channelDowngraded": { "title": "Канал переключён", "message": "У вашего аккаунта нет доступа к {{previousChannel}}. Автоматически переключено на {{newChannel}}." }, "time": { "justNow": "только что", "minutesAgo": "{{count}} минут назад", "hoursAgo": "{{count}} часов назад", "daysAgo": "{{count}} дней назад", "weeksAgo": "{{count}} недель назад", "monthsAgo": "{{count}} месяцев назад", "yearsAgo": "{{count}} лет назад" } };
const errors$5 = { "auth": { "notLoggedIn": "Пожалуйста, сначала войдите", "loginRequired": "Пожалуйста, войдите перед использованием этой функции", "shareRequiresLogin": "Пожалуйста, войдите перед использованием функции публикации" }, "network": { "networkError": "Ошибка сети — проверьте подключение", "requestTimeout": "Тайм-аут запроса — попробуйте снова", "failedToVerify": "Не удалось проверить доступ", "failedToFetch": "Не удалось получить коды" }, "invitation": { "invalidCode": "Недействительный пригласительный код", "verificationFailed": "Проверка не удалась — попробуйте снова", "failedToConsume": "Не удалось использовать пригласительный код" }, "download": { "downloadFailed": "Загрузка не удалась", "downloadInterrupted": "Загрузка прервана" }, "security": { "secureConnection": "Защищённое подключение", "notSecure": "Не защищено", "localFile": "Локальный файл", "unknownProtocol": "Неизвестный протокол" } };
const menus$5 = { "application": { "about": "О {{appName}}", "checkForUpdates": "Проверить обновления...", "settings": "Настройки...", "services": "Службы", "hide": "Скрыть {{appName}}", "hideOthers": "Скрыть остальные", "showAll": "Показать все", "quit": "Выход", "updateChannel": "Канал обновлений" }, "edit": { "label": "Правка", "undo": "Отменить", "redo": "Повторить", "cut": "Вырезать", "paste": "Вставить", "selectAll": "Выбрать всё" }, "view": { "label": "Вид", "findInPage": "Найти на странице", "newTab": "Новая вкладка", "reopenClosedTab": "Открыть закрытую вкладку", "newTerminalTab": "Новая вкладка терминала", "openLocalFile": "Открыть локальный файл...", "goBack": "Назад", "goForward": "Вперёд", "viewHistory": "Просмотреть историю", "viewDownloads": "Просмотреть загрузки", "archive": "Архив", "reload": "Перезагрузить", "forceReload": "Принудительная перезагрузка", "actualSize": "Реальный размер", "zoomIn": "Увеличить", "zoomOut": "Уменьшить", "toggleFullScreen": "Переключить полноэкранный режим" }, "window": { "label": "Окно", "minimize": "Свернуть", "close": "Закрыть", "bringAllToFront": "Все окна на передний план" }, "help": { "label": "Справка", "about": "О программе", "version": "Версия", "aboutDescription1": "Агентная операционная система AI следующего поколения", "aboutDescription2": "созданная для самосовершенствования, памяти и скорости.", "copyright": "© 2025 Flowith, Inc. Все права защищены." }, "contextMenu": { "back": "Назад", "forward": "Вперёд", "reload": "Перезагрузить", "hardReload": "Жёсткая перезагрузка (игнорировать кэш)", "openLinkInNewTab": "Открыть ссылку в новой вкладке", "openLinkInExternal": "Открыть ссылку во внешнем браузере", "copyLinkAddress": "Копировать адрес ссылки", "downloadLink": "Загрузить ссылку", "openImageInNewTab": "Открыть изображение в новой вкладке", "copyImageAddress": "Копировать адрес изображения", "copyImage": "Копировать изображение", "downloadImage": "Загрузить изображение", "downloadVideo": "Загрузить видео", "downloadAudio": "Загрузить аудио", "openMediaInNewTab": "Открыть медиа в новой вкладке", "copyMediaAddress": "Копировать адрес медиа", "openFrameInNewTab": "Открыть фрейм в новой вкладке", "openInExternal": "Открыть во внешнем браузере", "copyPageURL": "Копировать URL страницы", "viewPageSource": "Просмотреть исходный код страницы (новая вкладка)", "savePageAs": "Сохранить страницу как…", "print": "Печать…", "cut": "Вырезать", "paste": "Вставить", "searchWebFor": 'Искать в интернете "{{text}}"', "selectAll": "Выбрать всё", "inspectElement": "Исследовать элемент", "openDevTools": "Открыть DevTools", "closeDevTools": "Закрыть DevTools" }, "fileDialog": { "openLocalFile": "Открыть локальный файл", "unsupportedFileType": "Неподдерживаемый тип файла", "savePageAs": "Сохранить страницу как", "allSupportedFiles": "Все поддерживаемые файлы", "htmlFiles": "Файлы HTML", "textFiles": "Текстовые файлы", "images": "Изображения", "videos": "Видео", "audio": "Аудио", "pdf": "PDF", "webpageComplete": "Веб-страница, полная", "singleFile": "Один файл (MHTML)" } };
const dialogs$5 = { "crash": { "title": "Ошибка приложения", "message": "Произошла непредвиденная ошибка", "detail": "{{error}}\n\nОшибка записана для целей отладки.", "restart": "Перезапустить", "close": "Закрыть" }, "customBackground": { "title": "Пользовательский фон", "subtitle": "Создайте свой уникальный стиль", "preview": "Предпросмотр", "angle": "Угол", "stops": "Остановки", "selectImage": "Выбрать изображение", "uploading": "Загрузка...", "dropImageHere": "Перетащите изображение сюда", "dragAndDrop": "Перетащите или нажмите", "fileTypes": "PNG, JPG, JPEG, WEBP, SVG, GIF", "fit": "По размеру", "cover": "Заполнить", "contain": "Вместить", "fill": "Растянуть", "remove": "Удалить", "cancel": "Отмена", "apply": "Применить", "gradient": "Градиент", "solid": "Сплошной", "image": "Изображение", "dropImageError": "Пожалуйста, перетащите файл изображения (PNG, JPG, JPEG, WEBP, SVG или GIF)" } };
const humanInput$5 = { "declinedToAnswer": "Пользователь отказался отвечать, вопрос пропущен", "needOneInput": "Требуется 1 ввод для продолжения", "needTwoInputs": "Нужна ваша помощь в 2 вопросах", "needThreeInputs": "Требуется 3 решения от вас", "waitingOnInputs": "Ожидание {{count}} вводов от вас", "declineToAnswer": "Отказаться отвечать", "dropFilesHere": "Перетащите файлы сюда", "typeYourAnswer": "Введите ваш ответ...", "orTypeCustom": "Или введите свой вариант...", "uploadFiles": "Загрузить файлы", "previousQuestion": "Предыдущий вопрос", "goToQuestion": "Перейти к вопросу {{number}}", "nextQuestion": "Следующий вопрос" };
const ru = {
  common: common$5,
  nav: nav$5,
  tray: tray$5,
  actions: actions$5,
  status: status$5,
  time: time$5,
  downloads: downloads$5,
  history: history$5,
  invitationCodes: invitationCodes$5,
  tasks: tasks$5,
  flows: flows$5,
  bookmarks: bookmarks$5,
  conversations: conversations$5,
  intelligence: intelligence$5,
  sidebar: sidebar$5,
  tabs: tabs$5,
  userMenu: userMenu$5,
  settings: settings$5,
  updateSettings: updateSettings$5,
  adblock: adblock$5,
  blank: blank$5,
  agentGuide: agentGuide$5,
  reward: reward$5,
  agentWidget: agentWidget$5,
  gate: gate$5,
  update: update$5,
  updateToast: updateToast$5,
  errors: errors$5,
  menus: menus$5,
  dialogs: dialogs$5,
  humanInput: humanInput$5
};
const common$4 = { "ok": "ตกลง", "cancel": "ยกเลิก", "start": "เริ่ม", "delete": "ลบ", "close": "ปิด", "save": "บันทึก", "search": "ค้นหา", "loading": "กำลังโหลด", "pressEscToClose": "กด ESC เพื่อปิด", "copyUrl": "คัดลอก URL", "copied": "คัดลอกแล้ว", "copy": "คัดลอก", "expand": "ขยาย", "collapse": "ย่อ", "openFlowithWebsite": "เปิดเว็บไซต์ Flowith", "openAgentGuide": "เปิดคู่มือเอเจนต์", "reward": "รางวัล", "closeWindow": "ปิดหน้าต่าง", "minimizeWindow": "ย่อหน้าต่าง", "toggleFullscreen": "สลับเต็มหน้าจอ", "saveEnter": "บันทึก (Enter)", "cancelEsc": "ยกเลิก (Esc)", "time": { "justNow": "เมื่อสักครู่", "minutesAgo": "{{count}} นาทีที่แล้ว", "hoursAgo": "{{count}} ชั่วโมงที่แล้ว", "daysAgo": "{{count}} วันที่แล้ว" } };
const nav$4 = { "tasks": "งาน", "flows": "เวิร์กโฟลว์", "bookmarks": "บุ๊กมาร์ก", "intelligence": "ปัญญา", "guide": "คู่มือ" };
const tray$4 = { "newTask": "งานใหม่", "recentTasks": "งานล่าสุด", "viewMore": "ดูเพิ่มเติม", "showMainWindow": "แสดงหน้าต่างหลัก", "hideMainWindow": "ซ่อนหน้าต่างหลัก", "quit": "ออก" };
const actions$4 = { "resume": "ดำเนินการต่อ", "pause": "หยุดชั่วคราว", "cancel": "ยกเลิก", "delete": "ลบ", "archive": "เก็บถาวร", "showInFolder": "แสดงในโฟลเดอร์", "viewDetails": "ดูรายละเอียด", "openFile": "เปิดไฟล์" };
const status$4 = { "inProgress": "กำลังดำเนินการ", "completed": "เสร็จสมบูรณ์", "archive": "เก็บถาวร", "paused": "หยุดชั่วคราว", "failed": "ล้มเหลว", "cancelled": "ยกเลิกแล้ว", "running": "กำลังทำงาน", "wrappingUp": "กำลังจัดการสรุป..." };
const time$4 = { "today": "วันนี้", "yesterday": "เมื่อวาน", "earlier": "ก่อนหน้า" };
const downloads$4 = { "title": "ดาวน์โหลด", "all": "ทั้งหมด", "inProgress": "กำลังดำเนินการ", "completed": "เสร็จสมบูรณ์", "noDownloads": "ไม่มีการดาวน์โหลด", "failedToLoad": "โหลดรายการดาวน์โหลดล้มเหลว", "deleteConfirmMessage": "คุณแน่ใจหรือไม่ว่าต้องการลบรายการที่เลือก? การดำเนินการนี้ไม่สามารถย้อนกลับได้", "loadingDownloads": "กำลังโหลด...", "searchPlaceholder": "ค้นหาการดาวน์โหลด...", "selectAll": "เลือกทั้งหมด", "deselectAll": "ยกเลิกการเลือก", "deleteSelected": "ลบที่เลือก ({{count}})", "clearAll": "ล้างทั้งหมด", "noMatchingDownloads": "ไม่พบการดาวน์โหลดที่ตรงกัน", "noDownloadsYet": "ยังไม่มีการดาวน์โหลด", "confirmDelete": "ยืนยันการลบ", "cancel": "ยกเลิก", "delete": "ลบ" };
const history$4 = { "title": "ประวัติ", "allTime": "ทุกช่วงเวลา", "clearHistory": "ล้างประวัติ", "removeItem": "ลบรายการ", "failedToLoad": "โหลดประวัติล้มเหลว", "failedToClear": "ล้างประวัติล้มเหลว", "searchPlaceholder": "ค้นหาประวัติ...", "selectAll": "เลือกทั้งหมด", "deselectAll": "ยกเลิกการเลือก", "deleteSelected": "ลบที่เลือก ({{count}})", "clearAll": "ล้างทั้งหมด", "noMatchingHistory": "ไม่พบประวัติที่ตรงกัน", "noHistoryYet": "ยังไม่มีประวัติ", "confirmDelete": "ยืนยันการลบ", "deleteConfirmMessage": "คุณแน่ใจหรือไม่ว่าต้องการลบประวัติที่เลือก? การดำเนินการนี้ไม่สามารถย้อนกลับได้", "cancel": "ยกเลิก", "delete": "ลบ", "today": "วันนี้", "yesterday": "เมื่อวาน", "earlier": "ก่อนหน้า", "untitled": "ไม่มีชื่อ", "visitedTimes": "เยี่ยมชม {{count}} ครั้ง", "openInNewTab": "เปิดในแท็บใหม่", "loading": "กำลังโหลด...", "timePeriod": "ช่วงเวลา", "timeRangeAll": "ทั้งหมด", "timeRangeAllDesc": "ประวัติการเรียกดูทั้งหมด", "timeRangeToday": "วันนี้", "timeRangeTodayDesc": "ประวัติทั้งหมดของวันนี้", "timeRangeYesterday": "เมื่อวาน", "timeRangeYesterdayDesc": "ประวัติจากเมื่อวาน", "timeRangeLast7Days": "7 วันที่ผ่านมา", "timeRangeLast7DaysDesc": "ประวัติจากสัปดาห์ที่ผ่านมา", "timeRangeThisMonth": "เดือนนี้", "timeRangeThisMonthDesc": "ประวัติของเดือนนี้", "timeRangeLastMonth": "เดือนที่แล้ว", "timeRangeLastMonthDesc": "ประวัติจากเดือนที่แล้ว", "deleteTimeRange": "ลบ{{range}}", "last7days": "7 วันที่ผ่านมา", "thisMonth": "เดือนนี้", "lastMonth": "เดือนที่แล้ว" };
const invitationCodes$4 = { "title": "รหัสเชิญของฉัน", "availableToShare": "{{unused}} จาก {{total}} พร้อมแชร์", "loading": "กำลังโหลด...", "noCodesYet": "ยังไม่มีรหัสเชิญ", "noCodesFound": "ไม่พบรหัสเชิญ", "failedToLoad": "โหลดรหัสเชิญล้มเหลว", "useCodeHint": "ใช้รหัสเชิญเพื่อรับรหัสของคุณเอง!", "shareHint": "แชร์รหัสเหล่านี้กับเพื่อนเพื่อเชิญพวกเขาเข้าสู่ FlowithOS", "used": "ใช้แล้ว" };
const tasks$4 = { "title": "งาน", "description": "จัดการงานทั้งหมดของคุณ", "transformToPreset": "แปลงเป็นเทมเพลต", "noTasks": "ไม่มีงาน", "archiveEmpty": "เก็บถาวรว่างเปล่า" };
const flows$4 = { "title": "เวิร์กโฟลว์", "description": "แสดงแคนวาสทั้งหมดของคุณ", "newFlow": "เวิร์กโฟลว์ใหม่", "rename": "เปลี่ยนชื่อ", "leave": "ออก", "noFlows": "ไม่มีเวิร์กโฟลว์", "signInToViewFlows": "เข้าสู่ระบบเพื่อดูเวิร์กโฟลว์ของคุณ", "pin": "ปักหมุด", "unpin": "เลิกปักหมุด" };
const bookmarks$4 = { "title": "บุ๊กมาร์ก", "description": "คุณสามารถบันทึกแท็บที่คุณชอบได้", "bookmark": "บุ๊กมาร์ก", "addNewCollection": "เพิ่มคอลเลกชันใหม่", "loadingBookmarks": "กำลังโหลดบุ๊กมาร์ก...", "noMatchingBookmarks": "ไม่พบบุ๊กมาร์กที่ตรงกัน", "noBookmarksYet": "ยังไม่มีบุ๊กมาร์ก", "importFromBrowsers": "นำเข้าจากเบราว์เซอร์", "detectingBrowsers": "กำลังตรวจหาเบราว์เซอร์...", "bookmarksCount": "บุ๊กมาร์ก", "deleteCollection": "ลบคอลเลกชัน", "deleteCollectionConfirm": "คุณแน่ใจหรือไม่ว่าต้องการลบคอลเลกชันนี้?", "newCollection": "คอลเลกชันใหม่", "enterCollectionName": "ป้อนชื่อคอลเลกชัน", "create": "สร้าง", "collectionName": "ชื่อคอลเลกชัน", "saveEnter": "บันทึก (Enter)", "cancelEsc": "ยกเลิก (Esc)", "renameFolder": "เปลี่ยนชื่อโฟลเดอร์", "renameBookmark": "เปลี่ยนชื่อบุ๊กมาร์ก", "deleteFolder": "ลบโฟลเดอร์", "deleteBookmark": "ลบบุ๊กมาร์ก" };
const conversations$4 = { "title": "บทสนทนา", "noConversations": "ยังไม่มีบทสนทนา" };
const intelligence$4 = { "title": "ปัญญา", "description": "พัฒนาเอเจนต์ด้วยทักษะและความทรงจำ", "knowledgeBase": "ฐานความรู้", "memory": "ความทรงจำ", "skill": "ทักษะ", "createNewSkill": "สร้างทักษะใหม่", "createNewMemory": "สร้างความทรงจำใหม่", "loading": "กำลังโหลด...", "noSkills": "ไม่มีทักษะ", "noMemories": "ไม่มีความทรงจำ", "readOnly": "อ่านอย่างเดียว", "readOnlyMessage": "นี่คือทักษะระบบในตัวที่ช่วยให้เอเจนต์ของคุณทำงานได้ดีขึ้น ไม่สามารถแก้ไขโดยตรงได้ แต่คุณสามารถทำสำเนาและแก้ไขเวอร์ชันของคุณเองได้ การแก้ไขหลังเปิดจะไม่ถูกบันทึก โปรดทราบ", "readOnlyToast": "นี่คือทักษะระบบในตัวที่ช่วยให้เอเจนต์ของคุณทำงานได้ดีขึ้น ไม่สามารถแก้ไขโดยตรงได้ แต่คุณสามารถทำสำเนาและแก้ไขเวอร์ชันของคุณเองได้", "open": "เปิด", "kbComingSoon": "การสนับสนุนฐานความรู้ Flowith กำลังจะมาเร็วๆ นี้", "system": "ระบบ", "learnFromUser": "ผู้ใช้", "systemPresetReadOnly": "เทมเพลตระบบ (อ่านอย่างเดียว)", "actions": "การกระทำ", "rename": "เปลี่ยนชื่อ", "duplicate": "ทำสำเนา…", "info": "ข้อมูล", "saving": "กำลังบันทึก...", "fileInfo": "ข้อมูลไฟล์", "fileName": "ชื่อ", "fileSize": "ขนาด", "fileCreated": "สร้างเมื่อ", "fileModified": "แก้ไขเมื่อ", "fileType": "ประเภท", "fileLocation": "ตำแหน่ง", "copyPath": "คัดลอกเส้นทาง", "empowerOS": "โหมดสอน", "teachMakesBetter": "การสอนทำให้ OS ดีขึ้น", "teachMode": "โหมดสอน", "teachModeDescription": "ในโหมดสอน คุณสามารถบันทึกเวิร์กโฟลว์และขั้นตอนการทำงานบนเว็บของคุณ ขณะที่ OS Agent จะเฝ้าดู เรียนรู้ และกลั่นกรองเป็นทักษะและความรู้ที่นำกลับมาใช้ใหม่ได้", "teachModeGoalLabel": "เป้าหมายงาน (ไม่บังคับ)", "teachModeGoalPlaceholder": "ให้บริบทเพิ่มเติมเพื่อให้ OS เรียนรู้ — อาจเป็นเป้าหมายงานที่เฉพาะเจาะจงหรือข้อมูลที่เกี่ยวข้อง", "teachModeTaskDisabled": "งานใหม่ถูกปิดใช้งานในขณะที่คุณอยู่ในโหมดสอน", "empowering": "กำลังสอน", "empoweringDescription": "OS Agent จะเฝ้าดูและเรียนรู้ขณะที่คุณสาธิต", "yourGoal": "เป้าหมายงาน", "preset": "เทมเพลต", "generatedSkills": "ทักษะที่สร้างขึ้น", "showLess": "ซ่อน", "showMore": "แสดงเพิ่มเติม", "osHasLearned": "OS ได้เรียนรู้", "complete": "เสร็จสมบูรณ์", "interactionsPlaceholder": "การโต้ตอบจะปรากฏที่นี่ขณะที่คุณสาธิตเวิร์กโฟลว์", "done": "เสร็จสิ้น", "generatingGuidance": "กำลังสร้างคำแนะนำ...", "summarizingInteraction": "เรากำลังสรุปการโต้ตอบแต่ละครั้งและเตรียมทักษะที่นำกลับมาใช้ได้", "skillSaved": "บันทึกทักษะแล้ว", "goal": "เป้าหมาย", "steps": "ขั้นตอน", "events": "เหตุการณ์", "guidanceSavedSuccessfully": "บันทึกคำแนะนำสำเร็จ", "openGuidanceInComposer": "เปิดคำแนะนำใน Composer", "recordAnotherWorkflow": "บันทึกเวิร์กโฟลว์อีกอัน", "dismissSummary": "ปิดสรุป", "saveAndTest": "บันทึกและทดสอบ", "learning": "กำลังเรียนรู้...", "teachModeError": "โหมดสอนพบปัญหา", "errorDetails": "รายละเอียดข้อผิดพลาด", "checkNetworkConnection": "ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณและลองเริ่มโหมดสอนใหม่อีกครั้ง", "tryAgain": "ลองอีกครั้ง", "resetState": "รีเซ็ตสถานะ", "completeConfirmTitle": "การเสริมพลัง OS เสร็จสมบูรณ์", "completeConfirmMessage": "คุณสามารถเลือกผลลัพธ์ที่ต้องการในรายการด้านล่าง", "capturedEvents": "เหตุการณ์ที่บันทึกได้", "confirmAndGenerate": "สร้าง", "generating": "กำลังสร้าง", "promptSummary": "สรุปพรอมต์", "saveToPreset": "บันทึกเป็นเทมเพลต", "skillHostname": "ทักษะ: {{hostname}}", "saveToSkill": "บันทึกเป็นทักษะ", "selectAll": "เลือกทั้งหมด", "discard": "ยกเลิก", "confirmDiscard": "ใช่ ยกเลิก", "tutorial": { "title": "ยินดีต้อนรับสู่โหมดสอน", "next": "ถัดไป", "gotIt": "เข้าใจแล้ว", "guideLabel": "คู่มือโหมดสอน", "page1": { "title": "ทักษะและโหมดสอนคืออะไร?", "description": "ทักษะคือที่ที่ OS จัดเก็บความรู้ที่นำกลับมาใช้ได้ซึ่งเอเจนต์ใดๆ ก็สามารถนำไปใช้ได้ แต่ละทักษะเป็นคู่มือที่ใช้พรอมต์ (อาจมีโค้ดตัวอย่าง) เกี่ยวกับเว็บแอปพลิเคชัน เวิร์กโฟลว์ หรือรูปแบบการโต้ตอบ ช่วยให้ OS ทำงานได้ดีขึ้นบนเว็บไซต์บางเว็บหรืองานเฉพาะ\n\nโหมดสอนคือวิธีที่คุณสามารถฝึก OS ให้คัดลอกกิจวัตรของคุณหรือเรียนรู้วิธีทำงานบนเว็บไซต์เฉพาะ ซึ่งจะถูกบันทึกเป็น<strong>ทักษะและเทมเพลต</strong>สำหรับให้คุณนำกลับมาใช้ในอนาคต" }, "page2": { "title": "จะเริ่มโหมดสอนอย่างไร?", "description": "ในการเริ่มต้น ให้คลิกปุ่ม '<strong>โหมดสอน</strong>' ใน '<strong>แผงปัญญา</strong>' ทางซ้าย ก่อนเริ่ม ให้ตั้ง<strong>เป้าหมายการสอน</strong>ซึ่งจะให้คำแนะนำเบื้องต้นแก่ OS และให้งานที่ชัดเจนแก่คุณ" }, "page3": { "title": "OS เรียนรู้การเคลื่อนไหวของคุณอย่างไร?", "description": "ขณะที่คุณสอน OS จะสังเกตการกระทำของคุณและติดตามเคอร์เซอร์ของคุณแบบเรียลไทม์ คุณจะเห็นทุกขั้นตอนที่บันทึกไว้ในแผงด้านซ้าย — หยุดชั่วคราวได้ตลอดเวลา และคลิกไอคอน '<strong>หยุด</strong>' สีแดงเมื่อเสร็จสิ้น" }, "page4": { "title": "ผลลัพธ์การเรียนรู้ของ OS คืออะไร?", "description": "เมื่อคุณสอนเสร็จแล้ว ให้เลือกประเภทผลลัพธ์ที่คุณต้องการสร้าง โดยทั่วไปจะสร้างเทมเพลตและทักษะที่เกี่ยวข้องสำหรับงานประจำ หลังจากสร้างแล้ว คุณสามารถตรวจสอบและแก้ไขได้ใน <strong>Composer</strong> หรือเข้าถึงได้ตลอดเวลาในโฟลเดอร์ '<strong>เรียนรู้จากผู้ใช้</strong>' ภายในแผง '<strong>ปัญญา</strong>'" } }, "skillTooltip": "คุณสามารถปรับแต่งหรือแก้ไขทักษะด้านล่างได้", "skillSectionTooltip": "แต่ละทักษะจะถูกตั้งชื่อตามเว็บไซต์ที่ใช้ในช่วงการสอน ทักษะใหม่จะปรากฏเป็นส่วนใหม่ในไฟล์ markdown ที่เกี่ยวข้อง" };
const sidebar$4 = { "goBack": "ย้อนกลับ", "goForward": "ไปข้างหน้า", "lockSidebar": "ล็อคแถบด้านข้าง", "unlockSidebar": "ปลดล็อคแถบด้านข้าง", "searchOrEnterAddress": "ค้นหาหรือป้อนที่อยู่", "reload": "โหลดใหม่" };
const tabs$4 = { "newTab": "แท็บใหม่", "terminal": "เทอร์มินัล", "pauseAgent": "หยุดเอเจนต์ชั่วคราว", "resumeAgent": "ดำเนินการเอเจนต์ต่อ" };
const userMenu$4 = { "upgrade": "อัปเกรด", "creditsLeft": "เหลืออยู่", "clickToManageSubscription": "คลิกเพื่อจัดการการสมัครสมาชิก", "theme": "ธีม", "lightMode": "โหมดสว่าง", "darkMode": "โหมดมืด", "systemMode": "โหมดระบบ", "language": "ภาษา", "settings": "การตั้งค่า", "invitationCode": "รหัสเชิญ", "checkUpdates": "ตรวจสอบการอัปเดต", "contactUs": "ติดต่อเรา", "signOut": "ออกจากระบบ", "openUserMenu": "เปิดเมนูผู้ใช้", "signIn": "เข้าสู่ระบบ" };
const settings$4 = { "title": "การตั้งค่า", "history": "ประวัติ", "downloads": "ดาวน์โหลด", "adblock": "บล็อกโฆษณา", "language": "ภาษา", "languageDescription": "เลือกภาษาที่คุณต้องการสำหรับส่วนติดต่อ การเปลี่ยนแปลงจะมีผลทันที", "softwareUpdate": "อัปเดตซอฟต์แวร์" };
const updateSettings$4 = { "description": "Flowith OS รักษาคุณให้ทันสมัยด้วยการอัปเดตที่ปลอดภัยและเชื่อถือได้ เลือกช่องของคุณ: Stable สำหรับความน่าเชื่อถือ Beta สำหรับฟีเจอร์ก่อนกำหนด หรือ Alpha สำหรับบิลด์ล่าสุด คุณสามารถเปลี่ยนไปยังช่องที่บัญชีของคุณเข้าถึงได้เท่านั้น", "currentVersion": "เวอร์ชันปัจจุบัน: {{version}}", "loadError": "โหลดล้มเหลว", "warning": "คำเตือน: บิลด์ Beta/Alpha อาจไม่เสถียรและส่งผลกระทบต่องานของคุณ ใช้ Stable สำหรับการผลิต", "channel": { "label": "ช่องการอัปเดต", "hint": "เลือกได้เฉพาะช่องที่คุณมีสิทธิ์เข้าถึง", "disabledHint": "ไม่สามารถเปลี่ยนช่องขณะที่การอัปเดตกำลังดำเนินอยู่", "options": { "stable": "Stable", "beta": "Beta", "alpha": "Alpha" } }, "actions": { "title": "ตรวจสอบด้วยตนเอง", "hint": "ตรวจสอบการอัปเดตที่มีอยู่ตอนนี้", "check": "ตรวจสอบการอัปเดต" }, "status": { "noUpdate": "คุณใช้เวอร์ชันล่าสุดแล้ว", "hasUpdate": "มีเวอร์ชันใหม่", "error": "ตรวจสอบการอัปเดตล้มเหลว" }, "tips": { "title": "เคล็ดลับ", "default": "โดยค่าเริ่มต้น คุณจะได้รับการแจ้งเตือนสำหรับการอัปเดตที่เสถียร ใน Early Access บิลด์ก่อนวางจำหน่ายอาจไม่เสถียรสำหรับงานการผลิต", "warningTitle": "คำเตือน: การอัปเดต Nightly จะถูกนำไปใช้โดยอัตโนมัติ", "warningBody": "บิลด์ Nightly จะดาวน์โหลดและติดตั้งการอัปเดตโดยไม่แจ้งเตือนเมื่อ Cursor ถูกปิด" } };
const adblock$4 = { "title": "บล็อกโฆษณา", "description": "บล็อกโฆษณาและตัวติดตามที่รบกวน กรองสิ่งรบกวนในหน้าเว็บ ช่วยให้ Neo OS Agent เข้าใจและดึงข้อมูลได้แม่นยำยิ่งขึ้น พร้อมปกป้องความเป็นส่วนตัวของคุณ", "enable": "เปิดใช้งานบล็อกโฆษณา", "enableDescription": "บล็อกโฆษณาในทุกเว็บไซต์โดยอัตโนมัติ", "statusActive": "เปิดใช้งาน - กำลังบล็อกโฆษณา", "statusInactive": "ปิดใช้งาน - ไม่บล็อกโฆษณา", "adsBlocked": "โฆษณาถูกบล็อก", "networkBlocked": "คำขอเครือข่าย", "cosmeticBlocked": "องค์ประกอบที่ซ่อน", "filterRules": "กฎการกรอง", "activeRules": "กฎที่ใช้งาน" };
const blank$4 = { "openNewPage": "เปิดหน้าว่างใหม่", "selectBackground": "เลือกพื้นหลัง", "isAwake": "ตื่นแล้ว", "osIsAwake": "OS ตื่นแล้ว", "osGuideline": "คู่มือ OS", "osGuidelineDescription": "เริ่มต้นใช้งาน OS Agent - สถาปัตยกรรม โหมด และทุกสิ่งที่มันทำได้", "intelligence": "โหมดสอน", "intelligenceDescription": "สอน OS Agent ให้ทำงานและนำกลับมาใช้ภายหลัง", "inviteAndEarn": "เชิญและรับรางวัล", "tagline": "มีความทรงจำที่กระตือรือร้น พัฒนาไปกับทุกการกระทำเพื่อเข้าใจคุณอย่างแท้จริง", "taskPreset": "เทมเพลตงาน", "credits": "+{{amount}} เครดิต", "addPreset": "เพิ่มเทมเพลตใหม่", "editPreset": "แก้ไขเทมเพลต", "deletePreset": "ลบเทมเพลต", "removeFromHistory": "ลบออกจากประวัติ", "previousPreset": "เทมเพลตก่อนหน้า", "nextPreset": "เทมเพลตถัดไป", "previousPresets": "เทมเพลตก่อนหน้า", "nextPresets": "เทมเพลตถัดไป", "createPreset": "สร้างเทมเพลต", "presetName": "ชื่อเทมเพลต", "instruction": "คำสั่ง", "presetNamePlaceholderCreate": "เช่น รายงานประจำสัปดาห์, ตรวจสอบโค้ด, วิเคราะห์ข้อมูล...", "presetNamePlaceholderEdit": "ป้อนชื่อเทมเพลต...", "instructionPlaceholderCreate": 'อธิบายสิ่งที่คุณต้องการให้ OS ทำ...\nเช่น "วิเคราะห์ข้อมูลยอดขายของสัปดาห์นี้และสร้างรายงานสรุป"', "instructionPlaceholderEdit": "อัปเดตคำสั่งงานของคุณ...", "colorBlue": "น้ำเงิน", "colorGreen": "เขียว", "colorYellow": "เหลือง", "colorRed": "แดง", "selectColor": "เลือกสี{{color}}", "creating": "กำลังสร้าง...", "updating": "กำลังอัปเดต...", "create": "สร้าง", "update": "อัปเดต", "smartInputPlaceholder": "นำทาง ค้นหา หรือให้ Neo ทำให้...", "processing": "กำลังประมวลผล…", "navigate": "นำทาง", "navigateDescription": "เปิดที่อยู่นี้ในแท็บปัจจุบัน", "searchGoogle": "ค้นหาใน Google", "searchGoogleDescription": "ค้นหาด้วย Google", "runTask": "เรียกใช้งาน", "runTaskDescription": "ประมวลผลด้วยเอเจนต์ Neo", "createCanvas": "ถามในแคนวาส", "createCanvasDescription": "เปิดแคนวาส Flo ด้วยพรอมต์นี้" };
const agentGuide$4 = { "title": "คู่มือเอเจนต์", "subtitle": "คู่มือภาพเริ่มต้นใช้งาน OS Agent: สถาปัตยกรรม โหมด และทุกสิ่งที่ทำได้", "capabilities": { "heading": "ความสามารถ", "navigate": { "title": "นำทาง", "desc": "เปิดหน้า ย้อนกลับ/ไปข้างหน้า" }, "click": { "title": "คลิก", "desc": "โต้ตอบกับปุ่มและลิงก์" }, "type": { "title": "พิมพ์", "desc": "กรอกข้อมูลและฟอร์ม" }, "keys": { "title": "แป้นพิมพ์", "desc": "Enter, Escape, ทางลัด" }, "scroll": { "title": "เลื่อน", "desc": "เลื่อนดูหน้ายาว" }, "tabs": { "title": "แท็บ", "desc": "ทำเครื่องหมาย สลับ ปิด" }, "files": { "title": "ไฟล์", "desc": "เขียน อ่าน ดาวน์โหลด" }, "skills": { "title": "ทักษะ", "desc": "ความรู้ที่แชร์ได้" }, "memories": { "title": "ความทรงจำ", "desc": "การตั้งค่าระยะยาว" }, "upload": { "title": "อัปโหลด", "desc": "ส่งไฟล์ไปยังหน้า" }, "ask": { "title": "ถาม", "desc": "ยืนยันจากผู้ใช้อย่างรวดเร็ว" }, "onlineSearch": { "title": "ค้นหาออนไลน์", "desc": "ค้นหาเว็บอย่างรวดเร็ว" }, "extract": { "title": "ดึงข้อมูล", "desc": "รับข้อมูลที่มีโครงสร้าง" }, "deepThink": { "title": "คิดลึก", "desc": "วิเคราะห์เชิงโครงสร้าง" }, "vision": { "title": "มองเห็น", "desc": "ดำเนินการที่แม่นยำนอก DOM" }, "shell": { "title": "Shell", "desc": "รันคำสั่ง (เมื่อพร้อมใช้งาน)" }, "report": { "title": "รายงาน", "desc": "เสร็จสิ้นและสรุปผล" } }, "benchmark": { "title": "เกณฑ์มาตรฐาน Online-Mind2Web", "subtitle": "Flowith Neo AgentOS ครองอันดับ 1: ด้วยประสิทธิภาพที่", "subtitleHighlight": "เกือบสมบูรณ์แบบ", "subtitleEnd": " ", "openai": "OpenAI Operator", "gemini": "Gemini 2.5 Computer Use", "flowith": "Flowith Neo OS", "average": "เฉลี่ย", "easy": "ง่าย", "medium": "ปานกลาง", "hard": "ยาก" }, "skillsMemories": { "heading": "ทักษะและความทรงจำ", "description": "คู่มือที่นำกลับมาใช้ได้และบริบทระยะยาวที่ Neo อ้างอิงโดยอัตโนมัติในโหมด Pro", "markdownTag": "Markdown .md", "autoIndexedTag": "จัดทำดัชนีอัตโนมัติ", "citationsTag": "อ้างอิงในบันทึก", "howNeoUses": "วิธีที่ Neo ใช้: ก่อนแต่ละขั้นตอนในโหมด Pro, Neo จะตรวจสอบทักษะและความทรงจำที่เกี่ยวข้อง รวมเข้ากับบริบทการใช้เหตุผล และนำคำแนะนำหรือการตั้งค่าไปใช้โดยอัตโนมัติ", "skillsTitle": "ทักษะ", "skillsTag": "แชร์ได้", "skillsDesc": "จัดเก็บความรู้ที่นำกลับมาใช้ได้ซึ่งเอเจนต์ใดๆ ก็สามารถนำไปใช้ได้ แต่ละทักษะเป็นคู่มือสั้นๆ เกี่ยวกับเครื่องมือ เวิร์กโฟลว์ หรือรูปแบบ", "skillsProcedures": "เหมาะสำหรับ: ขั้นตอนการทำงาน", "skillsFormat": "รูปแบบ: Markdown", "skillsScenario": "สถานการณ์ประจำวัน", "skillsScenarioTitle": "แปลงและแชร์สื่อ", "skillsStep1": 'คุณพูดว่า: "แปลงรูป 20 รูปนี้เป็น PDF ที่กระชับ"', "skillsStep2": "Neo ปฏิบัติตามทักษะเพื่ออัปโหลด แปลง รอให้เสร็จสมบูรณ์ และบันทึกไฟล์", "skillsOutcome": "ผลลัพธ์: PDF พร้อมแชร์พร้อมลิงก์ดาวน์โหลดในบันทึก", "memoriesTitle": "ความทรงจำ", "memoriesTag": "ส่วนตัว", "memoriesDesc": "จับข้อมูลการตั้งค่า โปรไฟล์ และข้อเท็จจริงในโดเมนของคุณ Neo จะอ้างอิงรายการที่เกี่ยวข้องเมื่อตัดสินใจและอ้างอิงในบันทึก", "memoriesStyle": "เหมาะสำหรับ: สไตล์ กฎเกณฑ์", "memoriesPrivate": "ส่วนตัวโดยค่าเริ่มต้น", "memoriesScenario": "สถานการณ์ประจำวัน", "memoriesScenarioTitle": "เสียงและโทนการเขียน", "memoriesStep1": "คุณชอบเนื้อหาที่กระชับ เป็นมิตร และมีโทนที่มองโลกในแง่ดี", "memoriesStep2": "Neo นำไปใช้ในอีเมล รายงาน และโพสต์โซเชียลโดยอัตโนมัติ", "memoriesOutcome": "ผลลัพธ์: เสียงแบรนด์ที่สม่ำเสมอโดยไม่ต้องทำซ้ำคำสั่ง", "taskFilesTitle": "ไฟล์งาน", "taskFilesTag": "ต่องาน", "taskFilesDesc": "ไฟล์ชั่วคราวที่สร้างขึ้นระหว่างงานปัจจุบัน ใช้สำหรับ I/O ของเครื่องมือและผลลัพธ์กลาง และไม่ได้แชร์กับงานอื่นโดยอัตโนมัติ", "taskFilesEphemeral": "ชั่วคราว", "taskFilesReadable": "อ่านได้โดยเครื่องมือ", "taskFilesScenario": "สถานการณ์ประจำวัน", "taskFilesScenarioTitle": "ติดตามราคาการเดินทาง", "taskFilesStep1": "Neo ดึงข้อมูลตารางเที่ยวบินและเก็บเป็น CSV สำหรับงานนี้", "taskFilesStep2": "เปรียบเทียบอัตราค่าโดยสารของวันนี้กับเมื่อวานและเน้นการเปลี่ยนแปลง", "taskFilesOutcome": "ผลลัพธ์: สรุปที่เรียบร้อยและ CSV ที่ดาวน์โหลดได้" }, "system": { "title": "Neo OS - เอเจนต์เบราว์เซอร์ที่ฉลาดที่สุดสำหรับคุณ", "tagline": "พัฒนาตนเอง × ความทรงจำและทักษะ × ความเร็วและสติปัญญา", "selfEvolving": "พัฒนาตนเอง", "intelligence": "สติปัญญา", "contextImprovement": "ปรับปรุงบริบท", "contextDesc": "เอเจนต์สะท้อนคิดปรับปรุงบริบทแบบเรียลไทม์ผ่านระบบทักษะ", "onlineRL": "Online RL", "onlineRLDesc": "อัปเดตเป็นระยะให้สอดคล้องกับพฤติกรรมเอเจนต์", "intelligentMemory": "ความทรงจำอัจฉริยะ", "architecture": "สถาปัตยกรรม", "dualLayer": "ระบบสองชั้น", "dualLayerDesc": "บัฟเฟอร์ระยะสั้น + ความทรงจำเหตุการณ์ระยะยาว", "knowledgeTransfer": "ถ่ายทอดความรู้", "knowledgeTransferDesc": "เก็บรักษา นำกลับมาใช้ และถ่ายทอดการเรียนรู้ข้ามงาน", "highPerformance": "ประสิทธิภาพสูง", "infrastructure": "โครงสร้างพื้นฐาน", "executionKernel": "แกนการดำเนินการ", "executionKernelDesc": "การจัดการแบบขนานและการจัดตารางแบบไดนามิก", "speedCaching": "แคชความเร็ว", "speedCachingDesc": "การตอบสนองในระดับมิลลิวินาทีและการดำเนินการแบบเรียลไทม์", "speedIndicator": "~1ms", "summary": "วิวัฒนาการ · ยั่งยืน · รวดเร็ว" }, "arch": { "heading": "สถาปัตยกรรม", "subtitle": "OS ที่เน้นเอเจนต์: CPU (ผู้วางแผน) + ความทรงจำ/ระบบไฟล์ + ทักษะ + I/O", "agentCentricNote": "flowithOS ออกแบบมาสำหรับเอเจนต์", "osShell": "OS Shell", "agentCore": "แกนเอเจนต์", "plannerExecutor": "ผู้วางแผน · ผู้ดำเนินการ", "browserTabs": "แท็บเบราว์เซอร์", "domCanvas": "DOM · Canvas", "filesMemoriesSkills": "ไฟล์ · ความทรงจำ · ทักษะ", "domPageTabs": "DOM · หน้า · แท็บ", "clickTypeScroll": "คลิก · พิมพ์ · เลื่อน", "visionNonDOM": "มองเห็น · การดำเนินการนอก DOM", "captchaDrag": "CAPTCHA · ลาก", "onlineSearchThinking": "ค้นหาออนไลน์ · คิดลึก", "googleAnalysis": "google · วิเคราะห์", "askUserReport": "ถามผู้ใช้ · รายงาน", "choicesDoneReport": "choices · done_and_report", "skillsApps": "ทักษะ (แอป)", "skillsKinds": "ระบบ · ผู้ใช้ · แชร์", "memory": "ความทรงจำ", "memoryKinds": "ระยะสั้น · ระยะยาว", "filesystem": "ระบบไฟล์", "filesystemKinds": "ไฟล์งาน · สินทรัพย์ · บันทึก", "cpuTitle": "CPU — เอเจนต์วางแผน", "cpuSub": "ผู้วางแผน · ผู้ดำเนินการ · ผู้สะท้อนคิด", "planRow": "วางแผน → แยกย่อย → จัดเส้นทาง", "execRow": "ดำเนินการ → สังเกต → สะท้อนคิด", "ioTitle": "ความสามารถ I/O", "browserUse": "การใช้เบราว์เซอร์", "browserUseDesc": "DOM · แท็บ · มองเห็น · CAPTCHA", "terminalUse": "การใช้เทอร์มินัล", "terminalUseDesc": "Shell · เครื่องมือ · สคริปต์", "scriptUse": "การใช้สคริปต์", "scriptUseDesc": "Python · JS · Workers", "osVsHumanTitle": "Agent OS เทียบกับ Human-centric OS", "osVsHuman1": "แอปกลายเป็นทักษะ: ออกแบบให้เอเจนต์อ่านได้ ไม่ใช่ UI", "osVsHuman2": "CPU วางแผน/ดำเนินการผ่าน I/O; ผู้ใช้ดูแลในระดับงาน", "osVsHuman3": "ความทรงจำคงอยู่ข้ามงาน; ระบบไฟล์รองรับ I/O ของเครื่องมือ" }, "tips": { "heading": "เคล็ดลับ", "beta": "FlowithOS อยู่ในช่วง Beta; ทั้งผลิตภัณฑ์และ Agent Neo กำลังได้รับการอัปเดตอย่างต่อเนื่อง โปรดติดตามการอัปเดตล่าสุด", "improving": "ความสามารถของ Agent Neo OS กำลังพัฒนาขึ้นทุกวัน คุณสามารถลองใช้ความสามารถใหม่เพื่อทำงานให้เสร็จสมบูรณ์" } };
const reward$4 = { "helloWorld": "Hello World", "helloWorldDesc": 'นี่คือช่วงเวลา "Hello World" ของคุณในยุคใหม่<br />เป็นหนึ่งในคนแรกๆ ที่สร้างร่องรอยบนอินเทอร์เน็ตเอเจนต์ในประวัติศาสตร์มนุษยชาติ', "get2000Credits": "รับเครดิตโบนัส 2,000", "equivalent7Days": "และทำงานโซเชียลมีเดียอัตโนมัติเป็นเวลา 7 วัน", "shareInstructions": `เมื่อตื่นขึ้นแล้ว ให้แนะนำเอเจนต์ส่วนตัวของคุณกับโลก<br />NeoOS จะสร้างและเผยแพร่โพสต์ข้อความ "Hello World" บน X โดยอัตโนมัติ<br />เหมือนกับทุกสิ่งที่มันสามารถทำให้คุณภายหลัง<br /><span style='display: block; height: 8px;'></span>นั่งรอและดูมันเกิดขึ้น`, "osComing": "OS กำลังมา", "awakeOS": "ปลุก OS", "page2Title": "เชิญและรับรางวัล", "page2Description1": "การเดินทางที่ยิ่งใหญ่ดีกว่าเมื่อมีเพื่อนร่วมทาง", "page2Description2": "สำหรับแต่ละเพื่อนที่เข้าร่วม คุณจะได้รับ", "page2Description3": "เครดิตเพื่อเติมเชื้อเพลิงให้ความคิดของคุณ", "retry": "ลองใหม่", "noCodesYet": "ยังไม่มีรหัสเชิญ", "activated": "เปิดใช้งานแล้ว", "neoStarting": "Neo กำลังเริ่มงานแชร์อัตโนมัติ...", "failed": "ล้มเหลว", "unknownError": "ข้อผิดพลาดที่ไม่รู้จัก", "errorRetry": "เกิดข้อผิดพลาด โปรดลองใหม่", "unexpectedResponse": "การตอบกลับที่ไม่คาดคิดจากเซิร์ฟเวอร์", "failedToLoadCodes": "โหลดรหัสเชิญล้มเหลว", "congratsCredits": "ยินดีด้วย! +{{amount}} เครดิต", "rewardUnlocked": "ปลดล็อกรางวัลสำหรับการแชร์" };
const agentWidget$4 = { "modes": { "fast": { "label": "โหมดเร็ว", "description": "ทำงานให้เสร็จเร็วที่สุด ไม่ใช้ทักษะและความทรงจำ", "short": "เร็ว", "modeDescription": "การกระทำเร็วขึ้น รายละเอียดน้อยลง" }, "pro": { "label": "โหมด Pro", "description": "คุณภาพสูงสุด: การวิเคราะห์ภาพแบบทีละขั้นตอนด้วยการใช้เหตุผลเชิงลึก อ้างอิงทักษะและความทรงจำตามความจำเป็น", "short": "Pro", "modeDescription": "สมดุล ให้ Neo ตัดสินใจ" } }, "minimize": "ย่อ", "placeholder": "ขอให้ Neo OS Agent ทำ...", "changeModeTooltip": "เปลี่ยนโหมดเพื่อปรับพฤติกรรมของเอเจนต์", "preset": "เทมเพลต", "selectPresetTooltip": "เลือกเทมเพลตที่จะใช้", "addNewPreset": "เพิ่มเทมเพลตใหม่", "agentHistoryTooltip": "ประวัติการกระทำของเอเจนต์", "createPreset": "สร้างเทมเพลต", "presetName": "ชื่อเทมเพลต", "instruction": "คำสั่ง", "upload": "อัปโหลด", "newTask": "งานใหม่", "draft": "แบบร่าง", "copyPrompt": "คัดลอกพรอมต์", "showMore": "แสดงเพิ่มเติม", "showLess": "แสดงน้อยลง", "agentIsWorking": "เอเจนต์กำลังทำงาน", "agentIsWrappingUp": "เอเจนต์กำลังจัดการสรุป", "completed": "เสร็จสมบูรณ์", "paused": "หยุดชั่วคราว", "created": "สร้างแล้ว", "selectTask": "เลือกงาน", "unpin": "เลิกปักหมุด", "pinToRight": "ปักหมุดไว้ทางขวา", "stepsCount": "ขั้นตอน ({{count}})", "files": "ไฟล์", "filesCount": "ไฟล์ ({{count}})", "noFilesYet": "ยังไม่มีไฟล์ที่สร้างขึ้น", "status": { "wrappingUp": "เอเจนต์กำลังจัดการสรุป...", "thinking": "เอเจนต์กำลังคิด...", "wrappingUpAction": "กำลังจัดการการกระทำปัจจุบัน..." }, "actions": { "markedTab": "แท็บที่ทำเครื่องหมาย", "openRelatedTab": "เปิดแท็บที่เกี่ยวข้อง (กำลังพัฒนา)", "open": "เปิด", "openTab": "เปิดแท็บ", "showInFolder": "แสดงในโฟลเดอร์", "preview": "แสดงตัวอย่าง", "followUpPrefix": "คุณ", "actionsHeader": "การกระทำ" }, "controls": { "rerun": "รันใหม่ (กำลังพัฒนา)", "pause": "หยุดชั่วคราว", "pauseAndArchive": "หยุดชั่วคราวและเก็บถาวร", "resume": "ดำเนินการต่อ", "wrappingUpDisabled": "กำลังจัดการสรุป..." }, "input": { "sending": "กำลังส่ง...", "adjustTaskPlaceholder": "ส่งข้อความใหม่เพื่อปรับงานสำหรับ Agent Neo..." }, "legacy": { "readOnlyNotice": "นี่คืองานเวอร์ชันเก่าจากรุ่นก่อนหน้า โหมดดูอย่างเดียว" }, "refunded": { "noFollowUp": "งานนี้ได้รับการคืนเงินแล้ว ข้อความติดตามผลไม่พร้อมใช้งาน" }, "skills": { "matchingSkills": "จับคู่ทักษะที่เกี่ยวข้อง…", "scanningSkills": "สแกนทักษะที่พร้อมใช้งาน!!!", "scanningMap": "สแกนแผนที่ทักษะเชิงประสาท…" }, "billing": { "creditsDepletedTitle": "เพิ่มเครดิตเพื่อดำเนินการต่อ", "creditsDepletedMessage": "เอเจนต์หยุดชั่วคราวเนื่องจากเครดิตของคุณหมด เพิ่มเครดิตหรืออัปเดตการเรียกเก็บเงิน จากนั้นรันงานใหม่เมื่อคุณพร้อม" }, "presetActions": { "editPreset": "แก้ไขเทมเพลต", "deletePreset": "ลบเทมเพลต" }, "feedback": { "success": { "short": "ทำได้ดีมาก!", "long": "จนถึงตอนนี้ดีมาก ทำได้ดีมาก!" }, "refund": { "short": "อ๊ะ คืนเงิน!", "long": "อ๊ะ ฉันต้องการเครดิตคืน!" }, "refundSuccess": { "long": "เยี่ยมมาก! เครดิตของคุณได้รับการคืนแล้ว!" }, "modal": { "title": "ขอคืนเครดิต", "credits": "{{count}} เครดิต", "description": "หากคุณไม่พอใจกับงานนี้ ขอคืนเงินแล้วเราจะคืนเครดิตทั้งหมดที่ใช้ในงานนี้ทันที", "whatGoesWrong": "มีอะไรผิดพลาด", "errorMessage": "ขออภัย โปรดให้รายละเอียดเพิ่มเติม", "placeholder": "อธิบายว่ามีอะไรผิดพลาด...", "shareTask": "แชร์งานนี้กับเรา", "shareDescription": "เราจะปกปิดข้อมูลส่วนตัวทั้งหมดจากงานของคุณ การแชร์งานของคุณกับเรา เราจะปรับปรุงประสิทธิภาพของเอเจนต์ในงานที่คล้ายกันในอนาคต", "upload": "อัปโหลด", "attachFile": "แนบไฟล์", "submit": "ส่ง", "submitting": "กำลังส่ง...", "alreadyRefunded": { "title": "คืนเงินแล้ว", "message": "งานนี้ได้รับการคืนเงินแล้ว คุณไม่สามารถขอคืนเงินอีกครั้งได้" } }, "errors": { "systemError": "ข้อผิดพลาดของระบบ กรุณาติดต่อทีมสนับสนุนของเรา", "networkError": "ข้อผิดพลาดเครือข่าย โปรดตรวจสอบการเชื่อมต่อของคุณและลองอีกครั้ง", "noUsageData": "ไม่พบข้อมูลการใช้งาน ไม่สามารถคืนเงินได้", "alreadyRefunded": "งานนี้ได้รับการคืนเงินแล้ว", "notAuthenticated": "กรุณาเข้าสู่ระบบเพื่อขอคืนเงิน", "unknownError": "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองอีกครั้งในภายหลัง", "validationFailed": "ไม่สามารถตรวจสอบเหตุผลของคุณได้ในขณะนี้ กรุณาลองใหม่อีกครั้งในภายหลัง", "invalidReason": "เหตุผลถูกปฏิเสธ กรุณาอธิบายว่าเกิดอะไรขึ้นจริงๆ" }, "confirmation": { "creditsRefunded": "คืนเครดิตแล้ว {{count}} เครดิต", "title": "สำเร็จ", "message": "ขอบคุณ! ทีมของเราจะวินิจฉัยงานของคุณและปรับปรุงประสบการณ์ FlowithOS", "messageNoShare": "ขอบคุณ! ทีมของเราจะทำงานต่อไปเพื่อปรับปรุงประสบการณ์ FlowithOS" } } };
const gate$4 = { "welcome": { "title": "ยินดีต้อนรับสู่ FlowithOS", "subtitle": "จากเว็บสู่โลก FlowithOS คือ AgenticOS ที่ฉลาดที่สุดที่เปลี่ยนเบราว์เซอร์ของคุณเป็นคุณค่าในโลกแห่งความจริง", "features": { "execute": { "title": "ทำงานอัตโนมัติ ทุกงาน", "description": "ทำงานด้วยสัญชาตญาณของมนุษย์ในความเร็วของเครื่องจักร FlowithOS นำทางและทำงานหลายงานบนเว็บซ้ำๆ" }, "transform": { "title": "เปลี่ยนไอเดียเป็นผลกระทบ อย่างชาญฉลาด", "description": "จากแรงบันดาลใจสู่การสร้างคุณค่า FlowithOS เปลี่ยนไอเดียยิ่งใหญ่เป็นการกระทำเพื่อส่งมอบผลลัพธ์ที่แท้จริง" }, "organize": { "title": "จัดระเบียบสินทรัพย์ของคุณ อย่างเป็นระบบ", "description": "จากบุ๊กมาร์กที่กระจัดกระจายสู่คู่มือที่มีโครงสร้าง FlowithOS มอบระบบที่แข็งแกร่งให้คุณจัดการ รวบรวม และขยายสินทรัพย์ดิจิทัลของคุณ" }, "evolve": { "title": "วิวัฒนาการไปกับคุณ อย่างไดนามิก", "description": "ด้วยความทรงจำที่เติบโตจากทุกการโต้ตอบ FlowithOS พัฒนาทักษะที่กำหนดเอง—ตั้งแต่การนำทางเว็บไซต์ที่ซับซ้อนไปจนถึงการเข้าใจสไตล์ส่วนตัวของคุณ" } }, "letsGo": "เริ่มเลย!" }, "auth": { "createAccount": "สร้างบัญชี", "signInToFlowith": "เข้าสู่ระบบบัญชี Flowith ของคุณ", "oneAccount": "บัญชีเดียวสำหรับทุกผลิตภัณฑ์ Flowith", "fromAnotherAccount": "เข้าสู่ระบบด้วย:", "useOwnEmail": "หรือใช้อีเมลของคุณเอง", "email": "อีเมล", "password": "รหัสผ่าน", "confirmPassword": "ยืนยันรหัสผ่าน", "acceptTerms": "ฉันยอมรับข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัวของ FlowithOS", "privacyNote": "ข้อมูลทั้งหมดของคุณปลอดภัย 100% บนอุปกรณ์ของคุณ", "alreadyHaveAccount": "มีบัญชี Flowith อยู่แล้ว?", "createNewAccount": "ไม่มีบัญชี? สมัครสมาชิก", "signUp": "สมัครสมาชิก", "signIn": "เข้าสู่ระบบ", "processing": "กำลังประมวลผล...", "verifyEmail": "ยืนยันอีเมลของคุณ", "verificationCodeSent": "เราได้ส่งรหัสยืนยัน 6 หลักไปที่ {{email}}", "enterVerificationCode": "ป้อนรหัสยืนยัน", "verificationCode": "รหัสยืนยัน", "enterSixDigitCode": "ป้อนรหัส 6 หลัก", "backToSignUp": "กลับไปสมัครสมาชิก", "verifying": "กำลังยืนยัน...", "verifyCode": "ยืนยันรหัส", "errors": { "enterEmail": "โปรดป้อนอีเมลของคุณ", "enterPassword": "โปรดป้อนรหัสผ่านของคุณ", "confirmPassword": "โปรดยืนยันรหัสผ่านของคุณ", "passwordsDoNotMatch": "รหัสผ่านไม่ตรงกัน", "acceptTerms": "โปรดยอมรับข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัว", "authFailed": "การยืนยันตัวตนล้มเหลว โปรดลองอีกครั้ง", "invalidVerificationCode": "โปรดป้อนรหัสยืนยัน 6 หลักที่ถูกต้อง", "verificationFailed": "การยืนยันล้มเหลว โปรดลองอีกครั้ง", "oauthFailed": "การยืนยันตัวตน OAuth ล้มเหลว โปรดลองอีกครั้ง", "userAlreadyExists": "อีเมลนี้ลงทะเบียนแล้ว โปรด " }, "goToLogin": "ไปที่เข้าสู่ระบบ", "signInPrompt": "เข้าสู่ระบบ" }, "invitation": { "title": "การตื่นต้องใช้กุญแจ", "subtitle": "โปรดป้อนรหัสเชิญของคุณเพื่อปลดล็อค FlowithOS", "lookingForInvite": "กำลังหารหัสเชิญ?", "followOnX": "ติดตาม @flowith บน X", "toGetAccess": "เพื่อรับสิทธิ์เข้าใช้", "placeholder": "รหัสเชิญของฉัน", "invalidCode": "รหัสเชิญไม่ถูกต้อง", "verificationFailed": "การยืนยันล้มเหลว - โปรดลองอีกครั้ง", "accessGranted": "ให้สิทธิ์เข้าใช้แล้ว", "initializing": "ยินดีต้อนรับสู่ FlowithOS กำลังเริ่มต้น..." }, "browserImport": { "title": "เริ่มต้นจากจุดที่คุณค้างไว้", "subtitle": "นำเข้าบุ๊กมาร์กและเซสชันที่บันทึกไว้จากเบราว์เซอร์ปัจจุบันของคุณได้อย่างราบรื่น", "detecting": "กำลังตรวจหาเบราว์เซอร์ที่ติดตั้ง...", "noBrowsers": "ไม่ตรวจพบเบราว์เซอร์ที่ติดตั้ง", "imported": "นำเข้าแล้ว", "importing": "กำลังนำเข้า...", "bookmarks": "บุ๊กมาร์ก", "importNote": "การนำเข้าใช้เวลาประมาณ 5 วินาที คุณจะเห็นข้อความแจ้งจากระบบหนึ่งหรือสองครั้ง", "skipForNow": "ข้ามไปก่อน", "nextStep": "ขั้นตอนถัดไป" }, "settings": { "title": "พร้อมที่จะ Flow หรือยัง?", "subtitle": "การปรับแต่งเล็กน้อยเพื่อทำให้ประสบการณ์ Flowith OS ของคุณสมบูรณ์แบบ", "defaultBrowser": { "title": "ตั้งเป็นเบราว์เซอร์เริ่มต้น", "description": "ให้เว็บไหลมาหาคุณ ลิงก์จะเปิดโดยตรงใน FlowithOS และรวมเนื้อหาออนไลน์เข้ากับพื้นที่ทำงานของคุณได้อย่างราบรื่น" }, "addToDock": { "title": "เพิ่มไปยัง Dock / Taskbar", "description": "เก็บฮับสร้างสรรค์ของคุณไว้ให้เข้าถึงได้ทันทีเมื่อแรงบันดาลใจมาเยือน" }, "launchAtStartup": { "title": "เปิดตอนเริ่มต้นระบบ", "description": "เริ่มวันของคุณพร้อมสร้างสรรค์ Flowith OS จะรอคุณอยู่ทันทีที่คุณเข้าสู่ระบบ" }, "helpImprove": { "title": "ช่วยเราปรับปรุง", "description": "แชร์ข้อมูลการใช้งานแบบไม่ระบุตัวตนเพื่อช่วยเราสร้างผลิตภัณฑ์ที่ดีขึ้นสำหรับทุกคน", "privacyNote": "ความเป็นส่วนตัวของคุณได้รับการปกป้องอย่างเต็มที่" }, "canChangeSettingsLater": "คุณสามารถเปลี่ยนการตั้งค่าเหล่านี้ได้ภายหลัง", "nextStep": "ขั้นตอนถัดไป", "privacy": { "title": "การจัดเก็บข้อมูลในเครื่องและการปกป้องความเป็นส่วนตัว 100%", "description": "ประวัติการทำงานของเอเจนต์ ประวัติการเรียกดู ความทรงจำและทักษะ ข้อมูลรับรองบัญชี และข้อมูลความเป็นส่วนตัวทั้งหมดจัดเก็บ 100% ในเครื่องบนอุปกรณ์ของคุณ ไม่มีการซิงค์ไปยังเซิร์ฟเวอร์คลาวด์ คุณสามารถใช้ FlowithOS ได้อย่างสบายใจ" } }, "examples": { "title1": "OS ตื่นแล้ว", "title2": "ดูมันทำงาน", "subtitle": "เริ่มต้นด้วยตัวอย่างเพื่อดูว่ามันทำงานอย่างไร", "enterFlowithOS": "เข้าสู่ FlowithOS", "clickToReplay": "คลิกเพื่อดูตัวอย่างนี้อีกครั้ง", "videoNotSupported": "เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ", "cases": { "shopping": { "title": "ช้อปปิ้งช่วงวันหยุดเร็วขึ้น 10 เท่า", "description": "เติมตะกร้าด้วยชุดของขวัญสำหรับสัตว์เลี้ยงที่สมบูรณ์แบบ—ประหยัดเวลาท่องเว็บของคุณมากกว่า 2 ชั่วโมง" }, "contentEngine": { "title": "เครื่องมือสร้างคอนเทนต์ X แบบ 24/7", "description": "ค้นพบเรื่องราวยอดนิยมจาก Hacker News เขียนในสไตล์เฉพาะของคุณ และโพสต์อัตโนมัติลง X เพิ่มการเข้าชมโปรไฟล์ 3 เท่าและการเติบโตของชุมชนอย่างแท้จริง" }, "tiktok": { "title1": "เครื่องกระตุ้น TikTok: 500+ การมีส่วนร่วม", "title2": "ไม่ต้องใช้แรงงานเลย", "description": "Flowith OS ทำงานในไลฟ์สตรีมที่มีทราฟฟิกสูงด้วยการแสดงความคิดเห็นที่แหลมคมทางวัฒนธรรม แปลงการปรากฏตัวดิจิทัลเป็นโมเมนตัมที่วัดผลได้" }, "youtube": { "title": "การเติบโตช่อง Youtube อัตโนมัติ 95%", "description": "Flowith OS ทำให้เวิร์กโฟลว์ YouTube แบบไม่โชว์หน้าเป็นอัตโนมัติทั้งหมด ตั้งแต่การสร้างสรรค์ไปจนถึงชุมชน ย่นงานหลายสัปดาห์ให้เหลือน้อยกว่าหนึ่งชั่วโมง" } } }, "oauth": { "connecting": "กำลังเชื่อมต่อกับ {{provider}}", "completeInBrowser": "โปรดทำการยืนยันตัวตนในแท็บเบราว์เซอร์ที่เพิ่งเปิด", "cancel": "ยกเลิก" }, "terms": { "title": "ข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัว", "subtitle": "โปรดตรวจสอบข้อกำหนดด้านล่าง", "close": "ปิด" }, "invitationCodes": { "title": "รหัสเชิญของฉัน", "availableToShare": "{{unused}} จาก {{total}} พร้อมแชร์", "loading": "กำลังโหลด...", "noCodesYet": "ยังไม่มีรหัสเชิญ", "noCodesFound": "ไม่พบรหัสเชิญ", "failedToLoad": "โหลดรหัสเชิญล้มเหลว", "useCodeHint": "ใช้รหัสเชิญเพื่อรับรหัสของคุณเอง!", "shareHint": "แชร์รหัสเหล่านี้กับเพื่อนเพื่อเชิญพวกเขาเข้าสู่ FlowithOS", "used": "ใช้แล้ว" }, "history": { "title": "ประวัติ", "searchPlaceholder": "ค้นหาประวัติ...", "selectAll": "เลือกทั้งหมด", "deselectAll": "ยกเลิกการเลือก", "deleteSelected": "ลบที่เลือก ({{count}})", "clearAll": "ล้างทั้งหมด", "loading": "กำลังโหลดประวัติ...", "noMatchingHistory": "ไม่พบประวัติที่ตรงกัน", "noHistoryYet": "ยังไม่มีประวัติ", "confirmDelete": "ยืนยันการลบ", "deleteConfirmMessage": "คุณแน่ใจหรือไม่ว่าต้องการลบประวัติที่เลือก? การดำเนินการนี้ไม่สามารถย้อนกลับได้", "cancel": "ยกเลิก", "delete": "ลบ", "today": "วันนี้", "yesterday": "เมื่อวาน", "earlier": "ก่อนหน้า", "untitled": "ไม่มีชื่อ", "visitedTimes": "เยี่ยมชม {{count}} ครั้ง", "openInNewTab": "เปิดในแท็บใหม่", "timePeriod": "ช่วงเวลา", "timeRangeAll": "ทั้งหมด", "timeRangeAllDesc": "ประวัติการเรียกดูทั้งหมด", "timeRangeToday": "วันนี้", "timeRangeTodayDesc": "ประวัติทั้งหมดของวันนี้", "timeRangeYesterday": "เมื่อวาน", "timeRangeYesterdayDesc": "ประวัติจากเมื่อวาน", "timeRangeLast7Days": "7 วันที่ผ่านมา", "timeRangeLast7DaysDesc": "ประวัติจากสัปดาห์ที่ผ่านมา", "timeRangeThisMonth": "เดือนนี้", "timeRangeThisMonthDesc": "ประวัติของเดือนนี้", "timeRangeLastMonth": "เดือนที่แล้ว", "timeRangeLastMonthDesc": "ประวัติจากเดือนที่แล้ว", "deleteTimeRange": "ลบ{{range}}" } };
const update$4 = { "checking": { "title": "กำลังตรวจสอบการอัปเดต", "description": "กำลังเชื่อมต่อเซิร์ฟเวอร์อัปเดต..." }, "noUpdate": { "title": "คุณใช้เวอร์ชันล่าสุดแล้ว", "currentVersion": "เวอร์ชันปัจจุบัน v{{version}}", "description": "คุณใช้เวอร์ชันล่าสุดอยู่แล้ว", "close": "ปิด" }, "available": { "title": "มีเวอร์ชันใหม่", "version": "v{{version}} พร้อมใช้งาน", "currentVersion": "(ปัจจุบัน: v{{current}})", "released": "เผยแพร่ {{time}}", "betaNote": "เราอยู่ในช่วงเบต้าสาธารณะและปล่อยการปรับปรุงทุกวัน อัปเดตเลยเพื่อใช้งานเวอร์ชันล่าสุด", "defaultReleaseNotes": "เวอร์ชันเบต้านี้มีการปรับปรุงประสิทธิภาพ แก้ไขบั๊ก และฟีเจอร์ใหม่ เราปล่อยการอัปเดตทุกวัน โปรดอัปเดตเลยเพื่อประสบการณ์ที่ดีที่สุด", "downloadNow": "ดาวน์โหลดเลย", "remindLater": "เตือนภายหลัง", "preparing": "กำลังเตรียม..." }, "downloading": { "title": "กำลังดาวน์โหลดการอัปเดต", "version": "กำลังดาวน์โหลด v{{version}}", "progress": "ความคืบหน้าการดาวน์โหลด", "hint": "คุณสามารถเปิดตัวติดตั้งที่ดาวน์โหลดได้โดยคลิกปุ่มด้านล่าง" }, "readyToInstall": { "title": "พร้อมติดตั้ง", "downloaded": "ดาวน์โหลด v{{version}} เสร็จแล้ว", "hint": "รีสตาร์ทเพื่อติดตั้งการอัปเดตให้เสร็จสมบูรณ์", "restartNow": "รีสตาร์ทเลย", "restartLater": "รีสตาร์ทภายหลัง", "restarting": "กำลังรีสตาร์ท..." }, "error": { "title": "ตรวจสอบการอัปเดตล้มเหลว", "default": "อัปเดตล้มเหลว โปรดลองอีกครั้งภายหลัง", "downloadFailed": "ดาวน์โหลดล้มเหลว โปรดลองอีกครั้งภายหลัง", "installFailed": "ติดตั้งล้มเหลว โปรดลองอีกครั้งภายหลัง", "close": "ปิด", "noChannelPermission": "บัญชีของคุณไม่มีสิทธิ์เข้าถึงช่องอัปเดต {{channel}} โปรดเปลี่ยนเป็น Stable และลองอีกครั้ง", "switchToStable": "เปลี่ยนเป็น Stable และลองใหม่" }, "time": { "justNow": "เมื่อสักครู่", "minutesAgo": "{{count}} นาทีที่แล้ว", "hoursAgo": "{{count}} ชั่วโมงที่แล้ว" }, "notifications": { "newVersionAvailable": "มีเวอร์ชันใหม่ {{version}}", "downloadingInBackground": "กำลังดาวน์โหลดในพื้นหลัง", "updateDownloaded": "ดาวน์โหลดการอัปเดตแล้ว", "readyToInstall": "เวอร์ชัน {{version}} พร้อมติดตั้ง" } };
const updateToast$4 = { "checking": "กำลังตรวจสอบการอัปเดต...", "pleaseWait": "โปรดรอสักครู่", "preparingDownload": "กำลังเตรียมดาวน์โหลด {{version}}", "downloading": "กำลังดาวน์โหลดการอัปเดต {{version}}", "updateCheckFailed": "ตรวจสอบการอัปเดตล้มเหลว", "unknownError": "ข้อผิดพลาดที่ไม่รู้จัก", "updatedTo": "อัปเดตเป็น v{{version}} แล้ว", "newVersionReady": "เวอร์ชันใหม่พร้อมแล้ว", "version": "เวอร์ชัน {{version}}", "close": "ปิด", "gotIt": "เข้าใจแล้ว", "installNow": "รีสตาร์ทเลย", "restarting": "กำลังรีสตาร์ท…", "later": "ภายหลัง", "collapseUpdateContent": "ย่อเนื้อหาการอัปเดต", "viewUpdateContent": "ดูเนื้อหาการอัปเดต", "collapseLog": "ย่อ ^", "viewLog": "ดูบันทึก >", "channelChangeFailed": "เปลี่ยนช่องล้มเหลว: {{error}}", "channelInfo": "ช่อง: {{channel}}, Manifest: {{manifest}}", "manualDownloadHint": "ติดตั้งอัตโนมัติล้มเหลว? โปรดติดตั้งด้วยตนเอง →", "channelDowngraded": { "title": "เปลี่ยนช่องแล้ว", "message": "บัญชีของคุณไม่มีสิทธิ์เข้าถึง {{previousChannel}} เปลี่ยนไปยัง {{newChannel}} โดยอัตโนมัติ" }, "time": { "justNow": "เมื่อสักครู่", "minutesAgo": "{{count}} นาทีที่แล้ว", "hoursAgo": "{{count}} ชั่วโมงที่แล้ว", "daysAgo": "{{count}} วันที่แล้ว", "weeksAgo": "{{count}} สัปดาห์ที่แล้ว", "monthsAgo": "{{count}} เดือนที่แล้ว", "yearsAgo": "{{count}} ปีที่แล้ว" } };
const errors$4 = { "auth": { "notLoggedIn": "โปรดเข้าสู่ระบบก่อน", "loginRequired": "โปรดเข้าสู่ระบบก่อนใช้ฟีเจอร์นี้", "shareRequiresLogin": "โปรดเข้าสู่ระบบก่อนใช้ฟีเจอร์แชร์" }, "network": { "networkError": "ข้อผิดพลาดเครือข่าย - โปรดตรวจสอบการเชื่อมต่อของคุณ", "requestTimeout": "คำขอหมดเวลา - โปรดลองอีกครั้ง", "failedToVerify": "ยืนยันสิทธิ์เข้าใช้ล้มเหลว", "failedToFetch": "ดึงรหัสล้มเหลว" }, "invitation": { "invalidCode": "รหัสเชิญไม่ถูกต้อง", "verificationFailed": "การยืนยันล้มเหลว - โปรดลองอีกครั้ง", "failedToConsume": "ใช้รหัสเชิญล้มเหลว" }, "download": { "downloadFailed": "ดาวน์โหลดล้มเหลว", "downloadInterrupted": "การดาวน์โหลดถูกขัดจังหวะ" }, "security": { "secureConnection": "การเชื่อมต่อที่ปลอดภัย", "notSecure": "ไม่ปลอดภัย", "localFile": "ไฟล์ในเครื่อง", "unknownProtocol": "โพรโทคอลที่ไม่รู้จัก" } };
const menus$4 = { "application": { "about": "เกี่ยวกับ {{appName}}", "checkForUpdates": "ตรวจสอบการอัปเดต...", "settings": "การตั้งค่า...", "services": "บริการ", "hide": "ซ่อน {{appName}}", "hideOthers": "ซ่อนอื่นๆ", "showAll": "แสดงทั้งหมด", "quit": "ออก", "updateChannel": "ช่องอัปเดต" }, "edit": { "label": "แก้ไข", "undo": "เลิกทำ", "redo": "ทำซ้ำ", "cut": "ตัด", "paste": "วาง", "selectAll": "เลือกทั้งหมด" }, "view": { "label": "มุมมอง", "findInPage": "ค้นหาในหน้า", "newTab": "แท็บใหม่", "reopenClosedTab": "เปิดแท็บที่ปิดใหม่", "newTerminalTab": "แท็บเทอร์มินัลใหม่", "openLocalFile": "เปิดไฟล์ในเครื่อง...", "goBack": "ย้อนกลับ", "goForward": "ไปข้างหน้า", "viewHistory": "ดูประวัติ", "viewDownloads": "ดูการดาวน์โหลด", "archive": "เก็บถาวร", "reload": "โหลดใหม่", "forceReload": "บังคับโหลดใหม่", "actualSize": "ขนาดจริง", "zoomIn": "ซูมเข้า", "zoomOut": "ซูมออก", "toggleFullScreen": "สลับเต็มหน้าจอ" }, "window": { "label": "หน้าต่าง", "minimize": "ย่อ", "close": "ปิด", "bringAllToFront": "นำทั้งหมดมาข้างหน้า" }, "help": { "label": "ช่วยเหลือ", "about": "เกี่ยวกับ", "version": "เวอร์ชัน", "aboutDescription1": "ระบบปฏิบัติการ AI Agent รุ่นใหม่", "aboutDescription2": "สร้างขึ้นเพื่อการปรับปรุงตนเอง ความทรงจำ และความเร็ว", "copyright": "© 2025 Flowith, Inc. สงวนลิขสิทธิ์" }, "contextMenu": { "back": "ย้อนกลับ", "forward": "ไปข้างหน้า", "reload": "โหลดใหม่", "hardReload": "บังคับโหลดใหม่ (เพิกเฉยแคช)", "openLinkInNewTab": "เปิดลิงก์ในแท็บใหม่", "openLinkInExternal": "เปิดลิงก์ในเบราว์เซอร์ภายนอก", "copyLinkAddress": "คัดลอกที่อยู่ลิงก์", "downloadLink": "ดาวน์โหลดลิงก์", "openImageInNewTab": "เปิดรูปภาพในแท็บใหม่", "copyImageAddress": "คัดลอกที่อยู่รูปภาพ", "copyImage": "คัดลอกรูปภาพ", "downloadImage": "ดาวน์โหลดรูปภาพ", "downloadVideo": "ดาวน์โหลดวิดีโอ", "downloadAudio": "ดาวน์โหลดเสียง", "openMediaInNewTab": "เปิดสื่อในแท็บใหม่", "copyMediaAddress": "คัดลอกที่อยู่สื่อ", "openFrameInNewTab": "เปิดเฟรมในแท็บใหม่", "openInExternal": "เปิดในเบราว์เซอร์ภายนอก", "copyPageURL": "คัดลอก URL หน้า", "viewPageSource": "ดูซอร์สโค้ดหน้า (แท็บใหม่)", "savePageAs": "บันทึกหน้าเป็น…", "print": "พิมพ์…", "cut": "ตัด", "paste": "วาง", "searchWebFor": 'ค้นหาเว็บสำหรับ "{{text}}"', "selectAll": "เลือกทั้งหมด", "inspectElement": "ตรวจสอบองค์ประกอบ", "openDevTools": "เปิดเครื่องมือนักพัฒนา", "closeDevTools": "ปิดเครื่องมือนักพัฒนา" }, "fileDialog": { "openLocalFile": "เปิดไฟล์ในเครื่อง", "unsupportedFileType": "ประเภทไฟล์ที่ไม่รองรับ", "savePageAs": "บันทึกหน้าเป็น", "allSupportedFiles": "ไฟล์ที่รองรับทั้งหมด", "htmlFiles": "ไฟล์ HTML", "textFiles": "ไฟล์ข้อความ", "images": "รูปภาพ", "videos": "วิดีโอ", "audio": "เสียง", "pdf": "PDF", "webpageComplete": "หน้าเว็บ, สมบูรณ์", "singleFile": "ไฟล์เดียว (MHTML)" } };
const dialogs$4 = { "crash": { "title": "ข้อผิดพลาดแอปพลิเคชัน", "message": "เกิดข้อผิดพลาดที่ไม่คาดคิด", "detail": "{{error}}\n\nข้อผิดพลาดได้ถูกบันทึกไว้เพื่อการแก้ไขจุดบกพร่อง", "restart": "รีสตาร์ท", "close": "ปิด" }, "customBackground": { "title": "พื้นหลังที่กำหนดเอง", "subtitle": "สร้างสไตล์เฉพาะของคุณเอง", "preview": "แสดงตัวอย่าง", "angle": "มุม", "stops": "จุดหยุด", "selectImage": "เลือกรูปภาพ", "uploading": "กำลังอัปโหลด...", "dropImageHere": "วางรูปภาพที่นี่", "dragAndDrop": "ลากและวางหรือคลิก", "fileTypes": "PNG, JPG, JPEG, WEBP, SVG, GIF", "fit": "พอดี", "cover": "ครอบคลุม", "contain": "บรรจุ", "fill": "เติม", "remove": "ลบ", "cancel": "ยกเลิก", "apply": "นำไปใช้", "gradient": "ไล่ระดับสี", "solid": "สีเดียว", "image": "รูปภาพ", "dropImageError": "โปรดวางไฟล์รูปภาพ (PNG, JPG, JPEG, WEBP, SVG หรือ GIF)" } };
const humanInput$4 = { "declinedToAnswer": "ผู้ใช้ปฏิเสธที่จะตอบ ข้ามคำถามนี้แล้ว", "needOneInput": "ต้องการข้อมูล 1 รายการเพื่อดำเนินการต่อ", "needTwoInputs": "ต้องการความช่วยเหลือของคุณ 2 เรื่อง", "needThreeInputs": "ต้องการการตัดสินใจ 3 เรื่องจากคุณ", "waitingOnInputs": "กำลังรอข้อมูล {{count}} รายการจากคุณ", "declineToAnswer": "ปฏิเสธที่จะตอบ", "dropFilesHere": "วางไฟล์ที่นี่", "typeYourAnswer": "พิมพ์คำตอบของคุณ...", "orTypeCustom": "หรือพิมพ์แบบกำหนดเอง...", "uploadFiles": "อัปโหลดไฟล์", "previousQuestion": "คำถามก่อนหน้า", "goToQuestion": "ไปที่คำถาม {{number}}", "nextQuestion": "คำถามถัดไป" };
const th = {
  common: common$4,
  nav: nav$4,
  tray: tray$4,
  actions: actions$4,
  status: status$4,
  time: time$4,
  downloads: downloads$4,
  history: history$4,
  invitationCodes: invitationCodes$4,
  tasks: tasks$4,
  flows: flows$4,
  bookmarks: bookmarks$4,
  conversations: conversations$4,
  intelligence: intelligence$4,
  sidebar: sidebar$4,
  tabs: tabs$4,
  userMenu: userMenu$4,
  settings: settings$4,
  updateSettings: updateSettings$4,
  adblock: adblock$4,
  blank: blank$4,
  agentGuide: agentGuide$4,
  reward: reward$4,
  agentWidget: agentWidget$4,
  gate: gate$4,
  update: update$4,
  updateToast: updateToast$4,
  errors: errors$4,
  menus: menus$4,
  dialogs: dialogs$4,
  humanInput: humanInput$4
};
const common$3 = { "ok": "Tamam", "cancel": "İptal", "start": "Başlat", "delete": "Sil", "close": "Kapat", "save": "Kaydet", "search": "Ara", "loading": "Yükleniyor", "pressEscToClose": "Kapatmak için ESC'ye basın", "copyUrl": "URL'yi Kopyala", "copied": "Kopyalandı", "copy": "Kopyala", "expand": "Genişlet", "collapse": "Daralt", "openFlowithWebsite": "Flowith web sitesini aç", "openAgentGuide": "Ajan Kılavuzunu Aç", "reward": "Ödül", "closeWindow": "Pencereyi kapat", "minimizeWindow": "Pencereyi küçült", "toggleFullscreen": "Tam ekran aç/kapat", "saveEnter": "Kaydet (Enter)", "cancelEsc": "İptal (Esc)" };
const nav$3 = { "tasks": "Görevler", "flows": "Akışlar", "bookmarks": "Yer İmleri", "intelligence": "Zeka", "guide": "Kılavuz" };
const tray$3 = { "newTask": "Yeni Görev", "recentTasks": "Son Görevler", "viewMore": "Daha Fazla Göster", "showMainWindow": "Ana Pencereyi Göster", "hideMainWindow": "Ana Pencereyi Gizle", "quit": "Çıkış" };
const actions$3 = { "resume": "Devam Et", "pause": "Duraklat", "cancel": "İptal", "delete": "Sil", "archive": "Arşivle", "showInFolder": "Klasörde Göster", "viewDetails": "Detayları Görüntüle", "openFile": "Dosyayı Aç" };
const status$3 = { "inProgress": "Devam ediyor", "completed": "Tamamlandı", "archive": "Arşiv", "paused": "Duraklatıldı", "failed": "Başarısız", "cancelled": "İptal edildi", "running": "Çalışıyor", "wrappingUp": "Tamamlanıyor..." };
const time$3 = { "today": "Bugün", "yesterday": "Dün", "earlier": "Daha Önce" };
const downloads$3 = { "title": "İndirilenler", "all": "Tümü", "inProgress": "Devam Ediyor", "completed": "Tamamlandı", "noDownloads": "İndirme yok", "failedToLoad": "İndirmeler yüklenemedi", "deleteConfirmMessage": "Seçili indirmeleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.", "loadingDownloads": "İndirmeler yükleniyor...", "searchPlaceholder": "İndirmelerde ara...", "selectAll": "Tümünü Seç", "deselectAll": "Tümünün Seçimini Kaldır", "deleteSelected": "Seçilenleri Sil ({{count}})", "clearAll": "Tümünü Temizle", "noMatchingDownloads": "Eşleşen indirme bulunamadı", "noDownloadsYet": "Henüz indirme yok", "confirmDelete": "Silme İşlemini Onayla", "cancel": "İptal", "delete": "Sil" };
const history$3 = { "title": "Geçmiş", "allTime": "Tüm Zamanlar", "clearHistory": "Geçmişi Temizle", "removeItem": "Öğeyi Kaldır", "failedToLoad": "Geçmiş yüklenemedi", "failedToClear": "Geçmiş temizlenemedi", "searchPlaceholder": "Geçmişte ara...", "selectAll": "Tümünü Seç", "deselectAll": "Tümünün Seçimini Kaldır", "deleteSelected": "Seçilenleri Sil ({{count}})", "clearAll": "Tümünü Temizle", "noMatchingHistory": "Eşleşen geçmiş bulunamadı", "noHistoryYet": "Henüz geçmiş yok", "confirmDelete": "Silme İşlemini Onayla", "deleteConfirmMessage": "Seçili geçmişi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.", "cancel": "İptal", "delete": "Sil", "today": "Bugün", "yesterday": "Dün", "earlier": "Daha Önce", "untitled": "Başlıksız", "visitedTimes": "{{count}} kez ziyaret edildi", "openInNewTab": "Yeni sekmede aç", "loading": "Geçmiş yükleniyor...", "timePeriod": "Zaman Aralığı", "timeRangeAll": "Tümü", "timeRangeAllDesc": "Tüm tarama geçmişi", "timeRangeToday": "Bugün", "timeRangeTodayDesc": "Bugünkü tüm geçmiş", "timeRangeYesterday": "Dün", "timeRangeYesterdayDesc": "Dünkü geçmiş", "timeRangeLast7Days": "Son 7 gün", "timeRangeLast7DaysDesc": "Geçen haftadan beri olan geçmiş", "timeRangeThisMonth": "Bu ay", "timeRangeThisMonthDesc": "Bu aydan beri olan geçmiş", "timeRangeLastMonth": "Geçen ay", "timeRangeLastMonthDesc": "Geçen aydan olan geçmiş", "deleteTimeRange": "{{range}} öğelerini sil", "last7days": "Son 7 Gün", "thisMonth": "Bu Ay", "lastMonth": "Geçen Ay" };
const invitationCodes$3 = { "title": "Davet Kodlarım", "availableToShare": "{{total}} koddan {{unused}} tanesi paylaşılabilir", "loading": "Kodlarınız yükleniyor...", "noCodesYet": "Henüz davet kodu yok.", "noCodesFound": "Davet kodu bulunamadı", "failedToLoad": "Davet kodları yüklenemedi", "useCodeHint": "Kendi kodlarınızı almak için bir davet kodu kullanın!", "shareHint": "Bu kodları arkadaşlarınızla paylaşarak onları FlowithOS'a davet edin", "used": "Kullanıldı" };
const tasks$3 = { "title": "Görev", "description": "Görevler, tüm görevlerinizi sakladığınız yerdir", "transformToPreset": "Ön Ayara Dönüştür", "noTasks": "Görev yok", "archiveEmpty": "Arşiv boş" };
const flows$3 = { "title": "Akış", "description": "Akış, tüm tuvallerinizi gösterir", "newFlow": "Yeni Akış", "rename": "Yeniden Adlandır", "leave": "Ayrıl", "noFlows": "Akış yok", "signInToViewFlows": "Akışlarınızı görüntülemek için giriş yapın", "pin": "Sabitle", "unpin": "Sabitlemeyi Kaldır" };
const bookmarks$3 = { "title": "Yer İmi", "description": "Beğendiğiniz tüm sekmeleri saklayabilirsiniz", "bookmark": "Yer İmi", "addNewCollection": "Yeni koleksiyon ekle", "loadingBookmarks": "Yer imleri yükleniyor...", "noMatchingBookmarks": "Eşleşen yer imi bulunamadı", "noBookmarksYet": "Henüz yer imi yok", "importFromBrowsers": "Tarayıcılardan içe aktar", "detectingBrowsers": "Tarayıcılar tespit ediliyor...", "bookmarksCount": "yer imi", "deleteCollection": "Koleksiyonu Sil", "deleteCollectionConfirm": "Bu koleksiyonu silmek istediğinizden emin misiniz?", "newCollection": "Yeni Koleksiyon", "enterCollectionName": "Yeni koleksiyon için bir ad girin", "create": "Oluştur", "collectionName": "Koleksiyon adı", "saveEnter": "Kaydet (Enter)", "cancelEsc": "İptal (Esc)", "renameFolder": "Klasörü yeniden adlandır", "renameBookmark": "Yer imini yeniden adlandır", "deleteFolder": "Klasörü sil", "deleteBookmark": "Yer imini sil" };
const conversations$3 = { "title": "Sohbetler", "noConversations": "Henüz sohbet yok" };
const intelligence$3 = { "title": "Zeka", "description": "Ajanınızı beceriler ve anılarla geliştirin", "knowledgeBase": "Bilgi Tabanı", "memory": "Hafıza", "skill": "Beceri", "createNewSkill": "Yeni beceri oluştur", "createNewMemory": "Yeni hafıza oluştur", "loading": "Yükleniyor...", "noSkills": "Beceri yok", "noMemories": "Hafıza yok", "readOnly": "Salt okunur", "readOnlyMessage": "Bu, ajanınızın daha iyi performans göstermesine yardımcı olan yerleşik bir sistem Becerisidir. Doğrudan düzenlenemez, ancak çoğaltıp kendi kopyanızı değiştirebilirsiniz. Açtıktan sonra yapılan düzenlemeler kaydedilmeyecektir. Lütfen unutmayın.", "readOnlyToast": "Bu, ajanınızın daha iyi performans göstermesine yardımcı olan yerleşik bir sistem Becerisidir. Doğrudan düzenlenemez, ancak çoğaltıp kendi kopyanızı değiştirebilirsiniz.", "open": "Aç", "kbComingSoon": "Flowith Bilgi Tabanı desteği yakında geliyor.", "system": "Sistem", "learnFromUser": "Kullanıcı", "systemPresetReadOnly": "Sistem ön ayarı (salt okunur)", "actions": "Eylemler", "rename": "Yeniden Adlandır", "duplicate": "Çoğalt…", "info": "Bilgi", "saving": "Kaydediliyor...", "fileInfo": "Dosya Bilgisi", "fileName": "Ad", "fileSize": "Boyut", "fileCreated": "Oluşturulma", "fileModified": "Değiştirilme", "fileType": "Tür", "fileLocation": "Konum", "copyPath": "Yolu Kopyala", "empowerOS": "Öğretme Modu", "teachMakesBetter": "Öğretmek OS'i daha iyi yapar", "teachMode": "Öğretme Modu", "teachModeDescription": "Öğretme Modunda, web iş akışlarınızı ve adımlarınızı kaydedebilirsiniz. OS Ajanı sessizce gözlemler, öğrenir ve bunları yeniden kullanılabilir beceriler ve bilgilere dönüştürür.", "teachModeGoalLabel": "Görev Hedefi (İsteğe Bağlı)", "teachModeGoalPlaceholder": "OS'in öğrenmesi için daha fazla bağlam sağlayın — belirli bir görev hedefi veya ilgili herhangi bir bilgi olabilir.", "teachModeTaskDisabled": "Öğretme modundayken yeni görev devre dışıdır.", "empowering": "Öğretiliyor", "empoweringDescription": "OS Ajanı siz gösterirken izleyecek ve öğrenecek", "yourGoal": "Görev Hedefi", "preset": "Ön Ayar", "generatedSkills": "Oluşturulan Beceriler", "showLess": "Gizle", "showMore": "Daha fazla göster", "osHasLearned": "OS öğrendi", "complete": "Tamamla", "interactionsPlaceholder": "İş akışını gösterirken etkileşimler burada görünecektir.", "done": "Bitti", "generatingGuidance": "Kılavuz oluşturuluyor...", "summarizingInteraction": "Her etkileşimi özetliyor ve yeniden kullanılabilir bir beceri hazırlıyoruz.", "skillSaved": "Beceri kaydedildi", "goal": "Hedef", "steps": "Adımlar", "events": "Olaylar", "guidanceSavedSuccessfully": "Kılavuz başarıyla kaydedildi.", "openGuidanceInComposer": "Kılavuzu Composer'da aç", "recordAnotherWorkflow": "Başka bir iş akışı kaydet", "dismissSummary": "Özeti kapat", "saveAndTest": "Kaydet ve Test Et", "learning": "Öğreniyor...", "teachModeError": "Öğretme modunda bir sorun oluştu", "errorDetails": "Hata Detayları", "checkNetworkConnection": "Ağ bağlantınızı kontrol edin ve öğretme modunu tekrar başlatmayı deneyin.", "tryAgain": "Tekrar dene", "resetState": "Durumu sıfırla", "completeConfirmTitle": "OS güçlendirme tamamlandı", "completeConfirmMessage": "Aşağıdaki kontrol listesinden hangi sonucu istediğinizi seçebilirsiniz.", "capturedEvents": "Yakalanan Olaylar", "confirmAndGenerate": "Oluştur", "generating": "Oluşturuluyor", "promptSummary": "İstem Özeti", "saveToPreset": "Ön Ayara Kaydet", "skillHostname": "Beceri: {{hostname}}", "saveToSkill": "Beceriye kaydet", "skillTooltip": "Aşağıda beceriyi gözden geçirebilir veya düzenleyebilirsiniz", "skillSectionTooltip": "Her beceri, öğretim oturumunda kullanılan web sitesinin adını alır. Yeni beceriler, ilgili markdown dosyasında yeni bölümler olarak görünür.", "selectAll": "Tümünü seç", "discard": "At", "confirmDiscard": "Evet, at", "tutorial": { "title": "Öğretme Moduna Hoş Geldiniz", "next": "İleri", "gotIt": "Anladım", "guideLabel": "Öğretme Modu Kılavuzu", "page1": { "title": "Beceri ve öğretme modu nedir?", "description": "Beceri, OS'in herhangi bir ajanın uygulayabileceği yeniden kullanılabilir bilgileri depoladığı yerdir. Her beceri, bir web uygulaması, iş akışı veya etkileşim modeli hakkında istem tabanlı bir kılavuzdur (potansiyel olarak kod parçacıkları içerir). OS'in belirli web sitelerinde veya belirli görevlerde daha iyi performans göstermesine yardımcı olur.\n\nÖğretme modu, OS'i rutininizi kopyalaması veya belirli bir web sitesinde nasıl çalışacağını öğrenmesi için eğitebileceğiniz yoldur. Bunlar gelecekte yeniden kullanmanız için <strong>beceriler ve ön ayarlar</strong> olarak saklanır." }, "page2": { "title": "Öğretme modu nasıl başlatılır?", "description": "Başlamak için soldaki '<strong>Zeka paneli</strong>'ndeki '<strong>Öğretme Modu</strong>' düğmesine tıklayın. Başlamadan önce, OS'e bir başlangıç talimatı veren ve size takip edilecek net bir görev sağlayan bir <strong>Öğretme Hedefi</strong> belirleyin." }, "page3": { "title": "OS hareketlerinizi nasıl öğrenir?", "description": "Siz öğretirken, OS eylemlerinizi gözlemler ve imlecinizi gerçek zamanlı olarak takip eder. Her adımın sol panelde kaydedildiğini göreceksiniz — istediğiniz zaman duraklatabilir ve işiniz bittiğinde kırmızı '<strong>Durdur</strong>' simgesine tıklayabilirsiniz." }, "page4": { "title": "OS öğrenme sonuçları nedir?", "description": "Öğretmeyi bitirdikten sonra, oluşturmak istediğiniz sonuç türünü seçin. Genellikle, rutin görevler için bir ön ayar ve ilgili beceriler oluşturulur. Oluşturulduktan sonra, bunları <strong>Composer</strong>'da inceleyip düzenleyebilir veya '<strong>Zeka</strong>' panelindeki '<strong>Kullanıcıdan Öğren</strong>' klasöründe istediğiniz zaman erişebilirsiniz." } } };
const sidebar$3 = { "goBack": "Geri git", "goForward": "İleri git", "lockSidebar": "Kenar çubuğunu kilitle", "unlockSidebar": "Kenar çubuğunun kilidini aç", "searchOrEnterAddress": "Ara veya adres gir", "reload": "Yenile" };
const tabs$3 = { "openNewBlankPage": "Yeni boş sayfa aç", "newTab": "Yeni Sekme", "terminal": "Terminal", "pauseAgent": "Ajanı Duraklat", "resumeAgent": "Ajana Devam Et" };
const userMenu$3 = { "upgrade": "Yükselt", "creditsLeft": "kaldı", "clickToManageSubscription": "Aboneliği yönetmek için tıklayın", "theme": "Tema", "lightMode": "Açık Mod", "darkMode": "Koyu Mod", "systemMode": "Sistem Modu", "language": "Dil", "settings": "Ayarlar", "invitationCode": "Davet Kodu", "checkUpdates": "Güncellemeleri Kontrol Et", "contactUs": "Bize Ulaşın", "signOut": "Çıkış Yap", "openUserMenu": "Kullanıcı menüsünü aç", "signIn": "Giriş yap" };
const settings$3 = { "title": "Ayarlar", "history": "Geçmiş", "downloads": "İndirilenler", "adblock": "Reklam Engelleyici", "language": "Dil", "languageDescription": "Arayüz için tercih ettiğiniz dili seçin. Değişiklikler hemen uygulanır.", "softwareUpdate": "Yazılım Güncellemesi" };
const updateSettings$3 = { "description": "Flowith OS sizi güvenli ve güvenilir güncellemelerle güncel tutar. Kanalınızı seçin: Güvenilirlik için Stable, erken özellikler için Beta veya en son sürümler için Alpha. Yalnızca hesabınızın erişebildiği kanallara geçiş yapabilirsiniz.", "currentVersion": "Mevcut sürüm: {{version}}", "loadError": "Yükleme başarısız", "warning": "Uyarı: Beta/Alpha sürümleri kararsız olabilir ve işinizi etkileyebilir. Üretim için Stable kullanın.", "channel": { "label": "Güncelleme Kanalı", "hint": "Yalnızca erişiminiz olan kanallar seçilebilir.", "disabledHint": "Güncelleme devam ederken kanal değiştirilemez", "options": { "stable": "Stable", "beta": "Beta", "alpha": "Alpha" } }, "actions": { "title": "Manuel Kontrol", "hint": "Şimdi mevcut güncellemeleri kontrol edin.", "check": "Güncellemeleri kontrol et" }, "status": { "noUpdate": "Güncelsiniz.", "hasUpdate": "Yeni sürüm mevcut.", "error": "Güncelleme kontrolü başarısız oldu." }, "tips": { "title": "İpuçları", "default": "Varsayılan olarak, kararlı güncellemeler için bildirimler alırsınız. Early Access'te, ön sürüm yapıları üretim çalışması için kararsız olabilir.", "warningTitle": "Bir Uyarı: Nightly Güncellemeleri Otomatik Olarak Uygulanır", "warningBody": "Nightly yapıları, Cursor kapatıldığında sessizce güncellemeleri indirip kuracaktır." } };
const adblock$3 = { "title": "Reklam Engelleyici", "description": "Tarama deneyiminizi iyileştirmek ve gizliliğinizi korumak için rahatsız edici reklamları ve izleyicileri engelleyin.", "enable": "Reklam Engelleyiciyi Etkinleştir", "enableDescription": "Tüm web sitelerindeki reklamları otomatik olarak engelle", "statusActive": "Aktif - Reklamlar engelleniyor", "statusInactive": "İnaktif - Reklamlar engellenmiyor", "adsBlocked": "reklam engellendi", "networkBlocked": "Ağ İstekleri", "cosmeticBlocked": "Gizlenen Öğeler", "filterRules": "Filtre Kuralları", "activeRules": "aktif kural" };
const blank$3 = { "openNewPage": "Yeni boş sayfa aç", "selectBackground": "Arka plan seç", "isAwake": "uyanık", "osIsAwake": "OS uyanık", "osGuideline": "OS Kılavuzu", "osGuidelineDescription": "OS Ajanımıza hızlı başlangıç - mimari, modlar ve yapabildiği her şey.", "intelligence": "Öğretme Modu", "intelligenceDescription": "OS Ajanını görevleri yerine getirmesi ve sonradan yeniden kullanması için eğitin.", "inviteAndEarn": "Davet Et ve Kazan", "tagline": "Aktif bir hafızayla, her eylemle gelişerek sizi gerçekten anlamak için.", "taskPreset": "Görev Ön Ayarı", "credits": "+{{amount}} Kredi", "addPreset": "Yeni ön ayar ekle", "editPreset": "Ön ayarı düzenle", "deletePreset": "Ön ayarı sil", "removeFromHistory": "Geçmişten kaldır", "previousPreset": "Önceki ön ayar", "nextPreset": "Sonraki ön ayar", "previousPresets": "Önceki ön ayarlar", "nextPresets": "Sonraki ön ayarlar", "createPreset": "Ön ayar oluştur", "presetName": "Ön ayar adı", "instruction": "Talimat", "presetNamePlaceholderCreate": "örn., Haftalık Rapor, Kod İncelemesi, Veri Analizi...", "presetNamePlaceholderEdit": "Ön ayar adını girin...", "instructionPlaceholderCreate": `OS'in ne yapmasını istediğinizi açıklayın...
örn., "Bu haftanın satış verilerini analiz et ve özet rapor oluştur"`, "instructionPlaceholderEdit": "Görev talimatınızı güncelleyin...", "colorBlue": "Mavi", "colorGreen": "Yeşil", "colorYellow": "Sarı", "colorRed": "Kırmızı", "selectColor": "{{color}} renk seç", "creating": "Oluşturuluyor...", "updating": "Güncelleniyor...", "create": "Oluştur", "update": "Güncelle", "smartInputPlaceholder": "Gezin, arayın veya Neo'nun devralmasına izin verin...", "processing": "İşleniyor…", "navigate": "Gezin", "navigateDescription": "Bu adresi mevcut sekmede aç", "searchGoogle": "Google'da Ara", "searchGoogleDescription": "Google ile ara", "runTask": "Görevi Çalıştır", "runTaskDescription": "Neo ajanıyla yürüt", "createCanvas": "Canvas'ta Sor", "createCanvasDescription": "Bu istemle Flo canvas'ını aç" };
const agentGuide$3 = { "title": "Ajan Kılavuzu", "subtitle": "OS Ajanına görsel hızlı başlangıç: mimari, modlar ve yapabildiği her şey.", "capabilities": { "heading": "Yetenekler", "navigate": { "title": "Gezinme", "desc": "Sayfaları aç, geri/ileri git" }, "click": { "title": "Tıklama", "desc": "Düğmeler ve bağlantılarla etkileşim" }, "type": { "title": "Yazma", "desc": "Girişleri ve formları doldur" }, "keys": { "title": "Tuşlar", "desc": "Enter, Escape, kısayollar" }, "scroll": { "title": "Kaydırma", "desc": "Uzun sayfalar boyunca hareket" }, "tabs": { "title": "Sekmeler", "desc": "İşaretle, değiştir, kapat" }, "files": { "title": "Dosyalar", "desc": "Yaz, oku, indir" }, "skills": { "title": "Beceriler", "desc": "Paylaşılan bilgi" }, "memories": { "title": "Hafızalar", "desc": "Uzun vadeli tercihler" }, "upload": { "title": "Yükleme", "desc": "Dosyaları sayfalara gönder" }, "ask": { "title": "Sor", "desc": "Hızlı kullanıcı onayları" }, "onlineSearch": { "title": "Çevrimiçi Arama", "desc": "Hızlı web araması" }, "extract": { "title": "Çıkarma", "desc": "Yapılandırılmış bilgi al" }, "deepThink": { "title": "Derin Düşünme", "desc": "Yapılandırılmış analiz" }, "vision": { "title": "Görme", "desc": "DOM dışı hassas işlemler" }, "shell": { "title": "Kabuk", "desc": "Komutları çalıştır (mevcut olduğunda)" }, "report": { "title": "Rapor", "desc": "Bitir ve özetle" } }, "benchmark": { "title": "Online‑Mind2Web Kıyaslaması", "subtitle": "Flowith Neo AgentOS Tüm Kartları Süpürdü: ", "subtitleHighlight": "Neredeyse Mükemmel", "subtitleEnd": " Performansla Dominasyon.", "openai": "OpenAI Operator", "gemini": "Gemini 2.5 Computer Use", "flowith": "Flowith Neo OS", "average": "Ortalama", "easy": "Kolay", "medium": "Orta", "hard": "Zor" }, "skillsMemories": { "heading": "Beceriler ve Hafızalar", "description": "Neo'nun Pro Modunda otomatik olarak başvurduğu yeniden kullanılabilir el kitapları ve uzun vadeli bağlam.", "markdownTag": "Markdown .md", "autoIndexedTag": "Otomatik indekslenmiş", "citationsTag": "Günlüklerde alıntılar", "howNeoUses": "Neo bunları nasıl kullanır: Pro Modundaki her adımdan önce, Neo ilgili Becerileri ve Hafızaları kontrol eder, bunları akıl yürütme bağlamına birleştirir ve talimatları veya tercihleri otomatik olarak uygular.", "skillsTitle": "Beceriler", "skillsTag": "Paylaşılan", "skillsDesc": "Herhangi bir ajanın uygulayabileceği yeniden kullanılabilir bilgileri saklayın. Her Beceri, bir araç, iş akışı veya model hakkında kısa bir kılavuzdur.", "skillsProcedures": "En iyi kullanım: prosedürler", "skillsFormat": "Format: Markdown", "skillsScenario": "Günlük senaryo", "skillsScenarioTitle": "Medya dönüştür ve paylaş", "skillsStep1": `Siz dersiniz: "Bu 20 görseli kompakt bir PDF'e dönüştür."`, "skillsStep2": "Neo beceriyi takip ederek yükler, dönüştürür, tamamlanmasını bekler ve dosyayı kaydeder.", "skillsOutcome": "Sonuç: günlüklerde indirme bağlantısıyla paylaşıma hazır bir PDF.", "memoriesTitle": "Hafızalar", "memoriesTag": "Kişisel", "memoriesDesc": "Tercihlerinizi, profilinizi ve alan bilgilerinizi yakalayın. Neo kararlar verirken ilgili öğelere başvurur ve bunları günlüklerde alıntılar.", "memoriesStyle": "En iyi kullanım: stil, kurallar", "memoriesPrivate": "Varsayılan olarak özel", "memoriesScenario": "Günlük senaryo", "memoriesScenarioTitle": "Yazı sesi ve tonu", "memoriesStep1": "İyimser bir tonla özlü, samimi metinleri seversiniz.", "memoriesStep2": "Neo bunu e-postalarda, raporlarda ve sosyal medya gönderilerinde otomatik olarak uygular.", "memoriesOutcome": "Sonuç: talimatları tekrarlamadan tutarlı marka sesi.", "taskFilesTitle": "Görev Dosyaları", "taskFilesTag": "Görev başına", "taskFilesDesc": "Mevcut görev sırasında oluşturulan geçici dosyalar. Araç G/Ç ve ara sonuçları kolaylaştırırlar ve diğer görevlerle otomatik olarak paylaşılmazlar.", "taskFilesEphemeral": "Geçici", "taskFilesReadable": "Araçlar tarafından okunabilir", "taskFilesScenario": "Günlük senaryo", "taskFilesScenarioTitle": "Seyahat fiyat takipçisi", "taskFilesStep1": "Neo uçuş tablolarını kazır ve bu görev için CSV olarak saklar.", "taskFilesStep2": "Bugünün tarifelerini dünkü ile karşılaştırır ve değişiklikleri vurgular.", "taskFilesOutcome": "Sonuç: düzgün bir özet ve indirilebilir bir CSV." }, "system": { "title": "Neo OS - sizin için en akıllı tarayıcı ajanı", "tagline": "Kendi Kendine Gelişen × Hafıza ve Beceri × Hız ve Zeka", "selfEvolving": "Kendi Kendine Gelişen", "intelligence": "Zeka", "contextImprovement": "Bağlam İyileştirme", "contextDesc": "Yansıtıcı ajan, beceri sistemi aracılığıyla bağlamı gerçek zamanlı olarak iyileştirir", "onlineRL": "Çevrimiçi RL", "onlineRLDesc": "Periyodik güncellemeler ajan davranışlarıyla uyumludur", "intelligentMemory": "Akıllı Hafıza", "architecture": "Mimari", "dualLayer": "Çift Katmanlı Sistem", "dualLayerDesc": "Kısa vadeli tamponlar + uzun vadeli epizodik hafıza", "knowledgeTransfer": "Bilgi Transferi", "knowledgeTransferDesc": "Görevler arasında öğrenmeyi koruma, yeniden kullanma ve transfer etme", "highPerformance": "Yüksek Performans", "infrastructure": "Altyapı", "executionKernel": "Yürütme Çekirdeği", "executionKernelDesc": "Paralel orkestrasyon ve dinamik zamanlama", "speedCaching": "Hız Önbellekleme", "speedCachingDesc": "Gerçek zamanlı yürütmeyle milisaniye yanıt", "speedIndicator": "~1ms", "summary": "Gelişen · Kalıcı · Hızlı" }, "arch": { "heading": "Mimari", "subtitle": "Ajan merkezli OS: CPU (Planlayıcı) + Hafıza/Dosya sistemi + Beceriler + G/Ç", "agentCentricNote": "flowithOS ajanlar için tasarlanmıştır.", "osShell": "OS Kabuğu", "agentCore": "Ajan Çekirdeği", "plannerExecutor": "Planlayıcı · Yürütücü", "browserTabs": "Tarayıcı Sekmeleri", "domCanvas": "DOM · Canvas", "filesMemoriesSkills": "Dosyalar · Hafızalar · Beceriler", "domPageTabs": "DOM · Sayfa · Sekmeler", "clickTypeScroll": "Tıkla · Yaz · Kaydır", "visionNonDOM": "Görme · DOM Dışı İşlemler", "captchaDrag": "CAPTCHA · Sürükle", "onlineSearchThinking": "Çevrimiçi Arama · Derin Düşünme", "googleAnalysis": "google · analiz", "askUserReport": "Kullanıcıya Sor · Rapor", "choicesDoneReport": "seçenekler · bitti_ve_rapor", "skillsApps": "Beceriler (Uygulamalar)", "skillsKinds": "Sistem · Kullanıcı · Paylaşılan", "memory": "Hafıza", "memoryKinds": "Kısa vadeli · Uzun vadeli", "filesystem": "Dosya sistemi", "filesystemKinds": "Görev Dosyaları · Varlıklar · Günlükler", "cpuTitle": "CPU — Planlama Ajanı", "cpuSub": "Planlayıcı · Yürütücü · Yansıtıcı", "planRow": "Planla → Ayrıştır → Yönlendir", "execRow": "Yürüt → Gözlemle → Yansıt", "ioTitle": "G/Ç Yetenekleri", "browserUse": "Tarayıcı Kullanımı", "browserUseDesc": "DOM · Sekmeler · Görme · CAPTCHA", "terminalUse": "Terminal Kullanımı", "terminalUseDesc": "Kabuk · Araçlar · Betikler", "scriptUse": "Betik Kullanımı", "scriptUseDesc": "Python · JS · Worker'lar", "osVsHumanTitle": "Ajan OS vs İnsan Merkezli OS", "osVsHuman1": "Uygulamalar Beceri olur: Ajanlar tarafından okunmak için tasarlanır, UI'lar için değil", "osVsHuman2": "CPU G/Ç aracılığıyla planlar/yürütür; kullanıcı görev düzeyinde denetler", "osVsHuman3": "Hafıza görevler arasında kalır; Dosya sistemi araç G/Ç'sini destekler" }, "tips": { "heading": "İpuçları", "beta": "FlowithOS şu anda Beta'dadır; hem ürün hem de Ajan Neo sürekli olarak güncellenmektedir. Lütfen en son güncellemeler için takipte kalın.", "improving": "Ajan Neo OS'in yetenekleri gün be gün artıyor, görevlerinizi tamamlamak için yeni yetenekleri kullanmayı deneyebilirsiniz." } };
const reward$3 = { "helloWorld": "Hello World", "helloWorldDesc": `Bu Yeni Çağdaki "Hello World" Anınızdır.<br />İnsan Tarihinde Ajan İnterneti'ne İlk İzini Bırakanlar Arasında Olun.`, "get2000Credits": "2.000 Bonus Kredinizi Talep Edin", "equivalent7Days": "Ve Sosyal Medya İşlemlerinizi 7 Gün Boyunca Otomatikleştirin.", "shareInstructions": `Uyandıktan sonra, kişisel Ajanınızı dünyaya tanıtın.<br />NeoOS sizin için otomatik olarak X'te bir "Hello World" mesajı oluşturacak ve yayınlayacak<br />tıpkı daha sonra sizin için yapabileceği her şey gibi.<br /><span style='display: block; height: 8px;'></span>Arkanıza yaslanın ve olmasını izleyin.`, "osComing": "OS Geliyor", "awakeOS": "OS'i Uyandır", "page2Title": "Davet Et ve Kazan", "page2Description1": "Harika bir yolculuk arkadaşlarla daha güzeldir.", "page2Description2": "Katılan her arkadaş için size", "page2Description3": "kendi düşüncelerinize güç katmak için kredi hediye edilecek.", "retry": "Tekrar Dene", "noCodesYet": "Henüz davet kodu yok", "activated": "Etkinleştirildi", "neoStarting": "Neo otomatik paylaşım görevini başlatıyor...", "failed": "Başarısız", "unknownError": "Bilinmeyen hata", "errorRetry": "Hata oluştu, lütfen tekrar deneyin", "unexpectedResponse": "Sunucudan beklenmeyen yanıt", "failedToLoadCodes": "Davet kodları yüklenemedi", "congratsCredits": "Tebrikler! +{{amount}} Kredi", "rewardUnlocked": "Paylaşım ödülü kilidi açıldı" };
const agentWidget$3 = { "modes": { "fast": { "label": "Hızlı mod", "description": "Görevleri mümkün olduğunca hızlı bitirin, Beceriler ve Hafızalar kullanılmayacak.", "short": "Hızlı", "modeDescription": "Daha hızlı eylemler, daha az detay" }, "pro": { "label": "Pro mod", "description": "En yüksek kalite: derin akıl yürütmeyle adım adım görsel analiz. Gerektiğinde Beceriler ve Hafızalara başvurur.", "short": "Pro", "modeDescription": "Dengeli, Neo'nun karar vermesine izin ver" } }, "minimize": "Küçült", "placeholder": "Neo OS Ajanından yapmasını istediğiniz şeyi sorun...", "changeModeTooltip": "Ajanın davranışını ayarlamak için modu değiştir", "preset": "Ön Ayar", "selectPresetTooltip": "Kullanılacak bir ön ayar seç", "addNewPreset": "Yeni ön ayar ekle", "agentHistoryTooltip": "Ajanın eylem geçmişi", "createPreset": "Ön ayar oluştur", "presetName": "Ön ayar adı", "instruction": "Talimat", "upload": "Yükle", "newTask": "Yeni Görev", "draft": "Taslak", "copyPrompt": "İstemi kopyala", "showMore": "Daha fazla göster", "showLess": "Daha az göster", "agentIsWorking": "Ajan çalışıyor", "agentIsWrappingUp": "Ajan tamamlıyor", "completed": "Tamamlandı", "paused": "Duraklatıldı", "created": "Oluşturuldu", "selectTask": "Bir görev seç", "unpin": "Sabitlemeyi Kaldır", "pinToRight": "Sağa sabitle", "stepsCount": "Adımlar ({{count}})", "files": "Dosyalar", "filesCount": "Dosyalar ({{count}})", "noFilesYet": "Henüz dosya oluşturulmadı", "status": { "wrappingUp": "Ajan tamamlıyor...", "thinking": "Ajan düşünüyor...", "wrappingUpAction": "Mevcut eylem tamamlanıyor..." }, "actions": { "markedTab": "İşaretli Sekme", "openRelatedTab": "İlgili Sekmeyi Aç (Devam ediyor)", "open": "Aç", "openTab": "Sekmeyi Aç", "showInFolder": "Klasörde göster", "preview": "Önizle", "followUpPrefix": "Siz", "actionsHeader": "Eylemler" }, "controls": { "rerun": "Yeniden Çalıştır (Devam ediyor)", "pause": "Duraklat", "pauseAndArchive": "Duraklat ve arşivle", "resume": "Devam Et", "wrappingUpDisabled": "Tamamlanıyor..." }, "input": { "sending": "Gönderiliyor...", "adjustTaskPlaceholder": "Ajan Neo için görevi ayarlamak üzere yeni bir mesaj gönderin..." }, "legacy": { "readOnlyNotice": "Bu, önceki bir sürümden kalma eski bir görevdir. Sadece görüntüleme modu." }, "refunded": { "noFollowUp": "Bu görev iade edildi. Takip mesajları kullanılamıyor." }, "skills": { "matchingSkills": "ilgili beceriler eşleştiriliyor…", "scanningSkills": "Sinirsel titreşim mevcut becerileri tarıyor!!!", "scanningMap": "Sinirsel beceri haritası taranıyor…" }, "billing": { "creditsDepletedTitle": "Devam etmek için daha fazla kredi ekleyin", "creditsDepletedMessage": "Kredileriniz tükendiği için ajan duraklatıldı. Kredi ekleyin veya faturalandırmayı güncelleyin, ardından hazır olduğunuzda görevi yeniden çalıştırın." }, "presetActions": { "editPreset": "Ön ayarı düzenle", "deletePreset": "Ön ayarı sil" }, "feedback": { "success": { "short": "Harika iş!", "long": "Şu ana kadar çok iyi, harika iş!" }, "refund": { "short": "Hay aksi, iade!", "long": "Hay aksi, kredilerimi geri istiyorum!" }, "refundSuccess": { "long": "Harika! Kredileriniz iade edildi!" }, "modal": { "title": "Kredi İadesi Talep Et", "credits": "{{count}} kredi", "description": "Bu görevden memnun değilseniz, iade talep edin ve bu görevde kullanılan tüm kredileri anında iade edeceğiz.", "whatGoesWrong": "Ne yanlış gitti", "errorMessage": "Üzgünüz, lütfen daha fazla ayrıntı verin", "placeholder": "Neyin yanlış gittiğini açıklayın...", "shareTask": "Bu görevi bizimle paylaş", "shareDescription": "Görevinizden tüm kişisel ayrıntıları anonimleştireceğiz. Görevinizi bizimle paylaşarak, gelecekte benzer görevlerde ajanımızın performansını geliştireceğiz.", "upload": "Yükle", "attachFile": "dosya ekle", "submit": "Gönder", "submitting": "Gönderiliyor...", "alreadyRefunded": { "title": "Zaten İade Edildi", "message": "Bu görev zaten iade edildi. Tekrar iade talebinde bulunamazsınız." } }, "errors": { "systemError": "Sistem hatası. Lütfen destek ekibimizle iletişime geçin.", "networkError": "Ağ hatası. Lütfen bağlantınızı kontrol edin ve tekrar deneyin.", "noUsageData": "Kullanım verileri bulunamadı. İade yapılamıyor.", "alreadyRefunded": "Bu görev zaten iade edildi.", "notAuthenticated": "İade talebinde bulunmak için lütfen giriş yapın.", "unknownError": "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.", "validationFailed": "Nedeniniz şu anda doğrulanamıyor. Lütfen daha sonra tekrar deneyin.", "invalidReason": "Neden reddedildi. Lütfen gerçekte neyin yanlış gittiğini açıklayın." }, "confirmation": { "creditsRefunded": "{{count}} Kredi İade Edildi", "title": "Başarılı", "message": "Teşekkürler! Ekibimiz görevinizi teşhis edecek ve FlowithOS deneyimini iyileştirecektir.", "messageNoShare": "Teşekkürler! Ekibimiz FlowithOS deneyimini iyileştirmek için çalışmaya devam edecektir." } } };
const gate$3 = { "welcome": { "title": "FlowithOS'a Hoş Geldiniz", "subtitle": "Web'den Dünyaya, FlowithOS tarayıcınızı gerçek dünya değerlerine dönüştüren En Akıllı Ajantik OS'tir.", "features": { "execute": { "title": "Herhangi Bir Görevi Otomatik Olarak Yürütün", "description": "İnsan sezgisiyle makine hızında hareket eden FlowithOS, web'de tekrar tekrar birden fazla görevi gezinir ve yürütür." }, "transform": { "title": "Fikirleri Akıllıca Etkiye Dönüştürün", "description": "İlhamdan değer yaratmaya, FlowithOS büyük fikirleri gerçek sonuçlar sunmak için eylemlere dönüştürür." }, "organize": { "title": "Varlıklarınızı Sistematik Olarak Düzenleyin", "description": "Rastgele yer imlerinden yapılandırılmış el kitaplarına, FlowithOS dijital varlıklarınızı yönetmek, düzenlemek ve ölçeklendirmek için sağlam bir sistemle donatır." }, "evolve": { "title": "Sizinle Dinamik Olarak Gelişin", "description": "Her etkileşimden büyüyen bir Hafızayla, FlowithOS karmaşık sitelerde gezinmeden kişisel tarzınızı anlamaya kadar özel Beceriler geliştirir." } }, "letsGo": "Hadi Başlayalım!" }, "auth": { "createAccount": "Hesap oluştur", "signInToFlowith": "Flowith hesabınıza giriş yapın", "oneAccount": "Tüm flowith ürünleri için tek hesap", "fromAnotherAccount": "Şununla giriş yap:", "useOwnEmail": "Veya kendi e-postanızı kullanın", "email": "E-posta", "password": "Şifre", "confirmPassword": "Şifreyi onayla", "acceptTerms": "FlowithOS'un Kullanım Şartları ve Gizlilik Politikasını kabul ediyorum", "privacyNote": "Tüm verileriniz cihazınızda %100 güvenli kalır", "alreadyHaveAccount": "Zaten bir Flowith Hesabınız var mı?", "createNewAccount": "Hesabınız yok mu? Kaydolun", "signUp": "Kaydol", "signIn": "Giriş yap", "processing": "İşleniyor...", "verifyEmail": "E-postanızı Doğrulayın", "verificationCodeSent": "{{email}} adresine 6 haneli bir doğrulama kodu gönderdik", "enterVerificationCode": "Doğrulama kodunu girin", "verificationCode": "Doğrulama Kodu", "enterSixDigitCode": "6 haneli kodu girin", "backToSignUp": "Kayıt olma sayfasına geri dön", "verifying": "Doğrulanıyor...", "verifyCode": "Kodu Doğrula", "errors": { "enterEmail": "Lütfen e-postanızı girin", "enterPassword": "Lütfen şifrenizi girin", "confirmPassword": "Lütfen şifrenizi onaylayın", "passwordsDoNotMatch": "Şifreler eşleşmiyor", "acceptTerms": "Lütfen Kullanım Şartları ve Gizlilik Politikasını kabul edin", "authFailed": "Kimlik doğrulama başarısız oldu. Lütfen tekrar deneyin.", "invalidVerificationCode": "Lütfen geçerli bir 6 haneli doğrulama kodu girin", "verificationFailed": "Doğrulama başarısız oldu. Lütfen tekrar deneyin.", "oauthFailed": "OAuth kimlik doğrulaması başarısız oldu. Lütfen tekrar deneyin.", "userAlreadyExists": "Bu e-posta zaten kayıtlı. Lütfen " }, "goToLogin": "giriş sayfasına gidin", "signInPrompt": "giriş yapın" }, "invitation": { "title": "Uyanış bir anahtar gerektirir", "subtitle": "FlowithOS'un kilidini açmak için lütfen davet kodunuzu girin", "lookingForInvite": "Davet mi arıyorsunuz?", "followOnX": "X'te @flowith'i takip edin", "toGetAccess": "erişim kazanmak için.", "placeholder": "Davet kodum", "invalidCode": "Geçersiz davet kodu", "verificationFailed": "Doğrulama başarısız oldu - lütfen tekrar deneyin", "accessGranted": "Erişim Verildi", "initializing": "FlowithOS'a hoş geldiniz. Başlatılıyor..." }, "browserImport": { "title": "Kaldığınız yerden devam edin", "subtitle": "Mevcut tarayıcılarınızdan yer imlerinizi ve kayıtlı oturumlarınızı sorunsuz bir şekilde içe aktarın.", "detecting": "Yüklü tarayıcılar tespit ediliyor...", "noBrowsers": "Yüklü tarayıcı tespit edilemedi", "imported": "İçe aktarıldı", "importing": "İçe aktarılıyor...", "bookmarks": "yer imi", "importNote": "İçe aktarma yaklaşık 5 saniye sürer. Bir veya iki sistem istemi göreceksiniz.", "skipForNow": "Şimdilik atla", "nextStep": "Sonraki adım" }, "settings": { "title": "Akışa Hazır Mısınız?", "subtitle": "Flowith OS deneyiminizi mükemmelleştirmek için birkaç hızlı ayarlama.", "defaultBrowser": { "title": "Varsayılan Tarayıcı Olarak Ayarla", "description": "Web'in size akmasını sağlayın. Bağlantılar doğrudan FlowithOS'ta açılacak, çevrimiçi içeriği çalışma alanınıza sorunsuz bir şekilde dokuyacak." }, "addToDock": { "title": "Dock / Görev Çubuğuna Ekle", "description": "Yaratıcı merkezinizi ilham geldiğinde anında erişim için tek tıkla uzakta tutun." }, "launchAtStartup": { "title": "Başlangıçta Başlat", "description": "Gününüze yaratmaya hazır başlayın. Flowith OS giriş yaptığınız anda sizi bekliyor olacak." }, "helpImprove": { "title": "Bizi İyileştirmemize Yardımcı Olun", "description": "Herkes için daha iyi bir ürün oluşturmamıza yardımcı olmak için anonim kullanım verilerini paylaşın.", "privacyNote": "Gizliliğiniz tam olarak korunmaktadır." }, "canChangeSettingsLater": "Bu ayarları daha sonra değiştirebilirsiniz", "nextStep": "Sonraki Adım", "privacy": { "title": "%100 Yerel Depolama ve Gizlilik Koruması", "description": "Ajan yürütme geçmişiniz, tarama geçmişiniz, Hafızalar ve Beceriler, hesap kimlik bilgileriniz ve tüm gizlilik verileri cihazınızda %100 yerel olarak saklanır. Hiçbir şey bulut sunucularıyla senkronize edilmez. FlowithOS'u tam bir gönül rahatlığıyla kullanabilirsiniz." } }, "examples": { "title1": "OS Uyanık.", "title2": "Aksiyonda Görün.", "subtitle": "Nasıl çalıştığını görmek için bir örnekle başlayın.", "enterFlowithOS": "FlowithOS'a Girin", "clickToReplay": "bu vakayı tekrar oynatmak için tıklayın", "videoNotSupported": "Tarayıcınız video oynatmayı desteklemiyor.", "cases": { "shopping": { "title": "Tatil Alışverişini 10 Kat Daha Hızlı Tamamlayın", "description": "Sepetinizi mükemmel yavru köpek hediye setiyle doldurur—manuel taramadan 2+ saat tasarruf eder." }, "contentEngine": { "title": "7/24 X İçerik Motoru", "description": "En iyi Hacker News hikayelerini keşfeder, benzersiz sesinizle yazar ve X'te otomatik olarak gönderir. Profil ziyaretlerini 3 kat artırır ve gerçek topluluk büyümesi sağlar." }, "tiktok": { "title1": "TikTok Heyecan Oluşturucu: 500+ Etkileşim,", "title2": "0 Çaba", "description": "Flowith OS yüksek trafikli canlı yayınları kültürel olarak keskin yorumlarla doldurur, dijital varlığı ölçülebilir momentuma dönüştürür." }, "youtube": { "title": "%95 Otonom Youtube Kanal Büyümesi", "description": "Flowith OS yaratımdan topluluğa tüm yüzsüz YouTube iş akışını kolaylaştırır, haftalarca süren işi bir saatten kısa sürede yoğunlaştırır." } } }, "oauth": { "connecting": "{{provider}} ile bağlanılıyor", "completeInBrowser": "Lütfen açılan tarayıcı sekmesinde kimlik doğrulamayı tamamlayın.", "cancel": "İptal" }, "terms": { "title": "Kullanım Şartları ve Gizlilik Politikası", "subtitle": "Lütfen aşağıdaki şartları inceleyin.", "close": "Kapat" }, "invitationCodes": { "title": "Davet Kodlarım", "availableToShare": "{{total}} koddan {{unused}} tanesi paylaşılabilir", "loading": "Kodlarınız yükleniyor...", "noCodesYet": "Henüz davet kodu yok.", "noCodesFound": "Davet kodu bulunamadı", "failedToLoad": "Davet kodları yüklenemedi", "useCodeHint": "Kendi kodlarınızı almak için bir davet kodu kullanın!", "shareHint": "Bu kodları arkadaşlarınızla paylaşarak onları FlowithOS'a davet edin", "used": "Kullanıldı" }, "history": { "title": "Geçmiş", "searchPlaceholder": "Geçmişte ara...", "selectAll": "Tümünü Seç", "deselectAll": "Tümünün Seçimini Kaldır", "deleteSelected": "Seçilenleri Sil ({{count}})", "clearAll": "Tümünü Temizle", "loading": "Geçmiş yükleniyor...", "noMatchingHistory": "Eşleşen geçmiş bulunamadı", "noHistoryYet": "Henüz geçmiş yok", "confirmDelete": "Silme İşlemini Onayla", "deleteConfirmMessage": "Seçili geçmişi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.", "cancel": "İptal", "delete": "Sil", "today": "Bugün", "yesterday": "Dün", "earlier": "Daha Önce", "untitled": "Başlıksız", "visitedTimes": "{{count}} kez ziyaret edildi", "openInNewTab": "Yeni sekmede aç", "timePeriod": "Zaman Aralığı", "timeRangeAll": "Tümü", "timeRangeAllDesc": "Tüm tarama geçmişi", "timeRangeToday": "Bugün", "timeRangeTodayDesc": "Bugünkü tüm geçmiş", "timeRangeYesterday": "Dün", "timeRangeYesterdayDesc": "Dünkü geçmiş", "timeRangeLast7Days": "Son 7 gün", "timeRangeLast7DaysDesc": "Geçen haftadan beri olan geçmiş", "timeRangeThisMonth": "Bu ay", "timeRangeThisMonthDesc": "Bu aydan beri olan geçmiş", "timeRangeLastMonth": "Geçen ay", "timeRangeLastMonthDesc": "Geçen aydan olan geçmiş", "deleteTimeRange": "{{range}} öğelerini sil" } };
const update$3 = { "checking": { "title": "Güncellemeler kontrol ediliyor", "description": "Güncelleme sunucusuna bağlanılıyor..." }, "noUpdate": { "title": "Güncelsiniz", "currentVersion": "Mevcut sürüm v{{version}}", "description": "Zaten en son sürümü kullanıyorsunuz", "close": "Kapat" }, "available": { "title": "Yeni sürüm mevcut", "version": "v{{version}} mevcut", "currentVersion": "(Mevcut: v{{current}})", "released": "{{time}} yayınlandı", "betaNote": "Açık beta'dayız ve her gün iyileştirmeler gönderiyoruz. Güncel kalmak için şimdi güncelleyin.", "defaultReleaseNotes": "Bu beta sürümü performans iyileştirmeleri, hata düzeltmeleri ve yeni özellikler içerir. Her gün güncelleme gönderiyoruz. En iyi deneyim için lütfen şimdi güncelleyin.", "downloadNow": "Şimdi indir", "remindLater": "Daha sonra hatırlat", "preparing": "Hazırlanıyor..." }, "downloading": { "title": "Güncelleme indiriliyor", "version": "v{{version}} indiriliyor", "progress": "İndirme ilerlemesi", "hint": "İndirilen yükleyiciyi aşağıdaki düğmeye tıklayarak açabilirsiniz" }, "readyToInstall": { "title": "Yüklemeye hazır", "downloaded": "v{{version}} indirmesi tamamlandı", "hint": "Güncellemenin yüklenmesini bitirmek için yeniden başlatın", "restartNow": "Şimdi yeniden başlat", "restartLater": "Daha sonra yeniden başlat", "restarting": "Yeniden başlatılıyor..." }, "error": { "title": "Güncelleme kontrolü başarısız oldu", "default": "Güncelleme başarısız oldu. Lütfen daha sonra tekrar deneyin.", "downloadFailed": "İndirme başarısız oldu. Lütfen daha sonra tekrar deneyin.", "installFailed": "Yükleme başarısız oldu. Lütfen daha sonra tekrar deneyin.", "close": "Kapat", "noChannelPermission": "Hesabınızın {{channel}} güncelleme kanalına erişimi yok. Lütfen Stable'a geçin ve tekrar deneyin.", "switchToStable": "Stable'a geç ve tekrar dene" }, "time": { "justNow": "şimdi", "minutesAgo": "{{count}} dakika önce", "hoursAgo": "{{count}} saat önce" }, "notifications": { "newVersionAvailable": "Yeni sürüm {{version}} mevcut", "downloadingInBackground": "Arka planda indiriliyor", "updateDownloaded": "Güncelleme indirildi", "readyToInstall": "Sürüm {{version}} yüklenmeye hazır" } };
const updateToast$3 = { "checking": "Güncellemeler kontrol ediliyor...", "pleaseWait": "Lütfen bekleyin", "preparingDownload": "{{version}} indirmeye hazırlanılıyor", "downloading": "Güncelleme {{version}} indiriliyor", "updateCheckFailed": "Güncelleme kontrolü başarısız oldu", "unknownError": "Bilinmeyen hata", "updatedTo": "v{{version}} sürümüne güncellendi", "newVersionReady": "Yeni sürüm hazır", "version": "Sürüm {{version}}", "close": "Kapat", "gotIt": "Anladım", "installNow": "Şimdi Yeniden Başlat", "restarting": "Yeniden başlatılıyor…", "later": "Sonra", "collapseUpdateContent": "Güncelleme içeriğini daralt", "viewUpdateContent": "Güncelleme içeriğini görüntüle", "collapseLog": "Daralt ^", "viewLog": "Günlüğü görüntüle >", "channelChangeFailed": "Kanal değiştirme başarısız oldu: {{error}}", "channelInfo": "Kanal: {{channel}}, Manifest: {{manifest}}", "manualDownloadHint": "Otomatik yükleme başarısız oldu mu? Lütfen manuel olarak yükleyin →", "channelDowngraded": { "title": "Kanal Değiştirildi", "message": "Hesabınızın {{previousChannel}} erişimi yok. Otomatik olarak {{newChannel}}'a geçildi." }, "time": { "justNow": "şimdi", "minutesAgo": "{{count}} dakika önce", "hoursAgo": "{{count}} saat önce", "daysAgo": "{{count}} gün önce", "weeksAgo": "{{count}} hafta önce", "monthsAgo": "{{count}} ay önce", "yearsAgo": "{{count}} yıl önce" } };
const errors$3 = { "auth": { "notLoggedIn": "Lütfen önce giriş yapın", "loginRequired": "Bu özelliği kullanmadan önce lütfen giriş yapın", "shareRequiresLogin": "Paylaşım özelliğini kullanmadan önce lütfen giriş yapın" }, "network": { "networkError": "Ağ hatası - lütfen bağlantınızı kontrol edin", "requestTimeout": "İstek zaman aşımı - lütfen tekrar deneyin", "failedToVerify": "Erişim doğrulanamadı", "failedToFetch": "Kodlar getirilemedi" }, "invitation": { "invalidCode": "Geçersiz davet kodu", "verificationFailed": "Doğrulama başarısız oldu - lütfen tekrar deneyin", "failedToConsume": "Davet kodu kullanılamadı" }, "download": { "downloadFailed": "İndirme başarısız oldu", "downloadInterrupted": "İndirme kesildi" }, "security": { "secureConnection": "Güvenli Bağlantı", "notSecure": "Güvenli Değil", "localFile": "Yerel Dosya", "unknownProtocol": "Bilinmeyen Protokol" } };
const menus$3 = { "application": { "about": "{{appName}} Hakkında", "checkForUpdates": "Güncellemeleri Kontrol Et...", "settings": "Ayarlar...", "services": "Hizmetler", "hide": "{{appName}}'i Gizle", "hideOthers": "Diğerlerini Gizle", "showAll": "Tümünü Göster", "quit": "Çıkış", "updateChannel": "Güncelleme Kanalı" }, "edit": { "label": "Düzenle", "undo": "Geri Al", "redo": "Yinele", "cut": "Kes", "paste": "Yapıştır", "selectAll": "Tümünü Seç" }, "view": { "label": "Görünüm", "findInPage": "Sayfada Bul", "newTab": "Yeni Sekme", "reopenClosedTab": "Kapalı Sekmeyi Yeniden Aç", "newTerminalTab": "Yeni Terminal Sekmesi", "openLocalFile": "Yerel Dosya Aç...", "goBack": "Geri Git", "goForward": "İleri Git", "viewHistory": "Geçmişi Görüntüle", "viewDownloads": "İndirmeleri Görüntüle", "archive": "Arşiv", "reload": "Yenile", "forceReload": "Zorla Yenile", "actualSize": "Gerçek Boyut", "zoomIn": "Yakınlaştır", "zoomOut": "Uzaklaştır", "toggleFullScreen": "Tam Ekranı Aç/Kapat" }, "window": { "label": "Pencere", "minimize": "Küçült", "close": "Kapat", "bringAllToFront": "Tümünü Öne Getir" }, "help": { "label": "Yardım", "about": "Hakkında", "version": "Sürüm", "aboutDescription1": "Yeni nesil AI Ajan İşletim Sistemi", "aboutDescription2": "kendini geliştirme, hafıza ve hız için tasarlandı.", "copyright": "© 2025 Flowith, Inc. Tüm hakları saklıdır." }, "contextMenu": { "back": "Geri", "forward": "İleri", "reload": "Yenile", "hardReload": "Sert Yenileme (Önbelleği Yoksay)", "openLinkInNewTab": "Bağlantıyı Yeni Sekmede Aç", "openLinkInExternal": "Bağlantıyı Harici Tarayıcıda Aç", "copyLinkAddress": "Bağlantı Adresini Kopyala", "downloadLink": "Bağlantıyı İndir", "openImageInNewTab": "Görseli Yeni Sekmede Aç", "copyImageAddress": "Görsel Adresini Kopyala", "copyImage": "Görseli Kopyala", "downloadImage": "Görseli İndir", "downloadVideo": "Videoyu İndir", "downloadAudio": "Sesi İndir", "openMediaInNewTab": "Medyayı Yeni Sekmede Aç", "copyMediaAddress": "Medya Adresini Kopyala", "openFrameInNewTab": "Çerçeveyi Yeni Sekmede Aç", "openInExternal": "Harici Tarayıcıda Aç", "copyPageURL": "Sayfa URL'sini Kopyala", "viewPageSource": "Sayfa Kaynağını Görüntüle (Yeni Sekme)", "savePageAs": "Sayfayı Farklı Kaydet…", "print": "Yazdır…", "cut": "Kes", "paste": "Yapıştır", "searchWebFor": `Web'de "{{text}}" için ara`, "selectAll": "Tümünü Seç", "inspectElement": "Öğeyi İncele", "openDevTools": "Geliştirici Araçlarını Aç", "closeDevTools": "Geliştirici Araçlarını Kapat" }, "fileDialog": { "openLocalFile": "Yerel Dosya Aç", "unsupportedFileType": "Desteklenmeyen Dosya Türü", "savePageAs": "Sayfayı Farklı Kaydet", "allSupportedFiles": "Tüm Desteklenen Dosyalar", "htmlFiles": "HTML Dosyaları", "textFiles": "Metin Dosyaları", "images": "Görseller", "videos": "Videolar", "audio": "Ses", "pdf": "PDF", "webpageComplete": "Web Sayfası, Tam", "singleFile": "Tek Dosya (MHTML)" } };
const dialogs$3 = { "crash": { "title": "Uygulama Hatası", "message": "Beklenmeyen bir hata oluştu", "detail": "{{error}}\n\nHata, hata ayıklama amacıyla kaydedildi.", "restart": "Yeniden Başlat", "close": "Kapat" }, "customBackground": { "title": "Özel Arka Plan", "subtitle": "Kendi benzersiz tarzınızı yaratın", "preview": "Önizleme", "angle": "Açı", "stops": "Duraklar", "selectImage": "Görsel Seç", "uploading": "Yükleniyor...", "dropImageHere": "Görseli buraya bırakın", "dragAndDrop": "Sürükle bırak veya tıkla", "fileTypes": "PNG, JPG, JPEG, WEBP, SVG, GIF", "fit": "Sığdır", "cover": "Kapla", "contain": "İçer", "fill": "Doldur", "remove": "Kaldır", "cancel": "İptal", "apply": "Uygula", "gradient": "Gradyan", "solid": "Düz", "image": "Görsel", "dropImageError": "Lütfen bir görsel dosyası bırakın (PNG, JPG, JPEG, WEBP, SVG veya GIF)" } };
const humanInput$3 = { "declinedToAnswer": "Kullanıcı yanıtlamayı reddetti, bu soru atlandı", "needOneInput": "Devam etmek için 1 girdi gerekli", "needTwoInputs": "2 konuda yardımınıza ihtiyacım var", "needThreeInputs": "Sizden 3 karar gerekli", "waitingOnInputs": "Sizden {{count}} girdi bekleniyor", "declineToAnswer": "Yanıtlamayı reddet", "dropFilesHere": "Dosyaları buraya bırakın", "typeYourAnswer": "Cevabınızı yazın...", "orTypeCustom": "Veya özel yazın...", "uploadFiles": "Dosyaları yükle", "previousQuestion": "Önceki soru", "goToQuestion": "{{number}} numaralı soruya git", "nextQuestion": "Sonraki soru" };
const tr = {
  common: common$3,
  nav: nav$3,
  tray: tray$3,
  actions: actions$3,
  status: status$3,
  time: time$3,
  downloads: downloads$3,
  history: history$3,
  invitationCodes: invitationCodes$3,
  tasks: tasks$3,
  flows: flows$3,
  bookmarks: bookmarks$3,
  conversations: conversations$3,
  intelligence: intelligence$3,
  sidebar: sidebar$3,
  tabs: tabs$3,
  userMenu: userMenu$3,
  settings: settings$3,
  updateSettings: updateSettings$3,
  adblock: adblock$3,
  blank: blank$3,
  agentGuide: agentGuide$3,
  reward: reward$3,
  agentWidget: agentWidget$3,
  gate: gate$3,
  update: update$3,
  updateToast: updateToast$3,
  errors: errors$3,
  menus: menus$3,
  dialogs: dialogs$3,
  humanInput: humanInput$3
};
const common$2 = { "ok": "OK", "cancel": "Hủy", "start": "Bắt đầu", "delete": "Xóa", "close": "Đóng", "save": "Lưu", "search": "Tìm kiếm", "loading": "Đang tải", "pressEscToClose": "Nhấn ESC để đóng", "copyUrl": "Sao chép URL", "copied": "Đã sao chép", "copy": "Sao chép", "expand": "Mở rộng", "collapse": "Thu gọn", "openFlowithWebsite": "Mở trang web Flowith", "openAgentGuide": "Mở hướng dẫn Agent", "reward": "Phần thưởng", "closeWindow": "Đóng cửa sổ", "minimizeWindow": "Thu nhỏ cửa sổ", "toggleFullscreen": "Chuyển chế độ toàn màn hình", "saveEnter": "Lưu (Enter)", "cancelEsc": "Hủy (Esc)", "time": { "justNow": "vừa xong", "minutesAgo": "{{count}} phút trước", "hoursAgo": "{{count}} giờ trước", "daysAgo": "{{count}} ngày trước" } };
const nav$2 = { "tasks": "Nhiệm vụ", "flows": "Flows", "bookmarks": "Dấu trang", "intelligence": "Trí tuệ", "guide": "Hướng dẫn" };
const tray$2 = { "newTask": "Nhiệm vụ mới", "recentTasks": "Nhiệm vụ gần đây", "viewMore": "Xem thêm", "showMainWindow": "Hiện cửa sổ chính", "hideMainWindow": "Ẩn cửa sổ chính", "quit": "Thoát" };
const actions$2 = { "resume": "Tiếp tục", "pause": "Tạm dừng", "cancel": "Hủy", "delete": "Xóa", "archive": "Lưu trữ", "showInFolder": "Hiển thị trong thư mục", "viewDetails": "Xem chi tiết", "openFile": "Mở tệp" };
const status$2 = { "inProgress": "Đang thực hiện", "completed": "Đã hoàn thành", "archive": "Lưu trữ", "paused": "Đã tạm dừng", "failed": "Thất bại", "cancelled": "Đã hủy", "running": "Đang chạy", "wrappingUp": "Đang hoàn tất..." };
const time$2 = { "today": "Hôm nay", "yesterday": "Hôm qua", "earlier": "Trước đó" };
const downloads$2 = { "title": "Tải xuống", "all": "Tất cả", "inProgress": "Đang tải", "completed": "Đã hoàn thành", "noDownloads": "Không có tải xuống", "failedToLoad": "Không thể tải danh sách tải xuống", "deleteConfirmMessage": "Bạn có chắc chắn muốn xóa các tệp tải xuống đã chọn? Hành động này không thể hoàn tác.", "loadingDownloads": "Đang tải danh sách tải xuống...", "searchPlaceholder": "Tìm kiếm tải xuống...", "selectAll": "Chọn tất cả", "deselectAll": "Bỏ chọn tất cả", "deleteSelected": "Xóa đã chọn ({{count}})", "clearAll": "Xóa tất cả", "noMatchingDownloads": "Không tìm thấy tải xuống phù hợp", "noDownloadsYet": "Chưa có tải xuống nào", "confirmDelete": "Xác nhận xóa", "cancel": "Hủy", "delete": "Xóa" };
const history$2 = { "title": "Lịch sử", "allTime": "Tất cả thời gian", "clearHistory": "Xóa lịch sử", "removeItem": "Xóa mục", "failedToLoad": "Không thể tải lịch sử", "failedToClear": "Không thể xóa lịch sử", "searchPlaceholder": "Tìm kiếm lịch sử...", "selectAll": "Chọn tất cả", "deselectAll": "Bỏ chọn tất cả", "deleteSelected": "Xóa đã chọn ({{count}})", "clearAll": "Xóa tất cả", "noMatchingHistory": "Không tìm thấy lịch sử phù hợp", "noHistoryYet": "Chưa có lịch sử", "confirmDelete": "Xác nhận xóa", "deleteConfirmMessage": "Bạn có chắc chắn muốn xóa lịch sử đã chọn? Hành động này không thể hoàn tác.", "cancel": "Hủy", "delete": "Xóa", "today": "Hôm nay", "yesterday": "Hôm qua", "earlier": "Trước đó", "untitled": "Không có tiêu đề", "visitedTimes": "Đã truy cập {{count}} lần", "openInNewTab": "Mở trong tab mới", "loading": "Đang tải lịch sử...", "timePeriod": "Khoảng thời gian", "timeRangeAll": "Tất cả", "timeRangeAllDesc": "Toàn bộ lịch sử duyệt web", "timeRangeToday": "Hôm nay", "timeRangeTodayDesc": "Tất cả lịch sử từ hôm nay", "timeRangeYesterday": "Hôm qua", "timeRangeYesterdayDesc": "Lịch sử từ hôm qua", "timeRangeLast7Days": "7 ngày qua", "timeRangeLast7DaysDesc": "Lịch sử từ tuần qua", "timeRangeThisMonth": "Tháng này", "timeRangeThisMonthDesc": "Lịch sử từ tháng này", "timeRangeLastMonth": "Tháng trước", "timeRangeLastMonthDesc": "Lịch sử từ tháng trước", "deleteTimeRange": "Xóa {{range}}", "last7days": "7 ngày qua", "thisMonth": "Tháng này", "lastMonth": "Tháng trước" };
const invitationCodes$2 = { "title": "Mã mời của tôi", "availableToShare": "{{unused}}/{{total}} có thể chia sẻ", "loading": "Đang tải mã của bạn...", "noCodesYet": "Chưa có mã mời.", "noCodesFound": "Không tìm thấy mã mời", "failedToLoad": "Không thể tải mã mời", "useCodeHint": "Sử dụng mã mời để nhận mã của riêng bạn!", "shareHint": "Chia sẻ các mã này với bạn bè để mời họ tham gia FlowithOS", "used": "Đã sử dụng" };
const tasks$2 = { "title": "Nhiệm vụ", "description": "Nơi bạn lưu trữ tất cả nhiệm vụ", "transformToPreset": "Chuyển thành Preset", "noTasks": "Không có nhiệm vụ", "archiveEmpty": "Lưu trữ trống" };
const flows$2 = { "title": "Flow", "description": "Flow hiển thị tất cả canvas của bạn", "newFlow": "Flow mới", "rename": "Đổi tên", "leave": "Rời khỏi", "noFlows": "Không có flow", "signInToViewFlows": "Đăng nhập để xem flows của bạn", "pin": "Ghim", "unpin": "Bỏ ghim" };
const bookmarks$2 = { "title": "Dấu trang", "description": "Bạn có thể lưu trữ mọi tab bạn thích", "bookmark": "Dấu trang", "addNewCollection": "Thêm bộ sưu tập mới", "loadingBookmarks": "Đang tải dấu trang...", "noMatchingBookmarks": "Không tìm thấy dấu trang phù hợp", "noBookmarksYet": "Chưa có dấu trang", "importFromBrowsers": "Nhập từ trình duyệt", "detectingBrowsers": "Đang phát hiện trình duyệt...", "bookmarksCount": "dấu trang", "deleteCollection": "Xóa bộ sưu tập", "deleteCollectionConfirm": "Bạn có chắc chắn muốn xóa bộ sưu tập này?", "newCollection": "Bộ sưu tập mới", "enterCollectionName": "Nhập tên cho bộ sưu tập mới", "create": "Tạo", "collectionName": "Tên bộ sưu tập", "saveEnter": "Lưu (Enter)", "cancelEsc": "Hủy (Esc)", "renameFolder": "Đổi tên thư mục", "renameBookmark": "Đổi tên dấu trang", "deleteFolder": "Xóa thư mục", "deleteBookmark": "Xóa dấu trang" };
const conversations$2 = { "title": "Hội thoại", "noConversations": "Chưa có hội thoại" };
const intelligence$2 = { "title": "Trí tuệ", "description": "Phát triển Agent của bạn với kỹ năng và ký ức", "knowledgeBase": "Cơ sở tri thức", "memory": "Ký ức", "skill": "Kỹ năng", "createNewSkill": "Tạo kỹ năng mới", "createNewMemory": "Tạo ký ức mới", "loading": "Đang tải...", "noSkills": "Không có kỹ năng", "noMemories": "Không có ký ức", "readOnly": "Chỉ đọc", "readOnlyMessage": "Đây là Kỹ năng hệ thống tích hợp giúp agent của bạn hoạt động tốt hơn. Không thể chỉnh sửa trực tiếp, nhưng bạn có thể sao chép và chỉnh sửa bản sao của riêng mình. Các chỉnh sửa sau khi mở sẽ không được lưu. Xin lưu ý.", "readOnlyToast": "Đây là Kỹ năng hệ thống tích hợp giúp agent của bạn hoạt động tốt hơn. Không thể chỉnh sửa trực tiếp, nhưng bạn có thể sao chép và chỉnh sửa bản sao của riêng mình.", "open": "Mở", "kbComingSoon": "Hỗ trợ Cơ sở tri thức Flowith sắp ra mắt.", "system": "Hệ thống", "learnFromUser": "Người dùng", "systemPresetReadOnly": "Preset hệ thống (chỉ đọc)", "actions": "Hành động", "rename": "Đổi tên", "duplicate": "Nhân bản…", "info": "Thông tin", "saving": "Đang lưu...", "fileInfo": "Thông tin tệp", "fileName": "Tên", "fileSize": "Kích thước", "fileCreated": "Đã tạo", "fileModified": "Đã chỉnh sửa", "fileType": "Loại", "fileLocation": "Vị trí", "copyPath": "Sao chép đường dẫn", "empowerOS": "Chế độ dạy", "teachMakesBetter": "Dạy giúp OS tốt hơn", "teachMode": "Chế độ dạy", "teachModeDescription": "Trong Chế độ dạy, bạn có thể ghi lại quy trình và các bước làm việc trên web trong khi OS Agent quan sát, học hỏi và chuyển hóa chúng thành kỹ năng và kiến thức có thể tái sử dụng.", "teachModeGoalLabel": "Mục tiêu nhiệm vụ (Tùy chọn)", "teachModeGoalPlaceholder": "Cung cấp thêm ngữ cảnh để OS học hỏi — có thể là mục tiêu nhiệm vụ cụ thể hoặc bất kỳ thông tin liên quan nào.", "teachModeTaskDisabled": "Nhiệm vụ mới bị vô hiệu hóa khi bạn đang ở chế độ dạy.", "empowering": "Đang dạy", "empoweringDescription": "OS Agent sẽ quan sát và học hỏi khi bạn thao tác", "yourGoal": "Mục tiêu nhiệm vụ", "preset": "Preset", "generatedSkills": "Kỹ năng đã tạo", "showLess": "Ẩn bớt", "showMore": "Hiện thêm", "osHasLearned": "OS đã học được", "complete": "Hoàn thành", "interactionsPlaceholder": "Các tương tác sẽ xuất hiện ở đây khi bạn trình diễn quy trình làm việc.", "done": "Xong", "generatingGuidance": "Đang tạo hướng dẫn...", "summarizingInteraction": "Chúng tôi đang tổng hợp từng tương tác và chuẩn bị một kỹ năng có thể tái sử dụng.", "skillSaved": "Đã lưu kỹ năng", "goal": "Mục tiêu", "steps": "Các bước", "events": "Sự kiện", "guidanceSavedSuccessfully": "Đã lưu hướng dẫn thành công.", "openGuidanceInComposer": "Mở hướng dẫn trong Composer", "recordAnotherWorkflow": "Ghi lại quy trình khác", "dismissSummary": "Đóng tóm tắt", "saveAndTest": "Lưu và kiểm tra", "learning": "Đang học...", "teachModeError": "Chế độ dạy gặp sự cố", "errorDetails": "Chi tiết lỗi", "checkNetworkConnection": "Kiểm tra kết nối mạng của bạn và thử bắt đầu chế độ dạy lại.", "tryAgain": "Thử lại", "resetState": "Đặt lại trạng thái", "completeConfirmTitle": "Đã hoàn tất việc trao quyền cho OS", "completeConfirmMessage": "Bạn có thể chọn kết quả bạn muốn trong danh sách dưới đây.", "capturedEvents": "Sự kiện đã ghi lại", "confirmAndGenerate": "Tạo", "generating": "Đang tạo", "promptSummary": "Tóm tắt Prompt", "saveToPreset": "Lưu vào Preset", "skillHostname": "Kỹ năng: {{hostname}}", "saveToSkill": "Lưu vào kỹ năng", "skillTooltip": "Bạn có thể xem lại hoặc chỉnh sửa kỹ năng bên dưới", "skillSectionTooltip": "Mỗi kỹ năng được đặt tên theo trang web được sử dụng trong phiên dạy. Kỹ năng mới xuất hiện dưới dạng các phần mới trong tệp markdown tương ứng.", "selectAll": "Chọn tất cả", "discard": "Hủy bỏ", "confirmDiscard": "Có, hủy bỏ", "tutorial": { "title": "Chào mừng đến Chế độ dạy", "next": "Tiếp theo", "gotIt": "Đã hiểu", "guideLabel": "Hướng dẫn Chế độ dạy", "page1": { "title": "Kỹ năng và chế độ dạy là gì?", "description": "Kỹ năng là nơi OS lưu trữ kiến thức có thể tái sử dụng mà bất kỳ agent nào cũng có thể áp dụng. Mỗi kỹ năng là một hướng dẫn dựa trên prompt (có thể chứa đoạn mã) về ứng dụng web, quy trình làm việc hoặc mẫu tương tác. Nó giúp OS hoạt động tốt hơn trên một số trang web nhất định hoặc cho các nhiệm vụ cụ thể.\n\nChế độ dạy là cách bạn có thể huấn luyện OS sao chép thói quen của mình hoặc học cách làm việc trên trang web cụ thể, điều này sẽ được lưu trữ dưới dạng <strong>kỹ năng và preset</strong> để bạn tái sử dụng trong tương lai." }, "page2": { "title": "Làm thế nào để bắt đầu chế độ dạy?", "description": "Để bắt đầu, nhấp vào nút '<strong>Chế độ dạy</strong>' trong '<strong>Bảng điều khiển Trí tuệ</strong>' ở bên trái. Trước khi bắt đầu, hãy đặt <strong>Mục tiêu dạy</strong> để cung cấp cho OS hướng dẫn ban đầu và cung cấp cho bạn nhiệm vụ rõ ràng để làm theo." }, "page3": { "title": "OS học hỏi hành động của bạn như thế nào?", "description": "Khi bạn dạy, OS quan sát hành động của bạn và theo dõi con trỏ của bạn theo thời gian thực. Bạn sẽ thấy mọi bước được ghi lại trên bảng điều khiển bên trái — tạm dừng bất cứ lúc nào và nhấp vào biểu tượng '<strong>Dừng</strong>' màu đỏ khi bạn hoàn tất." }, "page4": { "title": "Kết quả học hỏi của OS là gì?", "description": "Sau khi bạn hoàn thành việc dạy, hãy chọn loại kết quả bạn muốn tạo. Thông thường, một preset và các kỹ năng liên quan được tạo cho các nhiệm vụ định kỳ. Sau khi tạo, bạn có thể xem lại và chỉnh sửa chúng trong <strong>Composer</strong> hoặc truy cập bất cứ lúc nào trong thư mục '<strong>Học từ Người dùng</strong>' trong bảng điều khiển '<strong>Trí tuệ</strong>'." } } };
const sidebar$2 = { "goBack": "Quay lại", "goForward": "Tiến tới", "lockSidebar": "Khóa thanh bên", "unlockSidebar": "Mở khóa thanh bên", "searchOrEnterAddress": "Tìm kiếm hoặc nhập địa chỉ", "reload": "Tải lại" };
const tabs$2 = { "openNewBlankPage": "Mở trang trống mới", "newTab": "Tab mới", "terminal": "Terminal", "pauseAgent": "Tạm dừng Agent", "resumeAgent": "Tiếp tục Agent" };
const userMenu$2 = { "upgrade": "Nâng cấp", "creditsLeft": "còn lại", "clickToManageSubscription": "Nhấp để quản lý gói đăng ký", "theme": "Chủ đề", "lightMode": "Chế độ sáng", "darkMode": "Chế độ tối", "systemMode": "Chế độ hệ thống", "language": "Ngôn ngữ", "settings": "Cài đặt", "invitationCode": "Mã mời", "checkUpdates": "Kiểm tra cập nhật", "contactUs": "Liên hệ chúng tôi", "signOut": "Đăng xuất", "openUserMenu": "Mở menu người dùng", "signIn": "Đăng nhập" };
const settings$2 = { "title": "Cài đặt", "history": "Lịch sử", "downloads": "Tải xuống", "adblock": "Chặn quảng cáo", "language": "Ngôn ngữ", "languageDescription": "Chọn ngôn ngữ ưa thích cho giao diện. Thay đổi có hiệu lực ngay lập tức.", "softwareUpdate": "Cập nhật phần mềm" };
const updateSettings$2 = { "description": "Flowith OS giữ cho bạn cập nhật với các bản cập nhật an toàn và đáng tin cậy. Chọn kênh của bạn: Stable cho độ tin cậy, Beta cho tính năng sớm hoặc Alpha cho các bản dựng tiên tiến. Bạn chỉ có thể chuyển sang các kênh mà tài khoản của bạn có quyền truy cập.", "currentVersion": "Phiên bản hiện tại: {{version}}", "loadError": "Không thể tải", "warning": "Cảnh báo: Các bản Beta/Alpha có thể không ổn định và có thể ảnh hưởng đến công việc của bạn. Sử dụng Stable cho môi trường sản xuất.", "channel": { "label": "Kênh cập nhật", "hint": "Chỉ có thể chọn các kênh bạn có quyền truy cập.", "disabledHint": "Không thể chuyển kênh khi đang cập nhật", "options": { "stable": "Stable", "beta": "Beta", "alpha": "Alpha" } }, "actions": { "title": "Kiểm tra thủ công", "hint": "Kiểm tra các bản cập nhật có sẵn ngay bây giờ.", "check": "Kiểm tra cập nhật" }, "status": { "noUpdate": "Bạn đã cập nhật mới nhất.", "hasUpdate": "Có phiên bản mới.", "error": "Không thể kiểm tra cập nhật." }, "tips": { "title": "Mẹo", "default": "Theo mặc định, nhận thông báo cho các bản cập nhật ổn định. Trong Truy cập Sớm, các bản dựng trước phát hành có thể không ổn định cho công việc sản xuất.", "warningTitle": "Cảnh báo: Cập nhật Nightly tự động áp dụng", "warningBody": "Các bản dựng Nightly sẽ tự động tải xuống và cài đặt cập nhật mà không nhắc nhở bất cứ khi nào Cursor đóng." } };
const adblock$2 = { "title": "Chặn quảng cáo", "description": "Chặn quảng cáo và trình theo dõi xâm phạm, lọc nhiễu trang, cho phép Neo OS Agent hiểu và trích xuất thông tin chính xác hơn đồng thời bảo vệ quyền riêng tư của bạn.", "enable": "Bật Chặn quảng cáo", "enableDescription": "Tự động chặn quảng cáo trên tất cả các trang web", "statusActive": "Đang hoạt động - Quảng cáo đang bị chặn", "statusInactive": "Không hoạt động - Quảng cáo không bị chặn", "adsBlocked": "quảng cáo đã chặn", "networkBlocked": "Yêu cầu mạng", "cosmeticBlocked": "Phần tử đã ẩn", "filterRules": "Quy tắc lọc", "activeRules": "quy tắc đang hoạt động" };
const blank$2 = { "openNewPage": "Mở trang trống mới", "selectBackground": "Chọn nền", "isAwake": "đã thức dậy", "osIsAwake": "OS đã thức dậy", "osGuideline": "Hướng dẫn OS", "osGuidelineDescription": "Bắt đầu nhanh với OS Agent của chúng tôi - kiến trúc, chế độ và mọi thứ nó có thể làm.", "intelligence": "Chế độ dạy", "intelligenceDescription": "Dạy OS Agent thực hiện nhiệm vụ và tái sử dụng sau này.", "inviteAndEarn": "Mời và kiếm", "tagline": "Với bộ nhớ hoạt động, phát triển theo mọi hành động để thực sự hiểu bạn.", "taskPreset": "Preset nhiệm vụ", "credits": "+{{amount}} Credits", "addPreset": "Thêm preset mới", "editPreset": "Chỉnh sửa preset", "deletePreset": "Xóa preset", "removeFromHistory": "Xóa khỏi lịch sử", "previousPreset": "Preset trước", "nextPreset": "Preset tiếp theo", "previousPresets": "Các preset trước", "nextPresets": "Các preset tiếp theo", "createPreset": "Tạo preset", "presetName": "Tên preset", "instruction": "Hướng dẫn", "presetNamePlaceholderCreate": "Ví dụ: Báo cáo hàng tuần, Đánh giá mã, Phân tích dữ liệu...", "presetNamePlaceholderEdit": "Nhập tên preset...", "instructionPlaceholderCreate": 'Mô tả những gì bạn muốn OS làm...\nVí dụ: "Phân tích dữ liệu bán hàng tuần này và tạo báo cáo tóm tắt"', "instructionPlaceholderEdit": "Cập nhật hướng dẫn nhiệm vụ của bạn...", "colorBlue": "Xanh dương", "colorGreen": "Xanh lá", "colorYellow": "Vàng", "colorRed": "Đỏ", "selectColor": "Chọn màu {{color}}", "creating": "Đang tạo...", "updating": "Đang cập nhật...", "create": "Tạo", "update": "Cập nhật", "smartInputPlaceholder": "Điều hướng, tìm kiếm hoặc để Neo xử lý...", "processing": "Đang xử lý…", "navigate": "Điều hướng", "navigateDescription": "Mở địa chỉ này trong tab hiện tại", "searchGoogle": "Tìm kiếm Google", "searchGoogleDescription": "Tìm kiếm với Google", "runTask": "Chạy nhiệm vụ", "runTaskDescription": "Thực thi với Neo agent", "createCanvas": "Hỏi trong Canvas", "createCanvasDescription": "Mở Flo canvas với prompt này" };
const agentGuide$2 = { "title": "Hướng dẫn Agent", "subtitle": "Hướng dẫn nhanh trực quan về OS Agent: kiến trúc, chế độ và mọi thứ nó có thể làm.", "capabilities": { "heading": "Khả năng", "navigate": { "title": "Điều hướng", "desc": "Mở trang, quay lại/tiến tới" }, "click": { "title": "Nhấp chuột", "desc": "Tương tác với nút và liên kết" }, "type": { "title": "Nhập liệu", "desc": "Điền vào các trường và biểu mẫu" }, "keys": { "title": "Phím", "desc": "Enter, Escape, phím tắt" }, "scroll": { "title": "Cuộn trang", "desc": "Di chuyển qua trang dài" }, "tabs": { "title": "Tab", "desc": "Đánh dấu, chuyển đổi, đóng" }, "files": { "title": "Tệp", "desc": "Viết, đọc, tải xuống" }, "skills": { "title": "Kỹ năng", "desc": "Kiến thức chia sẻ" }, "memories": { "title": "Ký ức", "desc": "Tùy chọn dài hạn" }, "upload": { "title": "Tải lên", "desc": "Gửi tệp đến trang" }, "ask": { "title": "Hỏi", "desc": "Xác nhận nhanh từ người dùng" }, "onlineSearch": { "title": "Tìm kiếm trực tuyến", "desc": "Tra cứu web nhanh" }, "extract": { "title": "Trích xuất", "desc": "Lấy thông tin có cấu trúc" }, "deepThink": { "title": "Suy nghĩ sâu", "desc": "Phân tích có cấu trúc" }, "vision": { "title": "Thị giác", "desc": "Thao tác chính xác không qua DOM" }, "shell": { "title": "Shell", "desc": "Chạy lệnh (khi khả dụng)" }, "report": { "title": "Báo cáo", "desc": "Hoàn thành và tóm tắt" } }, "benchmark": { "title": "Benchmark Online‑Mind2Web", "subtitle": "Flowith Neo AgentOS dẫn đầu: Thống trị với ", "subtitleHighlight": "Gần hoàn hảo", "subtitleEnd": " Hiệu suất.", "openai": "OpenAI Operator", "gemini": "Gemini 2.5 Computer Use", "flowith": "Flowith Neo OS", "average": "Trung bình", "easy": "Dễ", "medium": "Trung bình", "hard": "Khó" }, "skillsMemories": { "heading": "Kỹ năng & Ký ức", "description": "Sổ tay có thể tái sử dụng và ngữ cảnh dài hạn mà Neo tự động tham chiếu trong Chế độ Pro.", "markdownTag": "Markdown .md", "autoIndexedTag": "Tự động lập chỉ mục", "citationsTag": "Trích dẫn trong nhật ký", "howNeoUses": "Neo sử dụng chúng như thế nào: trước mỗi bước trong Chế độ Pro, Neo kiểm tra Kỹ năng và Ký ức liên quan, hợp nhất chúng vào ngữ cảnh suy luận và tự động áp dụng các hướng dẫn hoặc tùy chọn.", "skillsTitle": "Kỹ năng", "skillsTag": "Chia sẻ", "skillsDesc": "Lưu trữ kiến thức có thể tái sử dụng mà bất kỳ agent nào cũng có thể áp dụng. Mỗi Kỹ năng là một hướng dẫn ngắn về công cụ, quy trình làm việc hoặc mẫu.", "skillsProcedures": "Tốt nhất cho: thủ tục", "skillsFormat": "Định dạng: Markdown", "skillsScenario": "Kịch bản hàng ngày", "skillsScenarioTitle": "Chuyển đổi và chia sẻ phương tiện", "skillsStep1": 'Bạn nói: "Chuyển 20 hình ảnh này thành PDF nhỏ gọn."', "skillsStep2": "Neo làm theo kỹ năng để tải lên, chuyển đổi, đợi hoàn thành và lưu tệp.", "skillsOutcome": "Kết quả: một PDF sẵn sàng chia sẻ với liên kết tải xuống trong nhật ký.", "memoriesTitle": "Ký ức", "memoriesTag": "Cá nhân", "memoriesDesc": "Ghi lại tùy chọn, hồ sơ và sự thật về lĩnh vực của bạn. Neo tham chiếu các mục liên quan khi đưa ra quyết định và trích dẫn chúng trong nhật ký.", "memoriesStyle": "Tốt nhất cho: phong cách, quy tắc", "memoriesPrivate": "Riêng tư theo mặc định", "memoriesScenario": "Kịch bản hàng ngày", "memoriesScenarioTitle": "Giọng điệu & phong cách viết", "memoriesStep1": "Bạn thích bản sao ngắn gọn, thân thiện với giọng điệu lạc quan.", "memoriesStep2": "Neo tự động áp dụng nó trên các email, báo cáo và bài đăng mạng xã hội.", "memoriesOutcome": "Kết quả: giọng điệu thương hiệu nhất quán mà không cần lặp lại hướng dẫn.", "taskFilesTitle": "Tệp nhiệm vụ", "taskFilesTag": "Theo nhiệm vụ", "taskFilesDesc": "Tệp tạm thời được tạo trong nhiệm vụ hiện tại. Chúng hỗ trợ I/O công cụ và kết quả trung gian và không tự động chia sẻ với các nhiệm vụ khác.", "taskFilesEphemeral": "Tạm thời", "taskFilesReadable": "Có thể đọc bởi công cụ", "taskFilesScenario": "Kịch bản hàng ngày", "taskFilesScenarioTitle": "Theo dõi giá chuyến đi", "taskFilesStep1": "Neo thu thập bảng chuyến bay và lưu trữ chúng dưới dạng CSV cho nhiệm vụ này.", "taskFilesStep2": "So sánh giá vé hôm nay với hôm qua và làm nổi bật những thay đổi.", "taskFilesOutcome": "Kết quả: bản tóm tắt gọn gàng và CSV có thể tải xuống." }, "system": { "title": "Neo OS - agent trình duyệt thông minh nhất dành cho bạn", "tagline": "Tự phát triển × Bộ nhớ & Kỹ năng × Tốc độ & Trí tuệ", "selfEvolving": "Tự phát triển", "intelligence": "Trí tuệ", "contextImprovement": "Cải thiện ngữ cảnh", "contextDesc": "Agent phản chiếu tinh chỉnh ngữ cảnh theo thời gian thực qua hệ thống kỹ năng", "onlineRL": "RL trực tuyến", "onlineRLDesc": "Cập nhật định kỳ phù hợp với hành vi agent", "intelligentMemory": "Bộ nhớ thông minh", "architecture": "Kiến trúc", "dualLayer": "Hệ thống hai lớp", "dualLayerDesc": "Bộ đệm ngắn hạn + bộ nhớ tình tiết dài hạn", "knowledgeTransfer": "Chuyển giao tri thức", "knowledgeTransferDesc": "Giữ lại, tái sử dụng và chuyển giao học tập giữa các nhiệm vụ", "highPerformance": "Hiệu suất cao", "infrastructure": "Cơ sở hạ tầng", "executionKernel": "Nhân thực thi", "executionKernelDesc": "Điều phối song song & lập lịch động", "speedCaching": "Bộ nhớ đệm tốc độ", "speedCachingDesc": "Phản hồi mili giây với thực thi thời gian thực", "speedIndicator": "~1ms", "summary": "Phát triển · Bền vững · Nhanh" }, "arch": { "heading": "Kiến trúc", "subtitle": "OS lấy Agent làm trung tâm: CPU (Lập kế hoạch) + Bộ nhớ/Hệ thống tệp + Kỹ năng + I/O", "agentCentricNote": "flowithOS được thiết kế cho agents.", "osShell": "OS Shell", "agentCore": "Agent Core", "plannerExecutor": "Lập kế hoạch · Thực thi", "browserTabs": "Tab trình duyệt", "domCanvas": "DOM · Canvas", "filesMemoriesSkills": "Tệp · Ký ức · Kỹ năng", "domPageTabs": "DOM · Trang · Tab", "clickTypeScroll": "Nhấp · Nhập · Cuộn", "visionNonDOM": "Thị giác · Thao tác không qua DOM", "captchaDrag": "CAPTCHA · Kéo", "onlineSearchThinking": "Tìm kiếm trực tuyến · Suy nghĩ sâu", "googleAnalysis": "google · phân tích", "askUserReport": "Hỏi người dùng · Báo cáo", "choicesDoneReport": "lựa chọn · hoàn_thành_và_báo_cáo", "skillsApps": "Kỹ năng (Ứng dụng)", "skillsKinds": "Hệ thống · Người dùng · Chia sẻ", "memory": "Bộ nhớ", "memoryKinds": "Ngắn hạn · Dài hạn", "filesystem": "Hệ thống tệp", "filesystemKinds": "Tệp nhiệm vụ · Tài sản · Nhật ký", "cpuTitle": "CPU — Agent lập kế hoạch", "cpuSub": "Lập kế hoạch · Thực thi · Phản chiếu", "planRow": "Kế hoạch → Phân tách → Định tuyến", "execRow": "Thực thi → Quan sát → Phản chiếu", "ioTitle": "Khả năng I/O", "browserUse": "Sử dụng trình duyệt", "browserUseDesc": "DOM · Tab · Thị giác · CAPTCHA", "terminalUse": "Sử dụng Terminal", "terminalUseDesc": "Shell · Công cụ · Scripts", "scriptUse": "Sử dụng Script", "scriptUseDesc": "Python · JS · Workers", "osVsHumanTitle": "Agent OS so với OS lấy con người làm trung tâm", "osVsHuman1": "Ứng dụng trở thành Kỹ năng: được thiết kế để Agents đọc, không phải UI", "osVsHuman2": "CPU lập kế hoạch/thực thi qua I/O; người dùng giám sát ở cấp độ nhiệm vụ", "osVsHuman3": "Bộ nhớ tồn tại qua các nhiệm vụ; Hệ thống tệp hỗ trợ I/O công cụ" }, "tips": { "heading": "Mẹo", "beta": "FlowithOS hiện đang ở phiên bản Beta; cả sản phẩm và Agent Neo đều liên tục được cập nhật. Vui lòng theo dõi các cập nhật mới nhất.", "improving": "Khả năng của Agent Neo OS đang cải thiện từng ngày, bạn có thể thử sử dụng các khả năng mới để hoàn thành nhiệm vụ của mình." } };
const reward$2 = { "helloWorld": "Hello World", "helloWorldDesc": 'Đây là khoảnh khắc "Hello World" của bạn trong Kỷ nguyên mới.<br />Hãy là một trong những người đầu tiên tạo dấu ấn trên Internet Agent trong lịch sử nhân loại.', "get2000Credits": "Nhận 2.000 Credits thưởng", "equivalent7Days": "Và tự động hóa hoạt động mạng xã hội của bạn trong 7 ngày.", "shareInstructions": `Sau khi đánh thức, giới thiệu Agent cá nhân của bạn với thế giới.<br />NeoOS sẽ tự động soạn thảo và xuất bản bài đăng "Hello World" trên X cho bạn<br />giống như bất cứ điều gì nó có thể làm cho bạn sau này.<br /><span style='display: block; height: 8px;'></span>Ngồi lại và xem nó diễn ra.`, "osComing": "OS đang đến", "awakeOS": "Đánh thức OS", "page2Title": "Mời và kiếm", "page2Description1": "Một hành trình tuyệt vời sẽ tốt hơn với những người đồng hành.", "page2Description2": "Với mỗi bạn bè tham gia, bạn sẽ được tặng", "page2Description3": "credits để thúc đẩy suy nghĩ của riêng bạn.", "retry": "Thử lại", "noCodesYet": "Chưa có mã mời", "activated": "Đã kích hoạt", "neoStarting": "Neo đang bắt đầu nhiệm vụ tự động chia sẻ...", "failed": "Thất bại", "unknownError": "Lỗi không xác định", "errorRetry": "Đã xảy ra lỗi, vui lòng thử lại", "unexpectedResponse": "Phản hồi không mong đợi từ máy chủ", "failedToLoadCodes": "Không thể tải mã mời", "congratsCredits": "Chúc mừng! +{{amount}} Credits", "rewardUnlocked": "Đã mở khóa phần thưởng cho việc chia sẻ" };
const agentWidget$2 = { "modes": { "fast": { "label": "Chế độ nhanh", "description": "Hoàn thành nhiệm vụ nhanh nhất có thể, sẽ không sử dụng Kỹ năng và Ký ức.", "short": "Nhanh", "modeDescription": "Hành động nhanh hơn, ít chi tiết hơn" }, "pro": { "label": "Chế độ Pro", "description": "Chất lượng cao nhất: phân tích hình ảnh từng bước với suy luận sâu. Tham chiếu Kỹ năng và Ký ức khi cần.", "short": "Pro", "modeDescription": "Cân bằng, để Neo quyết định" } }, "minimize": "Thu nhỏ", "placeholder": "Yêu cầu Neo OS Agent làm...", "changeModeTooltip": "Thay đổi chế độ để điều chỉnh hành vi của agent", "preset": "Preset", "selectPresetTooltip": "Chọn một preset để sử dụng", "addNewPreset": "Thêm preset mới", "agentHistoryTooltip": "Lịch sử hành động của Agent", "createPreset": "Tạo preset", "presetName": "Tên preset", "instruction": "Hướng dẫn", "upload": "Tải lên", "newTask": "Nhiệm vụ mới", "draft": "Bản nháp", "copyPrompt": "Sao chép prompt", "showMore": "Hiện thêm", "showLess": "Ẩn bớt", "agentIsWorking": "Agent đang làm việc", "agentIsWrappingUp": "Agent đang hoàn tất", "completed": "Đã hoàn thành", "paused": "Đã tạm dừng", "created": "Đã tạo", "selectTask": "Chọn một nhiệm vụ", "unpin": "Bỏ ghim", "pinToRight": "Ghim bên phải", "stepsCount": "Bước ({{count}})", "files": "Tệp", "filesCount": "Tệp ({{count}})", "noFilesYet": "Chưa có tệp nào được tạo", "status": { "wrappingUp": "Agent đang hoàn tất...", "thinking": "Agent đang suy nghĩ...", "wrappingUpAction": "Đang hoàn tất hành động hiện tại..." }, "actions": { "markedTab": "Tab đã đánh dấu", "openRelatedTab": "Mở Tab liên quan (Đang thực hiện)", "open": "Mở", "openTab": "Mở Tab", "showInFolder": "Hiển thị trong thư mục", "preview": "Xem trước", "followUpPrefix": "Bạn", "actionsHeader": "Hành động" }, "controls": { "rerun": "Chạy lại (Đang thực hiện)", "pause": "Tạm dừng", "pauseAndArchive": "Tạm dừng và lưu trữ", "resume": "Tiếp tục", "wrappingUpDisabled": "Đang hoàn tất..." }, "input": { "sending": "Đang gửi...", "adjustTaskPlaceholder": "Gửi tin nhắn mới để điều chỉnh nhiệm vụ cho Agent Neo..." }, "legacy": { "readOnlyNotice": "Đây là nhiệm vụ cũ từ phiên bản trước. Chế độ chỉ xem." }, "refunded": { "noFollowUp": "Nhiệm vụ này đã được hoàn tiền. Tin nhắn tiếp theo không khả dụng." }, "skills": { "matchingSkills": "đang khớp các kỹ năng liên quan…", "scanningSkills": "Rung thần kinh quét các kỹ năng có sẵn!!!", "scanningMap": "Đang quét bản đồ kỹ năng thần kinh…" }, "billing": { "creditsDepletedTitle": "Thêm credits để tiếp tục", "creditsDepletedMessage": "Agent đã tạm dừng vì credits của bạn đã hết. Thêm credits hoặc cập nhật thanh toán, sau đó chạy lại nhiệm vụ khi bạn sẵn sàng." }, "presetActions": { "editPreset": "Chỉnh sửa preset", "deletePreset": "Xóa preset" }, "feedback": { "success": { "short": "Làm tốt lắm!", "long": "Đến giờ vẫn tốt, làm tốt lắm!" }, "refund": { "short": "Ối, hoàn tiền!", "long": "Ối, tôi muốn lấy lại credits!" }, "refundSuccess": { "long": "Tuyệt vời! Credits của bạn đã được hoàn lại!" }, "modal": { "title": "Yêu cầu hoàn Credits", "credits": "{{count}} credits", "description": "Nếu bạn không hài lòng với nhiệm vụ này, yêu cầu hoàn tiền và chúng tôi sẽ ngay lập tức hoàn lại tất cả credits đã sử dụng cho nhiệm vụ này.", "whatGoesWrong": "Có gì sai", "errorMessage": "Xin lỗi, vui lòng cung cấp thêm chi tiết", "placeholder": "Mô tả điều gì đã sai...", "shareTask": "Chia sẻ nhiệm vụ này với chúng tôi", "shareDescription": "Chúng tôi sẽ ẩn danh tất cả thông tin cá nhân từ nhiệm vụ của bạn. Bằng cách chia sẻ nhiệm vụ của bạn với chúng tôi, chúng tôi sẽ cải thiện hiệu suất của agent trên các nhiệm vụ tương tự trong tương lai.", "upload": "Tải lên", "attachFile": "đính kèm file", "submit": "Gửi", "submitting": "Đang gửi...", "alreadyRefunded": { "title": "Đã hoàn tiền", "message": "Nhiệm vụ này đã được hoàn tiền. Bạn không thể yêu cầu hoàn tiền lần nữa." } }, "errors": { "systemError": "Lỗi hệ thống. Vui lòng liên hệ đội hỗ trợ của chúng tôi.", "networkError": "Lỗi mạng. Vui lòng kiểm tra kết nối của bạn và thử lại.", "noUsageData": "Không tìm thấy dữ liệu sử dụng. Không thể hoàn tiền.", "alreadyRefunded": "Nhiệm vụ này đã được hoàn tiền.", "notAuthenticated": "Vui lòng đăng nhập để yêu cầu hoàn tiền.", "unknownError": "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.", "validationFailed": "Không thể xác thực lý do của bạn ngay bây giờ. Vui lòng thử lại sau.", "invalidReason": "Lý do bị từ chối. Vui lòng mô tả điều gì thực sự đã xảy ra sai." }, "confirmation": { "creditsRefunded": "Đã hoàn {{count}} Credits", "title": "Thành công", "message": "Cảm ơn bạn! Đội ngũ của chúng tôi sẽ chẩn đoán nhiệm vụ của bạn và cải thiện trải nghiệm FlowithOS.", "messageNoShare": "Cảm ơn bạn! Đội ngũ của chúng tôi sẽ tiếp tục nỗ lực để cải thiện trải nghiệm FlowithOS." } } };
const gate$2 = { "welcome": { "title": "Chào mừng đến FlowithOS", "subtitle": "Từ Web đến Thế giới, FlowithOS là AgenticOS thông minh nhất biến trình duyệt của bạn thành giá trị thực tế.", "features": { "execute": { "title": "Thực thi bất kỳ nhiệm vụ nào, Tự động", "description": "Hành động với trực giác con người với tốc độ máy móc, FlowithOS điều hướng và thực thi nhiều nhiệm vụ trên web liên tục." }, "transform": { "title": "Biến ý tưởng thành tác động, Một cách thông minh", "description": "Từ cảm hứng đến tạo ra giá trị, FlowithOS chuyển đổi những ý tưởng lớn thành hành động để mang lại kết quả thực tế." }, "organize": { "title": "Tổ chức tài sản của bạn, Có hệ thống", "description": "Từ dấu trang rời rạc đến sổ tay có cấu trúc, FlowithOS trang bị cho bạn một hệ thống mạnh mẽ để quản lý, tuyển chọn và mở rộng tài sản kỹ thuật số của bạn." }, "evolve": { "title": "Phát triển cùng bạn, Linh hoạt", "description": "Với Bộ nhớ phát triển từ mọi tương tác, FlowithOS phát triển các Kỹ năng tùy chỉnh—từ điều hướng các trang web phức tạp đến hiểu phong cách cá nhân của bạn." } }, "letsGo": "Bắt đầu thôi!" }, "auth": { "createAccount": "Tạo tài khoản", "signInToFlowith": "Đăng nhập vào tài khoản flowith của bạn", "oneAccount": "Một tài khoản cho tất cả sản phẩm flowith", "fromAnotherAccount": "Đăng nhập với:", "useOwnEmail": "Hoặc sử dụng email của riêng bạn", "email": "Email", "password": "Mật khẩu", "confirmPassword": "Xác nhận mật khẩu", "acceptTerms": "Tôi chấp nhận Điều khoản sử dụng và Chính sách bảo mật của FlowithOS", "privacyNote": "Tất cả dữ liệu của bạn đều được bảo mật 100% trên thiết bị của bạn", "alreadyHaveAccount": "Đã có tài khoản Flowith?", "createNewAccount": "Chưa có tài khoản? Đăng ký", "signUp": "Đăng ký", "signIn": "Đăng nhập", "processing": "Đang xử lý...", "verifyEmail": "Xác minh email của bạn", "verificationCodeSent": "Chúng tôi đã gửi mã xác minh 6 chữ số đến {{email}}", "enterVerificationCode": "Nhập mã xác minh", "verificationCode": "Mã xác minh", "enterSixDigitCode": "Nhập mã 6 chữ số", "backToSignUp": "Quay lại đăng ký", "verifying": "Đang xác minh...", "verifyCode": "Xác minh mã", "errors": { "enterEmail": "Vui lòng nhập email của bạn", "enterPassword": "Vui lòng nhập mật khẩu của bạn", "confirmPassword": "Vui lòng xác nhận mật khẩu của bạn", "passwordsDoNotMatch": "Mật khẩu không khớp", "acceptTerms": "Vui lòng chấp nhận Điều khoản sử dụng và Chính sách bảo mật", "authFailed": "Xác thực thất bại. Vui lòng thử lại.", "invalidVerificationCode": "Vui lòng nhập mã xác minh 6 chữ số hợp lệ", "verificationFailed": "Xác minh thất bại. Vui lòng thử lại.", "oauthFailed": "Xác thực OAuth thất bại. Vui lòng thử lại.", "userAlreadyExists": "Email này đã được đăng ký. Vui lòng " }, "goToLogin": "đến đăng nhập", "signInPrompt": "đăng nhập" }, "invitation": { "title": "Sự đánh thức cần một chìa khóa", "subtitle": "Vui lòng nhập mã mời của bạn để mở khóa FlowithOS", "lookingForInvite": "Đang tìm lời mời?", "followOnX": "Theo dõi @flowith trên X", "toGetAccess": "để có quyền truy cập.", "placeholder": "Mã mời của tôi", "invalidCode": "Mã mời không hợp lệ", "verificationFailed": "Xác minh thất bại - vui lòng thử lại", "accessGranted": "Đã cấp quyền truy cập", "initializing": "Chào mừng đến FlowithOS. Đang khởi tạo..." }, "browserImport": { "title": "Tiếp tục từ nơi bạn đã dừng lại", "subtitle": "Nhập mượt mà dấu trang và phiên đã lưu từ trình duyệt hiện tại của bạn.", "detecting": "Đang phát hiện trình duyệt đã cài đặt...", "noBrowsers": "Không phát hiện trình duyệt đã cài đặt", "imported": "Đã nhập", "importing": "Đang nhập...", "bookmarks": "dấu trang", "importNote": "Nhập mất khoảng 5 giây. Bạn sẽ thấy một hoặc hai nhắc hệ thống.", "skipForNow": "Bỏ qua bây giờ", "nextStep": "Bước tiếp theo" }, "settings": { "title": "Sẵn sàng để Flow?", "subtitle": "Một số điều chỉnh nhanh để hoàn thiện trải nghiệm Flowith OS của bạn.", "defaultBrowser": { "title": "Đặt làm trình duyệt mặc định", "description": "Để web chảy đến bạn. Liên kết sẽ mở trực tiếp trong FlowithOS, dệt nội dung trực tuyến một cách mượt mà vào không gian làm việc của bạn." }, "addToDock": { "title": "Thêm vào Dock / Thanh tác vụ", "description": "Giữ trung tâm sáng tạo của bạn cách một cú nhấp chuột để truy cập ngay lập tức bất cứ khi nào cảm hứng tới." }, "launchAtStartup": { "title": "Khởi động cùng hệ thống", "description": "Bắt đầu ngày của bạn sẵn sàng để tạo. Flowith OS sẽ đợi bạn ngay khi bạn đăng nhập." }, "helpImprove": { "title": "Giúp chúng tôi cải thiện", "description": "Chia sẻ dữ liệu sử dụng ẩn danh để giúp chúng tôi xây dựng sản phẩm tốt hơn cho mọi người.", "privacyNote": "Quyền riêng tư của bạn được bảo vệ hoàn toàn." }, "canChangeSettingsLater": "Bạn có thể thay đổi các cài đặt này sau", "nextStep": "Bước tiếp theo", "privacy": { "title": "Lưu trữ cục bộ 100% và bảo vệ quyền riêng tư", "description": "Lịch sử thực thi Agent, lịch sử duyệt web, Ký ức và Kỹ năng, thông tin xác thực tài khoản và tất cả dữ liệu riêng tư đều được lưu trữ 100% cục bộ trên thiết bị của bạn. Không có gì được đồng bộ lên máy chủ đám mây. Bạn có thể sử dụng FlowithOS với sự yên tâm hoàn toàn." } }, "examples": { "title1": "OS đã thức dậy.", "title2": "Xem nó hoạt động.", "subtitle": "Bắt đầu với một ví dụ để xem cách nó hoạt động.", "enterFlowithOS": "Vào FlowithOS", "clickToReplay": "nhấp để phát lại trường hợp này", "videoNotSupported": "Trình duyệt của bạn không hỗ trợ phát video.", "cases": { "shopping": { "title": "Hoàn thành mua sắm ngày lễ nhanh hơn 10X", "description": "Điền vào giỏ hàng của bạn bộ quà tặng chó hoàn hảo—tiết kiệm cho bạn hơn 2 giờ duyệt thủ công." }, "contentEngine": { "title": "Động cơ nội dung X 24/7", "description": "Khám phá những câu chuyện hàng đầu trên Hacker News, viết bằng giọng điệu độc đáo của bạn và tự động đăng lên X. Thúc đẩy lượt truy cập hồ sơ tăng 3X và tăng trưởng cộng đồng thực sự." }, "tiktok": { "title1": "Máy tạo Hype TikTok: 500+ Tương tác,", "title2": "0 Nỗ lực", "description": "Flowith OS tràn ngập các livestream có lưu lượng cao với bình luận văn hóa sắc bén, biến sự hiện diện kỹ thuật số thành đà tăng trưởng đo lường được." }, "youtube": { "title": "Tăng trưởng kênh Youtube tự động 95%", "description": "Flowith OS đơn giản hóa toàn bộ quy trình làm việc YouTube không mặt, từ tạo đến cộng đồng, nén các tuần công việc thành ít hơn một giờ." } } }, "oauth": { "connecting": "Đang kết nối với {{provider}}", "completeInBrowser": "Vui lòng hoàn tất xác thực trong tab trình duyệt vừa mở.", "cancel": "Hủy" }, "terms": { "title": "Điều khoản sử dụng & Chính sách bảo mật", "subtitle": "Vui lòng xem lại các điều khoản bên dưới.", "close": "Đóng" }, "invitationCodes": { "title": "Mã mời của tôi", "availableToShare": "{{unused}}/{{total}} có thể chia sẻ", "loading": "Đang tải mã của bạn...", "noCodesYet": "Chưa có mã mời.", "noCodesFound": "Không tìm thấy mã mời", "failedToLoad": "Không thể tải mã mời", "useCodeHint": "Sử dụng mã mời để nhận mã của riêng bạn!", "shareHint": "Chia sẻ các mã này với bạn bè để mời họ tham gia FlowithOS", "used": "Đã sử dụng" }, "history": { "title": "Lịch sử", "searchPlaceholder": "Tìm kiếm lịch sử...", "selectAll": "Chọn tất cả", "deselectAll": "Bỏ chọn tất cả", "deleteSelected": "Xóa đã chọn ({{count}})", "clearAll": "Xóa tất cả", "loading": "Đang tải lịch sử...", "noMatchingHistory": "Không tìm thấy lịch sử phù hợp", "noHistoryYet": "Chưa có lịch sử", "confirmDelete": "Xác nhận xóa", "deleteConfirmMessage": "Bạn có chắc chắn muốn xóa lịch sử đã chọn? Hành động này không thể hoàn tác.", "cancel": "Hủy", "delete": "Xóa", "today": "Hôm nay", "yesterday": "Hôm qua", "earlier": "Trước đó", "untitled": "Không có tiêu đề", "visitedTimes": "Đã truy cập {{count}} lần", "openInNewTab": "Mở trong tab mới", "timePeriod": "Khoảng thời gian", "timeRangeAll": "Tất cả", "timeRangeAllDesc": "Toàn bộ lịch sử duyệt web", "timeRangeToday": "Hôm nay", "timeRangeTodayDesc": "Tất cả lịch sử từ hôm nay", "timeRangeYesterday": "Hôm qua", "timeRangeYesterdayDesc": "Lịch sử từ hôm qua", "timeRangeLast7Days": "7 ngày qua", "timeRangeLast7DaysDesc": "Lịch sử từ tuần qua", "timeRangeThisMonth": "Tháng này", "timeRangeThisMonthDesc": "Lịch sử từ tháng này", "timeRangeLastMonth": "Tháng trước", "timeRangeLastMonthDesc": "Lịch sử từ tháng trước", "deleteTimeRange": "Xóa {{range}}" } };
const update$2 = { "checking": { "title": "Đang kiểm tra cập nhật", "description": "Đang kết nối đến máy chủ cập nhật..." }, "noUpdate": { "title": "Bạn đã cập nhật mới nhất", "currentVersion": "Phiên bản hiện tại v{{version}}", "description": "Bạn đang sử dụng phiên bản mới nhất", "close": "Đóng" }, "available": { "title": "Có phiên bản mới", "version": "v{{version}} có sẵn", "currentVersion": "(Hiện tại: v{{current}})", "released": "Đã phát hành {{time}}", "betaNote": "Chúng tôi đang ở bản beta công khai và gửi cải tiến hàng ngày. Cập nhật ngay để duy trì phiên bản mới nhất.", "defaultReleaseNotes": "Bản phát hành beta này bao gồm cải thiện hiệu suất, sửa lỗi và tính năng mới. Chúng tôi gửi cập nhật hàng ngày. Vui lòng cập nhật ngay để có trải nghiệm tốt nhất.", "downloadNow": "Tải xuống ngay", "remindLater": "Nhắc tôi sau", "preparing": "Đang chuẩn bị..." }, "downloading": { "title": "Đang tải xuống cập nhật", "version": "Đang tải xuống v{{version}}", "progress": "Tiến trình tải xuống", "hint": "Bạn có thể mở trình cài đặt đã tải xuống bằng cách nhấp vào nút bên dưới" }, "readyToInstall": { "title": "Sẵn sàng để cài đặt", "downloaded": "v{{version}} đã tải xuống xong", "hint": "Khởi động lại để hoàn tất cài đặt cập nhật", "restartNow": "Khởi động lại ngay", "restartLater": "Khởi động lại sau", "restarting": "Đang khởi động lại..." }, "error": { "title": "Kiểm tra cập nhật thất bại", "default": "Cập nhật thất bại. Vui lòng thử lại sau.", "downloadFailed": "Tải xuống thất bại. Vui lòng thử lại sau.", "installFailed": "Cài đặt thất bại. Vui lòng thử lại sau.", "close": "Đóng", "noChannelPermission": "Tài khoản của bạn không có quyền truy cập vào kênh cập nhật {{channel}}. Vui lòng chuyển sang Stable và thử lại.", "switchToStable": "Chuyển sang Stable và thử lại" }, "time": { "justNow": "vừa xong", "minutesAgo": "{{count}} phút trước", "hoursAgo": "{{count}} giờ trước" }, "notifications": { "newVersionAvailable": "Có phiên bản mới {{version}}", "downloadingInBackground": "Đang tải xuống trong nền", "updateDownloaded": "Đã tải xuống cập nhật", "readyToInstall": "Phiên bản {{version}} sẵn sàng để cài đặt" } };
const updateToast$2 = { "checking": "Đang kiểm tra cập nhật...", "pleaseWait": "Vui lòng đợi", "preparingDownload": "Đang chuẩn bị tải xuống {{version}}", "downloading": "Đang tải xuống cập nhật {{version}}", "updateCheckFailed": "Kiểm tra cập nhật thất bại", "unknownError": "Lỗi không xác định", "updatedTo": "Đã cập nhật lên v{{version}}", "newVersionReady": "Phiên bản mới sẵn sàng", "version": "Phiên bản {{version}}", "close": "Đóng", "gotIt": "Đã hiểu", "installNow": "Khởi động lại ngay", "restarting": "Đang khởi động lại…", "later": "Sau", "collapseUpdateContent": "Thu gọn nội dung cập nhật", "viewUpdateContent": "Xem nội dung cập nhật", "collapseLog": "Thu gọn ^", "viewLog": "Xem nhật ký >", "channelChangeFailed": "Chuyển kênh thất bại: {{error}}", "channelInfo": "Kênh: {{channel}}, Manifest: {{manifest}}", "manualDownloadHint": "Cài đặt tự động thất bại? Vui lòng cài đặt thủ công →", "channelDowngraded": { "title": "Đã chuyển kênh", "message": "Tài khoản của bạn không có quyền truy cập vào {{previousChannel}}. Tự động chuyển sang {{newChannel}}." }, "time": { "justNow": "vừa xong", "minutesAgo": "{{count}} phút trước", "hoursAgo": "{{count}} giờ trước", "daysAgo": "{{count}} ngày trước", "weeksAgo": "{{count}} tuần trước", "monthsAgo": "{{count}} tháng trước", "yearsAgo": "{{count}} năm trước" } };
const errors$2 = { "auth": { "notLoggedIn": "Vui lòng đăng nhập trước", "loginRequired": "Vui lòng đăng nhập trước khi sử dụng tính năng này", "shareRequiresLogin": "Vui lòng đăng nhập trước khi sử dụng tính năng chia sẻ" }, "network": { "networkError": "Lỗi mạng - vui lòng kiểm tra kết nối của bạn", "requestTimeout": "Hết thời gian chờ yêu cầu - vui lòng thử lại", "failedToVerify": "Không thể xác minh quyền truy cập", "failedToFetch": "Không thể tải mã" }, "invitation": { "invalidCode": "Mã mời không hợp lệ", "verificationFailed": "Xác minh thất bại - vui lòng thử lại", "failedToConsume": "Không thể sử dụng mã mời" }, "download": { "downloadFailed": "Tải xuống thất bại", "downloadInterrupted": "Tải xuống bị gián đoạn" }, "security": { "secureConnection": "Kết nối bảo mật", "notSecure": "Không bảo mật", "localFile": "Tệp cục bộ", "unknownProtocol": "Giao thức không xác định" } };
const menus$2 = { "application": { "about": "Về {{appName}}", "checkForUpdates": "Kiểm tra cập nhật...", "settings": "Cài đặt...", "services": "Dịch vụ", "hide": "Ẩn {{appName}}", "hideOthers": "Ẩn các ứng dụng khác", "showAll": "Hiện tất cả", "quit": "Thoát", "updateChannel": "Kênh cập nhật" }, "edit": { "label": "Chỉnh sửa", "undo": "Hoàn tác", "redo": "Làm lại", "cut": "Cắt", "paste": "Dán", "selectAll": "Chọn tất cả" }, "view": { "label": "Xem", "findInPage": "Tìm trong trang", "newTab": "Tab mới", "reopenClosedTab": "Mở lại tab đã đóng", "newTerminalTab": "Tab Terminal mới", "openLocalFile": "Mở tệp cục bộ...", "goBack": "Quay lại", "goForward": "Tiến tới", "viewHistory": "Xem lịch sử", "viewDownloads": "Xem tải xuống", "archive": "Lưu trữ", "reload": "Tải lại", "forceReload": "Buộc tải lại", "actualSize": "Kích thước thực", "zoomIn": "Phóng to", "zoomOut": "Thu nhỏ", "toggleFullScreen": "Chuyển chế độ toàn màn hình" }, "window": { "label": "Cửa sổ", "minimize": "Thu nhỏ", "close": "Đóng", "bringAllToFront": "Đưa tất cả ra phía trước" }, "help": { "label": "Trợ giúp", "about": "Về", "version": "Phiên bản", "aboutDescription1": "Hệ điều hành Agent AI thế hệ tiếp theo", "aboutDescription2": "được xây dựng để tự cải thiện, ghi nhớ và tốc độ.", "copyright": "© 2025 Flowith, Inc. Bảo lưu mọi quyền." }, "contextMenu": { "back": "Quay lại", "forward": "Tiến tới", "reload": "Tải lại", "hardReload": "Tải lại hoàn toàn (Bỏ qua bộ nhớ đệm)", "openLinkInNewTab": "Mở liên kết trong tab mới", "openLinkInExternal": "Mở liên kết trong trình duyệt ngoài", "copyLinkAddress": "Sao chép địa chỉ liên kết", "downloadLink": "Tải xuống liên kết", "openImageInNewTab": "Mở hình ảnh trong tab mới", "copyImageAddress": "Sao chép địa chỉ hình ảnh", "copyImage": "Sao chép hình ảnh", "downloadImage": "Tải xuống hình ảnh", "downloadVideo": "Tải xuống video", "downloadAudio": "Tải xuống âm thanh", "openMediaInNewTab": "Mở phương tiện trong tab mới", "copyMediaAddress": "Sao chép địa chỉ phương tiện", "openFrameInNewTab": "Mở khung trong tab mới", "openInExternal": "Mở trong trình duyệt ngoài", "copyPageURL": "Sao chép URL trang", "viewPageSource": "Xem mã nguồn trang (Tab mới)", "savePageAs": "Lưu trang thành…", "print": "In…", "cut": "Cắt", "paste": "Dán", "searchWebFor": 'Tìm kiếm Web cho "{{text}}"', "selectAll": "Chọn tất cả", "inspectElement": "Kiểm tra phần tử", "openDevTools": "Mở DevTools", "closeDevTools": "Đóng DevTools" }, "fileDialog": { "openLocalFile": "Mở tệp cục bộ", "unsupportedFileType": "Loại tệp không được hỗ trợ", "savePageAs": "Lưu trang thành", "allSupportedFiles": "Tất cả các tệp được hỗ trợ", "htmlFiles": "Tệp HTML", "textFiles": "Tệp văn bản", "images": "Hình ảnh", "videos": "Video", "audio": "Âm thanh", "pdf": "PDF", "webpageComplete": "Trang web, hoàn chỉnh", "singleFile": "Tệp đơn (MHTML)" } };
const dialogs$2 = { "crash": { "title": "Lỗi ứng dụng", "message": "Đã xảy ra lỗi không mong đợi", "detail": "{{error}}\n\nLỗi đã được ghi lại để gỡ lỗi.", "restart": "Khởi động lại", "close": "Đóng" }, "customBackground": { "title": "Nền tùy chỉnh", "subtitle": "Tạo phong cách độc đáo của riêng bạn", "preview": "Xem trước", "angle": "Góc", "stops": "Điểm dừng", "selectImage": "Chọn hình ảnh", "uploading": "Đang tải lên...", "dropImageHere": "Thả hình ảnh vào đây", "dragAndDrop": "Kéo thả hoặc nhấp", "fileTypes": "PNG, JPG, JPEG, WEBP, SVG, GIF", "fit": "Vừa khít", "cover": "Bao phủ", "contain": "Chứa", "fill": "Lấp đầy", "remove": "Xóa", "cancel": "Hủy", "apply": "Áp dụng", "gradient": "Gradient", "solid": "Đồng nhất", "image": "Hình ảnh", "dropImageError": "Vui lòng thả tệp hình ảnh (PNG, JPG, JPEG, WEBP, SVG hoặc GIF)" } };
const humanInput$2 = { "declinedToAnswer": "Người dùng từ chối trả lời, đã bỏ qua câu hỏi này", "needOneInput": "Cần 1 đầu vào để tiếp tục", "needTwoInputs": "Cần sự trợ giúp của bạn cho 2 điều", "needThreeInputs": "Cần 3 quyết định từ bạn", "waitingOnInputs": "Đang chờ {{count}} đầu vào từ bạn", "declineToAnswer": "Từ chối trả lời", "dropFilesHere": "Thả tệp vào đây", "typeYourAnswer": "Nhập câu trả lời của bạn...", "orTypeCustom": "Hoặc nhập tùy chỉnh...", "uploadFiles": "Tải lên tệp", "previousQuestion": "Câu hỏi trước", "goToQuestion": "Đến câu hỏi {{number}}", "nextQuestion": "Câu hỏi tiếp theo" };
const vi = {
  common: common$2,
  nav: nav$2,
  tray: tray$2,
  actions: actions$2,
  status: status$2,
  time: time$2,
  downloads: downloads$2,
  history: history$2,
  invitationCodes: invitationCodes$2,
  tasks: tasks$2,
  flows: flows$2,
  bookmarks: bookmarks$2,
  conversations: conversations$2,
  intelligence: intelligence$2,
  sidebar: sidebar$2,
  tabs: tabs$2,
  userMenu: userMenu$2,
  settings: settings$2,
  updateSettings: updateSettings$2,
  adblock: adblock$2,
  blank: blank$2,
  agentGuide: agentGuide$2,
  reward: reward$2,
  agentWidget: agentWidget$2,
  gate: gate$2,
  update: update$2,
  updateToast: updateToast$2,
  errors: errors$2,
  menus: menus$2,
  dialogs: dialogs$2,
  humanInput: humanInput$2
};
const common$1 = { "ok": "确定", "cancel": "取消", "start": "开始", "delete": "删除", "close": "关闭", "save": "保存", "search": "搜索", "loading": "加载中", "pressEscToClose": "按 ESC 键关闭", "copyUrl": "复制链接", "copied": "已复制", "copy": "复制", "expand": "展开", "collapse": "收起", "openFlowithWebsite": "打开 Flowith 网站", "openAgentGuide": "打开智能体指南", "reward": "奖励", "closeWindow": "关闭窗口", "minimizeWindow": "最小化窗口", "toggleFullscreen": "切换全屏", "saveEnter": "保存 (Enter)", "cancelEsc": "取消 (Esc)", "time": { "justNow": "刚刚", "minutesAgo": "{{count}} 分钟前", "hoursAgo": "{{count}} 小时前", "daysAgo": "{{count}} 天前" } };
const nav$1 = { "tasks": "任务", "flows": "流", "bookmarks": "书签", "intelligence": "智能", "guide": "指南" };
const tray$1 = { "newTask": "新任务", "recentTasks": "最近任务", "viewMore": "查看更多", "showMainWindow": "显示主窗口", "hideMainWindow": "隐藏主窗口", "quit": "退出" };
const actions$1 = { "resume": "继续", "pause": "暂停", "cancel": "取消", "delete": "删除", "archive": "归档", "showInFolder": "在文件夹中显示", "viewDetails": "查看详情", "openFile": "打开文件" };
const status$1 = { "inProgress": "进行中", "completed": "已完成", "archive": "归档", "paused": "已暂停", "failed": "失败", "cancelled": "已取消", "running": "运行中", "wrappingUp": "正在结束..." };
const time$1 = { "today": "今天", "yesterday": "昨天", "earlier": "更早" };
const downloads$1 = { "title": "下载", "all": "全部", "inProgress": "进行中", "completed": "已完成", "noDownloads": "暂无下载", "failedToLoad": "加载下载失败", "deleteConfirmMessage": "确定要删除选中的下载项吗？此操作无法撤销。", "loadingDownloads": "加载中...", "searchPlaceholder": "搜索下载...", "selectAll": "全选", "deselectAll": "取消全选", "deleteSelected": "删除选中项 ({{count}})", "clearAll": "清空全部", "noMatchingDownloads": "未找到匹配的下载", "noDownloadsYet": "暂无下载", "confirmDelete": "确认删除", "cancel": "取消", "delete": "删除" };
const history$1 = { "title": "历史记录", "allTime": "全部时间", "clearHistory": "清除历史", "removeItem": "移除项目", "failedToLoad": "加载历史失败", "failedToClear": "清除历史失败", "searchPlaceholder": "搜索历史记录...", "selectAll": "全选", "deselectAll": "取消全选", "deleteSelected": "删除所选 ({{count}})", "clearAll": "清空全部", "noMatchingHistory": "未找到匹配的记录", "noHistoryYet": "暂无历史记录", "confirmDelete": "确认删除", "deleteConfirmMessage": "确定要删除所选的历史记录吗？此操作无法撤销。", "cancel": "取消", "delete": "删除", "today": "今天", "yesterday": "昨天", "earlier": "更早", "untitled": "无标题", "visitedTimes": "访问过 {{count}} 次", "openInNewTab": "在新标签页中打开", "loading": "加载中...", "timePeriod": "时间范围", "timeRangeAll": "全部", "timeRangeAllDesc": "全部浏览历史", "timeRangeToday": "今天", "timeRangeTodayDesc": "今天的全部历史", "timeRangeYesterday": "昨天", "timeRangeYesterdayDesc": "昨天的历史记录", "timeRangeLast7Days": "最近 7 天", "timeRangeLast7DaysDesc": "过去一周的历史", "timeRangeThisMonth": "本月", "timeRangeThisMonthDesc": "本月的历史记录", "timeRangeLastMonth": "上个月", "timeRangeLastMonthDesc": "上个月的历史记录", "deleteTimeRange": "删除{{range}}", "last7days": "最近7天", "thisMonth": "本月", "lastMonth": "上月" };
const invitationCodes$1 = { "title": "我的邀请码", "availableToShare": "{{unused}}/{{total}} 可分享", "loading": "加载中...", "noCodesYet": "暂无邀请码", "noCodesFound": "未找到邀请码", "failedToLoad": "无法加载邀请码", "useCodeHint": "使用邀请码即可获得专属邀请码！", "shareHint": "分享邀请码给好友，邀请他们加入 FlowithOS", "used": "已使用" };
const tasks$1 = { "title": "任务", "description": "你发起的所有 Agent 任务尽在其中", "transformToPreset": "转换为预设", "noTasks": "暂无任务", "archiveEmpty": "归档为空" };
const flows$1 = { "title": "画布", "description": "你的 Flowith 创意画布空间", "newFlow": "新流", "rename": "重命名", "leave": "离开", "noFlows": "暂无流", "signInToViewFlows": "登录以查看您的流", "pin": "置顶", "unpin": "取消置顶" };
const bookmarks$1 = { "title": "书签", "description": "快速访问常用网页", "bookmark": "书签", "addNewCollection": "添加新收藏夹", "loadingBookmarks": "加载书签中...", "noMatchingBookmarks": "无匹配的书签", "noBookmarksYet": "暂无书签", "importFromBrowsers": "从浏览器导入", "detectingBrowsers": "正在检测浏览器...", "bookmarksCount": "个书签", "deleteCollection": "删除收藏夹", "deleteCollectionConfirm": "确定要删除此收藏夹吗？", "newCollection": "新收藏夹", "enterCollectionName": "输入收藏夹名称", "create": "创建", "collectionName": "收藏夹名称", "saveEnter": "保存 (Enter)", "cancelEsc": "取消 (Esc)", "renameFolder": "重命名文件夹", "renameBookmark": "重命名书签", "deleteFolder": "删除文件夹", "deleteBookmark": "删除书签" };
const conversations$1 = { "title": "会话", "noConversations": "暂无会话" };
const intelligence$1 = { "title": "智能", "description": "通过技能和记忆让 Agent 持续进化", "knowledgeBase": "知识库", "memory": "记忆", "skill": "技能", "createNewSkill": "创建新技能", "createNewMemory": "创建新记忆", "loading": "加载中...", "noSkills": "暂无技能", "noMemories": "暂无记忆", "readOnly": "只读", "readOnlyMessage": "这是一个内置系统技能，可以帮助您的智能体更好地执行任务。它不能直接编辑，但您可以复制它并修改自己的副本。打开后的编辑不会被保存，请注意。", "readOnlyToast": "这是一个内置系统技能，可以帮助您的智能体更好地执行任务。它不能直接编辑，但您可以复制它并修改自己的副本。", "open": "打开", "kbComingSoon": "Flowith 知识库支持即将推出。", "system": "系统", "learnFromUser": "用户", "systemPresetReadOnly": "系统预设（只读）", "actions": "操作", "rename": "重命名", "duplicate": "复制…", "info": "信息", "saving": "保存中...", "fileInfo": "文件信息", "fileName": "名称", "fileSize": "大小", "fileCreated": "创建时间", "fileModified": "修改时间", "fileType": "类型", "fileLocation": "位置", "copyPath": "复制路径", "empowerOS": "Teach Mode - 教学模式", "teachMakesBetter": "教学让 OS 更好", "teachMode": "Teach Mode - 教学模式", "teachModeDescription": "在教学模式中，你可以录制网页工作流与步骤；OS Agent 会安静地观察、学习，并将其提炼为可复用的技能与经验。", "teachModeGoalLabel": "任务目标（可选）", "teachModeGoalPlaceholder": "提供更多上下文供 OS 学习 —— 可以是具体的任务目标，或任何关于工作流或任务相关的信息。", "teachModeTaskDisabled": "在教学模式运行期间无法创建新任务", "empowering": "教学中", "empoweringDescription": "当你演示时，OS Agent 会观察并学习", "yourGoal": "任务目标", "preset": "预设", "generatedSkills": "生成的技能", "showLess": "隐藏", "showMore": "展开", "osHasLearned": "OS 已学会", "complete": "完成", "interactionsPlaceholder": "你演示工作流程时，交互记录会在此显示", "done": "完成", "generatingGuidance": "生成指引中...", "summarizingInteraction": "正在总结每个交互并准备可复用的技能", "skillSaved": "技能已保存", "goal": "目标", "steps": "步骤", "events": "事件", "guidanceSavedSuccessfully": "指引保存成功", "openGuidanceInComposer": "在 Composer 中打开指引", "recordAnotherWorkflow": "录制另一个工作流", "dismissSummary": "关闭摘要", "saveAndTest": "保存并测试", "learning": "学习中...", "teachModeError": "教学模式遇到问题", "errorDetails": "错误详情", "checkNetworkConnection": "请检查你的网络连接，然后重新开始教学模式", "tryAgain": "重试", "resetState": "重置状态", "completeConfirmTitle": "OS 已经学习了你的操作", "completeConfirmMessage": "你可以在下面的清单中选择你想要的结果。", "capturedEvents": "已捕获事件", "confirmAndGenerate": "生成", "generating": "生成中", "promptSummary": "提示词摘要", "saveToPreset": "保存为预设", "skillHostname": "技能：{{hostname}}", "saveToSkill": "保存为技能", "selectAll": "全选", "discard": "丢弃", "confirmDiscard": "确定丢弃", "tutorial": { "title": "欢迎使用教学模式", "next": "下一步", "gotIt": "知道了", "guideLabel": "教学模式指南", "page1": { "title": "什么是技能和教学模式？", "description": "技能是 OS 存储可重用专业知识的地方，任何智能体都可以应用。每个技能都是一个基于提示词的指南（可能包含代码片段），涉及 Web 应用程序、工作流程或交互模式。它可以帮助 OS 在特定网站或任务上获得更好的性能。\n\n教学模式是您可以训练 OS 复制您的日常操作或学习如何在特定网站上工作的方式，这些操作将被存储为<strong>技能和预设</strong>，供您将来重复使用。" }, "page2": { "title": "如何启动教学模式？", "description": "首先，点击左侧「<strong>智能面板</strong>」中的「<strong>教学模式</strong>」按钮。在开始之前，请设置一个<strong>教学目标</strong>，为 OS 提供初始指令，并为您提供清晰的任务指引。" }, "page3": { "title": "OS 如何学习你的操作？", "description": "在您教学时，OS 会实时观察您的操作并跟踪您的光标。您将在左侧面板中看到记录的每一步 — 随时暂停，并在完成时点击红色「<strong>停止</strong>」图标。" }, "page4": { "title": "OS 的学习成果是什么？", "description": "完成教学后，选择您希望生成的结果类型。通常，会为日常任务生成预设和相关技能。生成后，您可以在 <strong>Composer</strong> 中查看和编辑它们，或随时在「<strong>智能</strong>」面板的「<strong>从用户学习</strong>」文件夹中访问它们。" } }, "skillTooltip": "您可以在下方修改或编辑技能", "skillSectionTooltip": "每个技能都以教学会话中使用的网站域名命名。新学习的技能将作为新章节出现在相应的 Markdown 文件中。" };
const sidebar$1 = { "goBack": "后退", "goForward": "前进", "lockSidebar": "锁定侧边栏", "unlockSidebar": "解锁侧边栏", "searchOrEnterAddress": "搜索或输入地址", "reload": "刷新" };
const tabs$1 = { "openNewBlankPage": "打开新空白页", "newTab": "新标签页", "terminal": "终端", "pauseAgent": "暂停智能体", "resumeAgent": "继续智能体" };
const userMenu$1 = { "upgrade": "升级", "creditsLeft": "剩余", "clickToManageSubscription": "点击管理订阅", "theme": "主题", "lightMode": "浅色模式", "darkMode": "深色模式", "systemMode": "系统模式", "language": "语言", "settings": "设置", "invitationCode": "邀请码", "checkUpdates": "检查更新", "contactUs": "联系我们", "signOut": "退出登录", "openUserMenu": "打开用户菜单", "signIn": "登录" };
const settings$1 = { "title": "设置", "history": "历史", "downloads": "下载", "adblock": "广告拦截", "language": "语言", "languageDescription": "选择您首选的界面语言。更改将立即生效。", "softwareUpdate": "软件更新" };
const updateSettings$1 = { "description": "自动保持 Flowith OS 最新。Stable 稳定，Beta 尝鲜，Alpha 实验性。", "currentVersion": "当前版本：{{version}}", "loadError": "加载失败", "warning": "警告：Beta/Alpha 版本可能不稳定，生产环境请使用 Stable。", "channel": { "label": "更新通道", "hint": "仅可选择你有访问权限的通道。", "disabledHint": "更新进行中无法切换渠道", "options": { "stable": "Stable", "beta": "Beta", "alpha": "Alpha" } }, "actions": { "title": "手动检查", "hint": "立即检查是否有可用更新。", "check": "检查更新" }, "status": { "noUpdate": "当前已是最新版本。", "hasUpdate": "发现新版本。", "error": "检查更新失败。" }, "tips": { "title": "提示", "default": "默认情况下，你会收到稳定版更新通知。在 Early Access 中，预发布版本可能不适合生产工作。", "warningTitle": "警告：Nightly 更新将自动应用", "warningBody": "Nightly 版本会在 Cursor 关闭时静默下载并安装，无需确认。" } };
const adblock$1 = { "title": "广告拦截", "description": "拦截侵入式广告和追踪器，过滤页面噪音，让 Neo OS Agent 更精准地理解和提取信息，同时保护您的隐私安全。", "enable": "启用广告拦截", "enableDescription": "自动拦截所有网站的广告", "statusActive": "已启用 - 正在拦截广告", "statusInactive": "未启用 - 不会拦截广告", "adsBlocked": "条广告已拦截", "networkBlocked": "网络请求", "cosmeticBlocked": "元素隐藏", "filterRules": "过滤规则", "activeRules": "条激活规则" };
const blank$1 = { "openNewPage": "打开新空白页", "selectBackground": "选择背景", "isAwake": "已觉醒", "osIsAwake": "OS 已觉醒", "osGuideline": "OS 指南", "osGuidelineDescription": "OS Agent 快速入门 - 架构、模式以及所有功能。", "intelligence": "教学模式", "intelligenceDescription": "教会 OS Agent 执行任务，日后即可复用", "inviteAndEarn": "邀请有礼", "tagline": "主动执行与记忆，随每个行动而进化，真正为你交付价值。", "taskPreset": "任务预设", "credits": "+{{amount}} 积分", "addPreset": "添加新预设", "editPreset": "编辑预设", "deletePreset": "删除预设", "previousPreset": "上一个预设", "nextPreset": "下一个预设", "previousPresets": "上一页预设", "nextPresets": "下一页预设", "createPreset": "创建预设", "presetName": "预设名称", "instruction": "指令", "presetNamePlaceholderCreate": "例如：周报、代码审查、数据分析...", "presetNamePlaceholderEdit": "输入预设名称...", "instructionPlaceholderCreate": '描述您希望 OS 执行的任务...\n例如："分析本周销售数据并生成汇总报告"', "instructionPlaceholderEdit": "更新任务指令...", "colorBlue": "蓝色", "colorGreen": "绿色", "colorYellow": "黄色", "colorRed": "红色", "selectColor": "选择{{color}}", "creating": "创建中...", "updating": "更新中...", "create": "创建", "update": "更新", "smartInputPlaceholder": "导航、搜索，或让 Neo 来完成...", "processing": "处理中…", "navigate": "导航", "navigateDescription": "在当前标签页中打开此地址", "searchGoogle": "搜索 Google", "searchGoogleDescription": "使用 Google 搜索", "runTask": "运行任务", "runTaskDescription": "使用 Neo 智能体执行", "createCanvas": "在画布中提问", "createCanvasDescription": "用当前内容打开 Flo 画布" };
const agentGuide$1 = { "title": "智能体指南", "subtitle": "OS Agent 的可视化快速入门：架构、模式以及所有功能。", "capabilities": { "heading": "功能列表", "navigate": { "title": "导航", "desc": "打开页面、前进后退" }, "click": { "title": "点击", "desc": "与按钮和链接交互" }, "type": { "title": "输入", "desc": "填写输入框和表单" }, "keys": { "title": "按键", "desc": "回车、退出、快捷键" }, "scroll": { "title": "滚动", "desc": "浏览长页面" }, "tabs": { "title": "标签页", "desc": "标记、切换、关闭" }, "files": { "title": "文件", "desc": "写入、读取、下载" }, "skills": { "title": "技能", "desc": "共享知识" }, "memories": { "title": "记忆", "desc": "长期偏好" }, "upload": { "title": "上传", "desc": "向页面发送文件" }, "ask": { "title": "询问", "desc": "快速用户确认" }, "onlineSearch": { "title": "在线搜索", "desc": "快速网络查询" }, "extract": { "title": "提取", "desc": "获取结构化信息" }, "deepThink": { "title": "深度思考", "desc": "结构化分析" }, "vision": { "title": "视觉", "desc": "非 DOM 精确操作" }, "shell": { "title": "Shell", "desc": "运行命令（如可用）" }, "report": { "title": "报告", "desc": "完成并总结" } }, "benchmark": { "title": "Online‑Mind2Web 基准测试", "subtitle": "Flowith Neo AgentOS 全面领先：以", "subtitleHighlight": "近乎完美", "subtitleEnd": "的表现主导全局。", "openai": "OpenAI Operator", "gemini": "Gemini 2.5 Computer Use", "flowith": "Flowith Neo OS", "average": "平均", "easy": "简单", "medium": "中等", "hard": "困难" }, "skillsMemories": { "heading": "技能与记忆", "description": "可重用的操作手册和长期上下文，Neo 在专业模式下自动引用。", "markdownTag": "Markdown .md", "autoIndexedTag": "自动索引", "citationsTag": "日志引用", "howNeoUses": "Neo 如何使用：在专业模式的每个步骤之前，Neo 会检查相关的技能和记忆，将它们合并到推理上下文中，并自动应用指令或偏好。", "skillsTitle": "技能", "skillsTag": "共享", "skillsDesc": "存储任何智能体都可以应用的可重用知识。每个技能都是关于工具、工作流或模式的简短指南。", "skillsProcedures": "最适合：流程", "skillsFormat": "格式：Markdown", "skillsScenario": "日常场景", "skillsScenarioTitle": "转换并分享媒体", "skillsStep1": '你说："把这 20 张图片转成紧凑的 PDF。"', "skillsStep2": "Neo 按照技能上传、转换、等待完成并保存文件。", "skillsOutcome": "结果：一个可以分享的 PDF。", "memoriesTitle": "记忆", "memoriesTag": "个人", "memoriesDesc": "记录你的偏好、个人资料和领域事实。Neo 在做决策时会引用相关项目并在日志中引用。", "memoriesStyle": "最适合：风格、规则", "memoriesPrivate": "默认私密", "memoriesScenario": "日常场景", "memoriesScenarioTitle": "写作语气与风格", "memoriesStep1": "你喜欢简洁、友好且乐观的文案。", "memoriesStep2": "Neo 自动将其应用于邮件、报告和社交帖子。", "memoriesOutcome": "结果：一致的品牌语气，无需重复指令。", "taskFilesTitle": "任务文件", "taskFilesTag": "任务级", "taskFilesDesc": "当前任务期间创建的临时文件。它们促进工具 I/O 和中间结果，不会自动与其他任务共享。", "taskFilesEphemeral": "临时", "taskFilesReadable": "工具可读", "taskFilesScenario": "日常场景", "taskFilesScenarioTitle": "旅行价格跟踪", "taskFilesStep1": "Neo 抓取航班表并将其存储为此任务的 CSV。", "taskFilesStep2": "比较今天和昨天的票价并突出显示变化。", "taskFilesOutcome": "结果：整洁的摘要和可下载的 CSV。" }, "system": { "title": "Neo OS - 为你打造的最智能本地智能体", "tagline": "自我进化 × 记忆与技能 × 速度与智能", "selfEvolving": "自我进化", "intelligence": "智能", "contextImprovement": "上下文改进", "contextDesc": "反思智能体通过技能系统实时优化上下文", "onlineRL": "在线 RL", "onlineRLDesc": "定期更新与智能体行为对齐", "intelligentMemory": "智能记忆", "architecture": "架构", "dualLayer": "双层系统", "dualLayerDesc": "短期缓冲 + 长期情景记忆", "knowledgeTransfer": "知识迁移", "knowledgeTransferDesc": "在任务间保留、重用和迁移学习", "highPerformance": "高性能", "infrastructure": "基础设施", "executionKernel": "执行内核", "executionKernelDesc": "并行编排与动态调度", "speedCaching": "速度缓存", "speedCachingDesc": "毫秒级响应与实时执行", "speedIndicator": "~1毫秒", "summary": "进化 · 持久 · 快速" }, "arch": { "heading": "架构", "osShell": "OS Shell", "agentCore": "智能体核心", "plannerExecutor": "规划器 · 执行器", "browserTabs": "浏览器标签页", "domCanvas": "DOM · Canvas", "filesMemoriesSkills": "文件 · 记忆 · 技能", "domPageTabs": "DOM · 页面 · 标签页", "clickTypeScroll": "点击 · 输入 · 滚动", "visionNonDOM": "视觉 · 非 DOM 操作", "captchaDrag": "CAPTCHA · 拖拽", "onlineSearchThinking": "在线搜索 · 深度思考", "googleAnalysis": "google · 分析", "askUserReport": "询问用户 · 报告", "choicesDoneReport": "choices · done_and_report" }, "tips": { "heading": "提示", "beta": "FlowithOS 目前处于 Beta 阶段；产品和 Agent Neo 都在持续更新中。请关注最新更新。", "improving": "Agent Neo OS 的能力日益增强，您可以尝试使用新功能来完成任务。" } };
const reward$1 = { "helloWorld": "Hello World", "helloWorldDesc": "这是 Agent 时代的「Hello World」一刻<br />成为世界首批在下一代 Agent 互联网上留下凹痕的人", "get2000Credits": "获得你的2000积分", "equivalent7Days": "相当于自动化运营你的社交媒体连续7天", "shareInstructions": `觉醒之后，向世界介绍你的 FlowithOS<br />它将会自动为您在所选的平台上创建并发布一条"Hello World"信息。<br />这就像它之后能为您做的任何事情一样。<br /><span style='display: block; height: 8px;'></span>请坐好，静观其变。`, "osComing": "OS 来咯", "awakeOS": "Awake OS", "page2Title": "邀请好友，赚取积分", "page2Description1": "好的旅程需要好的伙伴。", "page2Description2": "每邀请一位好友加入，即可获得", "page2Description3": "积分奖励。", "retry": "重试", "noCodesYet": "暂无邀请码", "activated": "已激活", "neoStarting": "Neo 正在启动自动分享任务...", "failed": "失败", "unknownError": "未知错误", "errorRetry": "出错了，请重试", "unexpectedResponse": "服务器响应异常", "failedToLoadCodes": "无法加载邀请码", "congratsCredits": "恭喜你！+{{amount}} 积分", "rewardUnlocked": "分享奖励已到账" };
const agentWidget$1 = { "modes": { "fast": { "label": "快速模式", "description": "以最快速度完成任务，不使用技能和记忆。", "short": "快速", "modeDescription": "更快行动，细节更少" }, "pro": { "label": "专业模式", "description": "最高质量：逐步视觉分析与深度推理。根据需要引用技能和记忆。", "short": "专业", "modeDescription": "平衡模式，由 Neo 决定" } }, "minimize": "最小化", "placeholder": "让 Neo OS Agent 执行...", "changeModeTooltip": "更改模式以调整 Agent 的行为", "preset": "预设", "selectPresetTooltip": "选择要使用的预设", "addNewPreset": "添加新预设", "agentHistoryTooltip": "Agent 的操作历史", "createPreset": "创建预设", "presetName": "预设名称", "instruction": "指令", "upload": "上传", "newTask": "新建任务", "draft": "草稿", "copyPrompt": "复制提示词", "showMore": "展开", "showLess": "收起", "agentIsWorking": "智能体工作中", "agentIsWrappingUp": "智能体收尾中", "completed": "已完成", "paused": "已暂停", "created": "已创建", "selectTask": "选择任务", "unpin": "取消固定", "pinToRight": "固定到右侧", "stepsCount": "步骤 ({{count}})", "files": "文件", "filesCount": "文件 ({{count}})", "noFilesYet": "暂无生成的文件", "status": { "wrappingUp": "智能体正在收尾...", "thinking": "智能体思考中...", "wrappingUpAction": "正在完成当前操作..." }, "actions": { "markedTab": "已标记标签页", "openRelatedTab": "打开相关标签页（开发中）", "open": "打开", "openTab": "打开标签页", "showInFolder": "在文件夹中显示", "preview": "预览", "followUpPrefix": "你", "actionsHeader": "操作" }, "controls": { "rerun": "重新运行（开发中）", "pause": "暂停", "pauseAndArchive": "暂停并归档", "resume": "继续", "wrappingUpDisabled": "正在结束..." }, "input": { "sending": "发送中...", "adjustTaskPlaceholder": "发送新消息来调整 Agent Neo 的任务..." }, "legacy": { "readOnlyNotice": "旧版任务，仅供查看" }, "refunded": { "noFollowUp": "该任务已退款，无法继续发送消息。" }, "skills": { "matchingSkills": "匹配相关技能中…", "scanningSkills": "扫描可用技能中…", "scanningMap": "检索技能库中…" }, "billing": { "creditsDepletedTitle": "充值积分以继续", "creditsDepletedMessage": "由于积分不足，智能体已暂停。请充值积分或更新计费信息，然后重新运行任务。" }, "presetActions": { "editPreset": "编辑预设", "deletePreset": "删除预设" }, "feedback": { "success": { "short": "干得漂亮！", "long": "目前为止很好，干得漂亮！" }, "refund": { "short": "糟糕，退款！", "long": "糟糕，我要退回积分！" }, "refundSuccess": { "long": "太棒了！您的积分已退回！" }, "modal": { "title": "请求积分退款", "credits": "{{count}} 积分", "description": "如果您对此任务不满意，请申请退款，我们将立即退还该任务所使用的所有积分。", "whatGoesWrong": "出了什么问题", "errorMessage": "抱歉，请提供更多详细信息", "placeholder": "描述出了什么问题...", "shareTask": "与我们分享此任务", "shareDescription": "我们将对您的任务中的所有个人详细信息进行脱敏处理。通过与我们分享您的任务，我们将在未来改进代理在类似任务上的性能。", "upload": "上传", "attachFile": "附加文件", "submit": "提交", "submitting": "提交中...", "alreadyRefunded": { "title": "已退款", "message": "该任务已经退款过了。您无法再次请求退款。" } }, "errors": { "systemError": "系统错误。请联系我们的团队寻求支持。", "networkError": "网络错误。请检查您的连接并重试。", "noUsageData": "未找到使用数据。无法退款。", "alreadyRefunded": "该任务已经退款过了。", "notAuthenticated": "请先登录后再请求退款。", "unknownError": "发生了意外错误。请稍后重试。", "validationFailed": "暂时无法验证您的理由。请稍后再试。", "invalidReason": "理由被拒绝。请描述实际出了什么问题。" }, "confirmation": { "creditsRefunded": "已退款 {{count}} 积分", "title": "成功", "message": "谢谢！我们的团队将诊断您的任务并改进 FlowithOS 体验。", "messageNoShare": "谢谢！我们的团队将持续努力改进 FlowithOS 体验。" } } };
const gate$1 = { "welcome": { "title": "欢迎来到 FlowithOS", "subtitle": "从网络到世界，FlowithOS 是最智能的 AgenticOS，将您的浏览器转化为真实世界的价值。", "features": { "execute": { "title": "自动执行任何任务", "description": "以机器的速度展现人类直觉，FlowithOS 在网络上反复导航并执行多项任务。" }, "transform": { "title": "智能地将想法转化为影响", "description": "从灵感到价值创造，FlowithOS 将伟大的想法转化为行动，交付真实的结果。" }, "organize": { "title": "系统地组织您的资产", "description": "从零散的书签到结构化的剧本，FlowithOS 为您提供强大的系统来管理、整理和扩展您的数字资产。" }, "evolve": { "title": "与您一起动态进化", "description": "通过每次交互成长的记忆，FlowithOS 开发定制技能——从导航复杂网站到理解您的个人风格。" } }, "letsGo": "开始吧！" }, "auth": { "createAccount": "创建账号", "signInToFlowith": "登录 Flowith 账号", "oneAccount": "一个账号，畅享所有 Flowith 产品", "fromAnotherAccount": "使用第三方登录", "useOwnEmail": "使用你的邮箱", "email": "邮箱", "password": "密码", "confirmPassword": "确认密码", "acceptTerms": "我同意 FlowithOS 的服务条款和隐私政策", "privacyNote": "你的所有数据将 100% 安全存储在本地，不会同步到云端服务器", "alreadyHaveAccount": "已有账号？点此登录", "createNewAccount": "没有账号？点此注册", "signUp": "注册", "signIn": "登录", "processing": "处理中...", "verifyEmail": "验证邮箱", "verificationCodeSent": "验证码已发送至 {{email}}", "enterVerificationCode": "输入验证码", "verificationCode": "验证码", "enterSixDigitCode": "请输入 6 位验证码", "backToSignUp": "返回注册", "verifying": "验证中...", "verifyCode": "确认", "errors": { "enterEmail": "请输入邮箱", "enterPassword": "请输入密码", "confirmPassword": "请再次输入密码", "passwordsDoNotMatch": "两次输入的密码不一致", "acceptTerms": "请同意服务条款和隐私政策", "authFailed": "登录失败，请重试", "invalidVerificationCode": "请输入正确的 6 位验证码", "verificationFailed": "验证失败，请重试", "oauthFailed": "第三方登录失败，请重试", "userAlreadyExists": "该邮箱已注册，请" }, "goToLogin": "去登录", "signInPrompt": "登录" }, "invitation": { "title": "觉醒需要一把钥匙", "subtitle": "请输入邀请码解锁 FlowithOS", "lookingForInvite": "想要邀请码？", "followOnX": "关注 X 平台的 @flowith", "toGetAccess": "即可获取。", "placeholder": "输入邀请码", "invalidCode": "邀请码无效", "verificationFailed": "验证失败，请重试", "accessGranted": "验证成功", "initializing": "欢迎使用 FlowithOS，正在初始化..." }, "browserImport": { "title": "接续之前的浏览", "subtitle": "一键导入现有浏览器中的书签和会话记录。", "detecting": "正在检测浏览器...", "noBrowsers": "未检测到可用浏览器", "imported": "已导入", "importing": "导入中...", "bookmarks": "个书签", "importNote": "导入约需 5 秒，期间会出现系统授权提示。", "skipForNow": "跳过", "nextStep": "下一步" }, "settings": { "title": "准备好了吗？", "subtitle": "简单几步，优化您的 Flowith OS 体验。", "defaultBrowser": { "title": "设为默认浏览器", "description": "所有链接将自动在 FlowithOS 中打开，网页内容无缝融入您的工作空间。" }, "addToDock": { "title": "添加到程序坞 / 任务栏", "description": "保持一键触达，随时随地激发创意。" }, "launchAtStartup": { "title": "开机自动启动", "description": "每天开机即可使用，Flowith OS 随时待命。" }, "helpImprove": { "title": "帮助我们改进", "description": "分享匿名使用数据，帮助我们为所有人打造更好的产品。", "privacyNote": "您的隐私得到充分保护。" }, "canChangeSettingsLater": "这些设置可随时更改", "nextStep": "下一步", "privacy": { "title": "100% 本地储存和隐私保护", "description": "你的 Agent 执行历史、浏览历史、Memories 和 Skills、各账号及密码信息以及各项隐私都将 100% 仅在本地储存，不会同步到云端服务器，你可以放心使用。" } }, "examples": { "title1": "OS 已觉醒。", "title2": "看它如何工作。", "subtitle": "从示例开始体验。", "enterFlowithOS": "开始使用 FlowithOS", "clickToReplay": "点击查看案例", "videoNotSupported": "您的浏览器不支持播放视频。", "cases": { "shopping": { "title": "节日购物效率提升 10 倍", "description": "自动挑选完美的宠物礼品套装加入购物车，为您节省 2 小时以上的浏览时间。" }, "contentEngine": { "title": "24/7 不间断 X 内容引擎", "description": "自动发现 Hacker News 热门内容，用您的风格创作并发布到 X，带来 3 倍以上的访问量和社区增长。" }, "tiktok": { "title1": "TikTok 流量收割机：500+ 互动，", "title2": "零人力投入", "description": "Flowith OS 在高流量直播间批量发送精准评论，将数字影响力转化为真实增长。" }, "youtube": { "title": "95% 自动化运营 YouTube 频道", "description": "Flowith OS 全流程自动化 YouTube 无露脸运营，从内容创作到社区互动，数周工作量压缩至一小时内完成。" } } }, "oauth": { "connecting": "正在连接 {{provider}}", "completeInBrowser": "请在弹出的浏览器窗口中完成登录。", "cancel": "取消" }, "terms": { "title": "使用条款和隐私政策", "subtitle": "请查看以下条款。", "close": "关闭" }, "invitationCodes": { "title": "我的邀请码", "availableToShare": "{{unused}}/{{total}} 可分享", "loading": "加载中...", "noCodesYet": "暂无邀请码", "noCodesFound": "未找到邀请码", "failedToLoad": "无法加载邀请码", "useCodeHint": "使用邀请码即可获得专属邀请码！", "shareHint": "分享邀请码给好友，邀请他们加入 FlowithOS", "used": "已使用" }, "history": { "title": "历史记录", "searchPlaceholder": "搜索历史记录...", "selectAll": "全选", "deselectAll": "取消全选", "deleteSelected": "删除所选 ({{count}})", "clearAll": "清空全部", "loading": "加载中...", "noMatchingHistory": "未找到匹配的记录", "noHistoryYet": "暂无历史记录", "confirmDelete": "确认删除", "deleteConfirmMessage": "确定要删除所选的历史记录吗？此操作无法撤销。", "cancel": "取消", "delete": "删除", "today": "今天", "yesterday": "昨天", "earlier": "更早", "untitled": "无标题", "visitedTimes": "访问过 {{count}} 次", "openInNewTab": "在新标签页中打开", "timePeriod": "时间范围", "timeRangeAll": "全部", "timeRangeAllDesc": "全部浏览历史", "timeRangeToday": "今天", "timeRangeTodayDesc": "今天的全部历史", "timeRangeYesterday": "昨天", "timeRangeYesterdayDesc": "昨天的历史记录", "timeRangeLast7Days": "最近 7 天", "timeRangeLast7DaysDesc": "过去一周的历史", "timeRangeThisMonth": "本月", "timeRangeThisMonthDesc": "本月的历史记录", "timeRangeLastMonth": "上个月", "timeRangeLastMonthDesc": "上个月的历史记录", "deleteTimeRange": "删除{{range}}" } };
const update$1 = { "checking": { "title": "正在检查更新", "description": "正在连接更新服务器..." }, "noUpdate": { "title": "已是最新版本", "currentVersion": "当前版本 v{{version}}", "description": "您已使用最新版本", "close": "关闭" }, "available": { "title": "发现新版本", "version": "v{{version}} 可用", "currentVersion": "（当前版本：v{{current}}）", "released": "发布于 {{time}}", "betaNote": "我们正处于公测阶段，每天都会发布改进。立即更新以体验最新功能。", "defaultReleaseNotes": "此测试版包含性能改进、错误修复和新功能。我们每天都会发布更新，请立即更新以获得最佳体验。", "downloadNow": "立即下载", "remindLater": "稍后提醒", "preparing": "准备中..." }, "downloading": { "title": "正在下载更新", "version": "正在下载 v{{version}}", "progress": "下载进度", "hint": "下载完成后将提示您安装" }, "readyToInstall": { "title": "准备安装", "downloaded": "v{{version}} 已下载完成", "hint": "重启以完成更新安装", "restartNow": "立即重启", "restartLater": "稍后重启", "restarting": "正在重启..." }, "error": { "title": "更新检查失败", "default": "更新失败，请稍后重试。", "downloadFailed": "下载失败，请稍后重试。", "installFailed": "安装失败，请稍后重试。", "close": "关闭", "noChannelPermission": "当前账号未开通 {{channel}} 更新渠道权限。请选择 Stable 渠道后重试。", "switchToStable": "切换至 Stable 并重试" }, "time": { "justNow": "刚刚", "minutesAgo": "{{count}} 分钟前", "hoursAgo": "{{count}} 小时前" }, "notifications": { "newVersionAvailable": "发现新版本 {{version}}", "downloadingInBackground": "后台下载中", "updateDownloaded": "更新已下载", "readyToInstall": "版本 {{version}} 已准备安装" } };
const updateToast$1 = { "checking": "正在检查更新...", "pleaseWait": "请稍候", "preparingDownload": "准备下载 {{version}}", "downloading": "下载更新 {{version}}", "updateCheckFailed": "更新检查失败", "unknownError": "未知错误", "updatedTo": "已更新到 v{{version}}", "newVersionReady": "新版本已准备好", "version": "版本 {{version}}", "close": "关闭", "gotIt": "知道了", "installNow": "立即重启", "restarting": "正在重启…", "later": "稍后", "collapseUpdateContent": "收起更新内容", "viewUpdateContent": "查看更新内容", "collapseLog": "收起 ︿", "viewLog": "查看日志 >", "channelChangeFailed": "切换渠道失败: {{error}}", "channelInfo": "Channel: {{channel}}, Manifest: {{manifest}}", "manualDownloadHint": "自动安装失败？请手动安装 →", "channelDowngraded": { "title": "渠道已切换", "message": "当前账号无 {{previousChannel}} 渠道权限，已自动切换到 {{newChannel}}。" }, "time": { "justNow": "刚刚", "minutesAgo": "{{count}} 分钟前", "hoursAgo": "{{count}} 小时前", "daysAgo": "{{count}} 天前", "weeksAgo": "{{count}} 周前", "monthsAgo": "{{count}} 月前", "yearsAgo": "{{count}} 年前" } };
const errors$1 = { "auth": { "notLoggedIn": "请先登录", "loginRequired": "请先登录后再使用此功能", "shareRequiresLogin": "请先登录后再使用分享功能" }, "network": { "networkError": "网络错误，请检查网络连接", "requestTimeout": "请求超时，请重试", "failedToVerify": "验证失败", "failedToFetch": "获取失败" }, "invitation": { "invalidCode": "邀请码无效", "verificationFailed": "验证失败，请重试", "failedToConsume": "邀请码使用失败" }, "download": { "downloadFailed": "下载失败", "downloadInterrupted": "下载中断" }, "security": { "secureConnection": "安全连接", "notSecure": "不安全", "localFile": "本地文件", "unknownProtocol": "未知协议" } };
const menus$1 = { "application": { "about": "关于 {{appName}}", "checkForUpdates": "检查更新...", "settings": "设置...", "services": "服务", "hide": "隐藏 {{appName}}", "hideOthers": "隐藏其他", "showAll": "全部显示", "quit": "退出", "updateChannel": "更新渠道" }, "edit": { "label": "编辑", "undo": "撤销", "redo": "重做", "cut": "剪切", "paste": "粘贴", "selectAll": "全选" }, "view": { "label": "视图", "findInPage": "页内查找", "newTab": "新标签页", "reopenClosedTab": "重新打开关闭的标签页", "newTerminalTab": "新终端标签页", "openLocalFile": "打开本地文件...", "goBack": "后退", "goForward": "前进", "viewHistory": "查看历史", "viewDownloads": "查看下载", "archive": "归档", "reload": "刷新", "forceReload": "强制刷新", "actualSize": "实际大小", "zoomIn": "放大", "zoomOut": "缩小", "toggleFullScreen": "切换全屏" }, "window": { "label": "窗口", "minimize": "最小化", "close": "关闭", "bringAllToFront": "前置全部窗口" }, "help": { "label": "帮助", "about": "关于", "version": "版本", "aboutDescription1": "下一代 AI Agent 操作系统", "aboutDescription2": "为自我改进、记忆和速度而构建。", "copyright": "© 2025 Flowith, Inc. 保留所有权利。" }, "contextMenu": { "back": "后退", "forward": "前进", "reload": "刷新", "hardReload": "强制刷新（忽略缓存）", "openLinkInNewTab": "在新标签页中打开链接", "openLinkInExternal": "在外部浏览器中打开链接", "copyLinkAddress": "复制链接地址", "downloadLink": "下载链接", "openImageInNewTab": "在新标签页中打开图片", "copyImageAddress": "复制图片地址", "copyImage": "复制图片", "downloadImage": "下载图片", "downloadVideo": "下载视频", "downloadAudio": "下载音频", "openMediaInNewTab": "在新标签页中打开媒体", "copyMediaAddress": "复制媒体地址", "openFrameInNewTab": "在新标签页中打开框架", "openInExternal": "在外部浏览器中打开", "copyPageURL": "复制页面链接", "viewPageSource": "查看页面源代码（新标签页）", "savePageAs": "页面另存为...", "print": "打印...", "cut": "剪切", "paste": "粘贴", "searchWebFor": '在网络上搜索 "{{text}}"', "selectAll": "全选", "inspectElement": "检查元素", "openDevTools": "打开开发者工具", "closeDevTools": "关闭开发者工具" }, "fileDialog": { "openLocalFile": "打开本地文件", "unsupportedFileType": "不支持的文件类型", "savePageAs": "页面另存为", "allSupportedFiles": "所有支持的文件", "htmlFiles": "HTML 文件", "textFiles": "文本文件", "images": "图片", "videos": "视频", "audio": "音频", "pdf": "PDF", "webpageComplete": "网页，完整", "singleFile": "单个文件 (MHTML)" } };
const dialogs$1 = { "crash": { "title": "应用程序错误", "message": "发生了意外错误", "detail": "{{error}}\n\n错误已记录用于调试。", "restart": "重新启动", "close": "关闭" }, "customBackground": { "title": "自定义背景", "subtitle": "打造你的专属风格", "preview": "预览", "angle": "角度", "stops": "色标", "selectImage": "选择图片", "uploading": "上传中...", "dropImageHere": "拖放图片到此处", "dragAndDrop": "拖放或点击", "fileTypes": "PNG、JPG、JPEG、WEBP、SVG、GIF", "fit": "适应", "cover": "覆盖", "contain": "包含", "fill": "填充", "remove": "移除", "cancel": "取消", "apply": "应用", "gradient": "渐变", "solid": "纯色", "image": "图片", "dropImageError": "请拖放图片文件（PNG、JPG、JPEG、WEBP、SVG 或 GIF）" } };
const humanInput$1 = { "declinedToAnswer": "用户拒绝回答，已跳过此问题", "needOneInput": "需要 1 个输入以继续", "needTwoInputs": "需要您的帮助处理 2 件事", "needThreeInputs": "需要您做 3 个决定", "waitingOnInputs": "等待您提供 {{count}} 个输入", "declineToAnswer": "拒绝回答", "dropFilesHere": "拖放文件至此", "typeYourAnswer": "输入您的答案...", "orTypeCustom": "或自定义输入...", "uploadFiles": "上传文件", "previousQuestion": "上一个问题", "goToQuestion": "跳转到问题 {{number}}", "nextQuestion": "下一个问题" };
const zhCN = {
  common: common$1,
  nav: nav$1,
  tray: tray$1,
  actions: actions$1,
  status: status$1,
  time: time$1,
  downloads: downloads$1,
  history: history$1,
  invitationCodes: invitationCodes$1,
  tasks: tasks$1,
  flows: flows$1,
  bookmarks: bookmarks$1,
  conversations: conversations$1,
  intelligence: intelligence$1,
  sidebar: sidebar$1,
  tabs: tabs$1,
  userMenu: userMenu$1,
  settings: settings$1,
  updateSettings: updateSettings$1,
  adblock: adblock$1,
  blank: blank$1,
  agentGuide: agentGuide$1,
  reward: reward$1,
  agentWidget: agentWidget$1,
  gate: gate$1,
  update: update$1,
  updateToast: updateToast$1,
  errors: errors$1,
  menus: menus$1,
  dialogs: dialogs$1,
  humanInput: humanInput$1
};
const common = { "ok": "確定", "cancel": "取消", "start": "開始", "delete": "刪除", "close": "關閉", "save": "儲存", "search": "搜尋", "loading": "載入中", "pressEscToClose": "按 ESC 鍵關閉", "copyUrl": "複製連結", "copied": "已複製", "copy": "複製", "expand": "展開", "collapse": "收起", "openFlowithWebsite": "開啟 Flowith 網站", "openAgentGuide": "開啟智能體指南", "reward": "獎勵", "closeWindow": "關閉視窗", "minimizeWindow": "最小化視窗", "toggleFullscreen": "切換全螢幕", "saveEnter": "儲存 (Enter)", "cancelEsc": "取消 (Esc)" };
const nav = { "tasks": "任務", "flows": "流程", "bookmarks": "書籤", "intelligence": "智能", "guide": "指南" };
const tray = { "newTask": "新任務", "recentTasks": "最近任務", "viewMore": "查看更多", "showMainWindow": "顯示主視窗", "hideMainWindow": "隱藏主視窗", "quit": "結束" };
const actions = { "resume": "繼續", "pause": "暫停", "cancel": "取消", "delete": "刪除", "archive": "封存", "showInFolder": "在資料夾中顯示", "viewDetails": "檢視詳情", "openFile": "開啟檔案" };
const status = { "inProgress": "進行中", "completed": "已完成", "archive": "封存", "paused": "已暫停", "failed": "失敗", "cancelled": "已取消", "running": "執行中", "wrappingUp": "正在結束..." };
const time = { "today": "今天", "yesterday": "昨天", "earlier": "更早", "justNow": "剛剛", "minutesAgo": "{{count}} 分鐘前", "hoursAgo": "{{count}} 小時前", "daysAgo": "{{count}} 天前" };
const downloads = { "title": "下載", "all": "全部", "inProgress": "進行中", "completed": "已完成", "noDownloads": "暫無下載", "failedToLoad": "載入下載失敗", "deleteConfirmMessage": "確定要刪除選中的下載項嗎？此操作無法撤銷。", "loadingDownloads": "載入中...", "searchPlaceholder": "搜尋下載...", "selectAll": "全選", "deselectAll": "取消全選", "deleteSelected": "刪除選取項 ({{count}})", "clearAll": "清空全部", "noMatchingDownloads": "未找到符合的下載", "noDownloadsYet": "暫無下載", "confirmDelete": "確認刪除", "cancel": "取消", "delete": "刪除" };
const history = { "title": "歷史記錄", "allTime": "全部時間", "clearHistory": "清除歷史", "removeItem": "移除項目", "failedToLoad": "載入歷史失敗", "failedToClear": "清除歷史失敗", "searchPlaceholder": "搜尋歷史記錄...", "selectAll": "全選", "deselectAll": "取消全選", "deleteSelected": "刪除所選 ({{count}})", "clearAll": "清空全部", "noMatchingHistory": "未找到匹配的記錄", "noHistoryYet": "暫無歷史記錄", "confirmDelete": "確認刪除", "deleteConfirmMessage": "確定要刪除所選的歷史記錄嗎？此操作無法撤銷。", "cancel": "取消", "delete": "刪除", "today": "今天", "yesterday": "昨天", "earlier": "更早", "untitled": "無標題", "visitedTimes": "訪問過 {{count}} 次", "openInNewTab": "在新分頁中開啟", "loading": "載入中...", "timePeriod": "時間範圍", "timeRangeAll": "全部", "timeRangeAllDesc": "全部瀏覽歷史", "timeRangeToday": "今天", "timeRangeTodayDesc": "今天的全部歷史", "timeRangeYesterday": "昨天", "timeRangeYesterdayDesc": "昨天的歷史記錄", "timeRangeLast7Days": "最近 7 天", "timeRangeLast7DaysDesc": "過去一週的歷史", "timeRangeThisMonth": "本月", "timeRangeThisMonthDesc": "本月的歷史記錄", "timeRangeLastMonth": "上個月", "timeRangeLastMonthDesc": "上個月的歷史記錄", "deleteTimeRange": "刪除{{range}}", "last7days": "最近7天", "thisMonth": "本月", "lastMonth": "上月" };
const invitationCodes = { "title": "我的邀請碼", "availableToShare": "{{unused}}/{{total}} 可分享", "loading": "載入中...", "noCodesYet": "暫無邀請碼", "noCodesFound": "未找到邀請碼", "failedToLoad": "無法載入邀請碼", "useCodeHint": "使用邀請碼即可獲得專屬邀請碼！", "shareHint": "分享邀請碼給好友，邀請他們加入 FlowithOS", "used": "已使用" };
const tasks = { "title": "任務", "description": "輕鬆掌握所有任務", "transformToPreset": "轉換為預設", "noTasks": "暫無任務", "archiveEmpty": "封存為空" };
const flows = { "title": "流程", "description": "你的創意工作空間", "newFlow": "新流程", "rename": "重新命名", "leave": "離開", "noFlows": "暫無流程", "signInToViewFlows": "登入以檢視您的流程", "pin": "釘選", "unpin": "取消釘選" };
const bookmarks = { "title": "書籤", "description": "快速存取常用網頁", "bookmark": "書籤", "addNewCollection": "新增收藏夾", "loadingBookmarks": "載入書籤中...", "noMatchingBookmarks": "無符合的書籤", "noBookmarksYet": "暫無書籤", "importFromBrowsers": "從瀏覽器匯入", "detectingBrowsers": "正在偵測瀏覽器...", "bookmarksCount": "個書籤", "deleteCollection": "刪除收藏夾", "deleteCollectionConfirm": "確定要刪除此收藏夾嗎？", "newCollection": "新收藏夾", "enterCollectionName": "輸入收藏夾名稱", "create": "建立", "collectionName": "收藏夾名稱", "saveEnter": "儲存 (Enter)", "cancelEsc": "取消 (Esc)", "renameFolder": "重新命名資料夾", "renameBookmark": "重新命名書籤", "deleteFolder": "刪除資料夾", "deleteBookmark": "刪除書籤" };
const conversations = { "title": "對話", "noConversations": "暫無對話" };
const intelligence = { "title": "智能", "description": "打造更聰明的智能助理", "knowledgeBase": "知識庫", "memory": "記憶", "skill": "技能", "createNewSkill": "建立新技能", "createNewMemory": "建立新記憶", "loading": "載入中...", "noSkills": "暫無技能", "noMemories": "暫無記憶", "readOnly": "唯讀", "readOnlyMessage": "這是一個內建系統技能，可以幫助您的智能體更好地執行任務。它無法直接編輯，但您可以複製它並修改自己的副本。開啟後的編輯不會被儲存，請注意。", "readOnlyToast": "這是一個內建系統技能，可以幫助您的智能體更好地執行任務。它無法直接編輯，但您可以複製它並修改自己的副本。", "open": "開啟", "kbComingSoon": "Flowith 知識庫支援即將推出。", "system": "系統", "learnFromUser": "使用者", "systemPresetReadOnly": "系統預設（唯讀）", "actions": "操作", "rename": "重命名", "duplicate": "複製…", "info": "資訊", "saving": "儲存中...", "fileInfo": "檔案資訊", "fileName": "名稱", "fileSize": "大小", "fileCreated": "建立時間", "fileModified": "修改時間", "fileType": "類型", "fileLocation": "位置", "copyPath": "複製路徑", "empowerOS": "教學模式", "teachMakesBetter": "教學讓 OS 更好", "teachMode": "教學模式", "teachModeDescription": "在教學模式中，你可以錄製網頁工作流程與步驟；OS Agent 會安靜地觀察、學習，並將其提煉為可重複使用的技能與經驗。", "teachModeGoalLabel": "任務目標（可選）", "teachModeGoalPlaceholder": "提供更多能讓 OS 學習的脈絡——可以是具體的任務目標，或任何相關資訊。", "teachModeTaskDisabled": "在教學模式運行期間無法建立新任務", "empowering": "教學中", "empoweringDescription": "當你示範時，OS Agent 會觀察並學習", "yourGoal": "任務目標", "preset": "預設", "generatedSkills": "生成的技能", "showLess": "隱藏", "showMore": "展開", "osHasLearned": "OS 已學會", "complete": "完成", "interactionsPlaceholder": "你示範工作流程時，互動記錄會在此顯示", "done": "完成", "generatingGuidance": "生成指引中...", "summarizingInteraction": "正在總結每個互動並準備可複用的技能", "skillSaved": "技能已儲存", "goal": "目標", "steps": "步驟", "events": "事件", "guidanceSavedSuccessfully": "指引儲存成功", "openGuidanceInComposer": "在 Composer 中開啟指引", "recordAnotherWorkflow": "錄製另一個工作流", "dismissSummary": "關閉摘要", "saveAndTest": "儲存並測試", "learning": "學習中...", "teachModeError": "教學模式遇到問題", "errorDetails": "錯誤詳情", "checkNetworkConnection": "請檢查你的網路連線，然後重新開始教學模式", "tryAgain": "重試", "resetState": "重置狀態", "completeConfirmTitle": "OS 賦能已完成", "completeConfirmMessage": "你可以在下面的清單中選擇你想要的結果。", "capturedEvents": "已捕獲事件", "confirmAndGenerate": "生成", "generating": "生成中", "promptSummary": "提示詞摘要", "saveToPreset": "儲存為預設", "skillHostname": "技能：{{hostname}}", "saveToSkill": "儲存為技能", "selectAll": "全選", "discard": "丟棄", "confirmDiscard": "確定丟棄", "tutorial": { "title": "歡迎使用教學模式", "next": "下一步", "gotIt": "知道了", "guideLabel": "教學模式指南", "page1": { "title": "什麼是技能和教學模式？", "description": "技能是 OS 儲存可重複使用專業知識的地方，任何智慧體都可以應用。每個技能都是一個基於提示詞的指南（可能包含程式碼片段），涉及網頁應用程式、工作流程或互動模式。它可以幫助 OS 在特定網站或任務上獲得更好的效能。\n\n教學模式是您可以訓練 OS 複製您的日常操作或學習如何在特定網站上工作的方式，這些操作將被儲存為<strong>技能和預設</strong>，供您將來重複使用。" }, "page2": { "title": "如何啟動教學模式？", "description": "首先，點擊左側「<strong>智慧面板</strong>」中的「<strong>教學模式</strong>」按鈕。在開始之前，請設定一個<strong>教學目標</strong>，為 OS 提供初始指令，並為您提供清晰的任務指引。" }, "page3": { "title": "OS 如何學習你的操作？", "description": "在您教學時，OS 會即時觀察您的操作並追蹤您的游標。您將在左側面板中看到記錄的每一步 — 隨時暫停，並在完成時點擊紅色「<strong>停止</strong>」圖示。" }, "page4": { "title": "OS 的學習成果是什麼？", "description": "完成教學後，選擇您希望生成的結果類型。通常，會為日常任務生成預設和相關技能。生成後，您可以在 <strong>Composer</strong> 中查看和編輯它們，或隨時在「<strong>智慧</strong>」面板的「<strong>從使用者學習</strong>」資料夾中存取它們。" } }, "skillTooltip": "您可以在下方修改或編輯技能", "skillSectionTooltip": "每個技能都以教學期間使用的網站域名命名。新學習的技能將作為新段落出現在相應的 Markdown 檔案中。" };
const sidebar = { "goBack": "返回", "goForward": "前進", "lockSidebar": "鎖定側邊欄", "unlockSidebar": "解鎖側邊欄", "searchOrEnterAddress": "搜尋或輸入網址", "reload": "重新整理" };
const tabs = { "newTab": "新分頁", "terminal": "終端機", "pauseAgent": "暫停智能體", "resumeAgent": "繼續智能體" };
const userMenu = { "upgrade": "升級", "creditsLeft": "剩餘", "clickToManageSubscription": "點擊管理訂閱", "theme": "主題", "lightMode": "淺色模式", "darkMode": "深色模式", "systemMode": "系統模式", "language": "語言", "settings": "設定", "invitationCode": "邀請碼", "checkUpdates": "檢查更新", "contactUs": "聯絡我們", "signOut": "登出", "openUserMenu": "開啟使用者選單", "signIn": "登入" };
const settings = { "title": "設定", "history": "歷史", "downloads": "下載", "adblock": "廣告攔截", "language": "語言", "languageDescription": "選擇您偏好的界面語言。變更將立即生效。", "softwareUpdate": "軟體更新" };
const updateSettings = { "description": "Flowith OS 透過安全可靠的更新保持最新狀態。選擇您的頻道：Stable 追求穩定，Beta 提前體驗功能，Alpha 面向前沿試驗。僅可切換至您的帳號可用的頻道。", "currentVersion": "目前版本：{{version}}", "loadError": "載入失敗", "warning": "警告：Beta/Alpha 版本可能不穩定，生產環境請使用 Stable。", "channel": { "label": "更新通道", "hint": "僅可選擇您有存取權限的通道。", "disabledHint": "更新進行中無法切換頻道", "options": { "stable": "Stable", "beta": "Beta", "alpha": "Alpha" } }, "actions": { "title": "手動檢查", "hint": "立即檢查是否有可用更新。", "check": "檢查更新" }, "status": { "noUpdate": "目前已是最新版本。", "hasUpdate": "發現新版本。", "error": "檢查更新失敗。" }, "tips": { "title": "提示", "default": "預設情況下，您會收到穩定版更新通知。在 Early Access 中，預發布版本可能不適合生產工作。", "warningTitle": "警告：Nightly 更新將自動應用", "warningBody": "Nightly 版本會在 Cursor 關閉時靜默下載並安裝，無需確認。" } };
const adblock = { "title": "廣告攔截", "description": "攔截侵入式廣告和追蹤器，過濾頁面雜訊，讓 Neo OS Agent 更精準地理解和提取資訊，同時保護您的隱私安全。", "enable": "啟用廣告攔截", "enableDescription": "自動攔截所有網站的廣告", "statusActive": "已啟用 - 正在攔截廣告", "statusInactive": "未啟用 - 不會攔截廣告", "adsBlocked": "條廣告已攔截", "networkBlocked": "網路請求", "cosmeticBlocked": "元素隱藏", "filterRules": "過濾規則", "activeRules": "條激活規則" };
const blank = { "openNewPage": "開啟新空白頁", "selectBackground": "選擇背景", "isAwake": "已覺醒", "osIsAwake": "OS 已覺醒", "osGuideline": "OS 指南", "osGuidelineDescription": "OS Agent 快速入門 - 架構、模式以及所有功能。", "intelligence": "教學模式", "intelligenceDescription": "教會 OS Agent 執行任務，之後即可重複使用", "inviteAndEarn": "邀請有禮", "tagline": "擁有主動記憶，隨每個行動而進化，真正理解你。", "taskPreset": "任務預設", "credits": "+{{amount}} 積分", "addPreset": "新增預設", "editPreset": "編輯預設", "deletePreset": "刪除預設", "previousPreset": "上一個預設", "nextPreset": "下一個預設", "previousPresets": "上一頁預設", "nextPresets": "下一頁預設", "createPreset": "建立預設", "presetName": "預設名稱", "instruction": "指令", "presetNamePlaceholderCreate": "例如：週報、程式碼審查、資料分析...", "presetNamePlaceholderEdit": "輸入預設名稱...", "instructionPlaceholderCreate": '描述您希望 OS 執行的任務...\n例如："分析本週銷售資料並產生彙總報告"', "instructionPlaceholderEdit": "更新任務指令...", "colorBlue": "藍色", "colorGreen": "綠色", "colorYellow": "黃色", "colorRed": "紅色", "selectColor": "選擇{{color}}", "creating": "建立中...", "updating": "更新中...", "create": "建立", "update": "更新", "smartInputPlaceholder": "導航、搜尋，或讓 Neo 來完成...", "processing": "處理中…", "navigate": "導航", "navigateDescription": "在目前分頁中開啟此地址", "searchGoogle": "搜尋 Google", "searchGoogleDescription": "使用 Google 搜尋", "runTask": "執行任務", "runTaskDescription": "使用 Neo 智能體執行", "createCanvas": "在畫布中提問", "createCanvasDescription": "以目前內容開啟 Flo 畫布" };
const agentGuide = { "title": "智能體指南", "subtitle": "OS Agent 的視覺化快速入門：架構、模式以及所有功能。", "capabilities": { "heading": "功能列表", "navigate": { "title": "導航", "desc": "開啟頁面、前進後退" }, "click": { "title": "點擊", "desc": "與按鈕和連結互動" }, "type": { "title": "輸入", "desc": "填寫輸入框和表單" }, "keys": { "title": "按鍵", "desc": "Enter、Esc、快捷鍵" }, "scroll": { "title": "捲動", "desc": "瀏覽長頁面" }, "tabs": { "title": "分頁", "desc": "標記、切換、關閉" }, "files": { "title": "檔案", "desc": "寫入、讀取、下載" }, "skills": { "title": "技能", "desc": "共享知識" }, "memories": { "title": "記憶", "desc": "長期偏好" }, "upload": { "title": "上傳", "desc": "向頁面傳送檔案" }, "ask": { "title": "詢問", "desc": "快速用戶確認" }, "onlineSearch": { "title": "線上搜尋", "desc": "快速網路查詢" }, "extract": { "title": "提取", "desc": "取得結構化資訊" }, "deepThink": { "title": "深度思考", "desc": "結構化分析" }, "vision": { "title": "視覺", "desc": "非 DOM 精確操作" }, "shell": { "title": "Shell", "desc": "執行命令（如可用）" }, "report": { "title": "報告", "desc": "完成並總結" } }, "benchmark": { "title": "Online‑Mind2Web 基準測試", "subtitle": "Flowith Neo AgentOS 全面領先：以", "subtitleHighlight": "近乎完美", "subtitleEnd": "的表現主導全局。", "openai": "OpenAI Operator", "gemini": "Gemini 2.5 Computer Use", "flowith": "Flowith Neo OS", "average": "平均", "easy": "簡單", "medium": "中等", "hard": "困難" }, "skillsMemories": { "heading": "技能與記憶", "description": "可重複使用的操作手冊和長期背景，Neo 在專業模式下自動引用。", "markdownTag": "Markdown .md", "autoIndexedTag": "自動索引", "citationsTag": "日誌引用", "howNeoUses": "Neo 如何使用：在專業模式的每個步驟之前，Neo 會檢查相關的技能和記憶，將它們合併到推理背景中，並自動套用指令或偏好。", "skillsTitle": "技能", "skillsTag": "共享", "skillsDesc": "儲存任何智能體都可以套用的可重複使用知識。每個技能都是關於工具、工作流或模式的簡短指南。", "skillsProcedures": "最適合：流程", "skillsFormat": "格式：Markdown", "skillsScenario": "日常場景", "skillsScenarioTitle": "轉換並分享媒體", "skillsStep1": '你說："把這 20 張圖片轉成緊湊的 PDF。"', "skillsStep2": "Neo 按照技能上傳、轉換、等待完成並儲存檔案。", "skillsOutcome": "結果：一個可以分享的 PDF，日誌中有下載連結。", "memoriesTitle": "記憶", "memoriesTag": "個人", "memoriesDesc": "記錄你的偏好、個人資料和領域事實。Neo 在做決策時會引用相關項目並在日誌中引用。", "memoriesStyle": "最適合：風格、規則", "memoriesPrivate": "預設私密", "memoriesScenario": "日常場景", "memoriesScenarioTitle": "寫作語氣與風格", "memoriesStep1": "你喜歡簡潔、友善且樂觀的文案。", "memoriesStep2": "Neo 自動將其套用於郵件、報告和社交貼文。", "memoriesOutcome": "結果：一致的品牌語氣，無需重複指令。", "taskFilesTitle": "任務檔案", "taskFilesTag": "任務級", "taskFilesDesc": "目前任務期間建立的臨時檔案。它們促進工具 I/O 和中間結果，不會自動與其他任務共享。", "taskFilesEphemeral": "臨時", "taskFilesReadable": "工具可讀", "taskFilesScenario": "日常場景", "taskFilesScenarioTitle": "旅行價格追蹤", "taskFilesStep1": "Neo 抓取航班表並將其儲存為此任務的 CSV。", "taskFilesStep2": "比較今天和昨天的票價並反白顯示變化。", "taskFilesOutcome": "結果：整潔的摘要和可下載的 CSV。" }, "system": { "title": "Neo OS - 為你打造的最智能瀏覽器智能體", "tagline": "自我進化 × 記憶與技能 × 速度與智能", "selfEvolving": "自我進化", "intelligence": "智能", "contextImprovement": "背景改進", "contextDesc": "反思智能體透過技能系統即時最佳化背景", "onlineRL": "線上 RL", "onlineRLDesc": "定期更新與智能體行為對齊", "intelligentMemory": "智能記憶", "architecture": "架構", "dualLayer": "雙層系統", "dualLayerDesc": "短期緩衝 + 長期情景記憶", "knowledgeTransfer": "知識遷移", "knowledgeTransferDesc": "在任務間保留、重複使用和遷移學習", "highPerformance": "高效能", "infrastructure": "基礎設施", "executionKernel": "執行核心", "executionKernelDesc": "並行編排與動態排程", "speedCaching": "速度快取", "speedCachingDesc": "毫秒級回應與即時執行", "speedIndicator": "~1毫秒", "summary": "進化 · 持久 · 快速" }, "arch": { "heading": "架構", "osShell": "OS Shell", "agentCore": "智能體核心", "plannerExecutor": "規劃器 · 執行器", "browserTabs": "瀏覽器分頁", "domCanvas": "DOM · Canvas", "filesMemoriesSkills": "檔案 · 記憶 · 技能", "domPageTabs": "DOM · 頁面 · 分頁", "clickTypeScroll": "點擊 · 輸入 · 捲動", "visionNonDOM": "視覺 · 非 DOM 操作", "captchaDrag": "CAPTCHA · 拖曳", "onlineSearchThinking": "線上搜尋 · 深度思考", "googleAnalysis": "google · 分析", "askUserReport": "詢問使用者 · 報告", "choicesDoneReport": "choices · done_and_report" }, "tips": { "heading": "提示", "beta": "FlowithOS 目前處於 Beta 階段；產品和 Agent Neo 都在持續更新中。請關注最新更新。", "improving": "Agent Neo OS 的能力日益增強，您可以嘗試使用新功能來完成任務。" } };
const reward = { "helloWorld": "Hello World", "helloWorldDesc": "這是 Agent 時代的「Hello World」時刻<br />成為世界首批在下一代 Agent 互聯網上留下痕跡的人", "get2000Credits": "獲得你的2000積分", "equivalent7Days": "相當於自動化運營你的社交媒體連續7天", "shareInstructions": "覺醒之後，向世界介紹你的 FlowithOS<br />它將會自動為您在所選的平台上創建並發布一條「Hello World」訊息。<br />這就像它之後能為您做的任何事情一樣。<br /><span style='display: block; height: 8px;'></span>請坐好，靜觀其變。", "osComing": "OS 來囉", "awakeOS": "Awake OS", "page2Title": "邀請好友，賺取積分", "page2Description1": "好的旅程需要好的夥伴。", "page2Description2": "每邀請一位好友加入，即可獲得", "page2Description3": "積分獎勵。", "retry": "重試", "noCodesYet": "暫無邀請碼", "activated": "已啟用", "neoStarting": "Neo 正在啟動自動分享任務...", "failed": "失敗", "unknownError": "未知錯誤", "errorRetry": "出錯了，請重試", "unexpectedResponse": "伺服器響應異常", "failedToLoadCodes": "無法載入邀請碼", "congratsCredits": "恭喜你！+{{amount}} 積分", "rewardUnlocked": "分享獎勵已到帳" };
const agentWidget = { "modes": { "fast": { "label": "快速模式", "description": "以最快速度完成任務，不使用技能和記憶。", "short": "快速", "modeDescription": "更快行動，細節更少" }, "pro": { "label": "專業模式", "description": "最高品質：逐步視覺分析與深度推理。根據需要引用技能和記憶。", "short": "專業", "modeDescription": "平衡模式，由 Neo 決定" } }, "minimize": "最小化", "placeholder": "讓 Neo OS Agent 執行...", "changeModeTooltip": "更改模式以調整 Agent 的行為", "preset": "預設", "selectPresetTooltip": "選擇要使用的預設", "addNewPreset": "新增預設", "agentHistoryTooltip": "Agent 的操作歷史", "createPreset": "建立預設", "presetName": "預設名稱", "instruction": "指令", "upload": "上傳", "newTask": "新建任務", "draft": "草稿", "copyPrompt": "複製提示詞", "showMore": "展開", "showLess": "收起", "agentIsWorking": "智能體工作中", "agentIsWrappingUp": "智能體收尾中", "completed": "已完成", "paused": "已暫停", "created": "已建立", "selectTask": "選擇任務", "unpin": "取消固定", "pinToRight": "固定到右側", "stepsCount": "步驟 ({{count}})", "files": "檔案", "filesCount": "檔案 ({{count}})", "noFilesYet": "尚無生成的檔案", "status": { "wrappingUp": "智能體正在收尾...", "thinking": "智能體思考中...", "wrappingUpAction": "正在完成當前操作..." }, "actions": { "markedTab": "已標記分頁", "openRelatedTab": "開啟相關分頁（開發中）", "open": "開啟", "openTab": "開啟分頁", "showInFolder": "在資料夾中顯示", "preview": "預覽", "followUpPrefix": "你", "actionsHeader": "操作" }, "controls": { "rerun": "重新執行（開發中）", "pause": "暫停", "pauseAndArchive": "暫停並封存", "resume": "繼續", "wrappingUpDisabled": "正在結束..." }, "input": { "sending": "傳送中...", "adjustTaskPlaceholder": "傳送新訊息來調整 Agent Neo 的任務..." }, "legacy": { "readOnlyNotice": "舊版任務，僅供查看" }, "refunded": { "noFollowUp": "該任務已退款，無法繼續傳送訊息。" }, "skills": { "matchingSkills": "匹配相關技能中…", "scanningSkills": "掃描可用技能中…", "scanningMap": "檢索技能庫中…" }, "billing": { "creditsDepletedTitle": "充值積分以繼續", "creditsDepletedMessage": "由於積分不足，智能體已暫停。請充值積分或更新計費資訊，然後重新執行任務。" }, "presetActions": { "editPreset": "編輯預設", "deletePreset": "刪除預設" }, "feedback": { "success": { "short": "做得好！", "long": "到目前為止很好，做得好！" }, "refund": { "short": "糟糕，退款！", "long": "糟糕，我要退回積分！" }, "refundSuccess": { "long": "太棒了！您的積分已退回！" }, "modal": { "title": "請求積分退款", "credits": "{{count}} 積分", "description": "如果您對此任務不滿意，請申請退款，我們將立即退還該任務所使用的所有積分。", "whatGoesWrong": "出了什麼問題", "errorMessage": "抱歉，請提供更多詳細資訊", "placeholder": "描述出了什麼問題...", "shareTask": "與我們分享此任務", "shareDescription": "我們將對您的任務中的所有個人詳細資訊進行脫敏處理。透過與我們分享您的任務，我們將在未來改進代理在類似任務上的效能。", "upload": "上傳", "attachFile": "附加檔案", "submit": "提交", "submitting": "提交中...", "alreadyRefunded": { "title": "已退款", "message": "該任務已經退款過了。您無法再次請求退款。" } }, "errors": { "systemError": "系統錯誤。請聯絡我們的團隊尋求支援。", "networkError": "網路錯誤。請檢查您的連線並重試。", "noUsageData": "未找到使用資料。無法退款。", "alreadyRefunded": "該任務已經退款過了。", "notAuthenticated": "請先登入後再請求退款。", "unknownError": "發生了意外錯誤。請稍後重試。", "validationFailed": "暫時無法驗證您的理由。請稍後再試。", "invalidReason": "理由被拒絕。請描述實際出了什麼問題。" }, "confirmation": { "creditsRefunded": "已退款 {{count}} 積分", "title": "成功", "message": "謝謝！我們的團隊將診斷您的任務並改進 FlowithOS 體驗。", "messageNoShare": "謝謝！我們的團隊將持續努力改進 FlowithOS 體驗。" } } };
const gate = { "welcome": { "title": "歡迎來到 FlowithOS", "subtitle": "從網路到世界，FlowithOS 是最智慧的 AgenticOS，將您的瀏覽器轉化為真實世界的價值。", "features": { "execute": { "title": "自動執行任何任務", "description": "以機器的速度展現人類直覺，FlowithOS 在網路上反覆導航並執行多項任務。" }, "transform": { "title": "智慧地將想法轉化為影響", "description": "從靈感到價值創造，FlowithOS 將偉大的想法轉化為行動，交付真實的結果。" }, "organize": { "title": "系統地組織您的資產", "description": "從零散的書籤到結構化的劇本，FlowithOS 為您提供強大的系統來管理、整理和擴展您的數位資產。" }, "evolve": { "title": "與您一起動態進化", "description": "透過每次互動成長的記憶，FlowithOS 開發客製化技能——從導航複雜網站到理解您的個人風格。" } }, "letsGo": "開始吧！" }, "auth": { "createAccount": "建立帳號", "signInToFlowith": "登入 Flowith 帳號", "oneAccount": "一個帳號，暢享所有 Flowith 產品", "fromAnotherAccount": "使用第三方登入", "useOwnEmail": "使用電子郵件登入", "email": "電子郵件", "password": "密碼", "confirmPassword": "確認密碼", "acceptTerms": "我同意 FlowithOS 的服務條款和隱私權政策", "privacyNote": "你的所有資料將 100% 安全儲存在本機", "alreadyHaveAccount": "已有帳號？點此登入", "createNewAccount": "沒有帳號？點此註冊", "signUp": "註冊", "signIn": "登入", "processing": "處理中...", "verifyEmail": "驗證電子郵件", "verificationCodeSent": "驗證碼已發送至 {{email}}", "enterVerificationCode": "輸入驗證碼", "verificationCode": "驗證碼", "enterSixDigitCode": "請輸入 6 位驗證碼", "backToSignUp": "返回註冊", "verifying": "驗證中...", "verifyCode": "確認", "errors": { "enterEmail": "請輸入電子郵件", "enterPassword": "請輸入密碼", "confirmPassword": "請再次輸入密碼", "passwordsDoNotMatch": "兩次輸入的密碼不一致", "acceptTerms": "請同意服務條款和隱私權政策", "authFailed": "登入失敗，請重試", "invalidVerificationCode": "請輸入正確的 6 位驗證碼", "verificationFailed": "驗證失敗，請重試", "oauthFailed": "第三方登入失敗，請重試", "userAlreadyExists": "該信箱已註冊，請" }, "goToLogin": "前往登入", "signInPrompt": "登入" }, "invitation": { "title": "覺醒需要一把鑰匙", "subtitle": "請輸入邀請碼解鎖 FlowithOS", "lookingForInvite": "想要邀請碼？", "followOnX": "關注 X 平台的 @flowith", "toGetAccess": "即可獲取。", "placeholder": "輸入邀請碼", "invalidCode": "邀請碼無效", "verificationFailed": "驗證失敗，請重試", "accessGranted": "驗證成功", "initializing": "歡迎使用 FlowithOS，正在初始化..." }, "browserImport": { "title": "接續之前的瀏覽", "subtitle": "一鍵匯入現有瀏覽器中的書籤和工作階段。", "detecting": "正在偵測瀏覽器...", "noBrowsers": "未偵測到可用瀏覽器", "imported": "已匯入", "importing": "匯入中...", "bookmarks": "個書籤", "importNote": "匯入約需 5 秒，期間會出現系統授權提示。", "skipForNow": "跳過", "nextStep": "下一步" }, "settings": { "title": "準備好了嗎？", "subtitle": "簡單幾步，優化您的 Flowith OS 體驗。", "defaultBrowser": { "title": "設為預設瀏覽器", "description": "所有連結將自動在 FlowithOS 中開啟，網頁內容無縫融入您的工作空間。" }, "addToDock": { "title": "新增到 Dock / 工作列", "description": "保持一鍵觸達，隨時隨地激發創意。" }, "launchAtStartup": { "title": "開機自動啟動", "description": "每天開機即可使用，Flowith OS 隨時待命。" }, "helpImprove": { "title": "協助我們改進", "description": "分享匿名使用資料，協助我們為所有人打造更好的產品。", "privacyNote": "您的隱私受到完整保護。" }, "canChangeSettingsLater": "這些設定可隨時變更", "nextStep": "下一步", "privacy": { "title": "100% 本機儲存與隱私保護", "description": "您的 Agent 執行歷史、瀏覽歷史、Memories 與 Skills、各帳號及密碼資訊以及各項隱私皆 100% 僅儲存在本機，不會同步到雲端伺服器，請安心使用。" } }, "examples": { "title1": "OS 已覺醒。", "title2": "看它如何工作。", "subtitle": "從範例開始體驗。", "enterFlowithOS": "開始使用 FlowithOS", "clickToReplay": "點擊查看案例", "videoNotSupported": "您的瀏覽器不支援播放影片。", "cases": { "shopping": { "title": "節日購物效率提升 10 倍", "description": "自動挑選完美的寵物禮品套裝加入購物車，為您節省 2 小時以上的瀏覽時間。" }, "contentEngine": { "title": "24/7 不間斷 X 內容引擎", "description": "自動發現 Hacker News 熱門內容，用您的風格創作並發布到 X，帶來 3 倍以上的訪問量和社群成長。" }, "tiktok": { "title1": "TikTok 流量收割機：500+ 互動，", "title2": "零人力投入", "description": "Flowith OS 在高流量直播間批量發送精準評論，將數位影響力轉化為真實成長。" }, "youtube": { "title": "95% 自動化運營 YouTube 頻道", "description": "Flowith OS 全流程自動化 YouTube 無露臉運營，從內容創作到社群互動，數週工作量壓縮至一小時內完成。" } } }, "oauth": { "connecting": "正在連接 {{provider}}", "completeInBrowser": "請在彈出的瀏覽器視窗中完成登入。", "cancel": "取消" }, "terms": { "title": "使用條款和隱私權政策", "subtitle": "請查看以下條款。", "close": "關閉" }, "invitationCodes": { "title": "我的邀請碼", "availableToShare": "{{unused}}/{{total}} 可分享", "loading": "載入中...", "noCodesYet": "暫無邀請碼", "noCodesFound": "未找到邀請碼", "failedToLoad": "無法載入邀請碼", "useCodeHint": "使用邀請碼即可獲得專屬邀請碼！", "shareHint": "分享邀請碼給好友，邀請他們加入 FlowithOS", "used": "已使用" }, "history": { "title": "歷史記錄", "searchPlaceholder": "搜尋歷史記錄...", "selectAll": "全選", "deselectAll": "取消全選", "deleteSelected": "刪除所選 ({{count}})", "clearAll": "清空全部", "loading": "載入中...", "noMatchingHistory": "未找到匹配的記錄", "noHistoryYet": "暫無歷史記錄", "confirmDelete": "確認刪除", "deleteConfirmMessage": "確定要刪除所選的歷史記錄嗎？此操作無法撤銷。", "cancel": "取消", "delete": "刪除", "today": "今天", "yesterday": "昨天", "earlier": "更早", "untitled": "無標題", "visitedTimes": "訪問過 {{count}} 次", "openInNewTab": "在新分頁中開啟", "timePeriod": "時間範圍", "timeRangeAll": "全部", "timeRangeAllDesc": "全部瀏覽歷史", "timeRangeToday": "今天", "timeRangeTodayDesc": "今天的全部歷史", "timeRangeYesterday": "昨天", "timeRangeYesterdayDesc": "昨天的歷史記錄", "timeRangeLast7Days": "最近 7 天", "timeRangeLast7DaysDesc": "過去一週的歷史", "timeRangeThisMonth": "本月", "timeRangeThisMonthDesc": "本月的歷史記錄", "timeRangeLastMonth": "上個月", "timeRangeLastMonthDesc": "上個月的歷史記錄", "deleteTimeRange": "刪除{{range}}" } };
const update = { "checking": { "title": "正在檢查更新", "description": "正在連接更新伺服器..." }, "noUpdate": { "title": "已是最新版本", "currentVersion": "目前版本 v{{version}}", "description": "您已使用最新版本", "close": "關閉" }, "available": { "title": "發現新版本", "version": "v{{version}} 可用", "currentVersion": "（目前版本：v{{current}}）", "released": "發布於 {{time}}", "betaNote": "我們正處於公開測試階段，每天都會發布改進。立即更新以體驗最新功能。", "defaultReleaseNotes": "此測試版包含效能改進、錯誤修復和新功能。我們每天都會發布更新，請立即更新以獲得最佳體驗。", "downloadNow": "立即下載", "remindLater": "稍後提醒", "preparing": "準備中..." }, "downloading": { "title": "正在下載更新", "version": "正在下載 v{{version}}", "progress": "下載進度", "hint": "下載完成後將提示您安裝" }, "readyToInstall": { "title": "準備安裝", "downloaded": "v{{version}} 已下載完成", "hint": "重新啟動以完成更新安裝", "restartNow": "立即重新啟動", "restartLater": "稍後重新啟動", "restarting": "正在重新啟動..." }, "error": { "title": "更新檢查失敗", "default": "更新失敗，請稍後重試。", "downloadFailed": "下載失敗，請稍後重試。", "installFailed": "安裝失敗，請稍後重試。", "close": "關閉" }, "time": { "justNow": "剛剛", "minutesAgo": "{{count}} 分鐘前", "hoursAgo": "{{count}} 小時前" }, "notifications": { "newVersionAvailable": "發現新版本 {{version}}", "downloadingInBackground": "背景下載中", "updateDownloaded": "更新已下載", "readyToInstall": "版本 {{version}} 已準備安裝" } };
const updateToast = { "checking": "正在檢查更新...", "pleaseWait": "請稍候", "preparingDownload": "準備下載 {{version}}", "updateFound": "發現更新 {{version}}", "downloading": "下載更新 {{version}}", "updateCheckFailed": "更新檢查失敗", "unknownError": "未知錯誤", "updatedTo": "已更新到 v{{version}}", "newVersionReady": "新版本已準備好", "version": "版本 {{version}}", "close": "關閉", "gotIt": "知道了", "installNow": "立即重啟", "restarting": "正在重啟…", "later": "稍後", "collapseUpdateContent": "收起更新內容", "viewUpdateContent": "查看更新內容", "collapseLog": "收起 ︿", "viewLog": "查看日誌 >", "channelChangeFailed": "切換頻道失敗: {{error}}", "channelInfo": "Channel: {{channel}}, Manifest: {{manifest}}", "manualDownloadHint": "無法更新？嘗試手動安裝 →", "channelDowngraded": { "title": "頻道已切換", "message": "目前帳號無 {{previousChannel}} 頻道權限，已自動切換到 {{newChannel}}。" }, "continueInBackground": "下載將在後台繼續", "time": { "justNow": "剛剛", "minutesAgo": "{{count}} 分鐘前", "hoursAgo": "{{count}} 小時前", "daysAgo": "{{count}} 天前", "weeksAgo": "{{count}} 週前", "monthsAgo": "{{count}} 個月前", "yearsAgo": "{{count}} 年前" } };
const errors = { "auth": { "notLoggedIn": "請先登入", "loginRequired": "請先登入後再使用此功能", "shareRequiresLogin": "請先登入後再使用分享功能" }, "network": { "networkError": "網路錯誤，請檢查網路連線", "requestTimeout": "請求逾時，請重試", "failedToVerify": "驗證失敗", "failedToFetch": "取得失敗" }, "invitation": { "invalidCode": "邀請碼無效", "verificationFailed": "驗證失敗，請重試", "failedToConsume": "邀請碼使用失敗" }, "download": { "downloadFailed": "下載失敗", "downloadInterrupted": "下載中斷" }, "security": { "secureConnection": "安全連線", "notSecure": "不安全", "localFile": "本機檔案", "unknownProtocol": "未知協定" } };
const menus = { "application": { "about": "關於 {{appName}}", "checkForUpdates": "檢查更新...", "settings": "設定...", "services": "服務", "hide": "隱藏 {{appName}}", "hideOthers": "隱藏其他", "showAll": "全部顯示", "quit": "結束", "updateChannel": "更新頻道" }, "edit": { "label": "編輯", "undo": "還原", "redo": "重做", "cut": "剪下", "paste": "貼上", "selectAll": "全選" }, "view": { "label": "檢視", "findInPage": "頁面內搜尋", "newTab": "新分頁", "reopenClosedTab": "重新開啟已關閉的分頁", "newTerminalTab": "新終端機分頁", "openLocalFile": "開啟本機檔案...", "goBack": "返回", "goForward": "前進", "viewHistory": "檢視歷史", "viewDownloads": "檢視下載", "archive": "封存", "reload": "重新整理", "forceReload": "強制重新整理", "actualSize": "實際大小", "zoomIn": "放大", "zoomOut": "縮小", "toggleFullScreen": "切換全螢幕" }, "window": { "label": "視窗", "minimize": "最小化", "close": "關閉", "bringAllToFront": "將全部移至最前" }, "help": { "label": "說明", "about": "關於", "version": "版本", "aboutDescription1": "新世代 AI Agent 作業系統", "aboutDescription2": "為自我改進、記憶和速度而建構。", "copyright": "© 2025 Flowith, Inc. 保留所有權利。" }, "contextMenu": { "back": "返回", "forward": "前進", "reload": "重新整理", "hardReload": "強制重新整理（忽略快取）", "openLinkInNewTab": "在新分頁中開啟連結", "openLinkInExternal": "在外部瀏覽器中開啟連結", "copyLinkAddress": "複製連結位址", "downloadLink": "下載連結", "openImageInNewTab": "在新分頁中開啟圖片", "copyImageAddress": "複製圖片位址", "copyImage": "複製圖片", "downloadImage": "下載圖片", "downloadVideo": "下載影片", "downloadAudio": "下載音訊", "openMediaInNewTab": "在新分頁中開啟媒體", "copyMediaAddress": "複製媒體位址", "openFrameInNewTab": "在新分頁中開啟框架", "openInExternal": "在外部瀏覽器中開啟", "copyPageURL": "複製頁面連結", "viewPageSource": "檢視頁面原始碼（新分頁）", "savePageAs": "頁面另存為...", "print": "列印...", "cut": "剪下", "paste": "貼上", "searchWebFor": '在網路上搜尋 "{{text}}"', "selectAll": "全選", "inspectElement": "檢查元素", "openDevTools": "開啟開發者工具", "closeDevTools": "關閉開發者工具" }, "fileDialog": { "openLocalFile": "開啟本機檔案", "unsupportedFileType": "不支援的檔案類型", "savePageAs": "頁面另存為", "allSupportedFiles": "所有支援的檔案", "htmlFiles": "HTML 檔案", "textFiles": "文字檔案", "images": "圖片", "videos": "影片", "audio": "音訊", "pdf": "PDF", "webpageComplete": "網頁，完整", "singleFile": "單一檔案 (MHTML)" } };
const dialogs = { "crash": { "title": "應用程式錯誤", "message": "發生了意外錯誤", "detail": "{{error}}\n\n錯誤已記錄用於偵錯。", "restart": "重新啟動", "close": "關閉" }, "customBackground": { "title": "自訂背景", "subtitle": "打造你的專屬風格", "preview": "預覽", "angle": "角度", "stops": "色標", "selectImage": "選擇圖片", "uploading": "上傳中...", "dropImageHere": "拖放圖片到此處", "dragAndDrop": "拖放或點選", "fileTypes": "PNG、JPG、JPEG、WEBP、SVG、GIF", "fit": "適應", "cover": "覆蓋", "contain": "包含", "fill": "填滿", "remove": "移除", "cancel": "取消", "apply": "套用", "gradient": "漸層", "solid": "純色", "image": "圖片", "dropImageError": "請拖放圖片檔案（PNG、JPG、JPEG、WEBP、SVG 或 GIF）" } };
const humanInput = { "declinedToAnswer": "使用者拒絕回答，已跳過此問題", "needOneInput": "需要 1 個輸入以繼續", "needTwoInputs": "需要您的協助處理 2 件事", "needThreeInputs": "需要您做 3 個決定", "waitingOnInputs": "等待您提供 {{count}} 個輸入", "declineToAnswer": "拒絕回答", "dropFilesHere": "拖放檔案至此", "typeYourAnswer": "輸入您的答案...", "orTypeCustom": "或自訂輸入...", "uploadFiles": "上傳檔案", "previousQuestion": "上一個問題", "goToQuestion": "跳轉到問題 {{number}}", "nextQuestion": "下一個問題" };
const zhTW = {
  common,
  nav,
  tray,
  actions,
  status,
  time,
  downloads,
  history,
  invitationCodes,
  tasks,
  flows,
  bookmarks,
  conversations,
  intelligence,
  sidebar,
  tabs,
  userMenu,
  settings,
  updateSettings,
  adblock,
  blank,
  agentGuide,
  reward,
  agentWidget,
  gate,
  update,
  updateToast,
  errors,
  menus,
  dialogs,
  humanInput
};
const resources = {
  de: { translation: de },
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  id: { translation: id },
  jp: { translation: jp },
  ko: { translation: ko },
  pt: { translation: pt },
  ru: { translation: ru },
  th: { translation: th },
  tr: { translation: tr },
  vi: { translation: vi },
  "zh-CN": { translation: zhCN },
  "zh-TW": { translation: zhTW }
};
const getInitialLocale = () => {
  try {
    const storedLocale = localStorage.getItem("flowith-locale");
    if (storedLocale && isValidLocale(storedLocale)) {
      return storedLocale;
    }
  } catch {
  }
  return detectBrowserLocale();
};
const initLocale = getInitialLocale();
instance.use(initReactI18next).init({
  resources,
  lng: initLocale,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
    // React already escapes
  },
  react: {
    useSuspense: false
  }
});
function LocaleSync() {
  const locale = useLocaleStore((s) => s.locale);
  reactExports.useEffect(() => {
    instance.changeLanguage(locale).catch(() => {
    });
    try {
      localStorage.setItem("flowith-locale", locale);
    } catch (error) {
      console.warn("[LocaleSync] Failed to persist locale to localStorage:", error);
    }
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
export {
  I18nextProvider as I,
  LocaleSync as L,
  LOCALES as a,
  LOCALE_CONFIG as b,
  instance as i,
  useLocaleStore as u
};
