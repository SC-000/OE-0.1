import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
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

const models = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    presentation: Object.assign(presentation, presentation),
    sync: Object.assign(sync, sync),
    retier: Object.assign(retier, retier),
}

export default models