import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\GatewayController::chat
* @see app/Http/Controllers/GatewayController.php:17
* @route '/v1/chat'
*/
export const chat = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chat.url(options),
    method: 'post',
})

chat.definition = {
    methods: ["post"],
    url: '/v1/chat',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\GatewayController::chat
* @see app/Http/Controllers/GatewayController.php:17
* @route '/v1/chat'
*/
chat.url = (options?: RouteQueryOptions) => {
    return chat.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GatewayController::chat
* @see app/Http/Controllers/GatewayController.php:17
* @route '/v1/chat'
*/
chat.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chat.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GatewayController::chat
* @see app/Http/Controllers/GatewayController.php:17
* @route '/v1/chat'
*/
const chatForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: chat.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GatewayController::chat
* @see app/Http/Controllers/GatewayController.php:17
* @route '/v1/chat'
*/
chatForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: chat.url(options),
    method: 'post',
})

chat.form = chatForm

/**
* @see \App\Http\Controllers\GatewayController::models
* @see app/Http/Controllers/GatewayController.php:43
* @route '/v1/models'
*/
export const models = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: models.url(options),
    method: 'get',
})

models.definition = {
    methods: ["get","head"],
    url: '/v1/models',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GatewayController::models
* @see app/Http/Controllers/GatewayController.php:43
* @route '/v1/models'
*/
models.url = (options?: RouteQueryOptions) => {
    return models.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GatewayController::models
* @see app/Http/Controllers/GatewayController.php:43
* @route '/v1/models'
*/
models.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: models.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GatewayController::models
* @see app/Http/Controllers/GatewayController.php:43
* @route '/v1/models'
*/
models.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: models.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\GatewayController::models
* @see app/Http/Controllers/GatewayController.php:43
* @route '/v1/models'
*/
const modelsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: models.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GatewayController::models
* @see app/Http/Controllers/GatewayController.php:43
* @route '/v1/models'
*/
modelsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: models.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GatewayController::models
* @see app/Http/Controllers/GatewayController.php:43
* @route '/v1/models'
*/
modelsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: models.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

models.form = modelsForm

const GatewayController = { chat, models }

export default GatewayController