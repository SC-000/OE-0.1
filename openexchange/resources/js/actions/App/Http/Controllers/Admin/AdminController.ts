import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:26
* @route '/console/admin'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/console/admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:26
* @route '/console/admin'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:26
* @route '/console/admin'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:26
* @route '/console/admin'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:26
* @route '/console/admin'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:26
* @route '/console/admin'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:26
* @route '/console/admin'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Admin\AdminController::storeClient
* @see app/Http/Controllers/Admin/AdminController.php:149
* @route '/console/admin/clients'
*/
export const storeClient = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeClient.url(options),
    method: 'post',
})

storeClient.definition = {
    methods: ["post"],
    url: '/console/admin/clients',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::storeClient
* @see app/Http/Controllers/Admin/AdminController.php:149
* @route '/console/admin/clients'
*/
storeClient.url = (options?: RouteQueryOptions) => {
    return storeClient.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::storeClient
* @see app/Http/Controllers/Admin/AdminController.php:149
* @route '/console/admin/clients'
*/
storeClient.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeClient.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::storeClient
* @see app/Http/Controllers/Admin/AdminController.php:149
* @route '/console/admin/clients'
*/
const storeClientForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeClient.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::storeClient
* @see app/Http/Controllers/Admin/AdminController.php:149
* @route '/console/admin/clients'
*/
storeClientForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeClient.url(options),
    method: 'post',
})

storeClient.form = storeClientForm

/**
* @see \App\Http\Controllers\Admin\AdminController::storeKey
* @see app/Http/Controllers/Admin/AdminController.php:177
* @route '/console/admin/keys'
*/
export const storeKey = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeKey.url(options),
    method: 'post',
})

storeKey.definition = {
    methods: ["post"],
    url: '/console/admin/keys',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::storeKey
* @see app/Http/Controllers/Admin/AdminController.php:177
* @route '/console/admin/keys'
*/
storeKey.url = (options?: RouteQueryOptions) => {
    return storeKey.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::storeKey
* @see app/Http/Controllers/Admin/AdminController.php:177
* @route '/console/admin/keys'
*/
storeKey.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::storeKey
* @see app/Http/Controllers/Admin/AdminController.php:177
* @route '/console/admin/keys'
*/
const storeKeyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::storeKey
* @see app/Http/Controllers/Admin/AdminController.php:177
* @route '/console/admin/keys'
*/
storeKeyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeKey.url(options),
    method: 'post',
})

storeKey.form = storeKeyForm

/**
* @see \App\Http\Controllers\Admin\AdminController::updateRate
* @see app/Http/Controllers/Admin/AdminController.php:192
* @route '/console/admin/rate'
*/
export const updateRate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateRate.url(options),
    method: 'post',
})

updateRate.definition = {
    methods: ["post"],
    url: '/console/admin/rate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::updateRate
* @see app/Http/Controllers/Admin/AdminController.php:192
* @route '/console/admin/rate'
*/
updateRate.url = (options?: RouteQueryOptions) => {
    return updateRate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::updateRate
* @see app/Http/Controllers/Admin/AdminController.php:192
* @route '/console/admin/rate'
*/
updateRate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateRate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::updateRate
* @see app/Http/Controllers/Admin/AdminController.php:192
* @route '/console/admin/rate'
*/
const updateRateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateRate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::updateRate
* @see app/Http/Controllers/Admin/AdminController.php:192
* @route '/console/admin/rate'
*/
updateRateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateRate.url(options),
    method: 'post',
})

updateRate.form = updateRateForm

/**
* @see \App\Http\Controllers\Admin\AdminController::storeBackend
* @see app/Http/Controllers/Admin/AdminController.php:134
* @route '/console/admin/backends'
*/
export const storeBackend = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeBackend.url(options),
    method: 'post',
})

storeBackend.definition = {
    methods: ["post"],
    url: '/console/admin/backends',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::storeBackend
* @see app/Http/Controllers/Admin/AdminController.php:134
* @route '/console/admin/backends'
*/
storeBackend.url = (options?: RouteQueryOptions) => {
    return storeBackend.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::storeBackend
* @see app/Http/Controllers/Admin/AdminController.php:134
* @route '/console/admin/backends'
*/
storeBackend.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeBackend.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::storeBackend
* @see app/Http/Controllers/Admin/AdminController.php:134
* @route '/console/admin/backends'
*/
const storeBackendForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeBackend.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::storeBackend
* @see app/Http/Controllers/Admin/AdminController.php:134
* @route '/console/admin/backends'
*/
storeBackendForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeBackend.url(options),
    method: 'post',
})

storeBackend.form = storeBackendForm

/**
* @see \App\Http\Controllers\Admin\AdminController::adjustBalance
* @see app/Http/Controllers/Admin/AdminController.php:212
* @route '/console/admin/balance'
*/
export const adjustBalance = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjustBalance.url(options),
    method: 'post',
})

