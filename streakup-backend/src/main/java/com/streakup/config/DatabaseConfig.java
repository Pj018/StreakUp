package com.streakup.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/streakup_db}")
    private String defaultUrl;

    @Value("${spring.datasource.username:postgres}")
    private String defaultUsername;

    @Value("${spring.datasource.password:root}")
    private String defaultPassword;

    @Value("${DATABASE_URL:}")
    private String envDatabaseUrl;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        String rawUrl = (envDatabaseUrl != null && !envDatabaseUrl.isBlank()) 
                ? envDatabaseUrl 
                : defaultUrl;

        if (rawUrl != null && (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://"))) {
            try {
                URI dbUri = new URI(rawUrl.replace("postgresql://", "http://").replace("postgres://", "http://"));
                String username = dbUri.getUserInfo() != null ? dbUri.getUserInfo().split(":")[0] : defaultUsername;
                String password = (dbUri.getUserInfo() != null && dbUri.getUserInfo().split(":").length > 1) 
                        ? dbUri.getUserInfo().split(":")[1] 
                        : defaultPassword;
                int port = dbUri.getPort() != -1 ? dbUri.getPort() : 5432;
                String dbPath = dbUri.getPath();
                String jdbcUrl = "jdbc:postgresql://" + dbUri.getHost() + ":" + port + dbPath;

                config.setJdbcUrl(jdbcUrl);
                config.setUsername(username);
                config.setPassword(password);
                log.info("🌐 Connected to Cloud Database at {}:{}{}", dbUri.getHost(), port, dbPath);
            } catch (Exception e) {
                log.warn("⚠️ Failed to parse DATABASE_URL as URI, falling back to raw: {}", e.getMessage());
                config.setJdbcUrl(rawUrl.startsWith("jdbc:") ? rawUrl : "jdbc:" + rawUrl);
                config.setUsername(defaultUsername);
                config.setPassword(defaultPassword);
            }
        } else {
            config.setJdbcUrl(rawUrl);
            config.setUsername(defaultUsername);
            config.setPassword(defaultPassword);
        }

        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(20000);
        return new HikariDataSource(config);
    }
}
