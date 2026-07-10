import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AuditController::index
* @see app/Http/Controllers/Admin/AuditController.php:12
* @route '/admin/audit'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/audit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AuditController::index
* @see app/Http/Controllers/Admin/AuditController.php:12
* @route '/admin/audit'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AuditController::index
* @see app/Http/Controllers/Admin/AuditController.php:12
* @route '/admin/audit'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AuditController::index
* @see app/Http/Controllers/Admin/AuditController.php:12
* @route '/admin/audit'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const AuditController = { index }

export default AuditController