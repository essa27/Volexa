package com.example.sportmanagement.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(@Lazy JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/users/all").hasAnyAuthority("ROLE_ADMIN", "ROLE_COACH")
                        .requestMatchers(HttpMethod.GET, "/api/users/images/**").permitAll()


                        .requestMatchers(HttpMethod.GET, "/api/account/images/**").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/images/**").permitAll()


                        .requestMatchers(HttpMethod.GET, "/api/athletes/files/**").permitAll()

                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/error").permitAll()


                        .requestMatchers(HttpMethod.GET, "/api/athletes").hasAnyAuthority("ROLE_COACH", "ROLE_ADMIN", "ROLE_ATHLETE")
                        .requestMatchers(HttpMethod.GET, "/api/athletes/**").hasAnyAuthority("ROLE_COACH", "ROLE_ADMIN", "ROLE_ATHLETE")
                        .requestMatchers(HttpMethod.POST, "/api/athletes").hasAnyAuthority("ROLE_COACH", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/athletes/**").hasAnyAuthority("ROLE_COACH", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/athletes/**").hasAnyAuthority("ROLE_COACH", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/strategy/upload").hasAnyAuthority("ROLE_COACH", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/strategy/image/**").permitAll()


                        .requestMatchers(HttpMethod.GET, "/api/reservations/**").hasAnyAuthority("ROLE_COACH", "ROLE_ADMIN", "ROLE_ATHLETE")
                        .requestMatchers("/api/reservations/**").hasAnyAuthority("ROLE_COACH", "ROLE_ADMIN")


                        .requestMatchers("/api/coach/**").hasAuthority("ROLE_COACH")
                        .requestMatchers("/api/athlete/**").hasAuthority("ROLE_ATHLETE")
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")

                        // 🔐 Any other request must be authenticated
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            System.out.println("❌ UNAUTHENTICATED ACCESS: " + request.getRequestURI());
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            System.out.println("❌ ACCESS DENIED: " + request.getRequestURI());
                            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access denied");
                        })
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
