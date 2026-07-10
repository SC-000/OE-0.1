import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import staff from './staff'
/**
* @see \App\Http\Controllers\Admin\ClientsController::store
* @see app/Http/Controllers/Admin/ClientsController.php:205
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
* @see app/Http/Controllers/Admin/ClientsController.php:205
* @route '/admin/clients'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ClientsController::store
* @see app/Http/Controllers/Admin/ClientsController.php:205
* @route '/admin/clients'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::store
* @see app/Http/Controllers/Admin/ClientsController.php:205
* @route '/admin/clients'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::store
* @see app/Http/Controllers/Admin/ClientsController.php:205
* @route '/admin/clients'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\ClientsController::show
* @see app/Http/Controllers/Admin/ClientsController.php:76
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
* @see app/Http/Controllers/Admin/ClientsController.php:76
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
* @see app/Http/Controllers/Admin/ClientsController.php:76
* @route '/admin/clients/{client}'
*/
show.get = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::show
* @see app/Http/Controllers/Admin/ClientsController.php:76
* @route '/admin/clients/{client}'
*/
show.head = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::show
* @see app/Http/Controllers/Admin/ClientsController.php:76
* @route '/admin/clients/{client}'
*/
const showForm = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::show
* @see app/Http/Controllers/Admin/ClientsController.php:76
* @route '/admin/clients/{client}'
*/
showForm.get = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::show
* @see app/Http/Controllers/Admin/ClientsController.php:76
* @route '/admin/clients/{client}'
*/
showForm.head = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\Admin\ClientsController::update
* @see app/Http/Controllers/Admin/ClientsController.php:241
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
* @see app/Http/Controllers/Admin/ClientsController.php:241
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
* @see app/Http/Controllers/Admin/ClientsController.php:241
* @route '/admin/clients/{client}'
*/
update.patch = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::update
* @see app/Http/Controllers/Admin/ClientsController.php:241
* @route '/admin/clients/{client}'
*/
const updateForm = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::update
* @see app/Http/Controllers/Admin/ClientsController.php:241
* @route '/admin/clients/{client}'
*/
updateForm.patch = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Admin\ClientsController::destroy
* @see app/Http/Controllers/Admin/ClientsController.php:272
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
* @see app/Http/Controllers/Admin/ClientsController.php:272
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
* @see app/Http/Controllers/Admin/ClientsController.php:272
* @route '/admin/clients/{client}'
*/
destroy.delete = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::destroy
* @see app/Http/Controllers/Admin/ClientsController.php:272
* @route '/admin/clients/{client}'
*/
const destroyForm = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::destroy
* @see app/Http/Controllers/Admin/ClientsController.php:272
* @route '/admin/clients/{client}'
*/
destroyForm.delete = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\Admin\ClientsController::balance
* @see app/Http/Controllers/Admin/ClientsController.php:286
* @route '/admin/clients/{client}/balance'
*/
export const balance = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: balance.url(args, options),
    method: 'post',
})

balance.definition = {
    methods: ["post"],
    url: '/admin/clients/{client}/balance',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ClientsController::balance
* @see app/Http/Controllers/Admin/ClientsController.php:286
* @route '/admin/clients/{client}/balance'
*/
balance.url = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return balance.definition.url
            .replace('{client}', parsedArgs.client.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ClientsController::balance
* @see app/Http/Controllers/Admin/ClientsController.php:286
* @route '/admin/clients/{client}/balance'
*/
balance.post = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: balance.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::balance
* @see app/Http/Controllers/Admin/ClientsController.php:286
* @route '/admin/clients/{client}/balance'
*/
const balanceForm = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: balance.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::balance
* @see app/Http/Controllers/Admin/ClientsController.php:286
* @route '/admin/clients/{client}/balance'
*/
balanceForm.post = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: balance.url(args, options),
    method: 'post',
})

balance.form = balanceForm

/**
* @see \App\Http\Controllers\Admin\ImpersonationController::impersonate
* @see app/Http/Controllers/Admin/ImpersonationController.php:15
* @route '/admin/clients/{client}/impersonate'
*/
export const impersonate = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: impersonate.url(args, options),
    method: 'post',
})

impersonate.definition = {
    methods: ["post"],
    url: '/admin/clients/{client}/impersonate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ImpersonationController::impersonate
* @see app/Http/Controllers/Admin/ImpersonationController.php:15
* @route '/admin/clients/{client}/impersonate'
*/
impersonate.url = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return impersonate.definition.url
            .replace('{client}', parsedArgs.client.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ImpersonationController::impersonate
* @see app/Http/Controllers/Admin/ImpersonationController.php:15
* @route '/admin/clients/{client}/impersonate'
*/
impersonate.post = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: impersonate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ImpersonationController::impersonate
* @see app/Http/Controllers/Admin/ImpersonationController.php:15
* @route '/admin/clients/{client}/impersonate'
*/
const impersonateForm = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: impersonate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ImpersonationController::impersonate
* @see app/Http/Controllers/Admin/ImpersonationController.php:15
* @route '/admin/clients/{client}/impersonate'
*/
impersonateForm.post = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: impersonate.url(args, options),
    method: 'post',
})

impersonate.form = impersonateForm

/**
* @see \App\Http\Controllers\Admin\ClientsController::recost
* @see app/Http/Controllers/Admin/ClientsController.php:449
* @route '/admin/clients/{client}/recost'
*/
export const recost = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: recost.url(args, options),
    method: 'post',
})

recost.definition = {
    methods: ["post"],
    url: '/admin/clients/{client}/recost',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ClientsController::recost
* @see app/Http/Controllers/Admin/ClientsController.php:449
* @route '/admin/clients/{client}/recost'
*/
recost.url = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return recost.definition.url
            .replace('{client}', parsedArgs.client.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ClientsController::recost
* @see app/Http/Controllers/Admin/ClientsController.php:449
* @route '/admin/clients/{client}/recost'
*/
recost.post = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: recost.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::recost
* @see app/Http/Controllers/Admin/ClientsController.php:449
* @route '/admin/clients/{client}/recost'
*/
const recostForm = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: recost.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ClientsController::recost
* @see app/Http/Controllers/Admin/ClientsController.php:449
* @route '/admin/clients/{client}/recost'
*/
recostForm.post = (args: { client: number | { id: number } } | [client: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: recost.url(args, options),
    method: 'post',
})

recost.form = recostForm

const clients = {
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    balance: Object.assign(balance, balance),
    staff: Object.assign(staff, staff),
    impersonate: Object.assign(impersonate, impersonate),
    recost: Object.assign(recost, recost),
}

export default clients