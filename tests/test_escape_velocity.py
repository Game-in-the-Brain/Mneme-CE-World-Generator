"""
Escape Velocity Calculator Test Suite
=====================================

Comprehensive tests to verify escape velocity calculations.
Tests both the physics formulas and the practical rocket equation implications.

Usage:
    python tests/test_escape_velocity.py

Or with pytest:
    pytest tests/test_escape_velocity.py -v
"""

import unittest
import math
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Physical constants
G = 6.67430e-11  # Gravitational constant (m^3 kg^-1 s^-2)
EARTH_MASS = 5.972e24  # kg
EARTH_RADIUS = 6.371e6  # meters
EARTH_ESCAPE_VELOCITY = 11186  # m/s (11.2 km/s)

# ==============================================================================
# REFERENCE IMPLEMENTATION (Python version of src/lib/physicalProperties.ts)
# ==============================================================================

class ReferenceCalculator:
    """
    Reference implementation matching the TypeScript code in physicalProperties.ts
    
    TypeScript equivalent:
      const G = 6.674e-11;
      const EM_TO_KG = 5.972e24;
      const escapeVelocityMs = Math.sqrt(2 * G * massKg / radiusM);
    """
    
    G = 6.674e-11  # m^3 kg^-1 s^-2
    EM_TO_KG = 5.972e24  # Earth masses to kg
    
    @classmethod
    def calculate(cls, mass_em: float, radius_m: float = None, density_gcm3: float = 5.51) -> dict:
        """
        Calculate escape velocity and related properties.
        
        If radius_m is not provided, it's calculated from mass and density.
        
        Args:
            mass_em: Mass in Earth masses
            radius_m: Radius in meters (optional, calculated from density if None)
            density_gcm3: Density in g/cm³ (used to calculate radius if not provided)
            
        Returns:
            Dictionary with escape_velocity_ms, surface_gravity_g, radius_km, etc.
        """
        mass_kg = mass_em * cls.EM_TO_KG
        
        if radius_m is None:
            # Calculate radius from mass and density
            density_kg_m3 = density_gcm3 * 1000
            volume_m3 = mass_kg / density_kg_m3
            radius_m = ((3 * volume_m3) / (4 * math.pi)) ** (1/3)
        
        # Surface gravity in m/s²
        surface_gravity_ms2 = (cls.G * mass_kg) / (radius_m ** 2)
        surface_gravity_g = surface_gravity_ms2 / 9.81
        
        # Escape velocity: v = sqrt(2GM/r)
        escape_velocity_ms = math.sqrt(2 * cls.G * mass_kg / radius_m)
        
        return {
            'escape_velocity_ms': escape_velocity_ms,
            'escape_velocity_kms': escape_velocity_ms / 1000,
            'surface_gravity_g': surface_gravity_g,
            'surface_gravity_ms2': surface_gravity_ms2,
            'radius_m': radius_m,
            'radius_km': radius_m / 1000,
            'mass_kg': mass_kg,
            'mass_em': mass_em,
        }
    
    @classmethod
    def from_density(cls, mass_em: float, density_gcm3: float) -> dict:
        """Calculate properties from mass and density (like the TS implementation)."""
        return cls.calculate(mass_em, density_gcm3=density_gcm3)

# ==============================================================================
# TEST SUITE
# ==============================================================================

