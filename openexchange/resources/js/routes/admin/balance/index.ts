import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminController::adjust
* @see app/Http/Controllers/Admin/AdminController.php:316
* @route '/console/admin/balance'
*/
export const adjust = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjust.url(options),
    method: 'post',
})

adjust.definition = {
    methods: ["post"],
    url: '/console/admin/balance',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::adjust
* @see app/Http/Controllers/Admin/AdminController.php:316
* @route '/console/admin/balance'
*/
adjust.url = (options?: RouteQueryOptions) => {
    return adjust.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::adjust
* @see app/Http/Controllers/Admin/AdminController.php:316
* @route '/console/admin/balance'
*/
adjust.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjust.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::adjust
* @see app/Http/Controllers/Admin/AdminController.php:316
* @route '/console/admin/balance'
*/
const adjustForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: adjust.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::adjust
* @see app/Http/Controllers/Admin/AdminController.php:316
* @route '/console/admin/balance'
*/
adjustForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: adjust.url(options),
    method: 'post',
})

adjust.form = adjustForm

const balance = {
    adjust: Object.assign(adjust, adjust),
}

export default balance