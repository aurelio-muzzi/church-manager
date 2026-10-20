<?php

namespace App\Http\Requests\Event;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'congregation_id' => ['nullable', 'integer', 'exists:congregations,id'],
            'ministry_id' => ['nullable', 'integer', 'exists:ministries,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'in:service,conference,course,workshop,retreat,other'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'banner_url' => ['nullable', 'url', 'max:500'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'max_capacity' => ['nullable', 'integer', 'min:1'],
            'requires_registration' => ['nullable', 'boolean'],
            'is_free' => ['nullable', 'boolean'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'string', 'in:draft,published,cancelled,completed'],
        ];
    }
}
