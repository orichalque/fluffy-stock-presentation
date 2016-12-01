package com.alma.group8.dispatcher;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

/**
 * Created by Thibault on 16/11/16
 * Spring Configuration class to define the localisation of the html resources
 */
@Configuration
@EnableWebMvc
@ComponentScan
public class WebConfiguration extends WebMvcConfigurerAdapter {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**").addResourceLocations("/");
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        //Set the welcome page ton index.html
        registry.addViewController("/").setViewName("forward:/index.html");
        registry.addViewController("/api").setViewName("forward:/api.html");
        registry.addViewController("/api").setViewName("forward:/api.html");
    }
}
