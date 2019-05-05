/* eslint-disable no-nested-ternary */
/* eslint-disable class-methods-use-this */
// node .\index.js https://www.zone-turf.fr/programmes/demain/ zt_programmes.conf > .\programmes.json
// node .\index.js https://www.zone-turf.fr/cheval/edene-l-auvergnier-609196/ zt_cheval.conf -v > .\cheval.html
const process = require('process');
const https = require('https');
const { JSDOM } = require('jsdom');

const url = process.argv[2];
const pname = process.argv[3];
const verbose = process.argv[4] === '-v';

// eslint-disable-next-line import/no-dynamic-require
// const config = require(`./${parser}`);

// const url = 'https://www.zone-turf.fr/programmes/demain/';

let $ = null;

function cb_error(cbtype, err) {
    console.error(`error executing ${cbtype} callback at ${err.stack}`);
}
class Parser {
    constructor(pconf, html) {
        this.result = {};
        this.props = {};
        this.stack = [];
        const root = new JSDOM(html);
        // eslint-disable-next-line global-require
        $ = require('jquery')(root.window);
        global.$ = $;
        // eslint-disable-next-line global-require,import/no-dynamic-require
        this.conf = (typeof pconf === 'string') ? require(`./${pconf}`) : pconf;
        this.dom = root.window.document;
    }

    static parse(pconf, html) {
        const parser = new Parser(pconf, html);
        parser.browse();
        if (verbose) console.log(JSON.stringify(parser.result, null, 4));
        return parser.result;
    }

    set(dom, index, conf) {
        this.stack.push([this.dom, this.idx, this.conf]);
        [this.dom, this.idx, this.conf] = [dom, index, conf];
    }

    restore() {
        [this.dom, this.idx, this.conf] = this.stack.pop();
    }

    /**
     * function to browse & collect data from a dom element
     * @param {*} dom  dom to browse  & collect
     * @param {*} conf browse configuration
     * @param {*} result collected data
     * @param {} this.props collected properties
     */

    browse(dom = this.dom, conf = this.conf, index = 0) {
        if (verbose) console.log(`current props = ${JSON.stringify(this.props)}`);

        this.set(dom, index, conf);

        if (conf.begin && conf.begin instanceof Function) {
            // ---- begin call back
            try { conf.begin(this); } catch (e) { cb_error('begin', e); }
        }

        // ---- select elements for this conf )
        const elements = (typeof conf.selector === 'string') ? $(dom).find(conf.selector)
            : (typeof conf.selector === 'function') ? $(dom).find(conf.selector(this)) : $(dom);

        if (verbose) console.log('-------- SELECTOR \'%s\' for property %s found %d elements for following HTML -----------------  \n%s', conf.selector, conf.property ? conf.property : '<none>', elements.length, dom.outerHTML ? dom.outerHTML : dom.innerHTML);

        elements.each((i, ijsdom) => {
            this.set(ijsdom, i, conf);
            let match = !conf.filter;
            if (conf.filter && conf.filter instanceof Function) {
                // ---- filter call back
                try { match = conf.filter($(ijsdom), i, this); } catch (e) { cb_error('filter', e); }
            }
            if (match) {
                if (conf.property) {
                    this.props[conf.property] = $(ijsdom);
                    if (conf.value && conf.value instanceof Function) {
                        // ---- value call back
                        try { this.props[conf.property] = conf.value($(dom), this); } catch (e) { cb_error('value', e); }
                    } else if (conf.default) {
                        // defaulty value provided
                        this.props[conf.property] = conf.default;
                    } else {
                        // no  callback value default to jq.text()
                        this.props[conf.property] = $(ijsdom).text();
                    }
                }

                if (conf.children && Array.isArray(conf.children)) {


                    conf.children.forEach((iconf) => {
                        const oldconf = this.conf;
                        this.conf = iconf;
                        this.browse(ijsdom, iconf);
                        this.conf = oldconf;
                    });
                }
            }
            this.restore();
        });
        if (conf.end && conf.end instanceof Function) {
            // ---- end call back
            try { conf.end(this); } catch (e) { cb_error('end', e); }
        }
        this.restore();
    }
}

https.get(url, (resp) => {
    resp.setEncoding('binary');
    const chunks = [];

    resp.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk, 'binary'));
    });
    resp.on('end', () => {
        const binary = Buffer.concat(chunks);
        const utf8 = binary.toString('utf8');
        const clean = utf8.replace('é', 'e');
        Parser.parse(pname, clean);
    });
    resp.on('error', (err) => {
        console.error(`Error: ${err.message}`);
    });
});
