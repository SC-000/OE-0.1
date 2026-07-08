import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:347
* @route '/console/admin/model-rate'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/console/admin/model-rate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:347
* @route '/console/admin/model-rate'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:347
* @route '/console/admin/model-rate'
*/
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:347
* @route '/console/admin/model-rate'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:347
* @route '/console/admin/model-rate'
*/
updateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

update.form = updateForm

const modelRate = {
    update: Object.assign(update, update),
}

export default modelRate