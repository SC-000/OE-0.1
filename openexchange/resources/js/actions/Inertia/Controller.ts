import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
const Controller980bb49ee7ae63891f1d891d2fbcf1c9 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
    method: 'get',
})

Controller980bb49ee7ae63891f1d891d2fbcf1c9.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
Controller980bb49ee7ae63891f1d891d2fbcf1c9.url = (options?: RouteQueryOptions) => {
    return Controller980bb49ee7ae63891f1d891d2fbcf1c9.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
Controller980bb49ee7ae63891f1d891d2fbcf1c9.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
Controller980bb49ee7ae63891f1d891d2fbcf1c9.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controller980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
const Controller980bb49ee7ae63891f1d891d2fbcf1c9Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
Controller980bb49ee7ae63891f1d891d2fbcf1c9Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
Controller980bb49ee7ae63891f1d891d2fbcf1c9Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller980bb49ee7ae63891f1d891d2fbcf1c9.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

Controller980bb49ee7ae63891f1d891d2fbcf1c9.form = Controller980bb49ee7ae63891f1d891d2fbcf1c9Form
/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/ai-router'
*/
const Controller21cc3b42e1fa6fe6945d16e60f887d77 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller21cc3b42e1fa6fe6945d16e60f887d77.url(options),
    method: 'get',
})

Controller21cc3b42e1fa6fe6945d16e60f887d77.definition = {
    methods: ["get","head"],
    url: '/products/ai-router',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/ai-router'
*/
Controller21cc3b42e1fa6fe6945d16e60f887d77.url = (options?: RouteQueryOptions) => {
    return Controller21cc3b42e1fa6fe6945d16e60f887d77.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/ai-router'
*/
Controller21cc3b42e1fa6fe6945d16e60f887d77.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller21cc3b42e1fa6fe6945d16e60f887d77.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/ai-router'
*/
Controller21cc3b42e1fa6fe6945d16e60f887d77.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controller21cc3b42e1fa6fe6945d16e60f887d77.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/ai-router'
*/
const Controller21cc3b42e1fa6fe6945d16e60f887d77Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller21cc3b42e1fa6fe6945d16e60f887d77.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/ai-router'
*/
Controller21cc3b42e1fa6fe6945d16e60f887d77Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller21cc3b42e1fa6fe6945d16e60f887d77.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/ai-router'
*/
Controller21cc3b42e1fa6fe6945d16e60f887d77Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller21cc3b42e1fa6fe6945d16e60f887d77.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

Controller21cc3b42e1fa6fe6945d16e60f887d77.form = Controller21cc3b42e1fa6fe6945d16e60f887d77Form
/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/hyperquay'
*/
const Controllerdac7fdf92cbaa399524c3f67f1888e5d = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllerdac7fdf92cbaa399524c3f67f1888e5d.url(options),
    method: 'get',
})

Controllerdac7fdf92cbaa399524c3f67f1888e5d.definition = {
    methods: ["get","head"],
    url: '/products/hyperquay',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/hyperquay'
*/
Controllerdac7fdf92cbaa399524c3f67f1888e5d.url = (options?: RouteQueryOptions) => {
    return Controllerdac7fdf92cbaa399524c3f67f1888e5d.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/hyperquay'
*/
Controllerdac7fdf92cbaa399524c3f67f1888e5d.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllerdac7fdf92cbaa399524c3f67f1888e5d.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/hyperquay'
*/
Controllerdac7fdf92cbaa399524c3f67f1888e5d.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controllerdac7fdf92cbaa399524c3f67f1888e5d.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/hyperquay'
*/
const Controllerdac7fdf92cbaa399524c3f67f1888e5dForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllerdac7fdf92cbaa399524c3f67f1888e5d.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/hyperquay'
*/
Controllerdac7fdf92cbaa399524c3f67f1888e5dForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllerdac7fdf92cbaa399524c3f67f1888e5d.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/hyperquay'
*/
Controllerdac7fdf92cbaa399524c3f67f1888e5dForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllerdac7fdf92cbaa399524c3f67f1888e5d.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

Controllerdac7fdf92cbaa399524c3f67f1888e5d.form = Controllerdac7fdf92cbaa399524c3f67f1888e5dForm
/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/exchange'
*/
const Controllerae1ccc69b0c451db21d0a16f667b74cc = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllerae1ccc69b0c451db21d0a16f667b74cc.url(options),
    method: 'get',
})

