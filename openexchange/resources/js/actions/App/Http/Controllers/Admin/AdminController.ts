import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:29
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
* @see app/Http/Controllers/Admin/AdminController.php:29
* @route '/console/admin'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:29
* @route '/console/admin'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:29
* @route '/console/admin'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:29
* @route '/console/admin'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:29
* @route '/console/admin'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:29
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
* @see app/Http/Controllers/Admin/AdminController.php:214
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
* @see app/Http/Controllers/Admin/AdminController.php:214
* @route '/console/admin/clients'
*/
storeClient.url = (options?: RouteQueryOptions) => {
    return storeClient.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::storeClient
* @see app/Http/Controllers/Admin/AdminController.php:214
* @route '/console/admin/clients'
*/
storeClient.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeClient.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::storeClient
* @see app/Http/Controllers/Admin/AdminController.php:214
* @route '/console/admin/clients'
*/
const storeClientForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeClient.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::storeClient
* @see app/Http/Controllers/Admin/AdminController.php:214
* @route '/console/admin/clients'
*/
storeClientForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeClient.url(options),
    method: 'post',
})

storeClient.form = storeClientForm

/**
* @see \App\Http\Controllers\Admin\AdminController::storeKey
* @see app/Http/Controllers/Admin/AdminController.php:242
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
* @see app/Http/Controllers/Admin/AdminController.php:242
* @route '/console/admin/keys'
*/
storeKey.url = (options?: RouteQueryOptions) => {
    return storeKey.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::storeKey
* @see app/Http/Controllers/Admin/AdminController.php:242
* @route '/console/admin/keys'
*/
storeKey.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::storeKey
* @see app/Http/Controllers/Admin/AdminController.php:242
* @route '/console/admin/keys'
*/
const storeKeyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::storeKey
* @see app/Http/Controllers/Admin/AdminController.php:242
* @route '/console/admin/keys'
*/
storeKeyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeKey.url(options),
    method: 'post',
})

storeKey.form = storeKeyForm

/**
* @see \App\Http\Controllers\Admin\AdminController::updateRate
* @see app/Http/Controllers/Admin/AdminController.php:257
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
* @see app/Http/Controllers/Admin/AdminController.php:257
* @route '/console/admin/rate'
*/
updateRate.url = (options?: RouteQueryOptions) => {
    return updateRate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::updateRate
* @see app/Http/Controllers/Admin/AdminController.php:257
* @route '/console/admin/rate'
*/
updateRate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateRate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::updateRate
* @see app/Http/Controllers/Admin/AdminController.php:257
* @route '/console/admin/rate'
*/
const updateRateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateRate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::updateRate
* @see app/Http/Controllers/Admin/AdminController.php:257
* @route '/console/admin/rate'
*/
updateRateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateRate.url(options),
    method: 'post',
})

updateRate.form = updateRateForm

/**
* @see \App\Http\Controllers\Admin\AdminController::storeBackend
* @see app/Http/Controllers/Admin/AdminController.php:199
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
* @see app/Http/Controllers/Admin/AdminController.php:199
* @route '/console/admin/backends'
*/
storeBackend.url = (options?: RouteQueryOptions) => {
    return storeBackend.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::storeBackend
* @see app/Http/Controllers/Admin/AdminController.php:199
* @route '/console/admin/backends'
*/
storeBackend.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeBackend.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::storeBackend
* @see app/Http/Controllers/Admin/AdminController.php:199
* @route '/console/admin/backends'
*/
const storeBackendForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeBackend.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::storeBackend
* @see app/Http/Controllers/Admin/AdminController.php:199
* @route '/console/admin/backends'
*/
storeBackendForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeBackend.url(options),
    method: 'post',
})

storeBackend.form = storeBackendForm

/**
* @see \App\Http\Controllers\Admin\AdminController::adjustBalance
* @see app/Http/Controllers/Admin/AdminController.php:277
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
* @see app/Http/Controllers/Admin/AdminController.php:277
* @route '/console/admin/balance'
*/
adjustBalance.url = (options?: RouteQueryOptions) => {
    return adjustBalance.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::adjustBalance
* @see app/Http/Controllers/Admin/AdminController.php:277
* @route '/console/admin/balance'
*/
adjustBalance.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjustBalance.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::adjustBalance
* @see app/Http/Controllers/Admin/AdminController.php:277
* @route '/console/admin/balance'
*/
const adjustBalanceForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: adjustBalance.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::adjustBalance
* @see app/Http/Controllers/Admin/AdminController.php:277
* @route '/console/admin/balance'
*/
adjustBalanceForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: adjustBalance.url(options),
    method: 'post',
})

