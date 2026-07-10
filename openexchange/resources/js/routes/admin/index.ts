import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import clients3a2bdc from './clients'
import modelsEff558 from './models'
import proposals from './proposals'
import rates from './rates'
import charges from './charges'
import backends from './backends'
import keys from './keys'
import accessKey from './access-key'
/**
* @see \App\Http\Controllers\Admin\DashboardController::__invoke
* @see app/Http/Controllers/Admin/DashboardController.php:14
* @route '/admin'
*/
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\DashboardController::__invoke
* @see app/Http/Controllers/Admin/DashboardController.php:14
* @route '/admin'
*/
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DashboardController::__invoke
* @see app/Http/Controllers/Admin/DashboardController.php:14
* @route '/admin'
*/
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\DashboardController::__invoke
* @see app/Http/Controllers/Admin/DashboardController.php:14
* @route '/admin'
*/
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::clients
* @see app/Http/Controllers/Admin/ClientsController.php:33
* @route '/admin/clients'
*/
export const clients = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: clients.url(options),
    method: 'get',
})

clients.definition = {
    methods: ["get","head"],
    url: '/admin/clients',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ClientsController::clients
* @see app/Http/Controllers/Admin/ClientsController.php:33
* @route '/admin/clients'
*/
clients.url = (options?: RouteQueryOptions) => {
    return clients.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ClientsController::clients
* @see app/Http/Controllers/Admin/ClientsController.php:33
* @route '/admin/clients'
*/
clients.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: clients.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::clients
* @see app/Http/Controllers/Admin/ClientsController.php:33
* @route '/admin/clients'
*/
clients.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: clients.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::models
* @see app/Http/Controllers/Admin/ModelsController.php:22
* @route '/admin/models'
*/
export const models = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: models.url(options),
    method: 'get',
})

models.definition = {
    methods: ["get","head"],
    url: '/admin/models',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ModelsController::models
* @see app/Http/Controllers/Admin/ModelsController.php:22
* @route '/admin/models'
*/
models.url = (options?: RouteQueryOptions) => {
    return models.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ModelsController::models
* @see app/Http/Controllers/Admin/ModelsController.php:22
* @route '/admin/models'
*/
models.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: models.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::models
* @see app/Http/Controllers/Admin/ModelsController.php:22
* @route '/admin/models'
*/
models.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: models.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::platform
* @see app/Http/Controllers/Admin/PlatformController.php:26
* @route '/admin/platform'
*/
export const platform = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: platform.url(options),
    method: 'get',
})

platform.definition = {
    methods: ["get","head"],
    url: '/admin/platform',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PlatformController::platform
* @see app/Http/Controllers/Admin/PlatformController.php:26
* @route '/admin/platform'
*/
platform.url = (options?: RouteQueryOptions) => {
    return platform.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::platform
* @see app/Http/Controllers/Admin/PlatformController.php:26
* @route '/admin/platform'
*/
platform.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: platform.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::platform
* @see app/Http/Controllers/Admin/PlatformController.php:26
* @route '/admin/platform'
*/
platform.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: platform.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::discover
* @see app/Http/Controllers/Admin/PlatformController.php:133
* @route '/admin/platform/discover'
*/
export const discover = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: discover.url(options),
    method: 'post',
})

discover.definition = {
    methods: ["post"],
    url: '/admin/platform/discover',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PlatformController::discover
* @see app/Http/Controllers/Admin/PlatformController.php:133
* @route '/admin/platform/discover'
*/
discover.url = (options?: RouteQueryOptions) => {
    return discover.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::discover
* @see app/Http/Controllers/Admin/PlatformController.php:133
* @route '/admin/platform/discover'
*/
discover.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: discover.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::assignProject
* @see app/Http/Controllers/Admin/PlatformController.php:146
* @route '/admin/platform/assign-project'
*/
export const assignProject = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assignProject.url(options),
    method: 'post',
})

