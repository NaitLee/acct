// deno-lint-ignore-file no-unused-vars

// @license magnet:?xt=urn:btih:87f119ba0b429ba17a44b4bffcab33165ebdacc0&dn=freebsd.txt FreeBSD

const root = query('main');

Promise.all([
    fetch('meta.json').then(r => r.json()),
    fetch('data.json').then(r => r.json())
]).then(list);

/**
 * @param {[QuizMeta, QuizData]}
 */
function list([meta, data]) {
    for (const set in data) {
        root.appendChild(create('hr'));
        root.appendChild(Object.assign(create('h2'), { innerText: set }));
        for (const subset in data[set]) {
            root.appendChild(Object.assign(create('h3'), { innerText: subset }));
            for (const quiz of data[set][subset]) {
                const topic = select(quiz.topic);
                const info = getinfo(meta, topic, quiz.sub);
                const table = mkitem(quiz.from, quiz.to, info);
                root.appendChild(Object.assign(create('p'), { innerText: hold(topic, info) }));
                root.appendChild(table);
            }
        }
    }
}

function try_print() {
    // Ahh, dirty test!
    const stamp = new Date().getTime();
    print();
    if (new Date().getTime() - stamp < 100)
        alert('抱歉，您的浏览器似乎不支持打印。');
}

// @license-end
