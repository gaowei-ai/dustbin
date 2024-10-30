import * as vscode from "vscode";

import { FileExplorerProvider } from "../treeViewDataProvider";
import path from "path";
import fs from "fs";

export function createFolder(provider: FileExplorerProvider) {
	return vscode.commands.registerCommand("dustbin.createFolder", async (node) => {
		const dirPath = node ? node.resourceUri.fsPath : provider.getWorkspaceRoot();
		const fileName = await vscode.window.showInputBox({ prompt: "输入新文件夹名称" });
		if (fileName) {
			const filePath = path.normalize(path.join(dirPath!, fileName));
			if (fs.existsSync(filePath)) {
				vscode.window.showErrorMessage("文件夹已存在");
				return;
			}

			fs.mkdirSync(filePath); // 创建文件夹
			provider.refresh(); // 刷新列表
			provider.revealItem(vscode.Uri.file(filePath));
		}
	});
}