assignProject.definition = {
    methods: ["post"],
    url: '/admin/platform/assign-project',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PlatformController::assignProject
* @see app/Http/Controllers/Admin/PlatformController.php:146
* @route '/admin/platform/assign-project'
*/
assignProject.url = (options?: RouteQueryOptions) => {
    return assignProject.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::assignProject
* @see app/Http/Controllers/Admin/PlatformController.php:146
* @route '/admin/platform/assign-project'
*/
assignProject.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assignProject.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::toggleProject
* @see app/Http/Controllers/Admin/PlatformController.php:166
* @route '/admin/platform/toggle-project'
*/
export const toggleProject = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleProject.url(options),
    method: 'post',
})

toggleProject.definition = {
    methods: ["post"],
    url: '/admin/platform/toggle-project',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PlatformController::toggleProject
* @see app/Http/Controllers/Admin/PlatformController.php:166
* @route '/admin/platform/toggle-project'
*/
toggleProject.url = (options?: RouteQueryOptions) => {
    return toggleProject.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::toggleProject
* @see app/Http/Controllers/Admin/PlatformController.php:166
* @route '/admin/platform/toggle-project'
*/
toggleProject.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleProject.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::sync
* @see app/Http/Controllers/Admin/PlatformController.php:207
* @route '/admin/platform/sync'
*/
export const sync = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

sync.definition = {
    methods: ["post"],
    url: '/admin/platform/sync',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PlatformController::sync
* @see app/Http/Controllers/Admin/PlatformController.php:207
* @route '/admin/platform/sync'
*/
sync.url = (options?: RouteQueryOptions) => {
    return sync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::sync
* @see app/Http/Controllers/Admin/PlatformController.php:207
* @route '/admin/platform/sync'
*/
sync.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::rebill
* @see app/Http/Controllers/Admin/PlatformController.php:218
* @route '/admin/platform/rebill'
*/
export const rebill = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rebill.url(options),
    method: 'post',
})

rebill.definition = {
    methods: ["post"],
    url: '/admin/platform/rebill',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PlatformController::rebill
* @see app/Http/Controllers/Admin/PlatformController.php:218
* @route '/admin/platform/rebill'
*/
rebill.url = (options?: RouteQueryOptions) => {
    return rebill.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::rebill
* @see app/Http/Controllers/Admin/PlatformController.php:218
* @route '/admin/platform/rebill'
*/
rebill.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rebill.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AuditController::audit
* @see app/Http/Controllers/Admin/AuditController.php:12
* @route '/admin/audit'
*/
export const audit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: audit.url(options),
    method: 'get',
})

audit.definition = {
    methods: ["get","head"],
    url: '/admin/audit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AuditController::audit
* @see app/Http/Controllers/Admin/AuditController.php:12
* @route '/admin/audit'
*/
audit.url = (options?: RouteQueryOptions) => {
    return audit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AuditController::audit
* @see app/Http/Controllers/Admin/AuditController.php:12
* @route '/admin/audit'
*/
audit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: audit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AuditController::audit
* @see app/Http/Controllers/Admin/AuditController.php:12
* @route '/admin/audit'
*/
audit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: audit.url(options),
    method: 'head',
})

const admin = {
    dashboard: Object.assign(dashboard, dashboard),
    clients: Object.assign(clients, clients3a2bdc),
    models: Object.assign(models, modelsEff558),
    proposals: Object.assign(proposals, proposals),
    rates: Object.assign(rates, rates),
    charges: Object.assign(charges, charges),
    platform: Object.assign(platform, platform),
    backends: Object.assign(backends, backends),
    keys: Object.assign(keys, keys),
    discover: Object.assign(discover, discover),
    assignProject: Object.assign(assignProject, assignProject),
    toggleProject: Object.assign(toggleProject, toggleProject),
    accessKey: Object.assign(accessKey, accessKey),
    sync: Object.assign(sync, sync),
    rebill: Object.assign(rebill, rebill),
    audit: Object.assign(audit, audit),
}

export default admin