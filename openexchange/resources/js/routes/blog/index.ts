import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see routes/web.php:40
* @route '/blog/{slug}'
*/
export const article = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: article.url(args, options),
    method: 'get',
})

article.definition = {
    methods: ["get","head"],
    url: '/blog/{slug}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see routes/web.php:40
* @route '/blog/{slug}'
*/
article.url = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { slug: args }
    }

    if (Array.isArray(args)) {
        args = {
            slug: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        slug: args.slug,
    }

    return article.definition.url
            .replace('{slug}', parsedArgs.slug.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see routes/web.php:40
* @route '/blog/{slug}'
*/
article.get = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: article.url(args, options),
    method: 'get',
})

/**
* @see routes/web.php:40
* @route '/blog/{slug}'
*/
article.head = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: article.url(args, options),
    method: 'head',
})

/**
* @see routes/web.php:40
* @route '/blog/{slug}'
*/
const articleForm = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: article.url(args, options),
    method: 'get',
})

/**
* @see routes/web.php:40
* @route '/blog/{slug}'
*/
articleForm.get = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: article.url(args, options),
    method: 'get',
})

/**
* @see routes/web.php:40
* @route '/blog/{slug}'
*/
articleForm.head = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: article.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

article.form = articleForm

const blog = {
    article: Object.assign(article, article),
}

export default blog