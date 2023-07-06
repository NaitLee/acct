
export function mkitems() {

    const meta = JSON.parse(Deno.readTextFileSync('www/meta.json'));

    /** @type {QuizData} */
    const output = {};
    for (const key of meta.order) {
        output[key] = {};
    }

    function process(data) {
        const chunks = data.split('\n\n');

        const result = [];

        for (const chunk of chunks) {
            const [f_t, topics, sub] = chunk.split(';\n').map(x => x.trim());
            const [froms, tos] = f_t.split('\n');
            result.push({
                from: froms.split(','),
                to: tos.split(','),
                topic: topics.split('\n'),
                sub: sub || ''
            });
        }

        return result;
    }

    for (const entry of Deno.readDirSync('items')) {
        const topic = entry.name;
        const quiz = output[topic] = output[topic] ?? {};
        for (const subentry of Deno.readDirSync('items/' + topic)) {
            const subtopic = subentry.name.slice(0, subentry.name.lastIndexOf('.'));
            const data = Deno.readTextFileSync(`items/${topic}/${subentry.name}`);
            if (data.trim() === '') continue;
            quiz[subtopic] = process(data);
        }
    }

    return output;

}

if (import.meta.main)
    await Deno.writeTextFile('data.json', JSON.stringify(mkitems(), void 0, 4));
