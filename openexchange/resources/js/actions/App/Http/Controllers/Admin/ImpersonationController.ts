import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
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

/**
* @see \App\Http\Controllers\Admin\ImpersonationController::stop
* @see app/Http/Controllers/Admin/ImpersonationController.php:26
* @route '/impersonate/stop'
*/
const stopForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: stop.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ImpersonationController::stop
* @see app/Http/Controllers/Admin/ImpersonationController.php:26
* @route '/impersonate/stop'
*/
stopForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: stop.url(options),
    method: 'post',
})

stop.form = stopForm

/**
* @see \App\Http\Controllers\Admin\ImpersonationController::start
* @see app/Http/Controllers/Admin/ImpersonationController.php:15
* @route '/admin/clients/{client}/impersonate'
*/
export const start = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start.url(args, options),
    method: 'post',
})

start.definition = {
    methods: ["post"],
    url: '/admin/clients/{client}/impersonate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ImpersonationController::start
* @see app/Http/Controllers/Admin/ImpersonationController.php:15
* @route '/admin/clients/{client}/impersonate'
*/
start.url = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { client: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { client: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            client: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        client: typeof args.client === 'object'
        ? args.client.id
        : args.client,
    }

    return start.definition.url
            .replace('{client}', parsedArgs.client.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ImpersonationController::start
* @see app/Http/Controllers/Admin/ImpersonationController.php:15
* @route '/admin/clients/{client}/impersonate'
*/
start.post = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ImpersonationController::start
* @see app/Http/Controllers/Admin/ImpersonationController.php:15
* @route '/admin/clients/{client}/impersonate'
*/
const startForm = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: start.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ImpersonationController::start
* @see app/Http/Controllers/Admin/ImpersonationController.php:15
* @route '/admin/clients/{client}/impersonate'
*/
startForm.post = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: start.url(args, options),
    method: 'post',
})

start.form = startForm

const ImpersonationController = { stop, start }

export default ImpersonationController