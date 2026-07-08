import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:486
* @route '/console/admin/client-model-rate'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/console/admin/client-model-rate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:486
* @route '/console/admin/client-model-rate'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:486
* @route '/console/admin/client-model-rate'
*/
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:486
* @route '/console/admin/client-model-rate'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:486
* @route '/console/admin/client-model-rate'
*/
updateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Admin\AdminController::deleteMethod
* @see app/Http/Controllers/Admin/AdminController.php:503
* @route '/console/admin/client-model-rate/delete'
*/
export const deleteMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deleteMethod.url(options),
    method: 'post',
})

deleteMethod.definition = {
    methods: ["post"],
    url: '/console/admin/client-model-rate/delete',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::deleteMethod
* @see app/Http/Controllers/Admin/AdminController.php:503
* @route '/console/admin/client-model-rate/delete'
*/
deleteMethod.url = (options?: RouteQueryOptions) => {
    return deleteMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::deleteMethod
* @see app/Http/Controllers/Admin/AdminController.php:503
* @route '/console/admin/client-model-rate/delete'
*/
deleteMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deleteMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::deleteMethod
* @see app/Http/Controllers/Admin/AdminController.php:503
* @route '/console/admin/client-model-rate/delete'
*/
const deleteMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::deleteMethod
* @see app/Http/Controllers/Admin/AdminController.php:503
* @route '/console/admin/client-model-rate/delete'
*/
deleteMethodForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteMethod.url(options),
    method: 'post',
})

deleteMethod.form = deleteMethodForm

const clientModelRate = {
    update: Object.assign(update, update),
    delete: Object.assign(deleteMethod, deleteMethod),
}

export default clientModelRate