adjustBalance.form = adjustBalanceForm

/**
* @see \App\Http\Controllers\Admin\AdminController::updateClient
* @see app/Http/Controllers/Admin/AdminController.php:292
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
* @see app/Http/Controllers/Admin/AdminController.php:292
* @route '/console/admin/client'
*/
updateClient.url = (options?: RouteQueryOptions) => {
    return updateClient.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::updateClient
* @see app/Http/Controllers/Admin/AdminController.php:292
* @route '/console/admin/client'
*/
updateClient.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateClient.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::updateClient
* @see app/Http/Controllers/Admin/AdminController.php:292
* @route '/console/admin/client'
*/
const updateClientForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateClient.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::updateClient
* @see app/Http/Controllers/Admin/AdminController.php:292
* @route '/console/admin/client'
*/
updateClientForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateClient.url(options),
    method: 'post',
})

updateClient.form = updateClientForm

/**
* @see \App\Http\Controllers\Admin\AdminController::updateModelRate
* @see app/Http/Controllers/Admin/AdminController.php:308
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
* @see app/Http/Controllers/Admin/AdminController.php:308
* @route '/console/admin/model-rate'
*/
updateModelRate.url = (options?: RouteQueryOptions) => {
    return updateModelRate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::updateModelRate
* @see app/Http/Controllers/Admin/AdminController.php:308
* @route '/console/admin/model-rate'
*/
updateModelRate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateModelRate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::updateModelRate
* @see app/Http/Controllers/Admin/AdminController.php:308
* @route '/console/admin/model-rate'
*/
const updateModelRateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateModelRate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::updateModelRate
* @see app/Http/Controllers/Admin/AdminController.php:308
* @route '/console/admin/model-rate'
*/
updateModelRateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateModelRate.url(options),
    method: 'post',
})

updateModelRate.form = updateModelRateForm

/**
* @see \App\Http\Controllers\Admin\AdminController::createAccessKey
* @see app/Http/Controllers/Admin/AdminController.php:156
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
* @see app/Http/Controllers/Admin/AdminController.php:156
* @route '/console/admin/access-key'
*/
createAccessKey.url = (options?: RouteQueryOptions) => {
    return createAccessKey.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::createAccessKey
* @see app/Http/Controllers/Admin/AdminController.php:156
* @route '/console/admin/access-key'
*/
createAccessKey.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createAccessKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::createAccessKey
* @see app/Http/Controllers/Admin/AdminController.php:156
* @route '/console/admin/access-key'
*/
const createAccessKeyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: createAccessKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::createAccessKey
* @see app/Http/Controllers/Admin/AdminController.php:156
* @route '/console/admin/access-key'
*/
createAccessKeyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: createAccessKey.url(options),
    method: 'post',
})

createAccessKey.form = createAccessKeyForm

/**
* @see \App\Http\Controllers\Admin\AdminController::addUsage
* @see app/Http/Controllers/Admin/AdminController.php:169
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
* @see app/Http/Controllers/Admin/AdminController.php:169
* @route '/console/admin/usage'
*/
addUsage.url = (options?: RouteQueryOptions) => {
    return addUsage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::addUsage
* @see app/Http/Controllers/Admin/AdminController.php:169
* @route '/console/admin/usage'
*/
addUsage.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addUsage.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::addUsage
* @see app/Http/Controllers/Admin/AdminController.php:169
* @route '/console/admin/usage'
*/
const addUsageForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: addUsage.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::addUsage
* @see app/Http/Controllers/Admin/AdminController.php:169
* @route '/console/admin/usage'
*/
addUsageForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: addUsage.url(options),
    method: 'post',
})

addUsage.form = addUsageForm

