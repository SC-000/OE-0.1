import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import sources4cea9d from './sources'
import billingFfcdcb from './billing'
/**
* @see \App\Http\Controllers\Console\UsageController::__invoke
* @see app/Http/Controllers/Console/UsageController.php:16
* @route '/console/usage'
*/
export const usage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: usage.url(options),
    method: 'get',
})

usage.definition = {
    methods: ["get","head"],
    url: '/console/usage',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Console\UsageController::__invoke
* @see app/Http/Controllers/Console/UsageController.php:16
* @route '/console/usage'
*/
usage.url = (options?: RouteQueryOptions) => {
    return usage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Console\UsageController::__invoke
* @see app/Http/Controllers/Console/UsageController.php:16
* @route '/console/usage'
*/
usage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: usage.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\UsageController::__invoke
* @see app/Http/Controllers/Console/UsageController.php:16
* @route '/console/usage'
*/
usage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: usage.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Console\SourcesController::sources
* @see app/Http/Controllers/Console/SourcesController.php:14
* @route '/console/sources'
*/
export const sources = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sources.url(options),
    method: 'get',
})

sources.definition = {
    methods: ["get","head"],
    url: '/console/sources',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Console\SourcesController::sources
* @see app/Http/Controllers/Console/SourcesController.php:14
* @route '/console/sources'
*/
sources.url = (options?: RouteQueryOptions) => {
    return sources.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Console\SourcesController::sources
* @see app/Http/Controllers/Console/SourcesController.php:14
* @route '/console/sources'
*/
sources.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sources.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\SourcesController::sources
* @see app/Http/Controllers/Console/SourcesController.php:14
* @route '/console/sources'
*/
sources.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: sources.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Console\BillingController::billing
* @see app/Http/Controllers/Console/BillingController.php:17
* @route '/console/billing'
*/
export const billing = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: billing.url(options),
    method: 'get',
})

billing.definition = {
    methods: ["get","head"],
    url: '/console/billing',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Console\BillingController::billing
* @see app/Http/Controllers/Console/BillingController.php:17
* @route '/console/billing'
*/
billing.url = (options?: RouteQueryOptions) => {
    return billing.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Console\BillingController::billing
* @see app/Http/Controllers/Console/BillingController.php:17
* @route '/console/billing'
*/
billing.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: billing.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\BillingController::billing
* @see app/Http/Controllers/Console/BillingController.php:17
* @route '/console/billing'
*/
billing.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: billing.url(options),
    method: 'head',
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

const console = {
    usage: Object.assign(usage, usage),
    sources: Object.assign(sources, sources4cea9d),
    billing: Object.assign(billing, billingFfcdcb),
    addCard: Object.assign(addCard, addCard),
}

export default console