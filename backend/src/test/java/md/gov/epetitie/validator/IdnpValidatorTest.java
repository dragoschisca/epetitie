package md.gov.epetitie.validator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class IdnpValidatorTest {

    private IdnpValidator validator;

    @BeforeEach
    void setUp() {
        validator = new IdnpValidator();
    }

    @Test
    @DisplayName("Should validate valid Moldovan IDNP with correct checksum")
    void testValidIdnp() {
        // IDNP 200012345678:
        // Sum = 2*7 + 0*3 + 0*1 + 0*7 + 1*3 + 2*1 + 3*7 + 4*3 + 5*1 + 6*7 + 7*3 + 8*1
        // Sum = 14 + 0 + 0 + 0 + 3 + 2 + 21 + 12 + 5 + 42 + 21 + 8 = 128
        // 128 % 10 = 8 -> 2000123456788 is valid
        assertTrue(validator.isValid("2000123456788", null));
    }

    @Test
    @DisplayName("Should invalidate IDNP with invalid checksum")
    void testInvalidChecksum() {
        assertFalse(validator.isValid("2000123456780", null));
    }

    @Test
    @DisplayName("Should invalidate IDNP with wrong length or characters")
    void testInvalidFormat() {
        assertFalse(validator.isValid("12345", null));
        assertFalse(validator.isValid("200012345678A", null));
        assertFalse(validator.isValid("200012345678901", null));
    }

    @Test
    @DisplayName("Should accept null or empty string because @NotNull handles required check")
    void testNullOrEmpty() {
        assertTrue(validator.isValid(null, null));
        assertTrue(validator.isValid("", null));
        assertTrue(validator.isValid("   ", null));
    }
}
