/* eslint-disable no-template-curly-in-string */
/* eslint-disable no-underscore-dangle */
const _ = require('./utils');

const selector = null;

function music(mtext) {
    const tmusic = (typeof mtext === 'string' ? mtext : mtext.text()).split(/\s+/);
    const res = {};
    let year = (new Date()).getFullYear();
    res[year] = [];
    tmusic.forEach((val) => {
        if (/\(\d+\)/.test(val)) {
            year = parseInt(`20${val.substr(1, 2)}`, 10);
            res[year] = [];
        } else {
            res[year].push(val);
        }
    });
    return res;
}

module.exports = {
    begin: (p) => { p.result = []; }, // intitialise result ...
    selector: '.bloc.data.course',
    children: [{
        selector: '.nomCourse.title', // race title
        children: [
            { selector, property: 'meeting', value: _.item(/[:-]/, 0, 0, 3) },
            { selector, property: 'racenum', value: _.item(/[:-]/, 1) },
            { selector, property: 'racename', value: _.item(/[:-]/, 2) },
        ],
    },
    { selector: 'a[name]', property: 'raceid', value: t => t.attr('name') },
    // { selector: 'table[id^=course] thead th:eq(7)', property: '_hasowner', value: _.contains('Propri') },
    { selector: 'table[id^=course] thead th:eq(4)', property: '_hasdist', value: _.contains('Dist') },
    { selector: 'table[id^=course] thead th:eq(4)', property: '_hasautost', value: _.contains('Autost') },
    {
        selector: 'table[id^=course] tbody tr', // horses for each race
        children: [{
            end: p => p.result.push(_.cp(p.props)), // push last runner in parsed data ...
            selector,
            children: [
                { selector: 'a[href^="/cheval"]:first', property: 'huri', value: _.attr('href') },
                { selector: 'a[href^="/cheval"]:first', property: 'hname', value: _.attr('title') },
                { selector: 'a[href^="/jokey"]', property: 'duri', value: _.attr('href') },
                { selector: 'a[href^="/jokey"]', property: 'dname', value: _.attr('title') },
                { selector: 'a[href^="/entraineur"]', property: 'curi', value: _.attr('href') },
                { selector: 'a[href^="/entraineur"]', property: 'cname', value: _.attr('title') },
                { selector: 'a[href^="/proprietaire"]', property: 'ouri', /* filter: (t, i, p) => p.props._hasowner, */ value: _.attr('href') },
                { selector: 'a[href^="/proprietaire"]', property: 'oname', /* filter: (t, i, p) => p.props._hasowner, */ value: _.attr('title') },
                { selector: 'td:eq(0)', property: 'numero', value: _.int() },
                { selector: 'td:eq(1) img.ferAP', property: 'hshoes', value: () => 'AP', default: 'none' },
                { selector: 'td:eq(1) img.ferP', property: 'hshoes', value: () => 'P' },
                { selector: 'td:eq(1) img.ferA', property: 'hshoes', value: () => 'A' },
                { selector: 'td:eq(3)', property: 'gender', value: _.text(0, 1) },
                { selector: 'td:eq(3)', property: 'age', value: _.int(1, 2) },
                { selector: 'td:eq(4)', property: 'distance', filter: (t, i, p) => p.props._hasdist, value: _.int() },
                { selector: 'td:eq(4)', property: 'autostart', filter: (t, i, p) => p.props._hasautost, value: _.int() },
                { selector: p => `td:eq(${7 + (p.props_hasowner ? 0 : 1)})`, property: 'earnings', value: _.int() },
                { selector: p => `td:eq(${8 + (p.props_hasowner ? 0 : 1)})`, property: 'record' },
                { selector: p => `td:eq(${9 + (p.props_hasowner ? 0 : 1)})`, property: 'music', value: t => music(t) },
            ],
        }],
    }],
};
