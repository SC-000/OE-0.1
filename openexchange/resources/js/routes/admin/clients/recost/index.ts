import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ClientsController::preview
* @see app/Http/Controllers/Admin/ClientsController.php:431
* @route '/admin/clients/{client}/recost/preview'
*/
export const preview = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(args, options),
    method: 'post',
})

preview.definition = {
    methods: ["post"],
    url: '/admin/clients/{client}/recost/preview',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ClientsController::preview
* @see app/Http/Controllers/Admin/ClientsController.php:431
* @route '/admin/clients/{client}/recost/preview'
*/
preview.url = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return preview.definition.url
            .replace('{client}', parsedArgs.client.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ClientsController::preview
* @see app/Http/Controllers/Admin/ClientsController.php:431
* @route '/admin/clients/{client}/recost/preview'
*/
preview.post = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::preview
* @see app/Http/Controllers/Admin/ClientsController.php:431
* @route '/admin/clients/{client}/recost/preview'
*/
const previewForm = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: preview.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::preview
* @see app/Http/Controllers/Admin/ClientsController.php:431
* @route '/admin/clients/{client}/recost/preview'
*/
previewForm.post = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: preview.url(args, options),
    method: 'post',
})

preview.form = previewForm
