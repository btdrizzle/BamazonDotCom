require('dotenv').config();
const inquirer = require('inquirer');
const mysql = require('mysql');
const Table = require('cli-table2');
const colors = require('colors');

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

connection.connect((err) => {
    if(err) throw(err);
    console.log(`Connected to Bamazon as customer ${connection.threadId}`.rainbow);
});
const table = new Table({
    head: ['ID'.bold.cyan,'Product Name'.bold.cyan,'Department'.bold.cyan,'Price($)'.bold.cyan,'Qty'.bold.cyan],
    colWidths: [5,30,20,10,10]
});
function displayInventory() {
    console.log("----------Products Available----------\n".bold.green);
    table.length = 0;
    const query = "SELECT * from products";
    connection.query(query,function(err,res) {
        if(err) throw err;
        for(let i = 0;i < res.length; i++) {
            table.push(Object.values(res[i]));
        }
        console.log(table.toString());
        newTransaction();
    });
};
function newTransaction() {
    inquirer.prompt([
        {
            type: "confirm",
            message: "Would you like to do something else?",
            name: "action"
        }
    ]).then(function(answer) {
        if(answer.action === true) {
            makeChoice();
        }else{
            console.log("Thank you, come again!");
            connection.end();
        }
    })
}
function makeChoice() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "choose",
            choices: ['View products for sale','View low inventory','Add to inventory','Add new product']
        }
    ]).then(function(answer) {
        switch(answer.choose) {
            case 'View products for sale': 
                displayInventory();
                break;
            case 'View low inventory':
                lowInventory();
                break;
            case 'Add to inventory':
                addInventory();
                break;
            case 'Add new product':
                addProduct();
        }
    })
};
function lowInventory() {
    console.log("\n----------Products With Low Inventory (less than 10 available)----------\n".bold.green);
    table.length = 0;
    const query = "SELECT * from products WHERE stock_quantity < 10";
    connection.query(query,function(err,res) {
        if(err) throw err;
        for(let i = 0;i < res.length; i++) {
            table.push(Object.values(res[i]));
        }
        console.log(table.toString());
        newTransaction();
    });
};
function addInventory() {
    inquirer.prompt([
        {
            type: "input",
            message: "Which product would you like to restock?",
            name: "productId"
        },{
            type: "input",
            message: "How many would you like to add to stock?",
            name: "productNum"
        }
    ]).then(function(answer) {
        const query = "SELECT * from products";
        connection.query(query, function(err,res) {
            if(err) throw err;
            const productArray = [];
            for(let i=0;i<res.length;i++) {
                productArray.push(res[i].item_id);
            };
            let includes = productArray.includes(parseInt(answer.productId));
            if(!includes) {
                console.log("We don't have that product, please select another.");
                displayInventory();
            }else{
                let currentNum;
                let newNum;
                let product;
                const query1 = `SELECT * from products WHERE item_id=${parseInt(answer.productId)}`;
                connection.query(query1, function(err,res) {
                    if(err) throw err;
                    product = res[0].product_name;
                    currentNum = res[0].stock_quantity;
                    newNum = currentNum + parseInt(answer.productNum);
                }).then(function() {
                    const query2 = `UPDATE products SET stock_quantity = ${newNum} WHERE item_id=${parseInt(answer.productId)}`;
                    connection.query(query2, function(err,res) {
                        if(err) throw err;
                        console.log(`${product} updated from ${currentNum} in stock to ${newNum}`);
                        newTransaction();
                    });
                }) 
            }
        })
    })                     
}
function addProduct () {
    inquirer.prompt([
        {
            type: "input",
            message: "What is the product name?",
            name: "name"
        },{
            type: "list",
            message: "Which department?",
            name: "department",
            choices: ['Books','Food and Beverage','Footwear','Home Improvement','Pet Care','Sporting Goods','Unnecessary Things','Crazy diets']
        },{
            type: "input",
            message: "What is the cost in dollars?",
            name: "price"
        },{
            type: "input",
            message: "How many are in stock?",
            name: "stock"
        }
    ]).then(function(answer) {
        query = `INSERT INTO products (product_name,department_name,price,stock_quantity) VALUES ('${answer.name}','${answer.department}',${parseInt(answer.price)},${parseInt(answer.stock)})`;
        connection.query(query, function(err,res) {
            if(err) throw err;
            console.log(`${answer.name}, qty: ${answer.stock} has been added!`.yellow);
            newTransaction();
        });
    })
}



makeChoice();