// deno-lint-ignore-file no-unused-vars

// @license magnet:?xt=urn:btih:87f119ba0b429ba17a44b4bffcab33165ebdacc0&dn=freebsd.txt FreeBSD

// Not ideal code at all. Expecting clean-up.

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
                add(name + info.code1, info.split1);
                if (info.split2 !== '')
                    add('——' + info.code2, info.split2, name.length - 2 + 1 /* css padding */);
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
/**
 * @param {string} string 
 * @param {string} flag 
 * @returns {boolean}
 */
function hasflag(string, flag) {
    return string.includes('%' + flag);
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
 * @param {QuizData} topic 
 * @param {string} sub 
 * @returns 
 */
function getinfo(meta, topic, sub) {
    const self = select(meta.self);
    const code = sub ? select(meta.code[sub]) : '';
    const code1 = code;
    const code2 = code1 ? select(meta.code[sub].filter(x => x !== code)) : '';
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    /*
    const d = hasflag(topic, 'date1')
        ? 1
        : hasflag(topic, 'date15')
            ? (Math.random() * maxdate(y, m) | 0 + 1)
            : maxdate(y, m);
    */
    const d = maxdate(y, m);
    const date = ` ${y} 年 ${m} 月 ${d} 日`;
    const other = sub === 'others' ? code : select(meta.code['others']);
    const amount = 10 * (Math.random() * 5 + 1 | 0);
    const price = 100 * (Math.random() * 100 + 1 | 0);
    const sum = amount * price;
    const split = hasflag(topic, 'split') ? (2 + (Math.random() * 6 | 0)) / 10 : 1;
    const split1 = sum * split | 0;
    const split2 = sum - split1;
    const rate = hasflag(topic, 'rate') || hasflag(topic, 'inc') ? 0.13 : 0;
    const inc = sum * rate;
    const period = ' ' + (1 + Math.random() * 11 | 0).toString() + ' ' + (hasflag(topic, 'longterm') ? '年' : '月');
    const extra = hasflag(topic, 'extra') ? 100 * (Math.random() * 20 + 1 | 0) : 0;
    const total = sum + inc + extra;
    return {
        'longterm': '',
        'date1': '',

        'date': date,
        'self': self,
        'other': other,
        'code1': code1,
        'code2': code2,
        'code': code,
        'amount': format(amount),
        'price': format(price),
        'sum': format(sum + extra),
        'rate': (rate * 100).toString() + '%',
        'inc': format(inc),
        'total': format(total),
        'extra': format(extra),
        'split1': format(split1),
        'split2': split2 === 0 ? '' : format(split2),
        'split': '',
        'period': period,
    };
}

// @license-end
