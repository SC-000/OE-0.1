import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Console\BillingController::index
* @see app/Http/Controllers/Console/BillingController.php:17
* @route '/console/billing'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/console/billing',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Console\BillingController::index
* @see app/Http/Controllers/Console/BillingController.php:17
* @route '/console/billing'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Console\BillingController::index
* @see app/Http/Controllers/Console/BillingController.php:17
* @route '/console/billing'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\BillingController::index
* @see app/Http/Controllers/Console/BillingController.php:17
* @route '/console/billing'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Console\BillingController::updateSettings
* @see app/Http/Controllers/Console/BillingController.php:59
* @route '/console/billing/settings'
*/
export const updateSettings = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateSettings.url(options),
    method: 'post',
})

updateSettings.definition = {
    methods: ["post"],
    url: '/console/billing/settings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Console\BillingController::updateSettings
* @see app/Http/Controllers/Console/BillingController.php:59
* @route '/console/billing/settings'
*/
updateSettings.url = (options?: RouteQueryOptions) => {
    return updateSettings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Console\BillingController::updateSettings
* @see app/Http/Controllers/Console/BillingController.php:59
* @route '/console/billing/settings'
*/
updateSettings.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateSettings.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Console\BillingController::topup
* @see app/Http/Controllers/Console/BillingController.php:76
* @route '/console/billing/topup'
*/
export const topup = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: topup.url(options),
    method: 'post',
})

topup.definition = {
    methods: ["post"],
    url: '/console/billing/topup',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Console\BillingController::topup
* @see app/Http/Controllers/Console/BillingController.php:76
* @route '/console/billing/topup'
*/
topup.url = (options?: RouteQueryOptions) => {
    return topup.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Console\BillingController::topup
* @see app/Http/Controllers/Console/BillingController.php:76
* @route '/console/billing/topup'
*/
topup.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: topup.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Console\BillingController::addCard
* @see app/Http/Controllers/Console/BillingController.php:121
* @route '/console/billing/add-card'
*/
export const addCard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: addCard.url(options),
    method: 'get',
})

addCard.definition = {
    methods: ["get","head"],
    url: '/console/billing/add-card',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Console\BillingController::addCard
* @see app/Http/Controllers/Console/BillingController.php:121
* @route '/console/billing/add-card'
*/
addCard.url = (options?: RouteQueryOptions) => {
    return addCard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Console\BillingController::addCard
* @see app/Http/Controllers/Console/BillingController.php:121
* @route '/console/billing/add-card'
*/
addCard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: addCard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\BillingController::addCard
* @see app/Http/Controllers/Console/BillingController.php:121
* @route '/console/billing/add-card'
*/
addCard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: addCard.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Console\BillingController::storeCard
* @see app/Http/Controllers/Console/BillingController.php:84
* @route '/console/billing/card'
*/
export const storeCard = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeCard.url(options),
    method: 'post',
})

storeCard.definition = {
    methods: ["post"],
    url: '/console/billing/card',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Console\BillingController::storeCard
* @see app/Http/Controllers/Console/BillingController.php:84
* @route '/console/billing/card'
*/
storeCard.url = (options?: RouteQueryOptions) => {
    return storeCard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Console\BillingController::storeCard
* @see app/Http/Controllers/Console/BillingController.php:84
* @route '/console/billing/card'
*/
storeCard.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeCard.url(options),
    method: 'post',
})

const BillingController = { index, updateSettings, topup, addCard, storeCard }

export default BillingController