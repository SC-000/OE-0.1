import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ModelsController::accept
* @see app/Http/Controllers/Admin/ModelsController.php:324
* @route '/admin/proposals/{proposal}/accept'
*/
export const accept = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

accept.definition = {
    methods: ["post"],
    url: '/admin/proposals/{proposal}/accept',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ModelsController::accept
* @see app/Http/Controllers/Admin/ModelsController.php:324
* @route '/admin/proposals/{proposal}/accept'
*/
accept.url = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return accept.definition.url
            .replace('{proposal}', parsedArgs.proposal.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ModelsController::accept
* @see app/Http/Controllers/Admin/ModelsController.php:324
* @route '/admin/proposals/{proposal}/accept'
*/
accept.post = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::accept
* @see app/Http/Controllers/Admin/ModelsController.php:324
* @route '/admin/proposals/{proposal}/accept'
*/
const acceptForm = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accept.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::accept
* @see app/Http/Controllers/Admin/ModelsController.php:324
* @route '/admin/proposals/{proposal}/accept'
*/
acceptForm.post = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accept.url(args, options),
    method: 'post',
})

accept.form = acceptForm

/**
* @see \App\Http\Controllers\Admin\ModelsController::reject
* @see app/Http/Controllers/Admin/ModelsController.php:338
* @route '/admin/proposals/{proposal}/reject'
*/
export const reject = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/admin/proposals/{proposal}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ModelsController::reject
* @see app/Http/Controllers/Admin/ModelsController.php:338
* @route '/admin/proposals/{proposal}/reject'
*/
reject.url = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return reject.definition.url
            .replace('{proposal}', parsedArgs.proposal.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ModelsController::reject
* @see app/Http/Controllers/Admin/ModelsController.php:338
* @route '/admin/proposals/{proposal}/reject'
*/
reject.post = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::reject
* @see app/Http/Controllers/Admin/ModelsController.php:338
* @route '/admin/proposals/{proposal}/reject'
*/
const rejectForm = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::reject
* @see app/Http/Controllers/Admin/ModelsController.php:338
* @route '/admin/proposals/{proposal}/reject'
*/
rejectForm.post = (args: { proposal: number | { id: number } } | [proposal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

const proposals = {
    accept: Object.assign(accept, accept),
    reject: Object.assign(reject, reject),
}

export default proposals