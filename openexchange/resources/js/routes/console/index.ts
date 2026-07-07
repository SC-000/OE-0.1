import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import sources4cea9d from './sources'
import billingFfcdcb from './billing'
/**
* @see \App\Http\Controllers\Console\UsageController::__invoke
* @see app/Http/Controllers/Console/UsageController.php:13
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
* @see app/Http/Controllers/Console/UsageController.php:13
* @route '/console/usage'
*/
usage.url = (options?: RouteQueryOptions) => {
    return usage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Console\UsageController::__invoke
* @see app/Http/Controllers/Console/UsageController.php:13
* @route '/console/usage'
*/
usage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: usage.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\UsageController::__invoke
* @see app/Http/Controllers/Console/UsageController.php:13
* @route '/console/usage'
*/
usage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: usage.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Console\UsageController::__invoke
* @see app/Http/Controllers/Console/UsageController.php:13
* @route '/console/usage'
*/
const usageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: usage.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\UsageController::__invoke
* @see app/Http/Controllers/Console/UsageController.php:13
* @route '/console/usage'
*/
usageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: usage.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\UsageController::__invoke
* @see app/Http/Controllers/Console/UsageController.php:13
* @route '/console/usage'
*/
usageForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: usage.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

usage.form = usageForm

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
* @see \App\Http\Controllers\Console\SourcesController::sources
* @see app/Http/Controllers/Console/SourcesController.php:14
* @route '/console/sources'
*/
const sourcesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: sources.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\SourcesController::sources
* @see app/Http/Controllers/Console/SourcesController.php:14
* @route '/console/sources'
*/
sourcesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: sources.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\SourcesController::sources
* @see app/Http/Controllers/Console/SourcesController.php:14
* @route '/console/sources'
*/
sourcesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: sources.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

sources.form = sourcesForm

/**
* @see \App\Http\Controllers\Console\BillingController::billing
* @see app/Http/Controllers/Console/BillingController.php:16
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
* @see app/Http/Controllers/Console/BillingController.php:16
* @route '/console/billing'
*/
billing.url = (options?: RouteQueryOptions) => {
    return billing.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Console\BillingController::billing
* @see app/Http/Controllers/Console/BillingController.php:16
* @route '/console/billing'
*/
billing.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: billing.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\BillingController::billing
* @see app/Http/Controllers/Console/BillingController.php:16
* @route '/console/billing'
*/
billing.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: billing.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Console\BillingController::billing
* @see app/Http/Controllers/Console/BillingController.php:16
* @route '/console/billing'
*/
const billingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: billing.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\BillingController::billing
* @see app/Http/Controllers/Console/BillingController.php:16
* @route '/console/billing'
*/
billingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: billing.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\BillingController::billing
* @see app/Http/Controllers/Console/BillingController.php:16
* @route '/console/billing'
*/
billingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: billing.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

billing.form = billingForm

/**
* @see \App\Http\Controllers\Console\BillingController::addCard
* @see app/Http/Controllers/Console/BillingController.php:100
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
* @see app/Http/Controllers/Console/BillingController.php:100
* @route '/console/billing/add-card'
*/
addCard.url = (options?: RouteQueryOptions) => {
    return addCard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Console\BillingController::addCard
* @see app/Http/Controllers/Console/BillingController.php:100
* @route '/console/billing/add-card'
*/
addCard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: addCard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\BillingController::addCard
* @see app/Http/Controllers/Console/BillingController.php:100
* @route '/console/billing/add-card'
*/
addCard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: addCard.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Console\BillingController::addCard
* @see app/Http/Controllers/Console/BillingController.php:100
* @route '/console/billing/add-card'
*/
const addCardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: addCard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\BillingController::addCard
* @see app/Http/Controllers/Console/BillingController.php:100
* @route '/console/billing/add-card'
*/
addCardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: addCard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Console\BillingController::addCard
* @see app/Http/Controllers/Console/BillingController.php:100
* @route '/console/billing/add-card'
*/
addCardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: addCard.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

addCard.form = addCardForm

/**
* @see \App\Http\Controllers\Admin\AdminController::admin
* @see app/Http/Controllers/Admin/AdminController.php:26
* @route '/console/admin'
*/
export const admin = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: admin.url(options),
    method: 'get',
})

admin.definition = {
    methods: ["get","head"],
    url: '/console/admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::admin
* @see app/Http/Controllers/Admin/AdminController.php:26
* @route '/console/admin'
*/
admin.url = (options?: RouteQueryOptions) => {
    return admin.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::admin
* @see app/Http/Controllers/Admin/AdminController.php:26
* @route '/console/admin'
*/
admin.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: admin.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::admin
* @see app/Http/Controllers/Admin/AdminController.php:26
* @route '/console/admin'
*/
admin.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: admin.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::admin
* @see app/Http/Controllers/Admin/AdminController.php:26
* @route '/console/admin'
*/
const adminForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: admin.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::admin
* @see app/Http/Controllers/Admin/AdminController.php:26
* @route '/console/admin'
*/
adminForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: admin.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::admin
* @see app/Http/Controllers/Admin/AdminController.php:26
* @route '/console/admin'
*/
adminForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: admin.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

admin.form = adminForm

const console = {
    usage: Object.assign(usage, usage),
    sources: Object.assign(sources, sources4cea9d),
    billing: Object.assign(billing, billingFfcdcb),
    addCard: Object.assign(addCard, addCard),
    admin: Object.assign(admin, admin),
}

export default console