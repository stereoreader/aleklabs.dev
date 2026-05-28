JSON.clone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
};

Object.getRootPrototypeOf = function (obj) {
    let root = obj;
    let out = null;
    while ((root = Object.getPrototypeOf(root)) && root.constructor.name !== 'Object') out = root;
    return out;
}

Object.injectPrototype = function (obj, prototype) {
    const parent = Object.getPrototypeOf(obj);
    const root = Object.getRootPrototypeOf(prototype);
    Object.setPrototypeOf(obj, prototype);
    Object.setPrototypeOf(root, parent);
    return obj;
}

Object.defineLazyPrototypeProperty = function (target, name, getter, options = null) {
    return Object.defineProperty(target.prototype, name, {
        get() {
            try {
                const val = getter.call(this);
                Object.defineProperty(this, name, Object.assign({ value: val, configurable: true, enumerable: true }, options));
                return val;
            } catch (e) {
                if ('initLazyValue' in e) {
                    return e.initLazyValue;
                }
                throw e;
            }
        },
        configurable: true
    });
};

Object.defineLazyPrototypeProperties = function (target, getters) {
    for (const name in getters) {
        Object.defineLazyPrototypeProperty(target, name, getters[name]);
    }
    return target;
};

// chatGPT
// @todo: support any number of sources
Object.deepCopy = function (obj, obj2 = null) {

    const jsonString = JSON.stringify(obj2 || obj);

    const result = JSON.parse(jsonString, (key, value) => {
        if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
            return new Date(value);
        } else {
            return value;
        }
    });

    if (obj2) {
        Object.sync(obj, result)
    }

    return result;
}

//todo: make deep sync
Object.sync = function (dst, src) {
    Object.clear(dst);
    Object.assign(dst, src);
    return dst;
}

// Objects

{
    const _values = Object.values;

    Object.values = function (obj, props) {

        if (arguments.length < 2) {
            return _values.call(Object, obj);
        }

        const out = [];

        props = props.set;

        for (const k in obj) {
            if (props.has(k) && Object.hasOwn(obj, k)) {
                out.push(obj[k]);
            }
        }

        return out;
    };
}

{
    const accessors = {};

    Object.get = function (obj, path) {

        let accessor = accessors[path];

        if (!accessor) {
            let del = path[0] === '[' ? '' : '.';
            try {
                accessors[path] = accessor = new Function('obj', 'try{return obj' + del + path + '}catch(e){return undefined}');
            } catch (e) {
                accessors[path] = accessor = () => e.message;
            }
        }

        return accessor(obj);

    };
}

Object.toUrlParams = function (obj) {
    let str = [];
    for (let p in obj) {
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(getVal(obj[p])));
        }
    }
    return str.join('&');

    function getVal(v) {
        if (v instanceof Date) {
            return JSON.stringify(v).replace(/"/g, '');
        }
        return v;
    }
};

Object.set = function (obj, path, value) {

    let keys = path.split(/\.|\]\.|\[/g);
    let key;

    while (key = keys.shift()) {

        if (!keys.length) {
            obj[key] = value;
            break;
        }
        if (!is_.obj(obj[key])) {
            if (is_.num(keys[0])) {
                obj[key] = [];
            } else {
                obj[key] = {};
            }
        }

        obj = obj[key];
    }

    return obj;

};

Object.hasAllProperties = function (obj, props) {
    return props.words.intersect(Object.keys(obj)).length == props.length;
};

Object.appendMethod = function (obj, prop, func) {

    if (is_.obj(prop)) {
        for (let name in prop) {
            Object.appendMethod(obj, name, prop[name]);
        }
        return obj;
    }

    if (!obj[prop]) {
        obj[prop] = func;
        return obj;
    }

    obj[prop] = function (...args) {
        obj[prop](...args);
        func(...args);
    };
};

Object.defineProperty(Object.prototype, 'each', {
    enumerable: false,
    writable: true,
    value: function (cb) {

        var i = 0;

        for (var k in this) {
            if (false === cb(k, this[k], i++)) {
                break;
            }
        }
    },
});

/*Object.defineProperty(Object.prototype, 'extend', {
    enumerable: false,
    writable: true,
    value: function(obj, props, flags) {
        return Object.extend(this, obj, props, flags);
    },
});*/

