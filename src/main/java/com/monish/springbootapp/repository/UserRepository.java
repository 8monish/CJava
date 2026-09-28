package com.monish.springbootapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.monish.springbootapp.User;

public interface UserRepository extends JpaRepository<User, String> {
    
}
