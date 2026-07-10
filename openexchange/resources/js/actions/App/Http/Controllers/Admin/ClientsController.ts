import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ClientsController::index
* @see app/Http/Controllers/Admin/ClientsController.php:33
* @route '/admin/clients'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/clients',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ClientsController::index
* @see app/Http/Controllers/Admin/ClientsController.php:33
* @route '/admin/clients'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ClientsController::index
* @see app/Http/Controllers/Admin/ClientsController.php:33
* @route '/admin/clients'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::index
* @see app/Http/Controllers/Admin/ClientsController.php:33
* @route '/admin/clients'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::store
* @see app/Http/Controllers/Admin/ClientsController.php:198
* @route '/admin/clients'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/clients',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ClientsController::store
* @see app/Http/Controllers/Admin/ClientsController.php:198
* @route '/admin/clients'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ClientsController::store
* @see app/Http/Controllers/Admin/ClientsController.php:198
* @route '/admin/clients'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::show
* @see app/Http/Controllers/Admin/ClientsController.php:72
* @route '/admin/clients/{client}'
*/
export const show = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/clients/{client}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ClientsController::show
* @see app/Http/Controllers/Admin/ClientsController.php:72
* @route '/admin/clients/{client}'
*/
show.url = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{client}', parsedArgs.client.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ClientsController::show
* @see app/Http/Controllers/Admin/ClientsController.php:72
* @route '/admin/clients/{client}'
*/
show.get = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::show
* @see app/Http/Controllers/Admin/ClientsController.php:72
* @route '/admin/clients/{client}'
*/
show.head = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::update
* @see app/Http/Controllers/Admin/ClientsController.php:234
* @route '/admin/clients/{client}'
*/
export const update = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/admin/clients/{client}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\ClientsController::update
* @see app/Http/Controllers/Admin/ClientsController.php:234
* @route '/admin/clients/{client}'
*/
update.url = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{client}', parsedArgs.client.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ClientsController::update
* @see app/Http/Controllers/Admin/ClientsController.php:234
* @route '/admin/clients/{client}'
*/
update.patch = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::destroy
* @see app/Http/Controllers/Admin/ClientsController.php:265
* @route '/admin/clients/{client}'
*/
export const destroy = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/clients/{client}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\ClientsController::destroy
* @see app/Http/Controllers/Admin/ClientsController.php:265
* @route '/admin/clients/{client}'
*/
destroy.url = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{client}', parsedArgs.client.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ClientsController::destroy
* @see app/Http/Controllers/Admin/ClientsController.php:265
* @route '/admin/clients/{client}'
*/
destroy.delete = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::adjustBalance
* @see app/Http/Controllers/Admin/ClientsController.php:279
* @route '/admin/clients/{client}/balance'
*/
export const adjustBalance = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjustBalance.url(args, options),
    method: 'post',
})

adjustBalance.definition = {
    methods: ["post"],
    url: '/admin/clients/{client}/balance',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ClientsController::adjustBalance
* @see app/Http/Controllers/Admin/ClientsController.php:279
* @route '/admin/clients/{client}/balance'
*/
adjustBalance.url = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return adjustBalance.definition.url
            .replace('{client}', parsedArgs.client.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ClientsController::adjustBalance
* @see app/Http/Controllers/Admin/ClientsController.php:279
* @route '/admin/clients/{client}/balance'
*/
adjustBalance.post = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjustBalance.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::addStaff
* @see app/Http/Controllers/Admin/ClientsController.php:297
* @route '/admin/clients/{client}/staff'
*/
export const addStaff = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addStaff.url(args, options),
    method: 'post',
})

addStaff.definition = {
    methods: ["post"],
    url: '/admin/clients/{client}/staff',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ClientsController::addStaff
* @see app/Http/Controllers/Admin/ClientsController.php:297
* @route '/admin/clients/{client}/staff'
*/
addStaff.url = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return addStaff.definition.url
            .replace('{client}', parsedArgs.client.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ClientsController::addStaff
* @see app/Http/Controllers/Admin/ClientsController.php:297
* @route '/admin/clients/{client}/staff'
*/
addStaff.post = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addStaff.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::removeStaff
* @see app/Http/Controllers/Admin/ClientsController.php:317
* @route '/admin/clients/{client}/staff/{user}'
*/
export const removeStaff = (args: { client: number | { id: number }, user: number | { id: number } } | [client: number | { id: number }, user: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeStaff.url(args, options),
    method: 'delete',
})

removeStaff.definition = {
    methods: ["delete"],
    url: '/admin/clients/{client}/staff/{user}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\ClientsController::removeStaff
* @see app/Http/Controllers/Admin/ClientsController.php:317
* @route '/admin/clients/{client}/staff/{user}'
*/
removeStaff.url = (args: { client: number | { id: number }, user: number | { id: number } } | [client: number | { id: number }, user: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return removeStaff.definition.url
            .replace('{client}', parsedArgs.client.toString())
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ClientsController::removeStaff
* @see app/Http/Controllers/Admin/ClientsController.php:317
* @route '/admin/clients/{client}/staff/{user}'
*/
removeStaff.delete = (args: { client: number | { id: number }, user: number | { id: number } } | [client: number | { id: number }, user: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeStaff.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::resendInvite
* @see app/Http/Controllers/Admin/ClientsController.php:329
* @route '/admin/clients/{client}/staff/{user}/invite'
*/
export const resendInvite = (args: { client: number | { id: number }, user: number | { id: number } } | [client: number | { id: number }, user: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resendInvite.url(args, options),
    method: 'post',
})

resendInvite.definition = {
    methods: ["post"],
    url: '/admin/clients/{client}/staff/{user}/invite',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ClientsController::resendInvite
* @see app/Http/Controllers/Admin/ClientsController.php:329
* @route '/admin/clients/{client}/staff/{user}/invite'
*/
resendInvite.url = (args: { client: number | { id: number }, user: number | { id: number } } | [client: number | { id: number }, user: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return resendInvite.definition.url
            .replace('{client}', parsedArgs.client.toString())
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ClientsController::resendInvite
* @see app/Http/Controllers/Admin/ClientsController.php:329
* @route '/admin/clients/{client}/staff/{user}/invite'
*/
resendInvite.post = (args: { client: number | { id: number }, user: number | { id: number } } | [client: number | { id: number }, user: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resendInvite.url(args, options),
    method: 'post',
})

const ClientsController = { index, store, show, update, destroy, adjustBalance, addStaff, removeStaff, resendInvite }

export default ClientsController