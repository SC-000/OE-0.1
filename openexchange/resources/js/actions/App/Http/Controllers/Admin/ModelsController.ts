import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ModelsController::index
* @see app/Http/Controllers/Admin/ModelsController.php:22
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
* @see app/Http/Controllers/Admin/ModelsController.php:22
* @route '/admin/models'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ModelsController::index
* @see app/Http/Controllers/Admin/ModelsController.php:22
* @route '/admin/models'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::index
* @see app/Http/Controllers/Admin/ModelsController.php:22
* @route '/admin/models'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::store
* @see app/Http/Controllers/Admin/ModelsController.php:95
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
* @see app/Http/Controllers/Admin/ModelsController.php:95
* @route '/admin/models'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ModelsController::store
* @see app/Http/Controllers/Admin/ModelsController.php:95
* @route '/admin/models'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::update
* @see app/Http/Controllers/Admin/ModelsController.php:122
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
* @see app/Http/Controllers/Admin/ModelsController.php:122
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
* @see app/Http/Controllers/Admin/ModelsController.php:122
* @route '/admin/models/{model}'
*/
update.patch = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::presentation
* @see app/Http/Controllers/Admin/ModelsController.php:149
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
* @see app/Http/Controllers/Admin/ModelsController.php:149
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
* @see app/Http/Controllers/Admin/ModelsController.php:149
* @route '/admin/models/{model}/presentation'
*/
presentation.patch = (args: { model: number | { id: number } } | [model: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: presentation.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::sync
* @see app/Http/Controllers/Admin/ModelsController.php:183
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
* @see app/Http/Controllers/Admin/ModelsController.php:183
* @route '/admin/models/sync'
*/
sync.url = (options?: RouteQueryOptions) => {
    return sync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ModelsController::sync
* @see app/Http/Controllers/Admin/ModelsController.php:183
* @route '/admin/models/sync'
*/
sync.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::retier
* @see app/Http/Controllers/Admin/ModelsController.php:164
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
* @see app/Http/Controllers/Admin/ModelsController.php:164
* @route '/admin/models/retier'
*/
retier.url = (options?: RouteQueryOptions) => {
    return retier.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ModelsController::retier
* @see app/Http/Controllers/Admin/ModelsController.php:164
* @route '/admin/models/retier'
*/
retier.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: retier.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::acceptProposal
* @see app/Http/Controllers/Admin/ModelsController.php:198
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
* @see app/Http/Controllers/Admin/ModelsController.php:198
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
* @see app/Http/Controllers/Admin/ModelsController.php:198
* @route '/admin/proposals/{proposal}/accept'
*/
acceptProposal.post = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acceptProposal.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::rejectProposal
* @see app/Http/Controllers/Admin/ModelsController.php:207
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
* @see app/Http/Controllers/Admin/ModelsController.php:207
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
* @see app/Http/Controllers/Admin/ModelsController.php:207
* @route '/admin/proposals/{proposal}/reject'
*/
rejectProposal.post = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rejectProposal.url(args, options),
    method: 'post',
})

const ModelsController = { index, store, update, presentation, sync, retier, acceptProposal, rejectProposal }

export default ModelsController