import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\BillingsWebhookController::__invoke
* @see app/Http/Controllers/BillingsWebhookController.php:25
* @route '/webhooks/billings'
*/
export const billings = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: billings.url(options),
    method: 'post',
})

billings.definition = {
    methods: ["post"],
    url: '/webhooks/billings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BillingsWebhookController::__invoke
* @see app/Http/Controllers/BillingsWebhookController.php:25
* @route '/webhooks/billings'
*/
billings.url = (options?: RouteQueryOptions) => {
    return billings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BillingsWebhookController::__invoke
* @see app/Http/Controllers/BillingsWebhookController.php:25
* @route '/webhooks/billings'
*/
billings.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: billings.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BillingsWebhookController::__invoke
* @see app/Http/Controllers/BillingsWebhookController.php:25
* @route '/webhooks/billings'
*/
const billingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: billings.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BillingsWebhookController::__invoke
* @see app/Http/Controllers/BillingsWebhookController.php:25
* @route '/webhooks/billings'
*/
billingsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: billings.url(options),
    method: 'post',
})

billings.form = billingsForm

const webhooks = {
    billings: Object.assign(billings, billings),
}

export default webhooks