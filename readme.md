&copy; 2015-2017 「燎原」｜ All Rights Reserved.

------------------

## 说明

Zhiyuan Zhao

### 简介

#### 设计思路
  本程序为基于node.js的命令行五险一金/工资计算器, 可批量生成员工的五险一金/工资条, 完全实现了下文所有要求.
  本程序核心为 Employee 类, 对每一员工的属性与操作进行了封装. Employee中提供了对五险一金/工资的计算/存储/打印的方法. 程序内还包括读取文件的各种方法. 
  注意写文件时为append模式, 将在已有文件末尾继续添加内容.
  
#### 示例
  - 读文件,写文件 
  ```node calculator.js -i ./员工名单.csv -s ./insurance.csv -c ./income.csv```
  - 读命令行,写命令行 
  ```node calculator.js```
  - 读命令行,写五险一金到命令行,写工资到文件 
  ```node calculator.js -c ./income.csv```
  
#### 用法

开始时安装yargs包 
```npm install```

用法
```sh
Usage: node calculator.js [options]

Options:
  --version        Show version number                                 [boolean]
  -i, --input      输入员工名单文件路径, 默认键盘读取   [string] [default: null]
  -s, --insurance  输出五险一金文件路径, 默认命令行打印 [string] [default: null]
  -c, --income     输出工资条文件路径, 默认命令行打印   [string] [default: null]
  -h, --help       Show help                                           [boolean]

Examples:
  node calculator.js -i ./员工名单.csv -s ./insurance.csv -c ./income.csv
```


#### 实现了如下功能
  1. 从提供的四份数据文件读取本市职工月平均工资、五险费率、个税税率、绩效工资标准。
    - 完成
  2. 从提供的员工名单文件读取员工姓名、岗位工资、绩效评分、住房公积金比例。
    - 完成
  3. 计算员工工资条上应显示的所有数值。
    - 完成
    
#### 满足了如下要求
  1. 员工岗位工资、绩效评分与住房公积金百分比可以从员工名单文件读取，也可以由键盘输入。
    - 完成, 可以通过```-i```指定"员工名单"输入方式, 默认命令行读取.
  2. 使用面向对象编程或函数式编程。
    - 完成.
  3. 可以输出至csv文件或展现在屏幕上。
    - 完成, 可以通过```-s```与```-c```分别指定"五险一金"与"工资条"输出方式, 默认命令行打印. 
  4. 程序应可扩展、可读。
    - 完成, 程序最大程度避免 hard coding, 同时所有配置可通过开头常量更改.
    
&copy; Zhiyuan Zhao

------------------

## 编程能力测试 

###问题
实现上海市某单位员工收入计算器。

###描述
根据相关法律，单位和员工需要依法缴纳五险一金。

假设使用上海市2014年数据：

| | 单位缴纳比例 | 个人缴纳比例 |
|
| 养老保险 | 21% | 8% |
| 医疗保险 | 11%  | 2% |
| 失业保险 | 1.5% | 0.5% |
| 生育保险 | 1%   | 不承担缴费 |
| 工伤保险 | 0.5% | 不承担缴费 |

根据上海市人力资源和社会保障局公布的消息显示，2014年4月1日～2015年3月31日的社保缴费基数为最高15108元（去年本市职工月均工资的3倍）、最低3022元（去年本市职工月均工资的60%）。
也就是说，假设某员工工资超过15108元，单位与个人缴纳社保的费用以15108而不是实际工资作为基数。低于3022元的同理。住房公积金缴费比例由单位自行确定，单位与个人缴纳相同额度。

某单位员工税前工资分为岗位工资和绩效工资两部分，五险一金只按岗位工资计算。

个税在扣除五险一金后计算，应纳税收入为个人税前收入超过3500元的部分。个税计算规则如下：

|应纳税收入|税率|
|
| 不超过1500元的 | 3% |
| 超过1500元至4500元的部分| 10% |
| 超过4500元至9000元的部分 | 20% |
| 超过9000元至35000元的部分 | 25% |
| 超过35000元至55000元的部分 | 30% |
| 超过55000元至80000元的部分 | 35% |
| 超过80000元的部分 | 45% |

该单位绩效工资标准如下：

| 绩效评分 | 绩效工资 |
|
| A | 4000 |
| B | 2000 |
| C |  100 |
| D |    0 |

该单位住房公积金缴纳比例为 0%～8%，由单位和员工本人协商确定。

#####示例
使用如上五险一金表格、个税表格、绩效表格，假设员工小明岗位工资为 27000，绩效评分为 A，住房公积金缴纳比例为 7%，则小明的工资条应当由两部分组成。

其一为五险一金详情（因为小明的工资超出了去年本市职工月均工资的3倍，五险一金计算以上限为基数）：

|  | 小明 | 单位
|
| 养老 | 1208.64 | 3172.68
| 医疗 | 302.16 | 1661.88
| 失业 | 75.54 | 226.62
| 生育 | 0.00 | 151.08
| 工伤 | 0.00 | 75.54
| 住房 | 1057.56 | 1057.56
| 总计 | 2643.90 | 6345.36

其二为收入详情：

| 姓名 | 岗位工资 | 绩效工资 | 五险一金（个人）|五险一金（单位）|税前收入|扣税|税后收入
|
|小明|27000|4000|2643.90|6345.36|28356.10|5209.02|23147.08

###要求：
1. 设计并使用JavaScript实现一个如上描述的收入计算器。
2. 实现如下功能
    1. 从提供的四份数据文件读取本市职工月平均工资、五险费率、个税税率、绩效工资标准。
    2. 从提供的员工名单文件读取员工姓名、岗位工资、绩效评分、住房公积金比例。
    3. 计算员工工资条上应显示的所有数值。
3. 满足如下要求
    1. 员工岗位工资、绩效评分与住房公积金百分比可以从员工名单文件读取，也可以由键盘输入。
    2. 使用面向对象编程或函数式编程。
    3. 可以输出至csv文件或展现在屏幕上。
    4. 程序应可扩展、可读。

### 提交：
1. 关于设计思路的简单描述。
2. 将代码放到GitHub上，提交Repository网址。
3. 关于如何运行、测试的描述。
