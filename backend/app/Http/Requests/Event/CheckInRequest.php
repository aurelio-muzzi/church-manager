<?php

namespace App\Http\Requests\Event;

use Illuminate\Foundation\Http\FormRequest;

class CheckInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'qr_code_token' => ['nullable', 'string', 'max:64'],
            'registration_id' => ['nullable', 'integer', 'exists:event_registrations,id'],
            'member_id' => ['nullable', 'integer', 'exists:members,id'],
            'visitor_id' => ['nullable', 'integer', 'exists:visitors,id'],
            'name' => ['nullable', 'string', 'max:255'],
            'check_in_type' => ['nullable', 'in:qr_code,manual'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
