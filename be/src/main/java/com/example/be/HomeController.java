package com.example.be;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
	
	private static final Logger logger = LoggerFactory.getLogger(HomeController.class);
	
	@GetMapping("/home")
	public String home() {
		logger.info("Hello bn");
		System.out.println("Hey there bn");
		return "Hello bn";
	}

}
