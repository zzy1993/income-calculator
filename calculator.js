let fs = require('fs');
let yargs = require('yargs');
const SALARY_AVG_PATH = './本市职工月平均工资.csv';
const INSURANCE_RATE_PATH = './五险费率.csv';
const TAX_RATE_PATH = './个税税率.csv';
const BONUS_RATE_PATH = './绩效工资标准.csv';
const LOWER_BOUND_RATIO = 0.6;
const UPPER_BOUND_RATIO = 3.0;
const TAX_FREE_PAY = 3500;

function readSalaryAvg(path) {
	let salary_avg = fs.readFileSync(path)
		.toString()
		.split('\n')[1]
		.trim();
	return salary_avg;
}

function readInsuranceRates(path) {
	let map = {};
	let array = [];
	fs.readFileSync(path)
		.toString()
		.split('\n')
		.forEach((line) => {array.push(line.split(','))});
	for (let i = 1; i < array.length; ++i){
		let type = array[i][0];
		map[type] = {};
		for (let j = 1; j < array[0].length; ++j){
			map[type][array[0][j]] = parseFloat(array[i][j]);
		}
	}
	return map;
}

function readTaxRates(path) {
	let map = {};
	let array = [];
	fs.readFileSync(path)
		.toString()
		.split('\n')
		.forEach((line) => {array.push(line.split(','))});
	for (let i = 0; i < array[0].length; ++i){
		map[parseInt(array[0][i])] = parseFloat(array[1][i]);
	}
	return map;
}

function readBonusLevels(path) {
	let map = {};
	let array = [];
	fs.readFileSync(path)
		.toString()
		.split('\n')
		.forEach((line) => {array.push(line.split(','))});
	for (let i = 0; i < array[0].length; ++i){
		map[array[0][i]] = parseInt(array[1][i]);
	}
	return map;
}

function readEmployees(employees, path) {
	let array = fs.readFileSync(path)
		.toString()
		.split('\n')
		.map((line) => {return line.split(',')});
	for (let i = 1; i < array.length; ++i){
		let name = array[i][0];
		let basic_pay = parseInt(array[i][1]);
		let performance_score = array[i][2];
		let accumulate_ratio = parseFloat(array[i][3]);
		employees.push(new Employee(name, basic_pay, performance_score, accumulate_ratio));
	}
}

function typeEmployees(employees){
	console.log('编辑员工名单中,使用\',\'分隔每项,输入ctrl-D结束编辑');
	console.log('姓名,基本工资,绩效评分,公积金');
	let array = fs.readFileSync('/dev/stdin')
		.toString()
		.split('\n')
		.map((line) => {return line.split(',')});
	for (let row of array){
		if(row.length < 4) continue;
		let name = row[0];
		let basic_pay = parseInt(row[1]);
		let performance_score = row[2];
		let accumulate_ratio = parseFloat(row[3]);
		employees.push(new Employee(name, basic_pay, performance_score, accumulate_ratio));
	}
}

class Employee{
	constructor(name, basic_pay, performance_score, accumulate_ratio){
		this.name = name;
		this.basic_pay = basic_pay;
		this.performance_score = performance_score;
		this.accumulate_ratio = accumulate_ratio;
	}

	getTotalPay(map_bonus){
		return this.basic_pay + map_bonus[this.performance_score];
	}

	getBase(map_bonus, salary_avg){
		let lower_bound = salary_avg * LOWER_BOUND_RATIO;
		let upper_bound = salary_avg * UPPER_BOUND_RATIO;
		let total_pay = this.getTotalPay(map_bonus);
		return total_pay < lower_bound? lower_bound: (total_pay > upper_bound? upper_bound: total_pay);
	}

	getInsurance(map_bonus, salary_avg, map_insurance){
		let result = [];
		let base = this.getBase(map_bonus, salary_avg);
		result.push(['', this.name, '单位']);

		let keys_type = ['个人', '公司'];
		let keys_insurance = Object.keys(map_insurance[keys_type[0]]);
		let sum = {};
		for (let key_type of keys_type){
			sum[key_type] = 0.0;
		}
		for(let key_insurance of keys_insurance){
			let subarray = [key_insurance];
			for(let key_type of keys_type){
				let ratio = map_insurance[key_type][key_insurance];
				subarray.push((base * ratio).toFixed(2));
				sum[key_type] += base * ratio;
			}
			result.push(subarray);
		}

		let subarray = ['住房'];
		let accumulation_func = base * this.accumulate_ratio;
		subarray.push(accumulation_func.toFixed(2));
		subarray.push(accumulation_func.toFixed(2));
		result.push(subarray);
		for(let key_type of keys_type) {
			sum[key_type] += accumulation_func;
		}

		subarray = ['总计'];
		for (let key_type of keys_type){
			subarray.push(sum[key_type].toFixed(2));
		}
		result.push(subarray);
		return result;
	}

