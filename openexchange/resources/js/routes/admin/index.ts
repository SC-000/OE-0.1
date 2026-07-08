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
import model from './model'
import clientModelRate from './client-model-rate'
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
    discover: Object.assign(discover, discover),
    assignProject: Object.assign(assignProject, assignProject),
    toggleProject: Object.assign(toggleProject, toggleProject),
    model: Object.assign(model, model),
    clientModelRate: Object.assign(clientModelRate, clientModelRate),
    syncModels: Object.assign(syncModels, syncModels),
    sync: Object.assign(sync, sync),
}

export default admin