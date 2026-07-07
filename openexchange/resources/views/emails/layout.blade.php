<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{ $title ?? 'Open Exchange' }}</title>
</head>
<body style="margin:0; padding:0; background:#f5f0e6; -webkit-font-smoothing:antialiased; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e6;">
        <tr>
            <td align="center" style="padding:32px 12px;">
                <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px; max-width:100%;">
                    {{-- header --}}
                    <tr>
                        <td style="background:#122023; border-radius:16px 16px 0 0; padding:22px 30px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                                <td style="vertical-align:middle;">
                                    <span style="color:#eef3f2; font-size:20px; font-weight:800; letter-spacing:-0.02em;">open<span style="color:#33c13e;">exchange</span></span>
                                </td>
                                <td align="right" style="vertical-align:middle;">
                                    <span style="color:rgba(238,243,242,0.45); font-family:'SFMono-Regular',Consolas,Menlo,monospace; font-size:11px; letter-spacing:0.1em;">THE&nbsp;AI&nbsp;EXCHANGE</span>
                                </td>
                            </tr></table>
                        </td>
                    </tr>
                    {{-- accent rule --}}
                    <tr><td style="height:3px; background:#33c13e; line-height:3px; font-size:0;">&nbsp;</td></tr>
                    {{-- body --}}
                    <tr>
                        <td style="background:#fffdf8; padding:36px 30px; border-left:1px solid #e7ddc9; border-right:1px solid #e7ddc9;">
                            @yield('content')
                        </td>
                    </tr>
                    {{-- footer --}}
                    <tr>
                        <td style="background:#fffdf8; border:1px solid #e7ddc9; border-top:none; border-radius:0 0 16px 16px; padding:22px 30px;">
                            <p style="margin:0; color:#837b6c; font-size:12px; line-height:1.7;">
                                <strong style="color:#5c655f;">Open Exchange</strong> · Backbone for AI development<br>
                                <a href="{{ config('app.url') }}/whitepaper" style="color:#1c8528; text-decoration:none;">White paper</a> &nbsp;·&nbsp;
                                <a href="{{ config('app.url') }}/company#security" style="color:#1c8528; text-decoration:none;">Security</a> &nbsp;·&nbsp;
                                <a href="{{ config('app.url') }}/console/billing" style="color:#1c8528; text-decoration:none;">Billing</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:18px 30px 0; text-align:center;">
                            <p style="margin:0; color:#b3a98f; font-size:11px; line-height:1.6;">You're receiving this because you have an Open Exchange account.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
