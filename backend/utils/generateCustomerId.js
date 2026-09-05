module.exports = function generateCustomerId() {
// generate a random 12-digit number as string
let num = '';
for (let i = 0; i < 12; i++) num += Math.floor(Math.random() * 10);
return num;
};