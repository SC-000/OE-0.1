import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
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
* @see \App\Http\Controllers\Admin\DashboardController::__invoke
* @see app/Http/Controllers/Admin/DashboardController.php:14
* @route '/admin'
*/
const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\DashboardController::__invoke
* @see app/Http/Controllers/Admin/DashboardController.php:14
* @route '/admin'
*/
dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\DashboardController::__invoke
* @see app/Http/Controllers/Admin/DashboardController.php:14
* @route '/admin'
*/
dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

dashboard.form = dashboardForm

/**
* @see \App\Http\Controllers\Admin\ClientsController::clients
* @see app/Http/Controllers/Admin/ClientsController.php:37
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
* @see app/Http/Controllers/Admin/ClientsController.php:37
* @route '/admin/clients'
*/
clients.url = (options?: RouteQueryOptions) => {
    return clients.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ClientsController::clients
* @see app/Http/Controllers/Admin/ClientsController.php:37
* @route '/admin/clients'
*/
clients.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: clients.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::clients
* @see app/Http/Controllers/Admin/ClientsController.php:37
* @route '/admin/clients'
*/
clients.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: clients.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::clients
* @see app/Http/Controllers/Admin/ClientsController.php:37
* @route '/admin/clients'
*/
const clientsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: clients.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::clients
* @see app/Http/Controllers/Admin/ClientsController.php:37
* @route '/admin/clients'
*/
clientsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: clients.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::clients
* @see app/Http/Controllers/Admin/ClientsController.php:37
* @route '/admin/clients'
*/
clientsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: clients.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

clients.form = clientsForm

/**
* @see \App\Http\Controllers\Admin\ModelsController::models
* @see app/Http/Controllers/Admin/ModelsController.php:27
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
* @see app/Http/Controllers/Admin/ModelsController.php:27
* @route '/admin/models'
*/
models.url = (options?: RouteQueryOptions) => {
    return models.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ModelsController::models
* @see app/Http/Controllers/Admin/ModelsController.php:27
* @route '/admin/models'
*/
models.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: models.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::models
* @see app/Http/Controllers/Admin/ModelsController.php:27
* @route '/admin/models'
*/
models.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: models.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::models
* @see app/Http/Controllers/Admin/ModelsController.php:27
* @route '/admin/models'
*/
const modelsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: models.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::models
* @see app/Http/Controllers/Admin/ModelsController.php:27
* @route '/admin/models'
*/
modelsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: models.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ModelsController::models
* @see app/Http/Controllers/Admin/ModelsController.php:27
* @route '/admin/models'
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
* @see \App\Http\Controllers\Admin\PlatformController::platform
* @see app/Http/Controllers/Admin/PlatformController.php:26
* @route '/admin/platform'
*/
const platformForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: platform.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::platform
* @see app/Http/Controllers/Admin/PlatformController.php:26
* @route '/admin/platform'
*/
platformForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: platform.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::platform
* @see app/Http/Controllers/Admin/PlatformController.php:26
* @route '/admin/platform'
*/
platformForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: platform.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

platform.form = platformForm

/**
* @see \App\Http\Controllers\Admin\PlatformController::discover
* @see app/Http/Controllers/Admin/PlatformController.php:159
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
* @see app/Http/Controllers/Admin/PlatformController.php:159
* @route '/admin/platform/discover'
*/
discover.url = (options?: RouteQueryOptions) => {
    return discover.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::discover
* @see app/Http/Controllers/Admin/PlatformController.php:159
* @route '/admin/platform/discover'
*/
discover.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: discover.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::discover
* @see app/Http/Controllers/Admin/PlatformController.php:159
* @route '/admin/platform/discover'
*/
const discoverForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: discover.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::discover
* @see app/Http/Controllers/Admin/PlatformController.php:159
* @route '/admin/platform/discover'
*/
discoverForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: discover.url(options),
    method: 'post',
})

discover.form = discoverForm

/**
* @see \App\Http\Controllers\Admin\PlatformController::assignProject
* @see app/Http/Controllers/Admin/PlatformController.php:172
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
* @see app/Http/Controllers/Admin/PlatformController.php:172
* @route '/admin/platform/assign-project'
*/
assignProject.url = (options?: RouteQueryOptions) => {
    return assignProject.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::assignProject
* @see app/Http/Controllers/Admin/PlatformController.php:172
* @route '/admin/platform/assign-project'
*/
assignProject.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assignProject.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::assignProject
* @see app/Http/Controllers/Admin/PlatformController.php:172
* @route '/admin/platform/assign-project'
*/
const assignProjectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: assignProject.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::assignProject
* @see app/Http/Controllers/Admin/PlatformController.php:172
* @route '/admin/platform/assign-project'
*/
assignProjectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: assignProject.url(options),
    method: 'post',
})

