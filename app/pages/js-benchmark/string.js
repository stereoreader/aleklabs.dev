Object.defineConfigurableProperty = function (obj, name, desc) {
    Object.defineProperty(obj, name, { ...desc, configurable: true });
}

ReadableStream.prototype[Symbol.asyncIterator] = async function* () {
    const reader = this.getReader()
    try {
        while (true) {
            const { done, value } = await reader.read()
            if (done) return
            yield value
        }
    }
    finally {
        reader.releaseLock()
    }
};

{
    const compressor = type => async str => {

        const stream = new Blob([str]).stream();
        const compressedStream = stream.pipeThrough(new CompressionStream(type));
        const chunks = [];
        for await (const chunk of compressedStream) {
            chunks.push(chunk);
        }
        return await concatUint8Arrays(chunks);
    };

    const compressors = {
        gzip: compressor('gzip'),
        base64: bufferToBase64,
        uri: encodeURIComponent
    }

    String.prototype.compress = async function (types = 'gzip') {
        let out = this;
        for (const type of types.words) {
            out = await compressors[type](out);
        }
        return out;
    };

    async function concatUint8Arrays(uint8arrays) {
        const blob = new Blob(uint8arrays);
        const buffer = await blob.arrayBuffer();
        return new Uint8Array(buffer);
    }

    async function bufferToBase64(buffer) {
        const base64url = await new Promise(r => {
            const reader = new FileReader()
            reader.onload = () => r(reader.result)
            reader.readAsDataURL(new Blob([buffer]))
        });
        return base64url.slice(base64url.indexOf(',') + 1);
    };

    const decompressor = type => async compressedBytes => {
        const stream = new Blob([compressedBytes]).stream();

        const decompressedStream = stream.pipeThrough(new DecompressionStream(type));

        const chunks = [];
        for await (const chunk of decompressedStream) {
            chunks.push(chunk);
        }
        const stringBytes = await concatUint8Arrays(chunks);

        return new TextDecoder().decode(stringBytes);
    };

    const decompressors = {
        gzip: decompressor('gzip'),
        base64: base64ToArrayBuffer,
        uri: decodeURIComponent
    };

    String.prototype.decompress = async function (types) {
        let out = this;
        for (const type of types.words) {
            out = await decompressors[type](out);
        }
        return out;
    };

    function base64ToArrayBuffer(base64) {
        var binaryString = atob(base64);
        var bytes = new Uint8Array(binaryString.length);
        for (var i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

}

String.random = function (length) {
    return Array.from({ length }, () => String.fromCharCode(97 + Math.random() * 20 | 0)).join('');
};

String.prototype.cast = function () {

    if (!isNaN(this)) {
        return parseFloat(this);
    }

    if (this === 'true') {
        return true;
    }

    if (this === 'false') {
        return false;
    }

    if (this === 'undefined') {
        return undefined;
    }

    if (this === 'null') {
        return null;
    }

    return this;

}

String.prototype.interpolate = function () {

    const args = [].copy(arguments);

    return this.replaceAll(/%[%d]?/mg, m => {
        if (!args.length) {
            return m;
        }
        if (m === '%d' || typeof m === 'number') {
            return parseInt(args.shift());
        }
        if (m === '%f' || typeof m === 'number') {
            return parseFloat(args.shift()).toFixed(3);
        }
        if (m === '%%') {
            return args.shift();
        }
        return '"' + args.shift() + '"';

    });

}

{
    const regexp = new RegExp('[-._](.)', 'g');
    String.prototype.camelize = function () {
        return this.replace(regexp, function (match, group1) {
            return group1.toUpperCase();
        });
    };
}
{
    const regexp = new RegExp('[A-Z]', 'g');
    String.prototype.kebabize = function () {
        return this.replace(regexp, function (m) {
            return '-' + m.toLowerCase();
        }).replace('_', '-');
    };
}

String.prototype.slugify = function () {
    return this.trim()
        .replace(/[\s\W_]+/g, '-')  // remove invalid chars
        .replace(/-+/g, '-');       // collapse dashes
};

String.prototype.flags = function (transform = val => val.camelize()) {

    var out = {};

    for (const f of this.words) {
        out[transform(f)] = true;
    }

    return out;
};

{
    const exp = /\s*\n\s*/mg;

    Object.defineConfigurableProperty(String.prototype, 'lines', {
        get() {
            return this.trim().split(exp) || [];
        }
    });

}

Object.defineConfigurableProperty(String.prototype, 'capitalized', {
    get() {
        return this[0].toUpperCase() + this.slice(1);
    }
});

String.prototype.wordTree = function (delim = '()') {

    const BLOCK_START = delim[0];
    const BLOCK_END = delim[1];//, QUOTE = "'", DQUOTE = '"', COMMENT = '/', MCOMMENT = '*', ESCAPE = '\\';
    const WHITE_SPACE = ' ';
    const src = this
        .trim()
        .replace(new RegExp('\\s*[' + delim + ']\\s*', 'mg'), m => m.trim())
        .replace(/\s+/mg, ' ');

    let word = '';
    let idx = 0;

    const out = {};

    parse(out);

    return out;

    function next(c) {
        for (const scope of [WHITE_SPACE, BLOCK_START, BLOCK_END]) {
            if (scope === c) {
                return scope;
            }
        }
    }

    function parse(node) {

        while (src[idx] !== undefined) {

            const c = src[idx++];

            if (c === BLOCK_START) {

                const child = node[word] = {};
                word = '';
                parse(child);

            } else if (c === BLOCK_END) {
                return word && parseWord();

            } else if (c === WHITE_SPACE) {
                parseWord();
            } else {
                word += c;
            }

        }
        word && parseWord();

        function parseWord() {

            let [name, val] = word.split(':');

            if (val !== undefined) {

                if (!isNaN(parseFloat(val))) {
                    val = parseFloat(val);
                } else if (val === 'true') {
                    val = true;
                } else if (val === 'false') {
                    val = false;
                } else if (val === 'null') {
                    val = null;
                }

            } else {
                val = true;
            }

            node[name] = val;
            word = '';

        }

    }

};

{

    const exp = /\S+/mg;

    Object.defineProperties(String.prototype, {
        words: {
            configurable: true,
            get() {
                return this.match(exp) || [];
            }
        },
        set: {
            configurable: true,
            get() {
                return new Set(this.match(exp) || []);
            }
        }
    });

}


{

    Object.defineConfigurableProperty(String.prototype, 'quotedWords', {

        get() {

            const source = this.words;

            const words = [];
            let word = '';

            for (let i = 0, len = source.length; i < len; i++) {

                let chunk = source[i];

                if (word) {
                    if (chunk[chunk.length - 1] === '\'') {
                        word += ' ' + chunk.slice(0, chunk.length - 1);
                        words.push(word);
                        word = '';
                        continue;
                    }
                    word += chunk;
                    continue;
                }

                if (chunk[0] === '\'') {
                    word = chunk.slice(1);
                    continue;
                }

                words.push(chunk);

            }

            return words;

        }
    });
}


{
    const exp = /.{1}/mg;

    Object.defineConfigurableProperty(String.prototype, 'chars', {
        get() {
            return this.match(exp) || [];
        }
    });
}

{
    const exp = /.$/mg;

    Object.defineConfigurableProperty(String.prototype, 'lastChar', {
        get() {
            return this.match(exp)?.[0] || '';
        }
    });
}

String.prototype.cutEnd = function (len) {
    return this.slice(0, this.length - len);
}


String.prototype.reverse = function () {
    var out = '';
    for (var i = this.length - 1; i >= 0; i--) {
        out += this[i];
    }
    return out;
};

String.prototype.capitalize = function () {
    return this[0].toUpperCase() + this.slice(1);
};

String.prototype.hashCode = function () {
    let hash = 0;
    for (let i = 0, l = this.length; i < l; i++) {
        hash = ((hash << 5) - hash) + this.charCodeAt(i);
        hash |= 0;
    }
    return hash;
};

{
    const compares = {};
    const defaultLocale = globalThis.navigator?.languages?.[0] || 'en';

    String.prototype.localeCompare = function (str, locale = defaultLocale) {
        const compare = (compares[locale] ?? new Intl.Collator(locale).compare);
        return compare(this, str);
    };
}
