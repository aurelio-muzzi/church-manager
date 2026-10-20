<?php

namespace App\Http\Requests\Financial;

use Illuminate\Foundation\Http\FormRequest;

class StoreAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'congregation_id' => ['nullable', 'integer', 'exists:congregations,id'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:checking,cash,savings,investment'],
            'bank_name' => ['nullable', 'string', 'max:100'],
            'agency' => ['nullable', 'string', 'max:20'],
            'account_number' => ['nullable', 'string', 'max:30'],
            'initial_balance' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'string', 'in:active,inactive'],
        ];
    }
}
