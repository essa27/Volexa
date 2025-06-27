package com.example.sportmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class SportManagementApplication {

	public static void main(String[] args) {

		TimeZone.setDefault(TimeZone.getTimeZone("Europe/Bucharest"));

		SpringApplication.run(SportManagementApplication.class, args);
	}
}