Controllerae1ccc69b0c451db21d0a16f667b74cc.definition = {
    methods: ["get","head"],
    url: '/products/exchange',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/exchange'
*/
Controllerae1ccc69b0c451db21d0a16f667b74cc.url = (options?: RouteQueryOptions) => {
    return Controllerae1ccc69b0c451db21d0a16f667b74cc.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/exchange'
*/
Controllerae1ccc69b0c451db21d0a16f667b74cc.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllerae1ccc69b0c451db21d0a16f667b74cc.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/exchange'
*/
Controllerae1ccc69b0c451db21d0a16f667b74cc.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controllerae1ccc69b0c451db21d0a16f667b74cc.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/exchange'
*/
const Controllerae1ccc69b0c451db21d0a16f667b74ccForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllerae1ccc69b0c451db21d0a16f667b74cc.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/exchange'
*/
Controllerae1ccc69b0c451db21d0a16f667b74ccForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllerae1ccc69b0c451db21d0a16f667b74cc.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/exchange'
*/
Controllerae1ccc69b0c451db21d0a16f667b74ccForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllerae1ccc69b0c451db21d0a16f667b74cc.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

Controllerae1ccc69b0c451db21d0a16f667b74cc.form = Controllerae1ccc69b0c451db21d0a16f667b74ccForm
/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/openexchange'
*/
const Controller3b3e259ed1b50156637961e6e0c00702 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller3b3e259ed1b50156637961e6e0c00702.url(options),
    method: 'get',
})

Controller3b3e259ed1b50156637961e6e0c00702.definition = {
    methods: ["get","head"],
    url: '/products/openexchange',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/openexchange'
*/
Controller3b3e259ed1b50156637961e6e0c00702.url = (options?: RouteQueryOptions) => {
    return Controller3b3e259ed1b50156637961e6e0c00702.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/openexchange'
*/
Controller3b3e259ed1b50156637961e6e0c00702.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller3b3e259ed1b50156637961e6e0c00702.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/openexchange'
*/
Controller3b3e259ed1b50156637961e6e0c00702.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controller3b3e259ed1b50156637961e6e0c00702.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/openexchange'
*/
const Controller3b3e259ed1b50156637961e6e0c00702Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller3b3e259ed1b50156637961e6e0c00702.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/openexchange'
*/
Controller3b3e259ed1b50156637961e6e0c00702Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller3b3e259ed1b50156637961e6e0c00702.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/openexchange'
*/
Controller3b3e259ed1b50156637961e6e0c00702Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller3b3e259ed1b50156637961e6e0c00702.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

Controller3b3e259ed1b50156637961e6e0c00702.form = Controller3b3e259ed1b50156637961e6e0c00702Form
/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/data'
*/
const Controllera4323c29be9a66280b883ebe68ba1ba8 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllera4323c29be9a66280b883ebe68ba1ba8.url(options),
    method: 'get',
})

Controllera4323c29be9a66280b883ebe68ba1ba8.definition = {
    methods: ["get","head"],
    url: '/products/data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/data'
*/
Controllera4323c29be9a66280b883ebe68ba1ba8.url = (options?: RouteQueryOptions) => {
    return Controllera4323c29be9a66280b883ebe68ba1ba8.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/data'
*/
Controllera4323c29be9a66280b883ebe68ba1ba8.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllera4323c29be9a66280b883ebe68ba1ba8.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/data'
*/
Controllera4323c29be9a66280b883ebe68ba1ba8.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controllera4323c29be9a66280b883ebe68ba1ba8.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/data'
*/
const Controllera4323c29be9a66280b883ebe68ba1ba8Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllera4323c29be9a66280b883ebe68ba1ba8.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/data'
*/
Controllera4323c29be9a66280b883ebe68ba1ba8Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllera4323c29be9a66280b883ebe68ba1ba8.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/data'
*/
Controllera4323c29be9a66280b883ebe68ba1ba8Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllera4323c29be9a66280b883ebe68ba1ba8.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

Controllera4323c29be9a66280b883ebe68ba1ba8.form = Controllera4323c29be9a66280b883ebe68ba1ba8Form
/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/services'
*/
const Controllercc72403568cd83ff4ba3d986bb9983df = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllercc72403568cd83ff4ba3d986bb9983df.url(options),
    method: 'get',
})

