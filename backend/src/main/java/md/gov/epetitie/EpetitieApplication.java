package md.gov.epetitie;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

@SpringBootApplication
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class EpetitieApplication {

    public static void main(String[] args) {
        System.setProperty("spring.datasource.username", "postgres");
        System.setProperty("spring.datasource.password", "postgres");
        System.setProperty("spring.liquibase.user", "postgres");
        System.setProperty("spring.liquibase.password", "postgres");
        SpringApplication.run(EpetitieApplication.class, args);
    }
}
