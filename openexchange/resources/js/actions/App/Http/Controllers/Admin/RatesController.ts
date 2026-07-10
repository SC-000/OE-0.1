import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\RatesController::upsert
* @see app/Http/Controllers/Admin/RatesController.php:26
* @route '/admin/rates'
*/
export const upsert = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upsert.url(options),
    method: 'post',
})

upsert.definition = {
    methods: ["post"],
    url: '/admin/rates',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\RatesController::upsert
* @see app/Http/Controllers/Admin/RatesController.php:26
* @route '/admin/rates'
*/
upsert.url = (options?: RouteQueryOptions) => {
    return upsert.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\RatesController::upsert
* @see app/Http/Controllers/Admin/RatesController.php:26
* @route '/admin/rates'
*/
upsert.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upsert.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\RatesController::upsert
* @see app/Http/Controllers/Admin/RatesController.php:26
* @route '/admin/rates'
*/
const upsertForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: upsert.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\RatesController::upsert
* @see app/Http/Controllers/Admin/RatesController.php:26
* @route '/admin/rates'
*/
upsertForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: upsert.url(options),
    method: 'post',
})

upsert.form = upsertForm

/**
* @see \App\Http\Controllers\Admin\RatesController::destroy
* @see app/Http/Controllers/Admin/RatesController.php:75
* @route '/admin/rates/delete'
*/
export const destroy = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: destroy.url(options),
    method: 'post',
})

destroy.definition = {
    methods: ["post"],
    url: '/admin/rates/delete',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\RatesController::destroy
* @see app/Http/Controllers/Admin/RatesController.php:75
* @route '/admin/rates/delete'
*/
destroy.url = (options?: RouteQueryOptions) => {
    return destroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\RatesController::destroy
* @see app/Http/Controllers/Admin/RatesController.php:75
* @route '/admin/rates/delete'
*/
destroy.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: destroy.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\RatesController::destroy
* @see app/Http/Controllers/Admin/RatesController.php:75
* @route '/admin/rates/delete'
*/
const destroyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\RatesController::destroy
* @see app/Http/Controllers/Admin/RatesController.php:75
* @route '/admin/rates/delete'
*/
destroyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(options),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\Admin\RatesController::updateDefault
* @see app/Http/Controllers/Admin/RatesController.php:89
* @route '/admin/rates/default'
*/
export const updateDefault = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateDefault.url(options),
    method: 'post',
})

updateDefault.definition = {
    methods: ["post"],
    url: '/admin/rates/default',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\RatesController::updateDefault
* @see app/Http/Controllers/Admin/RatesController.php:89
* @route '/admin/rates/default'
*/
updateDefault.url = (options?: RouteQueryOptions) => {
    return updateDefault.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\RatesController::updateDefault
* @see app/Http/Controllers/Admin/RatesController.php:89
* @route '/admin/rates/default'
*/
updateDefault.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateDefault.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\RatesController::updateDefault
* @see app/Http/Controllers/Admin/RatesController.php:89
* @route '/admin/rates/default'
*/
const updateDefaultForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateDefault.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\RatesController::updateDefault
* @see app/Http/Controllers/Admin/RatesController.php:89
* @route '/admin/rates/default'
*/
updateDefaultForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateDefault.url(options),
    method: 'post',
})

updateDefault.form = updateDefaultForm

/**
* @see \App\Http\Controllers\Admin\RatesController::preview
* @see app/Http/Controllers/Admin/RatesController.php:107
* @route '/admin/rates/preview'
*/
export const preview = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(options),
    method: 'post',
})

preview.definition = {
    methods: ["post"],
    url: '/admin/rates/preview',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\RatesController::preview
* @see app/Http/Controllers/Admin/RatesController.php:107
* @route '/admin/rates/preview'
*/
preview.url = (options?: RouteQueryOptions) => {
    return preview.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\RatesController::preview
* @see app/Http/Controllers/Admin/RatesController.php:107
* @route '/admin/rates/preview'
*/
preview.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\RatesController::preview
* @see app/Http/Controllers/Admin/RatesController.php:107
* @route '/admin/rates/preview'
*/
const previewForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: preview.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\RatesController::preview
* @see app/Http/Controllers/Admin/RatesController.php:107
* @route '/admin/rates/preview'
*/
previewForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: preview.url(options),
    method: 'post',
})

preview.form = previewForm

const RatesController = { upsert, destroy, updateDefault, preview }

export default RatesController