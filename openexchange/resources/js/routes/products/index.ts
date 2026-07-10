import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/ai-router'
*/
export const aiRouter = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: aiRouter.url(options),
    method: 'get',
})

aiRouter.definition = {
    methods: ["get","head"],
    url: '/products/ai-router',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/ai-router'
*/
aiRouter.url = (options?: RouteQueryOptions) => {
    return aiRouter.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/ai-router'
*/
aiRouter.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: aiRouter.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/ai-router'
*/
aiRouter.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: aiRouter.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/ai-router'
*/
const aiRouterForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: aiRouter.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/ai-router'
*/
aiRouterForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: aiRouter.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/ai-router'
*/
aiRouterForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: aiRouter.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

aiRouter.form = aiRouterForm

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/hyperquay'
*/
export const hyperquay = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: hyperquay.url(options),
    method: 'get',
})

hyperquay.definition = {
    methods: ["get","head"],
    url: '/products/hyperquay',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/hyperquay'
*/
hyperquay.url = (options?: RouteQueryOptions) => {
    return hyperquay.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/hyperquay'
*/
hyperquay.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: hyperquay.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/hyperquay'
*/
hyperquay.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: hyperquay.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/hyperquay'
*/
const hyperquayForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: hyperquay.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/hyperquay'
*/
hyperquayForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: hyperquay.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/hyperquay'
*/
hyperquayForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: hyperquay.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

hyperquay.form = hyperquayForm

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/exchange'
*/
export const exchange = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exchange.url(options),
    method: 'get',
})

exchange.definition = {
    methods: ["get","head"],
    url: '/products/exchange',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/exchange'
*/
exchange.url = (options?: RouteQueryOptions) => {
    return exchange.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/exchange'
*/
exchange.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exchange.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/exchange'
*/
exchange.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exchange.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/exchange'
*/
const exchangeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exchange.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/exchange'
*/
exchangeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exchange.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/exchange'
*/
exchangeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exchange.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exchange.form = exchangeForm

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/openexchange'
*/
export const openexchange = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: openexchange.url(options),
    method: 'get',
})

openexchange.definition = {
    methods: ["get","head"],
    url: '/products/openexchange',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/openexchange'
*/
openexchange.url = (options?: RouteQueryOptions) => {
    return openexchange.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/openexchange'
*/
openexchange.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: openexchange.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/openexchange'
*/
openexchange.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: openexchange.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/openexchange'
*/
const openexchangeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: openexchange.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/openexchange'
*/
openexchangeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: openexchange.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/openexchange'
*/
openexchangeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: openexchange.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

openexchange.form = openexchangeForm

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/data'
*/
export const data = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: data.url(options),
    method: 'get',
})

data.definition = {
    methods: ["get","head"],
    url: '/products/data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/data'
*/
data.url = (options?: RouteQueryOptions) => {
    return data.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/data'
*/
data.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: data.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/data'
*/
data.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: data.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/data'
*/
const dataForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: data.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/data'
*/
dataForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: data.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/data'
*/
dataForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: data.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

data.form = dataForm

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/services'
*/
export const services = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: services.url(options),
    method: 'get',
})

services.definition = {
    methods: ["get","head"],
    url: '/products/services',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/services'
*/
services.url = (options?: RouteQueryOptions) => {
    return services.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/services'
*/
services.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: services.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/services'
*/
services.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: services.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/services'
*/
const servicesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: services.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/services'
*/
servicesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: services.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/services'
*/
servicesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: services.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

services.form = servicesForm

const products = {
    aiRouter: Object.assign(aiRouter, aiRouter),
    hyperquay: Object.assign(hyperquay, hyperquay),
    exchange: Object.assign(exchange, exchange),
    openexchange: Object.assign(openexchange, openexchange),
    data: Object.assign(data, data),
    services: Object.assign(services, services),
}

export default products