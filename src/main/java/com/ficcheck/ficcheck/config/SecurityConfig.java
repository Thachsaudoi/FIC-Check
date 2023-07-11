package com.ficcheck.ficcheck.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;


@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        //For the security dependency stop asking for signing in whenever we run the app
        
        http.authorizeHttpRequests().anyRequest().permitAll();
        //csrf disabled for ajax to send request
        http.csrf(csrf -> csrf.disable());
        return http.build();
    }

    
    @Bean
    public static PasswordEncoder passwordEncoder(){
        //Overide the password encoder with the encoder method
        return new BCryptPasswordEncoder();
    }
}