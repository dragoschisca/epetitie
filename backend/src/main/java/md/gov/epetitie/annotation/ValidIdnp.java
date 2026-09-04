package md.gov.epetitie.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import md.gov.epetitie.validator.IdnpValidator;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = IdnpValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidIdnp {
    String message() default "IDNP-ul introdus nu este valid conform algoritmului oficial al Republicii Moldova (trebuie să aibă 13 cifre și o cifră de control validă).";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
