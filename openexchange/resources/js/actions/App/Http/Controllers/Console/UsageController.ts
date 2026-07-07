import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Console\UsageController::__invoke
* @see app/Http/Controllers/Console/UsageController.php:13
* @route '/console/usage'
*/
const UsageController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: UsageController.url(options),
    method: 'get',
})

UsageController.definition = {
    methods: ["get","head"],
    url: '/console/usage',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Console\UsageController::__invoke
* @see app/Http/Controllers/Console/UsageController.php:13
* @route '/console/usage'
*/
UsageController.url = (options?: RouteQueryOptions) => {
    return UsageController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Console\UsageController::__invoke
* @see app/Http/Controllers/Console/UsageController.php:13
* @route '/console/usage'
*/
UsageController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: UsageController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\UsageController::__invoke
* @see app/Http/Controllers/Console/UsageController.php:13
* @route '/console/usage'
*/
UsageController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: UsageController.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Console\UsageController::__invoke
* @see app/Http/Controllers/Console/UsageController.php:13
* @route '/console/usage'
*/
const UsageControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: UsageController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\UsageController::__invoke
* @see app/Http/Controllers/Console/UsageController.php:13
* @route '/console/usage'
*/
UsageControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: UsageController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\UsageController::__invoke
* @see app/Http/Controllers/Console/UsageController.php:13
* @route '/console/usage'
*/
UsageControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: UsageController.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

UsageController.form = UsageControllerForm

export default UsageController