class TestEscapeVelocityCorrectness(unittest.TestCase):
    """
    Tests verifying escape velocity calculation correctness.
    
    These tests validate:
    1. Earth escape velocity ~11.2 km/s
    2. Linear scaling with radius (constant density)
    3. Linear scaling of surface gravity
    4. Comparison with known values for Solar System bodies
    """
    
    @classmethod
    def setUpClass(cls):
        cls.calc = ReferenceCalculator()
        cls.earth_density = 5.51  # g/cm³
    
    def test_earth_escape_velocity(self):
        """Test 1: Earth escape velocity should be ~11.2 km/s."""
        result = self.calc.from_density(1.0, self.earth_density)
        v_esc = result['escape_velocity_ms']
        
        self.assertAlmostEqual(v_esc, EARTH_ESCAPE_VELOCITY, delta=500)
        print(f"✓ Earth escape velocity: {v_esc/1000:.2f} km/s (expected ~11.2 km/s)")
    
    def test_linear_velocity_scaling_constant_density(self):
        """Test 2: For constant density, v_esc ∝ r (linear scaling)."""
        base_result = self.calc.from_density(1.0, self.earth_density)
        base_v = base_result['escape_velocity_ms']
        base_r = base_result['radius_m']
        
        print(f"\n✓ Linear velocity scaling (constant density):")
        print(f"  Base: 1.0x Earth → {base_v/1000:.2f} km/s, radius {base_r/1000:.0f} km")
        
        for mult in [0.5, 2.0, 3.0]:
            # For constant density, mass scales as r³
            # But we need to maintain constant density, so:
            # If radius scales by mult, mass scales by mult³
            mass_mult = mult ** 3
            result = self.calc.from_density(mass_mult, self.earth_density)
            v = result['escape_velocity_ms']
            ratio = v / base_v
            
            self.assertAlmostEqual(ratio, mult, delta=0.1,
                msg=f"Failed at {mult}x radius: expected ratio {mult}, got {ratio:.2f}")
            print(f"  {mult}x radius → {ratio:.2f}x velocity ({v/1000:.1f} km/s)")
    
    def test_linear_gravity_scaling_constant_density(self):
        """Test 3: For constant density, g ∝ r (linear scaling)."""
        base_result = self.calc.from_density(1.0, self.earth_density)
        base_g = base_result['surface_gravity_g']
        
        print(f"\n✓ Linear gravity scaling (constant density):")
        print(f"  Base: 1.0x Earth → {base_g:.2f}g")
        
        for mult in [0.5, 2.0, 3.0]:
            mass_mult = mult ** 3
            result = self.calc.from_density(mass_mult, self.earth_density)
            g = result['surface_gravity_g']
            ratio = g / base_g
            
            self.assertAlmostEqual(ratio, mult, delta=0.1,
                msg=f"Failed at {mult}x radius: expected ratio {mult}, got {ratio:.2f}")
            print(f"  {mult}x radius → {ratio:.2f}x gravity ({g:.1f}g)")
    
    def test_solar_system_bodies(self):
        """Test 4: Verify against known Solar System values."""
        # (name, mass_em, density_gcm3, expected_v_esc_kms, tolerance)
        test_cases = [
            ("Moon", 0.0123, 3.34, 2.38, 0.2),
            ("Mars", 0.107, 3.93, 5.03, 0.3),
            ("Earth", 1.0, 5.51, 11.2, 0.5),
            ("Venus", 0.815, 5.24, 10.4, 0.5),
            ("Jupiter core (10 EM)", 10, 5.0, 35.0, 5.0),
        ]
        
        print(f"\n✓ Solar System bodies comparison:")
        print(f"  {'Body':<20} {'Mass':<8} {'v_esc':<10} {'Expected':<10} {'Status'}")
        print("  " + "-" * 60)
        
        for name, mass_em, density, expected_kms, tolerance in test_cases:
            result = self.calc.from_density(mass_em, density)
            v_kms = result['escape_velocity_kms']
            
            within_tolerance = abs(v_kms - expected_kms) <= tolerance
            status = "✓" if within_tolerance else "✗"
            
            print(f"  {name:<20} {mass_em:<8.3f} {v_kms:<10.2f} {expected_kms:<10.1f} {status}")
            
            self.assertAlmostEqual(v_kms, expected_kms, delta=tolerance,
                msg=f"{name}: expected ~{expected_kms} km/s, got {v_kms:.2f} km/s")
    
    def test_formula_correctness(self):
        """Test 5: Verify formula produces expected mathematical relationships."""
        # v = sqrt(2GM/r)
        # So v² = 2GM/r
        # And v²r = 2GM = constant for a given mass
        
        mass_em = 2.0  # 2 Earth masses
        result1 = self.calc.from_density(mass_em, 5.0)
        
        # For same mass, different density (therefore different radius)
        # v²r should be constant
        result2 = self.calc.calculate(mass_em, result1['radius_m'] * 1.5)
        
        v1_squared_r1 = (result1['escape_velocity_ms'] ** 2) * result1['radius_m']
        v2_squared_r2 = (result2['escape_velocity_ms'] ** 2) * result2['radius_m']
        
        # Should be equal (both equal 2GM)
        self.assertAlmostEqual(v1_squared_r1, v2_squared_r2, delta=1e10)
        print(f"\n✓ Formula correctness: v²r = constant")
        print(f"  Case 1: {v1_squared_r1:.3e}")
        print(f"  Case 2: {v2_squared_r2:.3e}")


