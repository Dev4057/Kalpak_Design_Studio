/**
 * Phase 1 Verification Script
 * Run: npx tsx scripts/verify-phase1.ts
 *
 * Prerequisites:
 *  - .env file present in packages/api/ with valid SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *  - API server running on http://localhost:4000 (pnpm dev:api)
 *  - Supabase migrations applied (001–003)
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const API_URL = process.env.VERIFY_API_URL ?? 'http://localhost:4000'
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const TEST_PARTNER_EMAIL = `verify_partner_${Date.now()}@kalpak-test.com`
const TEST_PARTNER_PASSWORD = 'Test@1234!'
const TEST_EMPLOYEE_EMAIL = `verify_employee_${Date.now()}@kalpak-test.com`
const TEST_EMPLOYEE_PASSWORD = 'Test@1234!'

const results: { check: string; passed: boolean; detail?: string }[] = []

function pass(check: string, detail?: string) {
  results.push({ check, passed: true, detail })
  console.log(`  PASS  ${check}${detail ? ` — ${detail}` : ''}`)
}

function fail(check: string, detail?: string) {
  results.push({ check, passed: false, detail })
  console.log(`  FAIL  ${check}${detail ? ` — ${detail}` : ''}`)
}

async function apiGet(path: string, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_URL}${path}`, { headers })
  return { status: res.status, body: await res.json().catch(() => ({})) }
}

async function apiPost(path: string, body: unknown, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  return { status: res.status, body: await res.json().catch(() => ({})) }
}

async function main() {
  console.log('\n=== Phase 1 Verification ===\n')

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Track created users for cleanup
  let partnerId: string | undefined
  let employeeId: string | undefined
  let partnerToken: string | undefined
  let employeeToken: string | undefined
  let testProjectId: string | undefined

  // -------------------------------------------------------
  // Check 2: New user auto-creates profile row
  // -------------------------------------------------------
  console.log('\n[Check 2] New Supabase user auto-creates profile row')
  try {
    const { data, error } = await admin.auth.admin.createUser({
      email: TEST_PARTNER_EMAIL,
      password: TEST_PARTNER_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: 'Test Partner', role: 'partner' },
    })
    if (error || !data.user) throw new Error(error?.message ?? 'No user')
    partnerId = data.user.id

    // Wait a moment for the trigger to fire
    await new Promise((r) => setTimeout(r, 500))

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('*')
      .eq('id', partnerId)
      .single()

    if (profileError || !profile) throw new Error('Profile not found after user creation')
    if (profile.role !== 'partner') throw new Error(`Expected role=partner, got ${profile.role}`)
    pass('Check 2', `Profile created with role=${profile.role}`)
  } catch (e) {
    fail('Check 2', String(e))
  }

  // Create employee user
  try {
    const { data, error } = await admin.auth.admin.createUser({
      email: TEST_EMPLOYEE_EMAIL,
      password: TEST_EMPLOYEE_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: 'Test Employee', role: 'employee' },
    })
    if (error || !data.user) throw new Error(error?.message ?? 'No user')
    employeeId = data.user.id
    await new Promise((r) => setTimeout(r, 300))
  } catch (e) {
    console.log(`  NOTE  Could not create employee user: ${e}`)
  }

  // -------------------------------------------------------
  // Check 3: POST /api/auth/login returns valid session
  // -------------------------------------------------------
  console.log('\n[Check 3] POST /api/auth/login returns valid session')
  try {
    const { status, body } = await apiPost('/api/auth/login', {
      email: TEST_PARTNER_EMAIL,
      password: TEST_PARTNER_PASSWORD,
    })
    if (status !== 200) throw new Error(`Expected 200, got ${status}: ${JSON.stringify(body)}`)
    if (!body.data?.access_token) throw new Error('No access_token in response')
    partnerToken = body.data.access_token as string
    pass('Check 3', `access_token received, user role=${body.data.user?.role}`)
  } catch (e) {
    fail('Check 3', String(e))
  }

  // Login as employee too
  if (employeeId) {
    try {
      const { body } = await apiPost('/api/auth/login', {
        email: TEST_EMPLOYEE_EMAIL,
        password: TEST_EMPLOYEE_PASSWORD,
      })
      employeeToken = body.data?.access_token as string | undefined
    } catch (_) { /* non-critical for this check */ }
  }

  // -------------------------------------------------------
  // Check 4: GET /api/auth/me with valid token returns profile
  // -------------------------------------------------------
  console.log('\n[Check 4] GET /api/auth/me with valid token returns profile')
  try {
    if (!partnerToken) throw new Error('No token from Check 3')
    const { status, body } = await apiGet('/api/auth/me', partnerToken)
    if (status !== 200) throw new Error(`Expected 200, got ${status}`)
    if (!body.data?.role) throw new Error('No role in response')
    pass('Check 4', `Profile returned with role=${body.data.role}`)
  } catch (e) {
    fail('Check 4', String(e))
  }

  // -------------------------------------------------------
  // Check 5: GET /api/auth/me with no token returns 401
  // -------------------------------------------------------
  console.log('\n[Check 5] GET /api/auth/me with no token returns 401')
  try {
    const { status } = await apiGet('/api/auth/me')
    if (status !== 401) throw new Error(`Expected 401, got ${status}`)
    pass('Check 5')
  } catch (e) {
    fail('Check 5', String(e))
  }

  // -------------------------------------------------------
  // Check 6: is_active=false user gets 403
  // -------------------------------------------------------
  console.log('\n[Check 6] Deactivated user gets 403')
  try {
    if (!partnerId) throw new Error('Partner not created')
    // Deactivate the partner
    await admin.from('profiles').update({ is_active: false }).eq('id', partnerId)

    const { status } = await apiGet('/api/auth/me', partnerToken)
    if (status !== 403) throw new Error(`Expected 403, got ${status}`)
    pass('Check 6')

    // Re-activate for subsequent checks
    await admin.from('profiles').update({ is_active: true }).eq('id', partnerId)
    // Re-login to get a fresh token
    const { body } = await apiPost('/api/auth/login', {
      email: TEST_PARTNER_EMAIL,
      password: TEST_PARTNER_PASSWORD,
    })
    partnerToken = body.data?.access_token as string | undefined
  } catch (e) {
    fail('Check 6', String(e))
    // Make sure user is re-activated even on failure
    if (partnerId) {
      await admin.from('profiles').update({ is_active: true }).eq('id', partnerId)
    }
  }

  // -------------------------------------------------------
  // Check 7: Employee can only see assigned projects (RLS)
  // -------------------------------------------------------
  console.log('\n[Check 7] Employee only sees assigned projects via API')
  try {
    if (!partnerToken || !employeeToken || !employeeId) throw new Error('Prerequisites not met')

    // Partner creates a project and does NOT assign the employee
    const { body: projBody } = await apiPost('/api/projects', {
      name: `Verify Project ${Date.now()}`,
      status: 'lead',
    }, partnerToken)
    testProjectId = projBody.data?.id as string | undefined
    if (!testProjectId) throw new Error('Could not create test project')

    // Employee should see 0 projects (not assigned)
    const { status, body } = await apiGet('/api/projects', employeeToken)
    if (status !== 200) throw new Error(`Expected 200, got ${status}`)
    const count = body.data?.length ?? -1
    if (count !== 0) throw new Error(`Expected 0 projects for unassigned employee, got ${count}`)
    pass('Check 7', 'Employee sees 0 projects when unassigned')
  } catch (e) {
    fail('Check 7', String(e))
  }

  // -------------------------------------------------------
  // Check 8: Partner sees all projects
  // -------------------------------------------------------
  console.log('\n[Check 8] Partner sees all projects via API')
  try {
    if (!partnerToken) throw new Error('No partner token')
    const { status, body } = await apiGet('/api/projects', partnerToken)
    if (status !== 200) throw new Error(`Expected 200, got ${status}`)
    const count = body.data?.length ?? 0
    if (count < 1) throw new Error(`Expected at least 1 project, got ${count}`)
    pass('Check 8', `Partner sees ${count} project(s)`)
  } catch (e) {
    fail('Check 8', String(e))
  }

  // -------------------------------------------------------
  // Check 9: POST /api/leads works without auth
  // -------------------------------------------------------
  console.log('\n[Check 9] POST /api/leads works without authentication')
  try {
    const { status, body } = await apiPost('/api/leads', {
      full_name: 'Verification Lead',
      phone: '9876543210',
      message: 'Phase 1 verification test lead',
    })
    if (status !== 201) throw new Error(`Expected 201, got ${status}: ${JSON.stringify(body)}`)
    pass('Check 9', `Lead created with id=${body.data?.id}`)
  } catch (e) {
    fail('Check 9', String(e))
  }

  // -------------------------------------------------------
  // Check 10: Rate limiting on POST /api/leads (6th request blocked)
  // -------------------------------------------------------
  console.log('\n[Check 10] POST /api/leads rate limited at 6th request in 15 minutes')
  try {
    // We already used 1 request in Check 9 (but IPs differ in test env, so send 5 more)
    // Send 5 more requests to hit the limit of 5 per 15 min
    let lastStatus = 0
    for (let i = 0; i < 6; i++) {
      const { status } = await apiPost('/api/leads', {
        full_name: `Rate Limit Test ${i}`,
        phone: `98765432${i}0`,
      })
      lastStatus = status
      if (status === 429) {
        pass('Check 10', `Rate limited on request ${i + 1} (status 429)`)
        break
      }
    }
    if (lastStatus !== 429) {
      fail('Check 10', `Never hit 429 after 6 requests (last status: ${lastStatus}). Note: rate limit is per-IP and may not trigger in test environments where IP is shared.`)
    }
  } catch (e) {
    fail('Check 10', String(e))
  }

  // -------------------------------------------------------
  // Cleanup test data
  // -------------------------------------------------------
  console.log('\n[Cleanup] Removing test users and data...')
  if (testProjectId) await admin.from('projects').delete().eq('id', testProjectId)
  if (partnerId) await admin.auth.admin.deleteUser(partnerId)
  if (employeeId) await admin.auth.admin.deleteUser(employeeId)
  console.log('  Cleanup done.')

  // -------------------------------------------------------
  // Summary
  // -------------------------------------------------------
  const passed = results.filter((r) => r.passed).length
  const total = results.length
  console.log(`\n=== Results: ${passed}/${total} checks passed ===\n`)
  if (passed < total) {
    console.log('Failed checks:')
    results.filter((r) => !r.passed).forEach((r) => console.log(`  - ${r.check}: ${r.detail}`))
    process.exit(1)
  } else {
    console.log('All Phase 1 checks passed!')
  }
}

main().catch((e) => {
  console.error('Verification script crashed:', e)
  process.exit(1)
})
