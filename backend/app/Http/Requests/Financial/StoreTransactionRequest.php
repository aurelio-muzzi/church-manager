<?php

namespace App\Http\Requests\Financial;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => ['required', 'integer', 'exists:financial_accounts,id'],
            'category_id' => ['required', 'integer', 'exists:financial_categories,id'],
            'member_id' => ['nullable', 'integer', 'exists:members,id'],
            'congregation_id' => ['nullable', 'integer', 'exists:congregations,id'],
            'type' => ['required', 'string', 'in:income,expense,transfer'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'payment_method' => ['required', 'string', 'in:pix,cash,bank_slip,card,transfer'],
            'transaction_date' => ['required', 'date'],
            'description' => ['required', 'string', 'max:255'],
            'document_number' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'in:confirmed,pending,cancelled'],
            'receipt_url' => ['nullable', 'string', 'max:500'],
        ];
    }
}
