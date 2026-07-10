import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PlatformController::index
* @see app/Http/Controllers/Admin/PlatformController.php:26
* @route '/admin/platform'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/platform',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PlatformController::index
* @see app/Http/Controllers/Admin/PlatformController.php:26
* @route '/admin/platform'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::index
* @see app/Http/Controllers/Admin/PlatformController.php:26
* @route '/admin/platform'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::index
* @see app/Http/Controllers/Admin/PlatformController.php:26
* @route '/admin/platform'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::index
* @see app/Http/Controllers/Admin/PlatformController.php:26
* @route '/admin/platform'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::index
* @see app/Http/Controllers/Admin/PlatformController.php:26
* @route '/admin/platform'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::index
* @see app/Http/Controllers/Admin/PlatformController.php:26
* @route '/admin/platform'
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
* @see \App\Http\Controllers\Admin\PlatformController::storeBackend
* @see app/Http/Controllers/Admin/PlatformController.php:116
* @route '/admin/platform/backends'
*/
export const storeBackend = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeBackend.url(options),
    method: 'post',
})

storeBackend.definition = {
    methods: ["post"],
    url: '/admin/platform/backends',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PlatformController::storeBackend
* @see app/Http/Controllers/Admin/PlatformController.php:116
* @route '/admin/platform/backends'
*/
storeBackend.url = (options?: RouteQueryOptions) => {
    return storeBackend.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::storeBackend
* @see app/Http/Controllers/Admin/PlatformController.php:116
* @route '/admin/platform/backends'
*/
storeBackend.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeBackend.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::storeBackend
* @see app/Http/Controllers/Admin/PlatformController.php:116
* @route '/admin/platform/backends'
*/
const storeBackendForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeBackend.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::storeBackend
* @see app/Http/Controllers/Admin/PlatformController.php:116
* @route '/admin/platform/backends'
*/
storeBackendForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeBackend.url(options),
    method: 'post',
})

storeBackend.form = storeBackendForm

/**
* @see \App\Http\Controllers\Admin\PlatformController::destroyBackend
* @see app/Http/Controllers/Admin/PlatformController.php:133
* @route '/admin/platform/backends/{backend}'
*/
export const destroyBackend = (args: { backend: number | { id: number } } | [backend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyBackend.url(args, options),
    method: 'delete',
})

