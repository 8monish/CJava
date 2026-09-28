package com.monish.springbootapp.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.monish.springbootapp.User;
import com.monish.springbootapp.repository.UserRepository;




@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/getbyid/{userId}")
    public User getById(@PathVariable String userId) {
        return new User(userId, "Monish", "jade", "monish.jade@example.com");
    }

    @GetMapping("/all")
    public List<User> getAll() {
        return this.userRepository.findAll();
    }

    @PostMapping("/adduser")
    public User postcheck(@RequestBody User entity) {
        return this.userRepository.save(entity);
    }

    @GetMapping("/us/{userString}")
    public User getMethodName(@PathVariable String userString) {
        if (userString == null || userString.isEmpty()) {
            return new User(userString, null, null , null);
        }   
        return this.userRepository.findById(userString).orElse(new User(userString, null, null , null));
    }
    

    @PutMapping("/update/{userId}")
    public User update(@PathVariable String userId, @RequestBody User entity) {
        return this.userRepository.save(entity);
    }

    @DeleteMapping("/delete/{userId}")
    public void delete(@PathVariable String userId) {
        this.userRepository.deleteById(userId);
    }
    
}
