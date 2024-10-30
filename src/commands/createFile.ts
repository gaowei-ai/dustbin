import * as vscode from "vscode";

import { FileExplorerProvider, FileNode } from "../treeViewDataProvider";
import path from "path";
import fs from "fs";

export function createFile(provider: FileExplorerProvider) {
	return vscode.commands.registerCommand(
		"dustbin.createFile",
		async (node: FileNode | undefined) => {
			let dirPath;
			if (node?.resourceUri) {
				dirPath = node?.resourceUri.fsPath;
				if (node.contextValue === "file") {
					dirPath = path.dirname(dirPath);
				}
			} else {
				dirPath = provider.getWorkspaceRoot();
			}
			const fileName = await vscode.window.showInputBox({ prompt: "输入新文件名" });
			if (fileName) {
				const filePath = path.normalize(path.join(dirPath!, fileName));
				if (fs.existsSync(filePath)) {
					vscode.window.showErrorMessage("文件已存在");
					return;
				}
				fs.writeFileSync(filePath, "");
				provider.refresh();
				// 打开文件
				await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(filePath));

				provider.revealItem(vscode.Uri.file(filePath));
			}
		}
	);
}
