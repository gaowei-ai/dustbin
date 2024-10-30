import * as vscode from "vscode";

import { FileExplorerProvider } from "../treeViewDataProvider";
import path from "path";
import fs from "fs";

export function renameFileOrFolder(provider: FileExplorerProvider) {
	return vscode.commands.registerCommand("dustbin.rename", async (node) => {
		const fsPath = node.resourceUri.fsPath;
		const oldName = path.basename(fsPath);
		const newName = await vscode.window.showInputBox({
			value: oldName,
			prompt: "请输入新文件名",
		});

		if (newName) {
			const newPath = path.join(path.dirname(fsPath), newName);
			fs.renameSync(fsPath, newPath);
			provider.refresh();
		}
	});
}
