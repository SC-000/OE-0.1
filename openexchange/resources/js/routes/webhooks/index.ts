import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\BillingsWebhookController::__invoke
* @see app/Http/Controllers/BillingsWebhookController.php:26
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
* @see app/Http/Controllers/BillingsWebhookController.php:26
* @route '/webhooks/billings'
*/
billings.url = (options?: RouteQueryOptions) => {
    return billings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BillingsWebhookController::__invoke
* @see app/Http/Controllers/BillingsWebhookController.php:26
* @route '/webhooks/billings'
*/
billings.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: billings.url(options),
    method: 'post',
})

const webhooks = {
    billings: Object.assign(billings, billings),
}

export default webhooks