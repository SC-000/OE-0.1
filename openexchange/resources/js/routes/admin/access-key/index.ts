import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminController::create
* @see app/Http/Controllers/Admin/AdminController.php:195
* @route '/console/admin/access-key'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/console/admin/access-key',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::create
* @see app/Http/Controllers/Admin/AdminController.php:195
* @route '/console/admin/access-key'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::create
* @see app/Http/Controllers/Admin/AdminController.php:195
* @route '/console/admin/access-key'
*/
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::create
* @see app/Http/Controllers/Admin/AdminController.php:195
* @route '/console/admin/access-key'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::create
* @see app/Http/Controllers/Admin/AdminController.php:195
* @route '/console/admin/access-key'
*/
createForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: create.url(options),
    method: 'post',
})

create.form = createForm

/**
* @see \App\Http\Controllers\Admin\AdminController::revoke
* @see app/Http/Controllers/Admin/AdminController.php:459
* @route '/console/admin/access-key/revoke'
*/
export const revoke = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revoke.url(options),
    method: 'post',
})

revoke.definition = {
    methods: ["post"],
    url: '/console/admin/access-key/revoke',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::revoke
* @see app/Http/Controllers/Admin/AdminController.php:459
* @route '/console/admin/access-key/revoke'
*/
revoke.url = (options?: RouteQueryOptions) => {
    return revoke.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::revoke
* @see app/Http/Controllers/Admin/AdminController.php:459
* @route '/console/admin/access-key/revoke'
*/
revoke.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revoke.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::revoke
* @see app/Http/Controllers/Admin/AdminController.php:459
* @route '/console/admin/access-key/revoke'
*/
const revokeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: revoke.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::revoke
* @see app/Http/Controllers/Admin/AdminController.php:459
* @route '/console/admin/access-key/revoke'
*/
revokeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: revoke.url(options),
    method: 'post',
})

revoke.form = revokeForm

const accessKey = {
    create: Object.assign(create, create),
    revoke: Object.assign(revoke, revoke),
}

export default accessKey