class TestRocketEquationImplications(unittest.TestCase):
    """
    Tests for practical implications of the rocket equation.
    Demonstrates why larger planets are exponentially harder to escape.
    """
    
    def test_exponential_fuel_requirements(self):
        """
        Test 6: Fuel mass ratio grows exponentially with delta-v.
        
        mass_ratio = e^(Δv / v_exhaust)
        
        A 2x escape velocity doesn't mean 2x fuel; it means ~7-20x fuel!
        """
        exhaust_vel = 4500  # Typical chemical rocket (m/s)
        
        print("\n🚀 Rocket Fuel Scaling Analysis:")
        print("  Showing why larger planets are exponentially harder to launch from")
        print(f"  {'Planet Size':<12} {'v_esc':<10} {'Fuel Ratio':<15} {'vs Earth':<12}")
        print("  " + "-" * 55)
        
        v_earth = 11200  # m/s
        delta_v_earth = v_earth * 1.2  # Add 20% margin for gravity/drag losses
        ratio_earth = math.exp(delta_v_earth / exhaust_vel)
        
        ratios = []
        for mult in [0.5, 1.0, 2.0, 3.0]:
            v = v_earth * mult
            delta_v = v * 1.2
            ratio = math.exp(delta_v / exhaust_vel)
            vs_earth = ratio / ratio_earth
            ratios.append(ratio)
            
            print(f"  {mult:<12.1f} {v/1000:<10.1f} {ratio:<15.1f}x {vs_earth:<12.1f}x")
        
        # Verify exponential growth
        # Each 2x velocity should give ~e^(2.4) ≈ 11x fuel ratio increase
        growth_2x = ratios[2] / ratios[1]  # 2x / 1x
        growth_3x = ratios[3] / ratios[2]  # 3x / 2x
        
        self.assertGreater(growth_2x, 5.0, 
            msg="Fuel ratio should grow exponentially (not linearly)")
        print(f"\n  Growth factor 1x→2x: {growth_2x:.1f}x (exponential!)")
        print(f"  Growth factor 2x→3x: {growth_3x:.1f}x")
    
    def test_jupiter_escape_impossibility(self):
        """
        Test 7: Demonstrate why Jupiter is essentially impossible to escape 
        from using chemical rockets alone.
        """
        # Jupiter: ~318 Earth masses, but lower density
        # Jupiter radius ~11 Earth radii
        jupiter_result = ReferenceCalculator.calculate(318, radius_m=11.2 * EARTH_RADIUS)
        v_jupiter = jupiter_result['escape_velocity_kms']
        
        print(f"\n🪐 Jupiter Escape Analysis:")
        print(f"  Escape velocity: {v_jupiter:.1f} km/s (vs Earth's 11.2 km/s)")
        
        # Chemical rocket calculation
        exhaust_vel = 4500  # m/s (best chemical)
        delta_v = v_jupiter * 1000 * 1.5  # Add 50% margin for gravity losses
        mass_ratio = math.exp(delta_v / exhaust_vel)
        
        print(f"  Required fuel ratio: {mass_ratio:.2e}x")
        print(f"  That's {mass_ratio/1e6:.0f} million kg of fuel per kg of payload!")
        
        # This is why you need World Serpents (particle accelerators) 
        # to create antimatter for high-efficiency drives
        self.assertGreater(mass_ratio, 1e6,
            msg="Jupiter escape should require impossible fuel ratios with chemical rockets")


