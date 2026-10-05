<?php

namespace App\Support;

class PhilippineMobileNumber
{
    public const RULE = 'regex:/^(?:09\d{9}|\+639\d{9}|639\d{9})$/';

    public static function normalize(string $number): string
    {
        if (str_starts_with($number, '+63')) {
            return '0'.substr($number, 3);
        }

        if (str_starts_with($number, '63')) {
            return '0'.substr($number, 2);
        }

        return $number;
    }
}
