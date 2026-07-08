import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:349
* @route '/console/admin/client'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/console/admin/client',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:349
* @route '/console/admin/client'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:349
* @route '/console/admin/client'
*/
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:349
* @route '/console/admin/client'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:349
* @route '/console/admin/client'
*/
updateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Admin\AdminController::manage
* @see app/Http/Controllers/Admin/AdminController.php:174
* @route '/console/admin/client/{client}'
*/
export const manage = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manage.url(args, options),
    method: 'get',
})

manage.definition = {
    methods: ["get","head"],
    url: '/console/admin/client/{client}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::manage
* @see app/Http/Controllers/Admin/AdminController.php:174
* @route '/console/admin/client/{client}'
*/
manage.url = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return manage.definition.url
            .replace('{client}', parsedArgs.client.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::manage
* @see app/Http/Controllers/Admin/AdminController.php:174
* @route '/console/admin/client/{client}'
*/
manage.get = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manage.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::manage
* @see app/Http/Controllers/Admin/AdminController.php:174
* @route '/console/admin/client/{client}'
*/
manage.head = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: manage.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::manage
* @see app/Http/Controllers/Admin/AdminController.php:174
* @route '/console/admin/client/{client}'
*/
const manageForm = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manage.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::manage
* @see app/Http/Controllers/Admin/AdminController.php:174
* @route '/console/admin/client/{client}'
*/
manageForm.get = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manage.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::manage
* @see app/Http/Controllers/Admin/AdminController.php:174
* @route '/console/admin/client/{client}'
*/
manageForm.head = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manage.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

manage.form = manageForm

/**
* @see \App\Http\Controllers\Admin\AdminController::deleteMethod
* @see app/Http/Controllers/Admin/AdminController.php:428
* @route '/console/admin/client/delete'
*/
export const deleteMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deleteMethod.url(options),
    method: 'post',
})

deleteMethod.definition = {
    methods: ["post"],
    url: '/console/admin/client/delete',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::deleteMethod
* @see app/Http/Controllers/Admin/AdminController.php:428
* @route '/console/admin/client/delete'
*/
deleteMethod.url = (options?: RouteQueryOptions) => {
    return deleteMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::deleteMethod
* @see app/Http/Controllers/Admin/AdminController.php:428
* @route '/console/admin/client/delete'
*/
deleteMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deleteMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::deleteMethod
* @see app/Http/Controllers/Admin/AdminController.php:428
* @route '/console/admin/client/delete'
*/
const deleteMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::deleteMethod
* @see app/Http/Controllers/Admin/AdminController.php:428
* @route '/console/admin/client/delete'
*/
deleteMethodForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteMethod.url(options),
    method: 'post',
})

deleteMethod.form = deleteMethodForm

const client = {
    update: Object.assign(update, update),
    manage: Object.assign(manage, manage),
    delete: Object.assign(deleteMethod, deleteMethod),
}

export default client