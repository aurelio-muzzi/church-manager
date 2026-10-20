<?php

namespace App\Http\Requests\Ministry;

use Illuminate\Foundation\Http\FormRequest;

class RespondScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'action' => ['required', 'in:confirm,decline,substitute'],
            'decline_reason' => ['required_if:action,decline', 'nullable', 'string', 'max:500'],
            'substituted_by_member_id' => ['required_if:action,substitute', 'nullable', 'integer', 'exists:members,id'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'decline_reason.required_if' => 'Informe a justificativa em caso de recusa da escala.',
            'substituted_by_member_id.required_if' => 'Informe o membro substituto.',
        ];
    }
}
