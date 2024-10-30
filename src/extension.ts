import * as vscode from "vscode";
import { FileExplorerProvider } from "./treeViewDataProvider";
import { LAST_FOLDER_KEY } from "./constants";
import { showFileTreeCommand } from "./commands/showFileTree";
import { createFile } from "./commands/createFile";
import { createFolder } from "./commands/createFolder";
import { deleteFileOrFolder } from "./commands/delete";
import { renameFileOrFolder } from "./commands/rename";
import { refesh } from "./commands/refesh";

let provider: FileExplorerProvider;
export function activate(context: vscode.ExtensionContext) {
	// 获取上次选择的文件夹路径
	const previousFolderPath = context.globalState.get<string>(LAST_FOLDER_KEY);
	// 如果存在上次选择的文件夹路径，直接加载文件树
	if (previousFolderPath) {
		provider = new FileExplorerProvider(previousFolderPath);
		const treeView = vscode.window.createTreeView("dustbin-local", {
			treeDataProvider: provider,
			showCollapseAll: true,
		});
		provider.treeView = treeView;
	}
	context.subscriptions.push(
		showFileTreeCommand(context, provider),
		createFile(provider),
		createFolder(provider),
		deleteFileOrFolder(provider),
		renameFileOrFolder(provider),
		refesh(provider)
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
