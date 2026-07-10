import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ModelsController::index
* @see app/Http/Controllers/Admin/ModelsController.php:27
* @route '/admin/models'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/models',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ModelsController::index
* @see app/Http/Controllers/Admin/ModelsController.php:27
* @route '/admin/models'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ModelsController::index
* @see app/Http/Controllers/Admin/ModelsController.php:27
* @route '/admin/models'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::index
* @see app/Http/Controllers/Admin/ModelsController.php:27
* @route '/admin/models'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::index
* @see app/Http/Controllers/Admin/ModelsController.php:27
* @route '/admin/models'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::index
* @see app/Http/Controllers/Admin/ModelsController.php:27
* @route '/admin/models'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::index
* @see app/Http/Controllers/Admin/ModelsController.php:27
* @route '/admin/models'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Admin\ModelsController::store
* @see app/Http/Controllers/Admin/ModelsController.php:150
* @route '/admin/models'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/models',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ModelsController::store
* @see app/Http/Controllers/Admin/ModelsController.php:150
* @route '/admin/models'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ModelsController::store
* @see app/Http/Controllers/Admin/ModelsController.php:150
* @route '/admin/models'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::store
* @see app/Http/Controllers/Admin/ModelsController.php:150
* @route '/admin/models'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::store
* @see app/Http/Controllers/Admin/ModelsController.php:150
* @route '/admin/models'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\ModelsController::update
* @see app/Http/Controllers/Admin/ModelsController.php:214
* @route '/admin/models/{model}'
*/
export const update = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/admin/models/{model}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\ModelsController::update
* @see app/Http/Controllers/Admin/ModelsController.php:214
* @route '/admin/models/{model}'
*/
update.url = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { model: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { model: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            model: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        model: typeof args.model === 'object'
        ? args.model.id
        : args.model,
    }

    return update.definition.url
            .replace('{model}', parsedArgs.model.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ModelsController::update
* @see app/Http/Controllers/Admin/ModelsController.php:214
* @route '/admin/models/{model}'
*/
update.patch = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::update
* @see app/Http/Controllers/Admin/ModelsController.php:214
* @route '/admin/models/{model}'
*/
const updateForm = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::update
* @see app/Http/Controllers/Admin/ModelsController.php:214
* @route '/admin/models/{model}'
*/
updateForm.patch = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Admin\ModelsController::presentation
* @see app/Http/Controllers/Admin/ModelsController.php:266
* @route '/admin/models/{model}/presentation'
*/
export const presentation = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: presentation.url(args, options),
    method: 'patch',
})

