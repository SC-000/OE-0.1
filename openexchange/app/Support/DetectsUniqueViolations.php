<?php

namespace App\Support;

use Illuminate\Database\QueryException;

trait DetectsUniqueViolations
{
    /** True when the failure is a unique-constraint collision — i.e. "already done". */
    protected function isUniqueViolation(QueryException $e): bool
    {
        $code = (string) ($e->errorInfo[0] ?? '');
        $msg = strtolower($e->getMessage());

        return $code === '23000' || $code === '23505'
            || str_contains($msg, 'unique') || str_contains($msg, 'duplicate');
    }
}
