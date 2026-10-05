<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\ActivityLog;
use App\Models\User;
use App\Support\PhilippineMobileNumber;
use App\Support\PersonalInformation;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $validated = Validator::make($input, [
            ...PersonalInformation::validationRules($input),
            'email' => $this->emailRules(),
            'contact_number' => [
                'required',
                'string',
                PhilippineMobileNumber::RULE,
                Rule::unique('users', 'contact_number'),
            ],
            'password' => $this->passwordRules(),
        ])->validate();

        $user = User::create([
            'name' => PersonalInformation::fullName($validated),
            'first_name' => trim($validated['first_name']),
            'middle_name' => filter_var(
                $validated['middle_name_na'],
                FILTER_VALIDATE_BOOLEAN,
            ) ? null : trim($validated['middle_name']),
            'surname' => trim($validated['surname']),
            'birthdate' => $validated['birthdate'],
            'address' => trim($validated['address']),
            'zone' => trim($validated['zone']),
            'sex' => $validated['sex'],
            'email' => $validated['email'],
            'contact_number' => PhilippineMobileNumber::normalize($validated['contact_number']),
            'password' => $validated['password'],
            'role' => 'resident',
        ]);

        ActivityLog::record(
            $user,
            'account.registered',
            'Registered a resident account.',
            $user,
        );

        return $user;
    }
}
