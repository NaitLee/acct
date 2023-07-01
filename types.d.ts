
type Quiz = {
    from: string | string[],
    to: string | string[],
    topic: string[],
    sub?: string
};

type QuizSet = {
    [subset: string]: Quiz[],
};

type QuizData = {
    [set: string]: QuizSet
};

type QuizMeta = {
    self: string[],
    order: string[],
    code: Record<string, string[]>
};

type Resources = { meta: QuizMeta, data: QuizData };
