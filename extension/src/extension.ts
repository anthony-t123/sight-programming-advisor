// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

var level: string | undefined, objective: string | undefined;

// Run the shell script for the current-prompt.txt
function runPrompt(){
	console.log('Executing prompt')
	const shell = require('shelljs')
	shell.config.execPath = process.cwd();
	shell.exec('bash ~/Desktop/llama.cpp/Testing/chat-test.sh', {async:true})
}

// Read the current prompt file
function readPrompt(){
	console.log('Reading output')
	return fs.readFileSync(process.cwd() + '/Desktop/llama.cpp/Testing/prompt_files/current-prompt.txt').toString()
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('SIGHT advisory is active');
	
	let write_function = vscode.commands.registerCommand('sight-programming-advisor.write', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor){
			const document = editor.document;
			const text = document.getText();
			console.log('Saving code to file');
			fs.appendFileSync(process.cwd() + '/Desktop/llama.cpp/Testing/prompt_files/current-prompt.txt', text);
			console.log('File written');

		}
	});

	context.subscriptions.push(write_function);

	let level_function = vscode.commands.registerCommand('sight-programming-advisor.determineLevel', () => {
		vscode.commands.executeCommand('sight-programming-advisor.write');
		const prompt = '\n Given the python code above, rank the programmer that wrote it as one of the following: beginner, intermediate, advanced.\n';
		console.log('Level prompt updating');
		fs.appendFileSync(process.cwd() + '/Desktop/llama.cpp/Testing/prompt_files/current-prompt.txt', prompt);
		console.log('Prompt updated');
		runPrompt();
	});

	context.subscriptions.push(level_function);

	let update_level = vscode.commands.registerCommand('sight-programming-advisor.updateLevel', () => {
		const currentPrompt = readPrompt();
		var lastOutputReg = new RegExp('.*(?<=ChatLLaMa:)(.*)(?=User:)','gs');
		lastOutputReg.lastIndex = 0
		var output = currentPrompt.matchAll(lastOutputReg);
		var lastOut
		for (const value of output) {
			lastOut = value[1]
		};

		if (lastOut){
			var skillLevelReg = new RegExp('beginner|intermediate|advanced','is');
			var skill = skillLevelReg.exec(lastOut);
			if (skill){
				let skillLevel = skill[0]
				console.log('Updating level to '+skillLevel);
				level = skillLevel
			}
		}
	});

	context.subscriptions.push(update_level);


	let objective_function = vscode.commands.registerCommand('sight-programming-advisor.determineObjective', () => {
		vscode.commands.executeCommand('sight-programming-advisor.write');
		const prompt = '\n What does the python code above do? \n'
		console.log('Objective prompt updating');
		fs.appendFileSync(process.cwd() + '/Desktop/llama.cpp/Testing/prompt_files/current-prompt.txt', prompt);
		console.log('Prompt updated');
		runPrompt();
	});

	context.subscriptions.push(objective_function);

	let update_objective = vscode.commands.registerCommand('sight-programming-advisor.updateObjective', () => {
		const currentPrompt = readPrompt();
		var lastOutputReg = new RegExp('.*(?<=ChatLLaMa:)(.*)(?=User:)','gs');
		var output = currentPrompt.matchAll(lastOutputReg)
		var lastOut
		for (const value of output) {
			lastOut = value[1]
		};
		console.log('Updating objective to '+ lastOut);
		objective = lastOut;
	});

	context.subscriptions.push(update_objective);

	let get_advice = vscode.commands.registerCommand('sight-programming-advisor.getAdvice', () => {
		vscode.commands.executeCommand('sight-programming-advisor.write');
		let prompt = '\n What improvements can be made in the above code? \n';
		if (level){
			console.log('Using skill')
			prompt = '\n Given the programmer is a ' + level + prompt
		};


		console.log('Getting advice');
		fs.appendFileSync(process.cwd() + '/Desktop/llama.cpp/Testing/prompt_files/current-prompt.txt', prompt);
		console.log('Prompt updated');
		runPrompt();
	});

	context.subscriptions.push(get_advice);

	let display_advice = vscode.commands.registerCommand('sight-programming-advisor.displayAdvice', () => {
		const currentPrompt = readPrompt();
		var lastOutputReg = new RegExp('.*(?<=ChatLLaMa:)(.*)(?=User:)','gs');
		var output = currentPrompt.matchAll(lastOutputReg);
		var lastOut;
		for (const value of output) {
			lastOut = value[1]
		};

		if (lastOut){
			console.log('Updating advice to '+ lastOut);

			let out = vscode.window.createOutputChannel('SIGHT advice');
			out.append(lastOut)
			out.show();


		};
	});

	context.subscriptions.push(display_advice);

	let reset_prompts = vscode.commands.registerCommand('sight-programming-advisor.resetPrompts', () => {
		console.log('Reseting prompt')
		const shell = require('shelljs')
		shell.config.execPath = process.cwd();
		shell.exec('cp -f ~/Desktop/llama.cpp/Testing/prompt_files/base-prompt.txt ~/Desktop/llama.cpp/Testing/prompt_files/current-prompt.txt', {async:true})
	});

	context.subscriptions.push(reset_prompts);
}

// This method is called when your extension is deactivated
export function deactivate() {}