adjustBalance.definition = {
    methods: ["post"],
    url: '/console/admin/balance',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::adjustBalance
* @see app/Http/Controllers/Admin/AdminController.php:212
* @route '/console/admin/balance'
*/
adjustBalance.url = (options?: RouteQueryOptions) => {
    return adjustBalance.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::adjustBalance
* @see app/Http/Controllers/Admin/AdminController.php:212
* @route '/console/admin/balance'
*/
adjustBalance.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjustBalance.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::adjustBalance
* @see app/Http/Controllers/Admin/AdminController.php:212
* @route '/console/admin/balance'
*/
const adjustBalanceForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: adjustBalance.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::adjustBalance
* @see app/Http/Controllers/Admin/AdminController.php:212
* @route '/console/admin/balance'
*/
adjustBalanceForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: adjustBalance.url(options),
    method: 'post',
})

adjustBalance.form = adjustBalanceForm

/**
* @see \App\Http\Controllers\Admin\AdminController::updateClient
* @see app/Http/Controllers/Admin/AdminController.php:227
* @route '/console/admin/client'
*/
export const updateClient = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateClient.url(options),
    method: 'post',
})

updateClient.definition = {
    methods: ["post"],
    url: '/console/admin/client',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::updateClient
* @see app/Http/Controllers/Admin/AdminController.php:227
* @route '/console/admin/client'
*/
updateClient.url = (options?: RouteQueryOptions) => {
    return updateClient.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::updateClient
* @see app/Http/Controllers/Admin/AdminController.php:227
* @route '/console/admin/client'
*/
updateClient.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateClient.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::updateClient
* @see app/Http/Controllers/Admin/AdminController.php:227
* @route '/console/admin/client'
*/
const updateClientForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateClient.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::updateClient
* @see app/Http/Controllers/Admin/AdminController.php:227
* @route '/console/admin/client'
*/
updateClientForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateClient.url(options),
    method: 'post',
})

updateClient.form = updateClientForm

/**
* @see \App\Http\Controllers\Admin\AdminController::updateModelRate
* @see app/Http/Controllers/Admin/AdminController.php:243
* @route '/console/admin/model-rate'
*/
export const updateModelRate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateModelRate.url(options),
    method: 'post',
})

updateModelRate.definition = {
    methods: ["post"],
    url: '/console/admin/model-rate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::updateModelRate
* @see app/Http/Controllers/Admin/AdminController.php:243
* @route '/console/admin/model-rate'
*/
updateModelRate.url = (options?: RouteQueryOptions) => {
    return updateModelRate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::updateModelRate
* @see app/Http/Controllers/Admin/AdminController.php:243
* @route '/console/admin/model-rate'
*/
updateModelRate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateModelRate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::updateModelRate
* @see app/Http/Controllers/Admin/AdminController.php:243
* @route '/console/admin/model-rate'
*/
const updateModelRateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateModelRate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::updateModelRate
* @see app/Http/Controllers/Admin/AdminController.php:243
* @route '/console/admin/model-rate'
*/
updateModelRateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateModelRate.url(options),
    method: 'post',
})

updateModelRate.form = updateModelRateForm

/**
* @see \App\Http\Controllers\Admin\AdminController::createAccessKey
* @see app/Http/Controllers/Admin/AdminController.php:91
* @route '/console/admin/access-key'
*/
export const createAccessKey = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createAccessKey.url(options),
    method: 'post',
})

createAccessKey.definition = {
    methods: ["post"],
    url: '/console/admin/access-key',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::createAccessKey
* @see app/Http/Controllers/Admin/AdminController.php:91
* @route '/console/admin/access-key'
*/
createAccessKey.url = (options?: RouteQueryOptions) => {
    return createAccessKey.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::createAccessKey
* @see app/Http/Controllers/Admin/AdminController.php:91
* @route '/console/admin/access-key'
*/
createAccessKey.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createAccessKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::createAccessKey
* @see app/Http/Controllers/Admin/AdminController.php:91
* @route '/console/admin/access-key'
*/
const createAccessKeyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: createAccessKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::createAccessKey
* @see app/Http/Controllers/Admin/AdminController.php:91
* @route '/console/admin/access-key'
*/
createAccessKeyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: createAccessKey.url(options),
    method: 'post',
})

createAccessKey.form = createAccessKeyForm

/**
* @see \App\Http\Controllers\Admin\AdminController::addUsage
* @see app/Http/Controllers/Admin/AdminController.php:104
* @route '/console/admin/usage'
*/
export const addUsage = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addUsage.url(options),
    method: 'post',
})

addUsage.definition = {
    methods: ["post"],
    url: '/console/admin/usage',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::addUsage
* @see app/Http/Controllers/Admin/AdminController.php:104
* @route '/console/admin/usage'
*/
addUsage.url = (options?: RouteQueryOptions) => {
    return addUsage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::addUsage
* @see app/Http/Controllers/Admin/AdminController.php:104
* @route '/console/admin/usage'
*/
addUsage.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addUsage.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::addUsage
* @see app/Http/Controllers/Admin/AdminController.php:104
* @route '/console/admin/usage'
*/
const addUsageForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: addUsage.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::addUsage
* @see app/Http/Controllers/Admin/AdminController.php:104
* @route '/console/admin/usage'
*/
addUsageForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: addUsage.url(options),
    method: 'post',
})

addUsage.form = addUsageForm

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

const AdminController = { index, storeClient, storeKey, updateRate, storeBackend, adjustBalance, updateClient, updateModelRate, createAccessKey, addUsage, sync }

export default AdminController