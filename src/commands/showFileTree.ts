import * as vscode from "vscode";
import { LAST_FOLDER_KEY } from "../constants";
import { FileExplorerProvider } from "../treeViewDataProvider";

export function showFileTreeCommand(
	context: vscode.ExtensionContext,
	provider: FileExplorerProvider
) {
	return vscode.commands.registerCommand("dustbin.showFileTree", async () => {
		const rootPath = await vscode.window.showOpenDialog({
			canSelectFiles: false,
			canSelectFolders: true,
			canSelectMany: false,
			openLabel: "选择文件夹",
		});
		if (rootPath) {
			// 存储选择的文件夹路径
			context.globalState.update(LAST_FOLDER_KEY, rootPath[0].fsPath);
			provider = new FileExplorerProvider(rootPath[0].fsPath);
			const treeView = vscode.window.createTreeView("dustbin-local", {
				treeDataProvider: provider,
				showCollapseAll: true,
			});
			provider.treeView = treeView;
		}
	});
}