/**
* @see \App\Http\Controllers\Admin\AdminController::discover
* @see app/Http/Controllers/Admin/AdminController.php:324
* @route '/console/admin/discover'
*/
export const discover = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: discover.url(options),
    method: 'post',
})

discover.definition = {
    methods: ["post"],
    url: '/console/admin/discover',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::discover
* @see app/Http/Controllers/Admin/AdminController.php:324
* @route '/console/admin/discover'
*/
discover.url = (options?: RouteQueryOptions) => {
    return discover.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::discover
* @see app/Http/Controllers/Admin/AdminController.php:324
* @route '/console/admin/discover'
*/
discover.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: discover.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::discover
* @see app/Http/Controllers/Admin/AdminController.php:324
* @route '/console/admin/discover'
*/
const discoverForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: discover.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::discover
* @see app/Http/Controllers/Admin/AdminController.php:324
* @route '/console/admin/discover'
*/
discoverForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: discover.url(options),
    method: 'post',
})

discover.form = discoverForm

/**
* @see \App\Http\Controllers\Admin\AdminController::assignProject
* @see app/Http/Controllers/Admin/AdminController.php:340
* @route '/console/admin/assign-project'
*/
export const assignProject = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assignProject.url(options),
    method: 'post',
})

assignProject.definition = {
    methods: ["post"],
    url: '/console/admin/assign-project',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::assignProject
* @see app/Http/Controllers/Admin/AdminController.php:340
* @route '/console/admin/assign-project'
*/
assignProject.url = (options?: RouteQueryOptions) => {
    return assignProject.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::assignProject
* @see app/Http/Controllers/Admin/AdminController.php:340
* @route '/console/admin/assign-project'
*/
assignProject.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assignProject.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::assignProject
* @see app/Http/Controllers/Admin/AdminController.php:340
* @route '/console/admin/assign-project'
*/
const assignProjectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: assignProject.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::assignProject
* @see app/Http/Controllers/Admin/AdminController.php:340
* @route '/console/admin/assign-project'
*/
assignProjectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: assignProject.url(options),
    method: 'post',
})

assignProject.form = assignProjectForm

/**
* @see \App\Http\Controllers\Admin\AdminController::toggleProject
* @see app/Http/Controllers/Admin/AdminController.php:358
* @route '/console/admin/toggle-project'
*/
export const toggleProject = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleProject.url(options),
    method: 'post',
})

toggleProject.definition = {
    methods: ["post"],
    url: '/console/admin/toggle-project',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::toggleProject
* @see app/Http/Controllers/Admin/AdminController.php:358
* @route '/console/admin/toggle-project'
*/
toggleProject.url = (options?: RouteQueryOptions) => {
    return toggleProject.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::toggleProject
* @see app/Http/Controllers/Admin/AdminController.php:358
* @route '/console/admin/toggle-project'
*/
toggleProject.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleProject.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::toggleProject
* @see app/Http/Controllers/Admin/AdminController.php:358
* @route '/console/admin/toggle-project'
*/
const toggleProjectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggleProject.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::toggleProject
* @see app/Http/Controllers/Admin/AdminController.php:358
* @route '/console/admin/toggle-project'
*/
toggleProjectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggleProject.url(options),
    method: 'post',
})

toggleProject.form = toggleProjectForm

/**
* @see \App\Http\Controllers\Admin\AdminController::destroyClient
* @see app/Http/Controllers/Admin/AdminController.php:371
* @route '/console/admin/client/delete'
*/
export const destroyClient = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: destroyClient.url(options),
    method: 'post',
})

destroyClient.definition = {
    methods: ["post"],
    url: '/console/admin/client/delete',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::destroyClient
* @see app/Http/Controllers/Admin/AdminController.php:371
* @route '/console/admin/client/delete'
*/
destroyClient.url = (options?: RouteQueryOptions) => {
    return destroyClient.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::destroyClient
* @see app/Http/Controllers/Admin/AdminController.php:371
* @route '/console/admin/client/delete'
*/
destroyClient.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: destroyClient.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::destroyClient
* @see app/Http/Controllers/Admin/AdminController.php:371
* @route '/console/admin/client/delete'
*/
const destroyClientForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyClient.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::destroyClient
* @see app/Http/Controllers/Admin/AdminController.php:371
* @route '/console/admin/client/delete'
*/
destroyClientForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyClient.url(options),
    method: 'post',
})

