
type Quiz = {
    from: string | string[],
    to: string | string[],
    title: string[],
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
    code: Record<string, string[]>
};