destroyBackend.definition = {
    methods: ["delete"],
    url: '/admin/platform/backends/{backend}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\PlatformController::destroyBackend
* @see app/Http/Controllers/Admin/PlatformController.php:133
* @route '/admin/platform/backends/{backend}'
*/
destroyBackend.url = (args: { backend: number | { id: number } } | [backend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { backend: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { backend: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            backend: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        backend: typeof args.backend === 'object'
        ? args.backend.id
        : args.backend,
    }

    return destroyBackend.definition.url
            .replace('{backend}', parsedArgs.backend.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::destroyBackend
* @see app/Http/Controllers/Admin/PlatformController.php:133
* @route '/admin/platform/backends/{backend}'
*/
destroyBackend.delete = (args: { backend: number | { id: number } } | [backend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyBackend.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::destroyBackend
* @see app/Http/Controllers/Admin/PlatformController.php:133
* @route '/admin/platform/backends/{backend}'
*/
const destroyBackendForm = (args: { backend: number | { id: number } } | [backend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyBackend.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::destroyBackend
* @see app/Http/Controllers/Admin/PlatformController.php:133
* @route '/admin/platform/backends/{backend}'
*/
destroyBackendForm.delete = (args: { backend: number | { id: number } } | [backend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyBackend.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyBackend.form = destroyBackendForm

/**
* @see \App\Http\Controllers\Admin\PlatformController::storeKey
* @see app/Http/Controllers/Admin/PlatformController.php:142
* @route '/admin/platform/keys'
*/
export const storeKey = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeKey.url(options),
    method: 'post',
})

storeKey.definition = {
    methods: ["post"],
    url: '/admin/platform/keys',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PlatformController::storeKey
* @see app/Http/Controllers/Admin/PlatformController.php:142
* @route '/admin/platform/keys'
*/
storeKey.url = (options?: RouteQueryOptions) => {
    return storeKey.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::storeKey
* @see app/Http/Controllers/Admin/PlatformController.php:142
* @route '/admin/platform/keys'
*/
storeKey.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::storeKey
* @see app/Http/Controllers/Admin/PlatformController.php:142
* @route '/admin/platform/keys'
*/
const storeKeyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::storeKey
* @see app/Http/Controllers/Admin/PlatformController.php:142
* @route '/admin/platform/keys'
*/
storeKeyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeKey.url(options),
    method: 'post',
})

storeKey.form = storeKeyForm

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
* @see \App\Http\Controllers\Admin\PlatformController::createAccessKey
* @see app/Http/Controllers/Admin/PlatformController.php:210
* @route '/admin/platform/access-keys'
*/
export const createAccessKey = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createAccessKey.url(options),
    method: 'post',
})

createAccessKey.definition = {
    methods: ["post"],
    url: '/admin/platform/access-keys',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PlatformController::createAccessKey
* @see app/Http/Controllers/Admin/PlatformController.php:210
* @route '/admin/platform/access-keys'
*/
createAccessKey.url = (options?: RouteQueryOptions) => {
    return createAccessKey.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::createAccessKey
* @see app/Http/Controllers/Admin/PlatformController.php:210
* @route '/admin/platform/access-keys'
*/
createAccessKey.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createAccessKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::createAccessKey
* @see app/Http/Controllers/Admin/PlatformController.php:210
* @route '/admin/platform/access-keys'
*/
const createAccessKeyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: createAccessKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::createAccessKey
* @see app/Http/Controllers/Admin/PlatformController.php:210
* @route '/admin/platform/access-keys'
*/
createAccessKeyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: createAccessKey.url(options),
    method: 'post',
})

createAccessKey.form = createAccessKeyForm

/**
* @see \App\Http\Controllers\Admin\PlatformController::revokeAccessKey
* @see app/Http/Controllers/Admin/PlatformController.php:225
* @route '/admin/platform/access-keys/{accessKey}'
*/
export const revokeAccessKey = (args: { accessKey: number | { id: number } } | [accessKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revokeAccessKey.url(args, options),
    method: 'delete',
})

revokeAccessKey.definition = {
    methods: ["delete"],
    url: '/admin/platform/access-keys/{accessKey}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\PlatformController::revokeAccessKey
* @see app/Http/Controllers/Admin/PlatformController.php:225
* @route '/admin/platform/access-keys/{accessKey}'
*/
revokeAccessKey.url = (args: { accessKey: number | { id: number } } | [accessKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { accessKey: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { accessKey: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            accessKey: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        accessKey: typeof args.accessKey === 'object'
        ? args.accessKey.id
        : args.accessKey,
    }

    return revokeAccessKey.definition.url
            .replace('{accessKey}', parsedArgs.accessKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::revokeAccessKey
* @see app/Http/Controllers/Admin/PlatformController.php:225
* @route '/admin/platform/access-keys/{accessKey}'
*/
revokeAccessKey.delete = (args: { accessKey: number | { id: number } } | [accessKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revokeAccessKey.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::revokeAccessKey
* @see app/Http/Controllers/Admin/PlatformController.php:225
* @route '/admin/platform/access-keys/{accessKey}'
*/
const revokeAccessKeyForm = (args: { accessKey: number | { id: number } } | [accessKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: revokeAccessKey.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::revokeAccessKey
* @see app/Http/Controllers/Admin/PlatformController.php:225
* @route '/admin/platform/access-keys/{accessKey}'
*/
revokeAccessKeyForm.delete = (args: { accessKey: number | { id: number } } | [accessKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: revokeAccessKey.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

revokeAccessKey.form = revokeAccessKeyForm

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

const PlatformController = { index, storeBackend, destroyBackend, storeKey, discover, assignProject, toggleProject, createAccessKey, revokeAccessKey, sync, rebill }

export default PlatformController