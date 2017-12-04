let fs = require('fs');

function readSalaryAvg(path) {
	let salary_avg = fs.readFileSync(path)
		.toString()
		.split('\n')[1]
		.trim();
	console.log('salary_avg: ', salary_avg);
	return salary_avg;
}

function readInsurance(path) {
	let insurance = {};
	let insurance_rows = [];
	fs.readFileSync(path)
		.toString()
		.split('\n')
		.forEach((line) => {insurance_rows.push(line.split(','))});
	for (let i = 1; i < insurance_rows.length; ++i){
		let type = insurance_rows[i][0];
		insurance[type] = {};
		for (let j = 1; j < insurance_rows[0].length; ++j){
			insurance[type][insurance_rows[0][j]] = parseFloat(insurance_rows[i][j]);
		}
	}
	console.log('insurance: ', insurance);
	return insurance;
}

function readTax(path) {
	let tax = {};
	let tax_rows = [];
	fs.readFileSync(path)
		.toString()
		.split('\n')
		.forEach((line) => {tax_rows.push(line.split(','))});
	for (let i = 0; i < tax_rows[0].length; ++i){
		tax[parseInt(tax_rows[0][i])] = parseFloat(tax_rows[1][i]);
	}
	console.log('tax: ', tax);
	return tax;
}

function readBonus(path) {
	let bonus = {};
	let bonus_rows = [];
	fs.readFileSync(path)
		.toString()
		.split('\n')
		.forEach((line) => {bonus_rows.push(line.split(','))});
	for (let i = 0; i < bonus_rows[0].length; ++i){
		bonus[bonus_rows[0][i]] = parseInt(bonus_rows[1][i]);
	}
	console.log('bonus: ', bonus);
	return bonus;
}

function readEmployee(path) {
	let employee = {};
	let employee_rows = [];
	fs.readFileSync(path)
		.toString()
		.split('\n')
		.forEach((line) => {employee_rows.push(line.split(','))});
	for (let i = 1; i < employee_rows.length; ++i){
		let name = employee_rows[i][0];
		employee[name] = {};
		for (let j = 1; j < employee_rows[0].length; ++j){
			employee[name][employee_rows[0][j]] = employee_rows[i][j];
		}
	}
	console.log('employee: ', employee);
	return employee;
}

class Employee{
	constructor(name, basic_pay, performance_score, provident_fund){
		this.name = name;
		this.basic_pay = basic_pay;
		this.performance_score = performance_score;
		this.provident_fund = provident_fund;
	}
	calculateInsurance(){
		
	}
	calculateTax(){

	}
}

function main() {
	let salary_avg = readSalaryAvg('./本市职工月平均工资.csv');
	let insurance = readInsurance('./五险费率.csv');
	let tax = readTax('./个税税率.csv');
	let bonus = readBonus('./绩效工资标准.csv');
	let employee = readEmployee('./员工名单.csv');
}

main();