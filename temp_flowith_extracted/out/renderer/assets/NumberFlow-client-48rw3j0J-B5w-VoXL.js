import { r as reactExports } from "./client-DljuHW-m.js";
const u = (n, t, e) => {
  const i = document.createElement(n), [s, a] = Array.isArray(t) ? [void 0, t] : [t, e];
  return s && Object.assign(i, s), a == null || a.forEach((r) => i.appendChild(r)), i;
}, F = (n, t) => {
  var e;
  return t === "left" ? n.offsetLeft : (((e = n.offsetParent instanceof HTMLElement ? n.offsetParent : null) == null ? void 0 : e.offsetWidth) ?? 0) - n.offsetWidth - n.offsetLeft;
}, H = (n) => n.offsetWidth > 0 && n.offsetHeight > 0, st = (n, t) => {
  !customElements.get(n) && customElements.define(n, t);
};
function X(n, t, { reverse: e = false } = {}) {
  const i = n.length;
  for (let s = e ? i - 1 : 0; e ? s >= 0 : s < i; e ? s-- : s++)
    t(n[s], s);
}
function nt(n, t, e, i) {
  const s = t.formatToParts(n);
  e && s.unshift({ type: "prefix", value: e }), i && s.push({ type: "suffix", value: i });
  const a = [], r = [], o = [], c = [], d = {}, p = (h) => `${h}:${d[h] = (d[h] ?? -1) + 1}`;
  let x = "", g = false, y = false;
  for (const h of s) {
    x += h.value;
    const l = h.type === "minusSign" || h.type === "plusSign" ? "sign" : h.type;
    l === "integer" ? (g = true, r.push(...h.value.split("").map((C) => ({ type: l, value: parseInt(C) })))) : l === "group" ? r.push({ type: l, value: h.value }) : l === "decimal" ? (y = true, o.push({ type: l, value: h.value, key: p(l) })) : l === "fraction" ? o.push(...h.value.split("").map((C) => ({
      type: l,
      value: parseInt(C),
      key: p(l),
      pos: -1 - d[l]
    }))) : (g || y ? c : a).push({
      type: l,
      value: h.value,
      key: p(l)
    });
  }
  const T = [];
  for (let h = r.length - 1; h >= 0; h--) {
    const l = r[h];
    T.unshift(l.type === "integer" ? {
      ...l,
      key: p(l.type),
      pos: d[l.type]
    } : {
      ...l,
      key: p(l.type)
    });
  }
  return {
    pre: a,
    integer: T,
    fraction: o,
    post: c,
    valueAsString: x,
    value: typeof n == "string" ? parseFloat(n) : n
  };
}
const V = String.raw, O = (() => {
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
  } catch {
    return false;
  }
  return true;
})(), z = typeof CSS < "u" && CSS.supports && CSS.supports("line-height", "mod(1,1)"), A = typeof matchMedia < "u" ? matchMedia("(prefers-reduced-motion: reduce)") : null, $ = "--_number-flow-d-opacity", U = "--_number-flow-d-width", S = "--_number-flow-dx", j = "--_number-flow-d", Y = (() => {
  try {
    return CSS.registerProperty({
      name: $,
      syntax: "<number>",
      inherits: false,
      initialValue: "0"
    }), CSS.registerProperty({
      name: S,
      syntax: "<length>",
      inherits: true,
      initialValue: "0px"
    }), CSS.registerProperty({
      name: U,
      syntax: "<number>",
      inherits: false,
      initialValue: "0"
    }), CSS.registerProperty({
      name: j,
      syntax: "<number>",
      inherits: true,
      initialValue: "0"
    }), true;
  } catch {
    return false;
  }
})(), P = "var(--number-flow-char-height, 1em)", f = "var(--number-flow-mask-height, 0.25em)", k = `calc(${f} / 2)`, E = "var(--number-flow-mask-width, 0.5em)", m = `calc(${E} / var(--scale-x))`, w = "#000 0, transparent 71%", M = V`:host{display:inline-block;direction:ltr;white-space:nowrap;isolation:isolate;line-height:${P} !important}.number,.number__inner{display:inline-block;transform-origin:left top}:host([data-will-change]) :is(.number,.number__inner,.section,.digit,.digit__num,.symbol){will-change:transform}.number{--scale-x:calc(1 + var(${U}) / var(--width));transform:translateX(var(${S})) scaleX(var(--scale-x));margin:0 calc(-1 * ${E});position:relative;-webkit-mask-image:linear-gradient(to right,transparent 0,#000 ${m},#000 calc(100% - ${m}),transparent ),linear-gradient(to bottom,transparent 0,#000 ${f},#000 calc(100% - ${f}),transparent 100% ),radial-gradient(at bottom right,${w}),radial-gradient(at bottom left,${w}),radial-gradient(at top left,${w}),radial-gradient(at top right,${w});-webkit-mask-size:100% calc(100% - ${f} * 2),calc(100% - ${m} * 2) 100%,${m} ${f},${m} ${f},${m} ${f},${m} ${f};-webkit-mask-position:center,center,top left,top right,bottom right,bottom left;-webkit-mask-repeat:no-repeat}.number__inner{padding:${k} ${E};transform:scaleX(calc(1 / var(--scale-x))) translateX(calc(-1 * var(${S})))}:host > :not(.number){z-index:5}.section,.symbol{display:inline-block;position:relative;isolation:isolate}.section::after{content:'\200b';display:inline-block}.section--justify-left{transform-origin:center left}.section--justify-right{transform-origin:center right}.section > [inert],.symbol > [inert]{margin:0 !important;position:absolute !important;z-index:-1}.digit{display:inline-block;position:relative;--c:var(--current) + var(${j})}.digit__num,.number .section::after{padding:${k} 0}.digit__num{display:inline-block;--offset-raw:mod(var(--length) + var(--n) - mod(var(--c),var(--length)),var(--length));--offset:calc( var(--offset-raw) - var(--length) * round(down,var(--offset-raw) / (var(--length) / 2),1) );--y:clamp(-100%,var(--offset) * 100%,100%);transform:translateY(var(--y))}.digit__num[inert]{position:absolute;top:0;left:50%;transform:translateX(-50%) translateY(var(--y))}.digit:not(.is-spinning) .digit__num[inert]{display:none}.symbol__value{display:inline-block;mix-blend-mode:plus-lighter;white-space:pre}.section--justify-left .symbol > [inert]{left:0}.section--justify-right .symbol > [inert]{right:0}.animate-presence{opacity:calc(1 + var(${$}))}`, G = HTMLElement, q = z && O && Y;
let b;
class J extends G {
  constructor() {
    super(), this.created = false, this.batched = false;
    const { animated: t, ...e } = this.constructor.defaultProps;
    this._animated = this.computedAnimated = t, Object.assign(this, e);
  }
  get animated() {
    return this._animated;
  }
  set animated(t) {
    var e;
    this.animated !== t && (this._animated = t, (e = this.shadowRoot) == null || e.getAnimations().forEach((i) => i.finish()));
  }
  /**
   * @internal
   */
  set data(t) {
    var o;
    if (t == null)
      return;
    const { pre: e, integer: i, fraction: s, post: a, value: r } = t;
    if (this.created) {
      const c = this._data;
      this._data = t, this.computedTrend = typeof this.trend == "function" ? this.trend(c.value, r) : this.trend, this.computedAnimated = q && this._animated && (!this.respectMotionPreference || !(A != null && A.matches)) && // https://github.com/barvian/number-flow/issues/9
      H(this), (o = this.plugins) == null || o.forEach((d) => {
        var p;
        return (p = d.onUpdate) == null ? void 0 : p.call(d, t, c, this);
      }), this.batched || this.willUpdate(), this._pre.update(e), this._num.update({ integer: i, fraction: s }), this._post.update(a), this.batched || this.didUpdate();
    } else {
      this._data = t, this.attachShadow({ mode: "open" });
      try {
        this._internals ?? (this._internals = this.attachInternals()), this._internals.role = "img";
      } catch {
      }
      if (typeof CSSStyleSheet < "u" && this.shadowRoot.adoptedStyleSheets)
        b || (b = new CSSStyleSheet(), b.replaceSync(M)), this.shadowRoot.adoptedStyleSheets = [b];
      else {
        const c = document.createElement("style");
        c.textContent = M, this.shadowRoot.appendChild(c);
      }
      this._pre = new N(this, e, {
        justify: "right",
        part: "left"
      }), this.shadowRoot.appendChild(this._pre.el), this._num = new Q(this, i, s), this.shadowRoot.appendChild(this._num.el), this._post = new N(this, a, {
        justify: "left",
        part: "right"
      }), this.shadowRoot.appendChild(this._post.el), this.created = true;
    }
    try {
      this._internals.ariaLabel = t.valueAsString;
    } catch {
    }
  }
  /**
   * @internal
   */
  willUpdate() {
    this._pre.willUpdate(), this._num.willUpdate(), this._post.willUpdate();
  }
  /**
   * @internal
   */
  didUpdate() {
    if (!this.computedAnimated)
      return;
    this._abortAnimationsFinish ? this._abortAnimationsFinish.abort() : this.dispatchEvent(new Event("animationsstart")), this._pre.didUpdate(), this._num.didUpdate(), this._post.didUpdate();
    const t = new AbortController();
    Promise.all(this.shadowRoot.getAnimations().map((e) => e.finished)).then(() => {
      t.signal.aborted || (this.dispatchEvent(new Event("animationsfinish")), this._abortAnimationsFinish = void 0);
    }), this._abortAnimationsFinish = t;
  }
}
J.defaultProps = {
  transformTiming: {
    duration: 900,
    // Make sure to keep this minified:
    easing: "linear(0,.005,.019,.039,.066,.096,.129,.165,.202,.24,.278,.316,.354,.39,.426,.461,.494,.526,.557,.586,.614,.64,.665,.689,.711,.731,.751,.769,.786,.802,.817,.831,.844,.856,.867,.877,.887,.896,.904,.912,.919,.925,.931,.937,.942,.947,.951,.955,.959,.962,.965,.968,.971,.973,.976,.978,.98,.981,.983,.984,.986,.987,.988,.989,.99,.991,.992,.992,.993,.994,.994,.995,.995,.996,.996,.9963,.9967,.9969,.9972,.9975,.9977,.9979,.9981,.9982,.9984,.9985,.9987,.9988,.9989,1)"
  },
  spinTiming: void 0,
  opacityTiming: { duration: 450, easing: "ease-out" },
  animated: true,
  trend: (n, t) => Math.sign(t - n),
  respectMotionPreference: true,
  plugins: void 0,
  digits: void 0
};
class Q {
  constructor(t, e, i, { className: s, ...a } = {}) {
    this.flow = t, this._integer = new L(t, e, {
      justify: "right",
      part: "integer"
    }), this._fraction = new L(t, i, {
      justify: "left",
      part: "fraction"
    }), this._inner = u("span", {
      className: "number__inner"
    }, [this._integer.el, this._fraction.el]), this.el = u("span", {
      ...a,
      part: "number",
      className: `number ${s ?? ""}`
    }, [this._inner]);
  }
  willUpdate() {
    this._prevWidth = this.el.offsetWidth, this._prevLeft = this.el.getBoundingClientRect().left, this._integer.willUpdate(), this._fraction.willUpdate();
  }
  update({ integer: t, fraction: e }) {
    this._integer.update(t), this._fraction.update(e);
  }
  didUpdate() {
    const t = this.el.getBoundingClientRect();
    this._integer.didUpdate(), this._fraction.didUpdate();
    const e = this._prevLeft - t.left, i = this.el.offsetWidth, s = this._prevWidth - i;
    this.el.style.setProperty("--width", String(i)), this.el.animate({
      [S]: [`${e}px`, "0px"],
      [U]: [s, 0]
    }, {
      ...this.flow.transformTiming,
      composite: "accumulate"
    });
  }
}
class W {
  constructor(t, e, { justify: i, className: s, ...a }, r) {
    this.flow = t, this.children = /* @__PURE__ */ new Map(), this.onCharRemove = (c) => () => {
      this.children.delete(c);
    }, this.justify = i;
    const o = e.map((c) => this.addChar(c).el);
    this.el = u("span", {
      ...a,
      className: `section section--justify-${i} ${s ?? ""}`
    }, r ? r(o) : o);
  }
  addChar(t, { startDigitsAtZero: e = false, ...i } = {}) {
    const s = t.type === "integer" || t.type === "fraction" ? new D(this, t.type, e ? 0 : t.value, t.pos, {
      ...i,
      onRemove: this.onCharRemove(t.key)
    }) : new tt(this, t.type, t.value, {
      ...i,
      onRemove: this.onCharRemove(t.key)
    });
    return this.children.set(t.key, s), s;
  }
  unpop(t) {
    t.el.removeAttribute("inert"), t.el.style.top = "", t.el.style[this.justify] = "";
  }
  pop(t) {
    t.forEach((e) => {
      e.el.style.top = `${e.el.offsetTop}px`, e.el.style[this.justify] = `${F(e.el, this.justify)}px`;
    }), t.forEach((e) => {
      e.el.setAttribute("inert", ""), e.present = false;
    });
  }
  addNewAndUpdateExisting(t) {
    const e = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), s = this.justify === "left", a = s ? "prepend" : "append";
    if (X(t, (r) => {
      let o;
      this.children.has(r.key) ? (o = this.children.get(r.key), i.set(r, o), this.unpop(o), o.present = true) : (o = this.addChar(r, { startDigitsAtZero: true, animateIn: true }), e.set(r, o)), this.el[a](o.el);
    }, { reverse: s }), this.flow.computedAnimated) {
      const r = this.el.getBoundingClientRect();
      e.forEach((o) => {
        o.willUpdate(r);
      });
    }
    e.forEach((r, o) => {
      r.update(o.value);
    }), i.forEach((r, o) => {
      r.update(o.value);
    });
  }
  willUpdate() {
    const t = this.el.getBoundingClientRect();
    this._prevOffset = t[this.justify], this.children.forEach((e) => e.willUpdate(t));
  }
  didUpdate() {
    const t = this.el.getBoundingClientRect();
    this.children.forEach((s) => s.didUpdate(t));
    const e = t[this.justify], i = this._prevOffset - e;
    i && this.children.size && this.el.animate({
      transform: [`translateX(${i}px)`, "none"]
    }, {
      ...this.flow.transformTiming,
      composite: "accumulate"
    });
  }
}
class L extends W {
  update(t) {
    const e = /* @__PURE__ */ new Map();
    this.children.forEach((i, s) => {
      t.find((a) => a.key === s) || e.set(s, i), this.unpop(i);
    }), this.addNewAndUpdateExisting(t), e.forEach((i) => {
      i instanceof D && i.update(0);
    }), this.pop(e);
  }
}
class N extends W {
  update(t) {
    const e = /* @__PURE__ */ new Map();
    this.children.forEach((i, s) => {
      t.find((a) => a.key === s) || e.set(s, i);
    }), this.pop(e), this.addNewAndUpdateExisting(t);
  }
}
class R {
  constructor(t, e, { onRemove: i, animateIn: s = false } = {}) {
    this.flow = t, this.el = e, this._present = true, this._remove = () => {
      var a;
      this.el.remove(), (a = this._onRemove) == null || a.call(this);
    }, this.el.classList.add("animate-presence"), this.flow.computedAnimated && s && this.el.animate({
      [$]: [-0.9999, 0]
    }, {
      ...this.flow.opacityTiming,
      composite: "accumulate"
    }), this._onRemove = i;
  }
  get present() {
    return this._present;
  }
  set present(t) {
    if (this._present !== t) {
      if (this._present = t, t ? this.el.removeAttribute("inert") : this.el.setAttribute("inert", ""), !this.flow.computedAnimated) {
        t || this._remove();
        return;
      }
      this.el.style.setProperty("--_number-flow-d-opacity", t ? "0" : "-.999"), this.el.animate({
        [$]: t ? [-0.9999, 0] : [0.999, 0]
      }, {
        ...this.flow.opacityTiming,
        composite: "accumulate"
      }), t ? this.flow.removeEventListener("animationsfinish", this._remove) : this.flow.addEventListener("animationsfinish", this._remove, {
        once: true
      });
    }
  }
}
class B extends R {
  constructor(t, e, i, s) {
    super(t.flow, i, s), this.section = t, this.value = e, this.el = i;
  }
}
class D extends B {
  constructor(t, e, i, s, a) {
    var d, p;
    const r = (((p = (d = t.flow.digits) == null ? void 0 : d[s]) == null ? void 0 : p.max) ?? 9) + 1, o = Array.from({ length: r }).map((x, g) => {
      const y = u("span", { className: "digit__num" }, [
        document.createTextNode(String(g))
      ]);
      return g !== i && y.setAttribute("inert", ""), y.style.setProperty("--n", String(g)), y;
    }), c = u("span", {
      part: `digit ${e}-digit`,
      className: "digit"
    }, o);
    c.style.setProperty("--current", String(i)), c.style.setProperty("--length", String(r)), super(t, i, c, a), this.pos = s, this._onAnimationsFinish = () => {
      this.el.classList.remove("is-spinning");
    }, this._numbers = o, this.length = r;
  }
  willUpdate(t) {
    const e = this.el.getBoundingClientRect();
    this._prevValue = this.value;
    const i = e[this.section.justify] - t[this.section.justify], s = e.width / 2;
    this._prevCenter = this.section.justify === "left" ? i + s : i - s;
  }
  update(t) {
    this.el.style.setProperty("--current", String(t)), this._numbers.forEach((e, i) => i === t ? e.removeAttribute("inert") : e.setAttribute("inert", "")), this.value = t;
  }
  didUpdate(t) {
    const e = this.el.getBoundingClientRect(), i = e[this.section.justify] - t[this.section.justify], s = e.width / 2, a = this.section.justify === "left" ? i + s : i - s, r = this._prevCenter - a;
    r && this.el.animate({
      transform: [`translateX(${r}px)`, "none"]
    }, {
      ...this.flow.transformTiming,
      composite: "accumulate"
    });
    const o = this.getDelta();
    o && (this.el.classList.add("is-spinning"), this.el.animate({
      [j]: [-o, 0]
    }, {
      ...this.flow.spinTiming ?? this.flow.transformTiming,
      composite: "accumulate"
    }), this.flow.addEventListener("animationsfinish", this._onAnimationsFinish, { once: true }));
  }
  getDelta() {
    var i;
    if (this.flow.plugins)
      for (const s of this.flow.plugins) {
        const a = (i = s.getDelta) == null ? void 0 : i.call(s, this.value, this._prevValue, this);
        if (a != null)
          return a;
      }
    const t = this.value - this._prevValue, e = this.flow.computedTrend || Math.sign(t);
    return e < 0 && this.value > this._prevValue ? this.value - this.length - this._prevValue : e > 0 && this.value < this._prevValue ? this.length - this._prevValue + this.value : t;
  }
}
class tt extends B {
  constructor(t, e, i, s) {
    const a = u("span", {
      className: "symbol__value",
      textContent: i
    });
    super(t, i, u("span", {
      part: `symbol ${e}`,
      className: "symbol"
    }, [a]), s), this.type = e, this._children = /* @__PURE__ */ new Map(), this._onChildRemove = (r) => () => {
      this._children.delete(r);
    }, this._children.set(i, new R(this.flow, a, {
      onRemove: this._onChildRemove(i)
    }));
  }
  willUpdate(t) {
    if (this.type === "decimal")
      return;
    const e = this.el.getBoundingClientRect();
    this._prevOffset = e[this.section.justify] - t[this.section.justify];
  }
  update(t) {
    if (this.value !== t) {
      const e = this._children.get(this.value);
      e && (e.present = false);
      const i = this._children.get(t);
      if (i)
        i.present = true;
      else {
        const s = u("span", {
          className: "symbol__value",
          textContent: t
        });
        this.el.appendChild(s), this._children.set(t, new R(this.flow, s, {
          animateIn: true,
          onRemove: this._onChildRemove(t)
        }));
      }
    }
    this.value = t;
  }
  didUpdate(t) {
    if (this.type === "decimal")
      return;
    const i = this.el.getBoundingClientRect()[this.section.justify] - t[this.section.justify], s = this._prevOffset - i;
    s && this.el.animate({
      transform: [`translateX(${s}px)`, "none"]
    }, { ...this.flow.transformTiming, composite: "accumulate" });
  }
}
const REACT_MAJOR = parseInt(reactExports.version.match(/^(\d+)\./)?.[1]);
const isReact19 = REACT_MAJOR >= 19;
const OBSERVED_ATTRIBUTES = [
  "data",
  "digits"
];
class NumberFlowElement extends J {
  attributeChangedCallback(attr, _oldValue, newValue) {
    this[attr] = JSON.parse(newValue);
  }
}
NumberFlowElement.observedAttributes = isReact19 ? [] : OBSERVED_ATTRIBUTES;
st("number-flow-react", NumberFlowElement);
const formatters = {};
const serialize = isReact19 ? (p) => p : JSON.stringify;
function splitProps(props) {
  const { transformTiming, spinTiming, opacityTiming, animated, respectMotionPreference, trend, plugins, ...rest } = props;
  return [
    {
      transformTiming,
      spinTiming,
      opacityTiming,
      animated,
      respectMotionPreference,
      trend,
      plugins
    },
    rest
  ];
}
class NumberFlowImpl extends reactExports.Component {
  // Update the non-`data` props to avoid JSON serialization
  // Data needs to be set in render still:
  updateProperties(prevProps) {
    if (!this.el) return;
    this.el.batched = !this.props.isolate;
    const [nonData] = splitProps(this.props);
    Object.entries(nonData).forEach(([k2, v]) => {
      this.el[k2] = v ?? NumberFlowElement.defaultProps[k2];
    });
    if (prevProps?.onAnimationsStart) this.el.removeEventListener("animationsstart", prevProps.onAnimationsStart);
    if (this.props.onAnimationsStart) this.el.addEventListener("animationsstart", this.props.onAnimationsStart);
    if (prevProps?.onAnimationsFinish) this.el.removeEventListener("animationsfinish", prevProps.onAnimationsFinish);
    if (this.props.onAnimationsFinish) this.el.addEventListener("animationsfinish", this.props.onAnimationsFinish);
  }
  componentDidMount() {
    this.updateProperties();
    if (isReact19 && this.el) {
      this.el.digits = this.props.digits;
      this.el.data = this.props.data;
    }
  }
  getSnapshotBeforeUpdate(prevProps) {
    this.updateProperties(prevProps);
    if (prevProps.data !== this.props.data) {
      if (this.props.group) {
        this.props.group.willUpdate();
        return () => this.props.group?.didUpdate();
      }
      if (!this.props.isolate) {
        this.el?.willUpdate();
        return () => this.el?.didUpdate();
      }
    }
    return null;
  }
  componentDidUpdate(_, __, didUpdate) {
    didUpdate?.();
  }
  handleRef(el) {
    if (this.props.innerRef) this.props.innerRef.current = el;
    this.el = el;
  }
  render() {
    const [_, { innerRef, className, data, willChange, isolate, group, digits, onAnimationsStart, onAnimationsFinish, ...rest }] = splitProps(this.props);
    return (
      // @ts-expect-error missing types
      /* @__PURE__ */ reactExports.createElement("number-flow-react", {
        ref: this.handleRef,
        "data-will-change": willChange ? "" : void 0,
        // Have to rename this:
        class: className,
        ...rest,
        dangerouslySetInnerHTML: {
          __html: ""
        },
        suppressHydrationWarning: true,
        digits: serialize(digits),
        // Make sure data is set last, everything else is updated:
        data: serialize(data)
      })
    );
  }
  constructor(props) {
    super(props);
    this.handleRef = this.handleRef.bind(this);
  }
}
const NumberFlow = /* @__PURE__ */ reactExports.forwardRef(function NumberFlow2({ value, locales, format, prefix, suffix, ...props }, _ref) {
  reactExports.useImperativeHandle(_ref, () => ref.current, []);
  const ref = reactExports.useRef();
  const group = reactExports.useContext(NumberFlowGroupContext);
  group?.useRegister(ref);
  const localesString = reactExports.useMemo(() => locales ? JSON.stringify(locales) : "", [
    locales
  ]);
  const formatString = reactExports.useMemo(() => format ? JSON.stringify(format) : "", [
    format
  ]);
  const data = reactExports.useMemo(() => {
    const formatter = formatters[`${localesString}:${formatString}`] ??= new Intl.NumberFormat(locales, format);
    return nt(value, formatter, prefix, suffix);
  }, [
    value,
    localesString,
    formatString,
    prefix,
    suffix
  ]);
  return /* @__PURE__ */ reactExports.createElement(NumberFlowImpl, {
    ...props,
    group,
    data,
    innerRef: ref
  });
});
const NumberFlowGroupContext = /* @__PURE__ */ reactExports.createContext(void 0);
export {
  NumberFlow as N
};