Controllercc72403568cd83ff4ba3d986bb9983df.definition = {
    methods: ["get","head"],
    url: '/products/services',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/services'
*/
Controllercc72403568cd83ff4ba3d986bb9983df.url = (options?: RouteQueryOptions) => {
    return Controllercc72403568cd83ff4ba3d986bb9983df.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/services'
*/
Controllercc72403568cd83ff4ba3d986bb9983df.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllercc72403568cd83ff4ba3d986bb9983df.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/services'
*/
Controllercc72403568cd83ff4ba3d986bb9983df.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controllercc72403568cd83ff4ba3d986bb9983df.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/services'
*/
const Controllercc72403568cd83ff4ba3d986bb9983dfForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllercc72403568cd83ff4ba3d986bb9983df.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/services'
*/
Controllercc72403568cd83ff4ba3d986bb9983dfForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllercc72403568cd83ff4ba3d986bb9983df.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/products/services'
*/
Controllercc72403568cd83ff4ba3d986bb9983dfForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllercc72403568cd83ff4ba3d986bb9983df.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

Controllercc72403568cd83ff4ba3d986bb9983df.form = Controllercc72403568cd83ff4ba3d986bb9983dfForm
/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/pricing'
*/
const Controllera6735397690d30570f358ff62fa3ef24 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllera6735397690d30570f358ff62fa3ef24.url(options),
    method: 'get',
})

Controllera6735397690d30570f358ff62fa3ef24.definition = {
    methods: ["get","head"],
    url: '/pricing',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/pricing'
*/
Controllera6735397690d30570f358ff62fa3ef24.url = (options?: RouteQueryOptions) => {
    return Controllera6735397690d30570f358ff62fa3ef24.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/pricing'
*/
Controllera6735397690d30570f358ff62fa3ef24.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllera6735397690d30570f358ff62fa3ef24.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/pricing'
*/
Controllera6735397690d30570f358ff62fa3ef24.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controllera6735397690d30570f358ff62fa3ef24.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/pricing'
*/
const Controllera6735397690d30570f358ff62fa3ef24Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllera6735397690d30570f358ff62fa3ef24.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/pricing'
*/
Controllera6735397690d30570f358ff62fa3ef24Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllera6735397690d30570f358ff62fa3ef24.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/pricing'
*/
Controllera6735397690d30570f358ff62fa3ef24Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllera6735397690d30570f358ff62fa3ef24.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

Controllera6735397690d30570f358ff62fa3ef24.form = Controllera6735397690d30570f358ff62fa3ef24Form
/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/markets'
*/
const Controller8e3c406e766a0569c8ea998be14ac8e1 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller8e3c406e766a0569c8ea998be14ac8e1.url(options),
    method: 'get',
})

Controller8e3c406e766a0569c8ea998be14ac8e1.definition = {
    methods: ["get","head"],
    url: '/markets',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/markets'
*/
Controller8e3c406e766a0569c8ea998be14ac8e1.url = (options?: RouteQueryOptions) => {
    return Controller8e3c406e766a0569c8ea998be14ac8e1.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/markets'
*/
Controller8e3c406e766a0569c8ea998be14ac8e1.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller8e3c406e766a0569c8ea998be14ac8e1.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/markets'
*/
Controller8e3c406e766a0569c8ea998be14ac8e1.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controller8e3c406e766a0569c8ea998be14ac8e1.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/markets'
*/
const Controller8e3c406e766a0569c8ea998be14ac8e1Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller8e3c406e766a0569c8ea998be14ac8e1.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/markets'
*/
Controller8e3c406e766a0569c8ea998be14ac8e1Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller8e3c406e766a0569c8ea998be14ac8e1.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/markets'
*/
Controller8e3c406e766a0569c8ea998be14ac8e1Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller8e3c406e766a0569c8ea998be14ac8e1.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

Controller8e3c406e766a0569c8ea998be14ac8e1.form = Controller8e3c406e766a0569c8ea998be14ac8e1Form
/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/developers'
*/
const Controller358c9a56525f10c46a372202f1b95b19 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller358c9a56525f10c46a372202f1b95b19.url(options),
    method: 'get',
})

