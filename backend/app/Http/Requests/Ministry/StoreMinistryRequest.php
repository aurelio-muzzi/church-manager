<?php

namespace App\Http\Requests\Ministry;

use Illuminate\Foundation\Http\FormRequest;

class StoreMinistryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'leader_member_id' => ['nullable', 'integer', 'exists:members,id'],
            'color' => ['nullable', 'string', 'max:10'],
            'status' => ['nullable', 'in:active,inactive'],
            'roles' => ['nullable', 'array'],
            'roles.*.name' => ['required_with:roles', 'string', 'max:100'],
            'roles.*.description' => ['nullable', 'string', 'max:255'],
        ];
    }
}
