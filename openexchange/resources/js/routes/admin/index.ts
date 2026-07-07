import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import clients from './clients'
import keys from './keys'
import rate from './rate'
import backends from './backends'
import balance from './balance'
import client from './client'
import modelRate from './model-rate'
import accessKey from './access-key'
import usage from './usage'
/**
* @see \App\Http\Controllers\Admin\AdminController::sync
* @see app/Http/Controllers/Admin/AdminController.php:203
* @route '/console/admin/sync'
*/
export const sync = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

sync.definition = {
    methods: ["post"],
    url: '/console/admin/sync',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::sync
* @see app/Http/Controllers/Admin/AdminController.php:203
* @route '/console/admin/sync'
*/
sync.url = (options?: RouteQueryOptions) => {
    return sync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::sync
* @see app/Http/Controllers/Admin/AdminController.php:203
* @route '/console/admin/sync'
*/
sync.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::sync
* @see app/Http/Controllers/Admin/AdminController.php:203
* @route '/console/admin/sync'
*/
const syncForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::sync
* @see app/Http/Controllers/Admin/AdminController.php:203
* @route '/console/admin/sync'
*/
syncForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

sync.form = syncForm

const admin = {
    clients: Object.assign(clients, clients),
    keys: Object.assign(keys, keys),
    rate: Object.assign(rate, rate),
    backends: Object.assign(backends, backends),
    balance: Object.assign(balance, balance),
    client: Object.assign(client, client),
    modelRate: Object.assign(modelRate, modelRate),
    accessKey: Object.assign(accessKey, accessKey),
    usage: Object.assign(usage, usage),
    sync: Object.assign(sync, sync),
}

export default admin