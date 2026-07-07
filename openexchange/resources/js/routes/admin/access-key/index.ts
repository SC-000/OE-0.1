import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminController::create
* @see app/Http/Controllers/Admin/AdminController.php:91
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
* @see app/Http/Controllers/Admin/AdminController.php:91
* @route '/console/admin/access-key'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::create
* @see app/Http/Controllers/Admin/AdminController.php:91
* @route '/console/admin/access-key'
*/
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::create
* @see app/Http/Controllers/Admin/AdminController.php:91
* @route '/console/admin/access-key'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::create
* @see app/Http/Controllers/Admin/AdminController.php:91
* @route '/console/admin/access-key'
*/
createForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: create.url(options),
    method: 'post',
})

create.form = createForm

const accessKey = {
    create: Object.assign(create, create),
}

export default accessKey