// @license magnet:?xt=urn:btih:87f119ba0b429ba17a44b4bffcab33165ebdacc0&dn=freebsd.txt FreeBSD

/** @type {HTMLElement} */
const quizfield = query('#quiz');
/** @type {HTMLElement} */
const answerfield = query('#answer');
/** @type {HTMLElement} */
const submit = query('#submit');
/** @type {HTMLElement} */
const nextquiz = query('#next');

resources.then(start);

/**
 * 
 * @param {Resources} param0 
 */
function start({ meta, data }) {
    const topics = Object.keys(data);
    const subs = {};
    // FIXME: badly made variable scope
    let challenge;
    for (const topic of topics)
        subs[topic] = Object.keys(data[topic]);
    function putquiz() {
        const topic = select(topics);
        const subtopic = select(subs[topic]);
        // TODO: better element removal
        quizfield.innerHTML = '';
        /** @type {Quiz} */
        const quiz = select(data[topic][subtopic]);
        const title = select(quiz.topic);
        const info = getinfo(meta, title, quiz.sub);
        const table = mkitem(quiz.from, quiz.to, info);
        quizfield.appendChild(Object.assign(create('p'), { innerText: hold(title, info) }));
        quizfield.appendChild(table);
        challenge = '考点：' + topic + ' · ' + subtopic;
        answerfield.innerHTML = '';
        let index = 1;
        for (const label of quiz.from.concat(quiz.to)) {
            const answer = label.split('——')[0].replace(/%[^ ]+/g, '');
            const input = create('input');
            input.name = index++;
            input.setAttribute('data-answer', answer);
            answerfield.appendChild(input);
        }
        query('#answer > input').focus();
    }
    function checkanswer() {
        let stay = false;
        for (const input of Array.from(document.querySelectorAll('#answer > input'))) {
            if (input.value === input.getAttribute('data-answer')) {
                input.className = 'right';
            } else if (input.value === '') {
                input.focus();
                return;
            } else {
                input.className = 'wrong';
                stay = true;
            }
        }
        for (const abbr of Array.from(document.querySelectorAll('#quiz abbr'))) {
            abbr.classList.add('shown');
        }
        answerfield.appendChild(Object.assign(create('p'), { innerText: challenge }));
        if (!stay) setTimeout(putquiz, 3000);
    }
    submit.addEventListener('click', checkanswer);
    answerfield.addEventListener('keyup', function(event) {
        if (event.key === 'Enter')
            checkanswer();
    });
    nextquiz.addEventListener('click', putquiz);
    putquiz();
}

// @license-end
