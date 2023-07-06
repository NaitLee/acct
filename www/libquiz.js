// deno-lint-ignore-file no-unused-vars

// @license magnet:?xt=urn:btih:87f119ba0b429ba17a44b4bffcab33165ebdacc0&dn=freebsd.txt FreeBSD

// Not ideal code at all. Expecting clean-up.

/** @type {Resources} */
const resources = Promise.all([
    fetch('meta.json').then(r => r.json()),
    fetch('data.json').then(r => r.json())
]).then(([meta, data]) => ({
    meta: meta,
    data: data
}));

/**
 * @param {string} selector 
 * @returns {HTMLElement}
 */
function query(selector) {
    return document.querySelector(selector);
}
/**
 * @param {string} tag 
 * @returns {HTMLElement}
 */
function create(tag) {
    return document.createElement(tag);
}

function format(n) {
    const s = [];
    const k = n.toString();
    for (let i = k.length; i >= 0; i -= 3)
        s.unshift(k.slice(i < 3 ? 0 : i - 3, i));
    return s.join(' ');
}

/**
 * 
 * @param {string | string[]} from 
 * @param {string | string[]} to 
 * @param {Record<string, string>} info 
 */
function mkitem(from, to, info) {
    const table = create('table');
    if (typeof from === 'string')
        from = [from];
    if (typeof to === 'string')
        to = [to];
    const continued = [false, false];
    let state = 0;
    function add(key, value, indent) {
        const tr = create('tr');
        const lead = (state === 0 ? '借：' : '　贷：');
        const a = create('td');
        const [head, tail] = key.split('——');
        if (!indent)
            a.append(
                (continued[state] ? '　'.repeat(lead.length) : lead),
                Object.assign(create('abbr'), {
                    innerText: head,
                    title: '不要偷看 |ω・`）'
                }),
                tail ? '——' + tail : ''
            );
        else
            a.append(
                (continued[state] ? '　'.repeat(lead.length) : lead),
                '　'.repeat(indent),
                Object.assign(create('span'), {
                    innerText: head,
                }),
                tail ? '——' + tail : ''
            );
        tr.append(
            a,
            Object.assign(create('td'), {
                innerText: state === 0 ? value : ''
            }),
            Object.assign(create('td'), {
                innerText: state === 0 ? '' : value
            })
        );
        table.appendChild(tr);
        continued[state] = true;
    }
    function getflag(i) {
        for (const k in info)
            if (i.includes('%' + k))
                return k;
        return 'total';
    }
    for (const s of [0, 1]) {
        state = s;
        for (const i of [from, to][state]) {
            const flag = getflag(i);
            const name = i.replace('%' + flag, '');
            if (info.code && i.endsWith('——')) {
                add(name + info.code1, info.bonus1);
                if (info.split2 !== '')
                    add('——' + info.code2, info.bonus2, name.length - 2 + 1 /* css padding */);
            } else
                add(name, info[flag]);
        }
    }
    return table;
}

/**
 * 
 * @param {T[]} array 
 * @returns {T}
 */
function select(array) {
    return array[Math.random() * array.length | 0];
}

if (!('replaceAll' in String))
    String.prototype.replaceAll = function (search, replace) {
        return this.replace(new RegExp(search, 'g'), replace);
    }
/**
 * 
 * @param {string} topic 
 * @param {Record<string, string>} holders 
 */
function hold(topic, holders) {
    for (const key in holders) {
        topic = topic.replaceAll('%' + key, holders[key]);
    }
    return topic;
}

function maxdate(year, month) {
    switch (month) {
        case 4:
        case 6:
        case 9:
        case 11:
            return 30;
        case 2:
            return (year % 4 === 0 && year % 100 !== 0) ? 29 : 28;
        default:
            return 31;
    }
}

const today = new Date();
/**
 * 
 * @param {QuizMeta} meta 
 * @param {string} topic 
 * @param {string} sub 
 * @returns 
 */
function getinfo(meta, topic, sub) {
    /**
     * @param {string} string 
     * @param {string} flag 
     * @returns {boolean}
     */
    function hasflag(flag) {
        return topic.includes('%' + flag);
    }
    const self = select(meta.self);
    const code = sub ? select(meta.code[sub]) : '';
    const code1 = code;
    const code2 = code1 ? select(meta.code[sub].filter(x => x !== code)) : '';
    const y = today.getFullYear();
    const m = hasflag('month12') ? 12 : today.getMonth() + 1;
    /*
    const d = hasflag('date1')
        ? 1
        : hasflag('date15')
            ? (Math.random() * maxdate(y, m) | 0 + 1)
            : maxdate(y, m);
    */
    const d = maxdate(y, m);
    const date = ` ${y} 年 ${m} 月 ${d} 日`;
    const other = sub === 'others' ? code : select(meta.code['others']);

    const split = hasflag('split') ? (2 + (Math.random() * 6 | 0)) / 10 : 1;
    const amount = 10 * (Math.random() * 5 + 1 | 0);
    const amount1 = amount * split | 0;
    const amount2 = amount - amount1;
    const price = 100 * (Math.random() * 100 + 1 | 0);
    const sum = amount * price;
    const split1 = sum * split | 0;
    const split2 = sum - split1;
    let rate = hasflag('rate') || hasflag('rate13') || hasflag('inc') ? 0.13 : 0;
    if (hasflag('rate10')) rate = 0.1;
    else if (hasflag('rate5')) rate = 0.05;
    else if (hasflag('rate25')) rate = 0.25;
    const inc = sum * rate;
    const period = ' ' + (2 + Math.random() * 10 | 0).toString() + ' ' + (hasflag('longterm') ? '年' : '个月');
    //FIXME: various extras?
    const extra = 100 * (Math.random() * 50 + 1 | 0);
    const extra_count = topic.match(/%extra/g)?.length ?? 0;
    const bonus = sum + extra * extra_count;
    const bonus1 = bonus * split | 0;
    const bonus2 = bonus - bonus1;
    const total = bonus + inc;
    return {
        'longterm': '',
        'date1': '',
        'month12': '',
        'rate5': '',
        'rate10': '',
        'rate13': '',
        'rate25': '',

        'date': date,
        'self': self,
        'other': other,
        'code1': code1,
        'code2': code2,
        'code': code,
        'amount1': format(amount1),
        'amount2': format(amount2),
        'amount': format(amount),
        'price': format(price),
        'sum': format(sum),
        'rate': (rate * 100).toString() + '%',
        'inc': format(inc),
        'extra': format(extra),
        'bonus': format(bonus),
        'total': format(total),
        'split1': format(split1),
        'split2': split2 === 0 ? '' : format(split2),
        'bonus1': format(bonus1),
        'bonus2': bonus2 === 0 ? '' : format(bonus2),
        'period': period,

        'split': '',
    };
}

// @license-end
