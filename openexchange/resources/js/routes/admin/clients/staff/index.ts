import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ClientsController::add
* @see app/Http/Controllers/Admin/ClientsController.php:297
* @route '/admin/clients/{client}/staff'
*/
export const add = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: add.url(args, options),
    method: 'post',
})

add.definition = {
    methods: ["post"],
    url: '/admin/clients/{client}/staff',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ClientsController::add
* @see app/Http/Controllers/Admin/ClientsController.php:297
* @route '/admin/clients/{client}/staff'
*/
add.url = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { client: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { client: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            client: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        client: typeof args.client === 'object'
        ? args.client.id
        : args.client,
    }

    return add.definition.url
            .replace('{client}', parsedArgs.client.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ClientsController::add
* @see app/Http/Controllers/Admin/ClientsController.php:297
* @route '/admin/clients/{client}/staff'
*/
add.post = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: add.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::remove
* @see app/Http/Controllers/Admin/ClientsController.php:317
* @route '/admin/clients/{client}/staff/{user}'
*/
export const remove = (args: { client: number | { id: number }, user: number | { id: number } } | [client: number | { id: number }, user: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: remove.url(args, options),
    method: 'delete',
})

remove.definition = {
    methods: ["delete"],
    url: '/admin/clients/{client}/staff/{user}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\ClientsController::remove
* @see app/Http/Controllers/Admin/ClientsController.php:317
* @route '/admin/clients/{client}/staff/{user}'
*/
remove.url = (args: { client: number | { id: number }, user: number | { id: number } } | [client: number | { id: number }, user: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            client: args[0],
            user: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        client: typeof args.client === 'object'
        ? args.client.id
        : args.client,
        user: typeof args.user === 'object'
        ? args.user.id
        : args.user,
    }

    return remove.definition.url
            .replace('{client}', parsedArgs.client.toString())
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ClientsController::remove
* @see app/Http/Controllers/Admin/ClientsController.php:317
* @route '/admin/clients/{client}/staff/{user}'
*/
remove.delete = (args: { client: number | { id: number }, user: number | { id: number } } | [client: number | { id: number }, user: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: remove.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::invite
* @see app/Http/Controllers/Admin/ClientsController.php:329
* @route '/admin/clients/{client}/staff/{user}/invite'
*/
export const invite = (args: { client: number | { id: number }, user: number | { id: number } } | [client: number | { id: number }, user: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: invite.url(args, options),
    method: 'post',
})

invite.definition = {
    methods: ["post"],
    url: '/admin/clients/{client}/staff/{user}/invite',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ClientsController::invite
* @see app/Http/Controllers/Admin/ClientsController.php:329
* @route '/admin/clients/{client}/staff/{user}/invite'
*/
invite.url = (args: { client: number | { id: number }, user: number | { id: number } } | [client: number | { id: number }, user: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            client: args[0],
            user: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        client: typeof args.client === 'object'
        ? args.client.id
        : args.client,
        user: typeof args.user === 'object'
        ? args.user.id
        : args.user,
    }

    return invite.definition.url
            .replace('{client}', parsedArgs.client.toString())
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ClientsController::invite
* @see app/Http/Controllers/Admin/ClientsController.php:329
* @route '/admin/clients/{client}/staff/{user}/invite'
*/
invite.post = (args: { client: number | { id: number }, user: number | { id: number } } | [client: number | { id: number }, user: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: invite.url(args, options),
    method: 'post',
})

const staff = {
    add: Object.assign(add, add),
    remove: Object.assign(remove, remove),
    invite: Object.assign(invite, invite),
}

export default staff