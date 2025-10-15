var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
import require$$0 from "util";
import axios from "axios";
import { createServer } from "http";
import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import * as process from "process";
var require_ssr = __commonJS({
  "ssr.js"(exports, module) {
    const HYDRATION_START = "[";
    const HYDRATION_END = "]";
    function fallback(value, fallback2, lazy = false) {
      return value === void 0 ? lazy ? (
        /** @type {() => V} */
        fallback2()
      ) : (
        /** @type {V} */
        fallback2
      ) : value;
    }
    const CONTENT_REGEX = /[&<]/g;
    function escape_html(value, is_attr) {
      const str = String(value ?? "");
      const pattern = CONTENT_REGEX;
      pattern.lastIndex = 0;
      let escaped = "";
      let last = 0;
      while (pattern.test(str)) {
        const i = pattern.lastIndex - 1;
        const ch = str[i];
        escaped += str.substring(last, i) + (ch === "&" ? "&amp;" : ch === '"' ? "&quot;" : "&lt;");
        last = i + 1;
      }
      return escaped + str.substring(last);
    }
    var current_component = null;
    function push(fn) {
      current_component = { p: current_component, c: null, d: null };
    }
    function pop() {
      var component = (
        /** @type {Component} */
        current_component
      );
      var ondestroy = component.d;
      if (ondestroy) {
        on_destroy.push(...ondestroy);
      }
      current_component = component.p;
    }
    const BLOCK_OPEN = `<!--${HYDRATION_START}-->`;
    const BLOCK_CLOSE = `<!--${HYDRATION_END}-->`;
    let on_destroy = [];
    function render$1(component, options = {}) {
      const payload = { out: "", css: /* @__PURE__ */ new Set(), head: { title: "", out: "" } };
      const prev_on_destroy = on_destroy;
      on_destroy = [];
      payload.out += BLOCK_OPEN;
      if (options.context) {
        push();
        current_component.c = options.context;
      }
      component(payload, options.props ?? {}, {}, {});
      if (options.context) {
        pop();
      }
      payload.out += BLOCK_CLOSE;
      for (const cleanup of on_destroy) cleanup();
      on_destroy = prev_on_destroy;
      let head2 = payload.head.out + payload.head.title;
      for (const { hash, code } of payload.css) {
        head2 += `<style id="${hash}">${code}</style>`;
      }
      return {
        head: head2,
        html: payload.out,
        body: payload.out
      };
    }
    function head(payload, fn) {
      const head_payload = payload.head;
      head_payload.out += BLOCK_OPEN;
      fn(head_payload);
      head_payload.out += BLOCK_CLOSE;
    }
    function spread_props(props) {
      const merged_props = {};
      let key;
      for (let i = 0; i < props.length; i++) {
        const obj = props[i];
        for (key in obj) {
          merged_props[key] = obj[key];
        }
      }
      return merged_props;
    }
    function bind_props(props_parent, props_now) {
      for (const key in props_now) {
        const initial_value = props_parent[key];
        const value = props_now[key];
        if (initial_value === void 0 && value !== void 0 && Object.getOwnPropertyDescriptor(props_parent, key)?.set) {
          props_parent[key] = value;
        }
      }
    }
    function ensure_array_like(array_like_or_iterator) {
      if (array_like_or_iterator) {
        return array_like_or_iterator.length !== void 0 ? array_like_or_iterator : Array.from(array_like_or_iterator);
      }
      return [];
    }
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var Symbol$1 = root.Symbol;
    var objectProto$d = Object.prototype;
    var hasOwnProperty$a = objectProto$d.hasOwnProperty;
    var nativeObjectToString$1 = objectProto$d.toString;
    var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : void 0;
    function getRawTag(value) {
      var isOwn = hasOwnProperty$a.call(value, symToStringTag$1), tag = value[symToStringTag$1];
      try {
        value[symToStringTag$1] = void 0;
        var unmasked = true;
      } catch (e) {
      }
      var result = nativeObjectToString$1.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag$1] = tag;
        } else {
          delete value[symToStringTag$1];
        }
      }
      return result;
    }
    var objectProto$c = Object.prototype;
    var nativeObjectToString = objectProto$c.toString;
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }
    var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
    var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : void 0;
    function baseGetTag(value) {
      if (value == null) {
        return value === void 0 ? undefinedTag : nullTag;
      }
      return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
    }
    function isObjectLike(value) {
      return value != null && typeof value == "object";
    }
    var symbolTag$3 = "[object Symbol]";
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag$3;
    }
    function arrayMap(array, iteratee) {
      var index = -1, length = array == null ? 0 : array.length, result = Array(length);
      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }
    var isArray = Array.isArray;
    var symbolProto$2 = Symbol$1 ? Symbol$1.prototype : void 0, symbolToString = symbolProto$2 ? symbolProto$2.toString : void 0;
    function baseToString(value) {
      if (typeof value == "string") {
        return value;
      }
      if (isArray(value)) {
        return arrayMap(value, baseToString) + "";
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : "";
      }
      var result = value + "";
      return result == "0" && 1 / value == -Infinity ? "-0" : result;
    }
    function isObject(value) {
      var type2 = typeof value;
      return value != null && (type2 == "object" || type2 == "function");
    }
    var asyncTag = "[object AsyncFunction]", funcTag$2 = "[object Function]", genTag$1 = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      }
      var tag = baseGetTag(value);
      return tag == funcTag$2 || tag == genTag$1 || tag == asyncTag || tag == proxyTag;
    }
    var coreJsData = root["__core-js_shared__"];
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    })();
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    var funcProto$1 = Function.prototype;
    var funcToString$1 = funcProto$1.toString;
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString$1.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var funcProto = Function.prototype, objectProto$b = Object.prototype;
    var funcToString = funcProto.toString;
    var hasOwnProperty$9 = objectProto$b.hasOwnProperty;
    var reIsNative = RegExp(
      "^" + funcToString.call(hasOwnProperty$9).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    );
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    var WeakMap$1 = getNative(root, "WeakMap");
    var objectCreate = Object.create;
    var baseCreate = /* @__PURE__ */ (function() {
      function object() {
      }
      return function(proto) {
        if (!isObject(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object();
        object.prototype = void 0;
        return result;
      };
    })();
    var defineProperty = (function() {
      try {
        var func = getNative(Object, "defineProperty");
        func({}, "", {});
        return func;
      } catch (e) {
      }
    })();
    function arrayEach(array, iteratee) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }
    var MAX_SAFE_INTEGER$1 = 9007199254740991;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    function isIndex(value, length) {
      var type2 = typeof value;
      length = length == null ? MAX_SAFE_INTEGER$1 : length;
      return !!length && (type2 == "number" || type2 != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    function baseAssignValue(object, key, value) {
      if (key == "__proto__" && defineProperty) {
        defineProperty(object, key, {
          "configurable": true,
          "enumerable": true,
          "value": value,
          "writable": true
        });
      } else {
        object[key] = value;
      }
    }
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    var objectProto$a = Object.prototype;
    var hasOwnProperty$8 = objectProto$a.hasOwnProperty;
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty$8.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
        baseAssignValue(object, key, value);
      }
    }
    var MAX_SAFE_INTEGER = 9007199254740991;
    function isLength(value) {
      return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    var objectProto$9 = Object.prototype;
    function isPrototype(value) {
      var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto$9;
      return value === proto;
    }
    function baseTimes(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    var argsTag$3 = "[object Arguments]";
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag$3;
    }
    var objectProto$8 = Object.prototype;
    var hasOwnProperty$7 = objectProto$8.hasOwnProperty;
    var propertyIsEnumerable$1 = objectProto$8.propertyIsEnumerable;
    var isArguments = baseIsArguments(/* @__PURE__ */ (function() {
      return arguments;
    })()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty$7.call(value, "callee") && !propertyIsEnumerable$1.call(value, "callee");
    };
    function stubFalse() {
      return false;
    }
    var freeExports$2 = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule$2 = freeExports$2 && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports$2 = freeModule$2 && freeModule$2.exports === freeExports$2;
    var Buffer$1 = moduleExports$2 ? root.Buffer : void 0;
    var nativeIsBuffer = Buffer$1 ? Buffer$1.isBuffer : void 0;
    var isBuffer = nativeIsBuffer || stubFalse;
    var argsTag$2 = "[object Arguments]", arrayTag$2 = "[object Array]", boolTag$3 = "[object Boolean]", dateTag$3 = "[object Date]", errorTag$2 = "[object Error]", funcTag$1 = "[object Function]", mapTag$5 = "[object Map]", numberTag$3 = "[object Number]", objectTag$3 = "[object Object]", regexpTag$3 = "[object RegExp]", setTag$5 = "[object Set]", stringTag$3 = "[object String]", weakMapTag$2 = "[object WeakMap]";
    var arrayBufferTag$3 = "[object ArrayBuffer]", dataViewTag$4 = "[object DataView]", float32Tag$2 = "[object Float32Array]", float64Tag$2 = "[object Float64Array]", int8Tag$2 = "[object Int8Array]", int16Tag$2 = "[object Int16Array]", int32Tag$2 = "[object Int32Array]", uint8Tag$2 = "[object Uint8Array]", uint8ClampedTag$2 = "[object Uint8ClampedArray]", uint16Tag$2 = "[object Uint16Array]", uint32Tag$2 = "[object Uint32Array]";
    var typedArrayTags = {};
    typedArrayTags[float32Tag$2] = typedArrayTags[float64Tag$2] = typedArrayTags[int8Tag$2] = typedArrayTags[int16Tag$2] = typedArrayTags[int32Tag$2] = typedArrayTags[uint8Tag$2] = typedArrayTags[uint8ClampedTag$2] = typedArrayTags[uint16Tag$2] = typedArrayTags[uint32Tag$2] = true;
    typedArrayTags[argsTag$2] = typedArrayTags[arrayTag$2] = typedArrayTags[arrayBufferTag$3] = typedArrayTags[boolTag$3] = typedArrayTags[dataViewTag$4] = typedArrayTags[dateTag$3] = typedArrayTags[errorTag$2] = typedArrayTags[funcTag$1] = typedArrayTags[mapTag$5] = typedArrayTags[numberTag$3] = typedArrayTags[objectTag$3] = typedArrayTags[regexpTag$3] = typedArrayTags[setTag$5] = typedArrayTags[stringTag$3] = typedArrayTags[weakMapTag$2] = false;
    function baseIsTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    var freeExports$1 = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule$1 = freeExports$1 && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;
    var freeProcess = moduleExports$1 && freeGlobal.process;
    var nodeUtil = (function() {
      try {
        var types = freeModule$1 && freeModule$1.require && freeModule$1.require("util").types;
        if (types) {
          return types;
        }
        return freeProcess && freeProcess.binding && freeProcess.binding("util");
      } catch (e) {
      }
    })();
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
    var objectProto$7 = Object.prototype;
    var hasOwnProperty$6 = objectProto$7.hasOwnProperty;
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
      for (var key in value) {
        if (hasOwnProperty$6.call(value, key) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
        (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
        isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    var nativeKeys = overArg(Object.keys, Object);
    var objectProto$6 = Object.prototype;
    var hasOwnProperty$5 = objectProto$6.hasOwnProperty;
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty$5.call(object, key) && key != "constructor") {
          result.push(key);
        }
      }
      return result;
    }
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/;
    function isKey(value, object) {
      if (isArray(value)) {
        return false;
      }
      var type2 = typeof value;
      if (type2 == "number" || type2 == "symbol" || type2 == "boolean" || value == null || isSymbol(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
    }
    var nativeCreate = getNative(Object, "create");
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }
    var HASH_UNDEFINED$2 = "__lodash_hash_undefined__";
    var objectProto$5 = Object.prototype;
    var hasOwnProperty$4 = objectProto$5.hasOwnProperty;
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED$2 ? void 0 : result;
      }
      return hasOwnProperty$4.call(data, key) ? data[key] : void 0;
    }
    var objectProto$4 = Object.prototype;
    var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty$3.call(data, key);
    }
    var HASH_UNDEFINED$1 = "__lodash_hash_undefined__";
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED$1 : value;
      return this;
    }
    function Hash(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    var arrayProto = Array.prototype;
    var splice = arrayProto.splice;
    function listCacheDelete(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }
    function listCacheGet(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    function listCacheSet(key, value) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    function ListCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    var Map$1 = getNative(root, "Map");
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        "hash": new Hash(),
        "map": new (Map$1 || ListCache)(),
        "string": new Hash()
      };
    }
    function isKeyable(value) {
      var type2 = typeof value;
      return type2 == "string" || type2 == "number" || type2 == "symbol" || type2 == "boolean" ? value !== "__proto__" : value === null;
    }
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    function mapCacheDelete(key) {
      var result = getMapData(this, key)["delete"](key);
      this.size -= result ? 1 : 0;
      return result;
    }
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    function mapCacheSet(key, value) {
      var data = getMapData(this, key), size = data.size;
      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }
    function MapCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    var FUNC_ERROR_TEXT = "Expected a function";
    function memoize(func, resolver) {
      if (typeof func != "function" || resolver != null && typeof resolver != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result) || cache;
        return result;
      };
      memoized.cache = new (memoize.Cache || MapCache)();
      return memoized;
    }
    memoize.Cache = MapCache;
    var MAX_MEMOIZE_SIZE = 500;
    function memoizeCapped(func) {
      var result = memoize(func, function(key) {
        if (cache.size === MAX_MEMOIZE_SIZE) {
          cache.clear();
        }
        return key;
      });
      var cache = result.cache;
      return result;
    }
    var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    var reEscapeChar = /\\(\\)?/g;
    var stringToPath = memoizeCapped(function(string) {
      var result = [];
      if (string.charCodeAt(0) === 46) {
        result.push("");
      }
      string.replace(rePropName, function(match, number, quote, subString) {
        result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
      });
      return result;
    });
    function toString(value) {
      return value == null ? "" : baseToString(value);
    }
    function castPath(value, object) {
      if (isArray(value)) {
        return value;
      }
      return isKey(value, object) ? [value] : stringToPath(toString(value));
    }
    function toKey(value) {
      if (typeof value == "string" || isSymbol(value)) {
        return value;
      }
      var result = value + "";
      return result == "0" && 1 / value == -Infinity ? "-0" : result;
    }
    function baseGet(object, path) {
      path = castPath(path, object);
      var index = 0, length = path.length;
      while (object != null && index < length) {
        object = object[toKey(path[index++])];
      }
      return index && index == length ? object : void 0;
    }
    function get$1(object, path, defaultValue) {
      var result = object == null ? void 0 : baseGet(object, path);
      return result === void 0 ? defaultValue : result;
    }
    function arrayPush(array, values) {
      var index = -1, length = values.length, offset = array.length;
      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }
    var getPrototype = overArg(Object.getPrototypeOf, Object);
    function basePropertyOf(object) {
      return function(key) {
        return object == null ? void 0 : object[key];
      };
    }
    function stackClear() {
      this.__data__ = new ListCache();
      this.size = 0;
    }
    function stackDelete(key) {
      var data = this.__data__, result = data["delete"](key);
      this.size = data.size;
      return result;
    }
    function stackGet(key) {
      return this.__data__.get(key);
    }
    function stackHas(key) {
      return this.__data__.has(key);
    }
    var LARGE_ARRAY_SIZE = 200;
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map$1 || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }
    Stack.prototype.clear = stackClear;
    Stack.prototype["delete"] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var Buffer2 = moduleExports ? root.Buffer : void 0;
    Buffer2 ? Buffer2.allocUnsafe : void 0;
    function cloneBuffer(buffer, isDeep) {
      {
        return buffer.slice();
      }
    }
    function arrayFilter(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }
    function stubArray() {
      return [];
    }
    var objectProto$3 = Object.prototype;
    var propertyIsEnumerable = objectProto$3.propertyIsEnumerable;
    var nativeGetSymbols = Object.getOwnPropertySymbols;
    var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return arrayFilter(nativeGetSymbols(object), function(symbol) {
        return propertyIsEnumerable.call(object, symbol);
      });
    };
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }
    var DataView$1 = getNative(root, "DataView");
    var Promise$1 = getNative(root, "Promise");
    var Set$1 = getNative(root, "Set");
    var mapTag$4 = "[object Map]", objectTag$2 = "[object Object]", promiseTag = "[object Promise]", setTag$4 = "[object Set]", weakMapTag$1 = "[object WeakMap]";
    var dataViewTag$3 = "[object DataView]";
    var dataViewCtorString = toSource(DataView$1), mapCtorString = toSource(Map$1), promiseCtorString = toSource(Promise$1), setCtorString = toSource(Set$1), weakMapCtorString = toSource(WeakMap$1);
    var getTag = baseGetTag;
    if (DataView$1 && getTag(new DataView$1(new ArrayBuffer(1))) != dataViewTag$3 || Map$1 && getTag(new Map$1()) != mapTag$4 || Promise$1 && getTag(Promise$1.resolve()) != promiseTag || Set$1 && getTag(new Set$1()) != setTag$4 || WeakMap$1 && getTag(new WeakMap$1()) != weakMapTag$1) {
      getTag = function(value) {
        var result = baseGetTag(value), Ctor = result == objectTag$2 ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString:
              return dataViewTag$3;
            case mapCtorString:
              return mapTag$4;
            case promiseCtorString:
              return promiseTag;
            case setCtorString:
              return setTag$4;
            case weakMapCtorString:
              return weakMapTag$1;
          }
        }
        return result;
      };
    }
    var objectProto$2 = Object.prototype;
    var hasOwnProperty$2 = objectProto$2.hasOwnProperty;
    function initCloneArray(array) {
      var length = array.length, result = new array.constructor(length);
      if (length && typeof array[0] == "string" && hasOwnProperty$2.call(array, "index")) {
        result.index = array.index;
        result.input = array.input;
      }
      return result;
    }
    var Uint8Array$1 = root.Uint8Array;
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array$1(result).set(new Uint8Array$1(arrayBuffer));
      return result;
    }
    function cloneDataView(dataView, isDeep) {
      var buffer = cloneArrayBuffer(dataView.buffer);
      return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
    }
    var reFlags = /\w*$/;
    function cloneRegExp(regexp) {
      var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
      result.lastIndex = regexp.lastIndex;
      return result;
    }
    var symbolProto$1 = Symbol$1 ? Symbol$1.prototype : void 0, symbolValueOf$1 = symbolProto$1 ? symbolProto$1.valueOf : void 0;
    function cloneSymbol(symbol) {
      return symbolValueOf$1 ? Object(symbolValueOf$1.call(symbol)) : {};
    }
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = cloneArrayBuffer(typedArray.buffer);
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }
    var boolTag$2 = "[object Boolean]", dateTag$2 = "[object Date]", mapTag$3 = "[object Map]", numberTag$2 = "[object Number]", regexpTag$2 = "[object RegExp]", setTag$3 = "[object Set]", stringTag$2 = "[object String]", symbolTag$2 = "[object Symbol]";
    var arrayBufferTag$2 = "[object ArrayBuffer]", dataViewTag$2 = "[object DataView]", float32Tag$1 = "[object Float32Array]", float64Tag$1 = "[object Float64Array]", int8Tag$1 = "[object Int8Array]", int16Tag$1 = "[object Int16Array]", int32Tag$1 = "[object Int32Array]", uint8Tag$1 = "[object Uint8Array]", uint8ClampedTag$1 = "[object Uint8ClampedArray]", uint16Tag$1 = "[object Uint16Array]", uint32Tag$1 = "[object Uint32Array]";
    function initCloneByTag(object, tag, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag$2:
          return cloneArrayBuffer(object);
        case boolTag$2:
        case dateTag$2:
          return new Ctor(+object);
        case dataViewTag$2:
          return cloneDataView(object);
        case float32Tag$1:
        case float64Tag$1:
        case int8Tag$1:
        case int16Tag$1:
        case int32Tag$1:
        case uint8Tag$1:
        case uint8ClampedTag$1:
        case uint16Tag$1:
        case uint32Tag$1:
          return cloneTypedArray(object);
        case mapTag$3:
          return new Ctor();
        case numberTag$2:
        case stringTag$2:
          return new Ctor(object);
        case regexpTag$2:
          return cloneRegExp(object);
        case setTag$3:
          return new Ctor();
        case symbolTag$2:
          return cloneSymbol(object);
      }
    }
    function initCloneObject(object) {
      return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
    }
    var mapTag$2 = "[object Map]";
    function baseIsMap(value) {
      return isObjectLike(value) && getTag(value) == mapTag$2;
    }
    var nodeIsMap = nodeUtil && nodeUtil.isMap;
    var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
    var setTag$2 = "[object Set]";
    function baseIsSet(value) {
      return isObjectLike(value) && getTag(value) == setTag$2;
    }
    var nodeIsSet = nodeUtil && nodeUtil.isSet;
    var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
    var argsTag$1 = "[object Arguments]", arrayTag$1 = "[object Array]", boolTag$1 = "[object Boolean]", dateTag$1 = "[object Date]", errorTag$1 = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag$1 = "[object Map]", numberTag$1 = "[object Number]", objectTag$1 = "[object Object]", regexpTag$1 = "[object RegExp]", setTag$1 = "[object Set]", stringTag$1 = "[object String]", symbolTag$1 = "[object Symbol]", weakMapTag = "[object WeakMap]";
    var arrayBufferTag$1 = "[object ArrayBuffer]", dataViewTag$1 = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
    var cloneableTags = {};
    cloneableTags[argsTag$1] = cloneableTags[arrayTag$1] = cloneableTags[arrayBufferTag$1] = cloneableTags[dataViewTag$1] = cloneableTags[boolTag$1] = cloneableTags[dateTag$1] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag$1] = cloneableTags[numberTag$1] = cloneableTags[objectTag$1] = cloneableTags[regexpTag$1] = cloneableTags[setTag$1] = cloneableTags[stringTag$1] = cloneableTags[symbolTag$1] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    cloneableTags[errorTag$1] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
    function baseClone(value, bitmask, customizer, key, object, stack) {
      var result;
      if (result !== void 0) {
        return result;
      }
      if (!isObject(value)) {
        return value;
      }
      var isArr = isArray(value);
      if (isArr) {
        result = initCloneArray(value);
      } else {
        var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
        if (isBuffer(value)) {
          return cloneBuffer(value);
        }
        if (tag == objectTag$1 || tag == argsTag$1 || isFunc && !object) {
          result = isFunc ? {} : initCloneObject(value);
        } else {
          if (!cloneableTags[tag]) {
            return object ? value : {};
          }
          result = initCloneByTag(value, tag);
        }
      }
      stack || (stack = new Stack());
      var stacked = stack.get(value);
      if (stacked) {
        return stacked;
      }
      stack.set(value, result);
      if (isSet(value)) {
        value.forEach(function(subValue) {
          result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
        });
      } else if (isMap(value)) {
        value.forEach(function(subValue, key2) {
          result.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
        });
      }
      var keysFunc = getAllKeys;
      var props = isArr ? void 0 : keysFunc(value);
      arrayEach(props || value, function(subValue, key2) {
        if (props) {
          key2 = subValue;
          subValue = value[key2];
        }
        assignValue(result, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
      });
      return result;
    }
    var CLONE_DEEP_FLAG = 1, CLONE_SYMBOLS_FLAG = 4;
    function cloneDeep(value) {
      return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
    }
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED);
      return this;
    }
    function setCacheHas(value) {
      return this.__data__.has(value);
    }
    function SetCache(values) {
      var index = -1, length = values == null ? 0 : values.length;
      this.__data__ = new MapCache();
      while (++index < length) {
        this.add(values[index]);
      }
    }
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;
    function arraySome(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }
    function cacheHas(cache, key) {
      return cache.has(key);
    }
    var COMPARE_PARTIAL_FLAG$3 = 1, COMPARE_UNORDERED_FLAG$1 = 2;
    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3, arrLength = array.length, othLength = other.length;
      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      var arrStacked = stack.get(array);
      var othStacked = stack.get(other);
      if (arrStacked && othStacked) {
        return arrStacked == other && othStacked == array;
      }
      var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG$1 ? new SetCache() : void 0;
      stack.set(array, other);
      stack.set(other, array);
      while (++index < arrLength) {
        var arrValue = array[index], othValue = other[index];
        if (customizer) {
          var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== void 0) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        if (seen) {
          if (!arraySome(other, function(othValue2, othIndex) {
            if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
            result = false;
            break;
          }
        } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
          result = false;
          break;
        }
      }
      stack["delete"](array);
      stack["delete"](other);
      return result;
    }
    function mapToArray(map) {
      var index = -1, result = Array(map.size);
      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }
    function setToArray(set2) {
      var index = -1, result = Array(set2.size);
      set2.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }
    var COMPARE_PARTIAL_FLAG$2 = 1, COMPARE_UNORDERED_FLAG = 2;
    var boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", mapTag = "[object Map]", numberTag = "[object Number]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]";
    var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]";
    var symbolProto = Symbol$1 ? Symbol$1.prototype : void 0, symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag:
          if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;
        case arrayBufferTag:
          if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array$1(object), new Uint8Array$1(other))) {
            return false;
          }
          return true;
        case boolTag:
        case dateTag:
        case numberTag:
          return eq(+object, +other);
        case errorTag:
          return object.name == other.name && object.message == other.message;
        case regexpTag:
        case stringTag:
          return object == other + "";
        case mapTag:
          var convert = mapToArray;
        case setTag:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2;
          convert || (convert = setToArray);
          if (object.size != other.size && !isPartial) {
            return false;
          }
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= COMPARE_UNORDERED_FLAG;
          stack.set(object, other);
          var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
          stack["delete"](object);
          return result;
        case symbolTag:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }
    var COMPARE_PARTIAL_FLAG$1 = 1;
    var objectProto$1 = Object.prototype;
    var hasOwnProperty$1 = objectProto$1.hasOwnProperty;
    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : hasOwnProperty$1.call(other, key))) {
          return false;
        }
      }
      var objStacked = stack.get(object);
      var othStacked = stack.get(other);
      if (objStacked && othStacked) {
        return objStacked == other && othStacked == object;
      }
      var result = true;
      stack.set(object, other);
      stack.set(other, object);
      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key], othValue = other[key];
        if (customizer) {
          var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
        }
        if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == "constructor");
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor, othCtor = other.constructor;
        if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack["delete"](object);
      stack["delete"](other);
      return result;
    }
    var COMPARE_PARTIAL_FLAG = 1;
    var argsTag = "[object Arguments]", arrayTag = "[object Array]", objectTag = "[object Object]";
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
      objTag = objTag == argsTag ? objectTag : objTag;
      othTag = othTag == argsTag ? objectTag : othTag;
      var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
      if (isSameTag && isBuffer(object)) {
        if (!isBuffer(other)) {
          return false;
        }
        objIsArr = true;
        objIsObj = false;
      }
      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack());
        return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
      }
      if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
        var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
          stack || (stack = new Stack());
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new Stack());
      return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
    }
    function baseIsEqual(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
    }
    var htmlEscapes = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    var escapeHtmlChar = basePropertyOf(htmlEscapes);
    var reUnescapedHtml = /[&<>"']/g, reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
    function escape$1(string) {
      string = toString(string);
      return string && reHasUnescapedHtml.test(string) ? string.replace(reUnescapedHtml, escapeHtmlChar) : string;
    }
    function isEqual(value, other) {
      return baseIsEqual(value, other);
    }
    function baseSet(object, path, value, customizer) {
      if (!isObject(object)) {
        return object;
      }
      path = castPath(path, object);
      var index = -1, length = path.length, lastIndex = length - 1, nested = object;
      while (nested != null && ++index < length) {
        var key = toKey(path[index]), newValue = value;
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
          return object;
        }
        if (index != lastIndex) {
          var objValue = nested[key];
          newValue = void 0;
          if (newValue === void 0) {
            newValue = isObject(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
          }
        }
        assignValue(nested, key, newValue);
        nested = nested[key];
      }
      return object;
    }
    function set(object, path, value) {
      return object == null ? object : baseSet(object, path, value);
    }
    var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
    var type;
    var hasRequiredType;
    function requireType() {
      if (hasRequiredType) return type;
      hasRequiredType = 1;
      type = TypeError;
      return type;
    }
    var util_inspect;
    var hasRequiredUtil_inspect;
    function requireUtil_inspect() {
      if (hasRequiredUtil_inspect) return util_inspect;
      hasRequiredUtil_inspect = 1;
      util_inspect = require$$0.inspect;
      return util_inspect;
    }
    var objectInspect;
    var hasRequiredObjectInspect;
    function requireObjectInspect() {
      if (hasRequiredObjectInspect) return objectInspect;
      hasRequiredObjectInspect = 1;
      var hasMap = typeof Map === "function" && Map.prototype;
      var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null;
      var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === "function" ? mapSizeDescriptor.get : null;
      var mapForEach = hasMap && Map.prototype.forEach;
      var hasSet = typeof Set === "function" && Set.prototype;
      var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null;
      var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === "function" ? setSizeDescriptor.get : null;
      var setForEach = hasSet && Set.prototype.forEach;
      var hasWeakMap = typeof WeakMap === "function" && WeakMap.prototype;
      var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
      var hasWeakSet = typeof WeakSet === "function" && WeakSet.prototype;
      var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
      var hasWeakRef = typeof WeakRef === "function" && WeakRef.prototype;
      var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
      var booleanValueOf = Boolean.prototype.valueOf;
      var objectToString2 = Object.prototype.toString;
      var functionToString = Function.prototype.toString;
      var $match = String.prototype.match;
      var $slice = String.prototype.slice;
      var $replace = String.prototype.replace;
      var $toUpperCase = String.prototype.toUpperCase;
      var $toLowerCase = String.prototype.toLowerCase;
      var $test = RegExp.prototype.test;
      var $concat = Array.prototype.concat;
      var $join = Array.prototype.join;
      var $arrSlice = Array.prototype.slice;
      var $floor = Math.floor;
      var bigIntValueOf = typeof BigInt === "function" ? BigInt.prototype.valueOf : null;
      var gOPS = Object.getOwnPropertySymbols;
      var symToString = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol.prototype.toString : null;
      var hasShammedSymbols = typeof Symbol === "function" && typeof Symbol.iterator === "object";
      var toStringTag = typeof Symbol === "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? "object" : "symbol") ? Symbol.toStringTag : null;
      var isEnumerable = Object.prototype.propertyIsEnumerable;
      var gPO = (typeof Reflect === "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(O) {
        return O.__proto__;
      } : null);
      function addNumericSeparator(num, str) {
        if (num === Infinity || num === -Infinity || num !== num || num && num > -1e3 && num < 1e3 || $test.call(/e/, str)) {
          return str;
        }
        var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
        if (typeof num === "number") {
          var int = num < 0 ? -$floor(-num) : $floor(num);
          if (int !== num) {
            var intStr = String(int);
            var dec = $slice.call(str, intStr.length + 1);
            return $replace.call(intStr, sepRegex, "$&_") + "." + $replace.call($replace.call(dec, /([0-9]{3})/g, "$&_"), /_$/, "");
          }
        }
        return $replace.call(str, sepRegex, "$&_");
      }
      var utilInspect = /* @__PURE__ */ requireUtil_inspect();
      var inspectCustom = utilInspect.custom;
      var inspectSymbol = isSymbol2(inspectCustom) ? inspectCustom : null;
      var quotes = {
        __proto__: null,
        "double": '"',
        single: "'"
      };
      var quoteREs = {
        __proto__: null,
        "double": /(["\\])/g,
        single: /(['\\])/g
      };
      objectInspect = function inspect_(obj, options, depth, seen) {
        var opts = options || {};
        if (has(opts, "quoteStyle") && !has(quotes, opts.quoteStyle)) {
          throw new TypeError('option "quoteStyle" must be "single" or "double"');
        }
        if (has(opts, "maxStringLength") && (typeof opts.maxStringLength === "number" ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) {
          throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
        }
        var customInspect = has(opts, "customInspect") ? opts.customInspect : true;
        if (typeof customInspect !== "boolean" && customInspect !== "symbol") {
          throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
        }
        if (has(opts, "indent") && opts.indent !== null && opts.indent !== "	" && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) {
          throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
        }
        if (has(opts, "numericSeparator") && typeof opts.numericSeparator !== "boolean") {
          throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
        }
        var numericSeparator = opts.numericSeparator;
        if (typeof obj === "undefined") {
          return "undefined";
        }
        if (obj === null) {
          return "null";
        }
        if (typeof obj === "boolean") {
          return obj ? "true" : "false";
        }
        if (typeof obj === "string") {
          return inspectString(obj, opts);
        }
        if (typeof obj === "number") {
          if (obj === 0) {
            return Infinity / obj > 0 ? "0" : "-0";
          }
          var str = String(obj);
          return numericSeparator ? addNumericSeparator(obj, str) : str;
        }
        if (typeof obj === "bigint") {
          var bigIntStr = String(obj) + "n";
          return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
        }
        var maxDepth = typeof opts.depth === "undefined" ? 5 : opts.depth;
        if (typeof depth === "undefined") {
          depth = 0;
        }
        if (depth >= maxDepth && maxDepth > 0 && typeof obj === "object") {
          return isArray2(obj) ? "[Array]" : "[Object]";
        }
        var indent = getIndent(opts, depth);
        if (typeof seen === "undefined") {
          seen = [];
        } else if (indexOf(seen, obj) >= 0) {
          return "[Circular]";
        }
        function inspect(value, from, noIndent) {
          if (from) {
            seen = $arrSlice.call(seen);
            seen.push(from);
          }
          if (noIndent) {
            var newOpts = {
              depth: opts.depth
            };
            if (has(opts, "quoteStyle")) {
              newOpts.quoteStyle = opts.quoteStyle;
            }
            return inspect_(value, newOpts, depth + 1, seen);
          }
          return inspect_(value, opts, depth + 1, seen);
        }
        if (typeof obj === "function" && !isRegExp(obj)) {
          var name = nameOf(obj);
          var keys2 = arrObjKeys(obj, inspect);
          return "[Function" + (name ? ": " + name : " (anonymous)") + "]" + (keys2.length > 0 ? " { " + $join.call(keys2, ", ") + " }" : "");
        }
        if (isSymbol2(obj)) {
          var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, "$1") : symToString.call(obj);
          return typeof obj === "object" && !hasShammedSymbols ? markBoxed(symString) : symString;
        }
        if (isElement(obj)) {
          var s = "<" + $toLowerCase.call(String(obj.nodeName));
          var attrs = obj.attributes || [];
          for (var i = 0; i < attrs.length; i++) {
            s += " " + attrs[i].name + "=" + wrapQuotes(quote(attrs[i].value), "double", opts);
          }
          s += ">";
          if (obj.childNodes && obj.childNodes.length) {
            s += "...";
          }
          s += "</" + $toLowerCase.call(String(obj.nodeName)) + ">";
          return s;
        }
        if (isArray2(obj)) {
          if (obj.length === 0) {
            return "[]";
          }
          var xs = arrObjKeys(obj, inspect);
          if (indent && !singleLineValues(xs)) {
            return "[" + indentedJoin(xs, indent) + "]";
          }
          return "[ " + $join.call(xs, ", ") + " ]";
        }
        if (isError(obj)) {
          var parts = arrObjKeys(obj, inspect);
          if (!("cause" in Error.prototype) && "cause" in obj && !isEnumerable.call(obj, "cause")) {
            return "{ [" + String(obj) + "] " + $join.call($concat.call("[cause]: " + inspect(obj.cause), parts), ", ") + " }";
          }
          if (parts.length === 0) {
            return "[" + String(obj) + "]";
          }
          return "{ [" + String(obj) + "] " + $join.call(parts, ", ") + " }";
        }
        if (typeof obj === "object" && customInspect) {
          if (inspectSymbol && typeof obj[inspectSymbol] === "function" && utilInspect) {
            return utilInspect(obj, { depth: maxDepth - depth });
          } else if (customInspect !== "symbol" && typeof obj.inspect === "function") {
            return obj.inspect();
          }
        }
        if (isMap2(obj)) {
          var mapParts = [];
          if (mapForEach) {
            mapForEach.call(obj, function(value, key) {
              mapParts.push(inspect(key, obj, true) + " => " + inspect(value, obj));
            });
          }
          return collectionOf("Map", mapSize.call(obj), mapParts, indent);
        }
        if (isSet2(obj)) {
          var setParts = [];
          if (setForEach) {
            setForEach.call(obj, function(value) {
              setParts.push(inspect(value, obj));
            });
          }
          return collectionOf("Set", setSize.call(obj), setParts, indent);
        }
        if (isWeakMap(obj)) {
          return weakCollectionOf("WeakMap");
        }
        if (isWeakSet(obj)) {
          return weakCollectionOf("WeakSet");
        }
        if (isWeakRef(obj)) {
          return weakCollectionOf("WeakRef");
        }
        if (isNumber(obj)) {
          return markBoxed(inspect(Number(obj)));
        }
        if (isBigInt(obj)) {
          return markBoxed(inspect(bigIntValueOf.call(obj)));
        }
        if (isBoolean(obj)) {
          return markBoxed(booleanValueOf.call(obj));
        }
        if (isString(obj)) {
          return markBoxed(inspect(String(obj)));
        }
        if (typeof window !== "undefined" && obj === window) {
          return "{ [object Window] }";
        }
        if (typeof globalThis !== "undefined" && obj === globalThis || typeof commonjsGlobal !== "undefined" && obj === commonjsGlobal) {
          return "{ [object globalThis] }";
        }
        if (!isDate(obj) && !isRegExp(obj)) {
          var ys = arrObjKeys(obj, inspect);
          var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
          var protoTag = obj instanceof Object ? "" : "null prototype";
          var stringTag2 = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? "Object" : "";
          var constructorTag = isPlainObject || typeof obj.constructor !== "function" ? "" : obj.constructor.name ? obj.constructor.name + " " : "";
          var tag = constructorTag + (stringTag2 || protoTag ? "[" + $join.call($concat.call([], stringTag2 || [], protoTag || []), ": ") + "] " : "");
          if (ys.length === 0) {
            return tag + "{}";
          }
          if (indent) {
            return tag + "{" + indentedJoin(ys, indent) + "}";
          }
          return tag + "{ " + $join.call(ys, ", ") + " }";
        }
        return String(obj);
      };
      function wrapQuotes(s, defaultStyle, opts) {
        var style = opts.quoteStyle || defaultStyle;
        var quoteChar = quotes[style];
        return quoteChar + s + quoteChar;
      }
      function quote(s) {
        return $replace.call(String(s), /"/g, "&quot;");
      }
      function canTrustToString(obj) {
        return !toStringTag || !(typeof obj === "object" && (toStringTag in obj || typeof obj[toStringTag] !== "undefined"));
      }
      function isArray2(obj) {
        return toStr(obj) === "[object Array]" && canTrustToString(obj);
      }
      function isDate(obj) {
        return toStr(obj) === "[object Date]" && canTrustToString(obj);
      }
      function isRegExp(obj) {
        return toStr(obj) === "[object RegExp]" && canTrustToString(obj);
      }
      function isError(obj) {
        return toStr(obj) === "[object Error]" && canTrustToString(obj);
      }
      function isString(obj) {
        return toStr(obj) === "[object String]" && canTrustToString(obj);
      }
      function isNumber(obj) {
        return toStr(obj) === "[object Number]" && canTrustToString(obj);
      }
      function isBoolean(obj) {
        return toStr(obj) === "[object Boolean]" && canTrustToString(obj);
      }
      function isSymbol2(obj) {
        if (hasShammedSymbols) {
          return obj && typeof obj === "object" && obj instanceof Symbol;
        }
        if (typeof obj === "symbol") {
          return true;
        }
        if (!obj || typeof obj !== "object" || !symToString) {
          return false;
        }
        try {
          symToString.call(obj);
          return true;
        } catch (e) {
        }
        return false;
      }
      function isBigInt(obj) {
        if (!obj || typeof obj !== "object" || !bigIntValueOf) {
          return false;
        }
        try {
          bigIntValueOf.call(obj);
          return true;
        } catch (e) {
        }
        return false;
      }
      var hasOwn = Object.prototype.hasOwnProperty || function(key) {
        return key in this;
      };
      function has(obj, key) {
        return hasOwn.call(obj, key);
      }
      function toStr(obj) {
        return objectToString2.call(obj);
      }
      function nameOf(f) {
        if (f.name) {
          return f.name;
        }
        var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
        if (m) {
          return m[1];
        }
        return null;
      }
      function indexOf(xs, x) {
        if (xs.indexOf) {
          return xs.indexOf(x);
        }
        for (var i = 0, l = xs.length; i < l; i++) {
          if (xs[i] === x) {
            return i;
          }
        }
        return -1;
      }
      function isMap2(x) {
        if (!mapSize || !x || typeof x !== "object") {
          return false;
        }
        try {
          mapSize.call(x);
          try {
            setSize.call(x);
          } catch (s) {
            return true;
          }
          return x instanceof Map;
        } catch (e) {
        }
        return false;
      }
      function isWeakMap(x) {
        if (!weakMapHas || !x || typeof x !== "object") {
          return false;
        }
        try {
          weakMapHas.call(x, weakMapHas);
          try {
            weakSetHas.call(x, weakSetHas);
          } catch (s) {
            return true;
          }
          return x instanceof WeakMap;
        } catch (e) {
        }
        return false;
      }
      function isWeakRef(x) {
        if (!weakRefDeref || !x || typeof x !== "object") {
          return false;
        }
        try {
          weakRefDeref.call(x);
          return true;
        } catch (e) {
        }
        return false;
      }
      function isSet2(x) {
        if (!setSize || !x || typeof x !== "object") {
          return false;
        }
        try {
          setSize.call(x);
          try {
            mapSize.call(x);
          } catch (m) {
            return true;
          }
          return x instanceof Set;
        } catch (e) {
        }
        return false;
      }
      function isWeakSet(x) {
        if (!weakSetHas || !x || typeof x !== "object") {
          return false;
        }
        try {
          weakSetHas.call(x, weakSetHas);
          try {
            weakMapHas.call(x, weakMapHas);
          } catch (s) {
            return true;
          }
          return x instanceof WeakSet;
        } catch (e) {
        }
        return false;
      }
      function isElement(x) {
        if (!x || typeof x !== "object") {
          return false;
        }
        if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) {
          return true;
        }
        return typeof x.nodeName === "string" && typeof x.getAttribute === "function";
      }
      function inspectString(str, opts) {
        if (str.length > opts.maxStringLength) {
          var remaining = str.length - opts.maxStringLength;
          var trailer = "... " + remaining + " more character" + (remaining > 1 ? "s" : "");
          return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
        }
        var quoteRE = quoteREs[opts.quoteStyle || "single"];
        quoteRE.lastIndex = 0;
        var s = $replace.call($replace.call(str, quoteRE, "\\$1"), /[\x00-\x1f]/g, lowbyte);
        return wrapQuotes(s, "single", opts);
      }
      function lowbyte(c) {
        var n = c.charCodeAt(0);
        var x = {
          8: "b",
          9: "t",
          10: "n",
          12: "f",
          13: "r"
        }[n];
        if (x) {
          return "\\" + x;
        }
        return "\\x" + (n < 16 ? "0" : "") + $toUpperCase.call(n.toString(16));
      }
      function markBoxed(str) {
        return "Object(" + str + ")";
      }
      function weakCollectionOf(type2) {
        return type2 + " { ? }";
      }
      function collectionOf(type2, size, entries, indent) {
        var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ", ");
        return type2 + " (" + size + ") {" + joinedEntries + "}";
      }
      function singleLineValues(xs) {
        for (var i = 0; i < xs.length; i++) {
          if (indexOf(xs[i], "\n") >= 0) {
            return false;
          }
        }
        return true;
      }
      function getIndent(opts, depth) {
        var baseIndent;
        if (opts.indent === "	") {
          baseIndent = "	";
        } else if (typeof opts.indent === "number" && opts.indent > 0) {
          baseIndent = $join.call(Array(opts.indent + 1), " ");
        } else {
          return null;
        }
        return {
          base: baseIndent,
          prev: $join.call(Array(depth + 1), baseIndent)
        };
      }
      function indentedJoin(xs, indent) {
        if (xs.length === 0) {
          return "";
        }
        var lineJoiner = "\n" + indent.prev + indent.base;
        return lineJoiner + $join.call(xs, "," + lineJoiner) + "\n" + indent.prev;
      }
      function arrObjKeys(obj, inspect) {
        var isArr = isArray2(obj);
        var xs = [];
        if (isArr) {
          xs.length = obj.length;
          for (var i = 0; i < obj.length; i++) {
            xs[i] = has(obj, i) ? inspect(obj[i], obj) : "";
          }
        }
        var syms = typeof gOPS === "function" ? gOPS(obj) : [];
        var symMap;
        if (hasShammedSymbols) {
          symMap = {};
          for (var k = 0; k < syms.length; k++) {
            symMap["$" + syms[k]] = syms[k];
          }
        }
        for (var key in obj) {
          if (!has(obj, key)) {
            continue;
          }
          if (isArr && String(Number(key)) === key && key < obj.length) {
            continue;
          }
          if (hasShammedSymbols && symMap["$" + key] instanceof Symbol) {
            continue;
          } else if ($test.call(/[^\w$]/, key)) {
            xs.push(inspect(key, obj) + ": " + inspect(obj[key], obj));
          } else {
            xs.push(key + ": " + inspect(obj[key], obj));
          }
        }
        if (typeof gOPS === "function") {
          for (var j = 0; j < syms.length; j++) {
            if (isEnumerable.call(obj, syms[j])) {
              xs.push("[" + inspect(syms[j]) + "]: " + inspect(obj[syms[j]], obj));
            }
          }
        }
        return xs;
      }
      return objectInspect;
    }
    var sideChannelList;
    var hasRequiredSideChannelList;
    function requireSideChannelList() {
      if (hasRequiredSideChannelList) return sideChannelList;
      hasRequiredSideChannelList = 1;
      var inspect = /* @__PURE__ */ requireObjectInspect();
      var $TypeError = /* @__PURE__ */ requireType();
      var listGetNode = function(list, key, isDelete) {
        var prev = list;
        var curr;
        for (; (curr = prev.next) != null; prev = curr) {
          if (curr.key === key) {
            prev.next = curr.next;
            if (!isDelete) {
              curr.next = /** @type {NonNullable<typeof list.next>} */
              list.next;
              list.next = curr;
            }
            return curr;
          }
        }
      };
      var listGet = function(objects, key) {
        if (!objects) {
          return void 0;
        }
        var node = listGetNode(objects, key);
        return node && node.value;
      };
      var listSet = function(objects, key, value) {
        var node = listGetNode(objects, key);
        if (node) {
          node.value = value;
        } else {
          objects.next = /** @type {import('./list.d.ts').ListNode<typeof value, typeof key>} */
          {
            // eslint-disable-line no-param-reassign, no-extra-parens
            key,
            next: objects.next,
            value
          };
        }
      };
      var listHas = function(objects, key) {
        if (!objects) {
          return false;
        }
        return !!listGetNode(objects, key);
      };
      var listDelete = function(objects, key) {
        if (objects) {
          return listGetNode(objects, key, true);
        }
      };
      sideChannelList = function getSideChannelList() {
        var $o;
        var channel = {
          assert: function(key) {
            if (!channel.has(key)) {
              throw new $TypeError("Side channel does not contain " + inspect(key));
            }
          },
          "delete": function(key) {
            var root2 = $o && $o.next;
            var deletedNode = listDelete($o, key);
            if (deletedNode && root2 && root2 === deletedNode) {
              $o = void 0;
            }
            return !!deletedNode;
          },
          get: function(key) {
            return listGet($o, key);
          },
          has: function(key) {
            return listHas($o, key);
          },
          set: function(key, value) {
            if (!$o) {
              $o = {
                next: void 0
              };
            }
            listSet(
              /** @type {NonNullable<typeof $o>} */
              $o,
              key,
              value
            );
          }
        };
        return channel;
      };
      return sideChannelList;
    }
    var esObjectAtoms;
    var hasRequiredEsObjectAtoms;
    function requireEsObjectAtoms() {
      if (hasRequiredEsObjectAtoms) return esObjectAtoms;
      hasRequiredEsObjectAtoms = 1;
      esObjectAtoms = Object;
      return esObjectAtoms;
    }
    var esErrors;
    var hasRequiredEsErrors;
    function requireEsErrors() {
      if (hasRequiredEsErrors) return esErrors;
      hasRequiredEsErrors = 1;
      esErrors = Error;
      return esErrors;
    }
    var _eval;
    var hasRequired_eval;
    function require_eval() {
      if (hasRequired_eval) return _eval;
      hasRequired_eval = 1;
      _eval = EvalError;
      return _eval;
    }
    var range;
    var hasRequiredRange;
    function requireRange() {
      if (hasRequiredRange) return range;
      hasRequiredRange = 1;
      range = RangeError;
      return range;
    }
    var ref;
    var hasRequiredRef;
    function requireRef() {
      if (hasRequiredRef) return ref;
      hasRequiredRef = 1;
      ref = ReferenceError;
      return ref;
    }
    var syntax;
    var hasRequiredSyntax;
    function requireSyntax() {
      if (hasRequiredSyntax) return syntax;
      hasRequiredSyntax = 1;
      syntax = SyntaxError;
      return syntax;
    }
    var uri;
    var hasRequiredUri;
    function requireUri() {
      if (hasRequiredUri) return uri;
      hasRequiredUri = 1;
      uri = URIError;
      return uri;
    }
    var abs;
    var hasRequiredAbs;
    function requireAbs() {
      if (hasRequiredAbs) return abs;
      hasRequiredAbs = 1;
      abs = Math.abs;
      return abs;
    }
    var floor;
    var hasRequiredFloor;
    function requireFloor() {
      if (hasRequiredFloor) return floor;
      hasRequiredFloor = 1;
      floor = Math.floor;
      return floor;
    }
    var max;
    var hasRequiredMax;
    function requireMax() {
      if (hasRequiredMax) return max;
      hasRequiredMax = 1;
      max = Math.max;
      return max;
    }
    var min;
    var hasRequiredMin;
    function requireMin() {
      if (hasRequiredMin) return min;
      hasRequiredMin = 1;
      min = Math.min;
      return min;
    }
    var pow;
    var hasRequiredPow;
    function requirePow() {
      if (hasRequiredPow) return pow;
      hasRequiredPow = 1;
      pow = Math.pow;
      return pow;
    }
    var round;
    var hasRequiredRound;
    function requireRound() {
      if (hasRequiredRound) return round;
      hasRequiredRound = 1;
      round = Math.round;
      return round;
    }
    var _isNaN;
    var hasRequired_isNaN;
    function require_isNaN() {
      if (hasRequired_isNaN) return _isNaN;
      hasRequired_isNaN = 1;
      _isNaN = Number.isNaN || function isNaN2(a) {
        return a !== a;
      };
      return _isNaN;
    }
    var sign;
    var hasRequiredSign;
    function requireSign() {
      if (hasRequiredSign) return sign;
      hasRequiredSign = 1;
      var $isNaN = /* @__PURE__ */ require_isNaN();
      sign = function sign2(number) {
        if ($isNaN(number) || number === 0) {
          return number;
        }
        return number < 0 ? -1 : 1;
      };
      return sign;
    }
    var gOPD;
    var hasRequiredGOPD;
    function requireGOPD() {
      if (hasRequiredGOPD) return gOPD;
      hasRequiredGOPD = 1;
      gOPD = Object.getOwnPropertyDescriptor;
      return gOPD;
    }
    var gopd;
    var hasRequiredGopd;
    function requireGopd() {
      if (hasRequiredGopd) return gopd;
      hasRequiredGopd = 1;
      var $gOPD = /* @__PURE__ */ requireGOPD();
      if ($gOPD) {
        try {
          $gOPD([], "length");
        } catch (e) {
          $gOPD = null;
        }
      }
      gopd = $gOPD;
      return gopd;
    }
    var esDefineProperty;
    var hasRequiredEsDefineProperty;
    function requireEsDefineProperty() {
      if (hasRequiredEsDefineProperty) return esDefineProperty;
      hasRequiredEsDefineProperty = 1;
      var $defineProperty = Object.defineProperty || false;
      if ($defineProperty) {
        try {
          $defineProperty({}, "a", { value: 1 });
        } catch (e) {
          $defineProperty = false;
        }
      }
      esDefineProperty = $defineProperty;
      return esDefineProperty;
    }
    var shams;
    var hasRequiredShams;
    function requireShams() {
      if (hasRequiredShams) return shams;
      hasRequiredShams = 1;
      shams = function hasSymbols2() {
        if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
          return false;
        }
        if (typeof Symbol.iterator === "symbol") {
          return true;
        }
        var obj = {};
        var sym = Symbol("test");
        var symObj = Object(sym);
        if (typeof sym === "string") {
          return false;
        }
        if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
          return false;
        }
        if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
          return false;
        }
        var symVal = 42;
        obj[sym] = symVal;
        for (var _ in obj) {
          return false;
        }
        if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
          return false;
        }
        if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
          return false;
        }
        var syms = Object.getOwnPropertySymbols(obj);
        if (syms.length !== 1 || syms[0] !== sym) {
          return false;
        }
        if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
          return false;
        }
        if (typeof Object.getOwnPropertyDescriptor === "function") {
          var descriptor = (
            /** @type {PropertyDescriptor} */
            Object.getOwnPropertyDescriptor(obj, sym)
          );
          if (descriptor.value !== symVal || descriptor.enumerable !== true) {
            return false;
          }
        }
        return true;
      };
      return shams;
    }
    var hasSymbols;
    var hasRequiredHasSymbols;
    function requireHasSymbols() {
      if (hasRequiredHasSymbols) return hasSymbols;
      hasRequiredHasSymbols = 1;
      var origSymbol = typeof Symbol !== "undefined" && Symbol;
      var hasSymbolSham = requireShams();
      hasSymbols = function hasNativeSymbols() {
        if (typeof origSymbol !== "function") {
          return false;
        }
        if (typeof Symbol !== "function") {
          return false;
        }
        if (typeof origSymbol("foo") !== "symbol") {
          return false;
        }
        if (typeof Symbol("bar") !== "symbol") {
          return false;
        }
        return hasSymbolSham();
      };
      return hasSymbols;
    }
    var Reflect_getPrototypeOf;
    var hasRequiredReflect_getPrototypeOf;
    function requireReflect_getPrototypeOf() {
      if (hasRequiredReflect_getPrototypeOf) return Reflect_getPrototypeOf;
      hasRequiredReflect_getPrototypeOf = 1;
      Reflect_getPrototypeOf = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
      return Reflect_getPrototypeOf;
    }
    var Object_getPrototypeOf;
    var hasRequiredObject_getPrototypeOf;
    function requireObject_getPrototypeOf() {
      if (hasRequiredObject_getPrototypeOf) return Object_getPrototypeOf;
      hasRequiredObject_getPrototypeOf = 1;
      var $Object = /* @__PURE__ */ requireEsObjectAtoms();
      Object_getPrototypeOf = $Object.getPrototypeOf || null;
      return Object_getPrototypeOf;
    }
    var implementation;
    var hasRequiredImplementation;
    function requireImplementation() {
      if (hasRequiredImplementation) return implementation;
      hasRequiredImplementation = 1;
      var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
      var toStr = Object.prototype.toString;
      var max2 = Math.max;
      var funcType = "[object Function]";
      var concatty = function concatty2(a, b) {
        var arr = [];
        for (var i = 0; i < a.length; i += 1) {
          arr[i] = a[i];
        }
        for (var j = 0; j < b.length; j += 1) {
          arr[j + a.length] = b[j];
        }
        return arr;
      };
      var slicy = function slicy2(arrLike, offset) {
        var arr = [];
        for (var i = offset, j = 0; i < arrLike.length; i += 1, j += 1) {
          arr[j] = arrLike[i];
        }
        return arr;
      };
      var joiny = function(arr, joiner) {
        var str = "";
        for (var i = 0; i < arr.length; i += 1) {
          str += arr[i];
          if (i + 1 < arr.length) {
            str += joiner;
          }
        }
        return str;
      };
      implementation = function bind(that) {
        var target = this;
        if (typeof target !== "function" || toStr.apply(target) !== funcType) {
          throw new TypeError(ERROR_MESSAGE + target);
        }
        var args = slicy(arguments, 1);
        var bound;
        var binder = function() {
          if (this instanceof bound) {
            var result = target.apply(
              this,
              concatty(args, arguments)
            );
            if (Object(result) === result) {
              return result;
            }
            return this;
          }
          return target.apply(
            that,
            concatty(args, arguments)
          );
        };
        var boundLength = max2(0, target.length - args.length);
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
          boundArgs[i] = "$" + i;
        }
        bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
        if (target.prototype) {
          var Empty = function Empty2() {
          };
          Empty.prototype = target.prototype;
          bound.prototype = new Empty();
          Empty.prototype = null;
        }
        return bound;
      };
      return implementation;
    }
    var functionBind;
    var hasRequiredFunctionBind;
    function requireFunctionBind() {
      if (hasRequiredFunctionBind) return functionBind;
      hasRequiredFunctionBind = 1;
      var implementation2 = requireImplementation();
      functionBind = Function.prototype.bind || implementation2;
      return functionBind;
    }
    var functionCall;
    var hasRequiredFunctionCall;
    function requireFunctionCall() {
      if (hasRequiredFunctionCall) return functionCall;
      hasRequiredFunctionCall = 1;
      functionCall = Function.prototype.call;
      return functionCall;
    }
    var functionApply;
    var hasRequiredFunctionApply;
    function requireFunctionApply() {
      if (hasRequiredFunctionApply) return functionApply;
      hasRequiredFunctionApply = 1;
      functionApply = Function.prototype.apply;
      return functionApply;
    }
    var reflectApply;
    var hasRequiredReflectApply;
    function requireReflectApply() {
      if (hasRequiredReflectApply) return reflectApply;
      hasRequiredReflectApply = 1;
      reflectApply = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
      return reflectApply;
    }
    var actualApply;
    var hasRequiredActualApply;
    function requireActualApply() {
      if (hasRequiredActualApply) return actualApply;
      hasRequiredActualApply = 1;
      var bind = requireFunctionBind();
      var $apply = requireFunctionApply();
      var $call = requireFunctionCall();
      var $reflectApply = requireReflectApply();
      actualApply = $reflectApply || bind.call($call, $apply);
      return actualApply;
    }
    var callBindApplyHelpers;
    var hasRequiredCallBindApplyHelpers;
    function requireCallBindApplyHelpers() {
      if (hasRequiredCallBindApplyHelpers) return callBindApplyHelpers;
      hasRequiredCallBindApplyHelpers = 1;
      var bind = requireFunctionBind();
      var $TypeError = /* @__PURE__ */ requireType();
      var $call = requireFunctionCall();
      var $actualApply = requireActualApply();
      callBindApplyHelpers = function callBindBasic(args) {
        if (args.length < 1 || typeof args[0] !== "function") {
          throw new $TypeError("a function is required");
        }
        return $actualApply(bind, $call, args);
      };
      return callBindApplyHelpers;
    }
    var get;
    var hasRequiredGet;
    function requireGet() {
      if (hasRequiredGet) return get;
      hasRequiredGet = 1;
      var callBind = requireCallBindApplyHelpers();
      var gOPD2 = /* @__PURE__ */ requireGopd();
      var hasProtoAccessor;
      try {
        hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */
        [].__proto__ === Array.prototype;
      } catch (e) {
        if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
          throw e;
        }
      }
      var desc = !!hasProtoAccessor && gOPD2 && gOPD2(
        Object.prototype,
        /** @type {keyof typeof Object.prototype} */
        "__proto__"
      );
      var $Object = Object;
      var $getPrototypeOf = $Object.getPrototypeOf;
      get = desc && typeof desc.get === "function" ? callBind([desc.get]) : typeof $getPrototypeOf === "function" ? (
        /** @type {import('./get')} */
        function getDunder(value) {
          return $getPrototypeOf(value == null ? value : $Object(value));
        }
      ) : false;
      return get;
    }
    var getProto;
    var hasRequiredGetProto;
    function requireGetProto() {
      if (hasRequiredGetProto) return getProto;
      hasRequiredGetProto = 1;
      var reflectGetProto = requireReflect_getPrototypeOf();
      var originalGetProto = requireObject_getPrototypeOf();
      var getDunderProto = /* @__PURE__ */ requireGet();
      getProto = reflectGetProto ? function getProto2(O) {
        return reflectGetProto(O);
      } : originalGetProto ? function getProto2(O) {
        if (!O || typeof O !== "object" && typeof O !== "function") {
          throw new TypeError("getProto: not an object");
        }
        return originalGetProto(O);
      } : getDunderProto ? function getProto2(O) {
        return getDunderProto(O);
      } : null;
      return getProto;
    }
    var hasown;
    var hasRequiredHasown;
    function requireHasown() {
      if (hasRequiredHasown) return hasown;
      hasRequiredHasown = 1;
      var call = Function.prototype.call;
      var $hasOwn = Object.prototype.hasOwnProperty;
      var bind = requireFunctionBind();
      hasown = bind.call(call, $hasOwn);
      return hasown;
    }
    var getIntrinsic;
    var hasRequiredGetIntrinsic;
    function requireGetIntrinsic() {
      if (hasRequiredGetIntrinsic) return getIntrinsic;
      hasRequiredGetIntrinsic = 1;
      var undefined$1;
      var $Object = /* @__PURE__ */ requireEsObjectAtoms();
      var $Error = /* @__PURE__ */ requireEsErrors();
      var $EvalError = /* @__PURE__ */ require_eval();
      var $RangeError = /* @__PURE__ */ requireRange();
      var $ReferenceError = /* @__PURE__ */ requireRef();
      var $SyntaxError = /* @__PURE__ */ requireSyntax();
      var $TypeError = /* @__PURE__ */ requireType();
      var $URIError = /* @__PURE__ */ requireUri();
      var abs2 = /* @__PURE__ */ requireAbs();
      var floor2 = /* @__PURE__ */ requireFloor();
      var max2 = /* @__PURE__ */ requireMax();
      var min2 = /* @__PURE__ */ requireMin();
      var pow2 = /* @__PURE__ */ requirePow();
      var round2 = /* @__PURE__ */ requireRound();
      var sign2 = /* @__PURE__ */ requireSign();
      var $Function = Function;
      var getEvalledConstructor = function(expressionSyntax) {
        try {
          return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
        } catch (e) {
        }
      };
      var $gOPD = /* @__PURE__ */ requireGopd();
      var $defineProperty = /* @__PURE__ */ requireEsDefineProperty();
      var throwTypeError = function() {
        throw new $TypeError();
      };
      var ThrowTypeError = $gOPD ? (function() {
        try {
          arguments.callee;
          return throwTypeError;
        } catch (calleeThrows) {
          try {
            return $gOPD(arguments, "callee").get;
          } catch (gOPDthrows) {
            return throwTypeError;
          }
        }
      })() : throwTypeError;
      var hasSymbols2 = requireHasSymbols()();
      var getProto2 = requireGetProto();
      var $ObjectGPO = requireObject_getPrototypeOf();
      var $ReflectGPO = requireReflect_getPrototypeOf();
      var $apply = requireFunctionApply();
      var $call = requireFunctionCall();
      var needsEval = {};
      var TypedArray = typeof Uint8Array === "undefined" || !getProto2 ? undefined$1 : getProto2(Uint8Array);
      var INTRINSICS = {
        __proto__: null,
        "%AggregateError%": typeof AggregateError === "undefined" ? undefined$1 : AggregateError,
        "%Array%": Array,
        "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined$1 : ArrayBuffer,
        "%ArrayIteratorPrototype%": hasSymbols2 && getProto2 ? getProto2([][Symbol.iterator]()) : undefined$1,
        "%AsyncFromSyncIteratorPrototype%": undefined$1,
        "%AsyncFunction%": needsEval,
        "%AsyncGenerator%": needsEval,
        "%AsyncGeneratorFunction%": needsEval,
        "%AsyncIteratorPrototype%": needsEval,
        "%Atomics%": typeof Atomics === "undefined" ? undefined$1 : Atomics,
        "%BigInt%": typeof BigInt === "undefined" ? undefined$1 : BigInt,
        "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined$1 : BigInt64Array,
        "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined$1 : BigUint64Array,
        "%Boolean%": Boolean,
        "%DataView%": typeof DataView === "undefined" ? undefined$1 : DataView,
        "%Date%": Date,
        "%decodeURI%": decodeURI,
        "%decodeURIComponent%": decodeURIComponent,
        "%encodeURI%": encodeURI,
        "%encodeURIComponent%": encodeURIComponent,
        "%Error%": $Error,
        "%eval%": eval,
        // eslint-disable-line no-eval
        "%EvalError%": $EvalError,
        "%Float16Array%": typeof Float16Array === "undefined" ? undefined$1 : Float16Array,
        "%Float32Array%": typeof Float32Array === "undefined" ? undefined$1 : Float32Array,
        "%Float64Array%": typeof Float64Array === "undefined" ? undefined$1 : Float64Array,
        "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined$1 : FinalizationRegistry,
        "%Function%": $Function,
        "%GeneratorFunction%": needsEval,
        "%Int8Array%": typeof Int8Array === "undefined" ? undefined$1 : Int8Array,
        "%Int16Array%": typeof Int16Array === "undefined" ? undefined$1 : Int16Array,
        "%Int32Array%": typeof Int32Array === "undefined" ? undefined$1 : Int32Array,
        "%isFinite%": isFinite,
        "%isNaN%": isNaN,
        "%IteratorPrototype%": hasSymbols2 && getProto2 ? getProto2(getProto2([][Symbol.iterator]())) : undefined$1,
        "%JSON%": typeof JSON === "object" ? JSON : undefined$1,
        "%Map%": typeof Map === "undefined" ? undefined$1 : Map,
        "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols2 || !getProto2 ? undefined$1 : getProto2((/* @__PURE__ */ new Map())[Symbol.iterator]()),
        "%Math%": Math,
        "%Number%": Number,
        "%Object%": $Object,
        "%Object.getOwnPropertyDescriptor%": $gOPD,
        "%parseFloat%": parseFloat,
        "%parseInt%": parseInt,
        "%Promise%": typeof Promise === "undefined" ? undefined$1 : Promise,
        "%Proxy%": typeof Proxy === "undefined" ? undefined$1 : Proxy,
        "%RangeError%": $RangeError,
        "%ReferenceError%": $ReferenceError,
        "%Reflect%": typeof Reflect === "undefined" ? undefined$1 : Reflect,
        "%RegExp%": RegExp,
        "%Set%": typeof Set === "undefined" ? undefined$1 : Set,
        "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols2 || !getProto2 ? undefined$1 : getProto2((/* @__PURE__ */ new Set())[Symbol.iterator]()),
        "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined$1 : SharedArrayBuffer,
        "%String%": String,
        "%StringIteratorPrototype%": hasSymbols2 && getProto2 ? getProto2(""[Symbol.iterator]()) : undefined$1,
        "%Symbol%": hasSymbols2 ? Symbol : undefined$1,
        "%SyntaxError%": $SyntaxError,
        "%ThrowTypeError%": ThrowTypeError,
        "%TypedArray%": TypedArray,
        "%TypeError%": $TypeError,
        "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined$1 : Uint8Array,
        "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined$1 : Uint8ClampedArray,
        "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined$1 : Uint16Array,
        "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined$1 : Uint32Array,
        "%URIError%": $URIError,
        "%WeakMap%": typeof WeakMap === "undefined" ? undefined$1 : WeakMap,
        "%WeakRef%": typeof WeakRef === "undefined" ? undefined$1 : WeakRef,
        "%WeakSet%": typeof WeakSet === "undefined" ? undefined$1 : WeakSet,
        "%Function.prototype.call%": $call,
        "%Function.prototype.apply%": $apply,
        "%Object.defineProperty%": $defineProperty,
        "%Object.getPrototypeOf%": $ObjectGPO,
        "%Math.abs%": abs2,
        "%Math.floor%": floor2,
        "%Math.max%": max2,
        "%Math.min%": min2,
        "%Math.pow%": pow2,
        "%Math.round%": round2,
        "%Math.sign%": sign2,
        "%Reflect.getPrototypeOf%": $ReflectGPO
      };
      if (getProto2) {
        try {
          null.error;
        } catch (e) {
          var errorProto = getProto2(getProto2(e));
          INTRINSICS["%Error.prototype%"] = errorProto;
        }
      }
      var doEval = function doEval2(name) {
        var value;
        if (name === "%AsyncFunction%") {
          value = getEvalledConstructor("async function () {}");
        } else if (name === "%GeneratorFunction%") {
          value = getEvalledConstructor("function* () {}");
        } else if (name === "%AsyncGeneratorFunction%") {
          value = getEvalledConstructor("async function* () {}");
        } else if (name === "%AsyncGenerator%") {
          var fn = doEval2("%AsyncGeneratorFunction%");
          if (fn) {
            value = fn.prototype;
          }
        } else if (name === "%AsyncIteratorPrototype%") {
          var gen = doEval2("%AsyncGenerator%");
          if (gen && getProto2) {
            value = getProto2(gen.prototype);
          }
        }
        INTRINSICS[name] = value;
        return value;
      };
      var LEGACY_ALIASES = {
        __proto__: null,
        "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
        "%ArrayPrototype%": ["Array", "prototype"],
        "%ArrayProto_entries%": ["Array", "prototype", "entries"],
        "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
        "%ArrayProto_keys%": ["Array", "prototype", "keys"],
        "%ArrayProto_values%": ["Array", "prototype", "values"],
        "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
        "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
        "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
        "%BooleanPrototype%": ["Boolean", "prototype"],
        "%DataViewPrototype%": ["DataView", "prototype"],
        "%DatePrototype%": ["Date", "prototype"],
        "%ErrorPrototype%": ["Error", "prototype"],
        "%EvalErrorPrototype%": ["EvalError", "prototype"],
        "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
        "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
        "%FunctionPrototype%": ["Function", "prototype"],
        "%Generator%": ["GeneratorFunction", "prototype"],
        "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
        "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
        "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
        "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
        "%JSONParse%": ["JSON", "parse"],
        "%JSONStringify%": ["JSON", "stringify"],
        "%MapPrototype%": ["Map", "prototype"],
        "%NumberPrototype%": ["Number", "prototype"],
        "%ObjectPrototype%": ["Object", "prototype"],
        "%ObjProto_toString%": ["Object", "prototype", "toString"],
        "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
        "%PromisePrototype%": ["Promise", "prototype"],
        "%PromiseProto_then%": ["Promise", "prototype", "then"],
        "%Promise_all%": ["Promise", "all"],
        "%Promise_reject%": ["Promise", "reject"],
        "%Promise_resolve%": ["Promise", "resolve"],
        "%RangeErrorPrototype%": ["RangeError", "prototype"],
        "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
        "%RegExpPrototype%": ["RegExp", "prototype"],
        "%SetPrototype%": ["Set", "prototype"],
        "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
        "%StringPrototype%": ["String", "prototype"],
        "%SymbolPrototype%": ["Symbol", "prototype"],
        "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
        "%TypedArrayPrototype%": ["TypedArray", "prototype"],
        "%TypeErrorPrototype%": ["TypeError", "prototype"],
        "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
        "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
        "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
        "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
        "%URIErrorPrototype%": ["URIError", "prototype"],
        "%WeakMapPrototype%": ["WeakMap", "prototype"],
        "%WeakSetPrototype%": ["WeakSet", "prototype"]
      };
      var bind = requireFunctionBind();
      var hasOwn = /* @__PURE__ */ requireHasown();
      var $concat = bind.call($call, Array.prototype.concat);
      var $spliceApply = bind.call($apply, Array.prototype.splice);
      var $replace = bind.call($call, String.prototype.replace);
      var $strSlice = bind.call($call, String.prototype.slice);
      var $exec = bind.call($call, RegExp.prototype.exec);
      var rePropName2 = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
      var reEscapeChar2 = /\\(\\)?/g;
      var stringToPath2 = function stringToPath3(string) {
        var first = $strSlice(string, 0, 1);
        var last = $strSlice(string, -1);
        if (first === "%" && last !== "%") {
          throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
        } else if (last === "%" && first !== "%") {
          throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
        }
        var result = [];
        $replace(string, rePropName2, function(match, number, quote, subString) {
          result[result.length] = quote ? $replace(subString, reEscapeChar2, "$1") : number || match;
        });
        return result;
      };
      var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
        var intrinsicName = name;
        var alias;
        if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
          alias = LEGACY_ALIASES[intrinsicName];
          intrinsicName = "%" + alias[0] + "%";
        }
        if (hasOwn(INTRINSICS, intrinsicName)) {
          var value = INTRINSICS[intrinsicName];
          if (value === needsEval) {
            value = doEval(intrinsicName);
          }
          if (typeof value === "undefined" && !allowMissing) {
            throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
          }
          return {
            alias,
            name: intrinsicName,
            value
          };
        }
        throw new $SyntaxError("intrinsic " + name + " does not exist!");
      };
      getIntrinsic = function GetIntrinsic(name, allowMissing) {
        if (typeof name !== "string" || name.length === 0) {
          throw new $TypeError("intrinsic name must be a non-empty string");
        }
        if (arguments.length > 1 && typeof allowMissing !== "boolean") {
          throw new $TypeError('"allowMissing" argument must be a boolean');
        }
        if ($exec(/^%?[^%]*%?$/, name) === null) {
          throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
        }
        var parts = stringToPath2(name);
        var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
        var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
        var intrinsicRealName = intrinsic.name;
        var value = intrinsic.value;
        var skipFurtherCaching = false;
        var alias = intrinsic.alias;
        if (alias) {
          intrinsicBaseName = alias[0];
          $spliceApply(parts, $concat([0, 1], alias));
        }
        for (var i = 1, isOwn = true; i < parts.length; i += 1) {
          var part = parts[i];
          var first = $strSlice(part, 0, 1);
          var last = $strSlice(part, -1);
          if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
            throw new $SyntaxError("property names with quotes must have matching quotes");
          }
          if (part === "constructor" || !isOwn) {
            skipFurtherCaching = true;
          }
          intrinsicBaseName += "." + part;
          intrinsicRealName = "%" + intrinsicBaseName + "%";
          if (hasOwn(INTRINSICS, intrinsicRealName)) {
            value = INTRINSICS[intrinsicRealName];
          } else if (value != null) {
            if (!(part in value)) {
              if (!allowMissing) {
                throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
              }
              return void undefined$1;
            }
            if ($gOPD && i + 1 >= parts.length) {
              var desc = $gOPD(value, part);
              isOwn = !!desc;
              if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
                value = desc.get;
              } else {
                value = value[part];
              }
            } else {
              isOwn = hasOwn(value, part);
              value = value[part];
            }
            if (isOwn && !skipFurtherCaching) {
              INTRINSICS[intrinsicRealName] = value;
            }
          }
        }
        return value;
      };
      return getIntrinsic;
    }
    var callBound;
    var hasRequiredCallBound;
    function requireCallBound() {
      if (hasRequiredCallBound) return callBound;
      hasRequiredCallBound = 1;
      var GetIntrinsic = /* @__PURE__ */ requireGetIntrinsic();
      var callBindBasic = requireCallBindApplyHelpers();
      var $indexOf = callBindBasic([GetIntrinsic("%String.prototype.indexOf%")]);
      callBound = function callBoundIntrinsic(name, allowMissing) {
        var intrinsic = (
          /** @type {(this: unknown, ...args: unknown[]) => unknown} */
          GetIntrinsic(name, !!allowMissing)
        );
        if (typeof intrinsic === "function" && $indexOf(name, ".prototype.") > -1) {
          return callBindBasic(
            /** @type {const} */
            [intrinsic]
          );
        }
        return intrinsic;
      };
      return callBound;
    }
    var sideChannelMap;
    var hasRequiredSideChannelMap;
    function requireSideChannelMap() {
      if (hasRequiredSideChannelMap) return sideChannelMap;
      hasRequiredSideChannelMap = 1;
      var GetIntrinsic = /* @__PURE__ */ requireGetIntrinsic();
      var callBound2 = /* @__PURE__ */ requireCallBound();
      var inspect = /* @__PURE__ */ requireObjectInspect();
      var $TypeError = /* @__PURE__ */ requireType();
      var $Map = GetIntrinsic("%Map%", true);
      var $mapGet = callBound2("Map.prototype.get", true);
      var $mapSet = callBound2("Map.prototype.set", true);
      var $mapHas = callBound2("Map.prototype.has", true);
      var $mapDelete = callBound2("Map.prototype.delete", true);
      var $mapSize = callBound2("Map.prototype.size", true);
      sideChannelMap = !!$Map && /** @type {Exclude<import('.'), false>} */
      function getSideChannelMap() {
        var $m;
        var channel = {
          assert: function(key) {
            if (!channel.has(key)) {
              throw new $TypeError("Side channel does not contain " + inspect(key));
            }
          },
          "delete": function(key) {
            if ($m) {
              var result = $mapDelete($m, key);
              if ($mapSize($m) === 0) {
                $m = void 0;
              }
              return result;
            }
            return false;
          },
          get: function(key) {
            if ($m) {
              return $mapGet($m, key);
            }
          },
          has: function(key) {
            if ($m) {
              return $mapHas($m, key);
            }
            return false;
          },
          set: function(key, value) {
            if (!$m) {
              $m = new $Map();
            }
            $mapSet($m, key, value);
          }
        };
        return channel;
      };
      return sideChannelMap;
    }
    var sideChannelWeakmap;
    var hasRequiredSideChannelWeakmap;
    function requireSideChannelWeakmap() {
      if (hasRequiredSideChannelWeakmap) return sideChannelWeakmap;
      hasRequiredSideChannelWeakmap = 1;
      var GetIntrinsic = /* @__PURE__ */ requireGetIntrinsic();
      var callBound2 = /* @__PURE__ */ requireCallBound();
      var inspect = /* @__PURE__ */ requireObjectInspect();
      var getSideChannelMap = requireSideChannelMap();
      var $TypeError = /* @__PURE__ */ requireType();
      var $WeakMap = GetIntrinsic("%WeakMap%", true);
      var $weakMapGet = callBound2("WeakMap.prototype.get", true);
      var $weakMapSet = callBound2("WeakMap.prototype.set", true);
      var $weakMapHas = callBound2("WeakMap.prototype.has", true);
      var $weakMapDelete = callBound2("WeakMap.prototype.delete", true);
      sideChannelWeakmap = $WeakMap ? (
        /** @type {Exclude<import('.'), false>} */
        function getSideChannelWeakMap() {
          var $wm;
          var $m;
          var channel = {
            assert: function(key) {
              if (!channel.has(key)) {
                throw new $TypeError("Side channel does not contain " + inspect(key));
              }
            },
            "delete": function(key) {
              if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
                if ($wm) {
                  return $weakMapDelete($wm, key);
                }
              } else if (getSideChannelMap) {
                if ($m) {
                  return $m["delete"](key);
                }
              }
              return false;
            },
            get: function(key) {
              if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
                if ($wm) {
                  return $weakMapGet($wm, key);
                }
              }
              return $m && $m.get(key);
            },
            has: function(key) {
              if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
                if ($wm) {
                  return $weakMapHas($wm, key);
                }
              }
              return !!$m && $m.has(key);
            },
            set: function(key, value) {
              if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
                if (!$wm) {
                  $wm = new $WeakMap();
                }
                $weakMapSet($wm, key, value);
              } else if (getSideChannelMap) {
                if (!$m) {
                  $m = getSideChannelMap();
                }
                $m.set(key, value);
              }
            }
          };
          return channel;
        }
      ) : getSideChannelMap;
      return sideChannelWeakmap;
    }
    var sideChannel;
    var hasRequiredSideChannel;
    function requireSideChannel() {
      if (hasRequiredSideChannel) return sideChannel;
      hasRequiredSideChannel = 1;
      var $TypeError = /* @__PURE__ */ requireType();
      var inspect = /* @__PURE__ */ requireObjectInspect();
      var getSideChannelList = requireSideChannelList();
      var getSideChannelMap = requireSideChannelMap();
      var getSideChannelWeakMap = requireSideChannelWeakmap();
      var makeChannel = getSideChannelWeakMap || getSideChannelMap || getSideChannelList;
      sideChannel = function getSideChannel() {
        var $channelData;
        var channel = {
          assert: function(key) {
            if (!channel.has(key)) {
              throw new $TypeError("Side channel does not contain " + inspect(key));
            }
          },
          "delete": function(key) {
            return !!$channelData && $channelData["delete"](key);
          },
          get: function(key) {
            return $channelData && $channelData.get(key);
          },
          has: function(key) {
            return !!$channelData && $channelData.has(key);
          },
          set: function(key, value) {
            if (!$channelData) {
              $channelData = makeChannel();
            }
            $channelData.set(key, value);
          }
        };
        return channel;
      };
      return sideChannel;
    }
    var formats;
    var hasRequiredFormats;
    function requireFormats() {
      if (hasRequiredFormats) return formats;
      hasRequiredFormats = 1;
      var replace = String.prototype.replace;
      var percentTwenties = /%20/g;
      var Format = {
        RFC1738: "RFC1738",
        RFC3986: "RFC3986"
      };
      formats = {
        "default": Format.RFC3986,
        formatters: {
          RFC1738: function(value) {
            return replace.call(value, percentTwenties, "+");
          },
          RFC3986: function(value) {
            return String(value);
          }
        },
        RFC1738: Format.RFC1738,
        RFC3986: Format.RFC3986
      };
      return formats;
    }
    var utils;
    var hasRequiredUtils;
    function requireUtils() {
      if (hasRequiredUtils) return utils;
      hasRequiredUtils = 1;
      var formats2 = /* @__PURE__ */ requireFormats();
      var has = Object.prototype.hasOwnProperty;
      var isArray2 = Array.isArray;
      var hexTable = (function() {
        var array = [];
        for (var i = 0; i < 256; ++i) {
          array.push("%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase());
        }
        return array;
      })();
      var compactQueue = function compactQueue2(queue3) {
        while (queue3.length > 1) {
          var item = queue3.pop();
          var obj = item.obj[item.prop];
          if (isArray2(obj)) {
            var compacted = [];
            for (var j = 0; j < obj.length; ++j) {
              if (typeof obj[j] !== "undefined") {
                compacted.push(obj[j]);
              }
            }
            item.obj[item.prop] = compacted;
          }
        }
      };
      var arrayToObject = function arrayToObject2(source, options) {
        var obj = options && options.plainObjects ? { __proto__: null } : {};
        for (var i = 0; i < source.length; ++i) {
          if (typeof source[i] !== "undefined") {
            obj[i] = source[i];
          }
        }
        return obj;
      };
      var merge = function merge2(target, source, options) {
        if (!source) {
          return target;
        }
        if (typeof source !== "object" && typeof source !== "function") {
          if (isArray2(target)) {
            target.push(source);
          } else if (target && typeof target === "object") {
            if (options && (options.plainObjects || options.allowPrototypes) || !has.call(Object.prototype, source)) {
              target[source] = true;
            }
          } else {
            return [target, source];
          }
          return target;
        }
        if (!target || typeof target !== "object") {
          return [target].concat(source);
        }
        var mergeTarget = target;
        if (isArray2(target) && !isArray2(source)) {
          mergeTarget = arrayToObject(target, options);
        }
        if (isArray2(target) && isArray2(source)) {
          source.forEach(function(item, i) {
            if (has.call(target, i)) {
              var targetItem = target[i];
              if (targetItem && typeof targetItem === "object" && item && typeof item === "object") {
                target[i] = merge2(targetItem, item, options);
              } else {
                target.push(item);
              }
            } else {
              target[i] = item;
            }
          });
          return target;
        }
        return Object.keys(source).reduce(function(acc, key) {
          var value = source[key];
          if (has.call(acc, key)) {
            acc[key] = merge2(acc[key], value, options);
          } else {
            acc[key] = value;
          }
          return acc;
        }, mergeTarget);
      };
      var assign = function assignSingleSource(target, source) {
        return Object.keys(source).reduce(function(acc, key) {
          acc[key] = source[key];
          return acc;
        }, target);
      };
      var decode = function(str, defaultDecoder, charset) {
        var strWithoutPlus = str.replace(/\+/g, " ");
        if (charset === "iso-8859-1") {
          return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
        }
        try {
          return decodeURIComponent(strWithoutPlus);
        } catch (e) {
          return strWithoutPlus;
        }
      };
      var limit = 1024;
      var encode = function encode2(str, defaultEncoder, charset, kind, format) {
        if (str.length === 0) {
          return str;
        }
        var string = str;
        if (typeof str === "symbol") {
          string = Symbol.prototype.toString.call(str);
        } else if (typeof str !== "string") {
          string = String(str);
        }
        if (charset === "iso-8859-1") {
          return escape(string).replace(/%u[0-9a-f]{4}/gi, function($0) {
            return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
          });
        }
        var out = "";
        for (var j = 0; j < string.length; j += limit) {
          var segment = string.length >= limit ? string.slice(j, j + limit) : string;
          var arr = [];
          for (var i = 0; i < segment.length; ++i) {
            var c = segment.charCodeAt(i);
            if (c === 45 || c === 46 || c === 95 || c === 126 || c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 || format === formats2.RFC1738 && (c === 40 || c === 41)) {
              arr[arr.length] = segment.charAt(i);
              continue;
            }
            if (c < 128) {
              arr[arr.length] = hexTable[c];
              continue;
            }
            if (c < 2048) {
              arr[arr.length] = hexTable[192 | c >> 6] + hexTable[128 | c & 63];
              continue;
            }
            if (c < 55296 || c >= 57344) {
              arr[arr.length] = hexTable[224 | c >> 12] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
              continue;
            }
            i += 1;
            c = 65536 + ((c & 1023) << 10 | segment.charCodeAt(i) & 1023);
            arr[arr.length] = hexTable[240 | c >> 18] + hexTable[128 | c >> 12 & 63] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
          }
          out += arr.join("");
        }
        return out;
      };
      var compact = function compact2(value) {
        var queue3 = [{ obj: { o: value }, prop: "o" }];
        var refs = [];
        for (var i = 0; i < queue3.length; ++i) {
          var item = queue3[i];
          var obj = item.obj[item.prop];
          var keys2 = Object.keys(obj);
          for (var j = 0; j < keys2.length; ++j) {
            var key = keys2[j];
            var val = obj[key];
            if (typeof val === "object" && val !== null && refs.indexOf(val) === -1) {
              queue3.push({ obj, prop: key });
              refs.push(val);
            }
          }
        }
        compactQueue(queue3);
        return value;
      };
      var isRegExp = function isRegExp2(obj) {
        return Object.prototype.toString.call(obj) === "[object RegExp]";
      };
      var isBuffer2 = function isBuffer3(obj) {
        if (!obj || typeof obj !== "object") {
          return false;
        }
        return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
      };
      var combine = function combine2(a, b) {
        return [].concat(a, b);
      };
      var maybeMap = function maybeMap2(val, fn) {
        if (isArray2(val)) {
          var mapped = [];
          for (var i = 0; i < val.length; i += 1) {
            mapped.push(fn(val[i]));
          }
          return mapped;
        }
        return fn(val);
      };
      utils = {
        arrayToObject,
        assign,
        combine,
        compact,
        decode,
        encode,
        isBuffer: isBuffer2,
        isRegExp,
        maybeMap,
        merge
      };
      return utils;
    }
    var stringify_1;
    var hasRequiredStringify;
    function requireStringify() {
      if (hasRequiredStringify) return stringify_1;
      hasRequiredStringify = 1;
      var getSideChannel = requireSideChannel();
      var utils2 = /* @__PURE__ */ requireUtils();
      var formats2 = /* @__PURE__ */ requireFormats();
      var has = Object.prototype.hasOwnProperty;
      var arrayPrefixGenerators = {
        brackets: function brackets(prefix) {
          return prefix + "[]";
        },
        comma: "comma",
        indices: function indices(prefix, key) {
          return prefix + "[" + key + "]";
        },
        repeat: function repeat(prefix) {
          return prefix;
        }
      };
      var isArray2 = Array.isArray;
      var push2 = Array.prototype.push;
      var pushToArray = function(arr, valueOrArray) {
        push2.apply(arr, isArray2(valueOrArray) ? valueOrArray : [valueOrArray]);
      };
      var toISO = Date.prototype.toISOString;
      var defaultFormat = formats2["default"];
      var defaults = {
        addQueryPrefix: false,
        allowDots: false,
        allowEmptyArrays: false,
        arrayFormat: "indices",
        charset: "utf-8",
        charsetSentinel: false,
        commaRoundTrip: false,
        delimiter: "&",
        encode: true,
        encodeDotInKeys: false,
        encoder: utils2.encode,
        encodeValuesOnly: false,
        filter: void 0,
        format: defaultFormat,
        formatter: formats2.formatters[defaultFormat],
        // deprecated
        indices: false,
        serializeDate: function serializeDate(date) {
          return toISO.call(date);
        },
        skipNulls: false,
        strictNullHandling: false
      };
      var isNonNullishPrimitive = function isNonNullishPrimitive2(v) {
        return typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "symbol" || typeof v === "bigint";
      };
      var sentinel = {};
      var stringify = function stringify2(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel2) {
        var obj = object;
        var tmpSc = sideChannel2;
        var step = 0;
        var findFlag = false;
        while ((tmpSc = tmpSc.get(sentinel)) !== void 0 && !findFlag) {
          var pos = tmpSc.get(object);
          step += 1;
          if (typeof pos !== "undefined") {
            if (pos === step) {
              throw new RangeError("Cyclic object value");
            } else {
              findFlag = true;
            }
          }
          if (typeof tmpSc.get(sentinel) === "undefined") {
            step = 0;
          }
        }
        if (typeof filter === "function") {
          obj = filter(prefix, obj);
        } else if (obj instanceof Date) {
          obj = serializeDate(obj);
        } else if (generateArrayPrefix === "comma" && isArray2(obj)) {
          obj = utils2.maybeMap(obj, function(value2) {
            if (value2 instanceof Date) {
              return serializeDate(value2);
            }
            return value2;
          });
        }
        if (obj === null) {
          if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, "key", format) : prefix;
          }
          obj = "";
        }
        if (isNonNullishPrimitive(obj) || utils2.isBuffer(obj)) {
          if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, "key", format);
            return [formatter(keyValue) + "=" + formatter(encoder(obj, defaults.encoder, charset, "value", format))];
          }
          return [formatter(prefix) + "=" + formatter(String(obj))];
        }
        var values = [];
        if (typeof obj === "undefined") {
          return values;
        }
        var objKeys;
        if (generateArrayPrefix === "comma" && isArray2(obj)) {
          if (encodeValuesOnly && encoder) {
            obj = utils2.maybeMap(obj, encoder);
          }
          objKeys = [{ value: obj.length > 0 ? obj.join(",") || null : void 0 }];
        } else if (isArray2(filter)) {
          objKeys = filter;
        } else {
          var keys2 = Object.keys(obj);
          objKeys = sort ? keys2.sort(sort) : keys2;
        }
        var encodedPrefix = encodeDotInKeys ? String(prefix).replace(/\./g, "%2E") : String(prefix);
        var adjustedPrefix = commaRoundTrip && isArray2(obj) && obj.length === 1 ? encodedPrefix + "[]" : encodedPrefix;
        if (allowEmptyArrays && isArray2(obj) && obj.length === 0) {
          return adjustedPrefix + "[]";
        }
        for (var j = 0; j < objKeys.length; ++j) {
          var key = objKeys[j];
          var value = typeof key === "object" && key && typeof key.value !== "undefined" ? key.value : obj[key];
          if (skipNulls && value === null) {
            continue;
          }
          var encodedKey = allowDots && encodeDotInKeys ? String(key).replace(/\./g, "%2E") : String(key);
          var keyPrefix = isArray2(obj) ? typeof generateArrayPrefix === "function" ? generateArrayPrefix(adjustedPrefix, encodedKey) : adjustedPrefix : adjustedPrefix + (allowDots ? "." + encodedKey : "[" + encodedKey + "]");
          sideChannel2.set(object, step);
          var valueSideChannel = getSideChannel();
          valueSideChannel.set(sentinel, sideChannel2);
          pushToArray(values, stringify2(
            value,
            keyPrefix,
            generateArrayPrefix,
            commaRoundTrip,
            allowEmptyArrays,
            strictNullHandling,
            skipNulls,
            encodeDotInKeys,
            generateArrayPrefix === "comma" && encodeValuesOnly && isArray2(obj) ? null : encoder,
            filter,
            sort,
            allowDots,
            serializeDate,
            format,
            formatter,
            encodeValuesOnly,
            charset,
            valueSideChannel
          ));
        }
        return values;
      };
      var normalizeStringifyOptions = function normalizeStringifyOptions2(opts) {
        if (!opts) {
          return defaults;
        }
        if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
          throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
        }
        if (typeof opts.encodeDotInKeys !== "undefined" && typeof opts.encodeDotInKeys !== "boolean") {
          throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
        }
        if (opts.encoder !== null && typeof opts.encoder !== "undefined" && typeof opts.encoder !== "function") {
          throw new TypeError("Encoder has to be a function.");
        }
        var charset = opts.charset || defaults.charset;
        if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
          throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
        }
        var format = formats2["default"];
        if (typeof opts.format !== "undefined") {
          if (!has.call(formats2.formatters, opts.format)) {
            throw new TypeError("Unknown format option provided.");
          }
          format = opts.format;
        }
        var formatter = formats2.formatters[format];
        var filter = defaults.filter;
        if (typeof opts.filter === "function" || isArray2(opts.filter)) {
          filter = opts.filter;
        }
        var arrayFormat;
        if (opts.arrayFormat in arrayPrefixGenerators) {
          arrayFormat = opts.arrayFormat;
        } else if ("indices" in opts) {
          arrayFormat = opts.indices ? "indices" : "repeat";
        } else {
          arrayFormat = defaults.arrayFormat;
        }
        if ("commaRoundTrip" in opts && typeof opts.commaRoundTrip !== "boolean") {
          throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
        }
        var allowDots = typeof opts.allowDots === "undefined" ? opts.encodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
        return {
          addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults.addQueryPrefix,
          allowDots,
          allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
          arrayFormat,
          charset,
          charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
          commaRoundTrip: !!opts.commaRoundTrip,
          delimiter: typeof opts.delimiter === "undefined" ? defaults.delimiter : opts.delimiter,
          encode: typeof opts.encode === "boolean" ? opts.encode : defaults.encode,
          encodeDotInKeys: typeof opts.encodeDotInKeys === "boolean" ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
          encoder: typeof opts.encoder === "function" ? opts.encoder : defaults.encoder,
          encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
          filter,
          format,
          formatter,
          serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults.serializeDate,
          skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults.skipNulls,
          sort: typeof opts.sort === "function" ? opts.sort : null,
          strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
        };
      };
      stringify_1 = function(object, opts) {
        var obj = object;
        var options = normalizeStringifyOptions(opts);
        var objKeys;
        var filter;
        if (typeof options.filter === "function") {
          filter = options.filter;
          obj = filter("", obj);
        } else if (isArray2(options.filter)) {
          filter = options.filter;
          objKeys = filter;
        }
        var keys2 = [];
        if (typeof obj !== "object" || obj === null) {
          return "";
        }
        var generateArrayPrefix = arrayPrefixGenerators[options.arrayFormat];
        var commaRoundTrip = generateArrayPrefix === "comma" && options.commaRoundTrip;
        if (!objKeys) {
          objKeys = Object.keys(obj);
        }
        if (options.sort) {
          objKeys.sort(options.sort);
        }
        var sideChannel2 = getSideChannel();
        for (var i = 0; i < objKeys.length; ++i) {
          var key = objKeys[i];
          var value = obj[key];
          if (options.skipNulls && value === null) {
            continue;
          }
          pushToArray(keys2, stringify(
            value,
            key,
            generateArrayPrefix,
            commaRoundTrip,
            options.allowEmptyArrays,
            options.strictNullHandling,
            options.skipNulls,
            options.encodeDotInKeys,
            options.encode ? options.encoder : null,
            options.filter,
            options.sort,
            options.allowDots,
            options.serializeDate,
            options.format,
            options.formatter,
            options.encodeValuesOnly,
            options.charset,
            sideChannel2
          ));
        }
        var joined = keys2.join(options.delimiter);
        var prefix = options.addQueryPrefix === true ? "?" : "";
        if (options.charsetSentinel) {
          if (options.charset === "iso-8859-1") {
            prefix += "utf8=%26%2310003%3B&";
          } else {
            prefix += "utf8=%E2%9C%93&";
          }
        }
        return joined.length > 0 ? prefix + joined : "";
      };
      return stringify_1;
    }
    var parse;
    var hasRequiredParse;
    function requireParse() {
      if (hasRequiredParse) return parse;
      hasRequiredParse = 1;
      var utils2 = /* @__PURE__ */ requireUtils();
      var has = Object.prototype.hasOwnProperty;
      var isArray2 = Array.isArray;
      var defaults = {
        allowDots: false,
        allowEmptyArrays: false,
        allowPrototypes: false,
        allowSparse: false,
        arrayLimit: 20,
        charset: "utf-8",
        charsetSentinel: false,
        comma: false,
        decodeDotInKeys: false,
        decoder: utils2.decode,
        delimiter: "&",
        depth: 5,
        duplicates: "combine",
        ignoreQueryPrefix: false,
        interpretNumericEntities: false,
        parameterLimit: 1e3,
        parseArrays: true,
        plainObjects: false,
        strictDepth: false,
        strictNullHandling: false,
        throwOnLimitExceeded: false
      };
      var interpretNumericEntities = function(str) {
        return str.replace(/&#(\d+);/g, function($0, numberStr) {
          return String.fromCharCode(parseInt(numberStr, 10));
        });
      };
      var parseArrayValue = function(val, options, currentArrayLength) {
        if (val && typeof val === "string" && options.comma && val.indexOf(",") > -1) {
          return val.split(",");
        }
        if (options.throwOnLimitExceeded && currentArrayLength >= options.arrayLimit) {
          throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
        }
        return val;
      };
      var isoSentinel = "utf8=%26%2310003%3B";
      var charsetSentinel = "utf8=%E2%9C%93";
      var parseValues = function parseQueryStringValues(str, options) {
        var obj = { __proto__: null };
        var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, "") : str;
        cleanStr = cleanStr.replace(/%5B/gi, "[").replace(/%5D/gi, "]");
        var limit = options.parameterLimit === Infinity ? void 0 : options.parameterLimit;
        var parts = cleanStr.split(
          options.delimiter,
          options.throwOnLimitExceeded ? limit + 1 : limit
        );
        if (options.throwOnLimitExceeded && parts.length > limit) {
          throw new RangeError("Parameter limit exceeded. Only " + limit + " parameter" + (limit === 1 ? "" : "s") + " allowed.");
        }
        var skipIndex = -1;
        var i;
        var charset = options.charset;
        if (options.charsetSentinel) {
          for (i = 0; i < parts.length; ++i) {
            if (parts[i].indexOf("utf8=") === 0) {
              if (parts[i] === charsetSentinel) {
                charset = "utf-8";
              } else if (parts[i] === isoSentinel) {
                charset = "iso-8859-1";
              }
              skipIndex = i;
              i = parts.length;
            }
          }
        }
        for (i = 0; i < parts.length; ++i) {
          if (i === skipIndex) {
            continue;
          }
          var part = parts[i];
          var bracketEqualsPos = part.indexOf("]=");
          var pos = bracketEqualsPos === -1 ? part.indexOf("=") : bracketEqualsPos + 1;
          var key;
          var val;
          if (pos === -1) {
            key = options.decoder(part, defaults.decoder, charset, "key");
            val = options.strictNullHandling ? null : "";
          } else {
            key = options.decoder(part.slice(0, pos), defaults.decoder, charset, "key");
            val = utils2.maybeMap(
              parseArrayValue(
                part.slice(pos + 1),
                options,
                isArray2(obj[key]) ? obj[key].length : 0
              ),
              function(encodedVal) {
                return options.decoder(encodedVal, defaults.decoder, charset, "value");
              }
            );
          }
          if (val && options.interpretNumericEntities && charset === "iso-8859-1") {
            val = interpretNumericEntities(String(val));
          }
          if (part.indexOf("[]=") > -1) {
            val = isArray2(val) ? [val] : val;
          }
          var existing = has.call(obj, key);
          if (existing && options.duplicates === "combine") {
            obj[key] = utils2.combine(obj[key], val);
          } else if (!existing || options.duplicates === "last") {
            obj[key] = val;
          }
        }
        return obj;
      };
      var parseObject = function(chain, val, options, valuesParsed) {
        var currentArrayLength = 0;
        if (chain.length > 0 && chain[chain.length - 1] === "[]") {
          var parentKey = chain.slice(0, -1).join("");
          currentArrayLength = Array.isArray(val) && val[parentKey] ? val[parentKey].length : 0;
        }
        var leaf = valuesParsed ? val : parseArrayValue(val, options, currentArrayLength);
        for (var i = chain.length - 1; i >= 0; --i) {
          var obj;
          var root2 = chain[i];
          if (root2 === "[]" && options.parseArrays) {
            obj = options.allowEmptyArrays && (leaf === "" || options.strictNullHandling && leaf === null) ? [] : utils2.combine([], leaf);
          } else {
            obj = options.plainObjects ? { __proto__: null } : {};
            var cleanRoot = root2.charAt(0) === "[" && root2.charAt(root2.length - 1) === "]" ? root2.slice(1, -1) : root2;
            var decodedRoot = options.decodeDotInKeys ? cleanRoot.replace(/%2E/g, ".") : cleanRoot;
            var index = parseInt(decodedRoot, 10);
            if (!options.parseArrays && decodedRoot === "") {
              obj = { 0: leaf };
            } else if (!isNaN(index) && root2 !== decodedRoot && String(index) === decodedRoot && index >= 0 && (options.parseArrays && index <= options.arrayLimit)) {
              obj = [];
              obj[index] = leaf;
            } else if (decodedRoot !== "__proto__") {
              obj[decodedRoot] = leaf;
            }
          }
          leaf = obj;
        }
        return leaf;
      };
      var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
        if (!givenKey) {
          return;
        }
        var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, "[$1]") : givenKey;
        var brackets = /(\[[^[\]]*])/;
        var child = /(\[[^[\]]*])/g;
        var segment = options.depth > 0 && brackets.exec(key);
        var parent = segment ? key.slice(0, segment.index) : key;
        var keys2 = [];
        if (parent) {
          if (!options.plainObjects && has.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
              return;
            }
          }
          keys2.push(parent);
        }
        var i = 0;
        while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
          i += 1;
          if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
            if (!options.allowPrototypes) {
              return;
            }
          }
          keys2.push(segment[1]);
        }
        if (segment) {
          if (options.strictDepth === true) {
            throw new RangeError("Input depth exceeded depth option of " + options.depth + " and strictDepth is true");
          }
          keys2.push("[" + key.slice(segment.index) + "]");
        }
        return parseObject(keys2, val, options, valuesParsed);
      };
      var normalizeParseOptions = function normalizeParseOptions2(opts) {
        if (!opts) {
          return defaults;
        }
        if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
          throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
        }
        if (typeof opts.decodeDotInKeys !== "undefined" && typeof opts.decodeDotInKeys !== "boolean") {
          throw new TypeError("`decodeDotInKeys` option can only be `true` or `false`, when provided");
        }
        if (opts.decoder !== null && typeof opts.decoder !== "undefined" && typeof opts.decoder !== "function") {
          throw new TypeError("Decoder has to be a function.");
        }
        if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
          throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
        }
        if (typeof opts.throwOnLimitExceeded !== "undefined" && typeof opts.throwOnLimitExceeded !== "boolean") {
          throw new TypeError("`throwOnLimitExceeded` option must be a boolean");
        }
        var charset = typeof opts.charset === "undefined" ? defaults.charset : opts.charset;
        var duplicates = typeof opts.duplicates === "undefined" ? defaults.duplicates : opts.duplicates;
        if (duplicates !== "combine" && duplicates !== "first" && duplicates !== "last") {
          throw new TypeError("The duplicates option must be either combine, first, or last");
        }
        var allowDots = typeof opts.allowDots === "undefined" ? opts.decodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
        return {
          allowDots,
          allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
          allowPrototypes: typeof opts.allowPrototypes === "boolean" ? opts.allowPrototypes : defaults.allowPrototypes,
          allowSparse: typeof opts.allowSparse === "boolean" ? opts.allowSparse : defaults.allowSparse,
          arrayLimit: typeof opts.arrayLimit === "number" ? opts.arrayLimit : defaults.arrayLimit,
          charset,
          charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
          comma: typeof opts.comma === "boolean" ? opts.comma : defaults.comma,
          decodeDotInKeys: typeof opts.decodeDotInKeys === "boolean" ? opts.decodeDotInKeys : defaults.decodeDotInKeys,
          decoder: typeof opts.decoder === "function" ? opts.decoder : defaults.decoder,
          delimiter: typeof opts.delimiter === "string" || utils2.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
          // eslint-disable-next-line no-implicit-coercion, no-extra-parens
          depth: typeof opts.depth === "number" || opts.depth === false ? +opts.depth : defaults.depth,
          duplicates,
          ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
          interpretNumericEntities: typeof opts.interpretNumericEntities === "boolean" ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
          parameterLimit: typeof opts.parameterLimit === "number" ? opts.parameterLimit : defaults.parameterLimit,
          parseArrays: opts.parseArrays !== false,
          plainObjects: typeof opts.plainObjects === "boolean" ? opts.plainObjects : defaults.plainObjects,
          strictDepth: typeof opts.strictDepth === "boolean" ? !!opts.strictDepth : defaults.strictDepth,
          strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling,
          throwOnLimitExceeded: typeof opts.throwOnLimitExceeded === "boolean" ? opts.throwOnLimitExceeded : false
        };
      };
      parse = function(str, opts) {
        var options = normalizeParseOptions(opts);
        if (str === "" || str === null || typeof str === "undefined") {
          return options.plainObjects ? { __proto__: null } : {};
        }
        var tempObj = typeof str === "string" ? parseValues(str, options) : str;
        var obj = options.plainObjects ? { __proto__: null } : {};
        var keys2 = Object.keys(tempObj);
        for (var i = 0; i < keys2.length; ++i) {
          var key = keys2[i];
          var newObj = parseKeys(key, tempObj[key], options, typeof str === "string");
          obj = utils2.merge(obj, newObj, options);
        }
        if (options.allowSparse === true) {
          return obj;
        }
        return utils2.compact(obj);
      };
      return parse;
    }
    var lib;
    var hasRequiredLib;
    function requireLib() {
      if (hasRequiredLib) return lib;
      hasRequiredLib = 1;
      var stringify = /* @__PURE__ */ requireStringify();
      var parse2 = /* @__PURE__ */ requireParse();
      var formats2 = /* @__PURE__ */ requireFormats();
      lib = {
        formats: formats2,
        parse: parse2,
        stringify
      };
      return lib;
    }
    var libExports = /* @__PURE__ */ requireLib();
    function debounce(fn, delay) {
      let timeoutID;
      return function(...args) {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => fn.apply(this, args), delay);
      };
    }
    function fireEvent(name, options) {
      return document.dispatchEvent(new CustomEvent(`inertia:${name}`, options));
    }
    var fireBeforeEvent = (visit) => {
      return fireEvent("before", { cancelable: true, detail: { visit } });
    };
    var fireErrorEvent = (errors) => {
      return fireEvent("error", { detail: { errors } });
    };
    var fireExceptionEvent = (exception) => {
      return fireEvent("exception", { cancelable: true, detail: { exception } });
    };
    var fireFinishEvent = (visit) => {
      return fireEvent("finish", { detail: { visit } });
    };
    var fireInvalidEvent = (response) => {
      return fireEvent("invalid", { cancelable: true, detail: { response } });
    };
    var fireBeforeUpdateEvent = (page2) => {
      return fireEvent("beforeUpdate", { detail: { page: page2 } });
    };
    var fireNavigateEvent = (page2) => {
      return fireEvent("navigate", { detail: { page: page2 } });
    };
    var fireProgressEvent = (progress3) => {
      return fireEvent("progress", { detail: { progress: progress3 } });
    };
    var fireStartEvent = (visit) => {
      return fireEvent("start", { detail: { visit } });
    };
    var fireSuccessEvent = (page2) => {
      return fireEvent("success", { detail: { page: page2 } });
    };
    var firePrefetchedEvent = (response, visit) => {
      return fireEvent("prefetched", { detail: { fetchedAt: Date.now(), response: response.data, visit } });
    };
    var firePrefetchingEvent = (visit) => {
      return fireEvent("prefetching", { detail: { visit } });
    };
    var SessionStorage = class {
      static set(key, value) {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(key, JSON.stringify(value));
        }
      }
      static get(key) {
        if (typeof window !== "undefined") {
          return JSON.parse(window.sessionStorage.getItem(key) || "null");
        }
      }
      static merge(key, value) {
        const existing = this.get(key);
        if (existing === null) {
          this.set(key, value);
        } else {
          this.set(key, { ...existing, ...value });
        }
      }
      static remove(key) {
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(key);
        }
      }
      static removeNested(key, nestedKey) {
        const existing = this.get(key);
        if (existing !== null) {
          delete existing[nestedKey];
          this.set(key, existing);
        }
      }
      static exists(key) {
        try {
          return this.get(key) !== null;
        } catch (error) {
          return false;
        }
      }
      static clear() {
        if (typeof window !== "undefined") {
          window.sessionStorage.clear();
        }
      }
    };
    SessionStorage.locationVisitKey = "inertiaLocationVisit";
    var encryptHistory = async (data) => {
      if (typeof window === "undefined") {
        throw new Error("Unable to encrypt history");
      }
      const iv = getIv();
      const storedKey = await getKeyFromSessionStorage();
      const key = await getOrCreateKey(storedKey);
      if (!key) {
        throw new Error("Unable to encrypt history");
      }
      const encrypted = await encryptData(iv, key, data);
      return encrypted;
    };
    var historySessionStorageKeys = {
      key: "historyKey",
      iv: "historyIv"
    };
    var decryptHistory = async (data) => {
      const iv = getIv();
      const storedKey = await getKeyFromSessionStorage();
      if (!storedKey) {
        throw new Error("Unable to decrypt history");
      }
      return await decryptData(iv, storedKey, data);
    };
    var encryptData = async (iv, key, data) => {
      if (typeof window === "undefined") {
        throw new Error("Unable to encrypt history");
      }
      if (typeof window.crypto.subtle === "undefined") {
        console.warn("Encryption is not supported in this environment. SSL is required.");
        return Promise.resolve(data);
      }
      const textEncoder = new TextEncoder();
      const str = JSON.stringify(data);
      const encoded = new Uint8Array(str.length * 3);
      const result = textEncoder.encodeInto(str, encoded);
      return window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv
        },
        key,
        encoded.subarray(0, result.written)
      );
    };
    var decryptData = async (iv, key, data) => {
      if (typeof window.crypto.subtle === "undefined") {
        console.warn("Decryption is not supported in this environment. SSL is required.");
        return Promise.resolve(data);
      }
      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv
        },
        key,
        data
      );
      return JSON.parse(new TextDecoder().decode(decrypted));
    };
    var getIv = () => {
      const ivString = SessionStorage.get(historySessionStorageKeys.iv);
      if (ivString) {
        return new Uint8Array(ivString);
      }
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      SessionStorage.set(historySessionStorageKeys.iv, Array.from(iv));
      return iv;
    };
    var createKey = async () => {
      if (typeof window.crypto.subtle === "undefined") {
        console.warn("Encryption is not supported in this environment. SSL is required.");
        return Promise.resolve(null);
      }
      return window.crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256
        },
        true,
        ["encrypt", "decrypt"]
      );
    };
    var saveKey = async (key) => {
      if (typeof window.crypto.subtle === "undefined") {
        console.warn("Encryption is not supported in this environment. SSL is required.");
        return Promise.resolve();
      }
      const keyData = await window.crypto.subtle.exportKey("raw", key);
      SessionStorage.set(historySessionStorageKeys.key, Array.from(new Uint8Array(keyData)));
    };
    var getOrCreateKey = async (key) => {
      if (key) {
        return key;
      }
      const newKey = await createKey();
      if (!newKey) {
        return null;
      }
      await saveKey(newKey);
      return newKey;
    };
    var getKeyFromSessionStorage = async () => {
      const stringKey = SessionStorage.get(historySessionStorageKeys.key);
      if (!stringKey) {
        return null;
      }
      const key = await window.crypto.subtle.importKey(
        "raw",
        new Uint8Array(stringKey),
        {
          name: "AES-GCM",
          length: 256
        },
        true,
        ["encrypt", "decrypt"]
      );
      return key;
    };
    var Scroll = class {
      static save() {
        history.saveScrollPositions(
          Array.from(this.regions()).map((region) => ({
            top: region.scrollTop,
            left: region.scrollLeft
          }))
        );
      }
      static regions() {
        return document.querySelectorAll("[scroll-region]");
      }
      static reset() {
        const anchorHash = typeof window !== "undefined" ? window.location.hash : null;
        if (!anchorHash) {
          window.scrollTo(0, 0);
        }
        this.regions().forEach((region) => {
          if (typeof region.scrollTo === "function") {
            region.scrollTo(0, 0);
          } else {
            region.scrollTop = 0;
            region.scrollLeft = 0;
          }
        });
        this.save();
        if (anchorHash) {
          setTimeout(() => {
            const anchorElement = document.getElementById(anchorHash.slice(1));
            anchorElement ? anchorElement.scrollIntoView() : window.scrollTo(0, 0);
          });
        }
      }
      static restore(scrollRegions) {
        if (typeof window === "undefined") {
          return;
        }
        window.requestAnimationFrame(() => {
          this.restoreDocument();
          this.restoreScrollRegions(scrollRegions);
        });
      }
      static restoreScrollRegions(scrollRegions) {
        if (typeof window === "undefined") {
          return;
        }
        this.regions().forEach((region, index) => {
          const scrollPosition = scrollRegions[index];
          if (!scrollPosition) {
            return;
          }
          if (typeof region.scrollTo === "function") {
            region.scrollTo(scrollPosition.left, scrollPosition.top);
          } else {
            region.scrollTop = scrollPosition.top;
            region.scrollLeft = scrollPosition.left;
          }
        });
      }
      static restoreDocument() {
        const scrollPosition = history.getDocumentScrollPosition();
        window.scrollTo(scrollPosition.left, scrollPosition.top);
      }
      static onScroll(event) {
        const target = event.target;
        if (typeof target.hasAttribute === "function" && target.hasAttribute("scroll-region")) {
          this.save();
        }
      }
      static onWindowScroll() {
        history.saveDocumentScrollPosition({
          top: window.scrollY,
          left: window.scrollX
        });
      }
    };
    function hasFiles(data) {
      return data instanceof File || data instanceof Blob || data instanceof FileList && data.length > 0 || data instanceof FormData && Array.from(data.values()).some((value) => hasFiles(value)) || typeof data === "object" && data !== null && Object.values(data).some((value) => hasFiles(value));
    }
    var isFormData = (value) => value instanceof FormData;
    function objectToFormData(source, form = new FormData(), parentKey = null) {
      source = source || {};
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          append(form, composeKey(parentKey, key), source[key]);
        }
      }
      return form;
    }
    function composeKey(parent, key) {
      return parent ? parent + "[" + key + "]" : key;
    }
    function append(form, key, value) {
      if (Array.isArray(value)) {
        return Array.from(value.keys()).forEach((index) => append(form, composeKey(key, index.toString()), value[index]));
      } else if (value instanceof Date) {
        return form.append(key, value.toISOString());
      } else if (value instanceof File) {
        return form.append(key, value, value.name);
      } else if (value instanceof Blob) {
        return form.append(key, value);
      } else if (typeof value === "boolean") {
        return form.append(key, value ? "1" : "0");
      } else if (typeof value === "string") {
        return form.append(key, value);
      } else if (typeof value === "number") {
        return form.append(key, `${value}`);
      } else if (value === null || value === void 0) {
        return form.append(key, "");
      }
      objectToFormData(value, form, key);
    }
    function hrefToUrl(href) {
      return new URL(href.toString(), typeof window === "undefined" ? void 0 : window.location.toString());
    }
    var transformUrlAndData = (href, data, method, forceFormData, queryStringArrayFormat) => {
      let url = typeof href === "string" ? hrefToUrl(href) : href;
      if ((hasFiles(data) || forceFormData) && !isFormData(data)) {
        data = objectToFormData(data);
      }
      if (isFormData(data)) {
        return [url, data];
      }
      const [_href, _data] = mergeDataIntoQueryString(method, url, data, queryStringArrayFormat);
      return [hrefToUrl(_href), _data];
    };
    function mergeDataIntoQueryString(method, href, data, qsArrayFormat = "brackets") {
      const hasDataForQueryString = method === "get" && !isFormData(data) && Object.keys(data).length > 0;
      const hasHost = urlHasProtocol(href.toString());
      const hasAbsolutePath = hasHost || href.toString().startsWith("/") || href.toString() === "";
      const hasRelativePath = !hasAbsolutePath && !href.toString().startsWith("#") && !href.toString().startsWith("?");
      const hasRelativePathWithDotPrefix = /^[.]{1,2}([/]|$)/.test(href.toString());
      const hasSearch = href.toString().includes("?") || hasDataForQueryString;
      const hasHash = href.toString().includes("#");
      const url = new URL(href.toString(), typeof window === "undefined" ? "http://localhost" : window.location.toString());
      if (hasDataForQueryString) {
        const parseOptions = { ignoreQueryPrefix: true, parseArrays: false };
        url.search = libExports.stringify(
          { ...libExports.parse(url.search, parseOptions), ...data },
          {
            encodeValuesOnly: true,
            arrayFormat: qsArrayFormat
          }
        );
      }
      return [
        [
          hasHost ? `${url.protocol}//${url.host}` : "",
          hasAbsolutePath ? url.pathname : "",
          hasRelativePath ? url.pathname.substring(hasRelativePathWithDotPrefix ? 0 : 1) : "",
          hasSearch ? url.search : "",
          hasHash ? url.hash : ""
        ].join(""),
        hasDataForQueryString ? {} : data
      ];
    }
    function urlWithoutHash(url) {
      url = new URL(url.href);
      url.hash = "";
      return url;
    }
    var setHashIfSameUrl = (originUrl, destinationUrl) => {
      if (originUrl.hash && !destinationUrl.hash && urlWithoutHash(originUrl).href === destinationUrl.href) {
        destinationUrl.hash = originUrl.hash;
      }
    };
    var isSameUrlWithoutHash = (url1, url2) => {
      return urlWithoutHash(url1).href === urlWithoutHash(url2).href;
    };
    function isUrlMethodPair(href) {
      return href !== null && typeof href === "object" && href !== void 0 && "url" in href && "method" in href;
    }
    function urlHasProtocol(url) {
      return /^[a-z][a-z0-9+.-]*:\/\//i.test(url);
    }
    var CurrentPage = class {
      constructor() {
        this.componentId = {};
        this.listeners = [];
        this.isFirstPageLoad = true;
        this.cleared = false;
        this.pendingDeferredProps = null;
      }
      init({ initialPage, swapComponent, resolveComponent }) {
        this.page = initialPage;
        this.swapComponent = swapComponent;
        this.resolveComponent = resolveComponent;
        return this;
      }
      set(page2, {
        replace = false,
        preserveScroll = false,
        preserveState = false
      } = {}) {
        if (Object.keys(page2.deferredProps || {}).length) {
          this.pendingDeferredProps = {
            deferredProps: page2.deferredProps,
            component: page2.component,
            url: page2.url
          };
        }
        this.componentId = {};
        const componentId = this.componentId;
        if (page2.clearHistory) {
          history.clear();
        }
        return this.resolve(page2.component).then((component) => {
          if (componentId !== this.componentId) {
            return;
          }
          page2.rememberedState ?? (page2.rememberedState = {});
          const isServer2 = typeof window === "undefined";
          const location = !isServer2 ? window.location : new URL(page2.url);
          const scrollRegions = !isServer2 && preserveScroll ? history.getScrollRegions() : [];
          replace = replace || isSameUrlWithoutHash(hrefToUrl(page2.url), location);
          return new Promise((resolve) => {
            replace ? history.replaceState(page2, () => resolve(null)) : history.pushState(page2, () => resolve(null));
          }).then(() => {
            const isNewComponent = !this.isTheSame(page2);
            this.page = page2;
            this.cleared = false;
            if (isNewComponent) {
              this.fireEventsFor("newComponent");
            }
            if (this.isFirstPageLoad) {
              this.fireEventsFor("firstLoad");
            }
            this.isFirstPageLoad = false;
            return this.swap({ component, page: page2, preserveState }).then(() => {
              if (preserveScroll) {
                window.requestAnimationFrame(() => Scroll.restoreScrollRegions(scrollRegions));
              } else {
                Scroll.reset();
              }
              if (this.pendingDeferredProps && this.pendingDeferredProps.component === page2.component && this.pendingDeferredProps.url === page2.url) {
                eventHandler.fireInternalEvent("loadDeferredProps", this.pendingDeferredProps.deferredProps);
              }
              this.pendingDeferredProps = null;
              if (!replace) {
                fireNavigateEvent(page2);
              }
            });
          });
        });
      }
      setQuietly(page2, {
        preserveState = false
      } = {}) {
        return this.resolve(page2.component).then((component) => {
          this.page = page2;
          this.cleared = false;
          history.setCurrent(page2);
          return this.swap({ component, page: page2, preserveState });
        });
      }
      clear() {
        this.cleared = true;
      }
      isCleared() {
        return this.cleared;
      }
      get() {
        return this.page;
      }
      merge(data) {
        this.page = { ...this.page, ...data };
      }
      setUrlHash(hash) {
        if (!this.page.url.includes(hash)) {
          this.page.url += hash;
        }
      }
      remember(data) {
        this.page.rememberedState = data;
      }
      swap({
        component,
        page: page2,
        preserveState
      }) {
        return this.swapComponent({ component, page: page2, preserveState });
      }
      resolve(component) {
        return Promise.resolve(this.resolveComponent(component));
      }
      isTheSame(page2) {
        return this.page.component === page2.component;
      }
      on(event, callback) {
        this.listeners.push({ event, callback });
        return () => {
          this.listeners = this.listeners.filter((listener) => listener.event !== event && listener.callback !== callback);
        };
      }
      fireEventsFor(event) {
        this.listeners.filter((listener) => listener.event === event).forEach((listener) => listener.callback());
      }
    };
    var page = new CurrentPage();
    var Queue = class {
      constructor() {
        this.items = [];
        this.processingPromise = null;
      }
      add(item) {
        this.items.push(item);
        return this.process();
      }
      process() {
        this.processingPromise ?? (this.processingPromise = this.processNext().finally(() => {
          this.processingPromise = null;
        }));
        return this.processingPromise;
      }
      processNext() {
        const next = this.items.shift();
        if (next) {
          return Promise.resolve(next()).then(() => this.processNext());
        }
        return Promise.resolve();
      }
    };
    var isServer = typeof window === "undefined";
    var queue = new Queue();
    var isChromeIOS = !isServer && /CriOS/.test(window.navigator.userAgent);
    var History = class {
      constructor() {
        this.rememberedState = "rememberedState";
        this.scrollRegions = "scrollRegions";
        this.preserveUrl = false;
        this.current = {};
        this.initialState = null;
      }
      remember(data, key) {
        this.replaceState({
          ...page.get(),
          rememberedState: {
            ...page.get()?.rememberedState ?? {},
            [key]: data
          }
        });
      }
      restore(key) {
        if (!isServer) {
          return this.current[this.rememberedState] ? this.current[this.rememberedState]?.[key] : this.initialState?.[this.rememberedState]?.[key];
        }
      }
      pushState(page2, cb = null) {
        if (isServer) {
          return;
        }
        if (this.preserveUrl) {
          cb && cb();
          return;
        }
        this.current = page2;
        queue.add(() => {
          return this.getPageData(page2).then((data) => {
            const doPush = () => this.doPushState({ page: data }, page2.url).then(() => cb?.());
            if (isChromeIOS) {
              return new Promise((resolve) => {
                setTimeout(() => doPush().then(resolve));
              });
            }
            return doPush();
          });
        });
      }
      getPageData(page2) {
        return new Promise((resolve) => {
          return page2.encryptHistory ? encryptHistory(page2).then(resolve) : resolve(page2);
        });
      }
      processQueue() {
        return queue.process();
      }
      decrypt(page2 = null) {
        if (isServer) {
          return Promise.resolve(page2 ?? page.get());
        }
        const pageData = page2 ?? window.history.state?.page;
        return this.decryptPageData(pageData).then((data) => {
          if (!data) {
            throw new Error("Unable to decrypt history");
          }
          if (this.initialState === null) {
            this.initialState = data ?? void 0;
          } else {
            this.current = data ?? {};
          }
          return data;
        });
      }
      decryptPageData(pageData) {
        return pageData instanceof ArrayBuffer ? decryptHistory(pageData) : Promise.resolve(pageData);
      }
      saveScrollPositions(scrollRegions) {
        queue.add(() => {
          return Promise.resolve().then(() => {
            if (!window.history.state?.page) {
              return;
            }
            if (isEqual(this.getScrollRegions(), scrollRegions)) {
              return;
            }
            return this.doReplaceState({
              page: window.history.state.page,
              scrollRegions
            });
          });
        });
      }
      saveDocumentScrollPosition(scrollRegion) {
        queue.add(() => {
          return Promise.resolve().then(() => {
            if (!window.history.state?.page) {
              return;
            }
            if (isEqual(this.getDocumentScrollPosition(), scrollRegion)) {
              return;
            }
            return this.doReplaceState({
              page: window.history.state.page,
              documentScrollPosition: scrollRegion
            });
          });
        });
      }
      getScrollRegions() {
        return window.history.state?.scrollRegions || [];
      }
      getDocumentScrollPosition() {
        return window.history.state?.documentScrollPosition || { top: 0, left: 0 };
      }
      replaceState(page2, cb = null) {
        page.merge(page2);
        if (isServer) {
          return;
        }
        if (this.preserveUrl) {
          cb && cb();
          return;
        }
        this.current = page2;
        queue.add(() => {
          return this.getPageData(page2).then((data) => {
            const doReplace = () => this.doReplaceState({ page: data }, page2.url).then(() => cb?.());
            if (isChromeIOS) {
              return new Promise((resolve) => {
                setTimeout(() => doReplace().then(resolve));
              });
            }
            return doReplace();
          });
        });
      }
      doReplaceState(data, url) {
        return Promise.resolve().then(
          () => window.history.replaceState(
            {
              ...data,
              scrollRegions: data.scrollRegions ?? window.history.state?.scrollRegions,
              documentScrollPosition: data.documentScrollPosition ?? window.history.state?.documentScrollPosition
            },
            "",
            url
          )
        );
      }
      doPushState(data, url) {
        return Promise.resolve().then(() => window.history.pushState(data, "", url));
      }
      getState(key, defaultValue) {
        return this.current?.[key] ?? defaultValue;
      }
      deleteState(key) {
        if (this.current[key] !== void 0) {
          delete this.current[key];
          this.replaceState(this.current);
        }
      }
      clearInitialState(key) {
        if (this.initialState && this.initialState[key] !== void 0) {
          delete this.initialState[key];
        }
      }
      hasAnyState() {
        return !!this.getAllState();
      }
      clear() {
        SessionStorage.remove(historySessionStorageKeys.key);
        SessionStorage.remove(historySessionStorageKeys.iv);
      }
      setCurrent(page2) {
        this.current = page2;
      }
      isValidState(state) {
        return !!state.page;
      }
      getAllState() {
        return this.current;
      }
    };
    if (typeof window !== "undefined" && window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    var history = new History();
    var EventHandler = class {
      constructor() {
        this.internalListeners = [];
      }
      init() {
        if (typeof window !== "undefined") {
          window.addEventListener("popstate", this.handlePopstateEvent.bind(this));
          window.addEventListener("scroll", debounce(Scroll.onWindowScroll.bind(Scroll), 100), true);
        }
        if (typeof document !== "undefined") {
          document.addEventListener("scroll", debounce(Scroll.onScroll.bind(Scroll), 100), true);
        }
      }
      onGlobalEvent(type2, callback) {
        const listener = ((event) => {
          const response = callback(event);
          if (event.cancelable && !event.defaultPrevented && response === false) {
            event.preventDefault();
          }
        });
        return this.registerListener(`inertia:${type2}`, listener);
      }
      on(event, callback) {
        this.internalListeners.push({ event, listener: callback });
        return () => {
          this.internalListeners = this.internalListeners.filter((listener) => listener.listener !== callback);
        };
      }
      onMissingHistoryItem() {
        page.clear();
        this.fireInternalEvent("missingHistoryItem");
      }
      fireInternalEvent(event, ...args) {
        this.internalListeners.filter((listener) => listener.event === event).forEach((listener) => listener.listener(...args));
      }
      registerListener(type2, listener) {
        document.addEventListener(type2, listener);
        return () => document.removeEventListener(type2, listener);
      }
      handlePopstateEvent(event) {
        const state = event.state || null;
        if (state === null) {
          const url = hrefToUrl(page.get().url);
          url.hash = window.location.hash;
          history.replaceState({ ...page.get(), url: url.href });
          Scroll.reset();
          return;
        }
        if (!history.isValidState(state)) {
          return this.onMissingHistoryItem();
        }
        history.decrypt(state.page).then((data) => {
          if (page.get().version !== data.version) {
            this.onMissingHistoryItem();
            return;
          }
          router.cancelAll();
          page.setQuietly(data, { preserveState: false }).then(() => {
            Scroll.restore(history.getScrollRegions());
            fireNavigateEvent(page.get());
          });
        }).catch(() => {
          this.onMissingHistoryItem();
        });
      }
    };
    var eventHandler = new EventHandler();
    var NavigationType = class {
      constructor() {
        this.type = this.resolveType();
      }
      resolveType() {
        if (typeof window === "undefined") {
          return "navigate";
        }
        if (window.performance && window.performance.getEntriesByType && window.performance.getEntriesByType("navigation").length > 0) {
          return window.performance.getEntriesByType("navigation")[0].type;
        }
        return "navigate";
      }
      get() {
        return this.type;
      }
      isBackForward() {
        return this.type === "back_forward";
      }
      isReload() {
        return this.type === "reload";
      }
    };
    var navigationType = new NavigationType();
    var InitialVisit = class {
      static handle() {
        this.clearRememberedStateOnReload();
        const scenarios = [this.handleBackForward, this.handleLocation, this.handleDefault];
        scenarios.find((handler) => handler.bind(this)());
      }
      static clearRememberedStateOnReload() {
        if (navigationType.isReload()) {
          history.deleteState(history.rememberedState);
          history.clearInitialState(history.rememberedState);
        }
      }
      static handleBackForward() {
        if (!navigationType.isBackForward() || !history.hasAnyState()) {
          return false;
        }
        const scrollRegions = history.getScrollRegions();
        history.decrypt().then((data) => {
          page.set(data, { preserveScroll: true, preserveState: true }).then(() => {
            Scroll.restore(scrollRegions);
            fireNavigateEvent(page.get());
          });
        }).catch(() => {
          eventHandler.onMissingHistoryItem();
        });
        return true;
      }
      /**
       * @link https://inertiajs.com/redirects#external-redirects
       */
      static handleLocation() {
        if (!SessionStorage.exists(SessionStorage.locationVisitKey)) {
          return false;
        }
        const locationVisit = SessionStorage.get(SessionStorage.locationVisitKey) || {};
        SessionStorage.remove(SessionStorage.locationVisitKey);
        if (typeof window !== "undefined") {
          page.setUrlHash(window.location.hash);
        }
        history.decrypt(page.get()).then(() => {
          const rememberedState = history.getState(history.rememberedState, {});
          const scrollRegions = history.getScrollRegions();
          page.remember(rememberedState);
          page.set(page.get(), {
            preserveScroll: locationVisit.preserveScroll,
            preserveState: true
          }).then(() => {
            if (locationVisit.preserveScroll) {
              Scroll.restore(scrollRegions);
            }
            fireNavigateEvent(page.get());
          });
        }).catch(() => {
          eventHandler.onMissingHistoryItem();
        });
        return true;
      }
      static handleDefault() {
        if (typeof window !== "undefined") {
          page.setUrlHash(window.location.hash);
        }
        page.set(page.get(), { preserveScroll: true, preserveState: true }).then(() => {
          if (navigationType.isReload()) {
            Scroll.restore(history.getScrollRegions());
          }
          fireNavigateEvent(page.get());
        });
      }
    };
    var Poll = class {
      constructor(interval, cb, options) {
        this.id = null;
        this.throttle = false;
        this.keepAlive = false;
        this.cbCount = 0;
        this.keepAlive = options.keepAlive ?? false;
        this.cb = cb;
        this.interval = interval;
        if (options.autoStart ?? true) {
          this.start();
        }
      }
      stop() {
        if (this.id) {
          clearInterval(this.id);
        }
      }
      start() {
        if (typeof window === "undefined") {
          return;
        }
        this.stop();
        this.id = window.setInterval(() => {
          if (!this.throttle || this.cbCount % 10 === 0) {
            this.cb();
          }
          if (this.throttle) {
            this.cbCount++;
          }
        }, this.interval);
      }
      isInBackground(hidden) {
        this.throttle = this.keepAlive ? false : hidden;
        if (this.throttle) {
          this.cbCount = 0;
        }
      }
    };
    var Polls = class {
      constructor() {
        this.polls = [];
        this.setupVisibilityListener();
      }
      add(interval, cb, options) {
        const poll = new Poll(interval, cb, options);
        this.polls.push(poll);
        return {
          stop: () => poll.stop(),
          start: () => poll.start()
        };
      }
      clear() {
        this.polls.forEach((poll) => poll.stop());
        this.polls = [];
      }
      setupVisibilityListener() {
        if (typeof document === "undefined") {
          return;
        }
        document.addEventListener(
          "visibilitychange",
          () => {
            this.polls.forEach((poll) => poll.isInBackground(document.hidden));
          },
          false
        );
      }
    };
    var polls = new Polls();
    var objectsAreEqual = (obj1, obj2, excludeKeys) => {
      if (obj1 === obj2) {
        return true;
      }
      for (const key in obj1) {
        if (excludeKeys.includes(key)) {
          continue;
        }
        if (obj1[key] === obj2[key]) {
          continue;
        }
        if (!compareValues(obj1[key], obj2[key])) {
          return false;
        }
      }
      return true;
    };
    var compareValues = (value1, value2) => {
      switch (typeof value1) {
        case "object":
          return objectsAreEqual(value1, value2, []);
        case "function":
          return value1.toString() === value2.toString();
        default:
          return value1 === value2;
      }
    };
    var conversionMap = {
      ms: 1,
      s: 1e3,
      m: 1e3 * 60,
      h: 1e3 * 60 * 60,
      d: 1e3 * 60 * 60 * 24
    };
    var timeToMs = (time) => {
      if (typeof time === "number") {
        return time;
      }
      for (const [unit, conversion] of Object.entries(conversionMap)) {
        if (time.endsWith(unit)) {
          return parseFloat(time) * conversion;
        }
      }
      return parseInt(time);
    };
    var PrefetchedRequests = class {
      constructor() {
        this.cached = [];
        this.inFlightRequests = [];
        this.removalTimers = [];
        this.currentUseId = null;
      }
      add(params, sendFunc, { cacheFor, cacheTags }) {
        const inFlight = this.findInFlight(params);
        if (inFlight) {
          return Promise.resolve();
        }
        const existing = this.findCached(params);
        if (!params.fresh && existing && existing.staleTimestamp > Date.now()) {
          return Promise.resolve();
        }
        const [stale, expires] = this.extractStaleValues(cacheFor);
        const promise = new Promise((resolve, reject) => {
          sendFunc({
            ...params,
            onCancel: () => {
              this.remove(params);
              params.onCancel();
              reject();
            },
            onError: (error) => {
              this.remove(params);
              params.onError(error);
              reject();
            },
            onPrefetching(visitParams) {
              params.onPrefetching(visitParams);
            },
            onPrefetched(response, visit) {
              params.onPrefetched(response, visit);
            },
            onPrefetchResponse(response) {
              resolve(response);
            },
            onPrefetchError(error) {
              prefetchedRequests.removeFromInFlight(params);
              reject(error);
            }
          });
        }).then((response) => {
          this.remove(params);
          this.cached.push({
            params: { ...params },
            staleTimestamp: Date.now() + stale,
            response: promise,
            singleUse: expires === 0,
            timestamp: Date.now(),
            inFlight: false,
            tags: Array.isArray(cacheTags) ? cacheTags : [cacheTags]
          });
          this.scheduleForRemoval(params, expires);
          this.removeFromInFlight(params);
          response.handlePrefetch();
          return response;
        });
        this.inFlightRequests.push({
          params: { ...params },
          response: promise,
          staleTimestamp: null,
          inFlight: true
        });
        return promise;
      }
      removeAll() {
        this.cached = [];
        this.removalTimers.forEach((removalTimer) => {
          clearTimeout(removalTimer.timer);
        });
        this.removalTimers = [];
      }
      removeByTags(tags) {
        this.cached = this.cached.filter((prefetched) => {
          return !prefetched.tags.some((tag) => tags.includes(tag));
        });
      }
      remove(params) {
        this.cached = this.cached.filter((prefetched) => {
          return !this.paramsAreEqual(prefetched.params, params);
        });
        this.clearTimer(params);
      }
      removeFromInFlight(params) {
        this.inFlightRequests = this.inFlightRequests.filter((prefetching) => {
          return !this.paramsAreEqual(prefetching.params, params);
        });
      }
      extractStaleValues(cacheFor) {
        const [stale, expires] = this.cacheForToStaleAndExpires(cacheFor);
        return [timeToMs(stale), timeToMs(expires)];
      }
      cacheForToStaleAndExpires(cacheFor) {
        if (!Array.isArray(cacheFor)) {
          return [cacheFor, cacheFor];
        }
        switch (cacheFor.length) {
          case 0:
            return [0, 0];
          case 1:
            return [cacheFor[0], cacheFor[0]];
          default:
            return [cacheFor[0], cacheFor[1]];
        }
      }
      clearTimer(params) {
        const timer = this.removalTimers.find((removalTimer) => {
          return this.paramsAreEqual(removalTimer.params, params);
        });
        if (timer) {
          clearTimeout(timer.timer);
          this.removalTimers = this.removalTimers.filter((removalTimer) => removalTimer !== timer);
        }
      }
      scheduleForRemoval(params, expiresIn) {
        if (typeof window === "undefined") {
          return;
        }
        this.clearTimer(params);
        if (expiresIn > 0) {
          const timer = window.setTimeout(() => this.remove(params), expiresIn);
          this.removalTimers.push({
            params,
            timer
          });
        }
      }
      get(params) {
        return this.findCached(params) || this.findInFlight(params);
      }
      use(prefetched, params) {
        const id = `${params.url.pathname}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        this.currentUseId = id;
        return prefetched.response.then((response) => {
          if (this.currentUseId !== id) {
            return;
          }
          response.mergeParams({ ...params, onPrefetched: () => {
          } });
          this.removeSingleUseItems(params);
          return response.handle();
        });
      }
      removeSingleUseItems(params) {
        this.cached = this.cached.filter((prefetched) => {
          if (!this.paramsAreEqual(prefetched.params, params)) {
            return true;
          }
          return !prefetched.singleUse;
        });
      }
      findCached(params) {
        return this.cached.find((prefetched) => {
          return this.paramsAreEqual(prefetched.params, params);
        }) || null;
      }
      findInFlight(params) {
        return this.inFlightRequests.find((prefetched) => {
          return this.paramsAreEqual(prefetched.params, params);
        }) || null;
      }
      withoutPurposePrefetchHeader(params) {
        const newParams = cloneDeep(params);
        if (newParams.headers["Purpose"] === "prefetch") {
          delete newParams.headers["Purpose"];
        }
        return newParams;
      }
      paramsAreEqual(params1, params2) {
        return objectsAreEqual(
          this.withoutPurposePrefetchHeader(params1),
          this.withoutPurposePrefetchHeader(params2),
          [
            "showProgress",
            "replace",
            "prefetch",
            "onBefore",
            "onBeforeUpdate",
            "onStart",
            "onProgress",
            "onFinish",
            "onCancel",
            "onSuccess",
            "onError",
            "onPrefetched",
            "onCancelToken",
            "onPrefetching",
            "async"
          ]
        );
      }
    };
    var prefetchedRequests = new PrefetchedRequests();
    var RequestParams = class _RequestParams {
      constructor(params) {
        this.callbacks = [];
        if (!params.prefetch) {
          this.params = params;
        } else {
          const wrappedCallbacks = {
            onBefore: this.wrapCallback(params, "onBefore"),
            onBeforeUpdate: this.wrapCallback(params, "onBeforeUpdate"),
            onStart: this.wrapCallback(params, "onStart"),
            onProgress: this.wrapCallback(params, "onProgress"),
            onFinish: this.wrapCallback(params, "onFinish"),
            onCancel: this.wrapCallback(params, "onCancel"),
            onSuccess: this.wrapCallback(params, "onSuccess"),
            onError: this.wrapCallback(params, "onError"),
            onCancelToken: this.wrapCallback(params, "onCancelToken"),
            onPrefetched: this.wrapCallback(params, "onPrefetched"),
            onPrefetching: this.wrapCallback(params, "onPrefetching")
          };
          this.params = {
            ...params,
            ...wrappedCallbacks,
            onPrefetchResponse: params.onPrefetchResponse || (() => {
            }),
            onPrefetchError: params.onPrefetchError || (() => {
            })
          };
        }
      }
      static create(params) {
        return new _RequestParams(params);
      }
      data() {
        return this.params.method === "get" ? null : this.params.data;
      }
      queryParams() {
        return this.params.method === "get" ? this.params.data : {};
      }
      isPartial() {
        return this.params.only.length > 0 || this.params.except.length > 0 || this.params.reset.length > 0;
      }
      onCancelToken(cb) {
        this.params.onCancelToken({
          cancel: cb
        });
      }
      markAsFinished() {
        this.params.completed = true;
        this.params.cancelled = false;
        this.params.interrupted = false;
      }
      markAsCancelled({ cancelled = true, interrupted = false }) {
        this.params.onCancel();
        this.params.completed = false;
        this.params.cancelled = cancelled;
        this.params.interrupted = interrupted;
      }
      wasCancelledAtAll() {
        return this.params.cancelled || this.params.interrupted;
      }
      onFinish() {
        this.params.onFinish(this.params);
      }
      onStart() {
        this.params.onStart(this.params);
      }
      onPrefetching() {
        this.params.onPrefetching(this.params);
      }
      onPrefetchResponse(response) {
        if (this.params.onPrefetchResponse) {
          this.params.onPrefetchResponse(response);
        }
      }
      onPrefetchError(error) {
        if (this.params.onPrefetchError) {
          this.params.onPrefetchError(error);
        }
      }
      all() {
        return this.params;
      }
      headers() {
        const headers = {
          ...this.params.headers
        };
        if (this.isPartial()) {
          headers["X-Inertia-Partial-Component"] = page.get().component;
        }
        const only = this.params.only.concat(this.params.reset);
        if (only.length > 0) {
          headers["X-Inertia-Partial-Data"] = only.join(",");
        }
        if (this.params.except.length > 0) {
          headers["X-Inertia-Partial-Except"] = this.params.except.join(",");
        }
        if (this.params.reset.length > 0) {
          headers["X-Inertia-Reset"] = this.params.reset.join(",");
        }
        if (this.params.errorBag && this.params.errorBag.length > 0) {
          headers["X-Inertia-Error-Bag"] = this.params.errorBag;
        }
        return headers;
      }
      setPreserveOptions(page2) {
        this.params.preserveScroll = this.resolvePreserveOption(this.params.preserveScroll, page2);
        this.params.preserveState = this.resolvePreserveOption(this.params.preserveState, page2);
      }
      runCallbacks() {
        this.callbacks.forEach(({ name, args }) => {
          this.params[name](...args);
        });
      }
      merge(toMerge) {
        this.params = {
          ...this.params,
          ...toMerge
        };
      }
      wrapCallback(params, name) {
        return (...args) => {
          this.recordCallback(name, args);
          params[name](...args);
        };
      }
      recordCallback(name, args) {
        this.callbacks.push({ name, args });
      }
      resolvePreserveOption(value, page2) {
        if (typeof value === "function") {
          return value(page2);
        }
        if (value === "errors") {
          return Object.keys(page2.props.errors || {}).length > 0;
        }
        return value;
      }
    };
    var modal_default = {
      modal: null,
      listener: null,
      show(html) {
        if (typeof html === "object") {
          html = `All Inertia requests must receive a valid Inertia response, however a plain JSON response was received.<hr>${JSON.stringify(
            html
          )}`;
        }
        const page2 = document.createElement("html");
        page2.innerHTML = html;
        page2.querySelectorAll("a").forEach((a) => a.setAttribute("target", "_top"));
        this.modal = document.createElement("div");
        this.modal.style.position = "fixed";
        this.modal.style.width = "100vw";
        this.modal.style.height = "100vh";
        this.modal.style.padding = "50px";
        this.modal.style.boxSizing = "border-box";
        this.modal.style.backgroundColor = "rgba(0, 0, 0, .6)";
        this.modal.style.zIndex = 2e5;
        this.modal.addEventListener("click", () => this.hide());
        const iframe = document.createElement("iframe");
        iframe.style.backgroundColor = "white";
        iframe.style.borderRadius = "5px";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        this.modal.appendChild(iframe);
        document.body.prepend(this.modal);
        document.body.style.overflow = "hidden";
        if (!iframe.contentWindow) {
          throw new Error("iframe not yet ready.");
        }
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(page2.outerHTML);
        iframe.contentWindow.document.close();
        this.listener = this.hideOnEscape.bind(this);
        document.addEventListener("keydown", this.listener);
      },
      hide() {
        this.modal.outerHTML = "";
        this.modal = null;
        document.body.style.overflow = "visible";
        document.removeEventListener("keydown", this.listener);
      },
      hideOnEscape(event) {
        if (event.keyCode === 27) {
          this.hide();
        }
      }
    };
    var queue2 = new Queue();
    var Response = class _Response {
      constructor(requestParams, response, originatingPage) {
        this.requestParams = requestParams;
        this.response = response;
        this.originatingPage = originatingPage;
        this.wasPrefetched = false;
      }
      static create(params, response, originatingPage) {
        return new _Response(params, response, originatingPage);
      }
      async handlePrefetch() {
        if (isSameUrlWithoutHash(this.requestParams.all().url, window.location)) {
          this.handle();
        }
      }
      async handle() {
        return queue2.add(() => this.process());
      }
      async process() {
        if (this.requestParams.all().prefetch) {
          this.wasPrefetched = true;
          this.requestParams.all().prefetch = false;
          this.requestParams.all().onPrefetched(this.response, this.requestParams.all());
          firePrefetchedEvent(this.response, this.requestParams.all());
          return Promise.resolve();
        }
        this.requestParams.runCallbacks();
        if (!this.isInertiaResponse()) {
          return this.handleNonInertiaResponse();
        }
        await history.processQueue();
        history.preserveUrl = this.requestParams.all().preserveUrl;
        await this.setPage();
        const errors = page.get().props.errors || {};
        if (Object.keys(errors).length > 0) {
          const scopedErrors = this.getScopedErrors(errors);
          fireErrorEvent(scopedErrors);
          return this.requestParams.all().onError(scopedErrors);
        }
        router.flushByCacheTags(this.requestParams.all().invalidateCacheTags || []);
        if (!this.wasPrefetched) {
          router.flush(page.get().url);
        }
        fireSuccessEvent(page.get());
        await this.requestParams.all().onSuccess(page.get());
        history.preserveUrl = false;
      }
      mergeParams(params) {
        this.requestParams.merge(params);
      }
      async handleNonInertiaResponse() {
        if (this.isLocationVisit()) {
          const locationUrl = hrefToUrl(this.getHeader("x-inertia-location"));
          setHashIfSameUrl(this.requestParams.all().url, locationUrl);
          return this.locationVisit(locationUrl);
        }
        const response = {
          ...this.response,
          data: this.getDataFromResponse(this.response.data)
        };
        if (fireInvalidEvent(response)) {
          return modal_default.show(response.data);
        }
      }
      isInertiaResponse() {
        return this.hasHeader("x-inertia");
      }
      hasStatus(status2) {
        return this.response.status === status2;
      }
      getHeader(header) {
        return this.response.headers[header];
      }
      hasHeader(header) {
        return this.getHeader(header) !== void 0;
      }
      isLocationVisit() {
        return this.hasStatus(409) && this.hasHeader("x-inertia-location");
      }
      /**
       * @link https://inertiajs.com/redirects#external-redirects
       */
      locationVisit(url) {
        try {
          SessionStorage.set(SessionStorage.locationVisitKey, {
            preserveScroll: this.requestParams.all().preserveScroll === true
          });
          if (typeof window === "undefined") {
            return;
          }
          if (isSameUrlWithoutHash(window.location, url)) {
            window.location.reload();
          } else {
            window.location.href = url.href;
          }
        } catch (error) {
          return false;
        }
      }
      async setPage() {
        const pageResponse = this.getDataFromResponse(this.response.data);
        if (!this.shouldSetPage(pageResponse)) {
          return Promise.resolve();
        }
        this.mergeProps(pageResponse);
        await this.setRememberedState(pageResponse);
        this.requestParams.setPreserveOptions(pageResponse);
        pageResponse.url = history.preserveUrl ? page.get().url : this.pageUrl(pageResponse);
        this.requestParams.all().onBeforeUpdate(pageResponse);
        fireBeforeUpdateEvent(pageResponse);
        return page.set(pageResponse, {
          replace: this.requestParams.all().replace,
          preserveScroll: this.requestParams.all().preserveScroll,
          preserveState: this.requestParams.all().preserveState
        });
      }
      getDataFromResponse(response) {
        if (typeof response !== "string") {
          return response;
        }
        try {
          return JSON.parse(response);
        } catch (error) {
          return response;
        }
      }
      shouldSetPage(pageResponse) {
        if (!this.requestParams.all().async) {
          return true;
        }
        if (this.originatingPage.component !== pageResponse.component) {
          return true;
        }
        if (this.originatingPage.component !== page.get().component) {
          return false;
        }
        const originatingUrl = hrefToUrl(this.originatingPage.url);
        const currentPageUrl = hrefToUrl(page.get().url);
        return originatingUrl.origin === currentPageUrl.origin && originatingUrl.pathname === currentPageUrl.pathname;
      }
      pageUrl(pageResponse) {
        const responseUrl = hrefToUrl(pageResponse.url);
        setHashIfSameUrl(this.requestParams.all().url, responseUrl);
        return responseUrl.pathname + responseUrl.search + responseUrl.hash;
      }
      mergeProps(pageResponse) {
        if (!this.requestParams.isPartial() || pageResponse.component !== page.get().component) {
          return;
        }
        const propsToAppend = pageResponse.mergeProps || [];
        const propsToPrepend = pageResponse.prependProps || [];
        const propsToDeepMerge = pageResponse.deepMergeProps || [];
        const matchPropsOn = pageResponse.matchPropsOn || [];
        const mergeProp = (prop, shouldAppend) => {
          const currentProp = get$1(page.get().props, prop);
          const incomingProp = get$1(pageResponse.props, prop);
          if (Array.isArray(incomingProp)) {
            const newArray = this.mergeOrMatchItems(
              currentProp || [],
              incomingProp,
              prop,
              matchPropsOn,
              shouldAppend
            );
            set(pageResponse.props, prop, newArray);
          } else if (typeof incomingProp === "object" && incomingProp !== null) {
            const newObject = {
              ...currentProp || {},
              ...incomingProp
            };
            set(pageResponse.props, prop, newObject);
          }
        };
        propsToAppend.forEach((prop) => mergeProp(prop, true));
        propsToPrepend.forEach((prop) => mergeProp(prop, false));
        propsToDeepMerge.forEach((prop) => {
          const currentProp = page.get().props[prop];
          const incomingProp = pageResponse.props[prop];
          const deepMerge = (target, source, matchProp) => {
            if (Array.isArray(source)) {
              return this.mergeOrMatchItems(target, source, matchProp, matchPropsOn);
            }
            if (typeof source === "object" && source !== null) {
              return Object.keys(source).reduce(
                (acc, key) => {
                  acc[key] = deepMerge(target ? target[key] : void 0, source[key], `${matchProp}.${key}`);
                  return acc;
                },
                { ...target }
              );
            }
            return source;
          };
          pageResponse.props[prop] = deepMerge(currentProp, incomingProp, prop);
        });
        pageResponse.props = { ...page.get().props, ...pageResponse.props };
        if (page.get().scrollProps) {
          pageResponse.scrollProps = {
            ...page.get().scrollProps || {},
            ...pageResponse.scrollProps || {}
          };
        }
      }
      mergeOrMatchItems(existingItems, newItems, matchProp, matchPropsOn, shouldAppend = true) {
        const items = Array.isArray(existingItems) ? existingItems : [];
        const matchingKey = matchPropsOn.find((key) => {
          const keyPath = key.split(".").slice(0, -1).join(".");
          return keyPath === matchProp;
        });
        if (!matchingKey) {
          return shouldAppend ? [...items, ...newItems] : [...newItems, ...items];
        }
        const uniqueProperty = matchingKey.split(".").pop() || "";
        const newItemsMap = /* @__PURE__ */ new Map();
        newItems.forEach((item) => {
          if (this.hasUniqueProperty(item, uniqueProperty)) {
            newItemsMap.set(item[uniqueProperty], item);
          }
        });
        return shouldAppend ? this.appendWithMatching(items, newItems, newItemsMap, uniqueProperty) : this.prependWithMatching(items, newItems, newItemsMap, uniqueProperty);
      }
      appendWithMatching(existingItems, newItems, newItemsMap, uniqueProperty) {
        const updatedExisting = existingItems.map((item) => {
          if (this.hasUniqueProperty(item, uniqueProperty) && newItemsMap.has(item[uniqueProperty])) {
            return newItemsMap.get(item[uniqueProperty]);
          }
          return item;
        });
        const newItemsToAdd = newItems.filter((item) => {
          if (!this.hasUniqueProperty(item, uniqueProperty)) {
            return true;
          }
          return !existingItems.some(
            (existing) => this.hasUniqueProperty(existing, uniqueProperty) && existing[uniqueProperty] === item[uniqueProperty]
          );
        });
        return [...updatedExisting, ...newItemsToAdd];
      }
      prependWithMatching(existingItems, newItems, newItemsMap, uniqueProperty) {
        const untouchedExisting = existingItems.filter((item) => {
          if (this.hasUniqueProperty(item, uniqueProperty)) {
            return !newItemsMap.has(item[uniqueProperty]);
          }
          return true;
        });
        return [...newItems, ...untouchedExisting];
      }
      hasUniqueProperty(item, property) {
        return item && typeof item === "object" && property in item;
      }
      async setRememberedState(pageResponse) {
        const rememberedState = await history.getState(history.rememberedState, {});
        if (this.requestParams.all().preserveState && rememberedState && pageResponse.component === page.get().component) {
          pageResponse.rememberedState = rememberedState;
        }
      }
      getScopedErrors(errors) {
        if (!this.requestParams.all().errorBag) {
          return errors;
        }
        return errors[this.requestParams.all().errorBag || ""] || {};
      }
    };
    var Request = class _Request {
      constructor(params, page2) {
        this.page = page2;
        this.requestHasFinished = false;
        this.requestParams = RequestParams.create(params);
        this.cancelToken = new AbortController();
      }
      static create(params, page2) {
        return new _Request(params, page2);
      }
      async send() {
        this.requestParams.onCancelToken(() => this.cancel({ cancelled: true }));
        fireStartEvent(this.requestParams.all());
        this.requestParams.onStart();
        if (this.requestParams.all().prefetch) {
          this.requestParams.onPrefetching();
          firePrefetchingEvent(this.requestParams.all());
        }
        const originallyPrefetch = this.requestParams.all().prefetch;
        return axios({
          method: this.requestParams.all().method,
          url: urlWithoutHash(this.requestParams.all().url).href,
          data: this.requestParams.data(),
          params: this.requestParams.queryParams(),
          signal: this.cancelToken.signal,
          headers: this.getHeaders(),
          onUploadProgress: this.onProgress.bind(this),
          // Why text? This allows us to delay JSON.parse until we're ready to use the response,
          // helps with performance particularly on large responses + history encryption
          responseType: "text"
        }).then((response) => {
          this.response = Response.create(this.requestParams, response, this.page);
          return this.response.handle();
        }).catch((error) => {
          if (error?.response) {
            this.response = Response.create(this.requestParams, error.response, this.page);
            return this.response.handle();
          }
          return Promise.reject(error);
        }).catch((error) => {
          if (axios.isCancel(error)) {
            return;
          }
          if (fireExceptionEvent(error)) {
            if (originallyPrefetch) {
              this.requestParams.onPrefetchError(error);
            }
            return Promise.reject(error);
          }
        }).finally(() => {
          this.finish();
          if (originallyPrefetch && this.response) {
            this.requestParams.onPrefetchResponse(this.response);
          }
        });
      }
      finish() {
        if (this.requestParams.wasCancelledAtAll()) {
          return;
        }
        this.requestParams.markAsFinished();
        this.fireFinishEvents();
      }
      fireFinishEvents() {
        if (this.requestHasFinished) {
          return;
        }
        this.requestHasFinished = true;
        fireFinishEvent(this.requestParams.all());
        this.requestParams.onFinish();
      }
      cancel({ cancelled = false, interrupted = false }) {
        if (this.requestHasFinished) {
          return;
        }
        this.cancelToken.abort();
        this.requestParams.markAsCancelled({ cancelled, interrupted });
        this.fireFinishEvents();
      }
      onProgress(progress3) {
        if (this.requestParams.data() instanceof FormData) {
          progress3.percentage = progress3.progress ? Math.round(progress3.progress * 100) : 0;
          fireProgressEvent(progress3);
          this.requestParams.all().onProgress(progress3);
        }
      }
      getHeaders() {
        const headers = {
          ...this.requestParams.headers(),
          Accept: "text/html, application/xhtml+xml",
          "X-Requested-With": "XMLHttpRequest",
          "X-Inertia": true
        };
        if (page.get().version) {
          headers["X-Inertia-Version"] = page.get().version;
        }
        return headers;
      }
    };
    var RequestStream = class {
      constructor({ maxConcurrent, interruptible }) {
        this.requests = [];
        this.maxConcurrent = maxConcurrent;
        this.interruptible = interruptible;
      }
      send(request) {
        this.requests.push(request);
        request.send().then(() => {
          this.requests = this.requests.filter((r) => r !== request);
        });
      }
      interruptInFlight() {
        this.cancel({ interrupted: true }, false);
      }
      cancelInFlight() {
        this.cancel({ cancelled: true }, true);
      }
      cancel({ cancelled = false, interrupted = false } = {}, force) {
        if (!this.shouldCancel(force)) {
          return;
        }
        const request = this.requests.shift();
        request?.cancel({ interrupted, cancelled });
      }
      shouldCancel(force) {
        if (force) {
          return true;
        }
        return this.interruptible && this.requests.length >= this.maxConcurrent;
      }
    };
    var Router = class {
      constructor() {
        this.syncRequestStream = new RequestStream({
          maxConcurrent: 1,
          interruptible: true
        });
        this.asyncRequestStream = new RequestStream({
          maxConcurrent: Infinity,
          interruptible: false
        });
      }
      init({ initialPage, resolveComponent, swapComponent }) {
        page.init({
          initialPage,
          resolveComponent,
          swapComponent
        });
        InitialVisit.handle();
        eventHandler.init();
        eventHandler.on("missingHistoryItem", () => {
          if (typeof window !== "undefined") {
            this.visit(window.location.href, { preserveState: true, preserveScroll: true, replace: true });
          }
        });
        eventHandler.on("loadDeferredProps", (deferredProps) => {
          this.loadDeferredProps(deferredProps);
        });
      }
      get(url, data = {}, options = {}) {
        return this.visit(url, { ...options, method: "get", data });
      }
      post(url, data = {}, options = {}) {
        return this.visit(url, { preserveState: true, ...options, method: "post", data });
      }
      put(url, data = {}, options = {}) {
        return this.visit(url, { preserveState: true, ...options, method: "put", data });
      }
      patch(url, data = {}, options = {}) {
        return this.visit(url, { preserveState: true, ...options, method: "patch", data });
      }
      delete(url, options = {}) {
        return this.visit(url, { preserveState: true, ...options, method: "delete" });
      }
      reload(options = {}) {
        if (typeof window === "undefined") {
          return;
        }
        return this.visit(window.location.href, {
          ...options,
          preserveScroll: true,
          preserveState: true,
          async: true,
          headers: {
            ...options.headers || {},
            "Cache-Control": "no-cache"
          }
        });
      }
      remember(data, key = "default") {
        history.remember(data, key);
      }
      restore(key = "default") {
        return history.restore(key);
      }
      on(type2, callback) {
        if (typeof window === "undefined") {
          return () => {
          };
        }
        return eventHandler.onGlobalEvent(type2, callback);
      }
      cancel() {
        this.syncRequestStream.cancelInFlight();
      }
      cancelAll() {
        this.asyncRequestStream.cancelInFlight();
        this.syncRequestStream.cancelInFlight();
      }
      poll(interval, requestOptions = {}, options = {}) {
        return polls.add(interval, () => this.reload(requestOptions), {
          autoStart: options.autoStart ?? true,
          keepAlive: options.keepAlive ?? false
        });
      }
      visit(href, options = {}) {
        const visit = this.getPendingVisit(href, {
          ...options,
          showProgress: options.showProgress ?? !options.async
        });
        const events = this.getVisitEvents(options);
        if (events.onBefore(visit) === false || !fireBeforeEvent(visit)) {
          return;
        }
        const requestStream = visit.async ? this.asyncRequestStream : this.syncRequestStream;
        requestStream.interruptInFlight();
        if (!page.isCleared() && !visit.preserveUrl) {
          Scroll.save();
        }
        const requestParams = {
          ...visit,
          ...events
        };
        const prefetched = prefetchedRequests.get(requestParams);
        if (prefetched) {
          progress.reveal(prefetched.inFlight);
          prefetchedRequests.use(prefetched, requestParams);
        } else {
          progress.reveal(true);
          requestStream.send(Request.create(requestParams, page.get()));
        }
      }
      getCached(href, options = {}) {
        return prefetchedRequests.findCached(this.getPrefetchParams(href, options));
      }
      flush(href, options = {}) {
        prefetchedRequests.remove(this.getPrefetchParams(href, options));
      }
      flushAll() {
        prefetchedRequests.removeAll();
      }
      flushByCacheTags(tags) {
        prefetchedRequests.removeByTags(Array.isArray(tags) ? tags : [tags]);
      }
      getPrefetching(href, options = {}) {
        return prefetchedRequests.findInFlight(this.getPrefetchParams(href, options));
      }
      prefetch(href, options = {}, prefetchOptions = {}) {
        const method = options.method ?? (isUrlMethodPair(href) ? href.method : "get");
        if (method !== "get") {
          throw new Error("Prefetch requests must use the GET method");
        }
        const visit = this.getPendingVisit(href, {
          ...options,
          async: true,
          showProgress: false,
          prefetch: true
        });
        const visitUrl = visit.url.origin + visit.url.pathname + visit.url.search;
        const currentUrl = window.location.origin + window.location.pathname + window.location.search;
        if (visitUrl === currentUrl) {
          return;
        }
        const events = this.getVisitEvents(options);
        if (events.onBefore(visit) === false || !fireBeforeEvent(visit)) {
          return;
        }
        progress.hide();
        this.asyncRequestStream.interruptInFlight();
        const requestParams = {
          ...visit,
          ...events
        };
        const ensureCurrentPageIsSet = () => {
          return new Promise((resolve) => {
            const checkIfPageIsDefined = () => {
              if (page.get()) {
                resolve();
              } else {
                setTimeout(checkIfPageIsDefined, 50);
              }
            };
            checkIfPageIsDefined();
          });
        };
        ensureCurrentPageIsSet().then(() => {
          prefetchedRequests.add(
            requestParams,
            (params) => {
              this.asyncRequestStream.send(Request.create(params, page.get()));
            },
            {
              cacheFor: 3e4,
              cacheTags: [],
              ...prefetchOptions
            }
          );
        });
      }
      clearHistory() {
        history.clear();
      }
      decryptHistory() {
        return history.decrypt();
      }
      resolveComponent(component) {
        return page.resolve(component);
      }
      replace(params) {
        this.clientVisit(params, { replace: true });
      }
      replaceProp(name, value, options) {
        this.replace({
          preserveScroll: true,
          preserveState: true,
          props(currentProps) {
            const newValue = typeof value === "function" ? value(get$1(currentProps, name), currentProps) : value;
            return set(cloneDeep(currentProps), name, newValue);
          },
          ...options || {}
        });
      }
      appendToProp(name, value, options) {
        this.replaceProp(
          name,
          (currentValue, currentProps) => {
            const newValue = typeof value === "function" ? value(currentValue, currentProps) : value;
            if (!Array.isArray(currentValue)) {
              currentValue = currentValue !== void 0 ? [currentValue] : [];
            }
            return [...currentValue, newValue];
          },
          options
        );
      }
      prependToProp(name, value, options) {
        this.replaceProp(
          name,
          (currentValue, currentProps) => {
            const newValue = typeof value === "function" ? value(currentValue, currentProps) : value;
            if (!Array.isArray(currentValue)) {
              currentValue = currentValue !== void 0 ? [currentValue] : [];
            }
            return [newValue, ...currentValue];
          },
          options
        );
      }
      push(params) {
        this.clientVisit(params);
      }
      clientVisit(params, { replace = false } = {}) {
        const current = page.get();
        const props = typeof params.props === "function" ? params.props(current.props) : params.props ?? current.props;
        const { onError, onFinish, onSuccess, ...pageParams } = params;
        page.set(
          {
            ...current,
            ...pageParams,
            props
          },
          {
            replace,
            preserveScroll: params.preserveScroll,
            preserveState: params.preserveState
          }
        ).then(() => {
          const errors = page.get().props.errors || {};
          if (Object.keys(errors).length === 0) {
            return onSuccess?.(page.get());
          }
          const scopedErrors = params.errorBag ? errors[params.errorBag || ""] || {} : errors;
          return onError?.(scopedErrors);
        }).finally(() => onFinish?.(params));
      }
      getPrefetchParams(href, options) {
        return {
          ...this.getPendingVisit(href, {
            ...options,
            async: true,
            showProgress: false,
            prefetch: true
          }),
          ...this.getVisitEvents(options)
        };
      }
      getPendingVisit(href, options, pendingVisitOptions = {}) {
        if (isUrlMethodPair(href)) {
          const urlMethodPair = href;
          href = urlMethodPair.url;
          options.method = options.method ?? urlMethodPair.method;
        }
        const mergedOptions = {
          method: "get",
          data: {},
          replace: false,
          preserveScroll: false,
          preserveState: false,
          only: [],
          except: [],
          headers: {},
          errorBag: "",
          forceFormData: false,
          queryStringArrayFormat: "brackets",
          async: false,
          showProgress: true,
          fresh: false,
          reset: [],
          preserveUrl: false,
          prefetch: false,
          invalidateCacheTags: [],
          ...options
        };
        const [url, _data] = transformUrlAndData(
          href,
          mergedOptions.data,
          mergedOptions.method,
          mergedOptions.forceFormData,
          mergedOptions.queryStringArrayFormat
        );
        const visit = {
          cancelled: false,
          completed: false,
          interrupted: false,
          ...mergedOptions,
          ...pendingVisitOptions,
          url,
          data: _data
        };
        if (visit.prefetch) {
          visit.headers["Purpose"] = "prefetch";
        }
        return visit;
      }
      getVisitEvents(options) {
        return {
          onCancelToken: options.onCancelToken || (() => {
          }),
          onBefore: options.onBefore || (() => {
          }),
          onBeforeUpdate: options.onBeforeUpdate || (() => {
          }),
          onStart: options.onStart || (() => {
          }),
          onProgress: options.onProgress || (() => {
          }),
          onFinish: options.onFinish || (() => {
          }),
          onCancel: options.onCancel || (() => {
          }),
          onSuccess: options.onSuccess || (() => {
          }),
          onError: options.onError || (() => {
          }),
          onPrefetched: options.onPrefetched || (() => {
          }),
          onPrefetching: options.onPrefetching || (() => {
          })
        };
      }
      loadDeferredProps(deferred) {
        if (deferred) {
          Object.entries(deferred).forEach(([_, group]) => {
            this.reload({ only: group });
          });
        }
      }
    };
    var baseComponentSelector = "nprogress";
    var progress2;
    var settings = {
      minimum: 0.08,
      easing: "linear",
      positionUsing: "translate3d",
      speed: 200,
      trickle: true,
      trickleSpeed: 200,
      showSpinner: true,
      barSelector: '[role="bar"]',
      spinnerSelector: '[role="spinner"]',
      parent: "body",
      color: "#29d",
      includeCSS: true,
      template: [
        '<div class="bar" role="bar">',
        '<div class="peg"></div>',
        "</div>",
        '<div class="spinner" role="spinner">',
        '<div class="spinner-icon"></div>',
        "</div>"
      ].join("")
    };
    var status = null;
    var configure = (options) => {
      Object.assign(settings, options);
      if (settings.includeCSS) {
        injectCSS(settings.color);
      }
      progress2 = document.createElement("div");
      progress2.id = baseComponentSelector;
      progress2.innerHTML = settings.template;
    };
    var set4 = (n) => {
      const started = isStarted();
      n = clamp(n, settings.minimum, 1);
      status = n === 1 ? null : n;
      const progress3 = render(!started);
      const bar = progress3.querySelector(settings.barSelector);
      const speed = settings.speed;
      const ease = settings.easing;
      progress3.offsetWidth;
      queue4((next) => {
        const barStyles = (() => {
          if (settings.positionUsing === "translate3d") {
            return {
              transition: `all ${speed}ms ${ease}`,
              transform: `translate3d(${toBarPercentage(n)}%,0,0)`
            };
          }
          if (settings.positionUsing === "translate") {
            return {
              transition: `all ${speed}ms ${ease}`,
              transform: `translate(${toBarPercentage(n)}%,0)`
            };
          }
          return { marginLeft: `${toBarPercentage(n)}%` };
        })();
        for (const key in barStyles) {
          bar.style[key] = barStyles[key];
        }
        if (n !== 1) {
          return setTimeout(next, speed);
        }
        progress3.style.transition = "none";
        progress3.style.opacity = "1";
        progress3.offsetWidth;
        setTimeout(() => {
          progress3.style.transition = `all ${speed}ms linear`;
          progress3.style.opacity = "0";
          setTimeout(() => {
            remove();
            progress3.style.transition = "";
            progress3.style.opacity = "";
            next();
          }, speed);
        }, speed);
      });
    };
    var isStarted = () => typeof status === "number";
    var start = () => {
      if (!status) {
        set4(0);
      }
      const work = function() {
        setTimeout(function() {
          if (!status) {
            return;
          }
          increaseByRandom();
          work();
        }, settings.trickleSpeed);
      };
      if (settings.trickle) {
        work();
      }
    };
    var done = (force) => {
      if (!force && !status) {
        return;
      }
      increaseByRandom(0.3 + 0.5 * Math.random());
      set4(1);
    };
    var increaseByRandom = (amount) => {
      const n = status;
      if (n === null) {
        return start();
      }
      if (n > 1) {
        return;
      }
      amount = typeof amount === "number" ? amount : (() => {
        const ranges = {
          0.1: [0, 0.2],
          0.04: [0.2, 0.5],
          0.02: [0.5, 0.8],
          5e-3: [0.8, 0.99]
        };
        for (const r in ranges) {
          if (n >= ranges[r][0] && n < ranges[r][1]) {
            return parseFloat(r);
          }
        }
        return 0;
      })();
      return set4(clamp(n + amount, 0, 0.994));
    };
    var render = (fromStart) => {
      if (isRendered()) {
        return document.getElementById(baseComponentSelector);
      }
      document.documentElement.classList.add(`${baseComponentSelector}-busy`);
      const bar = progress2.querySelector(settings.barSelector);
      const perc = fromStart ? "-100" : toBarPercentage(status || 0);
      const parent = getParent();
      bar.style.transition = "all 0 linear";
      bar.style.transform = `translate3d(${perc}%,0,0)`;
      if (!settings.showSpinner) {
        progress2.querySelector(settings.spinnerSelector)?.remove();
      }
      if (parent !== document.body) {
        parent.classList.add(`${baseComponentSelector}-custom-parent`);
      }
      parent.appendChild(progress2);
      return progress2;
    };
    var getParent = () => {
      return isDOM(settings.parent) ? settings.parent : document.querySelector(settings.parent);
    };
    var remove = () => {
      document.documentElement.classList.remove(`${baseComponentSelector}-busy`);
      getParent().classList.remove(`${baseComponentSelector}-custom-parent`);
      progress2?.remove();
    };
    var isRendered = () => {
      return document.getElementById(baseComponentSelector) !== null;
    };
    var isDOM = (obj) => {
      if (typeof HTMLElement === "object") {
        return obj instanceof HTMLElement;
      }
      return obj && typeof obj === "object" && obj.nodeType === 1 && typeof obj.nodeName === "string";
    };
    function clamp(n, min2, max2) {
      if (n < min2) {
        return min2;
      }
      if (n > max2) {
        return max2;
      }
      return n;
    }
    var toBarPercentage = (n) => (-1 + n) * 100;
    var queue4 = /* @__PURE__ */ (() => {
      const pending = [];
      const next = () => {
        const fn = pending.shift();
        if (fn) {
          fn(next);
        }
      };
      return (fn) => {
        pending.push(fn);
        if (pending.length === 1) {
          next();
        }
      };
    })();
    var injectCSS = (color) => {
      const element = document.createElement("style");
      element.textContent = `
    #${baseComponentSelector} {
      pointer-events: none;
    }

    #${baseComponentSelector} .bar {
      background: ${color};

      position: fixed;
      z-index: 1031;
      top: 0;
      left: 0;

      width: 100%;
      height: 2px;
    }

    #${baseComponentSelector} .peg {
      display: block;
      position: absolute;
      right: 0px;
      width: 100px;
      height: 100%;
      box-shadow: 0 0 10px ${color}, 0 0 5px ${color};
      opacity: 1.0;

      transform: rotate(3deg) translate(0px, -4px);
    }

    #${baseComponentSelector} .spinner {
      display: block;
      position: fixed;
      z-index: 1031;
      top: 15px;
      right: 15px;
    }

    #${baseComponentSelector} .spinner-icon {
      width: 18px;
      height: 18px;
      box-sizing: border-box;

      border: solid 2px transparent;
      border-top-color: ${color};
      border-left-color: ${color};
      border-radius: 50%;

      animation: ${baseComponentSelector}-spinner 400ms linear infinite;
    }

    .${baseComponentSelector}-custom-parent {
      overflow: hidden;
      position: relative;
    }

    .${baseComponentSelector}-custom-parent #${baseComponentSelector} .spinner,
    .${baseComponentSelector}-custom-parent #${baseComponentSelector} .bar {
      position: absolute;
    }

    @keyframes ${baseComponentSelector}-spinner {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
      document.head.appendChild(element);
    };
    var show = () => {
      if (progress2) {
        progress2.style.display = "";
      }
    };
    var hide = () => {
      if (progress2) {
        progress2.style.display = "none";
      }
    };
    var progress_component_default = {
      configure,
      isStarted,
      done,
      set: set4,
      remove,
      start,
      status,
      show,
      hide
    };
    var Progress = class {
      constructor() {
        this.hideCount = 0;
      }
      start() {
        progress_component_default.start();
      }
      reveal(force = false) {
        this.hideCount = Math.max(0, this.hideCount - 1);
        if (force || this.hideCount === 0) {
          progress_component_default.show();
        }
      }
      hide() {
        this.hideCount++;
        progress_component_default.hide();
      }
      set(status2) {
        progress_component_default.set(Math.max(0, Math.min(1, status2)));
      }
      finish() {
        progress_component_default.done();
      }
      reset() {
        progress_component_default.set(0);
      }
      remove() {
        progress_component_default.done();
        progress_component_default.remove();
      }
      isStarted() {
        return progress_component_default.isStarted();
      }
      getStatus() {
        return progress_component_default.status;
      }
    };
    var progress = new Progress();
    progress.reveal;
    progress.hide;
    function addEventListeners(delay) {
      document.addEventListener("inertia:start", (e) => handleStartEvent(e, delay));
      document.addEventListener("inertia:progress", handleProgressEvent);
    }
    function handleStartEvent(event, delay) {
      if (!event.detail.visit.showProgress) {
        progress.hide();
      }
      const timeout = setTimeout(() => progress.start(), delay);
      document.addEventListener("inertia:finish", (e) => finish(e, timeout), { once: true });
    }
    function handleProgressEvent(event) {
      if (progress.isStarted() && event.detail.progress?.percentage) {
        progress.set(Math.max(progress.getStatus(), event.detail.progress.percentage / 100 * 0.9));
      }
    }
    function finish(event, timeout) {
      clearTimeout(timeout);
      if (!progress.isStarted()) {
        return;
      }
      if (event.detail.visit.completed) {
        progress.finish();
      } else if (event.detail.visit.interrupted) {
        progress.reset();
      } else if (event.detail.visit.cancelled) {
        progress.remove();
      }
    }
    function setupProgress({
      delay = 250,
      color = "#29d",
      includeCSS = true,
      showSpinner = false
    } = {}) {
      addEventListeners(delay);
      progress_component_default.configure({ showSpinner, includeCSS, color });
    }
    var router = new Router();
    /* NProgress, (c) 2013, 2014 Rico Sta. Cruz - http://ricostacruz.com/nprogress
     * @license MIT */
    const h = (component, propsOrChildren, childrenOrKey, key = null) => {
      const hasProps = typeof propsOrChildren === "object" && propsOrChildren !== null && !Array.isArray(propsOrChildren);
      return {
        component,
        key: hasProps ? key : typeof childrenOrKey === "number" ? childrenOrKey : null,
        props: hasProps ? propsOrChildren : {},
        children: hasProps ? Array.isArray(childrenOrKey) ? childrenOrKey : childrenOrKey !== null ? [childrenOrKey] : [] : Array.isArray(propsOrChildren) ? propsOrChildren : propsOrChildren !== null ? [propsOrChildren] : []
      };
    };
    function Render($$payload, $$props) {
      push();
      let component = $$props["component"];
      let props = fallback($$props["props"], () => ({}), true);
      let children = fallback($$props["children"], () => [], true);
      let key = fallback($$props["key"], null);
      if (component) {
        $$payload.out += "<!--[-->";
        $$payload.out += `<!---->`;
        {
          if (children.length > 0) {
            $$payload.out += "<!--[-->";
            $$payload.out += `<!---->`;
            component?.($$payload, spread_props([
              props,
              {
                children: ($$payload2) => {
                  const each_array = ensure_array_like(children);
                  $$payload2.out += `<!--[-->`;
                  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                    let child = each_array[$$index];
                    Render($$payload2, spread_props([child]));
                    $$payload2.out += `<!---->`;
                  }
                  $$payload2.out += `<!--]-->`;
                },
                $$slots: { default: true }
              }
            ]));
            $$payload.out += `<!---->`;
          } else {
            $$payload.out += "<!--[!-->";
            $$payload.out += `<!---->`;
            component?.($$payload, spread_props([props]));
            $$payload.out += `<!---->`;
          }
          $$payload.out += `<!--]-->`;
        }
        $$payload.out += `<!---->`;
      } else {
        $$payload.out += "<!--[!-->";
      }
      $$payload.out += `<!--]-->`;
      bind_props($$props, { component, props, children, key });
      pop();
    }
    function App($$payload, $$props) {
      push();
      let initialComponent = $$props["initialComponent"];
      let initialPage = $$props["initialPage"];
      let resolveComponent = $$props["resolveComponent"];
      let component = initialComponent;
      let key = null;
      let page2 = initialPage;
      let renderProps = resolveRenderProps(component, page2, key);
      const isServer2 = typeof window === "undefined";
      if (!isServer2) {
        router.init({
          initialPage,
          resolveComponent,
          swapComponent: async (args) => {
            component = args.component;
            page2 = args.page;
            key = args.preserveState ? key : Date.now();
            renderProps = resolveRenderProps(component, page2, key);
          }
        });
      }
      function resolveRenderProps(component2, page22, key2 = null) {
        const child = h(component2.default, page22.props, [], key2);
        const layout = component2.layout;
        return layout ? resolveLayout(layout, child, page22.props, key2) : child;
      }
      function resolveLayout(layout, child, pageProps, key2) {
        if (isLayoutFunction(layout)) {
          return layout(h, child);
        }
        if (Array.isArray(layout)) {
          return layout.slice().reverse().reduce((currentRender, layoutComponent) => h(layoutComponent, pageProps, [currentRender], key2), child);
        }
        return h(layout, pageProps, child ? [child] : [], key2);
      }
      function isLayoutFunction(layout) {
        return typeof layout === "function" && layout.length === 2 && typeof layout.prototype === "undefined";
      }
      Render($$payload, spread_props([renderProps]));
      bind_props($$props, {
        initialComponent,
        initialPage,
        resolveComponent
      });
      pop();
    }
    async function createInertiaApp({ id = "app", resolve, setup, progress: progress3 = {}, page: page2 }) {
      const isServer2 = typeof window === "undefined";
      const el = isServer2 ? null : document.getElementById(id);
      const initialPage = page2 || JSON.parse(el?.dataset.page || "{}");
      const resolveComponent = (name) => Promise.resolve(resolve(name));
      const [initialComponent] = await Promise.all([
        resolveComponent(initialPage.component),
        router.decryptHistory().catch(() => {
        })
      ]);
      const props = { initialPage, initialComponent, resolveComponent };
      const svelteApp = setup({
        el,
        App,
        props
      });
      if (isServer2) {
        const { html, head: head2, css } = svelteApp;
        return {
          body: `<div data-server-rendered="true" id="${id}" data-page="${escape$1(JSON.stringify(initialPage))}">${html}</div>`,
          head: [head2, css ? `<style data-vite-css>${css.code}</style>` : ""]
        };
      }
      if (progress3) {
        setupProgress(progress3);
      }
    }
    function Layout($$payload, $$props) {
      push();
      let { children } = $$props;
      $$payload.out += `<main><header><a href="/">Home</a> <a href="/about">About</a> <a href="/contact">Contact</a></header> <article>`;
      children($$payload);
      $$payload.out += `<!----></article></main>`;
      pop();
    }
    function Welcome($$payload, $$props) {
      push();
      let { user } = $$props;
      head($$payload, ($$payload2) => {
        $$payload2.title = `<title>Welcome</title>`;
      });
      Layout($$payload, {
        children: ($$payload2) => {
          $$payload2.out += `<h1>Welcome</h1> <p>Hello ${escape_html(user.name)}, welcome to your first Inertia app!</p>`;
        }
      });
      pop();
    }
    const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: Welcome
    }, Symbol.toStringTag, { value: "Module" }));
    var readableToString = (readable) => new Promise((resolve, reject) => {
      let data = "";
      readable.on("data", (chunk) => data += chunk);
      readable.on("end", () => resolve(data));
      readable.on("error", (err) => reject(err));
    });
    var server_default = (render2, options) => {
      const _port = typeof options === "number" ? options : options?.port ?? 13714;
      const _useCluster = typeof options === "object" && options?.cluster !== void 0 ? options.cluster : false;
      const log = (message) => {
        console.log(
          _useCluster && !cluster.isPrimary ? `[${cluster.worker?.id ?? "N/A"} / ${cluster.worker?.process?.pid ?? "N/A"}] ${message}` : message
        );
      };
      if (_useCluster && cluster.isPrimary) {
        log("Primary Inertia SSR server process started...");
        for (let i = 0; i < availableParallelism(); i++) {
          cluster.fork();
        }
        return;
      }
      const routes = {
        "/health": async () => ({ status: "OK", timestamp: Date.now() }),
        "/shutdown": () => process.exit(),
        "/render": async (request) => render2(JSON.parse(await readableToString(request))),
        "/404": async () => ({ status: "NOT_FOUND", timestamp: Date.now() })
      };
      createServer(async (request, response) => {
        const dispatchRoute = routes[request.url] || routes["/404"];
        try {
          response.writeHead(200, { "Content-Type": "application/json", Server: "Inertia.js SSR" });
          response.write(JSON.stringify(await dispatchRoute(request)));
        } catch (e) {
          console.error(e);
        }
        response.end();
      }).listen(_port, () => log("Inertia SSR server started."));
      log(`Starting SSR server on port ${_port}...`);
    };
    server_default(
      (page2) => createInertiaApp({
        page: page2,
        resolve: (name) => {
          const pages = /* @__PURE__ */ Object.assign({ "./Pages/welcome.svelte": __vite_glob_0_0 });
          return pages[`./Pages/${name}.svelte`];
        },
        setup({ App: App2, props }) {
          return render$1(App2, { props });
        }
      }),
      { cluster: true }
    );
  }
});
export default require_ssr();
