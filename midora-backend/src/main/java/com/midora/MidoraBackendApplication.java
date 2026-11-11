package com.midora;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class MidoraBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(MidoraBackendApplication.class, args);
	}

}
