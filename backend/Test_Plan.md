# Test Plan — Student Mental Support API

## 1. Introduction

### 1.1 Purpose
This test plan defines the approach for validating the backend API of the Student Mental Support System. It documents the testing scope, objectives, methods, test cases, expected outcomes, and acceptance criteria for automated API testing.

### 1.2 Scope
This test plan covers the following backend API modules:

- General endpoints
- Support threads
- Activities
- Bookings
- Counsellor rotas

The focus is on functional API testing, input validation, error handling, and selected boundary conditions.

### 1.3 Objectives
The objectives of testing are to:

- verify that each API endpoint returns the correct response for valid input
- confirm that invalid input is rejected appropriately
- test boundary and edge cases
- ensure stable behaviour across key user flows
- support reliability, correctness, and maintainability of the backend system

---

## 2. Test Strategy

### 2.1 Testing Type
The main testing type is black-box API testing. The tests interact with the system through HTTP requests and validate outputs without relying on internal implementation details.

### 2.2 Test Levels
The implemented tests mainly operate at:

- integration level
- system/API level

### 2.3 Test Design Techniques

#### Equivalence Partitioning
- valid input
- missing input
- invalid type
- non-existent entity

#### Boundary Value Analysis
- zero values
- empty strings
- repeated operations

#### Behaviour-Driven Testing
Given / When / Then structure

---

## 3. Test Environment

- Python
- pytest
- Flask
- SQLAlchemy
- SQLite (in-memory)

---

## 4. Test Cases

### General

| ID | Scenario | Expected |
|----|--------|---------|
| TC1 | Health check | 200 OK |
| TC2 | Get users | list returned |
| TC3 | Invalid role | empty/ignored |

### Threads

| ID | Scenario | Expected |
|----|--------|---------|
| TC4 | Missing user | 400 |
| TC5 | Invalid user | 400 |
| TC6 | Valid thread | 200 |

### Activities

| ID | Scenario | Expected |
|----|--------|---------|
| TC7 | type=session | 200 |
| TC8 | missing type | 400 |
| TC9 | capacity=0 | 400 |

### Bookings

| ID | Scenario | Expected |
|----|--------|---------|
| TC10 | missing user | 400 |
| TC11 | cancel twice | 400 |

### Rotas

| ID | Scenario | Expected |
|----|--------|---------|
| TC12 | list rotas | 200 |
| TC13 | invalid user | 400 |

---

## 5. Conclusion

This test plan ensures validation of API correctness, robustness, and error handling using standard software testing techniques.
