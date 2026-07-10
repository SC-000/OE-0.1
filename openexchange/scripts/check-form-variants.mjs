#!/usr/bin/env node
/**
 * Guard: every `.form()` call site must resolve to a generated `.form` variant.
 *
 * Wayfinder's vite plugin only runs on `command === 'serve'` (see vite.config.ts), so a
 * production build consumes the COMMITTED files under resources/js/{routes,actions}. If
 * those were generated without `--with-form`, `npm run build` succeeds and then
 * `/login` dies in the browser with "store.form is not a function". Dev never notices,
 * because `npm run dev` regenerates them with form variants into the working tree.
 *
 * Chained into `build` and `build:ssr` — not a `prebuild` hook, which npm silently skips
 * when `ignore-scripts` is set. Pure Node: no shell, no PHP, milliseconds.
 *
 * Fix a failure with:  php artisan wayfinder:generate --with-form
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['resources/js/pages', 'resources/js/components'];
const SOURCE = /\.(tsx?|jsx?)$/;

/** @returns {string[]} every source file under `dir`, recursively. */
function walk(dir) {
    if (!existsSync(dir)) {
        return [];
    }

    return readdirSync(dir).flatMap((entry) => {
        const path = join(dir, entry);

        if (statSync(path).isDirectory()) {
            return walk(path);
        }

        return SOURCE.test(path) ? [path] : [];
    });
}

const problems = [];
let checked = 0;

for (const file of ROOTS.flatMap(walk)) {
    const src = readFileSync(file, 'utf8');

    if (!src.includes('.form()')) {
        continue;
    }

    for (const line of src.split('\n')) {
        // The root identifier of e.g. `ProfileController.update.form()` or `store.form()`.
        const call = line.match(/([A-Za-z_$][\w$]*)(?:\.[\w$]+)*\.form\(\)/);

        if (!call) {
            continue;
        }

        const root = call[1];

        // Where that identifier is imported from (default or named).
        const imported = src.match(
            new RegExp(
                String.raw`import\s+(?:${root}\s|\{[^}]*\b${root}\b[^}]*\})\s*from\s*'([^']+)'`,
            ),
        );

        if (!imported) {
            problems.push(`${file}: cannot resolve the import for \`${root}\``);
            continue;
        }

        const base = imported[1].replace(/^@\//, 'resources/js/');
        const module_ = [`${base}.ts`, `${base}/index.ts`, `${base}.tsx`].find(
            existsSync,
        );

        if (!module_) {
            problems.push(
                `${file}: \`${root}\` imported from ${imported[1]}, which does not exist`,
            );
            continue;
        }

        checked++;

        if (!readFileSync(module_, 'utf8').includes('.form = ')) {
            problems.push(
                `${file}: \`${root}.form()\` but ${module_} defines no .form variant`,
            );
        }
    }
}

if (problems.length > 0) {
    console.error('\nform-variants: BUILD WOULD SHIP A BROKEN PAGE\n');

    for (const problem of problems) {
        console.error(`  ✗ ${problem}`);
    }

    console.error(
        '\n  Fix:  php artisan wayfinder:generate --with-form   (then commit resources/js/{routes,actions})\n',
    );
    process.exit(1);
}

if (checked === 0) {
    console.log('form-variants: no .form() call sites.');
} else {
    console.log(`form-variants: ${checked} .form() call site(s) resolve.`);
}
