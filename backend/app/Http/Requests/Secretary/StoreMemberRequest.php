<?php

namespace App\Http\Requests\Secretary;

use Illuminate\Foundation\Http\FormRequest;

class StoreMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'congregation_id' => ['nullable', 'integer', 'exists:congregations,id'],
            'family_id' => ['nullable', 'integer', 'exists:families,id'],
            'family_role' => ['nullable', 'string', 'in:head,spouse,child,parent,other'],
            'gender' => ['nullable', 'in:male,female,other'],
            'birth_date' => ['nullable', 'date'],
            'marital_status' => ['nullable', 'string', 'in:single,married,divorced,widowed,other'],
            'membership_status' => ['nullable', 'string', 'in:active,inactive,under_discipline,transferred,deceased'],
            'baptism_date' => ['nullable', 'date'],
            'admission_date' => ['nullable', 'date'],
            'admission_type' => ['nullable', 'string', 'in:baptism,profession_of_faith,transfer,acclamation'],
            'address' => ['nullable', 'string', 'max:255'],
            'neighborhood' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'size:2'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:30'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
