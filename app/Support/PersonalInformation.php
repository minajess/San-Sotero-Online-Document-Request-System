<?php

namespace App\Support;

use Illuminate\Validation\Rule;

class PersonalInformation
{
    /**
     * @param  array<string, mixed>  $input
     * @return array<string, array<int, mixed>|string>
     */
    public static function validationRules(array $input): array
    {
        $middleNameNotApplicable = filter_var(
            $input['middle_name_na'] ?? false,
            FILTER_VALIDATE_BOOLEAN,
        );

        return [
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => [
                Rule::requiredIf(! $middleNameNotApplicable),
                'nullable',
                'string',
                'max:100',
            ],
            'middle_name_na' => ['required', 'boolean'],
            'surname' => ['required', 'string', 'max:100'],
            'birthdate' => ['required', 'date', 'before:today'],
            'address' => ['required', 'string', 'max:255'],
            'zone' => ['required', 'string', 'max:100'],
            'sex' => ['required', Rule::in(['Male', 'Female'])],
        ];
    }

    /**
     * @param  array<string, mixed>  $information
     */
    public static function fullName(array $information): string
    {
        $middleName = filter_var(
            $information['middle_name_na'] ?? false,
            FILTER_VALIDATE_BOOLEAN,
        ) ? null : ($information['middle_name'] ?? null);

        return implode(' ', array_filter([
            trim((string) $information['first_name']),
            is_string($middleName) && trim($middleName) !== ''
                ? trim($middleName)
                : null,
            trim((string) $information['surname']),
        ]));
    }
}
