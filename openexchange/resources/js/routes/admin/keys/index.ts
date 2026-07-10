import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PlatformController::store
* @see app/Http/Controllers/Admin/PlatformController.php:116
* @route '/admin/platform/keys'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/platform/keys',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PlatformController::store
* @see app/Http/Controllers/Admin/PlatformController.php:116
* @route '/admin/platform/keys'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::store
* @see app/Http/Controllers/Admin/PlatformController.php:116
* @route '/admin/platform/keys'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

const keys = {
    store: Object.assign(store, store),
}

export default keys