destroyClient.form = destroyClientForm

/**
* @see \App\Http\Controllers\Admin\AdminController::storeModel
* @see app/Http/Controllers/Admin/AdminController.php:385
* @route '/console/admin/model'
*/
export const storeModel = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeModel.url(options),
    method: 'post',
})

storeModel.definition = {
    methods: ["post"],
    url: '/console/admin/model',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::storeModel
* @see app/Http/Controllers/Admin/AdminController.php:385
* @route '/console/admin/model'
*/
storeModel.url = (options?: RouteQueryOptions) => {
    return storeModel.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::storeModel
* @see app/Http/Controllers/Admin/AdminController.php:385
* @route '/console/admin/model'
*/
storeModel.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeModel.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::storeModel
* @see app/Http/Controllers/Admin/AdminController.php:385
* @route '/console/admin/model'
*/
const storeModelForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeModel.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::storeModel
* @see app/Http/Controllers/Admin/AdminController.php:385
* @route '/console/admin/model'
*/
storeModelForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeModel.url(options),
    method: 'post',
})

storeModel.form = storeModelForm

/**
* @see \App\Http\Controllers\Admin\AdminController::updateModel
* @see app/Http/Controllers/Admin/AdminController.php:402
* @route '/console/admin/model/update'
*/
export const updateModel = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateModel.url(options),
    method: 'post',
})

updateModel.definition = {
    methods: ["post"],
    url: '/console/admin/model/update',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::updateModel
* @see app/Http/Controllers/Admin/AdminController.php:402
* @route '/console/admin/model/update'
*/
updateModel.url = (options?: RouteQueryOptions) => {
    return updateModel.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::updateModel
* @see app/Http/Controllers/Admin/AdminController.php:402
* @route '/console/admin/model/update'
*/
updateModel.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateModel.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::updateModel
* @see app/Http/Controllers/Admin/AdminController.php:402
* @route '/console/admin/model/update'
*/
const updateModelForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateModel.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::updateModel
* @see app/Http/Controllers/Admin/AdminController.php:402
* @route '/console/admin/model/update'
*/
updateModelForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateModel.url(options),
    method: 'post',
})

updateModel.form = updateModelForm

/**
* @see \App\Http\Controllers\Admin\AdminController::revokeAccessKey
* @see app/Http/Controllers/Admin/AdminController.php:420
* @route '/console/admin/access-key/revoke'
*/
export const revokeAccessKey = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revokeAccessKey.url(options),
    method: 'post',
})

revokeAccessKey.definition = {
    methods: ["post"],
    url: '/console/admin/access-key/revoke',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::revokeAccessKey
* @see app/Http/Controllers/Admin/AdminController.php:420
* @route '/console/admin/access-key/revoke'
*/
revokeAccessKey.url = (options?: RouteQueryOptions) => {
    return revokeAccessKey.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::revokeAccessKey
* @see app/Http/Controllers/Admin/AdminController.php:420
* @route '/console/admin/access-key/revoke'
*/
revokeAccessKey.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revokeAccessKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::revokeAccessKey
* @see app/Http/Controllers/Admin/AdminController.php:420
* @route '/console/admin/access-key/revoke'
*/
const revokeAccessKeyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: revokeAccessKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::revokeAccessKey
* @see app/Http/Controllers/Admin/AdminController.php:420
* @route '/console/admin/access-key/revoke'
*/
revokeAccessKeyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: revokeAccessKey.url(options),
    method: 'post',
})

revokeAccessKey.form = revokeAccessKeyForm

/**
* @see \App\Http\Controllers\Admin\AdminController::updateClientModelRate
* @see app/Http/Controllers/Admin/AdminController.php:429
* @route '/console/admin/client-model-rate'
*/
export const updateClientModelRate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateClientModelRate.url(options),
    method: 'post',
})