	printInsurance(map_bonus, salary_avg, map_insurance){
		let array = this.getInsurance(map_bonus, salary_avg, map_insurance);
		console.log('--------');
		console.log(`五险一金详情 - ${this.name}`);
		for (let row of array){
			console.log('| ' + row.join(' | '));
		}
		console.log('--------');
	}

	saveInsurance(map_bonus, salary_avg, map_insurance, path){
		let array = this.getInsurance(map_bonus, salary_avg, map_insurance);
		let data = array.map((row)=> row.join(',')).join('\n') + '\n';
		fs.appendFileSync(path, data);
	}

	getTax(map_bonus, salary_avg, map_insurance, map_tax){
		let array_insurance= this.getInsurance(map_bonus, salary_avg, map_insurance);
		let total_pay = this.getTotalPay(map_bonus);
		let base = total_pay - parseFloat(array_insurance[array_insurance.length-1][1]) - TAX_FREE_PAY;
		let tax = 0;
		let keys_tax = Object.keys(map_tax).map(x=>parseInt(x)).sort((x, y)=> x < y);
		for(let key_tax of keys_tax){
			tax += Math.max(base - key_tax, 0) * map_tax[key_tax];
			base = Math.min(base, key_tax);
		}
		return tax;
	}

	getIncome(map_bonus, salary_avg, map_insurance, map_tax){
		let array_insurance= this.getInsurance(map_bonus, salary_avg, map_insurance);
		let total_pay = this.getTotalPay(map_bonus);
		let result = [];
		result.push(['姓名', '岗位工资', '绩效工资', '五险一金（个人）', '五险一金（单位）', '税前收入', '扣税', '税后收入']);
		let insurance_employee = array_insurance[array_insurance.length-1][1];
		let insurance_employer = array_insurance[array_insurance.length-1][2];
		let pre_tax_pay = (total_pay - insurance_employee).toFixed(2);
		let tax = this.getTax(map_bonus, salary_avg, map_insurance, map_tax).toFixed(2);
		let post_tax_pay = (pre_tax_pay - tax).toFixed(2);
		result.push([this.name, this.basic_pay.toString(), map_bonus[this.performance_score].toString(), insurance_employee, insurance_employer, pre_tax_pay, tax, post_tax_pay]);
		return result;
	}

	printIncome(map_bonus, salary_avg, map_insurance, map_tax){
		let array = this.getIncome(map_bonus, salary_avg, map_insurance, map_tax);
		console.log('--------');
		console.log(`收入详情 - ${this.name}`);
		for (let row of array){
			console.log('| ' + row.join(' | '));
		}
		console.log('--------');
	}

	saveIncome(map_bonus, salary_avg, map_insurance, map_tax, path){
		let array = this.getIncome(map_bonus, salary_avg, map_insurance, map_tax);
		let data = array.map((row)=> row.join(',')).join('\n') + '\n';
		fs.appendFileSync(path, data);
	}
}

function main() {
	var argv = yargs.option('i', {
		alias: 'input',
		demand: false,
		default: null,
		describe: '输入员工名单文件路径, 默认命令行读取',
		type: 'string'
	}).option('s', {
		alias: 'insurance',
		demand: false,
		default: null,
		describe: '输出五险一金文件路径, 默认命令行打印',
		type: 'string'
	}).option('c', {
		alias: 'income',
		demand: false,
		default: null,
		describe: '输出工资条文件路径, 默认命令行打印',
		type: 'string'
	}).usage('Usage: node calculator.js [options]')
		.example('node calculator.js -i ./员工名单.csv -s ./insurance.csv -c ./income.csv')
		.help('h')
		.alias('h', 'help')
		.argv;

	let salary_avg = readSalaryAvg(SALARY_AVG_PATH);
	let map_insurance = readInsuranceRates(INSURANCE_RATE_PATH);
	let map_tax = readTaxRates(TAX_RATE_PATH);
	let map_bonus = readBonusLevels(BONUS_RATE_PATH);

	let employees = [];
	if(argv.input === null){
		typeEmployees(employees);
	}else{
		readEmployees(employees, argv.input);
	}

	if(argv.insurance === null){
		for (let employee of employees) {
			employee.printInsurance(map_bonus, salary_avg, map_insurance);
		}
	}else{
		for (let employee of employees) {
			employee.saveInsurance(map_bonus, salary_avg, map_insurance, argv.insurance);
		}
	}

	if(argv.income === null){
		for (let employee of employees){
			employee.printIncome(map_bonus, salary_avg, map_insurance, map_tax);
		}
	}else{
		for (let employee of employees){
			employee.saveIncome(map_bonus, salary_avg, map_insurance, map_tax, argv.income);
		}
	}

}

main();