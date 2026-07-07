export type Article = {
    slug: string;
    title: string;
    tag: string;
    date: string;
    read: string;
    excerpt: string;
    sections: { h?: string; p: string[] }[];
};

export const ARTICLES: Article[] = [
    {
        slug: 'why-ai-needs-an-exchange',
        title: 'Why AI needs an exchange, not another gateway',
        tag: 'Thesis',
        date: 'July 2026',
        read: '6 min',
        excerpt: 'As intelligence commoditises, durable value migrates from any single model to the layer that standardises, routes, meters and clears across all of them.',
        sections: [
            { p: ['Every commodity market that has mattered eventually grew an exchange. Grain has the CBOT; equities have exchanges and clearing houses; electricity has grid operators and spot markets. The pattern is consistent: once a good becomes abundant and substitutable, the money stops accruing to the lowest-cost producer and starts accruing to the neutral layer that defines the standard unit, discovers price, routes to best execution, and clears settlement.'] },
            { h: 'Intelligence is commoditising fast', p: ['The blended price of frontier-grade output has fallen roughly an order of magnitude in three years, open-weight models track just beneath it, and the number of viable models has exploded past three hundred. When a capability halves in price every nine to twelve months, betting your margin on one provider’s roadmap is a bet against yourself.'] },
            { h: 'A gateway routes; an exchange clears', p: ['A gateway picks a model and forwards a call. That is table stakes. An exchange adds the parts an operator actually needs: policy that travels with every request, spend caps that hold, a fallback when a provider degrades, a single itemised bill, and a market — graded instruments, live rates, and clearing — on top. Open Exchange is built to own that layer.'] },
        ],
    },
    {
        slug: 'best-execution-for-llm-requests',
        title: 'Best execution for LLM requests',
        tag: 'Engineering',
        date: 'July 2026',
        read: '7 min',
        excerpt: 'How the LAIE O-Algo scores cost, quality and latency per request class, and why every route is logged and explainable.',
        sections: [
            { p: ['“Best” is not a global constant — it is defined per request. A code-completion call weights latency and correctness differently from a long-context summarisation. The router treats each request as an optimisation: maximise a weighted utility across candidate models, subject to hard constraints like context window, budget and required capabilities.'] },
            { h: 'The objective function', p: ['Formally, the router maximises U(m) = Σ wᵢ · sᵢ(m) over the model catalogue, where the weights come from the request’s class (Language, Vision, Reasoning, Generation, Control) and its objective mode (Auto, Cost, Quality, Fast, Code, Vision, JSON). Hard constraints prune the candidate set before scoring; the winner plus an ordered fallback list is returned.'] },
            { h: 'Explainable by construction', p: ['Every decision is written to a deterministic log and surfaced on the response via X-Model-Selected and X-Fallback-Used headers. Reliability is a function of the fallback list: with k independent providers each at availability a, a routed request only fails if all k fail — 1 − (1 − a)ᵏ. Three providers at 99% each yield six nines of routed availability.'] },
        ],
    },
    {
        slug: 'grading-models-from-v-to-z',
        title: 'Grading models from V to Z',
        tag: 'Research',
        date: 'June 2026',
        read: '5 min',
        excerpt: 'A 1–10 rubric and a generation letter that turn model capability into a compact, tradable instrument code.',
        sections: [
            { p: ['To trade something, you first have to standardise it. Open Exchange grades every model across ten quality categories — test performance, data accuracy, response time, security, scalability and more — on a defined 1–10 scale, then prefixes the score with a capability “generation” letter from A to Z, where V–Z denote the frontier.'] },
            { h: 'Reading an instrument code', p: ['The result is a compact code like Z5 or AA10: the letter is the generation, the number is the category score. A Generation-Z model clears strict thresholds (sub-150ms response, >99.5% accuracy on the relevant benchmark, top marks on security and scalability). Codes make capability comparable at a glance — and priceable.'] },
            { h: 'From grade to Grade Rate', p: ['Once a request class carries a grade, it becomes an Instrument with a live Grade Rate. Deals execute against the prevailing rate; Lots trade in units of one million tokens; the clearing layer reserves, executes and settles. Grading is the bridge from “which model is good” to “what does this capability cost, right now.”'] },
        ],
    },
];

export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug);
