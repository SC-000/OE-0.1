<?php

namespace App\Services\Gateway;

use Exception;

class GatewayException extends Exception
{
    public function __construct(public string $errorCode, string $message, public int $status = 400)
    {
        parent::__construct($message);
    }
}
