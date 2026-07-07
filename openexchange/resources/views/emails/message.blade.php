@extends('emails.layout')

@section('content')
    @php
        $tones = ['danger' => '#d84343', 'success' => '#23a531', 'warning' => '#d99511', 'brand' => '#1c8528'];
        $tone = $tones[$tone ?? 'brand'] ?? '#1c8528';
    @endphp

    @isset($badge)
        <span style="display:inline-block; padding:4px 12px; border-radius:999px; background:{{ $tone }}1a; color:{{ $tone }}; font-size:12px; font-weight:700; letter-spacing:0.01em;">{{ $badge }}</span>
    @endisset

    <h1 style="margin:16px 0 0; color:#122023; font-size:23px; font-weight:800; letter-spacing:-0.02em; line-height:1.2;">{{ $heading }}</h1>

    @foreach (($lines ?? []) as $line)
        <p style="margin:15px 0 0; color:#5c655f; font-size:15px; line-height:1.7;">{!! $line !!}</p>
    @endforeach

    @isset($details)
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0; border-top:1px solid #efe8d9;">
            @foreach ($details as $k => $v)
                <tr>
                    <td style="padding:11px 0; border-bottom:1px solid #efe8d9; color:#837b6c; font-size:13px;">{{ $k }}</td>
                    <td align="right" style="padding:11px 0; border-bottom:1px solid #efe8d9; color:#122023; font-size:13px; font-weight:600; font-family:'SFMono-Regular',Consolas,Menlo,monospace;">{{ $v }}</td>
                </tr>
            @endforeach
        </table>
    @endisset

    @isset($action)
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 4px;"><tr>
            <td style="border-radius:9px; background:#1c8528;">
                <a href="{{ $action['url'] }}" style="display:inline-block; padding:13px 26px; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; border-radius:9px;">{{ $action['label'] }} &rarr;</a>
            </td>
        </tr></table>
    @endisset

    @foreach (($outro ?? []) as $line)
        <p style="margin:22px 0 0; color:#837b6c; font-size:13px; line-height:1.6;">{!! $line !!}</p>
    @endforeach
@endsection
