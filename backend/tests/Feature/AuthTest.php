<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'name' => 'Igreja Teste',
            'slug' => 'igreja-teste',
            'status' => 'active',
        ]);

        $this->user = User::create([
            'name' => 'Pastor Teste',
            'email' => 'pastor@teste.local',
            'password' => Hash::make('Secret@123456'),
            'status' => 'active',
        ]);

        TenantUser::create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id,
            'role' => 'church_admin',
            'is_default' => true,
            'status' => 'active',
        ]);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'pastor@teste.local',
            'password' => 'Secret@123456',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'token',
                    'user' => ['id', 'name', 'email'],
                    'active_tenant' => ['id', 'name', 'slug', 'role'],
                    'tenants',
                ],
            ])
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'user' => [
                        'email' => 'pastor@teste.local',
                    ],
                    'active_tenant' => [
                        'id' => $this->tenant->id,
                        'slug' => 'igreja-teste',
                        'role' => 'church_admin',
                    ],
                ],
            ]);
    }

    public function test_user_cannot_login_with_invalid_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'pastor@teste.local',
            'password' => 'SenhaErrada123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_authenticated_user_can_access_me_endpoint(): void
    {
        $token = $this->user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'user' => [
                        'id' => $this->user->id,
                        'email' => 'pastor@teste.local',
                    ],
                    'active_tenant' => [
                        'id' => $this->tenant->id,
                        'role' => 'church_admin',
                    ],
                ],
            ]);
    }

    public function test_unauthenticated_user_cannot_access_me_endpoint(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }

    public function test_user_can_logout_and_revoke_token(): void
    {
        $token = $this->user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson(['status' => 'success']);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
