package com.snowdropsolutions.dm;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;

/**
 *
 * @author lroman
 */
@Configuration
@ComponentScan(basePackages = "com.snowdropsolutions.dm.services")
@PropertySource(value = "classpath:app.properties")
public class TestAppConfig {

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertiesResolver() {
        return new PropertySourcesPlaceholderConfigurer();
    }
}
