module.exports = {

    cp(ink = null, outk = []) {
        return (obj) => {
            const keys = ink || Object.keys(obj);
            return keys.filter(k => !k.startsWith('_')).reduce((p, k) => {
                if (!outk.includes(k)) p[k] = obj[k];
                return p;
            }, {});
        };
    },

    int(i = 0, l = 1000) {
        return e => parseInt(e.text().substr(i, l).replace(/\D+/g, ''), 10);
    },

    text(i = 0, l = 1e10) {
        return e => e.text().substr(i, l).trim();
    },

    attr(name, i = 0, l = 1e10) {
        return e => e.attr(name).substr(i, l).trim();
    },

    contains(val, i = 0, l = 1e10) {
        return e => e.text().substr(i, l).includes(val);
    },

    item(sep = /,/, rank, i = 0, l = 1e10) {
        return t => t.text().trim().split(sep)[rank].trim().substr(i, l).trim();
    },
};
