import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Console\BillingController::settings
* @see app/Http/Controllers/Console/BillingController.php:59
* @route '/console/billing/settings'
*/
export const settings = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: settings.url(options),
    method: 'post',
})

settings.definition = {
    methods: ["post"],
    url: '/console/billing/settings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Console\BillingController::settings
* @see app/Http/Controllers/Console/BillingController.php:59
* @route '/console/billing/settings'
*/
settings.url = (options?: RouteQueryOptions) => {
    return settings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Console\BillingController::settings
* @see app/Http/Controllers/Console/BillingController.php:59
* @route '/console/billing/settings'
*/
settings.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: settings.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Console\BillingController::settings
* @see app/Http/Controllers/Console/BillingController.php:59
* @route '/console/billing/settings'
*/
const settingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: settings.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Console\BillingController::settings
* @see app/Http/Controllers/Console/BillingController.php:59
* @route '/console/billing/settings'
*/
settingsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: settings.url(options),
    method: 'post',
})

settings.form = settingsForm

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
* @see \App\Http\Controllers\Console\BillingController::topup
* @see app/Http/Controllers/Console/BillingController.php:76
* @route '/console/billing/topup'
*/
const topupForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: topup.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Console\BillingController::topup
* @see app/Http/Controllers/Console/BillingController.php:76
* @route '/console/billing/topup'
*/
topupForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: topup.url(options),
    method: 'post',
})

topup.form = topupForm

/**
* @see \App\Http\Controllers\Console\BillingController::card
* @see app/Http/Controllers/Console/BillingController.php:84
* @route '/console/billing/card'
*/
export const card = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: card.url(options),
    method: 'post',
})

card.definition = {
    methods: ["post"],
    url: '/console/billing/card',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Console\BillingController::card
* @see app/Http/Controllers/Console/BillingController.php:84
* @route '/console/billing/card'
*/
card.url = (options?: RouteQueryOptions) => {
    return card.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Console\BillingController::card
* @see app/Http/Controllers/Console/BillingController.php:84
* @route '/console/billing/card'
*/
card.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: card.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Console\BillingController::card
* @see app/Http/Controllers/Console/BillingController.php:84
* @route '/console/billing/card'
*/
const cardForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: card.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Console\BillingController::card
* @see app/Http/Controllers/Console/BillingController.php:84
* @route '/console/billing/card'
*/
cardForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: card.url(options),
    method: 'post',
})

card.form = cardForm

const billing = {
    settings: Object.assign(settings, settings),
    topup: Object.assign(topup, topup),
    card: Object.assign(card, card),
}

export default billing