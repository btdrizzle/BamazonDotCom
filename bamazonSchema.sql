CREATE DATABASE bamazon;
USE bamazon;

CREATE TABLE products(
	item_id INTEGER(10) AUTO_INCREMENT NOT NULL PRIMARY KEY,
    product_name VARCHAR (50) NOT NULL,
    department_name VARCHAR (50) NOT NULL,
    price DECIMAL (10,2) NOT NULL,
    stock_quantity INTEGER (10) NOT NULL
);
INSERT INTO products (product_name,department_name,price,stock_quantity)
VALUES ("Holy Hand Grenade of Antioch","Sporting Goods",200,50),
("Drake's Bourbon","Food and Beverage",40,10),
("The Book of Right Answers","Books",20,100),
("Jump to Conclusions Mat","Sporting Goods",50,5),
("Hatch Chile Hot Sauce","Food and Beverage",6,150),
("Flex Seal","Home Improvement",20,1000),
("FIDO Dog Food","Pet Care",50,25),
("Pooper Scooper","Pet Care",15,50),
("Weird Toe Socks","Footwear",20,100),
("Chicken Feed","Pet Care",20,40),
("World's Best Crocs","Footwear",25,5000);