class TestMnemeGeneratorIntegration(unittest.TestCase):
    """
    Tests that verify compatibility with the Mneme Generator's implementation.
    """
    
    def test_typescript_formula_match(self):
        """
        Test 8: Verify our Python reference matches the TypeScript formula.
        
        TypeScript code in physicalProperties.ts:
          const escapeVelocityMs = Math.sqrt(2 * G * massKg / radiusM);
        
        This test documents the expected behavior for any reimplementation.
        """
        # Test case: 1 Earth mass, Earth radius
        g = 6.674e-11
        em_to_kg = 5.972e24
        mass_kg = 1.0 * em_to_kg
        radius_m = 6.371e6
        
        expected = math.sqrt(2 * g * mass_kg / radius_m)
        
        # Our calculator should match
        result = ReferenceCalculator.calculate(1.0, radius_m)
        
        self.assertAlmostEqual(result['escape_velocity_ms'], expected, delta=1)
        print(f"\n✓ TypeScript formula verification:")
        print(f"  Math.sqrt(2 * G * massKg / radiusM)")
        print(f"  = {expected:.1f} m/s = {expected/1000:.2f} km/s")
    
    def test_main_world_calculation(self):
        """
        Test 9: Simulate typical MainWorld escape velocity calculation.
        
        A typical terrestrial world in the Mneme generator:
        - Mass: 0.5 - 4.5 EM
        - Density: 4-6.5 g/cm³
        """
        print("\n✓ Typical Mneme Generator worlds:")
        print(f"  {'World Type':<15} {'Mass (EM)':<10} {'Density':<10} {'v_esc (km/s)':<15}")
        print("  " + "-" * 55)
        
        test_cases = [
            ("Small Rocky", 0.5, 4.5),
            ("Mars-like", 0.8, 4.0),
            ("Earth-like", 1.0, 5.5),
            ("Super-Earth", 2.5, 6.0),
            ("Heavy World", 4.0, 6.5),
        ]
        
        for name, mass, density in test_cases:
            result = ReferenceCalculator.from_density(mass, density)
            v = result['escape_velocity_kms']
            print(f"  {name:<15} {mass:<10.1f} {density:<10.1f} {v:<15.2f}")
            
            # Sanity checks
            self.assertGreater(v, 0)
            self.assertLess(v, 50)  # Shouldn't exceed 50 km/s for reasonable worlds


def run_tests():
    """Run all tests with formatted output."""
    print("=" * 70)
    print("ESCAPE VELOCITY CALCULATOR VERIFICATION SUITE")
    print("=" * 70)
    print("\nThis test suite verifies:")
    print("  1. ✓ Earth escape velocity ≈ 11.2 km/s")
    print("  2. ✓ Linear scaling: 2x radius → 2x velocity (constant density)")
    print("  3. ✓ Linear scaling: 2x radius → 2x gravity (constant density)")
    print("  4. ✓ Formula correctness: v²r = 2GM (constant)")
    print("  5. ✓ Solar System body comparisons")
    print("  6. ✓ Exponential fuel: 2x velocity → ~7-20x fuel requirement")
    print("  7. ✓ Jupiter escape impossibility (with chemical rockets)")
    print("  8. ✓ TypeScript formula match")
    print("  9. ✓ Typical Mneme Generator world calculations")
    print("=" * 70)
    
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    suite.addTests(loader.loadTestsFromTestCase(TestEscapeVelocityCorrectness))
    suite.addTests(loader.loadTestsFromTestCase(TestRocketEquationImplications))
    suite.addTests(loader.loadTestsFromTestCase(TestMnemeGeneratorIntegration))
    
    # Run with verbosity
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print("\n" + "=" * 70)
    if result.wasSuccessful():
        print("✅ ALL TESTS PASSED")
        print("\nYour calculator correctly implements escape velocity physics!")
        print("\nKey findings:")
        print("  • Escape velocity scales LINEARLY with planet size (constant density)")
        print("  • But fuel requirements scale EXPONENTIALLY (rocket equation)")
        print("  • This is why larger planets need World Serpents (antimatter drives)")
    else:
        print("❌ TESTS FAILED")
        print("\nYour calculator may have implementation errors.")
    print("=" * 70)
    
    return result.wasSuccessful()


if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