Object.ensureProperty = function (obj, name, value) {

    if (!obj.hasOwnProperty(name)) {
        Object.defineProperty(obj, name, {
            writable: true,
            value: value,
        });
    }

    return obj[name];
};

Object.map = function (obj, cb) {

    var out = [];

    for (var k in obj) {

        out.push(cb(k, obj[k]));

    }

    return out;
};

Object.flatten = function (obj) {

    var out = {};

    for (var n in obj) {

        var prop = obj[n];

        if (typeof prop == 'object') {

            var val = Object.flatten(prop);

            for (var k in val) {
                out[n + '.' + k] = val[k];
            }

        } else if (is_.arr(prop)) {
            for (var i = 0, len = prop.length; i < len; i++) {
                out[n + '.' + i] = prop[i];
            }
        } else {
            out[n] = obj[n];
        }
    }

    return out;
};

Object.remove = function (obj, value) {
    for (const k in obj) {
        if (obj[k] === value) {
            delete obj[k];
        }
    }
    return obj;
}

Object.removeNulls = function (obj) {

    var out = {};

    for (var k in obj) {
        if (obj[k] === null || obj[k] === undefined) {
            continue;
        }

        out[k] = obj[k];
    }

    return out;
};

Object.copy = function (obj, props, flags) {

    var out = {};

    if (!props) {
        for (var k in obj) {
            out[k] = obj[k];
        }
        return out;
    }

    if (is_.str(props) && props[0] == '!') {
        var not = props.substring(1).words;
        for (var k in obj) {
            if (not.contains(k)) {
                continue;
            }
            out[k] = obj[k];
        }
        return out;
    }

    for (const prop of props.words) {
        if (obj.hasOwnProperty(prop)) {
            if (flags != 'no-false') {
                out[prop] = obj[prop];
            } else if (obj[prop]) {
                out[prop] = obj[prop];
            }
        }
    }

    return out;
};

Object.extend = function (dst, src, props, flags) {

    var src = Object.copy(src, props, flags);
    for (var k in src) {
        dst[k] = src[k];
    }

    return dst;
};

Object.clear = function (obj, props = null) {

    if (!props) {
        for (const k in obj) {
            delete obj[k];
        }
        return this;
    }

    if (typeof props === 'function') {
        for (const k in obj) {
            if (props(k, obj[k])) {
                delete obj[k];
            }
        }
        return this;
    }

    const negative = props[0] === '!';
    if (negative) {
        const set = new Set(props.slice(1).words);
        for (const k in obj) {
            set.has(k) || delete obj[k];
        }
        return this;
    }
    for (const k in props.words) {
        delete obj[k];
    }
    return this;
};

Object.splice = function (obj, props) {

    var out = {};

    if (!props) {
        Object.keys(obj).each(function (prop) {
            out[prop] = obj[prop];
            delete obj[prop];
        });

        return out;
    }

    props.eachWord(function (prop) {
        if (obj.hasOwnProperty(prop)) {
            out[prop] = obj[prop];
            delete obj[prop];
        }
    });

    return out;
};

Object.isIterable = function (obj) {
    return obj instanceof Object;
};

Object.iterator = function (obj) {
    if (Array.isArray(obj)) {
        //return obj.map((v, k) => [v, k]);
        return (function* () {
            for (let i = 0; i < obj.length; i++) {
                yield [obj[i], i];
            }
        })();
    }
    if (obj instanceof Object) {
        //return Object.entries(obj).map(([k, v]) => [v, k]);
        return (function* () {
            for (const k in obj) {
                yield [obj[k], k];
            }
        })();
    }
};

Object.mapWalk = function (obj, cb, mapTo = null) {

    const out = [];

    try {
        debugger;
        for (const [item, idx] of Object.iterator(obj)) {
            if (Object.isIterable(item)) {
                Object.mapWalk(item, cb, mapTo || out);
                continue;
            }
            (mapTo || out).tail = cb(item, idx, obj);
        }

    } catch (e) {
        debugger;
    }

    return out;

};

Object.walk = function (obj, cb, path = []) {

    for (const [item, idx] of Object.iterator(obj)) {

        if (Object.isIterable(item)) {
            if (false === Object.walk(item, cb, path.concat(idx))) {
                return false;
            }
            continue;
        } else {

            if (false === cb(item, idx, obj, path.slice())) {
                return false;
            }
        }
    }
};
