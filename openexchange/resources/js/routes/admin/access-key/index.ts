import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PlatformController::create
* @see app/Http/Controllers/Admin/PlatformController.php:210
* @route '/admin/platform/access-keys'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/admin/platform/access-keys',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PlatformController::create
* @see app/Http/Controllers/Admin/PlatformController.php:210
* @route '/admin/platform/access-keys'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::create
* @see app/Http/Controllers/Admin/PlatformController.php:210
* @route '/admin/platform/access-keys'
*/
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::create
* @see app/Http/Controllers/Admin/PlatformController.php:210
* @route '/admin/platform/access-keys'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::create
* @see app/Http/Controllers/Admin/PlatformController.php:210
* @route '/admin/platform/access-keys'
*/
createForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: create.url(options),
    method: 'post',
})

create.form = createForm

/**
* @see \App\Http\Controllers\Admin\PlatformController::revoke
* @see app/Http/Controllers/Admin/PlatformController.php:225
* @route '/admin/platform/access-keys/{accessKey}'
*/
export const revoke = (args: { accessKey: number | { id: number } } | [accessKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revoke.url(args, options),
    method: 'delete',
})

revoke.definition = {
    methods: ["delete"],
    url: '/admin/platform/access-keys/{accessKey}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\PlatformController::revoke
* @see app/Http/Controllers/Admin/PlatformController.php:225
* @route '/admin/platform/access-keys/{accessKey}'
*/
revoke.url = (args: { accessKey: number | { id: number } } | [accessKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return revoke.definition.url
            .replace('{accessKey}', parsedArgs.accessKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformController::revoke
* @see app/Http/Controllers/Admin/PlatformController.php:225
* @route '/admin/platform/access-keys/{accessKey}'
*/
revoke.delete = (args: { accessKey: number | { id: number } } | [accessKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revoke.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::revoke
* @see app/Http/Controllers/Admin/PlatformController.php:225
* @route '/admin/platform/access-keys/{accessKey}'
*/
const revokeForm = (args: { accessKey: number | { id: number } } | [accessKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: revoke.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformController::revoke
* @see app/Http/Controllers/Admin/PlatformController.php:225
* @route '/admin/platform/access-keys/{accessKey}'
*/
revokeForm.delete = (args: { accessKey: number | { id: number } } | [accessKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: revoke.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

revoke.form = revokeForm

const accessKey = {
    create: Object.assign(create, create),
    revoke: Object.assign(revoke, revoke),
}

export default accessKey