import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ImpersonationController::stop
* @see app/Http/Controllers/Admin/ImpersonationController.php:26
* @route '/impersonate/stop'
*/
export const stop = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stop.url(options),
    method: 'post',
})

stop.definition = {
    methods: ["post"],
    url: '/impersonate/stop',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ImpersonationController::stop
* @see app/Http/Controllers/Admin/ImpersonationController.php:26
* @route '/impersonate/stop'
*/
stop.url = (options?: RouteQueryOptions) => {
    return stop.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ImpersonationController::stop
* @see app/Http/Controllers/Admin/ImpersonationController.php:26
* @route '/impersonate/stop'
*/
stop.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stop.url(options),
    method: 'post',
})

const impersonate = {
    stop: Object.assign(stop, stop),
}

export default impersonate