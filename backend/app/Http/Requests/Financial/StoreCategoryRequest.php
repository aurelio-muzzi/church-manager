<?php

namespace App\Http\Requests\Financial;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'parent_id' => ['nullable', 'integer', 'exists:financial_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:income,expense'],
            'color' => ['nullable', 'string', 'max:20'],
            'status' => ['nullable', 'string', 'in:active,inactive'],
        ];
    }
}
