<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isPlatformAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            // Dados da Igreja / Tenant
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:100', 'unique:tenants,slug'],
            'document_number' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'timezone' => ['nullable', 'string', 'max:50'],

            // Dados do Administrador Inicial da Igreja
            'admin_name' => ['required', 'string', 'max:255'],
            'admin_email' => ['required', 'string', 'email', 'max:255'],
            'admin_password' => ['required', 'string', 'min:8'],
            'admin_phone' => ['nullable', 'string', 'max:30'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O nome da igreja é obrigatório.',
            'slug.unique' => 'Este identificador (slug) já está em uso.',
            'admin_name.required' => 'O nome do administrador da igreja é obrigatório.',
            'admin_email.required' => 'O e-mail do administrador da igreja é obrigatório.',
            'admin_password.required' => 'A senha do administrador da igreja é obrigatória.',
            'admin_password.min' => 'A senha deve conter no mínimo 8 caracteres.',
        ];
    }
}