Controller358c9a56525f10c46a372202f1b95b19.definition = {
    methods: ["get","head"],
    url: '/developers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/developers'
*/
Controller358c9a56525f10c46a372202f1b95b19.url = (options?: RouteQueryOptions) => {
    return Controller358c9a56525f10c46a372202f1b95b19.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/developers'
*/
Controller358c9a56525f10c46a372202f1b95b19.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller358c9a56525f10c46a372202f1b95b19.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/developers'
*/
Controller358c9a56525f10c46a372202f1b95b19.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controller358c9a56525f10c46a372202f1b95b19.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/developers'
*/
const Controller358c9a56525f10c46a372202f1b95b19Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller358c9a56525f10c46a372202f1b95b19.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/developers'
*/
Controller358c9a56525f10c46a372202f1b95b19Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller358c9a56525f10c46a372202f1b95b19.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/developers'
*/
Controller358c9a56525f10c46a372202f1b95b19Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller358c9a56525f10c46a372202f1b95b19.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

Controller358c9a56525f10c46a372202f1b95b19.form = Controller358c9a56525f10c46a372202f1b95b19Form
/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/whitepaper'
*/
const Controllerd54990d9aac960cb07d9e78b8c1af7e2 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllerd54990d9aac960cb07d9e78b8c1af7e2.url(options),
    method: 'get',
})

Controllerd54990d9aac960cb07d9e78b8c1af7e2.definition = {
    methods: ["get","head"],
    url: '/whitepaper',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/whitepaper'
*/
Controllerd54990d9aac960cb07d9e78b8c1af7e2.url = (options?: RouteQueryOptions) => {
    return Controllerd54990d9aac960cb07d9e78b8c1af7e2.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/whitepaper'
*/
Controllerd54990d9aac960cb07d9e78b8c1af7e2.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllerd54990d9aac960cb07d9e78b8c1af7e2.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/whitepaper'
*/
Controllerd54990d9aac960cb07d9e78b8c1af7e2.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controllerd54990d9aac960cb07d9e78b8c1af7e2.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/whitepaper'
*/
const Controllerd54990d9aac960cb07d9e78b8c1af7e2Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllerd54990d9aac960cb07d9e78b8c1af7e2.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/whitepaper'
*/
Controllerd54990d9aac960cb07d9e78b8c1af7e2Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllerd54990d9aac960cb07d9e78b8c1af7e2.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/whitepaper'
*/
Controllerd54990d9aac960cb07d9e78b8c1af7e2Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllerd54990d9aac960cb07d9e78b8c1af7e2.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

Controllerd54990d9aac960cb07d9e78b8c1af7e2.form = Controllerd54990d9aac960cb07d9e78b8c1af7e2Form
/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/company'
*/
const Controller89559ce4027f36d16e05cde48c378bcb = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller89559ce4027f36d16e05cde48c378bcb.url(options),
    method: 'get',
})

Controller89559ce4027f36d16e05cde48c378bcb.definition = {
    methods: ["get","head"],
    url: '/company',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/company'
*/
Controller89559ce4027f36d16e05cde48c378bcb.url = (options?: RouteQueryOptions) => {
    return Controller89559ce4027f36d16e05cde48c378bcb.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/company'
*/
Controller89559ce4027f36d16e05cde48c378bcb.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller89559ce4027f36d16e05cde48c378bcb.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/company'
*/
Controller89559ce4027f36d16e05cde48c378bcb.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controller89559ce4027f36d16e05cde48c378bcb.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/company'
*/
const Controller89559ce4027f36d16e05cde48c378bcbForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller89559ce4027f36d16e05cde48c378bcb.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/company'
*/
Controller89559ce4027f36d16e05cde48c378bcbForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller89559ce4027f36d16e05cde48c378bcb.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/company'
*/
Controller89559ce4027f36d16e05cde48c378bcbForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller89559ce4027f36d16e05cde48c378bcb.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

Controller89559ce4027f36d16e05cde48c378bcb.form = Controller89559ce4027f36d16e05cde48c378bcbForm
/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/blog'
*/
const Controller0281689d11c3db12eb0f0bc21b3e4ed4 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller0281689d11c3db12eb0f0bc21b3e4ed4.url(options),
    method: 'get',
})