updateClientModelRate.definition = {
    methods: ["post"],
    url: '/console/admin/client-model-rate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::updateClientModelRate
* @see app/Http/Controllers/Admin/AdminController.php:429
* @route '/console/admin/client-model-rate'
*/
updateClientModelRate.url = (options?: RouteQueryOptions) => {
    return updateClientModelRate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::updateClientModelRate
* @see app/Http/Controllers/Admin/AdminController.php:429
* @route '/console/admin/client-model-rate'
*/
updateClientModelRate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateClientModelRate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::updateClientModelRate
* @see app/Http/Controllers/Admin/AdminController.php:429
* @route '/console/admin/client-model-rate'
*/
const updateClientModelRateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateClientModelRate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::updateClientModelRate
* @see app/Http/Controllers/Admin/AdminController.php:429
* @route '/console/admin/client-model-rate'
*/
updateClientModelRateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateClientModelRate.url(options),
    method: 'post',
})

updateClientModelRate.form = updateClientModelRateForm

/**
* @see \App\Http\Controllers\Admin\AdminController::deleteClientModelRate
* @see app/Http/Controllers/Admin/AdminController.php:446
* @route '/console/admin/client-model-rate/delete'
*/
export const deleteClientModelRate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deleteClientModelRate.url(options),
    method: 'post',
})

deleteClientModelRate.definition = {
    methods: ["post"],
    url: '/console/admin/client-model-rate/delete',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::deleteClientModelRate
* @see app/Http/Controllers/Admin/AdminController.php:446
* @route '/console/admin/client-model-rate/delete'
*/
deleteClientModelRate.url = (options?: RouteQueryOptions) => {
    return deleteClientModelRate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::deleteClientModelRate
* @see app/Http/Controllers/Admin/AdminController.php:446
* @route '/console/admin/client-model-rate/delete'
*/
deleteClientModelRate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deleteClientModelRate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::deleteClientModelRate
* @see app/Http/Controllers/Admin/AdminController.php:446
* @route '/console/admin/client-model-rate/delete'
*/
const deleteClientModelRateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteClientModelRate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::deleteClientModelRate
* @see app/Http/Controllers/Admin/AdminController.php:446
* @route '/console/admin/client-model-rate/delete'
*/
deleteClientModelRateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteClientModelRate.url(options),
    method: 'post',
})

deleteClientModelRate.form = deleteClientModelRateForm

/**
* @see \App\Http\Controllers\Admin\AdminController::syncModels
* @see app/Http/Controllers/Admin/AdminController.php:455
* @route '/console/admin/sync-models'
*/
export const syncModels = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncModels.url(options),
    method: 'post',
})

syncModels.definition = {
    methods: ["post"],
    url: '/console/admin/sync-models',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::syncModels
* @see app/Http/Controllers/Admin/AdminController.php:455
* @route '/console/admin/sync-models'
*/
syncModels.url = (options?: RouteQueryOptions) => {
    return syncModels.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::syncModels
* @see app/Http/Controllers/Admin/AdminController.php:455
* @route '/console/admin/sync-models'
*/
syncModels.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncModels.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::syncModels
* @see app/Http/Controllers/Admin/AdminController.php:455
* @route '/console/admin/sync-models'
*/
const syncModelsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: syncModels.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::syncModels
* @see app/Http/Controllers/Admin/AdminController.php:455
* @route '/console/admin/sync-models'
*/
syncModelsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: syncModels.url(options),
    method: 'post',
})

syncModels.form = syncModelsForm

/**
* @see \App\Http\Controllers\Admin\AdminController::sync
* @see app/Http/Controllers/Admin/AdminController.php:268
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
* @see app/Http/Controllers/Admin/AdminController.php:268
* @route '/console/admin/sync'
*/
sync.url = (options?: RouteQueryOptions) => {
    return sync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::sync
* @see app/Http/Controllers/Admin/AdminController.php:268
* @route '/console/admin/sync'
*/
sync.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::sync
* @see app/Http/Controllers/Admin/AdminController.php:268
* @route '/console/admin/sync'
*/
const syncForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::sync
* @see app/Http/Controllers/Admin/AdminController.php:268
* @route '/console/admin/sync'
*/
syncForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

sync.form = syncForm

const AdminController = { index, storeClient, storeKey, updateRate, storeBackend, adjustBalance, updateClient, updateModelRate, createAccessKey, addUsage, discover, assignProject, toggleProject, destroyClient, storeModel, updateModel, revokeAccessKey, updateClientModelRate, deleteClientModelRate, syncModels, sync }

export default AdminController