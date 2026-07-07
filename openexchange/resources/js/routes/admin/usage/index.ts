import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminController::add
* @see app/Http/Controllers/Admin/AdminController.php:104
* @route '/console/admin/usage'
*/
export const add = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: add.url(options),
    method: 'post',
})

add.definition = {
    methods: ["post"],
    url: '/console/admin/usage',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::add
* @see app/Http/Controllers/Admin/AdminController.php:104
* @route '/console/admin/usage'
*/
add.url = (options?: RouteQueryOptions) => {
    return add.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::add
* @see app/Http/Controllers/Admin/AdminController.php:104
* @route '/console/admin/usage'
*/
add.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: add.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::add
* @see app/Http/Controllers/Admin/AdminController.php:104
* @route '/console/admin/usage'
*/
const addForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: add.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::add
* @see app/Http/Controllers/Admin/AdminController.php:104
* @route '/console/admin/usage'
*/
addForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: add.url(options),
    method: 'post',
})

add.form = addForm

const usage = {
    add: Object.assign(add, add),
}

export default usage