assignProject.form = assignProjectForm

/**
* @see \App\Http\Controllers\Admin\PlatformController::toggleProject
* @see app/Http/Controllers/Admin/PlatformController.php:192
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
* @see app/Http/Controllers/Admin/PlatformController.php:192
* @route '/admin/platform/toggle-project'
*/
toggleProject.url = (options?: RouteQueryOptions) => {
    return toggleProject.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::toggleProject
* @see app/Http/Controllers/Admin/PlatformController.php:192
* @route '/admin/platform/toggle-project'
*/
toggleProject.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleProject.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::toggleProject
* @see app/Http/Controllers/Admin/PlatformController.php:192
* @route '/admin/platform/toggle-project'
*/
const toggleProjectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggleProject.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::toggleProject
* @see app/Http/Controllers/Admin/PlatformController.php:192
* @route '/admin/platform/toggle-project'
*/
toggleProjectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggleProject.url(options),
    method: 'post',
})

toggleProject.form = toggleProjectForm

/**
* @see \App\Http\Controllers\Admin\PlatformController::sync
* @see app/Http/Controllers/Admin/PlatformController.php:238
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
* @see app/Http/Controllers/Admin/PlatformController.php:238
* @route '/admin/platform/sync'
*/
sync.url = (options?: RouteQueryOptions) => {
    return sync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::sync
* @see app/Http/Controllers/Admin/PlatformController.php:238
* @route '/admin/platform/sync'
*/
sync.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::sync
* @see app/Http/Controllers/Admin/PlatformController.php:238
* @route '/admin/platform/sync'
*/
const syncForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::sync
* @see app/Http/Controllers/Admin/PlatformController.php:238
* @route '/admin/platform/sync'
*/
syncForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

sync.form = syncForm

/**
* @see \App\Http\Controllers\Admin\PlatformController::rebill
* @see app/Http/Controllers/Admin/PlatformController.php:291
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
* @see app/Http/Controllers/Admin/PlatformController.php:291
* @route '/admin/platform/rebill'
*/
rebill.url = (options?: RouteQueryOptions) => {
    return rebill.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::rebill
* @see app/Http/Controllers/Admin/PlatformController.php:291
* @route '/admin/platform/rebill'
*/
rebill.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rebill.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::rebill
* @see app/Http/Controllers/Admin/PlatformController.php:291
* @route '/admin/platform/rebill'
*/
const rebillForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rebill.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::rebill
* @see app/Http/Controllers/Admin/PlatformController.php:291
* @route '/admin/platform/rebill'
*/
rebillForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rebill.url(options),
    method: 'post',
})

rebill.form = rebillForm

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

/**
* @see \App\Http\Controllers\Admin\AuditController::audit
* @see app/Http/Controllers/Admin/AuditController.php:12
* @route '/admin/audit'
*/
const auditForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: audit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AuditController::audit
* @see app/Http/Controllers/Admin/AuditController.php:12
* @route '/admin/audit'
*/
auditForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: audit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AuditController::audit
* @see app/Http/Controllers/Admin/AuditController.php:12
* @route '/admin/audit'
*/
auditForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: audit.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

audit.form = auditForm

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