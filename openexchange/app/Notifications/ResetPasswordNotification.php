<?php

namespace App\Notifications;

use App\Mail\PasswordResetMail;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Config;

class ResetPasswordNotification extends Notification
{
    public function __construct(public string $token) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): PasswordResetMail
    {
        $email = $notifiable->getEmailForPasswordReset();
        $url = rtrim((string) config('app.url'), '/').'/reset-password/'.$this->token.'?email='.urlencode($email);
        $expires = (int) (Config::get('auth.passwords.users.expire', 60));

        return (new PasswordResetMail($url, $expires))->to($email);
    }
}
