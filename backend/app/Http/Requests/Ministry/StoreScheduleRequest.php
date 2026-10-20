<?php

namespace App\Http\Requests\Ministry;

use Illuminate\Foundation\Http\FormRequest;

class StoreScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ministry_id' => ['required', 'integer', 'exists:ministries,id'],
            'congregation_id' => ['nullable', 'integer', 'exists:congregations,id'],
            'title' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'status' => ['nullable', 'in:draft,published,completed,cancelled'],
            'volunteers' => ['nullable', 'array'],
            'volunteers.*.member_id' => ['required_with:volunteers', 'integer', 'exists:members,id'],
            'volunteers.*.ministry_role_id' => ['nullable', 'integer', 'exists:ministry_roles,id'],
            'allow_conflicts' => ['nullable', 'boolean'],
        ];
    }
}
