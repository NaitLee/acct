
const output = {};

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


for await (const entry of Deno.readDir('items')) {
    const topic = entry.name;
    const quiz = output[topic] = {};
    for await (const subentry of Deno.readDir('items/' + topic)) {
        const subtopic = subentry.name.slice(0, subentry.name.lastIndexOf('.'));
        const data = await Deno.readTextFile(`items/${topic}/${subentry.name}`);
        if (data.trim() === '') continue;
        quiz[subtopic] = process(data);
    }
}

export const ITEMS = output;

if (import.meta.main)
    await Deno.writeTextFile('data.json', JSON.stringify(output, void 0, 4));
