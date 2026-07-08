import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminController::store
* @see app/Http/Controllers/Admin/AdminController.php:385
* @route '/console/admin/model'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/console/admin/model',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::store
* @see app/Http/Controllers/Admin/AdminController.php:385
* @route '/console/admin/model'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::store
* @see app/Http/Controllers/Admin/AdminController.php:385
* @route '/console/admin/model'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::store
* @see app/Http/Controllers/Admin/AdminController.php:385
* @route '/console/admin/model'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::store
* @see app/Http/Controllers/Admin/AdminController.php:385
* @route '/console/admin/model'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:402
* @route '/console/admin/model/update'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/console/admin/model/update',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:402
* @route '/console/admin/model/update'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:402
* @route '/console/admin/model/update'
*/
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:402
* @route '/console/admin/model/update'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:402
* @route '/console/admin/model/update'
*/
updateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

update.form = updateForm

const model = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
}

export default model