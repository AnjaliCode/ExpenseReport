# ExpenseReport
An expense report system with user authentication
Expense-report System with a JSON based HTTP API:

-	Creation of Account for employee and Admin both
-	Logging in to API is sending username and password and getting a unique kind of token.

Functionality:
-	Creating an expense
-	Updating an expense
-	Listing an expense
-	Retrieving an expense
-	Deleting an expense

Expenses contain following information:
-	The user who created expense
-	The time the expense was updated
-	The amount of the expense
-	A currency in which it was paid
-	A description of what money is spent on

Each employee can see, edit and delete his own expense but admin can see and edit any employee’s expense.

Instructions:

1.	There is a login partial on the landing page.
2.	There is a signup link, to sign either as an admin who has access to everybody’s expenses , or an individual user/employee.
3.	After logging in as one employee, employee can not access other employee’s edit page even if he knows the id eg: while using localhost, if we enter url http://localhost:8080/users/edit/5c967010f70f9facfaac71be
manually, it will be unauthorized access to the user. 
4.	Same thing happens if one user decides to delete other user’s expense.
5.	Mongodb needs to be installed on the system
6.	Name of the database: Expenses
7.	Collections to be created: users, expenses
8.	Please refer to mongoose schema for inputting data directly on mongo shell


