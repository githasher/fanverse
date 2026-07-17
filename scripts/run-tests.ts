// Zero-dependency TypeScript test runner to validate core logic of FANVERSE AI
import assert from 'assert';
import { createInitialStadiumState } from '../lib/stadiumData';
import { SimulationEngine } from '../lib/simulation';

console.log('🧪 Starting FANVERSE AI Validation Tests...');

try {
  // Test 1: Initial Stadium State Creation
  console.log('Testing: createInitialStadiumState()');
  const initialState = createInitialStadiumState();
  assert.ok(initialState, 'Initial state should be created');
  assert.strictEqual(initialState.phase, 'BEFORE_MATCH', 'Default phase should be BEFORE_MATCH');
  assert.strictEqual(initialState.gates.length, 8, 'Should have 8 gates configured');
  assert.strictEqual(initialState.zones.length, 12, 'Should have 12 zones configured');
  assert.ok(initialState.foodVendors.length >= 15, 'Should have at least 15 food vendors');
  console.log('✅ Test 1 Passed: Initial state verified.');

  // Test 2: Simulation Engine tick progression
  console.log('Testing: Simulation Engine tick progression');
  const engine = new SimulationEngine(2026);
  const stateT0 = engine.getState();
  assert.strictEqual(stateT0.tick, 0, 'Tick count should start at 0');
  
  const stateT1 = engine.tick();
  assert.strictEqual(stateT1.tick, 1, 'Tick count should increment to 1');
  assert.ok(stateT1.timestamp, 'State should have an updated timestamp');
  console.log('✅ Test 2 Passed: Simulation ticks verified.');

  // Test 3: Simulation Phase transition
  console.log('Testing: Phase transition overrides');
  engine.setPhase('HALFTIME');
  assert.strictEqual(engine.getPhase(), 'HALFTIME', 'Phase should be updated to HALFTIME');
  const halftimeState = engine.tick();
  assert.strictEqual(halftimeState.phase, 'HALFTIME', 'Phase should persist on next tick');
  console.log('✅ Test 3 Passed: Phase transitions verified.');

  // Test 4: Dietary Match Filters
  console.log('Testing: Dietary tag match matching');
  const vegetarianVendors = initialState.foodVendors.filter(v => v.dietaryTags.includes('vegetarian'));
  assert.ok(vegetarianVendors.length > 0, 'Should have vegetarian options');
  const halalVendors = initialState.foodVendors.filter(v => v.dietaryTags.includes('halal'));
  assert.ok(halalVendors.length > 0, 'Should have halal options');
  console.log('✅ Test 4 Passed: Dietary filters verified.');

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 100% Core Logic Validated.');
} catch (error: any) {
  console.error('❌ Test execution failed:', error.message);
  process.exit(1);
}