Controller0281689d11c3db12eb0f0bc21b3e4ed4.definition = {
    methods: ["get","head"],
    url: '/blog',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/blog'
*/
Controller0281689d11c3db12eb0f0bc21b3e4ed4.url = (options?: RouteQueryOptions) => {
    return Controller0281689d11c3db12eb0f0bc21b3e4ed4.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/blog'
*/
Controller0281689d11c3db12eb0f0bc21b3e4ed4.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controller0281689d11c3db12eb0f0bc21b3e4ed4.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/blog'
*/
Controller0281689d11c3db12eb0f0bc21b3e4ed4.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controller0281689d11c3db12eb0f0bc21b3e4ed4.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/blog'
*/
const Controller0281689d11c3db12eb0f0bc21b3e4ed4Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller0281689d11c3db12eb0f0bc21b3e4ed4.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/blog'
*/
Controller0281689d11c3db12eb0f0bc21b3e4ed4Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller0281689d11c3db12eb0f0bc21b3e4ed4.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/blog'
*/
Controller0281689d11c3db12eb0f0bc21b3e4ed4Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controller0281689d11c3db12eb0f0bc21b3e4ed4.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

Controller0281689d11c3db12eb0f0bc21b3e4ed4.form = Controller0281689d11c3db12eb0f0bc21b3e4ed4Form
/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/settings/appearance'
*/
const Controllere19ee86e9cf603ce1a59a1ec5d21dec5 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllere19ee86e9cf603ce1a59a1ec5d21dec5.url(options),
    method: 'get',
})

Controllere19ee86e9cf603ce1a59a1ec5d21dec5.definition = {
    methods: ["get","head"],
    url: '/settings/appearance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/settings/appearance'
*/
Controllere19ee86e9cf603ce1a59a1ec5d21dec5.url = (options?: RouteQueryOptions) => {
    return Controllere19ee86e9cf603ce1a59a1ec5d21dec5.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/settings/appearance'
*/
Controllere19ee86e9cf603ce1a59a1ec5d21dec5.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: Controllere19ee86e9cf603ce1a59a1ec5d21dec5.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/settings/appearance'
*/
Controllere19ee86e9cf603ce1a59a1ec5d21dec5.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: Controllere19ee86e9cf603ce1a59a1ec5d21dec5.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/settings/appearance'
*/
const Controllere19ee86e9cf603ce1a59a1ec5d21dec5Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllere19ee86e9cf603ce1a59a1ec5d21dec5.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/settings/appearance'
*/
Controllere19ee86e9cf603ce1a59a1ec5d21dec5Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllere19ee86e9cf603ce1a59a1ec5d21dec5.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/settings/appearance'
*/
Controllere19ee86e9cf603ce1a59a1ec5d21dec5Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: Controllere19ee86e9cf603ce1a59a1ec5d21dec5.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

Controllere19ee86e9cf603ce1a59a1ec5d21dec5.form = Controllere19ee86e9cf603ce1a59a1ec5d21dec5Form

/**
* Multiple routes resolve to \Inertia\Controller::Controller, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `Controller['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
const Controller = {
    '/': Controller980bb49ee7ae63891f1d891d2fbcf1c9,
    '/products/ai-router': Controller21cc3b42e1fa6fe6945d16e60f887d77,
    '/products/hyperquay': Controllerdac7fdf92cbaa399524c3f67f1888e5d,
    '/products/exchange': Controllerae1ccc69b0c451db21d0a16f667b74cc,
    '/products/openexchange': Controller3b3e259ed1b50156637961e6e0c00702,
    '/products/data': Controllera4323c29be9a66280b883ebe68ba1ba8,
    '/products/services': Controllercc72403568cd83ff4ba3d986bb9983df,
    '/pricing': Controllera6735397690d30570f358ff62fa3ef24,
    '/markets': Controller8e3c406e766a0569c8ea998be14ac8e1,
    '/developers': Controller358c9a56525f10c46a372202f1b95b19,
    '/whitepaper': Controllerd54990d9aac960cb07d9e78b8c1af7e2,
    '/company': Controller89559ce4027f36d16e05cde48c378bcb,
    '/blog': Controller0281689d11c3db12eb0f0bc21b3e4ed4,
    '/settings/appearance': Controllere19ee86e9cf603ce1a59a1ec5d21dec5,
}

export default Controller