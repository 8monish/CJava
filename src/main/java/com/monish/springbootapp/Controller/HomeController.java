package com.monish.springbootapp.Controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;




@RequestMapping("/")
public class HomeController {
    @GetMapping("")
    public String get() {
        return "index.html";
    }

    
}