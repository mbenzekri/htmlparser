/* eslint-disable prefer-destructuring */
const selector = null;
function cp(obj) { return Object.keys(obj).reduce((p, c) => { p[c] = obj[c]; return p; }, {}); }
function int(e, i = 0, l = 100) { return parseInt((typeof e === 'string' ? e : e.text()).substr(i, l).replace(/\D+/g, ''), 10); }
function trim(e) { return (typeof e === 'string' ? e : e.text()).replace(/[\s\r\n\t]+/g, ' ').trim(); }
module.exports = {
    begin: (p) => { p.result = []; }, // intitialyse result ...
    selector: 'div.bloc.data.course',
    children: [
        { selector: 'a[name]', property: 'raceid', value: t => t.attr('name') },
        {
            selector: 'div.presentation',
            property: 'pres',
            value: t => trim(t).split(/ - /),
            children: [
                { selector: 'strong:eq(0)', property: 'date', value: t => new Date(t.text()) },
                { selector: 'strong:eq(1)', property: 'lieu' },
                {
                    end: (p) => {
                        p.props.distance = int(p.props.pres[2]);
                        p.props.piste = p.props.pres[3];
                        p.props.montant = int(p.props.pres[4]);
                        p.props.prix = p.props.pres[5];
                        p.props.type = p.props.pres[6];
                        p.props.corde = /gauche/.test(p.props.pres[7]) ? 'gauche' : 'droite';
                        p.props.partants = int(p.props.pres[8].split(/ +partants +/)[0]);
                        delete p.props.pres;
                    },
                },
            ],
        },
        // <p class="last visible-smallDevice"><strong>13/01/2019</strong> - <strong>Vincennes</strong> - 2175 m - Grande piste - 35&nbsp;000Ôé¼ - Prix de Castera-Verduzan - Mont├® - Corde ├á gauche - 13 partants</p>
        {
            selector: 'tr:not(:first)',
            filter: (p, t) => t.find('td').length === 9,
            children: [
                { selector: 'td:eq(0)', property: 'place', value: t => int(t) },
                { selector: 'td:eq(1) a', property: 'huri', value: t => t.attr('href') },
                { selector: 'td:eq(1)', property: 'hname' },
                { selector: 'td:eq(2)', property: 'gender', value: t => t.text().substr(0, 1) },
                { selector: 'td:eq(2)', property: 'age', value: t => int(t, 1, 2) },
                { selector: 'td:eq(3)', property: 'hdistance', value: t => int(t) },
                { selector: 'td:eq(5) a', property: 'duri', value: t => t.attr('href') },
                { selector: 'td:eq(5)', property: 'dnane' },
                { selector: 'td:eq(6)', property: 'cote', value: t => int(t) },
                { selector: 'td:eq(7)', property: 'redkm' },
                { selector, end: p => p.result.push(cp(p.props)) },
            ],
        },
    ],
};
