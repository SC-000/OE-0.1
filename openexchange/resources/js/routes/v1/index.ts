import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
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

const v1 = {
    chat: Object.assign(chat, chat),
    models: Object.assign(models, models),
}

export default v1