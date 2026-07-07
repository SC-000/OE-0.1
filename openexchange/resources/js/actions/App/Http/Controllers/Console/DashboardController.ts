import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Console\DashboardController::__invoke
* @see app/Http/Controllers/Console/DashboardController.php:14
* @route '/console'
*/
const DashboardController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DashboardController.url(options),
    method: 'get',
})

DashboardController.definition = {
    methods: ["get","head"],
    url: '/console',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Console\DashboardController::__invoke
* @see app/Http/Controllers/Console/DashboardController.php:14
* @route '/console'
*/
DashboardController.url = (options?: RouteQueryOptions) => {
    return DashboardController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Console\DashboardController::__invoke
* @see app/Http/Controllers/Console/DashboardController.php:14
* @route '/console'
*/
DashboardController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DashboardController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\DashboardController::__invoke
* @see app/Http/Controllers/Console/DashboardController.php:14
* @route '/console'
*/
DashboardController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: DashboardController.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Console\DashboardController::__invoke
* @see app/Http/Controllers/Console/DashboardController.php:14
* @route '/console'
*/
const DashboardControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: DashboardController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\DashboardController::__invoke
* @see app/Http/Controllers/Console/DashboardController.php:14
* @route '/console'
*/
DashboardControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: DashboardController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\DashboardController::__invoke
* @see app/Http/Controllers/Console/DashboardController.php:14
* @route '/console'
*/
DashboardControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: DashboardController.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

DashboardController.form = DashboardControllerForm

export default DashboardController