import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ChargesController::store
* @see app/Http/Controllers/Admin/ChargesController.php:20
* @route '/admin/charges'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/charges',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ChargesController::store
* @see app/Http/Controllers/Admin/ChargesController.php:20
* @route '/admin/charges'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ChargesController::store
* @see app/Http/Controllers/Admin/ChargesController.php:20
* @route '/admin/charges'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ChargesController::store
* @see app/Http/Controllers/Admin/ChargesController.php:20
* @route '/admin/charges'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ChargesController::store
* @see app/Http/Controllers/Admin/ChargesController.php:20
* @route '/admin/charges'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\ChargesController::update
* @see app/Http/Controllers/Admin/ChargesController.php:39
* @route '/admin/charges/{charge}'
*/
export const update = (args: { charge: number | { id: number } } | [charge: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/admin/charges/{charge}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\ChargesController::update
* @see app/Http/Controllers/Admin/ChargesController.php:39
* @route '/admin/charges/{charge}'
*/
update.url = (args: { charge: number | { id: number } } | [charge: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { charge: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { charge: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            charge: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        charge: typeof args.charge === 'object'
        ? args.charge.id
        : args.charge,
    }

    return update.definition.url
            .replace('{charge}', parsedArgs.charge.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ChargesController::update
* @see app/Http/Controllers/Admin/ChargesController.php:39
* @route '/admin/charges/{charge}'
*/
update.patch = (args: { charge: number | { id: number } } | [charge: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\ChargesController::update
* @see app/Http/Controllers/Admin/ChargesController.php:39
* @route '/admin/charges/{charge}'
*/
const updateForm = (args: { charge: number | { id: number } } | [charge: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ChargesController::update
* @see app/Http/Controllers/Admin/ChargesController.php:39
* @route '/admin/charges/{charge}'
*/
updateForm.patch = (args: { charge: number | { id: number } } | [charge: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\ChargesController::destroy
* @see app/Http/Controllers/Admin/ChargesController.php:55
* @route '/admin/charges/{charge}'
*/
export const destroy = (args: { charge: number | { id: number } } | [charge: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/charges/{charge}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\ChargesController::destroy
* @see app/Http/Controllers/Admin/ChargesController.php:55
* @route '/admin/charges/{charge}'
*/
destroy.url = (args: { charge: number | { id: number } } | [charge: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { charge: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { charge: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            charge: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        charge: typeof args.charge === 'object'
        ? args.charge.id
        : args.charge,
    }

    return destroy.definition.url
            .replace('{charge}', parsedArgs.charge.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ChargesController::destroy
* @see app/Http/Controllers/Admin/ChargesController.php:55
* @route '/admin/charges/{charge}'
*/
destroy.delete = (args: { charge: number | { id: number } } | [charge: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\ChargesController::destroy
* @see app/Http/Controllers/Admin/ChargesController.php:55
* @route '/admin/charges/{charge}'
*/
const destroyForm = (args: { charge: number | { id: number } } | [charge: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ChargesController::destroy
* @see app/Http/Controllers/Admin/ChargesController.php:55
* @route '/admin/charges/{charge}'
*/
destroyForm.delete = (args: { charge: number | { id: number } } | [charge: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\ChargesController::runNow
* @see app/Http/Controllers/Admin/ChargesController.php:67
* @route '/admin/charges/{charge}/run'
*/
export const runNow = (args: { charge: number | { id: number } } | [charge: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: runNow.url(args, options),
    method: 'post',
})

runNow.definition = {
    methods: ["post"],
    url: '/admin/charges/{charge}/run',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ChargesController::runNow
* @see app/Http/Controllers/Admin/ChargesController.php:67
* @route '/admin/charges/{charge}/run'
*/
runNow.url = (args: { charge: number | { id: number } } | [charge: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { charge: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { charge: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            charge: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        charge: typeof args.charge === 'object'
        ? args.charge.id
        : args.charge,
    }

    return runNow.definition.url
            .replace('{charge}', parsedArgs.charge.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ChargesController::runNow
* @see app/Http/Controllers/Admin/ChargesController.php:67
* @route '/admin/charges/{charge}/run'
*/
runNow.post = (args: { charge: number | { id: number } } | [charge: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: runNow.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ChargesController::runNow
* @see app/Http/Controllers/Admin/ChargesController.php:67
* @route '/admin/charges/{charge}/run'
*/
const runNowForm = (args: { charge: number | { id: number } } | [charge: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: runNow.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ChargesController::runNow
* @see app/Http/Controllers/Admin/ChargesController.php:67
* @route '/admin/charges/{charge}/run'
*/
runNowForm.post = (args: { charge: number | { id: number } } | [charge: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: runNow.url(args, options),
    method: 'post',
})

runNow.form = runNowForm

const ChargesController = { store, update, destroy, runNow }

export default ChargesController