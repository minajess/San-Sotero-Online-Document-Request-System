<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property array<string, mixed> $content
 */
#[Fillable(['content'])]
class LandingPageSetting extends Model
{
    protected function casts(): array
    {
        return [
            'content' => 'array',
        ];
    }
}
