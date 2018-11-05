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

function newTransaction() {
    inquirer.prompt([
        {
            type: "confirm",
            message: "Would you like to buy another product?",
            name: "purchase"
        }
    ]).then(function(answer) {
        if(answer.purchase === true) {
            displayInventory();
        }else{
            console.log("Thank you, come again!");
            connection.end();
        }
    })
}
function itemPurchase() {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter product ID you'd like to purchase",
            name: "productId"
        },{
            type: "input",
            message: "How many would you like to purchase?",
            name: "productNum"
        }
    ]).then(function(answer) {
        const query = "SELECT * from products";
        let newQuantity;
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
                const query1 = `SELECT * from products WHERE item_id=${parseInt(answer.productId)}`;
                connection.query(query1, function(err,res) {
                    if(err) throw err;
                    let product = res[0].product_name;
                    let cost = res[0].price * parseInt(answer.productNum);
                    if(parseInt(answer.productNum) > res[0].stock_quantity) {
                        console.log("Quantity insufficient!  Please select another number and/or another product!");
                        displayInventory();
                    }else{
                        newQuantity = res[0].stock_quantity - parseInt(answer.productNum);
                        const query2 = `UPDATE products SET stock_quantity = ${newQuantity} WHERE item_id = ${parseInt(answer.productId)}`;
                        connection.query(query2, function(err,res) {
                            if(err) throw err;
                            console.log(`You purchased ${answer.productNum} ${product} for $${cost} dollars!`);
                            newTransaction();
                        });
                    };
                });
            };
        });    
    });
};
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
        itemPurchase();
    });
};
displayInventory();