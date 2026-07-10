import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
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
* @see \App\Http\Controllers\Admin\RatesController::deleteMethod
* @see app/Http/Controllers/Admin/RatesController.php:75
* @route '/admin/rates/delete'
*/
export const deleteMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deleteMethod.url(options),
    method: 'post',
})

deleteMethod.definition = {
    methods: ["post"],
    url: '/admin/rates/delete',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\RatesController::deleteMethod
* @see app/Http/Controllers/Admin/RatesController.php:75
* @route '/admin/rates/delete'
*/
deleteMethod.url = (options?: RouteQueryOptions) => {
    return deleteMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\RatesController::deleteMethod
* @see app/Http/Controllers/Admin/RatesController.php:75
* @route '/admin/rates/delete'
*/
deleteMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deleteMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\RatesController::defaultMethod
* @see app/Http/Controllers/Admin/RatesController.php:89
* @route '/admin/rates/default'
*/
export const defaultMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: defaultMethod.url(options),
    method: 'post',
})

defaultMethod.definition = {
    methods: ["post"],
    url: '/admin/rates/default',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\RatesController::defaultMethod
* @see app/Http/Controllers/Admin/RatesController.php:89
* @route '/admin/rates/default'
*/
defaultMethod.url = (options?: RouteQueryOptions) => {
    return defaultMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\RatesController::defaultMethod
* @see app/Http/Controllers/Admin/RatesController.php:89
* @route '/admin/rates/default'
*/
defaultMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: defaultMethod.url(options),
    method: 'post',
})

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

const rates = {
    upsert: Object.assign(upsert, upsert),
    delete: Object.assign(deleteMethod, deleteMethod),
    default: Object.assign(defaultMethod, defaultMethod),
    preview: Object.assign(preview, preview),
}

export default rates