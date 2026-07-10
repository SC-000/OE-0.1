import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PlatformController::store
* @see app/Http/Controllers/Admin/PlatformController.php:90
* @route '/admin/platform/backends'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/platform/backends',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PlatformController::store
* @see app/Http/Controllers/Admin/PlatformController.php:90
* @route '/admin/platform/backends'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::store
* @see app/Http/Controllers/Admin/PlatformController.php:90
* @route '/admin/platform/backends'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::destroy
* @see app/Http/Controllers/Admin/PlatformController.php:107
* @route '/admin/platform/backends/{backend}'
*/
export const destroy = (args: { backend: number | { id: number } } | [backend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/platform/backends/{backend}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\PlatformController::destroy
* @see app/Http/Controllers/Admin/PlatformController.php:107
* @route '/admin/platform/backends/{backend}'
*/
destroy.url = (args: { backend: number | { id: number } } | [backend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { backend: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { backend: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            backend: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        backend: typeof args.backend === 'object'
        ? args.backend.id
        : args.backend,
    }

    return destroy.definition.url
            .replace('{backend}', parsedArgs.backend.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::destroy
* @see app/Http/Controllers/Admin/PlatformController.php:107
* @route '/admin/platform/backends/{backend}'
*/
destroy.delete = (args: { backend: number | { id: number } } | [backend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const backends = {
    store: Object.assign(store, store),
    destroy: Object.assign(destroy, destroy),
}

export default backends