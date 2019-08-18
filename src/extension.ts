import * as vscode from 'vscode'
import { exec } from 'child_process'

export function activate(context: vscode.ExtensionContext) {
	const blame = vscode.commands.registerCommand('sublime-merge.blame', async () => {
		const activeEditor = vscode.window.activeTextEditor
		if (!activeEditor) {
			console.warn("no editor!")
			return
		}

		const uri = activeEditor.document.uri
		const folders = vscode.workspace.workspaceFolders
		// todo: some more reliable way to get the git base location for the active file
		const cwdFolder = folders && folders.find(f => uri.fsPath.startsWith(f.uri.fsPath))
		const currentCursor = activeEditor.selection.active

		await execSmerge(`blame "${uri.fsPath}" ${currentCursor.line}`, { cwd: cwdFolder && cwdFolder.uri })
	});

	context.subscriptions.push(blame);
}
 
function execSmerge(commandlet: string, options?: { cwd?: vscode.Uri }) {
	const commandLine = "smerge " + commandlet
	console.info("command: ", commandLine)
	console.info("cwd: ", options && options.cwd ? options.cwd.fsPath : "[not provided]")

	return new Promise((resolve, reject) => {
		const ls = exec(commandLine, { cwd: options && options.cwd && options.cwd.fsPath })
		
		ls.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
		});
		
		ls.stderr.on('data', (data) => {
			console.error(`stderr: ${data}`);
		});
		
		ls.on('close', (code) => {
			if (code) reject(new Error(`child process exited with code ${code}`))
			else resolve()
		});
	})
}

// this method is called when your extension is deactivated
export function deactivate() {}
