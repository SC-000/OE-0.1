import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\BillingsWebhookController::__invoke
* @see app/Http/Controllers/BillingsWebhookController.php:23
* @route '/webhooks/billings'
*/
const BillingsWebhookController = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: BillingsWebhookController.url(options),
    method: 'post',
})

BillingsWebhookController.definition = {
    methods: ["post"],
    url: '/webhooks/billings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BillingsWebhookController::__invoke
* @see app/Http/Controllers/BillingsWebhookController.php:23
* @route '/webhooks/billings'
*/
BillingsWebhookController.url = (options?: RouteQueryOptions) => {
    return BillingsWebhookController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BillingsWebhookController::__invoke
* @see app/Http/Controllers/BillingsWebhookController.php:23
* @route '/webhooks/billings'
*/
BillingsWebhookController.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: BillingsWebhookController.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BillingsWebhookController::__invoke
* @see app/Http/Controllers/BillingsWebhookController.php:23
* @route '/webhooks/billings'
*/
const BillingsWebhookControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: BillingsWebhookController.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BillingsWebhookController::__invoke
* @see app/Http/Controllers/BillingsWebhookController.php:23
* @route '/webhooks/billings'
*/
BillingsWebhookControllerForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: BillingsWebhookController.url(options),
    method: 'post',
})

BillingsWebhookController.form = BillingsWebhookControllerForm

export default BillingsWebhookController