presentation.definition = {
    methods: ["patch"],
    url: '/admin/models/{model}/presentation',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\ModelsController::presentation
* @see app/Http/Controllers/Admin/ModelsController.php:266
* @route '/admin/models/{model}/presentation'
*/
presentation.url = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { model: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { model: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            model: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        model: typeof args.model === 'object'
        ? args.model.id
        : args.model,
    }

    return presentation.definition.url
            .replace('{model}', parsedArgs.model.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ModelsController::presentation
* @see app/Http/Controllers/Admin/ModelsController.php:266
* @route '/admin/models/{model}/presentation'
*/
presentation.patch = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: presentation.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::presentation
* @see app/Http/Controllers/Admin/ModelsController.php:266
* @route '/admin/models/{model}/presentation'
*/
const presentationForm = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: presentation.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::presentation
* @see app/Http/Controllers/Admin/ModelsController.php:266
* @route '/admin/models/{model}/presentation'
*/
presentationForm.patch = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: presentation.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

presentation.form = presentationForm

/**
* @see \App\Http\Controllers\Admin\ModelsController::priceFromFeed
* @see app/Http/Controllers/Admin/ModelsController.php:172
* @route '/admin/models/{model}/price-from-feed'
*/
export const priceFromFeed = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: priceFromFeed.url(args, options),
    method: 'post',
})

priceFromFeed.definition = {
    methods: ["post"],
    url: '/admin/models/{model}/price-from-feed',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ModelsController::priceFromFeed
* @see app/Http/Controllers/Admin/ModelsController.php:172
* @route '/admin/models/{model}/price-from-feed'
*/
priceFromFeed.url = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { model: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { model: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            model: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        model: typeof args.model === 'object'
        ? args.model.id
        : args.model,
    }

    return priceFromFeed.definition.url
            .replace('{model}', parsedArgs.model.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ModelsController::priceFromFeed
* @see app/Http/Controllers/Admin/ModelsController.php:172
* @route '/admin/models/{model}/price-from-feed'
*/
priceFromFeed.post = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: priceFromFeed.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::priceFromFeed
* @see app/Http/Controllers/Admin/ModelsController.php:172
* @route '/admin/models/{model}/price-from-feed'
*/
const priceFromFeedForm = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: priceFromFeed.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::priceFromFeed
* @see app/Http/Controllers/Admin/ModelsController.php:172
* @route '/admin/models/{model}/price-from-feed'
*/
priceFromFeedForm.post = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: priceFromFeed.url(args, options),
    method: 'post',
})

priceFromFeed.form = priceFromFeedForm

/**
* @see \App\Http\Controllers\Admin\ModelsController::rebill
* @see app/Http/Controllers/Admin/ModelsController.php:193
* @route '/admin/models/{model}/rebill'
*/
export const rebill = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rebill.url(args, options),
    method: 'post',
})

rebill.definition = {
    methods: ["post"],
    url: '/admin/models/{model}/rebill',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ModelsController::rebill
* @see app/Http/Controllers/Admin/ModelsController.php:193
* @route '/admin/models/{model}/rebill'
*/
rebill.url = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { model: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { model: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            model: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        model: typeof args.model === 'object'
        ? args.model.id
        : args.model,
    }

    return rebill.definition.url
            .replace('{model}', parsedArgs.model.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ModelsController::rebill
* @see app/Http/Controllers/Admin/ModelsController.php:193
* @route '/admin/models/{model}/rebill'
*/
rebill.post = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rebill.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::rebill
* @see app/Http/Controllers/Admin/ModelsController.php:193
* @route '/admin/models/{model}/rebill'
*/
const rebillForm = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rebill.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::rebill
* @see app/Http/Controllers/Admin/ModelsController.php:193
* @route '/admin/models/{model}/rebill'
*/
rebillForm.post = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rebill.url(args, options),
    method: 'post',
})

rebill.form = rebillForm

/**
* @see \App\Http\Controllers\Admin\ModelsController::sync
* @see app/Http/Controllers/Admin/ModelsController.php:300
* @route '/admin/models/sync'
*/
export const sync = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

sync.definition = {
    methods: ["post"],
    url: '/admin/models/sync',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ModelsController::sync
* @see app/Http/Controllers/Admin/ModelsController.php:300
* @route '/admin/models/sync'
*/
sync.url = (options?: RouteQueryOptions) => {
    return sync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ModelsController::sync
* @see app/Http/Controllers/Admin/ModelsController.php:300
* @route '/admin/models/sync'
*/
sync.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::sync
* @see app/Http/Controllers/Admin/ModelsController.php:300
* @route '/admin/models/sync'
*/
const syncForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::sync
* @see app/Http/Controllers/Admin/ModelsController.php:300
* @route '/admin/models/sync'
*/
syncForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

sync.form = syncForm

/**
* @see \App\Http\Controllers\Admin\ModelsController::retier
* @see app/Http/Controllers/Admin/ModelsController.php:281
* @route '/admin/models/retier'
*/
export const retier = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: retier.url(options),
    method: 'post',
})

retier.definition = {
    methods: ["post"],
    url: '/admin/models/retier',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ModelsController::retier
* @see app/Http/Controllers/Admin/ModelsController.php:281
* @route '/admin/models/retier'
*/
retier.url = (options?: RouteQueryOptions) => {
    return retier.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ModelsController::retier
* @see app/Http/Controllers/Admin/ModelsController.php:281
* @route '/admin/models/retier'
*/
retier.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: retier.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::retier
* @see app/Http/Controllers/Admin/ModelsController.php:281
* @route '/admin/models/retier'
*/
const retierForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: retier.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::retier
* @see app/Http/Controllers/Admin/ModelsController.php:281
* @route '/admin/models/retier'
*/
retierForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: retier.url(options),
    method: 'post',
})

retier.form = retierForm

/**
* @see \App\Http\Controllers\Admin\ModelsController::acceptProposal
* @see app/Http/Controllers/Admin/ModelsController.php:324
* @route '/admin/proposals/{proposal}/accept'
*/
export const acceptProposal = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acceptProposal.url(args, options),
    method: 'post',
})

