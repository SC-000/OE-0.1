import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Console\SourcesController::store
* @see app/Http/Controllers/Console/SourcesController.php:40
* @route '/console/sources'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/console/sources',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Console\SourcesController::store
* @see app/Http/Controllers/Console/SourcesController.php:40
* @route '/console/sources'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Console\SourcesController::store
* @see app/Http/Controllers/Console/SourcesController.php:40
* @route '/console/sources'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Console\SourcesController::store
* @see app/Http/Controllers/Console/SourcesController.php:40
* @route '/console/sources'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Console\SourcesController::store
* @see app/Http/Controllers/Console/SourcesController.php:40
* @route '/console/sources'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Console\SourcesController::label
* @see app/Http/Controllers/Console/SourcesController.php:49
* @route '/console/sources/{source}/label'
*/
export const label = (args: { source: number | { id: number } } | [source: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: label.url(args, options),
    method: 'post',
})

label.definition = {
    methods: ["post"],
    url: '/console/sources/{source}/label',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Console\SourcesController::label
* @see app/Http/Controllers/Console/SourcesController.php:49
* @route '/console/sources/{source}/label'
*/
label.url = (args: { source: number | { id: number } } | [source: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { source: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { source: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            source: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        source: typeof args.source === 'object'
        ? args.source.id
        : args.source,
    }

    return label.definition.url
            .replace('{source}', parsedArgs.source.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Console\SourcesController::label
* @see app/Http/Controllers/Console/SourcesController.php:49
* @route '/console/sources/{source}/label'
*/
label.post = (args: { source: number | { id: number } } | [source: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: label.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Console\SourcesController::label
* @see app/Http/Controllers/Console/SourcesController.php:49
* @route '/console/sources/{source}/label'
*/
const labelForm = (args: { source: number | { id: number } } | [source: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: label.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Console\SourcesController::label
* @see app/Http/Controllers/Console/SourcesController.php:49
* @route '/console/sources/{source}/label'
*/
labelForm.post = (args: { source: number | { id: number } } | [source: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: label.url(args, options),
    method: 'post',
})

label.form = labelForm

/**
* @see \App\Http\Controllers\Console\SourcesController::revoke
* @see app/Http/Controllers/Console/SourcesController.php:58
* @route '/console/sources/{source}/revoke'
*/
export const revoke = (args: { source: number | { id: number } } | [source: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revoke.url(args, options),
    method: 'post',
})

revoke.definition = {
    methods: ["post"],
    url: '/console/sources/{source}/revoke',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Console\SourcesController::revoke
* @see app/Http/Controllers/Console/SourcesController.php:58
* @route '/console/sources/{source}/revoke'
*/
revoke.url = (args: { source: number | { id: number } } | [source: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { source: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { source: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            source: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        source: typeof args.source === 'object'
        ? args.source.id
        : args.source,
    }

    return revoke.definition.url
            .replace('{source}', parsedArgs.source.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Console\SourcesController::revoke
* @see app/Http/Controllers/Console/SourcesController.php:58
* @route '/console/sources/{source}/revoke'
*/
revoke.post = (args: { source: number | { id: number } } | [source: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revoke.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Console\SourcesController::revoke
* @see app/Http/Controllers/Console/SourcesController.php:58
* @route '/console/sources/{source}/revoke'
*/
const revokeForm = (args: { source: number | { id: number } } | [source: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: revoke.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Console\SourcesController::revoke
* @see app/Http/Controllers/Console/SourcesController.php:58
* @route '/console/sources/{source}/revoke'
*/
revokeForm.post = (args: { source: number | { id: number } } | [source: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: revoke.url(args, options),
    method: 'post',
})

revoke.form = revokeForm

const sources = {
    store: Object.assign(store, store),
    label: Object.assign(label, label),
    revoke: Object.assign(revoke, revoke),
}

export default sources