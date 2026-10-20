<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    public function test_health_check_returns_ok_status(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'app',
                'version',
                'environment',
                'timezone',
                'database',
                'timestamp',
            ])
            ->assertJson([
                'status' => 'ok',
                'app' => 'ChurchManager API',
            ]);
    }
}