acceptProposal.definition = {
    methods: ["post"],
    url: '/admin/proposals/{proposal}/accept',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ModelsController::acceptProposal
* @see app/Http/Controllers/Admin/ModelsController.php:324
* @route '/admin/proposals/{proposal}/accept'
*/
acceptProposal.url = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { proposal: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { proposal: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            proposal: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        proposal: typeof args.proposal === 'object'
        ? args.proposal.id
        : args.proposal,
    }

    return acceptProposal.definition.url
            .replace('{proposal}', parsedArgs.proposal.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ModelsController::acceptProposal
* @see app/Http/Controllers/Admin/ModelsController.php:324
* @route '/admin/proposals/{proposal}/accept'
*/
acceptProposal.post = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acceptProposal.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::acceptProposal
* @see app/Http/Controllers/Admin/ModelsController.php:324
* @route '/admin/proposals/{proposal}/accept'
*/
const acceptProposalForm = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: acceptProposal.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::acceptProposal
* @see app/Http/Controllers/Admin/ModelsController.php:324
* @route '/admin/proposals/{proposal}/accept'
*/
acceptProposalForm.post = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: acceptProposal.url(args, options),
    method: 'post',
})

acceptProposal.form = acceptProposalForm

/**
* @see \App\Http\Controllers\Admin\ModelsController::rejectProposal
* @see app/Http/Controllers/Admin/ModelsController.php:338
* @route '/admin/proposals/{proposal}/reject'
*/
export const rejectProposal = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rejectProposal.url(args, options),
    method: 'post',
})

rejectProposal.definition = {
    methods: ["post"],
    url: '/admin/proposals/{proposal}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ModelsController::rejectProposal
* @see app/Http/Controllers/Admin/ModelsController.php:338
* @route '/admin/proposals/{proposal}/reject'
*/
rejectProposal.url = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { proposal: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { proposal: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            proposal: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        proposal: typeof args.proposal === 'object'
        ? args.proposal.id
        : args.proposal,
    }

    return rejectProposal.definition.url
            .replace('{proposal}', parsedArgs.proposal.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ModelsController::rejectProposal
* @see app/Http/Controllers/Admin/ModelsController.php:338
* @route '/admin/proposals/{proposal}/reject'
*/
rejectProposal.post = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rejectProposal.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::rejectProposal
* @see app/Http/Controllers/Admin/ModelsController.php:338
* @route '/admin/proposals/{proposal}/reject'
*/
const rejectProposalForm = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rejectProposal.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::rejectProposal
* @see app/Http/Controllers/Admin/ModelsController.php:338
* @route '/admin/proposals/{proposal}/reject'
*/
rejectProposalForm.post = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rejectProposal.url(args, options),
    method: 'post',
})

rejectProposal.form = rejectProposalForm

const ModelsController = { index, store, update, presentation, priceFromFeed, rebill, sync, retier, acceptProposal, rejectProposal }

export default ModelsController